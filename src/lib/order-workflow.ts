// Order workflow utilities for Happy Sourdough
// Reference: happy-sourdough:order-workflow skill

import type { OrderStatus } from '@/types/database';

/**
 * Valid status transitions map
 * Each status maps to the statuses it can transition to
 */
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  received: ['confirmed', 'cancelled'],
  confirmed: ['baking', 'cancelled', 'refunded'],
  baking: ['decorating', 'quality_check', 'cancelled'],
  decorating: ['quality_check', 'cancelled'],
  quality_check: ['ready', 'baking'], // Can go back to baking for rework
  ready: ['out_for_delivery', 'picked_up', 'cancelled'], // picked_up for pickup, out_for_delivery for delivery
  out_for_delivery: ['delivered', 'ready'], // ready = return to store
  delivered: ['refunded'],
  picked_up: ['refunded'], // Terminal state (can still be refunded)
  cancelled: [], // Terminal state
  refunded: [], // Terminal state
};

/**
 * Status display configuration
 */
export const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    description: string;
    color: string;
    icon: string;
  }
> = {
  received: {
    label: 'Order Received',
    description: 'Your order has been received and is awaiting confirmation',
    color: 'bg-blue-100 text-blue-800',
    icon: 'inbox',
  },
  confirmed: {
    label: 'Confirmed',
    description: 'Your order has been confirmed and scheduled for production',
    color: 'bg-indigo-100 text-indigo-800',
    icon: 'check-circle',
  },
  baking: {
    label: 'Baking',
    description: 'Your items are being freshly baked',
    color: 'bg-orange-100 text-orange-800',
    icon: 'flame',
  },
  decorating: {
    label: 'Decorating',
    description: 'Adding the finishing touches to your order',
    color: 'bg-pink-100 text-pink-800',
    icon: 'sparkles',
  },
  quality_check: {
    label: 'Quality Check',
    description: 'Ensuring everything meets our standards',
    color: 'bg-purple-100 text-purple-800',
    icon: 'clipboard-check',
  },
  ready: {
    label: 'Ready',
    description: 'Your order is ready for pickup or delivery',
    color: 'bg-green-100 text-green-800',
    icon: 'package',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    description: 'Your order is on its way to you',
    color: 'bg-cyan-100 text-cyan-800',
    icon: 'truck',
  },
  delivered: {
    label: 'Delivered',
    description: 'Your order has been delivered. Enjoy!',
    color: 'bg-emerald-100 text-emerald-800',
    icon: 'check',
  },
  picked_up: {
    label: 'Picked Up',
    description: 'Your order has been picked up. Enjoy!',
    color: 'bg-emerald-100 text-emerald-800',
    icon: 'check',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'This order has been cancelled',
    color: 'bg-gray-100 text-gray-800',
    icon: 'x-circle',
  },
  refunded: {
    label: 'Refunded',
    description: 'This order has been refunded',
    color: 'bg-red-100 text-red-800',
    icon: 'rotate-ccw',
  },
};

/**
 * Check if a status transition is valid
 */
export function canTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  return STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}

/**
 * Get valid next statuses for an order
 */
export function getNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return STATUS_TRANSITIONS[currentStatus];
}

/**
 * Check if status is terminal (no further transitions)
 */
export function isTerminalStatus(status: OrderStatus): boolean {
  return STATUS_TRANSITIONS[status].length === 0;
}

/**
 * Check if order can be cancelled
 */
export function canCancel(status: OrderStatus): boolean {
  return STATUS_TRANSITIONS[status].includes('cancelled');
}

/**
 * Check if order can be refunded
 */
export function canRefund(status: OrderStatus): boolean {
  return STATUS_TRANSITIONS[status].includes('refunded');
}

/**
 * Get status display info
 */
export function getStatusInfo(status: OrderStatus) {
  return STATUS_CONFIG[status];
}

/**
 * Calculate order progress percentage (for progress bar)
 */
export function getOrderProgress(status: OrderStatus): number {
  const progressMap: Record<OrderStatus, number> = {
    received: 10,
    confirmed: 20,
    baking: 40,
    decorating: 60,
    quality_check: 70,
    ready: 85,
    out_for_delivery: 95,
    delivered: 100,
    picked_up: 100,
    cancelled: 0,
    refunded: 0,
  };
  return progressMap[status];
}

/**
 * Get estimated time remaining based on status
 */
export function getEstimatedTimeRemaining(
  status: OrderStatus,
  deliveryType: 'pickup' | 'delivery'
): string | null {
  if (isTerminalStatus(status) || status === 'delivered') {
    return null;
  }

  const estimates: Record<OrderStatus, string> = {
    received: '2-3 hours',
    confirmed: '1.5-2.5 hours',
    baking: '45-90 minutes',
    decorating: '30-60 minutes',
    quality_check: '15-30 minutes',
    ready: deliveryType === 'pickup' ? 'Ready now' : '30-45 minutes',
    out_for_delivery: '15-30 minutes',
    delivered: '',
    picked_up: '',
    cancelled: '',
    refunded: '',
  };

  return estimates[status];
}

/**
 * Validate status transition and return error if invalid
 */
export function validateTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): { valid: boolean; error?: string } {
  if (currentStatus === newStatus) {
    return { valid: false, error: 'Order is already in this status' };
  }

  if (isTerminalStatus(currentStatus)) {
    return {
      valid: false,
      error: `Cannot change status of ${currentStatus} orders`,
    };
  }

  if (!canTransition(currentStatus, newStatus)) {
    return {
      valid: false,
      error: `Cannot transition from ${currentStatus} to ${newStatus}`,
    };
  }

  return { valid: true };
}
