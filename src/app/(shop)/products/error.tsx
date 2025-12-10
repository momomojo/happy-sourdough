'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ProductsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="container mx-auto px-4 py-32 text-center">
            <h2 className="text-3xl font-bold mb-4">Our bakery is taking a short break</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                We're having trouble displaying our fresh breads right now. Please check back in a few minutes.
            </p>
            <div className="flex gap-4 justify-center">
                <Button onClick={() => reset()}>Try again</Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Return Home
                </Button>
            </div>
        </div>
    );
}
