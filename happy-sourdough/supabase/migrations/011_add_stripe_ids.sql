-- Add Stripe product and price IDs to products and variants
-- This enables syncing with Stripe's product catalog

-- Add Stripe IDs to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS stripe_product_id text,
ADD COLUMN IF NOT EXISTS stripe_price_id text;

-- Add Stripe price ID to product_variants table
ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS stripe_price_id text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_stripe_product_id ON products(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_products_stripe_price_id ON products(stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_stripe_price_id ON product_variants(stripe_price_id);

-- Add comment for documentation
COMMENT ON COLUMN products.stripe_product_id IS 'Stripe Product ID for catalog sync';
COMMENT ON COLUMN products.stripe_price_id IS 'Stripe Price ID for base price';
COMMENT ON COLUMN product_variants.stripe_price_id IS 'Stripe Price ID for variant-specific pricing';
