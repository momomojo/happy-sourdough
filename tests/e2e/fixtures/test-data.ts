/**
 * Test data and helpers for E2E tests
 */

export const TEST_USERS = {
  admin: {
    email: 'admin@happysourdough.com',
    password: 'admin123',
  },
  customer: {
    email: 'customer@test.com',
    password: 'customer123',
    name: 'Test Customer',
  },
};

export const STRIPE_TEST_CARDS = {
  success: {
    number: '4242424242424242',
    expiry: '12/34',
    cvc: '123',
    zip: '12345',
  },
  requiresAuth: {
    number: '4000002500003155',
    expiry: '12/34',
    cvc: '123',
    zip: '12345',
  },
  declined: {
    number: '4000000000000002',
    expiry: '12/34',
    cvc: '123',
    zip: '12345',
  },
};

export const TEST_DELIVERY_INFO = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '555-1234',
  address: '123 Main St',
  city: 'San Francisco',
  state: 'CA',
  zip: '94102',
  deliveryNotes: 'Leave at front door',
};

export const PRODUCT_CATEGORIES = [
  'Sourdough Breads',
  'Pastries',
  'Custom Cakes',
  'Specialty Items',
];

/**
 * Helper to format currency for assertions
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Helper to wait for a specific time
 */
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper to generate random email
 */
export function randomEmail(): string {
  const random = Math.random().toString(36).substring(7);
  return `test-${random}@example.com`;
}

/**
 * Helper to generate random order ID
 */
export function randomOrderId(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Expected product structure
 */
export interface TestProduct {
  name: string;
  category: string;
  price: number;
  description?: string;
}

/**
 * Sample products that should exist in seeded database
 */
export const SAMPLE_PRODUCTS: TestProduct[] = [
  {
    name: 'Classic Sourdough',
    category: 'Sourdough Breads',
    price: 8.99,
  },
  {
    name: 'Chocolate Croissant',
    category: 'Pastries',
    price: 4.50,
  },
  {
    name: 'Birthday Cake',
    category: 'Custom Cakes',
    price: 45.00,
  },
];

/**
 * Test order data for order tracking tests
 * Note: These orders must be seeded in the database for tracking tests to work
 */
export const TEST_ORDERS = {
  // Placeholder for seeded test order
  // Uncomment and update when test orders are seeded
  // validOrder: {
  //   orderNumber: 'HS-2024-001',
  //   email: 'test@happysourdough.com',
  // },
};

/**
 * Order status values from the database schema
 */
export const ORDER_STATUSES = [
  'received',
  'confirmed',
  'baking',
  'decorating',
  'quality_check',
  'ready',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'refunded',
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

/**
 * Delivery zones configuration
 */
export const DELIVERY_ZONES = [
  { zone: 1, radius: 3, minOrder: 25, fee: 0 },
  { zone: 2, radius: 7, minOrder: 40, fee: 5 },
  { zone: 3, radius: 12, minOrder: 60, fee: 10 },
];

/**
 * Helper to get delivery fee based on zone
 */
export function getDeliveryFee(zone: number): number {
  const zoneData = DELIVERY_ZONES.find(z => z.zone === zone);
  return zoneData?.fee ?? 0;
}

/**
 * Helper to get minimum order for zone
 */
export function getMinimumOrder(zone: number): number {
  const zoneData = DELIVERY_ZONES.find(z => z.zone === zone);
  return zoneData?.minOrder ?? 0;
}
