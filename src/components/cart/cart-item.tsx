'use client';

import React from 'react';
import Image from 'next/image';
import { MinusIcon, PlusIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, type CartItem as CartItemType } from '@/contexts/cart-context';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const handleDecrement = () => {
    updateQuantity(item.variantId, item.quantity - 1);
  };

  const handleIncrement = () => {
    updateQuantity(item.variantId, item.quantity + 1);
  };

  const handleRemove = () => {
    removeItem(item.variantId);
  };

  const lineTotal = item.unitPrice * item.quantity;

  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-0">
      {/* Product Image */}
      <div className="relative size-20 shrink-0 rounded-md overflow-hidden bg-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center size-full text-muted-foreground text-xs">
            No image
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h4 className="font-medium text-sm text-foreground truncate">
              {item.productName}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {item.variantName}
            </p>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRemove}
            className="shrink-0"
            aria-label="Remove item"
          >
            <XIcon className="size-4" />
          </Button>
        </div>

        {/* Quantity Controls and Price */}
        <div className="flex items-center justify-between gap-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1 border border-border rounded-md">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDecrement}
              disabled={item.quantity <= 1}
              className="size-7 rounded-none"
              aria-label="Decrease quantity"
            >
              <MinusIcon className="size-3" />
            </Button>

            <div className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleIncrement}
              className="size-7 rounded-none"
              aria-label="Increase quantity"
            >
              <PlusIcon className="size-3" />
            </Button>
          </div>

          {/* Line Total */}
          <div className="text-right">
            <div className="text-sm font-bold text-primary">
              ${lineTotal.toFixed(2)}
            </div>
            {item.quantity > 1 && (
              <div className="text-xs text-muted-foreground">
                ${item.unitPrice.toFixed(2)} each
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
