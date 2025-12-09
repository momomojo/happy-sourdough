// Delivery zone utilities for Happy Sourdough
// Reference: happy-sourdough:delivery-zones skill

import type { DeliveryZone } from '@/types/database';

// Extended zone info for local calculations (includes radius data not in DB)
export interface ZoneConfig {
  id: string;
  name: string;
  min_radius_miles: number;
  max_radius_miles: number;
  min_order: number;
  delivery_fee: number;
  free_delivery_threshold: number | null;
  is_active: boolean;
}

// Default zone configuration (for when database zones not available)
// Aliased as DEFAULT_ZONES for backward compatibility
export const DEFAULT_ZONE_CONFIGS: ZoneConfig[] = [
  {
    id: 'zone-1',
    name: 'Zone 1 - Downtown',
    min_radius_miles: 0,
    max_radius_miles: 3,
    min_order: 25,
    delivery_fee: 0,
    free_delivery_threshold: null,
    is_active: true,
  },
  {
    id: 'zone-2',
    name: 'Zone 2 - Inner Suburbs',
    min_radius_miles: 3,
    max_radius_miles: 7,
    min_order: 40,
    delivery_fee: 5,
    free_delivery_threshold: 75,
    is_active: true,
  },
  {
    id: 'zone-3',
    name: 'Zone 3 - Outer Areas',
    min_radius_miles: 7,
    max_radius_miles: 12,
    min_order: 60,
    delivery_fee: 10,
    free_delivery_threshold: 100,
    is_active: true,
  },
];

// Backward compatibility alias
export const DEFAULT_ZONES = DEFAULT_ZONE_CONFIGS;

/**
 * Get zone by distance in miles from bakery
 */
export function getZoneByDistance(distanceMiles: number): ZoneConfig | null {
  return (
    DEFAULT_ZONE_CONFIGS.find(
      (zone) =>
        zone.is_active &&
        distanceMiles >= zone.min_radius_miles &&
        distanceMiles < zone.max_radius_miles
    ) ?? null
  );
}

/**
 * Calculate delivery fee for a zone and subtotal
 */
export function calculateDeliveryFee(
  zone: ZoneConfig | DeliveryZone,
  subtotal: number
): number {
  // Free delivery if subtotal meets threshold
  const threshold = 'free_delivery_threshold' in zone ? zone.free_delivery_threshold : null;
  if (threshold && subtotal >= threshold) {
    return 0;
  }

  // Standard fee otherwise
  return zone.delivery_fee;
}

/**
 * Check if order meets minimum for delivery zone
 */
export function meetsMinimumOrder(
  zone: ZoneConfig | DeliveryZone,
  subtotal: number
): boolean {
  return subtotal >= zone.min_order;
}

/**
 * Get amount needed to reach free delivery (Zone 1 threshold)
 */
export function getAmountForFreeDelivery(subtotal: number): number {
  const freeDeliveryMin = DEFAULT_ZONE_CONFIGS[0].min_order;
  return Math.max(0, freeDeliveryMin - subtotal);
}

/**
 * Validate delivery address is within service area
 */
export function isWithinServiceArea(distanceMiles: number): boolean {
  const maxRadius = Math.max(...DEFAULT_ZONE_CONFIGS.map((z) => z.max_radius_miles));
  return distanceMiles <= maxRadius;
}

/**
 * Get delivery summary for checkout display
 */
export function getDeliverySummary(
  zone: ZoneConfig | DeliveryZone | null,
  subtotal: number
): {
  canDeliver: boolean;
  fee: number;
  message: string;
  amountToFreeDelivery: number | null;
} {
  if (!zone) {
    return {
      canDeliver: false,
      fee: 0,
      message: 'Address is outside our delivery area',
      amountToFreeDelivery: null,
    };
  }

  if (!meetsMinimumOrder(zone, subtotal)) {
    const needed = zone.min_order - subtotal;
    return {
      canDeliver: false,
      fee: zone.delivery_fee,
      message: `Add $${needed.toFixed(2)} more to meet the $${zone.min_order} minimum for ${zone.name}`,
      amountToFreeDelivery: null,
    };
  }

  const fee = calculateDeliveryFee(zone, subtotal);
  const amountToFreeDelivery =
    fee > 0 ? getAmountForFreeDelivery(subtotal) : null;

  return {
    canDeliver: true,
    fee,
    message:
      fee === 0
        ? 'Free delivery!'
        : `$${fee.toFixed(2)} delivery fee for ${zone.name}`,
    amountToFreeDelivery,
  };
}

/**
 * Calculate actual delivery fee based on zone and subtotal
 * Applies free delivery thresholds
 */
export function calculateActualDeliveryFee(
  zone: ZoneConfig | DeliveryZone,
  subtotal: number
): number {
  const threshold = 'free_delivery_threshold' in zone ? zone.free_delivery_threshold : null;

  // Free if at or above threshold
  if (threshold && subtotal >= threshold) {
    return 0;
  }

  // Zone 1 type (no fee)
  if (zone.delivery_fee === 0) {
    return 0;
  }

  return zone.delivery_fee;
}

/**
 * Check if subtotal meets minimum for zone
 */
export function isMinimumMet(zone: ZoneConfig | DeliveryZone, subtotal: number): boolean {
  return meetsMinimumOrder(zone, subtotal);
}

/**
 * Get estimated delivery time for a zone
 * Returns time in minutes
 */
export function getEstimatedDeliveryTime(zone: ZoneConfig | DeliveryZone): number {
  // Use DB value if available
  if ('estimated_time_minutes' in zone && zone.estimated_time_minutes) {
    return zone.estimated_time_minutes;
  }

  // Fallback estimates based on zone name
  if (zone.name.includes('Zone 1') || zone.name.includes('Downtown')) {
    return 30;
  }
  if (zone.name.includes('Zone 2') || zone.name.includes('Inner')) {
    return 45;
  }
  if (zone.name.includes('Zone 3') || zone.name.includes('Outer')) {
    return 60;
  }

  return 45; // Default
}

/**
 * Format delivery time for display
 */
export function formatDeliveryTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
}

/**
 * Get free delivery threshold for a zone
 */
export function getFreeDeliveryThreshold(zone: ZoneConfig | DeliveryZone): number | null {
  if ('free_delivery_threshold' in zone) {
    return zone.free_delivery_threshold;
  }
  return null;
}
