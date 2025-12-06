'use client';

import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useRouter } from 'next/navigation';

interface ProductsPageClientProps {
  children: React.ReactNode;
}

export function ProductsPageClient({ children }: ProductsPageClientProps) {
  const router = useRouter();

  const handleRefresh = async () => {
    // Refresh the page data
    router.refresh();
    // Add a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} className="min-h-screen">
      {children}
    </PullToRefresh>
  );
}
