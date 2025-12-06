// Checkout-specific types for Happy Sourdough

export interface DeliveryAddress {
  street: string;
  apt?: string;
  city: string;
  state: string;
  zip: string;
}

export interface CheckoutFormData {
  // Customer info
  email: string;
  fullName: string;
  phone: string;

  // Delivery/Pickup
  fulfillmentType: 'delivery' | 'pickup';
  deliveryAddress?: DeliveryAddress;
  deliveryInstructions?: string;
  deliveryDate: string;
  deliveryWindow: string;

  // Payment
  saveCard: boolean;

  // Optional
  specialInstructions?: string;
}

export interface CheckoutStep {
  id: 'cart' | 'delivery' | 'payment';
  label: string;
  description: string;
}

export const CHECKOUT_STEPS: CheckoutStep[] = [
  {
    id: 'cart',
    label: 'Review Cart',
    description: 'Review your items',
  },
  {
    id: 'delivery',
    label: 'Delivery Details',
    description: 'Where and when',
  },
  {
    id: 'payment',
    label: 'Payment',
    description: 'Complete your order',
  },
];
