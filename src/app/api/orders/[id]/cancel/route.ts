import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/lib/supabase/server';
import { strictLimiter, rateLimitResponse } from '@/lib/rate-limit';
import type { Order, OrderStatus } from '@/types/database';

// Business rule: Orders can only be cancelled before baking starts
const CANCELLABLE_STATUSES: OrderStatus[] = ['received', 'confirmed'];

interface CancelRequestBody {
  email?: string; // Required for guest orders
  reason?: string; // Optional cancellation reason
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limiting: 5 cancellation attempts per minute per IP
  const rateLimitResult = await strictLimiter.check(request, 5, 'ORDER_CANCEL');
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult);
  }

  try {
    const { id: orderId } = await params;
    const body: CancelRequestBody = await request.json().catch(() => ({}));

    // Validate order ID format
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get authenticated user (may be null for guest orders)
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch the order
    const { data: order, error: orderError } = await (supabase
      .from('orders') as ReturnType<typeof supabase.from>)
      .select('*')
      .eq('id', orderId)
      .single() as { data: Order | null; error: unknown };

    if (orderError || !order) {
      Sentry.captureException(orderError, {
        tags: { api: 'order-cancel', step: 'fetch_order' },
        extra: { orderId },
      });
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // AUTHORIZATION CHECK: Verify the user owns this order
    let isAuthorized = false;

    if (user && order.user_id === user.id) {
      // Authenticated user owns the order
      isAuthorized = true;
    } else if (!order.user_id && order.guest_email) {
      // Guest order - verify email matches
      const providedEmail = body.email?.toLowerCase().trim();
      const orderEmail = order.guest_email.toLowerCase().trim();

      if (!providedEmail) {
        return NextResponse.json(
          { error: 'Email is required to cancel guest orders' },
          { status: 400 }
        );
      }

      if (providedEmail !== orderEmail) {
        // Log potential unauthorized access attempt
        Sentry.addBreadcrumb({
          category: 'auth',
          message: 'Unauthorized order cancellation attempt',
          level: 'warning',
          data: { orderId, providedEmail, orderEmail },
        });
        return NextResponse.json(
          { error: 'Unauthorized: Email does not match order' },
          { status: 403 }
        );
      }

      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not have permission to cancel this order' },
        { status: 403 }
      );
    }

    // BUSINESS RULE: Check if order can be cancelled
    const orderStatus = (order.status ?? 'received') as OrderStatus;
    if (!CANCELLABLE_STATUSES.includes(orderStatus)) {
      const statusMessages: Record<string, string> = {
        baking: 'Cannot cancel order after baking has started',
        decorating: 'Cannot cancel order - already in decorating stage',
        quality_check: 'Cannot cancel order - already in quality check',
        ready: 'Cannot cancel order - already prepared and ready',
        out_for_delivery: 'Cannot cancel order - already out for delivery',
        delivered: 'Order has already been delivered',
        picked_up: 'Order has already been picked up',
        cancelled: 'Order is already cancelled',
        refunded: 'Order has already been refunded',
      };

      return NextResponse.json(
        {
          error: statusMessages[orderStatus] || 'Cannot cancel order at this stage',
          currentStatus: orderStatus
        },
        { status: 400 }
      );
    }

    // Update order status to cancelled
    const { error: updateError } = await (supabase
      .from('orders') as ReturnType<typeof supabase.from>)
      .update({
        status: 'cancelled' as OrderStatus,
        updated_at: new Date().toISOString()
      } as never)
      .eq('id', orderId);

    if (updateError) {
      Sentry.captureException(updateError, {
        tags: { api: 'order-cancel', step: 'update_status' },
        extra: { orderId },
      });
      return NextResponse.json(
        { error: 'Failed to cancel order. Please try again.' },
        { status: 500 }
      );
    }

    // Restore inventory using the database function
    // This function is a trigger that automatically runs on status change to 'cancelled'
    // But we'll call it explicitly for clarity and error handling
    try {
      const { error: inventoryError } = await (supabase as any).rpc('restore_inventory_for_order', {
        order_id_param: orderId,
      });

      if (inventoryError) {
        // Log but don't fail - the trigger should handle this anyway
        Sentry.captureException(inventoryError, {
          level: 'warning',
          tags: { api: 'order-cancel', step: 'restore_inventory' },
          extra: { orderId },
        });
      }
    } catch (inventoryCallError) {
      // Non-blocking - the trigger will handle inventory restoration
      Sentry.captureException(inventoryCallError, {
        level: 'warning',
        tags: { api: 'order-cancel', step: 'restore_inventory_rpc' },
        extra: { orderId },
      });
    }

    // Release time slot if one was reserved
    if (order.time_slot_id) {
      try {
        const { error: slotError } = await (supabase as any).rpc('decrement_slot_orders', {
          slot_id: order.time_slot_id,
        });

        if (slotError) {
          // Log but don't fail the cancellation
          Sentry.captureException(slotError, {
            level: 'warning',
            tags: { api: 'order-cancel', step: 'release_slot' },
            extra: { orderId, timeSlotId: order.time_slot_id },
          });
        }
      } catch (slotCallError) {
        // Non-blocking
        Sentry.captureException(slotCallError, {
          level: 'warning',
          tags: { api: 'order-cancel', step: 'release_slot_rpc' },
          extra: { orderId, timeSlotId: order.time_slot_id },
        });
      }
    }

    // Add entry to order_status_history
    const statusHistoryInsert = {
      order_id: orderId,
      status: 'cancelled' as OrderStatus,
      changed_by: user?.id || null,
      notes: body.reason || 'Cancelled by customer',
    };

    const { error: historyError } = await (supabase
      .from('order_status_history') as ReturnType<typeof supabase.from>)
      .insert(statusHistoryInsert as never);

    if (historyError) {
      // Log but don't fail the cancellation - history is non-critical
      Sentry.captureException(historyError, {
        level: 'warning',
        tags: { api: 'order-cancel', step: 'status_history' },
        extra: { orderId },
      });
    }

    // TODO: Send cancellation email to customer (non-blocking)
    // This would be implemented using Resend email service
    // Example: await sendCancellationEmail(order.guest_email || user.email, order.order_number);

    // Log successful cancellation
    Sentry.addBreadcrumb({
      category: 'order',
      message: 'Order cancelled successfully',
      level: 'info',
      data: {
        orderId,
        orderNumber: order.order_number,
        userId: user?.id || 'guest',
        previousStatus: order.status,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      orderNumber: order.order_number,
    });

  } catch (error) {
    Sentry.captureException(error, {
      tags: { api: 'order-cancel', step: 'unhandled' },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
