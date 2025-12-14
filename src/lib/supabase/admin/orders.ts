import { createAdminClient } from '../server';
import type { Order, OrderStatus, FulfillmentType } from '@/types/database';

export interface OrderFilters {
  status?: OrderStatus;
  fulfillment_type?: FulfillmentType;
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
  picked_up: number;
  cancelled: number;
  refunded: number;
}

export interface OrderWithCustomer extends Order {
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  items_count: number;
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

  // Build query - don't use inner join since guest orders have no user_id
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items(id)
    `, { count: 'exact' });

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.fulfillment_type) {
    query = query.eq('fulfillment_type', filters.fulfillment_type);
  }

  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  if (filters.search) {
    query = query.or(`order_number.ilike.%${filters.search}%`);
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
    throw new Error(`Failed to fetch orders: ${error.message || error.code || 'Unknown error'}`);
  }

  // Get customer info for orders with user_id
  const userIds = [...new Set((data || [])
    .filter((order: Record<string, unknown>) => order.user_id)
    .map((order: Record<string, unknown>) => order.user_id as string)
  )];

  // Build user map for authenticated users
  const userMap = new Map<string, { email?: string; firstName?: string; lastName?: string; phone?: string }>();

  if (userIds.length > 0) {
    // Fetch only the users we need (fixed: was fetching ALL users)
    const userPromises = userIds.map(id =>
      supabase.auth.admin.getUserById(id)
    );
    const userResults = await Promise.all(userPromises);

    userResults.forEach(({ data: userResponse }) => {
      if (userResponse?.user) {
        userMap.set(userResponse.user.id, { email: userResponse.user.email });
      }
    });

    // Get profiles
    interface CustomerProfile {
      id: string;
      first_name: string | null;
      last_name: string | null;
      phone: string | null;
    }
    const { data: profiles } = await (supabase
      .from('customer_profiles') as ReturnType<typeof supabase.from>)
      .select('id, first_name, last_name, phone')
      .in('id', userIds) as { data: CustomerProfile[] | null };

    profiles?.forEach((profile) => {
      const existing = userMap.get(profile.id) || {};
      userMap.set(profile.id, {
        ...existing,
        firstName: profile.first_name || undefined,
        lastName: profile.last_name || undefined,
        phone: profile.phone || undefined,
      });
    });
  }

  // Transform data
  const orders: OrderWithCustomer[] = (data || []).map((order: Record<string, unknown>) => {
    let customerName = 'Guest';
    let customerEmail = order.guest_email as string || 'N/A';
    let customerPhone = order.guest_phone as string | null;

    if (order.user_id) {
      const userInfo = userMap.get(order.user_id as string);
      if (userInfo) {
        customerName = [userInfo.firstName, userInfo.lastName].filter(Boolean).join(' ') || 'Customer';
        customerEmail = userInfo.email || 'N/A';
        customerPhone = userInfo.phone || null;
      }
    }

    return {
      id: order.id as string,
      order_number: order.order_number as string,
      user_id: order.user_id as string | null,
      guest_email: order.guest_email as string | null,
      guest_phone: order.guest_phone as string | null,
      status: order.status as OrderStatus,
      fulfillment_type: order.fulfillment_type as FulfillmentType,
      delivery_date: order.delivery_date as string,
      delivery_window: order.delivery_window as string,
      delivery_zone_id: order.delivery_zone_id as string | null,
      time_slot_id: order.time_slot_id as string | null,
      delivery_address: order.delivery_address as Order['delivery_address'],
      pickup_location: order.pickup_location as string | null,
      subtotal: order.subtotal as number,
      delivery_fee: order.delivery_fee as number,
      discount_amount: order.discount_amount as number,
      discount_code_id: order.discount_code_id as string | null,
      tax_amount: order.tax_amount as number,
      tip_amount: order.tip_amount as number,
      total: order.total as number,
      stripe_payment_intent_id: order.stripe_payment_intent_id as string | null,
      stripe_checkout_session_id: order.stripe_checkout_session_id as string | null,
      stripe_charge_id: order.stripe_charge_id as string | null,
      payment_status: order.payment_status as Order['payment_status'],
      notes: order.notes as string | null,
      internal_notes: order.internal_notes as string | null,
      created_at: order.created_at as string,
      updated_at: order.updated_at as string,
      confirmed_at: order.confirmed_at as string | null,
      completed_at: order.completed_at as string | null,
      cancelled_at: order.cancelled_at as string | null,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      items_count: ((order.order_items as unknown[]) || []).length,
    };
  });

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
  notes?: string,
  adminUserId?: string
): Promise<void> {
  const supabase = await createAdminClient();

  // Build update object
  const updateData: Record<string, unknown> = {
    status: newStatus,
  };

  // Set completed_at when order is delivered or picked_up
  if (newStatus === 'delivered' || newStatus === 'picked_up') {
    updateData.completed_at = new Date().toISOString();
  }

  // Update order status
  const { error: updateError } = await supabase
    .from('orders')
    .update(updateData as never)
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
      changed_by: adminUserId || null,
    } as never);

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

  if (filters.fulfillment_type) {
    query = query.eq('fulfillment_type', filters.fulfillment_type);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching order stats:', error);
    throw new Error(`Failed to fetch order stats: ${error.message || error.code || 'Unknown error'}`);
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
    picked_up: 0,
    cancelled: 0,
    refunded: 0,
  };

  data?.forEach((order: Record<string, unknown>) => {
    const status = order.status as OrderStatus;
    if (status in stats) {
      (stats as unknown as Record<string, number>)[status]++;
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
      order_items(id)
    `)
    .eq('id', orderId)
    .single() as { data: (Order & { order_items: { id: string }[] }) | null; error: unknown };

  if (error || !order) {
    console.error('Error fetching order:', error);
    return null;
  }

  // Get customer info
  let customerName = 'Guest';
  let customerEmail = order.guest_email || 'N/A';
  let customerPhone = order.guest_phone || null;

  if (order.user_id) {
    const { data: authUser } = await supabase.auth.admin.getUserById(order.user_id);
    if (authUser?.user?.email) {
      customerEmail = authUser.user.email;
    }

    interface ProfileData {
      first_name: string | null;
      last_name: string | null;
      phone: string | null;
    }
    const { data: profile } = await (supabase
      .from('customer_profiles') as ReturnType<typeof supabase.from>)
      .select('first_name, last_name, phone')
      .eq('id', order.user_id)
      .single() as { data: ProfileData | null };

    if (profile) {
      customerName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Customer';
      customerPhone = profile.phone || customerPhone;
    }
  }

  return {
    id: order.id,
    order_number: order.order_number,
    user_id: order.user_id,
    guest_email: order.guest_email,
    guest_phone: order.guest_phone,
    status: order.status,
    fulfillment_type: order.fulfillment_type,
    delivery_date: order.delivery_date,
    delivery_window: order.delivery_window,
    delivery_zone_id: order.delivery_zone_id,
    time_slot_id: order.time_slot_id,
    delivery_address: order.delivery_address,
    pickup_location: order.pickup_location,
    subtotal: order.subtotal,
    delivery_fee: order.delivery_fee,
    discount_amount: order.discount_amount,
    discount_code_id: order.discount_code_id,
    tax_amount: order.tax_amount,
    tip_amount: order.tip_amount,
    total: order.total,
    stripe_payment_intent_id: order.stripe_payment_intent_id,
    stripe_checkout_session_id: order.stripe_checkout_session_id,
    stripe_charge_id: order.stripe_charge_id,
    payment_status: order.payment_status,
    notes: order.notes,
    internal_notes: order.internal_notes,
    created_at: order.created_at,
    updated_at: order.updated_at,
    confirmed_at: order.confirmed_at,
    completed_at: order.completed_at,
    cancelled_at: order.cancelled_at,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    items_count: order.order_items?.length || 0,
  };
}
