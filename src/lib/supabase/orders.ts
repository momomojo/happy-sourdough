import { createClient } from './client';
import type { Order, OrderItem, OrderStatus } from '@/types/database';

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface OrderWithDetails extends Order {
  items: (OrderItem & {
    product_name: string;
    variant_name: string;
  })[];
  status_history: OrderStatusHistory[];
  delivery_date?: string;
  delivery_window?: string;
}

/**
 * Get order by order number
 * @param orderNumber - The order number (e.g., "HS-2024-001")
 * @returns Order with items and status history
 */
export async function getOrderByNumber(orderNumber: string): Promise<OrderWithDetails | null> {
  const supabase = createClient();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();

  if (orderError || !order) {
    console.error('Error fetching order:', orderError);
    return null;
  }

  // Get order items with product details
  const items = await getOrderItems(order.id);

  // Get status history
  const statusHistory = await getOrderStatusHistory(order.id);

  // Get delivery time slot if applicable
  let deliveryDate: string | undefined;
  let deliveryWindow: string | undefined;

  if (order.time_slot_id) {
    const { data: timeSlot } = await supabase
      .from('time_slots')
      .select('date, start_time, end_time')
      .eq('id', order.time_slot_id)
      .single();

    if (timeSlot) {
      deliveryDate = timeSlot.date;
      deliveryWindow = `${timeSlot.start_time} - ${timeSlot.end_time}`;
    }
  }

  return {
    ...order,
    items,
    status_history: statusHistory,
    delivery_date: deliveryDate,
    delivery_window: deliveryWindow,
  };
}

/**
 * Get all items for an order with product details
 * @param orderId - The order ID
 * @returns Array of order items with product names
 */
export async function getOrderItems(
  orderId: string
): Promise<(OrderItem & { product_name: string; variant_name: string })[]> {
  const supabase = createClient();

  const { data: items, error } = await supabase
    .from('order_items')
    .select(`
      *,
      products:product_id (name),
      product_variants:variant_id (name)
    `)
    .eq('order_id', orderId);

  if (error) {
    console.error('Error fetching order items:', error);
    return [];
  }

  // Transform the data to flatten the nested structure
  return (items || []).map((item: any) => ({
    id: item.id,
    order_id: item.order_id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
    special_instructions: item.special_instructions,
    product_name: item.products?.name || 'Unknown Product',
    variant_name: item.product_variants?.name || 'Standard',
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

  return data || [];
}

/**
 * Get order by ID
 * @param orderId - The order ID (UUID)
 * @returns Order with items and status history
 */
export async function getOrderById(orderId: string): Promise<OrderWithDetails | null> {
  const supabase = createClient();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    console.error('Error fetching order:', orderError);
    return null;
  }

  const items = await getOrderItems(order.id);
  const statusHistory = await getOrderStatusHistory(order.id);

  // Get delivery time slot if applicable
  let deliveryDate: string | undefined;
  let deliveryWindow: string | undefined;

  if (order.time_slot_id) {
    const { data: timeSlot } = await supabase
      .from('time_slots')
      .select('date, start_time, end_time')
      .eq('id', order.time_slot_id)
      .single();

    if (timeSlot) {
      deliveryDate = timeSlot.date;
      deliveryWindow = `${timeSlot.start_time} - ${timeSlot.end_time}`;
    }
  }

  return {
    ...order,
    items,
    status_history: statusHistory,
    delivery_date: deliveryDate,
    delivery_window: deliveryWindow,
  };
}
