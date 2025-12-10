'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { ProductionItem } from '@/lib/supabase/admin/production';

interface ProductionListProps {
  items: ProductionItem[];
  date: string;
}

export function ProductionList({ items, date }: ProductionListProps) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ProductionItem[]>);

  // Sort categories by total quantity (descending)
  const sortedCategories = Object.entries(itemsByCategory)
    .map(([category, categoryItems]) => ({
      category,
      items: categoryItems,
      totalQuantity: categoryItems.reduce((sum, item) => sum + item.quantity, 0),
    }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity);

  const handleToggleComplete = async (item: ProductionItem) => {
    const key = `${item.product_id}-${item.product_variant_id || 'none'}`;
    const newCompleted = new Set(completedItems);

    if (newCompleted.has(key)) {
      newCompleted.delete(key);
    } else {
      newCompleted.add(key);
    }

    setCompletedItems(newCompleted);

    // Update backend (optional - currently just client-side)
    try {
      await fetch('/api/admin/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.product_id,
          variantId: item.product_variant_id,
          date,
          completed: !completedItems.has(key),
        }),
      });
    } catch (error) {
      console.error('Error updating completion status:', error);
    }
  };

  const isItemCompleted = (item: ProductionItem) => {
    const key = `${item.product_id}-${item.product_variant_id || 'none'}`;
    return completedItems.has(key);
  };

  return (
    <div className="flex flex-col gap-6">
      {sortedCategories.map(({ category, items: categoryItems, totalQuantity }) => (
        <Card key={category} className="print:break-inside-avoid">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold uppercase tracking-wide">
                {category}
              </CardTitle>
              <Badge variant="secondary" className="text-lg font-semibold px-3 py-1">
                {totalQuantity} items
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryItems.map((item, index) => {
                const itemKey = `${item.product_id}-${item.product_variant_id || 'none'}`;
                const isCompleted = isItemCompleted(item);

                return (
                  <div key={itemKey}>
                    {index > 0 && <Separator className="my-3" />}

                    <div className="flex items-start gap-4 print:gap-3">
                      {/* Checkbox (hidden in print) */}
                      <div className="flex items-center pt-1 print:hidden">
                        <Checkbox
                          id={itemKey}
                          checked={isCompleted}
                          onCheckedChange={() => handleToggleComplete(item)}
                          className="h-5 w-5"
                        />
                      </div>

                      {/* Print checkbox placeholder */}
                      <div className="hidden print:flex items-center pt-1">
                        <div className="h-5 w-5 border-2 border-primary rounded" />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between gap-4">
                          <div className="flex-1">
                            <label
                              htmlFor={itemKey}
                              className={`text-lg font-semibold cursor-pointer transition-all ${
                                isCompleted
                                  ? 'line-through text-muted-foreground'
                                  : 'text-foreground'
                              }`}
                            >
                              {item.product_name}
                              {item.variant_name && (
                                <span className="text-muted-foreground ml-2">
                                  ({item.variant_name})
                                </span>
                              )}
                            </label>
                          </div>

                          {/* Quantity Badge */}
                          <Badge
                            variant={isCompleted ? 'outline' : 'default'}
                            className={`text-lg font-bold px-4 py-1 ${
                              isCompleted ? 'opacity-50' : ''
                            }`}
                          >
                            {item.quantity}
                          </Badge>
                        </div>

                        {/* Additional Info */}
                        {item.orders_count > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            From {item.orders_count} order{item.orders_count > 1 ? 's' : ''}
                          </p>
                        )}

                        {/* Notes (if any) */}
                        {item.notes && (
                          <p className="text-sm text-muted-foreground italic mt-2 border-l-2 border-accent pl-3">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
