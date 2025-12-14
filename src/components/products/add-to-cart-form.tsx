'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VariantSelector } from './variant-selector';
import { useCart } from '@/contexts/cart-context';
import type { ProductVariant } from '@/types/database';
import { ShoppingCart, Plus, Minus, AlertCircle, Pencil } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface AddToCartFormProps {
  productId: string;
  productName: string;
  basePrice: number;
  variants: ProductVariant[];
  imageUrl?: string;
  maxPerOrder?: number | null;
  leadTimeHours?: number;
  category: string;
}

export function AddToCartForm({
  productId,
  productName,
  basePrice,
  variants,
  imageUrl,
  maxPerOrder,
  leadTimeHours,
  category,
}: AddToCartFormProps) {
  const { addItem, items } = useCart();

  // Find default variant or use first available
  const defaultVariant = variants.find((v) => v.sort_order === 0) || variants[0];

  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  // Use database max_per_order or default to 10
  const effectiveMaxPerOrder = maxPerOrder ?? 10;

  // Calculate how many of this product are already in cart
  const currentCartQuantity = items
    .filter(item => item.productId === productId)
    .reduce((sum, item) => sum + item.quantity, 0);

  // Calculate remaining quantity that can be added
  const remainingAllowed = Math.max(0, effectiveMaxPerOrder - currentCartQuantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= remainingAllowed) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    // Check inventory if tracking is enabled
    if ((selectedVariant.track_inventory ?? false) && selectedVariant.inventory_count !== null) {
      if (selectedVariant.inventory_count < quantity) {
        return; // Will show error message below
      }
    }

    setIsAdding(true);

    try {
      addItem({
        productId,
        variantId: selectedVariant.id,
        productName,
        variantName: selectedVariant.name,
        unitPrice: basePrice + (selectedVariant.price_adjustment ?? 0),
        imageUrl,
        quantity,
        special_instructions: specialInstructions || undefined,
      });

      // Reset form
      setQuantity(1);
      setSpecialInstructions('');
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

  // Check stock availability
  const hasInsufficientStock = (selectedVariant?.track_inventory ?? false) &&
    selectedVariant?.inventory_count !== null &&
    (selectedVariant?.inventory_count ?? 0) < quantity;

  const isOutOfStock = (selectedVariant?.track_inventory ?? false) &&
    selectedVariant?.inventory_count !== null &&
    (selectedVariant?.inventory_count ?? 0) <= 0;

  return (
    <div className="space-y-6">
      {/* Variant Selector */}
      <VariantSelector
        variants={variants}
        selectedVariantId={selectedVariantId}
        onVariantChange={setSelectedVariantId}
        basePrice={basePrice}
      />

      {/* Special Instructions (e.g. Cake Inscription) */}
      {category?.toLowerCase() === 'cake' && (
        <div className="space-y-2">
          <Label htmlFor="special-instructions" className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Inscription / Special Instructions
          </Label>
          <Textarea
            id="special-instructions"
            placeholder="Happy Birthday! (Max 50 chars)"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            maxLength={50}
            className="resize-none"
            rows={2}
          />
          <p className="text-xs text-muted-foreground text-right border-t-0 mt-1">
            {specialInstructions.length}/50 characters
          </p>
        </div>
      )}

      {/* Lead Time Notice */}
      {leadTimeHours && leadTimeHours > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            This item requires <strong>{leadTimeHours} hours</strong> advance notice.
            Please select a delivery time at least {leadTimeHours} hours from now.
          </p>
        </div>
      )}

      {/* Stock Warning */}
      {selectedVariant?.track_inventory && selectedVariant.inventory_count !== null && (
        <>
          {isOutOfStock ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">
                This item is currently out of stock.
              </p>
            </div>
          ) : selectedVariant.inventory_count <= 5 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Only <strong>{selectedVariant.inventory_count}</strong> left in stock!
              </p>
            </div>
          )}
        </>
      )}

      {/* Cart Limit Notice */}
      {currentCartQuantity > 0 && remainingAllowed < effectiveMaxPerOrder && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            You already have {currentCartQuantity} of this product in your cart.
            You can add up to {remainingAllowed} more (max {effectiveMaxPerOrder} per order).
          </p>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || (isOutOfStock ?? false)}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Input
            id="quantity"
            type="number"
            min="1"
            max={Math.min(remainingAllowed, selectedVariant?.track_inventory && selectedVariant.inventory_count !== null ? selectedVariant.inventory_count : remainingAllowed)}
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            className="w-20 text-center"
            disabled={isOutOfStock ?? false}
          />

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={
              quantity >= remainingAllowed ||
              isOutOfStock ||
              ((selectedVariant?.track_inventory ?? false) &&
                selectedVariant?.inventory_count !== null &&
                quantity >= (selectedVariant?.inventory_count ?? 0))
            }
          >
            <Plus className="h-4 w-4" />
          </Button>

          <span className="text-sm text-gray-500">
            Max {effectiveMaxPerOrder} per order
          </span>
        </div>
      </div>

      {/* Price Display */}
      {selectedVariant && (
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-gray-600">Total Price:</span>
            <div className="text-right">
              <div className="text-2xl font-bold">
                ${((basePrice + (selectedVariant.price_adjustment ?? 0)) * quantity).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={
          isAdding ||
          !selectedVariant ||
          (isOutOfStock ?? false) ||
          (hasInsufficientStock ?? false) ||
          remainingAllowed <= 0
        }
        className="w-full"
        size="lg"
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {isAdding ? 'Adding...' :
          isOutOfStock ? 'Out of Stock' :
            remainingAllowed <= 0 ? 'Max Quantity Reached' :
              'Add to Cart'}
      </Button>

      {/* Prep Time Notice */}
      <p className="text-xs text-center text-gray-500">
        All items are baked fresh to order. Please allow appropriate prep time for your order.
      </p>
    </div>
  );
}
