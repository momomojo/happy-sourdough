import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OrderNotFound() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <Card className="border-2 shadow-md rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-orange-50/50 pointer-events-none" />
        <CardContent className="flex flex-col items-center justify-center py-16 relative">
          <div className="p-4 rounded-full bg-red-100 mb-6">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            We couldn&apos;t find the order you&apos;re looking for. It may not exist or you don&apos;t have permission to view it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" asChild>
              <Link href="/account/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
