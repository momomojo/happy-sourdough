import { createClient } from './client';
import type { Order, OrderItem, OrderStatus, OrderStatusHistory } from '@/types/database';

export interface OrderWithDetails extends Order {
  items: (OrderItem & {
    product_name: string;
    variant_name: string | null;
  })[];
  status_history: OrderStatusHistory[];
}

/**
 * Get order by order number
 * @param orderNumber - The order number (e.g., "HS-2024-001")
 * @returns Order with items and status history
 */
export async function getOrderByNumber(orderNumber: string): Promise<OrderWithDetails | null> {
  const supabase = createClient();

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

  // Get order items with product details
  const items = await getOrderItems(order.id);

  // Get status history
  const statusHistory = await getOrderStatusHistory(order.id);

  return {
    ...order,
    items,
    status_history: statusHistory,
  };
}

/**
 * Get all items for an order with product details
 * @param orderId - The order ID
 * @returns Array of order items with product names
 */
export async function getOrderItems(
  orderId: string
): Promise<(OrderItem & { product_name: string; variant_name: string | null })[]> {
  const supabase = createClient();

  const { data: items, error } = await supabase
    .from('order_items')
    .select(`
      *,
      products:product_id (name),
      product_variants:product_variant_id (name)
    `)
    .eq('order_id', orderId);

  if (error) {
    console.error('Error fetching order items:', error);
    return [];
  }

  // Transform the data to flatten the nested structure
  return (items || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    order_id: item.order_id as string,
    product_id: item.product_id as string,
    product_variant_id: item.product_variant_id as string | null,
    product_name: item.product_name as string || (item.products as { name: string } | null)?.name || 'Unknown Product',
    variant_name: item.variant_name as string | null || (item.product_variants as { name: string } | null)?.name || null,
    quantity: item.quantity as number,
    unit_price: item.unit_price as number,
    total_price: item.total_price as number,
    special_instructions: item.special_instructions as string | null,
    created_at: item.created_at as string,
  }));
}

/**
 * Get status change history for an order
 * @param orderId - The order ID
 * @returns Array of status changes ordered by date
 */
export async function getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching order status history:', error);
    return [];
  }

  return (data || []) as OrderStatusHistory[];
}

/**
 * Get order by ID
 * @param orderId - The order ID (UUID)
 * @returns Order with items and status history
 */
export async function getOrderById(orderId: string): Promise<OrderWithDetails | null> {
  const supabase = createClient();

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !orderData) {
    console.error('Error fetching order:', orderError);
    return null;
  }

  const order = orderData as Order;
  const items = await getOrderItems(order.id);
  const statusHistory = await getOrderStatusHistory(order.id);

  return {
    ...order,
    items,
    status_history: statusHistory,
  };
}
