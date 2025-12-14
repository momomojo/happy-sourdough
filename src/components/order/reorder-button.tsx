'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import type { OrderItem } from '@/types/database';

interface ReorderButtonProps {
  items: Array<OrderItem & {
    product_name: string;
    variant_name: string | null;
  }>;
}

export function ReorderButton({ items }: ReorderButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const handleReorder = async () => {
    setIsLoading(true);

    try {
      // Add all items to cart (skip items without product_id)
      items.forEach((item) => {
        if (!item.product_id) return;
        addItem({
          productId: item.product_id,
          variantId: item.product_variant_id || item.product_id,
          productName: item.product_name,
          variantName: item.variant_name || 'Standard',
          unitPrice: item.unit_price,
          quantity: item.quantity,
        });
      });

      // Navigate to checkout after a brief delay to show the success toasts
      setTimeout(() => {
        router.push('/checkout');
      }, 500);
    } catch (error) {
      console.error('Error reordering:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleReorder}
      disabled={isLoading}
      size="lg"
      className="shadow-md hover:shadow-lg transition-all duration-200"
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      {isLoading ? 'Adding to Cart...' : 'Reorder'}
    </Button>
  );
}
