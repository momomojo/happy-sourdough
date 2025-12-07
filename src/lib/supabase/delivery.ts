// Delivery data functions for Happy Sourdough
// Handles delivery zones, time slots, and blackout dates

import { createClient } from './client';
import type { DeliveryZone, TimeSlot, FulfillmentType, BlackoutDate } from '@/types/database';

// Re-export types for convenience
export type { BlackoutDate };

/**
 * Get delivery zone by zip code
 * Returns zone info including fees, minimums, and delivery time
 */
export async function getDeliveryZoneByZip(
  zipCode: string
): Promise<DeliveryZone | null> {
  const supabase = createClient();

  // Query delivery_zones table where zip_codes array contains the input zip
  const { data, error } = await supabase
    .from('delivery_zones')
    .select('*')
    .contains('zip_codes', [zipCode])
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching delivery zone:', error);
    return null;
  }

  return data as DeliveryZone;
}

/**
 * Get available time slots for a specific date and fulfillment type
 * Filters by slot availability and type (pickup/delivery/both)
 */
export async function getAvailableTimeSlots(
  date: string,
  type: FulfillmentType
): Promise<TimeSlot[]> {
  const supabase = createClient();

  // Query time slots for the date where:
  // - slot type matches OR is 'both'
  // - is_available is true
  // - current_orders < max_orders
  const { data, error } = await supabase
    .from('time_slots')
    .select('*')
    .eq('date', date)
    .eq('is_available', true)
    .or(`slot_type.eq.${type},slot_type.eq.both`)
    .order('window_start', { ascending: true });

  if (error) {
    console.error('Error fetching time slots:', error);
    return [];
  }

  // Filter slots that still have capacity
  return (data as TimeSlot[]).filter(
    (slot) => slot.current_orders < slot.max_orders
  );
}

/**
 * Get all blackout dates (dates when bakery is closed)
 * Used to disable dates in calendar picker
 */
export async function getBlackoutDates(): Promise<BlackoutDate[]> {
  const supabase = createClient();

  // Get all blackout dates from now onwards
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('blackout_dates')
    .select('*')
    .gte('date', today)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching blackout dates:', error);
    return [];
  }

  return data as BlackoutDate[];
}

/**
 * Check if a specific time slot is still available
 * Returns true if slot exists and has capacity
 */
export async function checkSlotAvailability(
  slotId: string
): Promise<{ available: boolean; slotsRemaining: number }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('time_slots')
    .select('*')
    .eq('id', slotId)
    .eq('is_available', true)
    .single();

  if (error || !data) {
    return { available: false, slotsRemaining: 0 };
  }

  const slot = data as TimeSlot;
  const slotsRemaining = slot.max_orders - slot.current_orders;
  const available = slotsRemaining > 0;

  return { available, slotsRemaining };
}

/**
 * Get time slots for a date range
 * Useful for pre-loading multiple days
 */
export async function getTimeSlotsForRange(
  startDate: string,
  endDate: string,
  type?: FulfillmentType
): Promise<TimeSlot[]> {
  const supabase = createClient();

  let query = supabase
    .from('time_slots')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .eq('is_available', true)
    .order('date', { ascending: true })
    .order('window_start', { ascending: true });

  if (type) {
    query = query.or(`slot_type.eq.${type},slot_type.eq.both`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching time slots for range:', error);
    return [];
  }

  return (data as TimeSlot[]).filter(
    (slot) => slot.current_orders < slot.max_orders
  );
}

/**
 * Reserve a time slot by incrementing current_orders
 * Should be called when order is created
 */
export async function reserveTimeSlot(slotId: string): Promise<boolean> {
  const supabase = createClient();

  // First check availability
  const { available } = await checkSlotAvailability(slotId);
  if (!available) {
    return false;
  }

  // Increment current_orders atomically using RPC
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc('increment_slot_orders', {
    slot_id: slotId,
  });

  if (error) {
    console.error('Error reserving time slot:', error);
    return false;
  }

  return true;
}

/**
 * Release a time slot by decrementing current_orders
 * Should be called when order is cancelled
 */
export async function releaseTimeSlot(slotId: string): Promise<boolean> {
  const supabase = createClient();

  // Decrement current_orders atomically using RPC
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc('decrement_slot_orders', {
    slot_id: slotId,
  });

  if (error) {
    console.error('Error releasing time slot:', error);
    return false;
  }

  return true;
}

/**
 * Get all active delivery zones
 */
export async function getAllDeliveryZones(): Promise<DeliveryZone[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('delivery_zones')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching delivery zones:', error);
    return [];
  }

  return data as DeliveryZone[];
}
