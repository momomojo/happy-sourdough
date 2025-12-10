'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrderStatus } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: OrderStatus;
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
  picked_up: 'bg-green-600',
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
  picked_up: 'Picked Up',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const STATUS_FLOW: OrderStatus[] = [
  'received',
  'confirmed',
  'baking',
  'decorating',
  'quality_check',
  'ready',
  'out_for_delivery',
  'delivered',
];

const TERMINAL_STATUSES: OrderStatus[] = ['cancelled', 'refunded'];

export function OrderStatusUpdate({ orderId, currentStatus }: OrderStatusUpdateProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const getAvailableStatuses = (): OrderStatus[] => {
    // If order is already in terminal state, no changes allowed
    if (TERMINAL_STATUSES.includes(currentStatus)) {
      return [currentStatus];
    }

    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    const availableStatuses: OrderStatus[] = [];

    // Can move forward in the flow
    if (currentIndex < STATUS_FLOW.length - 1) {
      availableStatuses.push(STATUS_FLOW[currentIndex + 1]);
    }

    // Can stay at current status
    availableStatuses.push(currentStatus);

    // Can move backward one step (for corrections)
    if (currentIndex > 0) {
      availableStatuses.push(STATUS_FLOW[currentIndex - 1]);
    }

    // Can always cancel or refund (except if already delivered)
    if (currentStatus !== 'delivered') {
      availableStatuses.push('cancelled', 'refunded');
    }

    return [...new Set(availableStatuses)];
  };

  const handleUpdate = async () => {
    if (selectedStatus === currentStatus && !notes) {
      toast.error('No changes to save');
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedStatus,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(`Order status updated to ${STATUS_LABELS[selectedStatus]}`);
      setOpen(false);
      setNotes('');
      router.refresh();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const availableStatuses = getAvailableStatuses();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Change the order status and optionally add notes about the update.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Current Status</Label>
            <Badge className={`${STATUS_COLORS[currentStatus]} w-fit`}>
              {STATUS_LABELS[currentStatus]}
            </Badge>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">New Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
              disabled={TERMINAL_STATUSES.includes(currentStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[status]}`} />
                      {STATUS_LABELS[status]}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this status change..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={
              isUpdating ||
              (selectedStatus === currentStatus && !notes) ||
              TERMINAL_STATUSES.includes(currentStatus)
            }
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
