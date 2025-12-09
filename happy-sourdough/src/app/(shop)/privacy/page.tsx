import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Privacy Policy | Happy Sourdough',
  description: 'Privacy policy and data protection information for Happy Sourdough bakery',
};

export default function PrivacyPage() {
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
          Privacy Policy
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
              At Happy Sourdough, we respect your privacy and are committed to protecting your personal information.
              This Privacy Policy explains how we collect, use, share, and safeguard your data when you use our
              website and services.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By using our website or placing an order, you consent to the data practices described in this policy.
              If you do not agree with our practices, please do not use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              2. Information We Collect
            </h2>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              2.1 Information You Provide
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect information that you voluntarily provide when you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
              <li>Create an account or place an order</li>
              <li>Subscribe to our newsletter or marketing communications</li>
              <li>Contact our customer service</li>
              <li>Participate in surveys, promotions, or contests</li>
              <li>Leave reviews or feedback</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-2">
              This information may include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Contact Information:</strong> Name, email address, phone number</li>
              <li><strong>Delivery Information:</strong> Delivery address, delivery instructions</li>
              <li><strong>Account Information:</strong> Username, password (encrypted)</li>
              <li><strong>Order Information:</strong> Order history, product preferences, special requests</li>
              <li><strong>Payment Information:</strong> Billing address (credit card information is processed by Stripe and not stored on our servers)</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              2.2 Information Collected Automatically
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you visit our website, we automatically collect certain information about your device and browsing behavior:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Device Information:</strong> IP address, browser type, operating system, device type</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on pages, links clicked, referring website</li>
              <li><strong>Location Data:</strong> Approximate geographic location based on IP address</li>
              <li><strong>Cookies and Similar Technologies:</strong> Information stored in cookies and similar tracking technologies (see Section 5)</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              2.3 Information from Third Parties
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We may receive information about you from third-party services such as payment processors (Stripe)
              and authentication providers if you choose to use social login features.
            </p>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Order Processing:</strong> To process, fulfill, and deliver your orders</li>
              <li><strong>Customer Service:</strong> To respond to your inquiries, provide support, and communicate about your orders</li>
              <li><strong>Account Management:</strong> To create and manage your account, including order history and saved preferences</li>
              <li><strong>Payment Processing:</strong> To process payments and prevent fraud</li>
              <li><strong>Marketing Communications:</strong> To send you promotional emails, newsletters, and special offers (with your consent)</li>
              <li><strong>Personalization:</strong> To recommend products and customize your experience</li>
              <li><strong>Analytics and Improvement:</strong> To analyze website usage, improve our services, and develop new features</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations and protect our rights</li>
              <li><strong>Security:</strong> To detect, prevent, and address security issues, fraud, or technical problems</li>
            </ul>
          </section>

          {/* How We Share Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              4. How We Share Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell your personal information to third parties. We may share your information in the
              following limited circumstances:
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              4.1 Service Providers
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We work with trusted third-party service providers who assist us in operating our business:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-6">
              <li><strong>Stripe:</strong> Payment processing (PCI-DSS compliant)</li>
              <li><strong>Supabase:</strong> Database hosting and authentication services</li>
              <li><strong>Resend:</strong> Email delivery for order confirmations and notifications</li>
              <li><strong>Vercel:</strong> Website hosting and performance optimization</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              These service providers have access to your information only to perform specific tasks on our behalf
              and are obligated to protect your data.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              4.2 Legal Requirements
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may disclose your information if required by law or in response to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Court orders, subpoenas, or other legal processes</li>
              <li>Requests from government authorities or law enforcement</li>
              <li>Protection of our rights, property, or safety, or that of our users or the public</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              4.3 Business Transfers
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              In the event of a merger, acquisition, sale of assets, or bankruptcy, your information may be
              transferred to the acquiring entity. You will be notified of any such change.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              4.4 With Your Consent
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We may share your information for other purposes with your explicit consent.
            </p>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              5. Cookies and Tracking Technologies
            </h2>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              5.1 What Are Cookies
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Cookies are small text files stored on your device that help us provide and improve our services.
              We use both session cookies (which expire when you close your browser) and persistent cookies
              (which remain on your device until deleted).
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              5.2 Types of Cookies We Use
            </h3>
            <ul className="list-disc list-inside space-y-3 text-muted-foreground ml-4 mb-4">
              <li>
                <strong>Essential Cookies:</strong> Required for the website to function properly, including
                maintaining your shopping cart and authentication session
              </li>
              <li>
                <strong>Performance Cookies:</strong> Help us understand how visitors use our website by
                collecting anonymous usage statistics
              </li>
              <li>
                <strong>Functionality Cookies:</strong> Remember your preferences and settings to provide
                a personalized experience
              </li>
              <li>
                <strong>Marketing Cookies:</strong> Track your browsing activity to show you relevant
                advertisements (only with your consent)
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              5.3 Managing Cookies
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Most web browsers automatically accept cookies, but you can modify your browser settings to decline
              cookies if you prefer. Please note that disabling cookies may limit your ability to use certain
              features of our website, such as maintaining items in your shopping cart.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              6. Data Security
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
              <li>Encryption of data in transit using SSL/TLS technology</li>
              <li>Encryption of sensitive data at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security assessments and updates</li>
              <li>Employee training on data protection practices</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              While we strive to protect your information, no method of transmission over the internet or
              electronic storage is 100% secure. We cannot guarantee absolute security of your data.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              7. Data Retention
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined
              in this Privacy Policy, unless a longer retention period is required by law. Generally:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Account Information:</strong> Retained until you request account deletion</li>
              <li><strong>Order History:</strong> Retained for 7 years for accounting and legal compliance purposes</li>
              <li><strong>Marketing Data:</strong> Retained until you unsubscribe or request deletion</li>
              <li><strong>Website Analytics:</strong> Anonymized after 26 months</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              8. Your Privacy Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-3 text-muted-foreground ml-4 mb-4">
              <li>
                <strong>Access:</strong> Request a copy of the personal information we hold about you
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate or incomplete information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal information (subject to legal
                obligations to retain certain data)
              </li>
              <li>
                <strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format
              </li>
              <li>
                <strong>Objection:</strong> Object to processing of your information for certain purposes
              </li>
              <li>
                <strong>Restriction:</strong> Request restriction of processing under certain circumstances
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Withdraw consent for processing based on consent (does not
                affect lawfulness of prior processing)
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              To exercise any of these rights, please contact us using the information provided in Section 12.
              We will respond to your request within 30 days.
            </p>
          </section>

          {/* Marketing Preferences */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              9. Marketing Communications and Preferences
            </h2>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              9.1 Email Marketing
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              With your consent, we may send you marketing emails about our products, special offers, and news.
              You can opt out at any time by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
              <li>Clicking the "unsubscribe" link in any marketing email</li>
              <li>Updating your preferences in your account settings</li>
              <li>Contacting us directly to opt out</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Please note that even if you opt out of marketing emails, we will still send you transactional
              emails related to your orders, such as order confirmations and delivery notifications.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              9.2 SMS/Text Messages
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              If you opt in to receive SMS notifications about your orders, you can opt out at any time by
              replying "STOP" to any text message or updating your preferences in your account.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              10. Children's Privacy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our services are not intended for children under the age of 13, and we do not knowingly collect
              personal information from children under 13. If we become aware that we have collected information
              from a child under 13, we will take steps to delete that information as soon as possible. If you
              believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal
              requirements. The "Last Updated" date at the top of this page indicates when the policy was last
              revised. We encourage you to review this policy periodically. Continued use of our services after
              changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              12. Contact Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
              please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-6 space-y-2">
              <p className="text-foreground font-medium">Happy Sourdough - Privacy Team</p>
              <p className="text-muted-foreground">Email: privacy@happysourdough.com</p>
              <p className="text-muted-foreground">Phone: (555) 123-4567</p>
              <p className="text-muted-foreground">Address: [Your Business Address]</p>
            </div>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              13. Third-Party Links and Services
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our website may contain links to third-party websites or services. We are not responsible for the
              privacy practices of these third parties. We encourage you to review the privacy policies of any
              third-party sites you visit. This Privacy Policy applies only to information collected by Happy Sourdough.
            </p>
          </section>

          {/* Data Transfer */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              14. International Data Transfers
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence.
              These countries may have data protection laws that differ from those in your jurisdiction. By using
              our services, you consent to the transfer of your information to the United States and other countries
              where our service providers operate.
            </p>
          </section>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row gap-4 justify-between items-center">
        <Button asChild variant="outline">
          <Link href="/terms">View Terms of Service</Link>
        </Button>
        <Button asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
