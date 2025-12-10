'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ExternalLink, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { OrderStatus } from '@/types/database';
import type { OrderWithItemCount } from '@/lib/supabase/customer-server';

interface OrdersListClientProps {
  orders: OrderWithItemCount[];
}

// Bakery-themed warm color palette for order statuses
const statusColors: Record<OrderStatus, string> = {
  received: 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800',
  confirmed: 'bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-800',
  baking: 'bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-800',
  decorating: 'bg-pink-100 text-pink-800 border border-pink-200 dark:bg-pink-900/30 dark:text-pink-200 dark:border-pink-800',
  quality_check: 'bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-800',
  ready: 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800 border border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-200 dark:border-cyan-800',
  delivered: 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800',
  picked_up: 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800',
  cancelled: 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800/30 dark:text-gray-200 dark:border-gray-700',
  refunded: 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800',
};

const statusLabels: Record<OrderStatus, string> = {
  received: 'Received',
  confirmed: 'Confirmed',
  baking: 'Baking',
  decorating: 'Decorating',
  quality_check: 'Quality Check',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  picked_up: 'Picked Up',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

type SortOption = 'date-desc' | 'date-asc' | 'total-desc' | 'total-asc';
type FilterOption = 'all' | 'active' | 'completed' | 'cancelled';

export function OrdersListClient({ orders }: OrdersListClientProps) {
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    // Apply filter
    if (filterBy === 'active') {
      filtered = filtered.filter(order =>
        !['delivered', 'picked_up', 'cancelled', 'refunded'].includes(order.status)
      );
    } else if (filterBy === 'completed') {
      filtered = filtered.filter(order =>
        order.status === 'delivered' || order.status === 'picked_up'
      );
    } else if (filterBy === 'cancelled') {
      filtered = filtered.filter(order =>
        order.status === 'cancelled' || order.status === 'refunded'
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'total-desc':
          return b.total - a.total;
        case 'total-asc':
          return a.total - b.total;
        default:
          return 0;
      }
    });

    return filtered;
  }, [orders, sortBy, filterBy]);

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="filter" className="text-sm font-medium mb-2 block">
            Filter by Status
          </label>
          <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
            <SelectTrigger id="filter" className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="active">Active Orders</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled/Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label htmlFor="sort" className="text-sm font-medium mb-2 block">
            Sort by
          </label>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger id="sort" className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sort orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="total-desc">Highest Total</SelectItem>
              <SelectItem value="total-asc">Lowest Total</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedOrders.length} of {orders.length} orders
      </div>

      {/* Orders List */}
      {filteredAndSortedOrders.length === 0 ? (
        <Card className="border-2 shadow-md rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-secondary/5 pointer-events-none" />
          <CardContent className="flex flex-col items-center justify-center py-16 relative">
            <div className="p-4 rounded-full bg-secondary/10 mb-6">
              <Package className="h-12 w-12 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
              No orders match your current filters. Try adjusting your filter settings.
            </p>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setFilterBy('all');
                setSortBy('date-desc');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedOrders.map((order) => {
            const orderDate = new Date(order.created_at);
            const deliveryDate = new Date(order.delivery_date);

            return (
              <Card key={order.id} className="border-2 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300" />
                <CardHeader className="relative">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-bold">
                        Order {order.order_number}
                      </CardTitle>
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current"></span>
                          Placed on {orderDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current"></span>
                          {order.fulfillment_type === 'delivery' ? 'Delivery' : 'Pickup'} on{' '}
                          {deliveryDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current"></span>
                          {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-3">
                      <Badge
                        className={`${statusColors[order.status]} font-semibold px-3 py-1 rounded-lg shadow-sm`}
                      >
                        {statusLabels[order.status]}
                      </Badge>
                      <p className="text-2xl font-bold text-primary">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="default"
                      asChild
                      className="flex-1 sm:flex-none shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Link href={`/account/orders/${order.id}`}>
                        View Details
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    {(order.status === 'delivered' || order.status === 'picked_up') && (
                      <Button
                        variant="outline"
                        asChild
                        className="flex-1 sm:flex-none border-2 hover:bg-secondary/5 hover:border-secondary/50 transition-all duration-200"
                      >
                        <Link href="/products">Order Again</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
