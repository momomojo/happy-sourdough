import { createClient } from '../client';

export interface ProductionItem {
  product_id: string;
  product_name: string;
  product_variant_id: string | null;
  variant_name: string | null;
  category: string;
  quantity: number;
  orders_count: number;
  is_completed?: boolean;
  notes?: string;
}

export interface ProductionStats {
  total_items: number;
  total_orders: number;
  by_category: {
    category: string;
    count: number;
  }[];
}

export interface ProductionListData {
  date: string;
  items: ProductionItem[];
  stats: ProductionStats;
}

/**
 * Get production list for a specific date
 * Aggregates all order items scheduled for delivery on that date
 * @param date - Date in YYYY-MM-DD format
 * @returns Production list with items grouped by product/variant
 */
export async function getProductionList(date: string): Promise<ProductionListData> {
  const supabase = createClient();

  // Get all orders for the specified date
  const { data: timeSlots, error: slotsError } = await supabase
    .from('time_slots')
    .select('id')
    .eq('date', date);

  if (slotsError) {
    console.error('Error fetching time slots:', slotsError);
    return { date, items: [], stats: { total_items: 0, total_orders: 0, by_category: [] } };
  }

  const timeSlotIds = (timeSlots || []).map((slot: any) => slot.id);

  if (timeSlotIds.length === 0) {
    return { date, items: [], stats: { total_items: 0, total_orders: 0, by_category: [] } };
  }

  // Get all orders for those time slots
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id')
    .in('time_slot_id', timeSlotIds)
    .neq('status', 'cancelled')
    .neq('status', 'refunded');

  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
    return { date, items: [], stats: { total_items: 0, total_orders: 0, by_category: [] } };
  }

  const orderIds = (orders || []).map((order: any) => order.id);

  if (orderIds.length === 0) {
    return { date, items: [], stats: { total_items: 0, total_orders: 0, by_category: [] } };
  }

  // Get all order items with product details
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      product_id,
      product_variant_id,
      quantity,
      order_id,
      products:product_id (
        name,
        category
      ),
      product_variants:product_variant_id (
        name
      )
    `)
    .in('order_id', orderIds);

  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    return { date, items: [], stats: { total_items: 0, total_orders: 0, by_category: [] } };
  }

  // Aggregate items by product and variant
  const itemsMap = new Map<string, ProductionItem>();

  (orderItems || []).forEach((item: any) => {
    const productName = item.products?.name || 'Unknown Product';
    const variantName = item.product_variants?.name || null;
    const category = item.products?.category || 'Other';
    const key = `${item.product_id}-${item.product_variant_id || 'none'}`;

    if (itemsMap.has(key)) {
      const existing = itemsMap.get(key)!;
      existing.quantity += item.quantity;
      existing.orders_count += 1;
    } else {
      itemsMap.set(key, {
        product_id: item.product_id,
        product_name: productName,
        product_variant_id: item.product_variant_id,
        variant_name: variantName,
        category,
        quantity: item.quantity,
        orders_count: 1,
        is_completed: false,
        notes: '',
      });
    }
  });

  const items = Array.from(itemsMap.values());

  // Calculate stats
  const total_items = items.reduce((sum, item) => sum + item.quantity, 0);
  const total_orders = orders?.length || 0;

  const categoryMap = new Map<string, number>();
  items.forEach(item => {
    const current = categoryMap.get(item.category) || 0;
    categoryMap.set(item.category, current + item.quantity);
  });

  const by_category = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return {
    date,
    items,
    stats: {
      total_items,
      total_orders,
      by_category,
    },
  };
}

/**
 * Get production statistics for a specific date
 * @param date - Date in YYYY-MM-DD format
 * @returns Summary statistics
 */
export async function getProductionStats(date: string): Promise<ProductionStats> {
  const data = await getProductionList(date);
  return data.stats;
}

/**
 * Mark a production item as complete
 * Note: This is a simple implementation. In production, you'd want to store this in a separate table.
 * @param productId - Product ID
 * @param variantId - Variant ID (optional)
 * @param date - Date in YYYY-MM-DD format
 * @param completed - Whether the item is completed
 */
export async function markItemComplete(
  productId: string,
  variantId: string | null,
  date: string,
  completed: boolean
): Promise<boolean> {
  // This is a placeholder. In production, you'd store completion status in a database table.
  // For now, this would be managed client-side only.
  console.log('Mark item complete:', { productId, variantId, date, completed });
  return true;
}
