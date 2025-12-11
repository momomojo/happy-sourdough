'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';

export default function OrdersError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to Sentry
        Sentry.captureException(error, {
            tags: { component: 'admin-orders' },
            extra: { digest: error.digest },
        });
        console.error('Admin orders error:', error);
    }, [error]);

    return (
        <div className="container mx-auto py-8">
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-2xl font-bold mb-4">Failed to load orders</h2>
                <p className="text-muted-foreground mb-2">
                    We encountered an error while fetching order data.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                    {error.message || 'An unexpected error occurred.'}
                </p>
                <div className="flex gap-4">
                    <Button onClick={() => reset()}>Try again</Button>
                    <Button variant="outline" onClick={() => window.location.href = '/admin/dashboard'}>
                        Go to Dashboard
                    </Button>
                </div>
                {error.digest && (
                    <p className="text-xs text-muted-foreground mt-4">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
        </div>
    );
}
