'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to Sentry
        Sentry.captureException(error, {
            tags: { location: 'shop-error-boundary' },
            extra: { digest: error.digest }
        });
        // Also log to console for local debugging
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <p className="text-muted-foreground mb-6">
                We encountered an error loading the bakery products.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()}>Try again</Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Go Home
                </Button>
            </div>
        </div>
    );
}
