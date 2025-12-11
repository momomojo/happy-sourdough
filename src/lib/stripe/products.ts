import {
  createStripeProduct,
  updateStripeProduct,
  createStripePrice,
  updateStripePrice,
  retrieveStripePrice,
  listStripeProducts,
} from './server';
import type Stripe from 'stripe';

/**
 * Create or update a Stripe product and price
 */
export async function syncProductToStripe({
  productId,
  name,
  description,
  imageUrl,
  basePrice,
  stripeProductId,
  stripePriceId,
}: {
  productId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  basePrice: number;
  stripeProductId?: string | null;
  stripePriceId?: string | null;
}): Promise<{ stripeProductId: string; stripePriceId: string }> {
  let product: Stripe.Product;

  // Create or update the Stripe product
  if (stripeProductId) {
    // Update existing product
    product = await updateStripeProduct(stripeProductId, {
      name,
      description: description || undefined,
      images: imageUrl ? [imageUrl] : undefined,
      metadata: {
        supabase_product_id: productId,
      },
    });
  } else {
    // Create new product
    product = await createStripeProduct({
      name,
      description: description || undefined,
      images: imageUrl ? [imageUrl] : undefined,
      metadata: {
        supabase_product_id: productId,
      },
    });
  }

  // Handle price - Stripe prices are immutable, so we create new ones if price changes
  let priceId = stripePriceId;

  if (stripePriceId) {
    // Check if price changed
    const existingPrice = await retrieveStripePrice(stripePriceId);
    const newAmountCents = Math.round(basePrice * 100);

    if (existingPrice.unit_amount !== newAmountCents) {
      // Archive old price and create new one
      await updateStripePrice(stripePriceId, { active: false });

      const newPrice = await createStripePrice({
        product: product.id,
        unit_amount: newAmountCents,
        currency: 'usd',
        metadata: {
          supabase_product_id: productId,
        },
      });
      priceId = newPrice.id;

      // Set as default price
      await updateStripeProduct(product.id, {
        default_price: newPrice.id,
      });
    }
  } else {
    // Create new price
    const newPrice = await createStripePrice({
      product: product.id,
      unit_amount: Math.round(basePrice * 100),
      currency: 'usd',
      metadata: {
        supabase_product_id: productId,
      },
    });
    priceId = newPrice.id;

    // Set as default price
    await updateStripeProduct(product.id, {
      default_price: newPrice.id,
    });
  }

  return {
    stripeProductId: product.id,
    stripePriceId: priceId!,
  };
}

/**
 * Create or update a Stripe price for a product variant
 */
export async function syncVariantPriceToStripe({
  variantId,
  variantName,
  stripeProductId,
  totalPrice,
  stripePriceId,
}: {
  variantId: string;
  variantName: string;
  stripeProductId: string;
  totalPrice: number;
  stripePriceId?: string | null;
}): Promise<string> {
  const amountCents = Math.round(totalPrice * 100);

  if (stripePriceId) {
    // Check if price changed
    const existingPrice = await retrieveStripePrice(stripePriceId);

    if (existingPrice.unit_amount !== amountCents) {
      // Archive old price and create new one
      await updateStripePrice(stripePriceId, { active: false });

      const newPrice = await createStripePrice({
        product: stripeProductId,
        unit_amount: amountCents,
        currency: 'usd',
        nickname: variantName,
        metadata: {
          supabase_variant_id: variantId,
          variant_name: variantName,
        },
      });
      return newPrice.id;
    }
    return stripePriceId;
  }

  // Create new price for variant
  const newPrice = await createStripePrice({
    product: stripeProductId,
    unit_amount: amountCents,
    currency: 'usd',
    nickname: variantName,
    metadata: {
      supabase_variant_id: variantId,
      variant_name: variantName,
    },
  });

  return newPrice.id;
}

/**
 * Archive a Stripe product (set to inactive)
 */
export async function archiveStripeProduct(stripeProductId: string): Promise<void> {
  await updateStripeProduct(stripeProductId, {
    active: false,
  });
}

/**
 * Archive a Stripe price (set to inactive)
 */
export async function archiveStripePrice(stripePriceId: string): Promise<void> {
  await updateStripePrice(stripePriceId, {
    active: false,
  });
}

/**
 * Get all Stripe products with prices
 */
export async function getStripeProducts(): Promise<Stripe.Product[]> {
  const response = await listStripeProducts({
    active: true,
    limit: 100,
  });

  return response.data;
}

/**
 * Sync all existing products to Stripe (for initial migration)
 */
export async function syncAllProductsToStripe(
  products: Array<{
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    base_price: number;
    stripe_product_id: string | null;
    stripe_price_id: string | null;
  }>
): Promise<Array<{ id: string; stripeProductId: string; stripePriceId: string }>> {
  const results: Array<{ id: string; stripeProductId: string; stripePriceId: string }> = [];

  for (const product of products) {
    try {
      const { stripeProductId, stripePriceId } = await syncProductToStripe({
        productId: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.image_url,
        basePrice: product.base_price,
        stripeProductId: product.stripe_product_id,
        stripePriceId: product.stripe_price_id,
      });

      results.push({
        id: product.id,
        stripeProductId,
        stripePriceId,
      });
    } catch (error) {
      console.error(`Failed to sync product ${product.id} to Stripe:`, error);
    }
  }

  return results;
}
