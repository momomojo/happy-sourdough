import { createClient } from '../client';
import type { Product, ProductVariant } from '@/types/database';

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
};

// Type for Supabase query result with variants relation
type ProductQueryRow = Product & { variants: ProductVariant[] | null };

/**
 * Get all products for admin (including unavailable)
 */
export async function getAdminProducts(): Promise<ProductWithVariants[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      variants:product_variants(*)
    `)
    .order('name');

  if (error) {
    console.error('Error fetching admin products:', error);
    throw error;
  }

  return (data || []).map((item) => {
    const row = item as ProductQueryRow;
    const { variants, ...product } = row;
    return {
      ...product,
      variants: (variants || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    } as ProductWithVariants;
  });
}

/**
 * Get a single product by ID with variants
 */
export async function getProductById(id: string): Promise<ProductWithVariants | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      variants:product_variants(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  const row = data as ProductQueryRow;
  const { variants, ...product } = row;
  return {
    ...product,
    variants: (variants || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
  } as ProductWithVariants;
}

/**
 * Create a new product
 */
export async function createProduct(product: {
  name: string;
  slug: string;
  description: string;
  category: string;
  base_price: number;
  image_url?: string;
  gallery_urls?: string[];
  is_available?: boolean;
  is_featured?: boolean;
  lead_time_hours?: number;
}): Promise<Product> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .insert({
      ...product,
      gallery_urls: product.gallery_urls ?? [],
      is_available: product.is_available ?? true,
      is_featured: product.is_featured ?? false,
      lead_time_hours: product.lead_time_hours ?? 24,
    } as never)
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return data as Product;
}

/**
 * Update a product
 */
export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'id' | 'created_at'>>
): Promise<Product> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return data as Product;
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  const supabase = createClient();

  // First delete all variants
  const { error: variantError } = await supabase
    .from('product_variants')
    .delete()
    .eq('product_id', id);

  if (variantError) {
    console.error('Error deleting variants:', variantError);
    throw variantError;
  }

  // Then delete the product
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

/**
 * Toggle product availability
 */
export async function toggleProductAvailability(id: string, isAvailable: boolean): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('products')
    .update({ is_available: isAvailable, updated_at: new Date().toISOString() } as never)
    .eq('id', id);

  if (error) {
    console.error('Error toggling product availability:', error);
    throw error;
  }
}

/**
 * Toggle product featured status
 */
export async function toggleProductFeatured(id: string, isFeatured: boolean): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('products')
    .update({ is_featured: isFeatured, updated_at: new Date().toISOString() } as never)
    .eq('id', id);

  if (error) {
    console.error('Error toggling product featured:', error);
    throw error;
  }
}

// ===== Variant Operations =====

/**
 * Create a product variant
 */
export async function createVariant(variant: {
  product_id: string;
  name: string;
  price_adjustment: number;
  sku?: string;
  is_available?: boolean;
  is_default?: boolean;
  sort_order?: number;
  track_inventory?: boolean;
  inventory_count?: number;
}): Promise<ProductVariant> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('product_variants')
    .insert({
      ...variant,
      is_available: variant.is_available ?? true,
      is_default: variant.is_default ?? false,
      sort_order: variant.sort_order ?? 0,
      track_inventory: variant.track_inventory ?? false,
      inventory_count: variant.inventory_count ?? 0,
    } as never)
    .select()
    .single();

  if (error) {
    console.error('Error creating variant:', error);
    throw error;
  }

  return data as ProductVariant;
}

/**
 * Update a product variant
 */
export async function updateVariant(
  id: string,
  updates: Partial<Omit<ProductVariant, 'id' | 'product_id' | 'created_at'>>
): Promise<ProductVariant> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('product_variants')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating variant:', error);
    throw error;
  }

  return data as ProductVariant;
}

/**
 * Delete a product variant
 */
export async function deleteVariant(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting variant:', error);
    throw error;
  }
}

/**
 * Generate a URL-friendly slug from a product name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ===== Stripe Sync Operations =====

/**
 * Sync a product to Stripe
 * Creates/updates Stripe Product and Price
 */
export async function syncProductToStripe(product: {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  base_price: number;
  stripe_product_id?: string | null;
  stripe_price_id?: string | null;
}): Promise<{ stripeProductId: string; stripePriceId: string }> {
  const response = await fetch('/api/admin/products/sync-stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.image_url,
      basePrice: product.base_price,
      stripeProductId: product.stripe_product_id,
      stripePriceId: product.stripe_price_id,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sync with Stripe');
  }

  return response.json();
}

/**
 * Archive a product in Stripe (when deleted)
 */
export async function archiveProductInStripe(stripeProductId: string): Promise<void> {
  const response = await fetch(
    `/api/admin/products/sync-stripe?stripeProductId=${encodeURIComponent(stripeProductId)}`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to archive in Stripe');
  }
}

/**
 * Create product with automatic Stripe sync
 */
export async function createProductWithStripeSync(product: {
  name: string;
  slug: string;
  description: string;
  category: string;
  base_price: number;
  image_url?: string;
  gallery_urls?: string[];
  is_available?: boolean;
  is_featured?: boolean;
  lead_time_hours?: number;
}): Promise<Product> {
  // First create in Supabase
  const createdProduct = await createProduct(product);

  // Then sync to Stripe
  try {
    await syncProductToStripe({
      id: createdProduct.id,
      name: createdProduct.name,
      description: createdProduct.description,
      image_url: createdProduct.image_url,
      base_price: createdProduct.base_price,
    });
  } catch (error) {
    console.error('Stripe sync failed (product still created in Supabase):', error);
    // Don't throw - product is created, Stripe sync can be retried
  }

  return createdProduct;
}

/**
 * Update product with automatic Stripe sync
 */
export async function updateProductWithStripeSync(
  id: string,
  updates: Partial<Omit<Product, 'id' | 'created_at'>>,
  existingStripeIds?: { stripeProductId?: string | null; stripePriceId?: string | null }
): Promise<Product> {
  // First update in Supabase
  const updatedProduct = await updateProduct(id, updates);

  // Then sync to Stripe if price-relevant fields changed
  const shouldSync = 'name' in updates || 'description' in updates ||
    'image_url' in updates || 'base_price' in updates;

  if (shouldSync) {
    try {
      await syncProductToStripe({
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        image_url: updatedProduct.image_url,
        base_price: updatedProduct.base_price,
        stripe_product_id: existingStripeIds?.stripeProductId,
        stripe_price_id: existingStripeIds?.stripePriceId,
      });
    } catch (error) {
      console.error('Stripe sync failed (product still updated in Supabase):', error);
      // Don't throw - product is updated, Stripe sync can be retried
    }
  }

  return updatedProduct;
}

/**
 * Delete product with Stripe archive
 */
export async function deleteProductWithStripeArchive(
  id: string,
  stripeProductId?: string | null
): Promise<void> {
  // Archive in Stripe first if it exists there
  if (stripeProductId) {
    try {
      await archiveProductInStripe(stripeProductId);
    } catch (error) {
      console.error('Stripe archive failed:', error);
      // Continue with deletion anyway
    }
  }

  // Then delete from Supabase
  await deleteProduct(id);
}
