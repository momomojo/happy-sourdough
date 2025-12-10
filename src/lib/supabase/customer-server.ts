import { createClient } from './server';
import type { CustomerProfile, CustomerAddress, Order } from '@/types/database';

export interface OrderWithItemCount extends Order {
  item_count: number;
}

/**
 * Get customer profile for the authenticated user (Server Component)
 */
export async function getCustomerProfile(userId: string): Promise<CustomerProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('customer_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching customer profile:', error);
    return null;
  }

  return data;
}

/**
 * Get all orders for a user with item count (Server Component)
 * Fixed: Uses single query with aggregation instead of N+1 queries
 */
export async function getUserOrders(userId: string): Promise<OrderWithItemCount[]> {
  const supabase = await createClient();

  // Use a single query with aggregation to get orders and item counts
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(id)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }

  if (!orders || orders.length === 0) {
    return [];
  }

  // Transform the data to include item count
  const ordersWithCounts: OrderWithItemCount[] = orders.map((order) => {
    const { order_items, ...orderData } = order as Order & { order_items: Array<{ id: string }> };
    return {
      ...orderData,
      item_count: order_items?.length || 0,
    };
  });

  return ordersWithCounts;
}

/**
 * Get all saved addresses for a user (Server Component)
 */
export async function getUserAddresses(userId: string): Promise<CustomerAddress[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('customer_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user addresses:', error);
    return [];
  }

  return data || [];
}
