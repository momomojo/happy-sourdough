import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, getOrderById } from '@/lib/supabase/admin/orders';
import { OrderStatus } from '@/types/database';
import { sendOrderStatusUpdateEmail, sendOrderReadyEmail } from '@/lib/email/send';
import { createAdminClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const { status, notes } = body;

    // Validate status
    const validStatuses: OrderStatus[] = [
      'received',
      'confirmed',
      'baking',
      'decorating',
      'quality_check',
      'ready',
      'out_for_delivery',
      'delivered',
      'picked_up',
      'cancelled',
      'refunded',
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update order status
    await updateOrderStatus(id, status, notes);

    // Send email notification
    try {
      const order = await getOrderById(id);

      if (!order || order.customer_email === 'N/A') {
        console.log('Skipping email - no order or email found');
      } else {
        // Send different emails based on status
        if (status === 'ready') {
          // Send "order ready" email with pickup/delivery details
          const supabase = await createAdminClient();

          // Get order items for the email
          const { data: orderItems } = await supabase
            .from('order_items')
            .select(`
              quantity,
              product_name,
              variant_name
            `)
            .eq('order_id', id);

          const items = (orderItems || []).map((item: Record<string, unknown>) => ({
            product_name: item.product_name as string || 'Unknown Product',
            variant_name: item.variant_name as string | null,
            quantity: item.quantity as number,
          }));

          // Get time slot if available
          let timeSlot;
          if (order.time_slot_id) {
            const { data: slot } = await supabase
              .from('time_slots')
              .select('date, window_start, window_end')
              .eq('id', order.time_slot_id)
              .single();

            if (slot) {
              const slotData = slot as Record<string, unknown>;
              timeSlot = {
                date: slotData.date as string,
                windowStart: slotData.window_start as string,
                windowEnd: slotData.window_end as string,
              };
            }
          }

          // Format delivery address for email
          let deliveryAddressStr: string | undefined;
          if (order.delivery_address) {
            const addr = order.delivery_address;
            deliveryAddressStr = `${addr.street}${addr.apt ? `, ${addr.apt}` : ''}, ${addr.city}, ${addr.state} ${addr.zip}`;
          }

          await sendOrderReadyEmail({
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            deliveryType: order.fulfillment_type,
            items,
            deliveryAddress: deliveryAddressStr,
            deliveryETA: order.delivery_window,
            timeSlot,
          });
        } else if (
          status !== 'received' &&
          status !== 'confirmed' // Skip these as they're handled elsewhere
        ) {
          // Send status update email for other statuses
          await sendOrderStatusUpdateEmail({
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            status: status,
            deliveryType: order.fulfillment_type,
            estimatedTime: order.delivery_window,
          });
        }

        console.log(`Status update email sent for order ${order.order_number} (${status})`);
      }
    } catch (emailError) {
      // Don't fail the status update if email fails
      console.error('Error sending status update email:', emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
