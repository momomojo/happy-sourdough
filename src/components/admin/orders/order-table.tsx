'use client';

import { useState } from 'react';
import Link from 'next/link';
import { OrderStatus } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { OrderWithCustomer } from '@/lib/supabase/admin/orders';

interface OrderTableProps {
  orders: OrderWithCustomer[];
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  received: 'bg-gray-500',
  confirmed: 'bg-blue-500',
  baking: 'bg-amber-500',
  decorating: 'bg-amber-500',
  quality_check: 'bg-amber-500',
  ready: 'bg-green-500',
  out_for_delivery: 'bg-green-500',
  delivered: 'bg-green-600',
  cancelled: 'bg-red-500',
  refunded: 'bg-red-600',
};

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

type SortField = 'order_number' | 'created_at' | 'total' | 'status' | 'delivery_type';
type SortDirection = 'asc' | 'desc';

export function OrderTable({ orders }: OrderTableProps) {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'order_number':
        comparison = a.order_number.localeCompare(b.order_number);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'total':
        comparison = a.total - b.total;
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'delivery_type':
        comparison = a.delivery_type.localeCompare(b.delivery_type);
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:underline"
    >
      {label}
      {sortField === field && (
        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
      )}
    </button>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton field="order_number" label="Order #" />
            </TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>
              <SortButton field="status" label="Status" />
            </TableHead>
            <TableHead>
              <SortButton field="delivery_type" label="Type" />
            </TableHead>
            <TableHead>Delivery Date/Time</TableHead>
            <TableHead className="text-right">Items</TableHead>
            <TableHead className="text-right">
              <SortButton field="total" label="Total" />
            </TableHead>
            <TableHead>
              <SortButton field="created_at" label="Created" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            sortedOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-primary hover:underline"
                  >
                    {order.order_number}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{order.customer_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {order.customer_email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[order.status]}>
                    {STATUS_LABELS[order.status]}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">
                  {order.delivery_type}
                </TableCell>
                <TableCell>
                  {order.delivery_date ? (
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {new Date(order.delivery_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {order.delivery_window && (
                        <span className="text-xs text-muted-foreground">
                          {order.delivery_window}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">{order.items_count}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(order.total)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(order.created_at)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
