'use client';

import { useState } from 'react';
import { XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface CancelOrderButtonProps {
  orderId: string;
  orderNumber: string;
  status: string;
  guestEmail?: string;
  onCancelled?: () => void;
}

// Only these statuses can be cancelled
const CANCELLABLE_STATUSES = ['received', 'confirmed'];

export function CancelOrderButton({
  orderId,
  orderNumber,
  status,
  guestEmail,
  onCancelled,
}: CancelOrderButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Check if order can be cancelled
  const canCancel = CANCELLABLE_STATUSES.includes(status);

  if (!canCancel) {
    return null;
  }

  const handleCancel = async () => {
    setIsLoading(true);

    try {
      const body: Record<string, string> = {};
      if (guestEmail) {
        body.guest_email = guestEmail;
      }

      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel order');
      }

      toast.success('Order cancelled successfully', {
        description: `Order ${orderNumber} has been cancelled. You will receive a confirmation email shortly.`,
      });

      setIsOpen(false);

      // Refresh the page or call callback
      if (onCancelled) {
        onCancelled();
      } else {
        // Refresh to show updated status
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to cancel order', {
        description: error instanceof Error ? error.message : 'Please try again or contact support.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive transition-all duration-200"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Cancel Order
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Cancel Order {orderNumber}?</DialogTitle>
          <DialogDescription className="space-y-2">
            <span className="block">Are you sure you want to cancel this order? This action cannot be undone.</span>
            <span className="block text-sm">
              If you&apos;ve already been charged, a refund will be processed within 5-10 business days.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Keep Order
            </Button>
          </DialogClose>
          <Button
            onClick={handleCancel}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Yes, Cancel Order'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
