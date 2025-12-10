'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = [
  { value: 'all', label: 'All Products' },
  { value: 'bread', label: 'Bread' },
  { value: 'pastry', label: 'Pastries' },
  { value: 'cake', label: 'Cakes' },
  { value: 'cookie', label: 'Cookies' },
];

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium text-muted-foreground">Filter:</span>
      {CATEGORIES.map((category) => (
        <Badge
          key={category.value}
          variant={currentCategory === category.value ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-primary/90 transition-colors"
          onClick={() => handleCategoryChange(category.value)}
        >
          {category.label}
        </Badge>
      ))}
    </div>
  );
}
