import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe/server';
import { calculateTax } from '@/lib/tax';
import { checkoutLimiter, rateLimitResponse } from '@/lib/rate-limit';
import type { CheckoutFormData } from '@/types/checkout';
import type { CartItem } from '@/contexts/cart-context';
import type { Order, OrderItem } from '@/types/database';

interface CheckoutRequestBody extends CheckoutFormData {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discountCodeId?: string | null;
  discountAmount?: number;
}

export async function POST(request: NextRequest) {
  // Rate limiting: 10 checkout attempts per minute per IP
  const rateLimitResult = await checkoutLimiter.check(request, 10, 'CHECKOUT');
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult);
  }

  try {
    const body: CheckoutRequestBody = await request.json();
    const {
      items,
      subtotal,
      deliveryFee,
      discountCodeId,
      discountAmount = 0,
      email,
      fullName,
      phone,
      fulfillmentType,
      deliveryAddress,
      deliveryInstructions,
      deliveryDate,
      deliveryWindow,
    } = body;

    // Validate cart has items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!email || !fullName || !phone || !deliveryDate || !deliveryWindow) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate delivery address if delivery is selected
    if (fulfillmentType === 'delivery') {
      if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city ||
        !deliveryAddress.state || !deliveryAddress.zip) {
        return NextResponse.json(
          { error: 'Delivery address is required' },
          { status: 400 }
        );
      }
    }

    const supabase = await createClient();

    // Get authenticated user (optional - guest checkout allowed)
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Verify products exist, are available, fetch prices, inventory, lead time, and max_per_order
    const variantIds = items.map(item => item.variantId);
    const { data: variantsData, error: variantsError } = await (supabase
      .from('product_variants') as ReturnType<typeof supabase.from>)
      .select(`
        id,
        product_id,
        price_adjustment,
        is_available,
        inventory_count,
        track_inventory,
        products!inner(base_price, is_available, lead_time_hours, max_per_order, name)
      `)
      .in('id', variantIds);

    if (variantsError) {
      Sentry.captureException(variantsError, {
        tags: { api: 'checkout', step: 'fetch_variants' },
        extra: { variantIds },
      });
      return NextResponse.json(
        { error: 'Failed to validate cart items' },
        { status: 500 }
      );
    }

    const variants = variantsData as Array<{
      id: string;
      product_id: string;
      price_adjustment: number;
      is_available: boolean;
      inventory_count: number | null;
      track_inventory: boolean;
      products: {
        base_price: number;
        is_available: boolean;
        lead_time_hours: number;
        max_per_order: number | null;
        name: string;
      };
    }> | null;

    // Validate all items
    const unavailableItems: string[] = [];
    const priceMismatchItems: string[] = [];
    const insufficientStockItems: string[] = [];
    const leadTimeViolations: string[] = [];
    const maxPerOrderViolations: string[] = [];
    let serverCalculatedSubtotal = 0;

    // Calculate hours until delivery
    const deliveryDateTime = new Date(`${deliveryDate}T${deliveryWindow.split(' - ')[0]}:00`);
    const now = new Date();
    const hoursUntilDelivery = (deliveryDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    items.forEach(item => {
      const variant = variants?.find(v => v.id === item.variantId);
      if (!variant) {
        unavailableItems.push(item.productName);
        return;
      }
      if (!variant.is_available || !variant.products.is_available) {
        unavailableItems.push(item.productName);
        return;
      }

      // INVENTORY VALIDATION: Check stock if tracking is enabled
      if (variant.track_inventory && variant.inventory_count !== null) {
        if (variant.inventory_count < item.quantity) {
          insufficientStockItems.push(
            `${item.productName} (only ${variant.inventory_count} available)`
          );
        }
      }

      // LEAD TIME VALIDATION: Check if there's enough time for preparation
      const requiredLeadTime = variant.products.lead_time_hours || 0;
      if (hoursUntilDelivery < requiredLeadTime) {
        leadTimeViolations.push(
          `${item.productName} requires ${requiredLeadTime}h notice`
        );
      }

      // MAX PER ORDER VALIDATION: Check quantity limits
      const maxPerOrder = variant.products.max_per_order;
      if (maxPerOrder !== null && item.quantity > maxPerOrder) {
        maxPerOrderViolations.push(
          `${item.productName} (max ${maxPerOrder} per order)`
        );
      }

      // PRICE VERIFICATION: Calculate price server-side from database
      const serverSidePrice = variant.products.base_price + variant.price_adjustment;
      const clientSentPrice = item.unitPrice;

      // Allow 1 cent tolerance for floating point rounding
      if (Math.abs(serverSidePrice - clientSentPrice) > 0.01) {
        console.warn(
          `Price mismatch for ${item.productName}: client sent $${clientSentPrice}, server calculated $${serverSidePrice}`
        );
        priceMismatchItems.push(item.productName);
      }

      // Use server-calculated price regardless of client input
      serverCalculatedSubtotal += serverSidePrice * item.quantity;
    });

    if (unavailableItems.length > 0) {
      return NextResponse.json(
        { error: `The following items are no longer available: ${unavailableItems.join(', ')}` },
        { status: 400 }
      );
    }

    if (insufficientStockItems.length > 0) {
      return NextResponse.json(
        { error: `Insufficient stock: ${insufficientStockItems.join(', ')}` },
        { status: 400 }
      );
    }

    if (leadTimeViolations.length > 0) {
      return NextResponse.json(
        { error: `Not enough preparation time: ${leadTimeViolations.join(', ')}. Please select a later delivery time.` },
        { status: 400 }
      );
    }

    if (maxPerOrderViolations.length > 0) {
      return NextResponse.json(
        { error: `Quantity limit exceeded: ${maxPerOrderViolations.join(', ')}` },
        { status: 400 }
      );
    }

    if (priceMismatchItems.length > 0) {
      return NextResponse.json(
        {
          error: `Price verification failed. Please refresh your cart and try again.`,
          details: `Mismatched items: ${priceMismatchItems.join(', ')}`
        },
        { status: 400 }
      );
    }

    // SECURITY: Use server-calculated subtotal, NOT client-sent value
    const verifiedSubtotal = serverCalculatedSubtotal;

    // Determine delivery zone from ZIP code
    let deliveryZoneId: string | null = null;
    if (fulfillmentType === 'delivery' && deliveryAddress) {
      const { data: zoneData } = await (supabase
        .from('delivery_zones') as ReturnType<typeof supabase.from>)
        .select('id')
        .contains('zip_codes', [deliveryAddress.zip])
        .eq('is_active', true)
        .single() as { data: { id: string } | null };

      if (zoneData) {
        deliveryZoneId = zoneData.id;
      }
    }

    // Calculate tax using configurable rate from business_settings
    const taxAmount = await calculateTax(verifiedSubtotal, deliveryZoneId);
    const total = verifiedSubtotal + deliveryFee + taxAmount - discountAmount;

    // Resolve time_slot_id based on deliveryDate and deliveryWindow
    let timeSlotId: string | null = null;
    if (deliveryDate && deliveryWindow) {
      const windowStart = deliveryWindow.split(' - ')[0];

      const { data: slotData, error: slotError } = await (supabase
        .from('time_slots') as ReturnType<typeof supabase.from>)
        .select('id, current_orders, max_orders')
        .eq('date', deliveryDate)
        .eq('window_start', windowStart)
        .eq('is_available', true)
        .single() as { data: { id: string; current_orders: number; max_orders: number } | null; error: unknown };

      if (slotData) {
        if (slotData.current_orders >= slotData.max_orders) {
          return NextResponse.json(
            { error: 'Selected time slot is full. Please choose another time.' },
            { status: 400 }
          );
        }
        timeSlotId = slotData.id;
      } else if (slotError) {
        Sentry.captureMessage('Time slot not found', {
          level: 'warning',
          tags: { api: 'checkout', step: 'time_slot' },
          extra: { deliveryDate, windowStart },
        });
      }
    }

    // Format delivery address for database
    const deliveryAddressJson = deliveryAddress ? {
      street: deliveryAddress.street,
      apt: deliveryAddress.apt || null,
      city: deliveryAddress.city,
      state: deliveryAddress.state,
      zip: deliveryAddress.zip,
    } : null;

    // Create order in database with SERVER-VERIFIED prices
    type OrderInsert = Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>;
    const orderInsert: OrderInsert & { discount_code_id?: string | null } = {
      user_id: userId,
      guest_email: userId ? null : email,
      guest_phone: userId ? null : phone,
      status: 'received',
      fulfillment_type: fulfillmentType,
      delivery_date: deliveryDate,
      delivery_window: deliveryWindow,
      time_slot_id: timeSlotId,
      delivery_zone_id: deliveryZoneId,
      delivery_address: deliveryAddressJson,
      pickup_location: fulfillmentType === 'pickup' ? 'Main Bakery' : null,
      subtotal: verifiedSubtotal,
      delivery_fee: deliveryFee,
      discount_amount: discountAmount,
      discount_code_id: discountCodeId || null,
      tax_amount: taxAmount,
      tip_amount: 0,
      total,
      stripe_payment_intent_id: null,
      stripe_charge_id: null,
      stripe_checkout_session_id: null,
      payment_status: 'pending',
      notes: deliveryInstructions || null,
      internal_notes: null,
      confirmed_at: null,
      completed_at: null,
    };

    const { data: order, error: orderError } = await (supabase
      .from('orders') as ReturnType<typeof supabase.from>)
      .insert(orderInsert as never)
      .select()
      .single() as { data: Order | null; error: unknown };

    if (orderError || !order) {
      Sentry.captureException(orderError, {
        tags: { api: 'checkout', step: 'create_order' },
        extra: { orderInsert },
      });
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order items with SERVER-VERIFIED prices
    type OrderItemInsert = Omit<OrderItem, 'id' | 'created_at'>;
    const orderItems: OrderItemInsert[] = items.map(item => {
      const variant = variants?.find(v => v.id === item.variantId);
      if (!variant) {
        throw new Error(`Variant ${item.variantId} not found during order item creation`);
      }
      const serverSidePrice = variant.products.base_price + variant.price_adjustment;

      return {
        order_id: order.id,
        product_id: item.productId,
        product_variant_id: item.variantId,
        product_name: item.productName,
        variant_name: item.variantName,
        quantity: item.quantity,
        unit_price: serverSidePrice,
        total_price: serverSidePrice * item.quantity,
        special_instructions: null,
      };
    });

    const { error: itemsError } = await (supabase
      .from('order_items') as ReturnType<typeof supabase.from>)
      .insert(orderItems as never);

    if (itemsError) {
      Sentry.captureException(itemsError, {
        tags: { api: 'checkout', step: 'create_order_items' },
        extra: { orderId: order.id, itemCount: orderItems.length },
      });
      // Rollback order creation
      await (supabase.from('orders') as ReturnType<typeof supabase.from>).delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // Reserve the time slot if one was assigned
    if (timeSlotId) {
      const { error: reserveError } = await (supabase as any).rpc('increment_slot_orders', {
        slot_id: timeSlotId,
      });

      if (reserveError) {
        Sentry.captureException(reserveError, {
          tags: { api: 'checkout', step: 'reserve_slot' },
          extra: { orderId: order.id, timeSlotId },
        });
        // Rollback: delete order items and order
        await (supabase.from('order_items') as ReturnType<typeof supabase.from>).delete().eq('order_id', order.id);
        await (supabase.from('orders') as ReturnType<typeof supabase.from>).delete().eq('id', order.id);
        return NextResponse.json(
          { error: 'Failed to reserve time slot. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Save delivery address for authenticated users (non-blocking)
    if (userId && fulfillmentType === 'delivery' && deliveryAddress) {
      try {
        const { data: existingAddress } = await (supabase
          .from('customer_addresses') as ReturnType<typeof supabase.from>)
          .select('id')
          .eq('user_id', userId)
          .eq('street', deliveryAddress.street)
          .eq('city', deliveryAddress.city)
          .eq('state', deliveryAddress.state)
          .eq('zip', deliveryAddress.zip)
          .maybeSingle();

        if (!existingAddress) {
          const { data: userAddresses } = await (supabase
            .from('customer_addresses') as ReturnType<typeof supabase.from>)
            .select('id')
            .eq('user_id', userId);

          const isFirstAddress = !userAddresses || (userAddresses as unknown[]).length === 0;

          await (supabase
            .from('customer_addresses') as ReturnType<typeof supabase.from>)
            .insert({
              user_id: userId,
              label: 'Recent Order',
              street: deliveryAddress.street,
              apt: deliveryAddress.apt || null,
              city: deliveryAddress.city,
              state: deliveryAddress.state,
              zip: deliveryAddress.zip,
              delivery_instructions: deliveryInstructions || null,
              is_default: isFirstAddress,
            });
        }
      } catch (addressError) {
        // Non-blocking - just log to Sentry
        Sentry.captureException(addressError, {
          level: 'warning',
          tags: { api: 'checkout', step: 'save_address' },
          extra: { userId },
        });
      }
    }

    // Create Stripe checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000';

    const getAbsoluteImageUrl = (imageUrl: string | undefined): string | undefined => {
      if (!imageUrl) return undefined;
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }
      return `${appUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    };

    const lineItems = items.map(item => {
      const variant = variants?.find(v => v.id === item.variantId);
      if (!variant) {
        throw new Error(`Variant ${item.variantId} not found during Stripe session creation`);
      }
      const serverSidePrice = variant.products.base_price + variant.price_adjustment;
      const absoluteImageUrl = getAbsoluteImageUrl(item.imageUrl);

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.productName} - ${item.variantName}`,
            description: item.productName,
            ...(absoluteImageUrl && { images: [absoluteImageUrl] }),
          },
          unit_amount: Math.round(serverSidePrice * 100),
        },
        quantity: item.quantity,
      };
    });

    // Add delivery fee as line item if applicable
    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Delivery Fee',
            description: `Delivery to ${deliveryAddress?.city}, ${deliveryAddress?.state}`,
          },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    // Add tax as line item
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Sales Tax',
          description: 'Sales tax',
        },
        unit_amount: Math.round(taxAmount * 100),
      },
      quantity: 1,
    });

    let session;
    try {
      session = await createCheckoutSession({
        orderId: order.id,
        lineItems,
        customerEmail: email,
        successUrl: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
        cancelUrl: `${appUrl}/checkout?cancelled=true`,
      });
    } catch (stripeError) {
      Sentry.captureException(stripeError, {
        tags: { api: 'checkout', step: 'stripe_session' },
        extra: { orderId: order.id, email },
      });
      // Rollback: release time slot, delete order items and order
      if (timeSlotId) {
        await (supabase as any).rpc('decrement_slot_orders', { slot_id: timeSlotId });
      }
      await (supabase.from('order_items') as ReturnType<typeof supabase.from>).delete().eq('order_id', order.id);
      await (supabase.from('orders') as ReturnType<typeof supabase.from>).delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to create payment session. Please try again.' },
        { status: 500 }
      );
    }

    // Update order with Stripe session ID
    await (supabase
      .from('orders') as ReturnType<typeof supabase.from>)
      .update({ stripe_checkout_session_id: session.id } as never)
      .eq('id', order.id);

    // Return checkout session URL
    return NextResponse.json({
      sessionUrl: session.url,
      orderId: order.id,
      orderNumber: order.order_number,
    });

  } catch (error) {
    Sentry.captureException(error, {
      tags: { api: 'checkout', step: 'unhandled' },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
