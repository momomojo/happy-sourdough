import { createAdminClient } from '../server';
import type { Order, OrderStatus } from '@/types/database';

export interface OrderFilters {
  status?: OrderStatus;
  delivery_type?: 'pickup' | 'delivery';
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface OrderStats {
  total: number;
  received: number;
  confirmed: number;
  baking: number;
  decorating: number;
  quality_check: number;
  ready: number;
  out_for_delivery: number;
  delivered: number;
  cancelled: number;
  refunded: number;
}

export interface OrderWithCustomer extends Order {
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  items_count: number;
  delivery_date?: string;
  delivery_window?: string;
}

/**
 * Get paginated orders with filters
 */
export async function getOrders(
  filters: OrderFilters = {},
  page: number = 1,
  perPage: number = 20
): Promise<{ orders: OrderWithCustomer[]; total: number }> {
  const supabase = await createAdminClient();

  // Build query
  let query = supabase
    .from('orders')
    .select(`
      *,
      customer_profiles!inner(full_name, user_id),
      order_items(id)
    `, { count: 'exact' });

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.delivery_type) {
    query = query.eq('delivery_type', filters.delivery_type);
  }

  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  if (filters.search) {
    query = query.or(`order_number.ilike.%${filters.search}%,delivery_address.ilike.%${filters.search}%`);
  }

  // Apply pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  query = query
    .order('created_at', { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to fetch orders');
  }

  // Get user emails from auth.users (requires service role)
  const userIds = [...new Set(data?.map(order => (order as any).customer_profiles.user_id) || [])];
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const userMap = new Map(authUsers.users.map(user => [user.id, user]));

  // Transform data
  const orders: OrderWithCustomer[] = await Promise.all(
    (data || []).map(async (order: any) => {
      const profile = order.customer_profiles;
      const user = userMap.get(profile.user_id);

      // Get delivery time slot if applicable
      let deliveryDate: string | undefined;
      let deliveryWindow: string | undefined;

      if (order.time_slot_id) {
        const { data: timeSlot } = await supabase
          .from('time_slots')
          .select('date, window_start, window_end')
          .eq('id', order.time_slot_id)
          .single();

        if (timeSlot) {
          deliveryDate = timeSlot.date;
          deliveryWindow = `${timeSlot.window_start} - ${timeSlot.window_end}`;
        }
      }

      return {
        id: order.id,
        order_number: order.order_number,
        user_id: order.user_id,
        status: order.status,
        delivery_type: order.delivery_type,
        delivery_zone_id: order.delivery_zone_id,
        time_slot_id: order.time_slot_id,
        delivery_address: order.delivery_address,
        delivery_instructions: order.delivery_instructions,
        subtotal: order.subtotal,
        delivery_fee: order.delivery_fee,
        tax: order.tax,
        total: order.total,
        stripe_payment_intent_id: order.stripe_payment_intent_id,
        stripe_checkout_session_id: order.stripe_checkout_session_id,
        notes: order.notes,
        created_at: order.created_at,
        updated_at: order.updated_at,
        customer_name: profile.full_name || 'Guest',
        customer_email: user?.email || 'N/A',
        customer_phone: profile.phone,
        items_count: order.order_items?.length || 0,
        delivery_date: deliveryDate,
        delivery_window: deliveryWindow,
      };
    })
  );

  return {
    orders,
    total: count || 0,
  };
}

/**
 * Update order status with history tracking
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  notes?: string
): Promise<void> {
  const supabase = await createAdminClient();

  // Update order status
  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (updateError) {
    console.error('Error updating order status:', updateError);
    throw new Error('Failed to update order status');
  }

  // Add to status history
  const { error: historyError } = await supabase
    .from('order_status_history')
    .insert({
      order_id: orderId,
      status: newStatus,
      notes: notes || null,
      changed_by: null, // TODO: Add admin user ID when auth is implemented
    });

  if (historyError) {
    console.error('Error adding status history:', historyError);
    // Don't throw - history is not critical
  }
}

/**
 * Get order statistics for dashboard
 */
export async function getOrderStats(filters: OrderFilters = {}): Promise<OrderStats> {
  const supabase = await createAdminClient();

  // Build base query
  let query = supabase
    .from('orders')
    .select('status', { count: 'exact' });

  // Apply date filters if provided
  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  if (filters.delivery_type) {
    query = query.eq('delivery_type', filters.delivery_type);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching order stats:', error);
    throw new Error('Failed to fetch order stats');
  }

  // Count by status
  const stats: OrderStats = {
    total: count || 0,
    received: 0,
    confirmed: 0,
    baking: 0,
    decorating: 0,
    quality_check: 0,
    ready: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
  };

  data?.forEach((order: any) => {
    const status = order.status as OrderStatus;
    if (status in stats) {
      stats[status]++;
    }
  });

  return stats;
}

/**
 * Get order by ID with full details
 */
export async function getOrderById(orderId: string): Promise<OrderWithCustomer | null> {
  const supabase = await createAdminClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer_profiles!inner(full_name, phone, user_id),
      order_items(id)
    `)
    .eq('id', orderId)
    .single();

  if (error || !order) {
    console.error('Error fetching order:', error);
    return null;
  }

  // Get user email
  const { data: authUser } = await supabase.auth.admin.getUserById(
    (order as any).customer_profiles.user_id
  );

  // Get delivery time slot
  let deliveryDate: string | undefined;
  let deliveryWindow: string | undefined;

  if (order.time_slot_id) {
    const { data: timeSlot } = await supabase
      .from('time_slots')
      .select('date, window_start, window_end')
      .eq('id', order.time_slot_id)
      .single();

    if (timeSlot) {
      deliveryDate = timeSlot.date;
      deliveryWindow = `${timeSlot.window_start} - ${timeSlot.window_end}`;
    }
  }

  const profile = (order as any).customer_profiles;

  return {
    id: order.id,
    order_number: order.order_number,
    user_id: order.user_id,
    status: order.status,
    delivery_type: order.delivery_type,
    delivery_zone_id: order.delivery_zone_id,
    time_slot_id: order.time_slot_id,
    delivery_address: order.delivery_address,
    delivery_instructions: order.delivery_instructions,
    subtotal: order.subtotal,
    delivery_fee: order.delivery_fee,
    tax: order.tax,
    total: order.total,
    stripe_payment_intent_id: order.stripe_payment_intent_id,
    stripe_checkout_session_id: order.stripe_checkout_session_id,
    notes: order.notes,
    created_at: order.created_at,
    updated_at: order.updated_at,
    customer_name: profile.full_name || 'Guest',
    customer_email: authUser?.user?.email || 'N/A',
    customer_phone: profile.phone,
    items_count: (order as any).order_items?.length || 0,
    delivery_date: deliveryDate,
    delivery_window: deliveryWindow,
  };
}
