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
  unit_price: number;
  total_price: number;
}

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  pickupLocation?: string;
  timeSlot?: {
    date: string;
    windowStart: string;
    windowEnd: string;
  };
  estimatedTime?: string;
}

export const OrderConfirmationEmail = ({
  orderNumber,
  customerName,
  items,
  subtotal,
  deliveryFee,
  tax,
  total,
  deliveryType,
  deliveryAddress,
  pickupLocation = '123 Main Street, Bakery Town, CA 94000',
  timeSlot,
  estimatedTime,
}: OrderConfirmationEmailProps) => {
  const previewText = `Order ${orderNumber} confirmed - Happy Sourdough`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Thank You for Your Order!</Heading>

          <Text style={text}>
            Hi {customerName},
          </Text>

          <Text style={text}>
            Your order has been confirmed and we're getting started on baking your fresh goodies!
          </Text>

          <Section style={orderBox}>
            <Text style={orderNumber}>
              Order #{orderNumber}
            </Text>
          </Section>

          <Section style={section}>
            <Heading as="h2" style={h2}>
              Order Details
            </Heading>

            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemName}>
                  <Text style={itemText}>
                    {item.product_name}
                    {item.variant_name && ` - ${item.variant_name}`}
                  </Text>
                  <Text style={itemQuantity}>Qty: {item.quantity}</Text>
                </Column>
                <Column style={itemPrice}>
                  <Text style={itemText}>
                    ${item.total_price.toFixed(2)}
                  </Text>
                </Column>
              </Row>
            ))}

            <Hr style={hr} />

            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Subtotal:</Text>
              </Column>
              <Column>
                <Text style={totalValue}>${subtotal.toFixed(2)}</Text>
              </Column>
            </Row>

            {deliveryFee > 0 && (
              <Row style={totalRow}>
                <Column>
                  <Text style={totalLabel}>Delivery Fee:</Text>
                </Column>
                <Column>
                  <Text style={totalValue}>${deliveryFee.toFixed(2)}</Text>
                </Column>
              </Row>
            )}

            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Tax:</Text>
              </Column>
              <Column>
                <Text style={totalValue}>${tax.toFixed(2)}</Text>
              </Column>
            </Row>

            <Row style={totalRow}>
              <Column>
                <Text style={totalLabelBold}>Total:</Text>
              </Column>
              <Column>
                <Text style={totalValueBold}>${total.toFixed(2)}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={section}>
            <Heading as="h2" style={h2}>
              {deliveryType === 'pickup' ? 'Pickup Information' : 'Delivery Information'}
            </Heading>

            {deliveryType === 'pickup' ? (
              <>
                <Text style={text}>
                  <strong>Pickup Location:</strong>
                </Text>
                <Text style={addressText}>
                  {pickupLocation}
                </Text>
              </>
            ) : (
              <>
                <Text style={text}>
                  <strong>Delivery Address:</strong>
                </Text>
                <Text style={addressText}>
                  {deliveryAddress}
                </Text>
              </>
            )}

            {timeSlot && (
              <>
                <Text style={text}>
                  <strong>Scheduled Time:</strong>
                </Text>
                <Text style={addressText}>
                  {new Date(timeSlot.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={addressText}>
                  {timeSlot.windowStart} - {timeSlot.windowEnd}
                </Text>
              </>
            )}

            {estimatedTime && (
              <Text style={estimatedTimeText}>
                Estimated {deliveryType === 'pickup' ? 'pickup' : 'delivery'} time: {estimatedTime}
              </Text>
            )}
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            We'll send you updates as your order progresses. If you have any questions,
            please don't hesitate to contact us at support@happysourdough.com
          </Text>

          <Text style={footer}>
            Happy Sourdough - Fresh Baked with Love
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;

// Styles with Happy Sourdough branding (warm colors, bakery theme)
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

const h1 = {
  color: '#2C1810', // Espresso brown
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#2C1810', // Espresso brown
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '30px 0 20px',
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
  padding: '20px',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const orderNumber = {
  color: '#2C1810',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const section = {
  padding: '24px',
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  margin: '20px 0',
  border: '1px solid #E8D5C4',
};

const itemRow = {
  marginBottom: '16px',
};

const itemName = {
  width: '70%',
};

const itemPrice = {
  width: '30%',
  textAlign: 'right' as const,
};

const itemText = {
  margin: '0 0 4px 0',
  fontSize: '16px',
  color: '#333',
};

const itemQuantity = {
  margin: '0',
  fontSize: '14px',
  color: '#666',
};

const hr = {
  borderColor: '#E8D5C4',
  margin: '20px 0',
};

const totalRow = {
  marginTop: '8px',
};

const totalLabel = {
  fontSize: '16px',
  color: '#333',
  margin: '0',
};

const totalValue = {
  fontSize: '16px',
  color: '#333',
  textAlign: 'right' as const,
  margin: '0',
};

const totalLabelBold = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#2C1810',
  margin: '0',
};

const totalValueBold = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#2C1810',
  textAlign: 'right' as const,
  margin: '0',
};

const addressText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
};

const estimatedTimeText = {
  color: '#D97E3C', // Crust orange
  fontSize: '16px',
  fontWeight: '600',
  margin: '16px 0 0 0',
};

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  margin: '20px 0',
};
