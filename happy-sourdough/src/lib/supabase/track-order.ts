'use server';

import { createClient } from './client';
import type { OrderWithDetails } from './orders';
import { getOrderItems, getOrderStatusHistory } from './orders';
import type { Order } from '@/types/database';

/**
 * Track order by order number and email
 * Works for both guest orders (uses guest_email) and authenticated orders (uses user's email)
 * @param orderNumber - The order number (e.g., "HS-2024-001")
 * @param email - The email address used to place the order
 * @returns Order with items and status history, or null if not found
 */
export async function trackOrderByNumberAndEmail(
  orderNumber: string,
  email: string
): Promise<OrderWithDetails | null> {
  const supabase = createClient();

  try {
    // First, try to find the order by order number
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (orderError || !orderData) {
      console.error('Error fetching order:', orderError);
      return null;
    }

    const order = orderData as Order;

    // Verify email matches either guest_email OR user's email
    let emailMatches = false;

    // Check guest email first (for guest orders)
    if (order.guest_email) {
      emailMatches = order.guest_email.toLowerCase() === email.toLowerCase();
    } else if (order.user_id) {
      // For authenticated user orders, we need to verify the email
      // Since this is a public endpoint, we'll check if the current user matches
      const { data: userData } = await supabase.auth.getUser();

      if (userData?.user?.id === order.user_id) {
        // User is logged in and owns this order
        emailMatches = userData.user.email?.toLowerCase() === email.toLowerCase();
      } else {
        // User is not logged in, but the order belongs to a registered user
        // For security, we cannot verify the email without authentication
        // Return null - they should log in to view their order
        return null;
      }
    }

    if (!emailMatches) {
      // Email doesn't match - return null (not authorized)
      return null;
    }

    // Get order items with product details
    const items = await getOrderItems(order.id);

    // Get status history
    const statusHistory = await getOrderStatusHistory(order.id);

    return {
      ...order,
      items,
      status_history: statusHistory,
    };
  } catch (error) {
    console.error('Error tracking order:', error);
    return null;
  }
}
