import { Suspense } from 'react';
import { getOrders, getOrderStats, type OrderFilters } from '@/lib/supabase/admin/orders';
import { OrderTable } from '@/components/admin/orders/order-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatus } from '@/types/database';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{
    status?: OrderStatus;
    delivery_type?: 'pickup' | 'delivery';
    page?: string;
  }>;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  received: 'Received',
  confirmed: 'Confirmed',
  baking: 'Baking',
  decorating: 'Decorating',
  quality_check: 'Quality Check',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

async function OrderStats({ filters }: { filters: OrderFilters }) {
  const stats = await getOrderStats(filters);

  const statCards = [
    { label: 'Total Orders', value: stats.total, color: 'text-blue-600' },
    { label: 'Received', value: stats.received, color: 'text-gray-600' },
    { label: 'In Production', value: stats.baking + stats.decorating + stats.quality_check, color: 'text-amber-600' },
    { label: 'Ready', value: stats.ready, color: 'text-green-600' },
    { label: 'Delivered', value: stats.delivered, color: 'text-green-700' },
    { label: 'Cancelled', value: stats.cancelled + stats.refunded, color: 'text-red-600' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="pb-2">
            <CardDescription>{stat.label}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function OrderStatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-12" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function OrderList({ filters, page }: { filters: OrderFilters; page: number }) {
  const { orders, total } = await getOrders(filters, page, 20);
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <OrderTable orders={orders} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} orders
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              asChild={page > 1}
            >
              {page > 1 ? (
                <Link href={`/orders?page=${page - 1}${filters.status ? `&status=${filters.status}` : ''}${filters.delivery_type ? `&delivery_type=${filters.delivery_type}` : ''}`}>
                  Previous
                </Link>
              ) : (
                <span>Previous</span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              asChild={page < totalPages}
            >
              {page < totalPages ? (
                <Link href={`/orders?page=${page + 1}${filters.status ? `&status=${filters.status}` : ''}${filters.delivery_type ? `&delivery_type=${filters.delivery_type}` : ''}`}>
                  Next
                </Link>
              ) : (
                <span>Next</span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderListLoading() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="p-4">
          <Skeleton className="h-8 w-full" />
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="border-t p-4">
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderFilters({ currentFilters }: { currentFilters: OrderFilters }) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="status-filter" className="text-sm font-medium">
          Status:
        </label>
        <Select
          value={currentFilters.status || 'all'}
          onValueChange={(value) => {
            const url = new URL(window.location.href);
            if (value === 'all') {
              url.searchParams.delete('status');
            } else {
              url.searchParams.set('status', value);
            }
            url.searchParams.delete('page');
            window.location.href = url.toString();
          }}
        >
          <SelectTrigger id="status-filter" className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="type-filter" className="text-sm font-medium">
          Type:
        </label>
        <Select
          value={currentFilters.delivery_type || 'all'}
          onValueChange={(value) => {
            const url = new URL(window.location.href);
            if (value === 'all') {
              url.searchParams.delete('delivery_type');
            } else {
              url.searchParams.set('delivery_type', value);
            }
            url.searchParams.delete('page');
            window.location.href = url.toString();
          }}
        >
          <SelectTrigger id="type-filter" className="w-[150px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="pickup">Pickup</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(currentFilters.status || currentFilters.delivery_type) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            window.location.href = '/orders';
          }}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: OrderFilters = {
    status: params.status,
    delivery_type: params.delivery_type,
  };
  const page = parseInt(params.page || '1', 10);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all bakery orders
          </p>
        </div>
      </div>

      <Suspense fallback={<OrderStatsLoading />}>
        <OrderStats filters={filters} />
      </Suspense>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>
                View and manage order statuses
              </CardDescription>
            </div>
          </div>
          <div className="pt-4">
            <OrderFilters currentFilters={filters} />
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<OrderListLoading />}>
            <OrderList filters={filters} page={page} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
