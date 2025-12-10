import { createClient } from '../client';
import type { Product, ProductVariant } from '@/types/database';

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
};

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
    const { variants, ...product } = item as any;
    return {
      ...product,
      variants: (variants || []).sort((a: ProductVariant, b: ProductVariant) => a.sort_order - b.sort_order),
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

  const { variants, ...product } = data as any;
  return {
    ...product,
    variants: (variants || []).sort((a: ProductVariant, b: ProductVariant) => a.sort_order - b.sort_order),
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
  is_available?: boolean;
  is_featured?: boolean;
  lead_time_hours?: number;
}): Promise<Product> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .insert({
      ...product,
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
}): Promise<ProductVariant> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('product_variants')
    .insert({
      ...variant,
      is_available: variant.is_available ?? true,
      is_default: variant.is_default ?? false,
      sort_order: variant.sort_order ?? 0,
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
