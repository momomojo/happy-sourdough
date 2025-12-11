import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the resend module before importing the send functions
vi.mock('@/lib/email/resend', () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
  EMAIL_CONFIG: {
    from: 'Happy Sourdough <orders@happysourdough.com>',
    replyTo: 'support@happysourdough.com',
  },
}));

// Import after mocking
import {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendOrderReadyEmail,
  type OrderEmailData,
} from '@/lib/email/send';
import { resend } from '@/lib/email/resend';

describe('Email Send Functions', () => {
  const mockSendResponse = {
    data: { id: 'email-123' },
    error: null,
  };

  const mockOrderData: OrderEmailData = {
    orderNumber: 'ORD-12345',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    items: [
      {
        product_name: 'Sourdough Loaf',
        variant_name: 'Large',
        quantity: 2,
        unit_price: 8.99,
        total_price: 17.98,
      },
    ],
    subtotal: 17.98,
    deliveryFee: 5.00,
    tax: 1.84,
    total: 24.82,
    deliveryType: 'pickup',
    timeSlot: {
      date: '2024-12-15',
      windowStart: '10:00 AM',
      windowEnd: '12:00 PM',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (resend.emails.send as ReturnType<typeof vi.fn>).mockResolvedValue(mockSendResponse);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('sendOrderConfirmationEmail', () => {
    it('sends confirmation email with correct data', async () => {
      const result = await sendOrderConfirmationEmail(mockOrderData);

      expect(resend.emails.send).toHaveBeenCalledTimes(1);
      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Happy Sourdough <orders@happysourdough.com>',
          to: 'john@example.com',
          subject: 'Order Confirmation - Order #ORD-12345',
        })
      );
      expect(result).toEqual({ id: 'email-123' });
    });

    it('handles delivery type correctly', async () => {
      const deliveryData = {
        ...mockOrderData,
        deliveryType: 'delivery' as const,
        deliveryAddress: '123 Baker Street, Bakeryville, CA 90210',
      };

      await sendOrderConfirmationEmail(deliveryData);

      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
          subject: 'Order Confirmation - Order #ORD-12345',
        })
      );
    });

    it('throws error when email send fails', async () => {
      const errorResponse = {
        data: null,
        error: { message: 'Failed to send email' },
      };
      (resend.emails.send as ReturnType<typeof vi.fn>).mockResolvedValue(errorResponse);

      await expect(sendOrderConfirmationEmail(mockOrderData)).rejects.toThrow();
    });

    it('throws error when Resend API throws', async () => {
      (resend.emails.send as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error')
      );

      await expect(sendOrderConfirmationEmail(mockOrderData)).rejects.toThrow('Network error');
    });
  });

  describe('sendOrderStatusUpdateEmail', () => {
    const statusUpdateData = {
      orderNumber: 'ORD-12345',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      deliveryType: 'pickup' as const,
      status: 'confirmed' as const,
    };

    it('sends status update email with correct data', async () => {
      const result = await sendOrderStatusUpdateEmail(statusUpdateData);

      expect(resend.emails.send).toHaveBeenCalledTimes(1);
      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Happy Sourdough <orders@happysourdough.com>',
          to: 'john@example.com',
          subject: 'Order Update - Order #ORD-12345',
        })
      );
      expect(result).toEqual({ id: 'email-123' });
    });

    it('includes estimated time when provided', async () => {
      const dataWithETA = {
        ...statusUpdateData,
        status: 'out_for_delivery' as const,
        estimatedTime: '2:00 PM - 4:00 PM',
      };

      await sendOrderStatusUpdateEmail(dataWithETA);

      expect(resend.emails.send).toHaveBeenCalledTimes(1);
    });

    it('handles different status types', async () => {
      const statuses = ['baking', 'decorating', 'quality_check', 'ready', 'delivered'] as const;

      for (const status of statuses) {
        vi.clearAllMocks();
        (resend.emails.send as ReturnType<typeof vi.fn>).mockResolvedValue(mockSendResponse);

        await sendOrderStatusUpdateEmail({
          ...statusUpdateData,
          status,
        });

        expect(resend.emails.send).toHaveBeenCalledTimes(1);
      }
    });

    it('throws error when email send fails', async () => {
      const errorResponse = {
        data: null,
        error: { message: 'Rate limit exceeded' },
      };
      (resend.emails.send as ReturnType<typeof vi.fn>).mockResolvedValue(errorResponse);

      await expect(sendOrderStatusUpdateEmail(statusUpdateData)).rejects.toThrow();
    });
  });

  describe('sendOrderReadyEmail', () => {
    const readyEmailData = {
      orderNumber: 'ORD-12345',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      deliveryType: 'pickup' as const,
      items: [
        {
          product_name: 'Sourdough Loaf',
          variant_name: 'Large',
          quantity: 2,
        },
      ],
      pickupLocation: 'Happy Sourdough Bakery, 123 Main St',
    };

    it('sends ready email with correct data for pickup', async () => {
      const result = await sendOrderReadyEmail(readyEmailData);

      expect(resend.emails.send).toHaveBeenCalledTimes(1);
      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Happy Sourdough <orders@happysourdough.com>',
          to: 'john@example.com',
          subject: 'Your Order is Ready! - Order #ORD-12345',
        })
      );
      expect(result).toEqual({ id: 'email-123' });
    });

    it('sends ready email with correct data for delivery', async () => {
      const deliveryData = {
        ...readyEmailData,
        deliveryType: 'delivery' as const,
        deliveryAddress: '456 Oak Ave, Springfield, IL 62701',
        deliveryETA: '30 minutes',
        pickupLocation: undefined,
      };

      await sendOrderReadyEmail(deliveryData);

      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Your Order is Ready! - Order #ORD-12345',
        })
      );
    });

    it('includes time slot when provided', async () => {
      const dataWithTimeSlot = {
        ...readyEmailData,
        timeSlot: {
          date: '2024-12-15',
          windowStart: '10:00 AM',
          windowEnd: '12:00 PM',
        },
      };

      await sendOrderReadyEmail(dataWithTimeSlot);

      expect(resend.emails.send).toHaveBeenCalledTimes(1);
    });

    it('throws error when email send fails', async () => {
      const errorResponse = {
        data: null,
        error: { message: 'Invalid email address' },
      };
      (resend.emails.send as ReturnType<typeof vi.fn>).mockResolvedValue(errorResponse);

      await expect(sendOrderReadyEmail(readyEmailData)).rejects.toThrow();
    });
  });
});
