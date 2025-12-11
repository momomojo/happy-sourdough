import { createReadOnlyClient } from './server';
import type { Product, ProductVariant } from '@/types/database';

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
};

// Type for Supabase query result with variants relation
type ProductQueryRow = Product & { variants: ProductVariant[] | null };

/**
 * Fetch all products with their variants
 * @param category Optional category filter
 * @returns Array of products with variants
 */
export async function getProducts(category?: string): Promise<ProductWithVariants[]> {
  const supabase = createReadOnlyClient();

  let query = supabase
    .from('products')
    .select(`
      *,
      variants:product_variants(*)
    `)
    .eq('is_available', true)
    .order('name');

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Transform the data to match our type
  return (data || []).map((item) => {
    const row = item as ProductQueryRow;
    const { variants, ...product } = row;
    return {
      ...product,
      variants: (variants || []).sort((a, b) => a.sort_order - b.sort_order),
    } as ProductWithVariants;
  });
}

/**
 * Get a product by its slug with all details
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createReadOnlyClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_available', true)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null; // Layout handles null product via notFound() or similar
  }

  return data;
}

/**
 * Get variants for a specific product
 */
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const supabase = createReadOnlyClient();

  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .eq('is_available', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching product variants:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if a product is available (including lead time logic)
 */
export function isProductAvailable(product: Product): boolean {
  if (!product.is_available) return false;
  // TODO: Add lead time logic here if needed (e.g. comparing now + lead content)
  return true;
}

/**
 * Get formatted price for display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/**
 * Get all available delivery zones
 */
export async function getDeliveryZones() {
  const supabase = createReadOnlyClient();
  const { data, error } = await supabase
    .from('delivery_zones')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    console.error('Error fetching delivery zones:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all products for a specific category
 * Used for "Related Products" section
 */
export async function getProductsByCategory(category: string, limit: number = 4): Promise<Product[]> {
  const supabase = createReadOnlyClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('is_available', true)
    .limit(limit);

  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all product slugs for static generation
 */
export async function getAllProductSlugs(): Promise<string[]> {
  const supabase = createReadOnlyClient();

  const { data, error } = await supabase
    .from('products')
    .select('slug')
    .eq('is_available', true);

  if (error) {
    console.error('Error fetching product slugs:', error);
    return [];
  }

  return (data as { slug: string }[])?.map(p => p.slug) || [];
}

/**
 * Search products by name or description
 */
export async function searchProducts(query: string): Promise<ProductWithVariants[]> {
  const supabase = createReadOnlyClient();

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      variants:product_variants(*)
    `)
    .eq('is_available', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('name');

  if (error) {
    console.error('Error searching products:', error);
    return [];
  }

  return (data || []).map((item) => {
    const row = item as ProductQueryRow;
    const { variants, ...product } = row;
    return {
      ...product,
      variants: (variants || []).sort((a, b) => a.sort_order - b.sort_order),
    } as ProductWithVariants;
  });
}

/**
 * Get featured products for homepage
 * @param limit Number of products to return
 * @returns Array of featured products with variants
 */
export async function getFeaturedProducts(limit = 4): Promise<ProductWithVariants[]> {
  const supabase = createReadOnlyClient();

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      variants:product_variants(*)
    `)
    .eq('is_available', true)
    .eq('is_featured', true)
    .order('name')
    .limit(limit);

  if (error) {
    console.error('Error fetching featured products:', error);
    // Return empty array to verify frontend renders even if DB is broken
    return [];
  }

  return (data || []).map((item) => {
    const row = item as ProductQueryRow;
    const { variants, ...product } = row;
    return {
      ...product,
      variants: (variants || []).sort((a, b) => a.sort_order - b.sort_order),
    } as ProductWithVariants;
  });
}

/**
 * Get all unique categories from products
 * @returns Array of category strings
 */
export async function getCategories(): Promise<string[]> {
  const supabase = createReadOnlyClient();

  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('is_available', true);

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // Get unique categories
  const categories = [...new Set((data as { category: string }[]).map((p) => p.category))];
  return categories.sort();
}
