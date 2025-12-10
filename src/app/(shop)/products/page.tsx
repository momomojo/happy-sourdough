import { Suspense } from 'react';
import { getProducts } from '@/lib/supabase/products';
import { ProductCard } from '@/components/products/product-card';
import { CategoryFilter } from '@/components/products/category-filter';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ProductsPageClient } from '@/components/products/products-page-client';

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

async function ProductsList({ category }: { category?: string }) {
  const products = await getProducts(category);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No products found in this category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="h-full">
          {/* Image Skeleton */}
          <Skeleton className="aspect-square w-full rounded-t-xl" />

          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>

          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-24" />
            <div className="flex gap-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </CardContent>

          <CardFooter>
            <Skeleton className="h-4 w-32" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category;

  return (
    <ProductsPageClient>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Our Products</h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Handcrafted sourdough breads and pastries, baked fresh daily
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter />
        </div>

        {/* Products Grid */}
        <Suspense fallback={<ProductsLoadingSkeleton />}>
          <ProductsList category={category} />
        </Suspense>
      </div>
    </ProductsPageClient>
  );
}
