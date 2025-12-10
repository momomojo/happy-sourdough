'use client';

import { Loader2, RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  enabled?: boolean;
  className?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  enabled = true,
  className,
}: PullToRefreshProps) {
  const { containerRef, isPulling, isRefreshing, pullDistance, isTriggered } =
    usePullToRefresh({
      onRefresh,
      enabled,
    });

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 pointer-events-none"
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 0 ? 1 : 0,
        }}
      >
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground transition-transform',
            isTriggered && 'scale-110'
          )}
        >
          {isRefreshing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw
              className={cn(
                'h-5 w-5 transition-transform',
                isTriggered && 'rotate-180'
              )}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${isPulling ? pullDistance : 0}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
