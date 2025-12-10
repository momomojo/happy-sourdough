'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/cart-context';
import { CartSheet } from './cart-sheet';

export function CartButton() {
  const { itemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevItemCount, setPrevItemCount] = useState(0);

  // Animate badge when items are added
  useEffect(() => {
    if (itemCount > prevItemCount && itemCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
    setPrevItemCount(itemCount);
  }, [itemCount, prevItemCount]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative"
        aria-label={`Shopping cart with ${itemCount} items`}
        data-testid="cart-button"
      >
        <ShoppingCartIcon className="size-5" />
        {itemCount > 0 && (
          <Badge
            variant="default"
            className={`absolute -top-2 -right-2 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center p-0 ${
              isAnimating ? 'animate-bounce-subtle' : ''
            }`}
            data-testid="cart-count"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
      </Button>

      <CartSheet isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
