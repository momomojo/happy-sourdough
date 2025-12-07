import { createClient } from '../client';
import type { DeliveryZone, TimeSlot } from '@/types/database';

export interface ZoneUpdateData {
  name?: string;
  description?: string | null;
  zip_codes?: string[];
  min_order_amount?: number;
  delivery_fee?: number;
  free_delivery_threshold?: number | null;
  estimated_time_minutes?: number | null;
  is_active?: boolean;
  sort_order?: number;
}

export interface TimeSlotCreateData {
  date: string;
  window_start: string;
  window_end: string;
  slot_type: 'pickup' | 'delivery' | 'both';
  max_orders: number;
}

// Template for bulk slot generation (date is added internally)
export type TimeSlotTemplate = Omit<TimeSlotCreateData, 'date'>;

/**
 * Get all delivery zones
 * @returns Array of all delivery zones, sorted by sort_order
 */
export async function getZones(): Promise<DeliveryZone[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('delivery_zones')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching zones:', error);
    throw new Error('Failed to fetch delivery zones');
  }

  return data as DeliveryZone[];
}

/**
 * Get a single delivery zone by ID
 * @param zoneId - The zone ID
 * @returns The delivery zone
 */
export async function getZoneById(zoneId: string): Promise<DeliveryZone | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('delivery_zones')
    .select('*')
    .eq('id', zoneId)
    .single();

  if (error) {
    console.error('Error fetching zone:', error);
    return null;
  }

  return data as DeliveryZone;
}

/**
 * Update a delivery zone
 * @param zoneId - The zone ID to update
 * @param updates - The fields to update
 * @returns The updated zone
 */
export async function updateZone(
  zoneId: string,
  updates: ZoneUpdateData
): Promise<DeliveryZone> {
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('delivery_zones')
    .update(updates)
    .eq('id', zoneId)
    .select()
    .single();

  if (error) {
    console.error('Error updating zone:', error);
    throw new Error('Failed to update delivery zone');
  }

  return data as DeliveryZone;
}

/**
 * Toggle zone active status
 * @param zoneId - The zone ID to toggle
 * @param isActive - The new active status
 * @returns The updated zone
 */
export async function toggleZoneActive(
  zoneId: string,
  isActive: boolean
): Promise<DeliveryZone> {
  return updateZone(zoneId, { is_active: isActive });
}

/**
 * Create a new delivery zone
 * @param zoneData - The zone data
 * @returns The created zone
 */
export async function createZone(
  zoneData: Omit<ZoneUpdateData, 'is_active'> & { is_active?: boolean }
): Promise<DeliveryZone> {
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('delivery_zones')
    .insert({
      ...zoneData,
      is_active: zoneData.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating zone:', error);
    throw new Error('Failed to create delivery zone');
  }

  return data as DeliveryZone;
}

/**
 * Delete a delivery zone
 * @param zoneId - The zone ID to delete
 */
export async function deleteZone(zoneId: string): Promise<void> {
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('delivery_zones')
    .delete()
    .eq('id', zoneId);

  if (error) {
    console.error('Error deleting zone:', error);
    throw new Error('Failed to delete delivery zone');
  }
}

/**
 * Generate time slots for a date range
 * Creates slots for each date in the range with specified parameters
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @param slots - Array of time slot configurations to create for each date
 * @returns Number of slots created
 */
export async function generateTimeSlots(
  startDate: string,
  endDate: string,
  slots: TimeSlotTemplate[]
): Promise<number> {
  const supabase = createClient();

  // Generate array of dates between start and end
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }

  // Create slot records for each date
  const slotsToCreate: Omit<TimeSlot, 'id' | 'created_at' | 'updated_at'>[] = [];

  dates.forEach((date) => {
    slots.forEach((slot) => {
      slotsToCreate.push({
        date,
        window_start: slot.window_start,
        window_end: slot.window_end,
        slot_type: slot.slot_type,
        max_orders: slot.max_orders,
        current_orders: 0,
        is_available: true,
      });
    });
  });

  // Insert all slots
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('time_slots')
    .insert(slotsToCreate)
    .select();

  if (error) {
    console.error('Error creating time slots:', error);
    throw new Error('Failed to generate time slots');
  }

  return data?.length || 0;
}

/**
 * Get time slots for a specific date
 * @param date - Date in YYYY-MM-DD format
 * @returns Array of time slots for the date
 */
export async function getTimeSlotsForDate(date: string): Promise<TimeSlot[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('time_slots')
    .select('*')
    .eq('date', date)
    .order('window_start', { ascending: true });

  if (error) {
    console.error('Error fetching time slots:', error);
    throw new Error('Failed to fetch time slots');
  }

  return data as TimeSlot[];
}

/**
 * Update a time slot
 * @param slotId - The slot ID
 * @param updates - Fields to update
 * @returns The updated time slot
 */
export async function updateTimeSlot(
  slotId: string,
  updates: Partial<Omit<TimeSlot, 'id' | 'created_at' | 'updated_at'>>
): Promise<TimeSlot> {
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('time_slots')
    .update(updates)
    .eq('id', slotId)
    .select()
    .single();

  if (error) {
    console.error('Error updating time slot:', error);
    throw new Error('Failed to update time slot');
  }

  return data as TimeSlot;
}

/**
 * Delete time slots for a date range
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Number of slots deleted
 */
export async function deleteTimeSlotsForRange(
  startDate: string,
  endDate: string
): Promise<number> {
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('time_slots')
    .delete()
    .gte('date', startDate)
    .lte('date', endDate)
    .select();

  if (error) {
    console.error('Error deleting time slots:', error);
    throw new Error('Failed to delete time slots');
  }

  return data?.length || 0;
}
