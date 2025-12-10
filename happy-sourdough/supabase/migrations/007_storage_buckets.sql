-- Storage buckets for Happy Sourdough image uploads
-- Migration: 007_storage_buckets.sql

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create product-images bucket for product photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create site-assets bucket for logos, hero images, UI elements
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets',
  'site-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RLS POLICIES FOR STORAGE
-- ============================================

-- Product Images Bucket Policies
-- Allow public read access to product images
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated admins to upload product images
CREATE POLICY "Admin upload access for product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated admins to update product images
CREATE POLICY "Admin update access for product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated admins to delete product images
CREATE POLICY "Admin delete access for product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

-- Site Assets Bucket Policies
-- Allow public read access to site assets
CREATE POLICY "Public read access for site assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

-- Allow authenticated admins to upload site assets
CREATE POLICY "Admin upload access for site assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-assets'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated admins to update site assets
CREATE POLICY "Admin update access for site assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'site-assets'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated admins to delete site assets
CREATE POLICY "Admin delete access for site assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'site-assets'
  AND auth.role() = 'authenticated'
);
