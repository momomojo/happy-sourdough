/**
 * Server-side pickup location functions
 * For client-side usage, import from '@/lib/pickup-locations.client'
 */
import { createClient } from '@/lib/supabase/server';
import type { PickupLocation } from '@/types/database';

/**
 * Get all active pickup locations (for customers)
 * Ordered by sort_order
 */
export async function getActivePickupLocations(): Promise<PickupLocation[]> {
    const supabase = await createClient();

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
 * Get ALL pickup locations (for admin)
 * Ordered by sort_order
 */
export async function getAllPickupLocations(): Promise<PickupLocation[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('pickup_locations')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching all pickup locations:', error);
        return [];
    }

    return data || [];
}

/**
 * Get a single pickup location by ID
 */
export async function getPickupLocation(id: string): Promise<PickupLocation | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('pickup_locations')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching pickup location ${id}:`, error);
        return null;
    }

    return data;
}

/**
 * Create a new pickup location (Admin only)
 */
export type PickupLocationInsert = Omit<PickupLocation, 'id' | 'created_at' | 'updated_at'>;

export async function createPickupLocation(location: PickupLocationInsert): Promise<{ success: boolean; data?: PickupLocation; error?: string }> {
    const supabase = await createClient();

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
 * Update a pickup location (Admin only)
 */
export async function updatePickupLocation(id: string, updates: Partial<PickupLocation>): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

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
 * Delete a pickup location (Admin only)
 */
export async function deletePickupLocation(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

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
