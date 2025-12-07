import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ProductWithVariants } from '@/lib/supabase/products';

interface ProductCardProps {
  product: ProductWithVariants;
}

export function ProductCard({ product }: ProductCardProps) {
  // Get the lowest price from variants (base_price + price_adjustment)
  const minPrice = product.variants.length > 0
    ? Math.min(...product.variants.map((v) => product.base_price + v.price_adjustment))
    : product.base_price;

  // Format price (assuming prices are in dollars, not cents)
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(minPrice);

  return (
    <Link href={`/products/${product.slug}`} className="block h-full">
      <Card className="h-full hover:shadow-lg transition-shadow duration-200 overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-accent/10">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-accent/20">
              <span className="text-4xl">🍞</span>
            </div>
          )}

          {/* Featured Badge */}
          {product.is_featured && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-accent text-accent-foreground shadow-md">
                Featured
              </Badge>
            </div>
          )}
        </div>

        <CardHeader>
          <CardTitle className="line-clamp-1">{product.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {product.short_description || product.description || 'Handcrafted with love'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Price */}
          <div className="text-2xl font-bold text-primary">
            {product.variants.length > 1 && 'from '}
            {formattedPrice}
          </div>

          {/* Allergens */}
          {product.allergens && product.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.allergens.slice(0, 3).map((allergen) => (
                <Badge key={allergen} variant="outline" className="text-xs">
                  {allergen}
                </Badge>
              ))}
              {product.allergens.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{product.allergens.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="text-sm text-muted-foreground">
          <span className="capitalize">{product.category}</span>
          <span className="mx-2">•</span>
          <span>{product.lead_time_hours}h prep time</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
