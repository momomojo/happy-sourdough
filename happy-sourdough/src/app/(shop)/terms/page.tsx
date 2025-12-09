import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Terms of Service | Happy Sourdough',
  description: 'Terms and conditions for ordering from Happy Sourdough bakery',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Back Navigation */}
      <div className="mb-8">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Terms of Service
        </h1>
        <p className="text-muted-foreground">
          Last Updated: December 8, 2025
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-neutral max-w-none">
        <div className="space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              1. Introduction
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Welcome to Happy Sourdough. These Terms of Service govern your use of our website and the purchase
              of our artisan baked goods. By placing an order with Happy Sourdough, you agree to be bound by these terms.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Happy Sourdough is a local artisan bakery specializing in handcrafted sourdough breads, pastries,
              and custom cakes. We take pride in using organic ingredients and traditional fermentation methods.
            </p>
          </section>

          {/* Ordering */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              2. Ordering Process
            </h2>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              2.1 Product Availability
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All products are subject to availability. We reserve the right to limit quantities or discontinue
              any product at our discretion. Product images are for illustration purposes and actual products may vary slightly.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              2.2 Order Acceptance
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your order constitutes an offer to purchase our products. We reserve the right to accept or decline
              your order for any reason, including but not limited to product availability, errors in pricing or
              product information, or delivery zone limitations.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              2.3 Order Confirmation
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Once your order is placed, you will receive an email confirmation. This confirmation does not
              constitute acceptance of your order. Order acceptance occurs when we confirm your order and begin
              the baking process.
            </p>
          </section>

          {/* Pricing and Payment */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              3. Pricing and Payment
            </h2>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              3.1 Pricing
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All prices are listed in US Dollars and include applicable sales tax. Prices are subject to change
              without notice, but changes will not affect orders already placed.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              3.2 Payment Methods
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We accept payment via credit card, debit card, and other payment methods processed through Stripe.
              Payment is required at the time of order placement. Your payment information is processed securely
              and we do not store your complete card details.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              3.3 Minimum Order Requirements
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Delivery orders are subject to minimum order requirements based on your delivery zone:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-2">
              <li>Zone 1 (0-3 miles): $25 minimum order</li>
              <li>Zone 2 (3-7 miles): $40 minimum order</li>
              <li>Zone 3 (7-12 miles): $60 minimum order</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Pickup orders have no minimum requirement.
            </p>
          </section>

          {/* Delivery and Pickup */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              4. Delivery and Pickup
            </h2>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              4.1 Delivery Zones and Fees
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-2">
              We deliver to select areas within our service radius. Delivery fees vary by zone:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-2 mb-4">
              <li>Zone 1 (0-3 miles): Free delivery</li>
              <li>Zone 2 (3-7 miles): $5 delivery fee</li>
              <li>Zone 3 (7-12 miles): $10 delivery fee</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Delivery times are estimates and may vary due to traffic, weather, or other circumstances beyond
              our control.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">
              4.2 Pickup
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Pickup is available at our bakery location during specified time slots. Please arrive during your
              selected pickup window. Orders not picked up within 24 hours of the scheduled time may be donated
              or discarded without refund.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              4.3 Delivery Instructions
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Please provide accurate delivery instructions. We are not responsible for orders left at an incorrect
              address due to customer error or for items left in secure locations at the customer's request.
            </p>
          </section>

          {/* Perishable Goods */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              5. Perishable Goods
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All our products are perishable goods baked fresh to order. Due to the nature of our products:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Products are best consumed within 2-3 days of delivery for optimal freshness</li>
              <li>Proper storage in a cool, dry place or refrigerator is recommended</li>
              <li>We cannot guarantee the quality of products stored improperly or beyond recommended timeframes</li>
              <li>Freezing is possible for most bread products; thawing and reheating instructions are provided</li>
            </ul>
          </section>

          {/* Custom Cakes */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              6. Custom Cakes and Special Orders
            </h2>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              6.1 Advance Notice
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Custom cakes and special orders require a minimum of 48 hours advance notice. Rush orders may be
              accommodated when possible, subject to availability and potential rush fees.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              6.2 Design Specifications
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              While we strive to match custom cake designs as closely as possible to customer specifications,
              slight variations in color, decoration, and appearance may occur as each cake is handcrafted.
              We are not responsible for minor variations in the final product.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              6.3 Allergens
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Please inform us of any allergies or dietary restrictions when placing custom orders. While we
              take precautions, our kitchen handles wheat, dairy, eggs, nuts, and other common allergens.
              We cannot guarantee completely allergen-free products.
            </p>
          </section>

          {/* Cancellation Policy */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              7. Cancellation Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Due to the made-to-order nature of our products, cancellations are subject to strict limitations:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
              <li>Orders may be cancelled free of charge before baking begins</li>
              <li>Once baking has started, orders cannot be cancelled</li>
              <li>Custom cake orders cannot be cancelled once confirmed</li>
              <li>To request a cancellation, contact us immediately at our customer service number or email</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              You will receive a full refund if cancellation is accepted. Refunds are processed to the original
              payment method within 5-10 business days.
            </p>
          </section>

          {/* Refund and Return Policy */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              8. Refund and Return Policy
            </h2>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              8.1 Quality Guarantee
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We stand behind the quality of our products. If you are unsatisfied with your order due to quality
              issues, please contact us within 24 hours of delivery or pickup.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              8.2 Refund Eligibility
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Refunds or replacements may be provided for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
              <li>Products that are defective or not as described</li>
              <li>Orders that were not delivered or significantly delayed due to our error</li>
              <li>Products damaged during delivery</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              8.3 Non-Refundable Circumstances
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Refunds will not be provided for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
              <li>Change of mind or customer preference</li>
              <li>Products stored improperly after delivery</li>
              <li>Uncollected pickup orders</li>
              <li>Requests made more than 24 hours after delivery</li>
              <li>Allergic reactions (customers are responsible for reviewing ingredient information)</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              8.4 Refund Process
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Approved refunds are processed to the original payment method within 5-10 business days. Photo
              evidence may be required for quality-related refund requests.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              9. Intellectual Property
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              All content on our website, including text, images, logos, recipes, and designs, is the property
              of Happy Sourdough and protected by copyright and trademark laws. You may not reproduce, distribute,
              or create derivative works without our express written permission.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              10. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To the maximum extent permitted by law, Happy Sourdough shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising from your use of our services or
              products, including but not limited to loss of profits, data, or other intangible losses.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our total liability for any claims arising from your order shall not exceed the total amount paid
              for that specific order.
            </p>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              11. Privacy and Data Protection
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your privacy is important to us. Please review our{' '}
              <Link href="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>{' '}
              to understand how we collect, use, and protect your personal information.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              12. Changes to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective
              immediately upon posting to our website. Your continued use of our services after changes are
              posted constitutes acceptance of the modified terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              13. Governing Law
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service are governed by and construed in accordance with the laws of the United
              States and the state in which Happy Sourdough operates, without regard to conflict of law principles.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              14. Contact Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-6 space-y-2">
              <p className="text-foreground font-medium">Happy Sourdough</p>
              <p className="text-muted-foreground">Email: hello@happysourdough.com</p>
              <p className="text-muted-foreground">Phone: (555) 123-4567</p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row gap-4 justify-between items-center">
        <Button asChild variant="outline">
          <Link href="/privacy">View Privacy Policy</Link>
        </Button>
        <Button asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
