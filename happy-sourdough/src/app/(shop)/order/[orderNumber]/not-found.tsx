import Link from 'next/link';
import { FileQuestion, Home, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderNotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>

      <h1 className="mb-2 text-3xl font-bold tracking-tight">Order Not Found</h1>

      <p className="mb-8 max-w-md text-muted-foreground">
        We couldn't find an order with this order number. Please check your order confirmation email
        and try again.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/products">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Continue Shopping
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="mt-12 rounded-lg border bg-muted/50 p-6">
        <h3 className="mb-2 font-semibold">Need Help?</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Can't find your order? Contact our support team.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <a href="mailto:orders@happysourdough.com">Email Support</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="tel:+15555551234">Call (555) 555-1234</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
