import { Suspense } from 'react';
import { getOrders, getOrderStats, type OrderFilters } from '@/lib/supabase/admin/orders';
import { OrderTable } from '@/components/admin/orders/order-table';
import { OrderFiltersComponent } from '@/components/admin/orders/order-filters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatus } from '@/types/database';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{
    status?: OrderStatus;
    fulfillment_type?: 'pickup' | 'delivery';
    page?: string;
    date_from?: string;
    date_to?: string;
  }>;
}

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

  const buildPaginationUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set('page', pageNum.toString());
    if (filters.status) params.set('status', filters.status);
    if (filters.fulfillment_type) params.set('fulfillment_type', filters.fulfillment_type);
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);
    return `/admin/orders?${params.toString()}`;
  };

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
                <Link href={buildPaginationUrl(page - 1)}>
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
                <Link href={buildPaginationUrl(page + 1)}>
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

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: OrderFilters = {
    status: params.status,
    fulfillment_type: params.fulfillment_type,
    date_from: params.date_from,
    date_to: params.date_to,
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
            <OrderFiltersComponent currentFilters={filters} />
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
