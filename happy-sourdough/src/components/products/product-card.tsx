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
    <Link href={`/products/${product.slug}`} className="block h-full group" data-testid="product-card">
      <Card className="h-full overflow-hidden border-border/30 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-accent/10 to-secondary/10">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-accent/20 to-secondary/20">
              <span className="text-5xl transition-transform duration-300 group-hover:scale-110">🍞</span>
            </div>
          )}

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Featured Badge */}
          {product.is_featured && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-accent text-accent-foreground shadow-lg backdrop-blur-sm">
                Featured
              </Badge>
            </div>
          )}
        </div>

        <CardHeader>
          <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors duration-200">{product.name}</CardTitle>
          <CardDescription className="line-clamp-2 text-muted-foreground/80">
            {product.short_description || product.description || 'Handcrafted with love'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Price */}
          <div className="text-2xl font-bold text-primary group-hover:scale-105 transition-transform duration-200 origin-left" data-testid="product-price">
            {product.variants.length > 1 && <span className="text-sm font-medium text-muted-foreground mr-1">from</span>}
            {formattedPrice}
          </div>

          {/* Allergens */}
          {product.allergens && product.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
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

        <CardFooter className="text-sm text-muted-foreground/70 group-hover:text-muted-foreground transition-colors duration-200">
          <span className="capitalize">{product.category}</span>
          <span className="mx-2">•</span>
          <span>{product.lead_time_hours}h prep time</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
