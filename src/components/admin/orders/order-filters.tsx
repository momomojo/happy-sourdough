'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OrderFilters } from '@/lib/supabase/admin/orders';
import type { OrderStatus } from '@/types/database';

const STATUS_LABELS: Record<OrderStatus, string> = {
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

interface OrderFiltersProps {
  currentFilters: OrderFilters;
}

export function OrderFiltersComponent({ currentFilters }: OrderFiltersProps) {
  const handleFilterChange = (key: string, value: string | undefined) => {
    const url = new URL(window.location.href);
    if (!value || value === 'all') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
    url.searchParams.delete('page');
    window.location.href = url.toString();
  };

  const hasFilters = !!(
    currentFilters.status ||
    currentFilters.fulfillment_type ||
    currentFilters.date_from ||
    currentFilters.date_to
  );

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="status-filter" className="text-sm font-medium">
          Status:
        </label>
        <Select
          value={currentFilters.status || 'all'}
          onValueChange={(value) => handleFilterChange('status', value)}
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
          value={currentFilters.fulfillment_type || 'all'}
          onValueChange={(value) => handleFilterChange('fulfillment_type', value)}
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

      <div className="flex items-center gap-2">
        <label htmlFor="date-from" className="text-sm font-medium">
          From:
        </label>
        <Input
          id="date-from"
          type="date"
          className="w-[160px]"
          value={currentFilters.date_from || ''}
          onChange={(e) => handleFilterChange('date_from', e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="date-to" className="text-sm font-medium">
          To:
        </label>
        <Input
          id="date-to"
          type="date"
          className="w-[160px]"
          value={currentFilters.date_to || ''}
          onChange={(e) => handleFilterChange('date_to', e.target.value)}
        />
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            window.location.href = '/admin/orders';
          }}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}
