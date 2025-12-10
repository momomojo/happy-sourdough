import { createClient as createBrowserClient } from './client';
import type { CustomerProfile, CustomerAddress } from '@/types/database';

/**
 * Update customer profile
 */
export async function updateCustomerProfile(
  userId: string,
  updates: Partial<Omit<CustomerProfile, 'id' | 'created_at' | 'updated_at'>>
): Promise<CustomerProfile | null> {
  const supabase = createBrowserClient();

  // Note: `as never` cast is required for Supabase SSR client type inference
  const { data, error } = await supabase
    .from('customer_profiles')
    .update(updates as never)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating customer profile:', error);
    return null;
  }

  return data as CustomerProfile;
}

/**
 * Get all saved addresses for a user (Client)
 */
export async function getUserAddressesClient(userId: string): Promise<CustomerAddress[]> {
  const supabase = createBrowserClient();

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

/**
 * Add a new address
 */
export async function addAddress(
  address: Omit<CustomerAddress, 'id' | 'created_at'>
): Promise<CustomerAddress | null> {
  const supabase = createBrowserClient();

  // If this is the default address, unset all other defaults first
  if (address.is_default) {
    await supabase
      .from('customer_addresses')
      .update({ is_default: false } as never)
      .eq('user_id', address.user_id);
  }

  // Note: `as never` cast is required for Supabase SSR client type inference
  const { data, error } = await supabase
    .from('customer_addresses')
    .insert(address as never)
    .select()
    .single();

  if (error) {
    console.error('Error adding address:', error);
    return null;
  }

  return data as CustomerAddress;
}

/**
 * Update an address
 */
export async function updateAddress(
  id: string,
  userId: string,
  updates: Partial<Omit<CustomerAddress, 'id' | 'user_id' | 'created_at'>>
): Promise<CustomerAddress | null> {
  const supabase = createBrowserClient();

  // If setting as default, unset all other defaults first
  if (updates.is_default) {
    await supabase
      .from('customer_addresses')
      .update({ is_default: false } as never)
      .eq('user_id', userId);
  }

  // Note: `as never` cast is required for Supabase SSR client type inference
  const { data, error } = await supabase
    .from('customer_addresses')
    .update(updates as never)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating address:', error);
    return null;
  }

  return data as CustomerAddress;
}

/**
 * Delete an address
 */
export async function deleteAddress(id: string, userId: string): Promise<boolean> {
  const supabase = createBrowserClient();

  const { error } = await supabase
    .from('customer_addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting address:', error);
    return false;
  }

  return true;
}
