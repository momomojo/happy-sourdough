// Delivery zone utilities for Happy Sourdough
// Reference: happy-sourdough:delivery-zones skill

import type { DeliveryZone } from '@/types/database';

// Default zone configuration (mirrors database)
export const DEFAULT_ZONES: DeliveryZone[] = [
  {
    id: 1,
    name: 'Zone 1 - Downtown',
    min_radius_miles: 0,
    max_radius_miles: 3,
    min_order_amount: 25,
    delivery_fee: 0,
    is_active: true,
  },
  {
    id: 2,
    name: 'Zone 2 - Inner Suburbs',
    min_radius_miles: 3,
    max_radius_miles: 7,
    min_order_amount: 40,
    delivery_fee: 5,
    is_active: true,
  },
  {
    id: 3,
    name: 'Zone 3 - Outer Areas',
    min_radius_miles: 7,
    max_radius_miles: 12,
    min_order_amount: 60,
    delivery_fee: 10,
    is_active: true,
  },
];

/**
 * Get zone by distance in miles from bakery
 */
export function getZoneByDistance(distanceMiles: number): DeliveryZone | null {
  return (
    DEFAULT_ZONES.find(
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
  zone: DeliveryZone,
  subtotal: number
): number {
  // Free delivery if subtotal meets threshold (for Zone 1, always free)
  if (zone.delivery_fee === 0) return 0;

  // Standard fee otherwise
  return zone.delivery_fee;
}

/**
 * Check if order meets minimum for delivery zone
 */
export function meetsMinimumOrder(
  zone: DeliveryZone,
  subtotal: number
): boolean {
  return subtotal >= zone.min_order_amount;
}

/**
 * Get amount needed to reach free delivery (Zone 1 threshold)
 */
export function getAmountForFreeDelivery(subtotal: number): number {
  const freeDeliveryMin = DEFAULT_ZONES[0].min_order_amount;
  return Math.max(0, freeDeliveryMin - subtotal);
}

/**
 * Validate delivery address is within service area
 */
export function isWithinServiceArea(distanceMiles: number): boolean {
  const maxRadius = Math.max(...DEFAULT_ZONES.map((z) => z.max_radius_miles));
  return distanceMiles <= maxRadius;
}

/**
 * Get delivery summary for checkout display
 */
export function getDeliverySummary(
  zone: DeliveryZone | null,
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
    const needed = zone.min_order_amount - subtotal;
    return {
      canDeliver: false,
      fee: zone.delivery_fee,
      message: `Add $${needed.toFixed(2)} more to meet the $${zone.min_order_amount} minimum for ${zone.name}`,
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
  zone: DeliveryZone,
  subtotal: number
): number {
  // Zone 1: Always free
  if (zone.id === 1) return 0;

  // Zone 2: Free over $75
  if (zone.id === 2 && subtotal >= 75) return 0;

  // Zone 3: Free over $100
  if (zone.id === 3 && subtotal >= 100) return 0;

  return zone.delivery_fee;
}

/**
 * Check if subtotal meets minimum for zone
 */
export function isMinimumMet(zone: DeliveryZone, subtotal: number): boolean {
  return meetsMinimumOrder(zone, subtotal);
}

/**
 * Get estimated delivery time for a zone
 * Returns time in minutes
 */
export function getEstimatedDeliveryTime(zone: DeliveryZone): number {
  // Estimate based on zone distance
  // Zone 1 (0-3mi): 30 minutes
  // Zone 2 (3-7mi): 45 minutes
  // Zone 3 (7-12mi): 60 minutes
  const timeMap: Record<number, number> = {
    1: 30,
    2: 45,
    3: 60,
  };

  return timeMap[zone.id] || 30;
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
export function getFreeDeliveryThreshold(zone: DeliveryZone): number | null {
  // Zone 1: Always free
  if (zone.id === 1) return null;

  // Zone 2: Free over $75
  if (zone.id === 2) return 75;

  // Zone 3: Free over $100
  if (zone.id === 3) return 100;

  return null;
}
