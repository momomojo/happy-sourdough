import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe/server';
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

    // Verify products exist and are available
    const variantIds = items.map(item => item.variantId);
    const { data: variantsData, error: variantsError } = await (supabase
      .from('product_variants') as ReturnType<typeof supabase.from>)
      .select('id, product_id, price_adjustment, is_available')
      .in('id', variantIds);

    if (variantsError) {
      console.error('Error fetching variants:', variantsError);
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
    }> | null;

    // Validate all items are available
    const unavailableItems: string[] = [];

    items.forEach(item => {
      const variant = variants?.find(v => v.id === item.variantId);
      if (!variant) {
        unavailableItems.push(item.productName);
        return;
      }
      if (!variant.is_available) {
        unavailableItems.push(item.productName);
        return;
      }
    });

    if (unavailableItems.length > 0) {
      return NextResponse.json(
        { error: `The following items are no longer available: ${unavailableItems.join(', ')}` },
        { status: 400 }
      );
    }

    // Calculate totals
    const TAX_RATE = 0.08; // TODO: Make configurable
    const taxAmount = subtotal * TAX_RATE;
    const total = subtotal + deliveryFee + taxAmount - discountAmount;

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

    // Resolve time_slot_id based on deliveryDate and deliveryWindow
    // Format: "10:00:00" from "10:00 - 12:00"
    let timeSlotId: string | null = null;
    if (deliveryDate && deliveryWindow) {
      // Parse window start from string "10:00 - 12:00" -> "10:00"
      const windowStart = deliveryWindow.split(' - ')[0]; // Basic parsing approach

      // We need to format it as HH:mm:ss for postgres time comparison if needed, 
      // but the seed data shows '10:00' format. 
      // Let's try to match both date and window_start.

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
      } else {
        // Optional: Handle case where slot doesn't exist (maybe created on fly or error)
        console.warn(`Time slot not found for ${deliveryDate} ${windowStart}`);
        // We won't block the order for this in MVP, but ideally we should validation.
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

    // Create order in database
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
      subtotal,
      delivery_fee: deliveryFee,
      discount_amount: discountAmount,
      discount_code_id: discountCodeId || null,
      tax_amount: taxAmount,
      tip_amount: 0,
      total,
      stripe_payment_intent_id: null,
      stripe_charge_id: null,
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
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order items with correct field names
    type OrderItemInsert = Omit<OrderItem, 'id' | 'created_at'>;
    const orderItems: OrderItemInsert[] = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      product_variant_id: item.variantId,
      product_name: item.productName,
      variant_name: item.variantName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
      special_instructions: null,
    }));

    const { error: itemsError } = await (supabase
      .from('order_items') as ReturnType<typeof supabase.from>)
      .insert(orderItems as never);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Rollback order creation
      await (supabase.from('orders') as ReturnType<typeof supabase.from>).delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // Reserve the time slot if one was assigned
    if (timeSlotId) {
      // Note: `as any` cast is required for Supabase SSR client RPC type inference
      const { error: reserveError } = await (supabase as any).rpc('increment_slot_orders', {
        slot_id: timeSlotId,
      });

      if (reserveError) {
        console.error('Error reserving time slot:', reserveError);
        // Rollback: delete order items and order
        await (supabase.from('order_items') as ReturnType<typeof supabase.from>).delete().eq('order_id', order.id);
        await (supabase.from('orders') as ReturnType<typeof supabase.from>).delete().eq('id', order.id);
        return NextResponse.json(
          { error: 'Failed to reserve time slot. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Save delivery address for authenticated users
    if (userId && fulfillmentType === 'delivery' && deliveryAddress) {
      // Check if this exact address already exists
      const { data: existingAddress } = await (supabase
        .from('customer_addresses') as ReturnType<typeof supabase.from>)
        .select('id')
        .eq('user_id', userId)
        .eq('street', deliveryAddress.street)
        .eq('city', deliveryAddress.city)
        .eq('state', deliveryAddress.state)
        .eq('zip', deliveryAddress.zip)
        .maybeSingle();

      // Only save if address doesn't already exist
      if (!existingAddress) {
        // Check if user has any addresses to determine if this should be default
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
        // Ignore errors - address saving is optional
      }
    }

    // Create Stripe checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000';

    // Helper to ensure image URL is absolute
    const getAbsoluteImageUrl = (imageUrl: string | undefined): string | undefined => {
      if (!imageUrl) return undefined;
      // If already absolute, return as-is
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }
      // Convert relative URL to absolute
      return `${appUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    };

    const lineItems = items.map(item => {
      const absoluteImageUrl = getAbsoluteImageUrl(item.imageUrl);
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.productName} - ${item.variantName}`,
            description: item.productName,
            ...(absoluteImageUrl && { images: [absoluteImageUrl] }),
          },
          unit_amount: Math.round(item.unitPrice * 100), // Convert to cents
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
          description: 'California sales tax',
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
      console.error('Stripe checkout error:', stripeError);
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
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
