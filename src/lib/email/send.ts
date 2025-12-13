import { resend, EMAIL_CONFIG } from './resend';
import OrderConfirmationEmail from './templates/order-confirmation';
import OrderStatusUpdateEmail from './templates/order-status-update';
import OrderReadyEmail from './templates/order-ready';
import { getBusinessInfo, getOperatingHours, formatOperatingHours, getEmailTemplates } from '@/lib/business-settings';
import type { OrderStatus } from '@/types/database';

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    product_name: string;
    variant_name: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  timeSlot?: {
    date: string;
    windowStart: string;
    windowEnd: string;
  };
}

/**
 * Send order confirmation email after successful checkout
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    // Fetch business settings and email templates
    const [businessInfo, emailTemplates] = await Promise.all([
      getBusinessInfo(),
      getEmailTemplates(),
    ]);

    // Replace {phone} placeholder in footer
    const footerMessage = emailTemplates.confirmation_footer.replace(
      '{phone}',
      businessInfo.business_phone
    );

    const { data: emailData, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.customerEmail,
      subject: `Order Confirmation - Order #${data.orderNumber}`,
      react: OrderConfirmationEmail({
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        items: data.items,
        subtotal: data.subtotal,
        deliveryFee: data.deliveryFee,
        tax: data.tax,
        total: data.total,
        deliveryType: data.deliveryType,
        deliveryAddress: data.deliveryAddress,
        pickupLocation: businessInfo.business_address,
        businessEmail: businessInfo.business_email,
        businessName: businessInfo.business_name,
        headerMessage: emailTemplates.confirmation_header,
        footerMessage,
        timeSlot: data.timeSlot,
        estimatedTime: data.timeSlot
          ? `${data.timeSlot.windowStart} - ${data.timeSlot.windowEnd}`
          : undefined,
      }),
    });

    if (error) {
      console.error('Error sending order confirmation email:', error);
      throw error;
    }

    console.log('Order confirmation email sent:', emailData?.id);
    return emailData;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    throw error;
  }
}

/**
 * Send order status update email when order status changes
 */
export async function sendOrderStatusUpdateEmail(
  data: Pick<OrderEmailData, 'orderNumber' | 'customerName' | 'customerEmail' | 'deliveryType'> & {
    status: OrderStatus;
    estimatedTime?: string;
  }
) {
  try {
    // Fetch business settings
    const businessInfo = await getBusinessInfo();
    const operatingHours = await getOperatingHours();
    const businessHours = formatOperatingHours(operatingHours);

    const { data: emailData, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.customerEmail,
      subject: `Order Update - Order #${data.orderNumber}`,
      react: OrderStatusUpdateEmail({
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        status: data.status,
        estimatedTime: data.estimatedTime,
        deliveryType: data.deliveryType,
        pickupLocation: businessInfo.business_address,
        businessHours,
        businessEmail: businessInfo.business_email,
      }),
    });

    if (error) {
      console.error('Error sending order status update email:', error);
      throw error;
    }

    console.log('Order status update email sent:', emailData?.id);
    return emailData;
  } catch (error) {
    console.error('Failed to send order status update email:', error);
    throw error;
  }
}

/**
 * Send order ready email when order is ready for pickup or delivery
 */
export async function sendOrderReadyEmail(
  data: Pick<OrderEmailData, 'orderNumber' | 'customerName' | 'customerEmail' | 'deliveryType' | 'deliveryAddress' | 'timeSlot'> & {
    items: Array<{
      product_name: string;
      variant_name: string | null;
      quantity: number;
    }>;
    deliveryETA?: string;
    pickupLocation?: string;
  }
) {
  try {
    // Fetch business settings
    const businessInfo = await getBusinessInfo();
    const operatingHours = await getOperatingHours();
    const businessHours = formatOperatingHours(operatingHours);

    const { data: emailData, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.customerEmail,
      subject: `Your Order is Ready! - Order #${data.orderNumber}`,
      react: OrderReadyEmail({
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        deliveryType: data.deliveryType,
        items: data.items,
        deliveryAddress: data.deliveryAddress,
        deliveryETA: data.deliveryETA,
        pickupLocation: data.pickupLocation || businessInfo.business_address,
        businessHours,
        businessPhone: businessInfo.business_phone,
        businessEmail: businessInfo.business_email,
        timeSlot: data.timeSlot,
      }),
    });

    if (error) {
      console.error('Error sending order ready email:', error);
      throw error;
    }

    console.log('Order ready email sent:', emailData?.id);
    return emailData;
  } catch (error) {
    console.error('Failed to send order ready email:', error);
    throw error;
  }
}
