import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe/server';
import type { CheckoutFormData } from '@/types/checkout';
import type { CartItem } from '@/contexts/cart-context';
import { getZoneByDistance } from '@/lib/delivery-zones';

interface CheckoutRequestBody extends CheckoutFormData {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequestBody = await request.json();
    const {
      items,
      subtotal,
      deliveryFee,
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

    // Get or create user (guest checkout)
    const { data: { user } } = await supabase.auth.getUser();
    let userId = user?.id;

    // If no authenticated user, create anonymous order
    // We'll store the guest email for order tracking
    if (!userId) {
      userId = 'guest'; // We'll use guest orders with email tracking
    }

    // Verify products exist and are available
    const variantIds = items.map(item => item.variantId);
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, product_id, price, is_available')
      .in('id', variantIds) as any;

    if (variantsError) {
      console.error('Error fetching variants:', variantsError);
      return NextResponse.json(
        { error: 'Failed to validate cart items' },
        { status: 500 }
      );
    }

    // Validate all items are available and prices match
    const unavailableItems: string[] = [];
    const priceMismatches: string[] = [];

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
      if (variant.price !== item.unitPrice) {
        priceMismatches.push(item.productName);
      }
    });

    if (unavailableItems.length > 0) {
      return NextResponse.json(
        { error: `The following items are no longer available: ${unavailableItems.join(', ')}` },
        { status: 400 }
      );
    }

    if (priceMismatches.length > 0) {
      return NextResponse.json(
        { error: `Prices have changed for: ${priceMismatches.join(', ')}. Please refresh your cart.` },
        { status: 400 }
      );
    }

    // Calculate totals
    const TAX_RATE = 0.08;
    const taxAmount = subtotal * TAX_RATE;
    const total = subtotal + deliveryFee + taxAmount;

    // Determine delivery zone
    let deliveryZoneId: number | null = null;
    if (fulfillmentType === 'delivery' && deliveryAddress) {
      // In production, you would geocode the address to get actual distance
      // For now, we'll use a mock zone based on ZIP
      const zipNum = parseInt(deliveryAddress.zip);
      if (zipNum >= 90001 && zipNum <= 90010) {
        deliveryZoneId = 1;
      } else if (zipNum >= 90011 && zipNum <= 90050) {
        deliveryZoneId = 2;
      } else if (zipNum >= 90051 && zipNum <= 90100) {
        deliveryZoneId = 3;
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
    const orderInsert = {
      user_id: userId,
      status: 'received' as const,
      delivery_type: fulfillmentType,
      delivery_zone_id: deliveryZoneId,
      delivery_address: deliveryAddressJson as any,
      delivery_instructions: deliveryInstructions || null,
      subtotal,
      delivery_fee: deliveryFee,
      tax: taxAmount,
      total,
      notes: null,
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsert as any)
      .select()
      .single() as any;

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
      special_instructions: null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems as any);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // Create Stripe checkout session
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.productName} - ${item.variantName}`,
          description: item.productName,
          ...(item.imageUrl && { images: [item.imageUrl] }),
        },
        unit_amount: Math.round(item.unitPrice * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await createCheckoutSession({
      orderId: order.id,
      lineItems,
      customerEmail: email,
      successUrl: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancelUrl: `${appUrl}/checkout?cancelled=true`,
    });

    // Update order with Stripe session ID
    await supabase
      .from('orders')
      .update({ stripe_checkout_session_id: session.id } as any)
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
