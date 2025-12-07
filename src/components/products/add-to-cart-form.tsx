'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VariantSelector } from './variant-selector';
import { useCart } from '@/contexts/cart-context';
import type { ProductVariant } from '@/types/database';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

interface AddToCartFormProps {
  productId: string;
  productName: string;
  basePrice: number;
  variants: ProductVariant[];
  imageUrl?: string;
}

export function AddToCartForm({
  productId,
  productName,
  basePrice,
  variants,
  imageUrl,
}: AddToCartFormProps) {
  const { addItem } = useCart();

  // Find default variant or use first available
  const defaultVariant = variants.find((v) => v.sort_order === 0) || variants[0];

  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    setIsAdding(true);

    try {
      addItem({
        productId,
        variantId: selectedVariant.id,
        productName,
        variantName: selectedVariant.name,
        unitPrice: basePrice + selectedVariant.price_adjustment,
        imageUrl,
        quantity,
      });

      // Reset quantity after successful add
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  if (variants.length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          This product is currently unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Variant Selector */}
      <VariantSelector
        variants={variants}
        selectedVariantId={selectedVariantId}
        onVariantChange={setSelectedVariantId}
        basePrice={basePrice}
      />

      {/* Quantity Selector */}
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Input
            id="quantity"
            type="number"
            min="1"
            max="10"
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            className="w-20 text-center"
          />

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= 10}
          >
            <Plus className="h-4 w-4" />
          </Button>

          <span className="text-sm text-gray-500">Max 10 per order</span>
        </div>
      </div>

      {/* Price Display */}
      {selectedVariant && (
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-gray-600">Total Price:</span>
            <div className="text-right">
              <div className="text-2xl font-bold">
                ${((basePrice + selectedVariant.price_adjustment) * quantity).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={isAdding || !selectedVariant}
        className="w-full"
        size="lg"
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {isAdding ? 'Adding...' : 'Add to Cart'}
      </Button>

      {/* Prep Time Notice */}
      <p className="text-xs text-center text-gray-500">
        All items are baked fresh to order. Please allow appropriate prep time for your order.
      </p>
    </div>
  );
}
