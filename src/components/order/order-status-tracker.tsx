'use client';

import { OrderStatus } from '@/types/database';
import { CheckCircle2, Circle, Clock, Package, ChefHat, Sparkles, ClipboardCheck, Bike, Home, XCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface StatusStep {
  status: OrderStatus;
  label: string;
  icon: React.ElementType;
  description: string;
}

// Define the order workflow steps
const DELIVERY_STEPS: StatusStep[] = [
  { status: 'received', label: 'Order Received', icon: Clock, description: 'We received your order' },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle2, description: 'Payment confirmed' },
  { status: 'baking', label: 'Baking', icon: ChefHat, description: 'Fresh from the oven' },
  { status: 'quality_check', label: 'Quality Check', icon: ClipboardCheck, description: 'Ensuring perfection' },
  { status: 'ready', label: 'Ready', icon: Package, description: 'Ready for delivery' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Bike, description: 'On the way to you' },
  { status: 'delivered', label: 'Delivered', icon: Home, description: 'Enjoy your treats!' },
];

const PICKUP_STEPS: StatusStep[] = [
  { status: 'received', label: 'Order Received', icon: Clock, description: 'We received your order' },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle2, description: 'Payment confirmed' },
  { status: 'baking', label: 'Baking', icon: ChefHat, description: 'Fresh from the oven' },
  { status: 'quality_check', label: 'Quality Check', icon: ClipboardCheck, description: 'Ensuring perfection' },
  { status: 'ready', label: 'Ready for Pickup', icon: Package, description: 'Ready when you are' },
  { status: 'delivered', label: 'Picked Up', icon: Home, description: 'Enjoy your treats!' },
];

const DECORATING_STEPS: StatusStep[] = [
  { status: 'received', label: 'Order Received', icon: Clock, description: 'We received your order' },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle2, description: 'Payment confirmed' },
  { status: 'baking', label: 'Baking', icon: ChefHat, description: 'Fresh from the oven' },
  { status: 'decorating', label: 'Decorating', icon: Sparkles, description: 'Adding finishing touches' },
  { status: 'quality_check', label: 'Quality Check', icon: ClipboardCheck, description: 'Ensuring perfection' },
  { status: 'ready', label: 'Ready', icon: Package, description: 'Ready for you' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Bike, description: 'On the way to you' },
  { status: 'delivered', label: 'Delivered', icon: Home, description: 'Enjoy your treats!' },
];

interface OrderStatusTrackerProps {
  currentStatus: OrderStatus;
  deliveryType: 'pickup' | 'delivery';
  hasDecorating?: boolean;
  statusHistory?: Array<{
    status: OrderStatus;
    created_at: string;
  }>;
}

export function OrderStatusTracker({
  currentStatus,
  deliveryType,
  hasDecorating = false,
  statusHistory = [],
}: OrderStatusTrackerProps) {
  // Handle special terminal states
  if (currentStatus === 'cancelled') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <XCircle className="h-8 w-8 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Order Cancelled</h3>
            <p className="text-sm text-red-700">This order has been cancelled.</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentStatus === 'refunded') {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Order Refunded</h3>
            <p className="text-sm text-blue-700">This order has been refunded to your original payment method.</p>
          </div>
        </div>
      </div>
    );
  }

  // Select the appropriate workflow
  let steps: StatusStep[];
  if (hasDecorating) {
    steps = deliveryType === 'pickup'
      ? DECORATING_STEPS.filter(s => s.status !== 'out_for_delivery')
      : DECORATING_STEPS;
  } else {
    steps = deliveryType === 'pickup' ? PICKUP_STEPS : DELIVERY_STEPS;
  }

  // Find current step index
  const currentStepIndex = steps.findIndex(step => step.status === currentStatus);

  // Get timestamp for a specific status from history
  const getStatusTimestamp = (status: OrderStatus): string | null => {
    const historyEntry = statusHistory.find(h => h.status === status);
    return historyEntry ? historyEntry.created_at : null;
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-6 text-xl font-semibold">Order Status</h2>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-0 h-full w-0.5 bg-muted" style={{ height: `calc(100% - 3rem)` }} />
          <div
            className="absolute left-6 top-0 w-0.5 bg-primary transition-all duration-500"
            style={{
              height: currentStepIndex >= 0
                ? `${(currentStepIndex / (steps.length - 1)) * 100}%`
                : '0%'
            }}
          />

          {/* Status Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const timestamp = getStatusTimestamp(step.status);
              const Icon = step.icon;

              return (
                <div key={step.status} className="relative flex items-start gap-4">
                  {/* Icon Circle */}
                  <div
                    className={cn(
                      'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all',
                      isCompleted
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted bg-background text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <Icon className="h-6 w-6" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3
                          className={cn(
                            'font-semibold',
                            isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {step.label}
                        </h3>
                        <p
                          className={cn(
                            'text-sm',
                            isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/60'
                          )}
                        >
                          {step.description}
                        </p>
                      </div>

                      {timestamp && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-muted-foreground">
                            {format(new Date(timestamp), 'MMM d')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(timestamp), 'h:mm a')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Current Status Badge */}
                    {isCurrent && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-600" />
                        Current Status
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
