import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

type OrderStatus =
  | 'received'
  | 'confirmed'
  | 'baking'
  | 'decorating'
  | 'quality_check'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'picked_up'
  | 'cancelled'
  | 'refunded';

interface OrderStatusUpdateEmailProps {
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  estimatedTime?: string;
  deliveryType: 'pickup' | 'delivery';
  pickupLocation?: string;
  businessHours?: string;
  businessEmail?: string;
}

const STATUS_INFO: Record<
  OrderStatus,
  {
    title: string;
    description: string;
    emoji: string;
  }
> = {
  received: {
    title: 'Order Received',
    description: "We've received your order and it's in our queue!",
    emoji: '📝',
  },
  confirmed: {
    title: 'Order Confirmed',
    description: 'Your payment has been confirmed and your order is being prepared.',
    emoji: '✅',
  },
  baking: {
    title: 'Baking in Progress',
    description: 'Our bakers are hard at work making your fresh goods!',
    emoji: '🍞',
  },
  decorating: {
    title: 'Decorating Your Order',
    description: 'Adding the finishing touches to make it perfect.',
    emoji: '🎨',
  },
  quality_check: {
    title: 'Quality Check',
    description: 'Making sure everything meets our high standards.',
    emoji: '✨',
  },
  ready: {
    title: 'Ready for Pickup/Delivery',
    description: 'Your order is ready! Check your email for pickup/delivery details.',
    emoji: '🎉',
  },
  out_for_delivery: {
    title: 'Out for Delivery',
    description: 'Your order is on its way to you!',
    emoji: '🚚',
  },
  delivered: {
    title: 'Delivered',
    description: 'Your order has been delivered. Enjoy!',
    emoji: '🎊',
  },
  picked_up: {
    title: 'Picked Up',
    description: 'Your order has been picked up. Enjoy!',
    emoji: '🎊',
  },
  cancelled: {
    title: 'Order Cancelled',
    description: 'Your order has been cancelled.',
    emoji: '❌',
  },
  refunded: {
    title: 'Order Refunded',
    description: 'Your order has been refunded.',
    emoji: '💰',
  },
};

export const OrderStatusUpdateEmail = ({
  orderNumber,
  customerName,
  status,
  estimatedTime,
  deliveryType,
  pickupLocation = '123 Bakery Lane, San Francisco, CA 94102',
  businessHours = 'Monday-Saturday, 7am-7pm',
  businessEmail = 'support@happysourdough.com',
}: OrderStatusUpdateEmailProps) => {
  const statusInfo = STATUS_INFO[status];
  const previewText = `${statusInfo.title} - Order ${orderNumber}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={emojiSection}>
            <Text style={emoji}>{statusInfo.emoji}</Text>
          </Section>

          <Heading style={h1}>{statusInfo.title}</Heading>

          <Text style={text}>
            Hi {customerName},
          </Text>

          <Text style={text}>
            Great news! Your order status has been updated.
          </Text>

          <Section style={orderBox}>
            <Text style={orderNumberStyle}>
              Order #{orderNumber}
            </Text>
            <Text style={statusText}>
              Status: {statusInfo.title}
            </Text>
          </Section>

          <Section style={infoBox}>
            <Text style={descriptionText}>
              {statusInfo.description}
            </Text>

            {estimatedTime && (
              <Text style={estimatedTimeText}>
                {status === 'out_for_delivery' && 'Estimated arrival: '}
                {status === 'ready' && deliveryType === 'pickup' && 'You can pick up your order: '}
                {status === 'ready' && deliveryType === 'delivery' && 'Estimated delivery: '}
                {status === 'baking' && 'Estimated completion: '}
                {estimatedTime}
              </Text>
            )}
          </Section>

          {status === 'ready' && deliveryType === 'pickup' && (
            <Section style={highlightBox}>
              <Heading as="h2" style={h2}>
                Ready for Pickup
              </Heading>
              <Text style={text}>
                Your order is ready! Please pick it up during our business hours:
              </Text>
              <Text style={text}>
                <strong>Happy Sourdough Bakery</strong>
                <br />
                {pickupLocation}
                <br />
                <br />
                Hours: {businessHours}
              </Text>
            </Section>
          )}

          {status === 'out_for_delivery' && (
            <Section style={highlightBox}>
              <Heading as="h2" style={h2}>
                On the Way!
              </Heading>
              <Text style={text}>
                Our delivery driver is on the way to you. Please ensure someone is available
                to receive the order.
              </Text>
            </Section>
          )}

          {status === 'delivered' && (
            <Section style={highlightBox}>
              <Heading as="h2" style={h2}>
                Enjoy Your Fresh Baked Goods!
              </Heading>
              <Text style={text}>
                Thank you for choosing Happy Sourdough. We hope you enjoy your order!
                We&apos;d love to hear your feedback.
              </Text>
            </Section>
          )}

          {(status === 'cancelled' || status === 'refunded') && (
            <Section style={highlightBox}>
              <Text style={text}>
                If you have any questions about this {status === 'cancelled' ? 'cancellation' : 'refund'},
                please contact us at support@happysourdough.com
              </Text>
            </Section>
          )}

          <Hr style={hr} />

          <Text style={footer}>
            Questions? Contact us at {businessEmail}
          </Text>

          <Text style={footer}>
            Happy Sourdough - Fresh Baked with Love
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderStatusUpdateEmail;

// Styles with Happy Sourdough branding
const main = {
  backgroundColor: '#FDF8F3', // Cream background
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const emojiSection = {
  textAlign: 'center' as const,
  margin: '20px 0',
};

const emoji = {
  fontSize: '64px',
  margin: '0',
};

const h1 = {
  color: '#2C1810', // Espresso brown
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '20px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#2C1810', // Espresso brown
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const orderBox = {
  backgroundColor: '#F5A623', // Honey gold
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const orderNumberStyle = {
  color: '#2C1810',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const statusText = {
  color: '#2C1810',
  fontSize: '18px',
  margin: '0',
};

const infoBox = {
  padding: '24px',
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  margin: '20px 0',
  border: '2px solid #F5A623',
};

const descriptionText = {
  color: '#333',
  fontSize: '18px',
  lineHeight: '28px',
  margin: '0',
  textAlign: 'center' as const,
};

const estimatedTimeText = {
  color: '#D97E3C', // Crust orange
  fontSize: '16px',
  fontWeight: '600',
  margin: '16px 0 0 0',
  textAlign: 'center' as const,
};

const highlightBox = {
  padding: '24px',
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  margin: '20px 0',
  border: '1px solid #E8D5C4',
};

const hr = {
  borderColor: '#E8D5C4',
  margin: '30px 0',
};

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  margin: '20px 0',
};
