import { NextResponse } from 'next/server';
import { getProductBySlug, getProductVariants, getProductsByCategory } from '@/lib/supabase/products';

export async function GET(request: Request) {
  // SECURITY: Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'classic-sourdough-loaf';

  const result: {
    slug: string;
    steps: { step: string; success: boolean; error?: string; data?: unknown }[];
  } = {
    slug,
    steps: [],
  };

  // Step 1: Get product by slug
  try {
    const product = await getProductBySlug(slug);
    result.steps.push({
      step: 'getProductBySlug',
      success: !!product,
      data: product ? { id: product.id, name: product.name, category: product.category } : null,
    });

    if (product) {
      // Step 2: Get product variants
      try {
        const variants = await getProductVariants(product.id);
        result.steps.push({
          step: 'getProductVariants',
          success: true,
          data: { count: variants.length },
        });
      } catch (err) {
        result.steps.push({
          step: 'getProductVariants',
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }

      // Step 3: Get related products
      try {
        const relatedProducts = await getProductsByCategory(product.category, 4);
        result.steps.push({
          step: 'getProductsByCategory',
          success: true,
          data: { count: relatedProducts.length },
        });
      } catch (err) {
        result.steps.push({
          step: 'getProductsByCategory',
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
  } catch (err) {
    result.steps.push({
      step: 'getProductBySlug',
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }

  return NextResponse.json(result);
}
