import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import OrderConfirmationEmail from '@/lib/email/templates/order-confirmation';
import OrderStatusUpdateEmail from '@/lib/email/templates/order-status-update';
import OrderReadyEmail from '@/lib/email/templates/order-ready';

describe('Email Templates', () => {
  const mockOrderData = {
    orderNumber: 'ORD-12345',
    customerName: 'John Doe',
    items: [
      {
        product_name: 'Sourdough Loaf',
        variant_name: 'Large',
        quantity: 2,
        unit_price: 8.99,
        total_price: 17.98,
      },
      {
        product_name: 'Chocolate Croissant',
        variant_name: null,
        quantity: 4,
        unit_price: 3.50,
        total_price: 14.00,
      },
    ],
    subtotal: 31.98,
    deliveryFee: 5.00,
    tax: 2.96,
    total: 39.94,
  };

  const mockTimeSlot = {
    date: '2024-12-15',
    windowStart: '10:00 AM',
    windowEnd: '12:00 PM',
  };

  describe('OrderConfirmationEmail', () => {
    it('renders with pickup delivery type', () => {
      const { getByText } = render(
        <OrderConfirmationEmail
          {...mockOrderData}
          deliveryType="pickup"
          timeSlot={mockTimeSlot}
        />
      );

      expect(getByText('Thank You for Your Order!')).toBeDefined();
      expect(getByText(/Order #ORD-12345/)).toBeDefined();
      expect(getByText('Hi John Doe,')).toBeDefined();
      expect(getByText('Pickup Information')).toBeDefined();
      expect(getByText('Sourdough Loaf - Large')).toBeDefined();
      expect(getByText('Chocolate Croissant')).toBeDefined();
    });

    it('renders with delivery type', () => {
      const { getByText } = render(
        <OrderConfirmationEmail
          {...mockOrderData}
          deliveryType="delivery"
          deliveryAddress="123 Baker Street, Bakeryville, CA 90210"
          timeSlot={mockTimeSlot}
        />
      );

      expect(getByText('Delivery Information')).toBeDefined();
      expect(getByText('123 Baker Street, Bakeryville, CA 90210')).toBeDefined();
    });

    it('displays correct pricing calculations', () => {
      const { getByText } = render(
        <OrderConfirmationEmail
          {...mockOrderData}
          deliveryType="pickup"
        />
      );

      expect(getByText('$31.98')).toBeDefined(); // subtotal
      expect(getByText('$2.96')).toBeDefined();  // tax
      expect(getByText('$39.94')).toBeDefined(); // total
    });

    it('shows delivery fee when applicable', () => {
      const { getByText } = render(
        <OrderConfirmationEmail
          {...mockOrderData}
          deliveryType="delivery"
          deliveryAddress="123 Baker Street"
        />
      );

      expect(getByText('$5.00')).toBeDefined(); // delivery fee
    });

    it('shows time slot information when provided', () => {
      const { getByText } = render(
        <OrderConfirmationEmail
          {...mockOrderData}
          deliveryType="pickup"
          timeSlot={mockTimeSlot}
        />
      );

      expect(getByText('10:00 AM - 12:00 PM')).toBeDefined();
    });
  });

  describe('OrderStatusUpdateEmail', () => {
    it('renders with confirmed status', () => {
      const { getByText, getAllByText } = render(
        <OrderStatusUpdateEmail
          orderNumber="ORD-12345"
          customerName="John Doe"
          status="confirmed"
          deliveryType="delivery"
        />
      );

      // Order number appears multiple times - check at least one exists
      expect(getAllByText(/ORD-12345/).length).toBeGreaterThan(0);
      expect(getByText('Order Confirmed')).toBeDefined();
    });

    it('renders with baking status', () => {
      const { getByText, getAllByText } = render(
        <OrderStatusUpdateEmail
          orderNumber="ORD-12345"
          customerName="John Doe"
          status="baking"
          deliveryType="pickup"
        />
      );

      expect(getAllByText(/ORD-12345/).length).toBeGreaterThan(0);
      expect(getByText('Baking in Progress')).toBeDefined();
    });

    it('renders with out_for_delivery status', () => {
      const { getByText, getAllByText } = render(
        <OrderStatusUpdateEmail
          orderNumber="ORD-12345"
          customerName="John Doe"
          status="out_for_delivery"
          deliveryType="delivery"
          estimatedTime="2:00 PM - 4:00 PM"
        />
      );

      expect(getAllByText(/ORD-12345/).length).toBeGreaterThan(0);
      // Note: "Out for Delivery" appears in both heading and status
      expect(getAllByText('Out for Delivery').length).toBeGreaterThan(0);
      expect(getByText('On the Way!')).toBeDefined();
    });
  });

  describe('OrderReadyEmail', () => {
    const mockReadyData = {
      orderNumber: 'ORD-12345',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      items: [
        {
          product_name: 'Sourdough Loaf',
          variant_name: 'Large',
          quantity: 2,
        },
      ],
    };

    it('renders for pickup', () => {
      const { getByText } = render(
        <OrderReadyEmail
          {...mockReadyData}
          deliveryType="pickup"
          pickupLocation="Happy Sourdough Bakery, 123 Main St"
        />
      );

      expect(getByText(/ORD-12345/)).toBeDefined();
    });

    it('renders for delivery', () => {
      const { getByText } = render(
        <OrderReadyEmail
          {...mockReadyData}
          deliveryType="delivery"
          deliveryAddress="456 Oak Ave, Springfield, IL 62701"
          deliveryETA="30 minutes"
        />
      );

      expect(getByText(/ORD-12345/)).toBeDefined();
    });

    it('shows item details with quantity', () => {
      const { getByText } = render(
        <OrderReadyEmail
          {...mockReadyData}
          deliveryType="pickup"
        />
      );

      // OrderReadyEmail displays items as "2x Sourdough Loaf - Large"
      expect(getByText(/2x Sourdough Loaf - Large/)).toBeDefined();
    });
  });
});
