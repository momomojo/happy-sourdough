'use client';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { ProductVariant } from '@/types/database';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  basePrice?: number;
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onVariantChange,
  basePrice = 0,
}: VariantSelectorProps) {
  if (variants.length === 0) {
    return null;
  }

  // If only one variant, show it as disabled selection
  if (variants.length === 1) {
    const variant = variants[0];
    const variantPrice = basePrice + (variant.price_adjustment ?? 0);
    return (
      <div className="space-y-2">
        <Label>Size</Label>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">{variant.name}</span>
            <span className="text-sm text-gray-600">
              ${variantPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Select Size</Label>
      <div className="grid grid-cols-1 gap-2">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariantId;
          const variantPrice = basePrice + (variant.price_adjustment ?? 0);

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onVariantChange(variant.id)}
              className={cn(
                "relative flex items-center justify-between rounded-md border p-3 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-gray-300"
                  )}
                >
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{variant.name}</div>
                  {variant.sku && (
                    <div className="text-xs text-gray-500">SKU: {variant.sku}</div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold">
                  ${variantPrice.toFixed(2)}
                </div>
                {(variant.price_adjustment ?? 0) !== 0 && (
                  <div className="text-xs text-gray-600">
                    {(variant.price_adjustment ?? 0) > 0 ? '+' : ''}${(variant.price_adjustment ?? 0).toFixed(2)}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
