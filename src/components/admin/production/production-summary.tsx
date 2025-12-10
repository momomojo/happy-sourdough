'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, ShoppingCart, PieChart } from 'lucide-react';
import type { ProductionStats } from '@/lib/supabase/admin/production';

interface ProductionSummaryProps {
  stats: ProductionStats;
}

export function ProductionSummary({ stats }: ProductionSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3">
      {/* Total Items */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Items</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {stats.total_items}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Orders */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {stats.total_orders}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Breakdown */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                By Category
              </p>
              <div className="space-y-2">
                {stats.by_category.slice(0, 3).map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{cat.category}</span>
                    <Badge variant="secondary" className="text-xs">
                      {cat.count}
                    </Badge>
                  </div>
                ))}
                {stats.by_category.length > 3 && (
                  <p className="text-xs text-muted-foreground italic">
                    +{stats.by_category.length - 3} more
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Category Breakdown (Print Only) */}
      <div className="hidden print:block print:col-span-3 print:break-inside-avoid">
        <Card>
          <CardContent className="pt-6">
            <p className="text-lg font-semibold mb-4">Category Breakdown</p>
            <div className="grid grid-cols-2 gap-4">
              {stats.by_category.map((cat, index) => (
                <div key={cat.category}>
                  {index > 0 && index % 2 === 0 && (
                    <Separator className="col-span-2 my-2" />
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{cat.category}</span>
                    <Badge variant="secondary" className="font-bold">
                      {cat.count} items
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
