'use client';

import React, { useRef, useState } from 'react';
import { ShoppingBagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { useCart } from '@/contexts/cart-context';
import { CartItem } from './cart-item';
import { cn } from '@/lib/utils';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSheet({ isOpen, onClose }: CartSheetProps) {
  const { items, itemCount, subtotal, clearCart } = useCart();

  const handleCheckout = () => {
    window.location.href = '/checkout';
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg" side="right">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-foreground">
            Shopping Cart
          </SheetTitle>
          <SheetDescription>
            {itemCount === 0
              ? 'Your cart is empty'
              : `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart`}
          </SheetDescription>
        </SheetHeader>

        {/* Cart Items - Scrollable */}
        <div className="flex-1 overflow-y-auto -mx-4 px-4">
          {items.length === 0 ? (
            <EmptyCart onClose={onClose} />
          ) : (
            <div className="space-y-0">
              {items.map((item) => (
                <CartItem key={item.variantId} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer - Always visible */}
        {items.length > 0 && (
          <SheetFooter className="border-t border-border pt-4">
            <div className="w-full space-y-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-foreground">
                  Subtotal
                </span>
                <span className="text-xl font-bold text-primary">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {/* Delivery notice */}
              <p className="text-xs text-muted-foreground text-center">
                Delivery fee calculated at checkout
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full btn-bakery"
                  size="lg"
                >
                  Checkout
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Continue Shopping
                </Button>
              </div>

              {/* Clear Cart */}
              <Button
                onClick={clearCart}
                variant="ghost"
                className="w-full text-xs text-muted-foreground hover:text-destructive"
                size="sm"
              >
                Clear Cart
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl" />
        <ShoppingBagIcon className="relative size-24 text-muted-foreground/40" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        Your cart is empty
      </h3>

      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Start adding delicious sourdough breads and pastries to your cart!
      </p>

      <Button
        onClick={onClose}
        className="btn-bakery-secondary"
        size="lg"
      >
        Browse Products
      </Button>
    </div>
  );
}
