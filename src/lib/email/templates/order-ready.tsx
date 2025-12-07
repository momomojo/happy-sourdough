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
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface OrderItem {
  product_name: string;
  variant_name: string | null;
  quantity: number;
}

interface OrderReadyEmailProps {
  orderNumber: string;
  customerName: string;
  deliveryType: 'pickup' | 'delivery';
  items: OrderItem[];
  pickupLocation?: string;
  deliveryAddress?: string;
  deliveryETA?: string;
  timeSlot?: {
    date: string;
    windowStart: string;
    windowEnd: string;
  };
}

export const OrderReadyEmail = ({
  orderNumber,
  customerName,
  deliveryType,
  items,
  pickupLocation = '123 Main Street, Bakery Town, CA 94000',
  deliveryAddress,
  deliveryETA,
  timeSlot,
}: OrderReadyEmailProps) => {
  const previewText = `Your order is ready for ${deliveryType === 'pickup' ? 'pickup' : 'delivery'}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={emojiSection}>
            <Text style={emoji}>
              {deliveryType === 'pickup' ? '🎉' : '🚚'}
            </Text>
          </Section>

          <Heading style={h1}>
            Your Order is Ready!
          </Heading>

          <Text style={text}>
            Hi {customerName},
          </Text>

          <Text style={text}>
            Great news! Your order is ready and waiting for you.
          </Text>

          <Section style={orderBox}>
            <Text style={orderNumberStyle}>
              Order #{orderNumber}
            </Text>
          </Section>

          {deliveryType === 'pickup' ? (
            <Section style={highlightBox}>
              <Heading as="h2" style={h2}>
                Pickup Information
              </Heading>

              <Text style={boldText}>
                Your order is ready for pickup at:
              </Text>

              <Section style={locationBox}>
                <Text style={locationText}>
                  <strong>Happy Sourdough Bakery</strong>
                </Text>
                <Text style={locationText}>
                  {pickupLocation}
                </Text>
              </Section>

              {timeSlot && (
                <>
                  <Text style={boldText}>
                    Scheduled Pickup Time:
                  </Text>
                  <Text style={timeText}>
                    {new Date(timeSlot.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text style={timeText}>
                    {timeSlot.windowStart} - {timeSlot.windowEnd}
                  </Text>
                </>
              )}

              <Section style={hoursBox}>
                <Text style={hoursTitle}>
                  Business Hours:
                </Text>
                <Text style={hoursText}>
                  Monday - Saturday: 7:00 AM - 7:00 PM
                  <br />
                  Sunday: 8:00 AM - 5:00 PM
                </Text>
              </Section>

              <Text style={instructionText}>
                Please bring your order number when picking up.
              </Text>
            </Section>
          ) : (
            <Section style={highlightBox}>
              <Heading as="h2" style={h2}>
                Delivery Information
              </Heading>

              <Text style={boldText}>
                Your order is on its way to:
              </Text>

              <Section style={locationBox}>
                <Text style={locationText}>
                  {deliveryAddress}
                </Text>
              </Section>

              {deliveryETA && (
                <>
                  <Text style={boldText}>
                    Estimated Delivery Time:
                  </Text>
                  <Text style={etaText}>
                    {deliveryETA}
                  </Text>
                </>
              )}

              {timeSlot && (
                <>
                  <Text style={boldText}>
                    Delivery Window:
                  </Text>
                  <Text style={timeText}>
                    {new Date(timeSlot.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text style={timeText}>
                    {timeSlot.windowStart} - {timeSlot.windowEnd}
                  </Text>
                </>
              )}

              <Text style={instructionText}>
                Please ensure someone is available to receive the delivery.
              </Text>
            </Section>
          )}

          <Section style={itemsSection}>
            <Heading as="h2" style={h2}>
              Your Order
            </Heading>

            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column>
                  <Text style={itemText}>
                    {item.quantity}x {item.product_name}
                    {item.variant_name && ` - ${item.variant_name}`}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Section style={tipsSection}>
            <Text style={tipsTitle}>
              Storage Tips:
            </Text>
            <Text style={tipsText}>
              • Store bread at room temperature in a paper bag or bread box
              <br />
              • For longer storage, slice and freeze for up to 3 months
              <br />
              • Pastries are best enjoyed the same day
              <br />
              • Custom cakes should be refrigerated if not served immediately
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Questions about your order? Contact us at support@happysourdough.com
            or call (555) 123-4567
          </Text>

          <Text style={footer}>
            Happy Sourdough - Fresh Baked with Love
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderReadyEmail;

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
  margin: '0 0 20px 0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const boldText = {
  color: '#2C1810',
  fontSize: '16px',
  fontWeight: '600',
  margin: '20px 0 8px 0',
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
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
};

const highlightBox = {
  padding: '32px',
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  margin: '20px 0',
  border: '2px solid #F5A623',
};

const locationBox = {
  backgroundColor: '#FDF8F3',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const locationText = {
  color: '#2C1810',
  fontSize: '18px',
  lineHeight: '28px',
  margin: '4px 0',
};

const timeText = {
  color: '#2C1810',
  fontSize: '18px',
  lineHeight: '28px',
  margin: '4px 0',
};

const etaText = {
  color: '#D97E3C', // Crust orange
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '12px 0',
};

const hoursBox = {
  backgroundColor: '#FDF8F3',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
};

const hoursTitle = {
  color: '#2C1810',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const hoursText = {
  color: '#333',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
};

const instructionText = {
  color: '#D97E3C', // Crust orange
  fontSize: '16px',
  fontWeight: '600',
  margin: '24px 0 0 0',
  textAlign: 'center' as const,
};

const itemsSection = {
  padding: '24px',
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  margin: '20px 0',
  border: '1px solid #E8D5C4',
};

const itemRow = {
  marginBottom: '12px',
};

const itemText = {
  color: '#333',
  fontSize: '16px',
  margin: '0',
};

const tipsSection = {
  padding: '24px',
  backgroundColor: '#E8F5E9',
  borderRadius: '8px',
  margin: '20px 0',
};

const tipsTitle = {
  color: '#2C1810',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const tipsText = {
  color: '#333',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
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
