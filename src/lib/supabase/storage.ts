/**
 * Supabase Storage Helper Functions
 * Handles file uploads, deletions, and URL generation for product images and site assets
 */

import { createClient } from './client';

export type StorageBucket = 'product-images' | 'site-assets';

export interface UploadResult {
  url: string;
  path: string;
  bucket: StorageBucket;
}

export interface UploadOptions {
  bucket: StorageBucket;
  path?: string;
  upsert?: boolean;
}

/**
 * Upload a file to Supabase Storage
 * @param file - File to upload
 * @param options - Upload options (bucket, path, upsert)
 * @returns Upload result with public URL and path
 */
export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const supabase = createClient();
  const { bucket, upsert = false } = options;

  // Generate a unique filename if path not provided
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const extension = file.name.split('.').pop();
  const filename = options.path || `${timestamp}-${randomStr}.${extension}`;

  // Upload the file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, {
      cacheControl: '3600',
      upsert,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get the public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path,
    bucket,
  };
}

/**
 * Upload multiple files to Supabase Storage
 * @param files - Array of files to upload
 * @param bucket - Storage bucket name
 * @returns Array of upload results
 */
export async function uploadFiles(
  files: File[],
  bucket: StorageBucket
): Promise<UploadResult[]> {
  const uploads = files.map((file) => uploadFile(file, { bucket }));
  return Promise.all(uploads);
}

/**
 * Delete a file from Supabase Storage
 * @param path - File path in storage
 * @param bucket - Storage bucket name
 */
export async function deleteFile(
  path: string,
  bucket: StorageBucket
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Delete multiple files from Supabase Storage
 * @param paths - Array of file paths
 * @param bucket - Storage bucket name
 */
export async function deleteFiles(
  paths: string[],
  bucket: StorageBucket
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete files: ${error.message}`);
  }
}

/**
 * Get public URL for a file in storage
 * @param path - File path in storage
 * @param bucket - Storage bucket name
 * @returns Public URL
 */
export function getPublicUrl(path: string, bucket: StorageBucket): string {
  const supabase = createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

/**
 * Extract storage path from a Supabase public URL
 * @param url - Public URL from Supabase storage
 * @returns Storage path or null if not a valid storage URL
 */
export function extractPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);
    return pathMatch ? pathMatch[1] : null;
  } catch {
    return null;
  }
}

/**
 * Extract bucket name from a Supabase public URL
 * @param url - Public URL from Supabase storage
 * @returns Bucket name or null if not a valid storage URL
 */
export function extractBucketFromUrl(url: string): StorageBucket | null {
  try {
    const urlObj = new URL(url);
    const bucketMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)/);
    const bucket = bucketMatch ? bucketMatch[1] : null;

    if (bucket === 'product-images' || bucket === 'site-assets') {
      return bucket as StorageBucket;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Validate file type for upload
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns true if valid, throws error if invalid
 */
export function validateFileType(
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
): boolean {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`
    );
  }
  return true;
}

/**
 * Validate file size
 * @param file - File to validate
 * @param maxSize - Maximum file size in bytes (default: 5MB)
 * @returns true if valid, throws error if invalid
 */
export function validateFileSize(file: File, maxSize: number = 5242880): boolean {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
    throw new Error(
      `File too large: ${fileSizeMB}MB. Maximum size: ${maxSizeMB}MB`
    );
  }
  return true;
}

/**
 * Validate image file for upload
 * @param file - File to validate
 * @returns true if valid, throws error if invalid
 */
export function validateImageFile(file: File): boolean {
  validateFileType(file);
  validateFileSize(file);
  return true;
}
