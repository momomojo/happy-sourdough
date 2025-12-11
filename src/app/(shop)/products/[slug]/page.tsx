import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Clock, Info } from 'lucide-react';
import { getProductBySlug, getProductVariants, getProductsByCategory, getAllProductSlugs } from '@/lib/supabase/products';
import { ProductGallery } from '@/components/products/product-gallery';
import { AddToCartForm } from '@/components/products/add-to-cart-form';
import { AllergenList } from '@/components/products/allergen-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Product, ProductVariant } from '@/types/database';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all products
export async function generateStaticParams() {
  // Return empty array to force dynamic rendering
  // This avoids the issue with cookies in build time
  return [];
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return {
        title: 'Product Not Found',
      };
    }

    return {
      title: `${product.name} | Happy Sourdough Bakery`,
      description: product.description || `Order fresh ${product.name} from Happy Sourdough Bakery`,
      openGraph: {
        title: product.name,
        description: product.description || undefined,
        images: product.image_url ? [product.image_url] : undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Happy Sourdough Bakery',
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  let slug: string;
  let product: Product | null;
  let variants: ProductVariant[] = [];
  let relatedProducts: Product[] = [];

  try {
    const resolvedParams = await params;
    slug = resolvedParams.slug;
  } catch (error) {
    console.error('Error resolving params:', error);
    throw new Error(`Failed to resolve params: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  try {
    product = await getProductBySlug(slug);
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error(`Failed to fetch product "${slug}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  if (!product) {
    notFound();
  }

  try {
    variants = await getProductVariants(product.id);
  } catch (error) {
    console.error('Error fetching variants:', error);
    variants = [];
  }

  try {
    relatedProducts = await getProductsByCategory(product.category, 4);
  } catch (error) {
    console.error('Error fetching related products:', error);
    relatedProducts = [];
  }

  // Prepare gallery images
  const galleryImages = product.image_url
    ? [product.image_url, ...(product.gallery_urls || [])]
    : [];

  // Filter out current product from related products
  const filteredRelated = relatedProducts.filter(p => p.id !== product.id).slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 md:mb-6 flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-600 overflow-x-auto pb-2">
        <Link href="/" className="hover:text-primary whitespace-nowrap">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
        <Link href="/products" className="hover:text-primary whitespace-nowrap">
          Products
        </Link>
        <ChevronRight className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
        <Link href={`/products?category=${product.category}`} className="hover:text-primary capitalize whitespace-nowrap">
          {product.category}
        </Link>
        <ChevronRight className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
        <span className="text-gray-900 truncate">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Left Column - Image Gallery */}
        <div className="w-full">
          <ProductGallery images={galleryImages} productName={product.name} />
        </div>

        {/* Right Column - Product Details */}
        <div className="space-y-4 lg:space-y-6">
          {/* Product Header */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {product.category}
              </Badge>
              {product.is_featured && (
                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
                  Featured
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 lg:text-4xl">
              {product.name}
            </h1>
          </div>

          {/* Description */}
          {product.description && (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

          <Separator />

          {/* Add to Cart Form */}
          <AddToCartForm
            productId={product.id}
            productName={product.name}
            basePrice={product.base_price}
            variants={variants}
            imageUrl={product.image_url || undefined}
          />

          <Separator />

          {/* Allergen Information */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Allergen Information
            </h3>
            <AllergenList allergens={product.allergens || []} />
          </div>

          {/* Lead Time */}
          {product.lead_time_hours > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Preparation Time Required
                </p>
                <p className="text-sm text-blue-700">
                  This item requires {product.lead_time_hours} hours advance notice.
                  Please order accordingly to ensure freshness.
                </p>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <Info className="h-5 w-5 text-gray-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Baked Fresh Daily</p>
              <p>
                All our products are handcrafted with premium ingredients and
                traditional sourdough methods. Orders are prepared fresh to ensure
                maximum quality and flavor.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {filteredRelated.length > 0 && (
        <div className="mt-16">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
            <p className="text-gray-600">More from our {product.category} collection</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRelated.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/products/${relatedProduct.slug}`}
                className="group"
              >
                <Card className="overflow-hidden transition-all hover:shadow-lg">
                  {relatedProduct.image_url && (
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={relatedProduct.image_url}
                        alt={relatedProduct.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-1 text-lg">
                      {relatedProduct.name}
                    </CardTitle>
                  </CardHeader>
                  {relatedProduct.description && (
                    <CardContent>
                      <p className="line-clamp-2 text-sm text-gray-600">
                        {relatedProduct.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
