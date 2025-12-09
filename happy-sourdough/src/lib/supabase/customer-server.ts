import { createClient } from './server';
import type { CustomerProfile, CustomerAddress, Order } from '@/types/database';

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

  return data as CustomerProfile;
}

/**
 * Get all orders for a user (Server Component)
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }

  return (data || []) as Order[];
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

  return (data || []) as CustomerAddress[];
}
