import { createClient } from '@/lib/supabase/client';
import type { PickupLocation } from '@/types/database';

/**
 * Get active pickup locations (Client-side)
 */
export async function getActivePickupLocationsClient(): Promise<PickupLocation[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('pickup_locations')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching pickup locations:', error);
        return [];
    }

    return data || [];
}

/**
 * Create a new pickup location (Admin only - Client side)
 */
export type PickupLocationInsert = Omit<PickupLocation, 'id' | 'created_at' | 'updated_at'>;

export async function createPickupLocation(location: PickupLocationInsert): Promise<{ success: boolean; data?: PickupLocation; error?: string }> {
    const supabase = createClient();

    try {
        const { data, error } = await supabase
            .from('pickup_locations')
            .insert(location)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (err) {
        console.error('Error creating pickup location:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}

/**
 * Update a pickup location (Admin only - Client side)
 */
export async function updatePickupLocation(id: string, updates: Partial<PickupLocation>): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    try {
        const { error } = await supabase
            .from('pickup_locations')
            .update(updates)
            .eq('id', id);

        if (error) throw error;

        return { success: true };
    } catch (err) {
        console.error('Error updating pickup location:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}

/**
 * Delete a pickup location (Admin only - Client side)
 */
export async function deletePickupLocation(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    try {
        const { error } = await supabase
            .from('pickup_locations')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return { success: true };
    } catch (err) {
        console.error('Error deleting pickup location:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}
