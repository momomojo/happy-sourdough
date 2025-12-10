/**
 * Admin Image Upload API Route
 * POST /api/admin/upload
 *
 * Handles file uploads to Supabase Storage with validation
 * Supports uploading to different buckets (product-images, site-assets)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  uploadFile,
  validateImageFile,
  type StorageBucket,
} from '@/lib/supabase/storage';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as StorageBucket) || 'product-images';
    const path = formData.get('path') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate bucket
    if (bucket !== 'product-images' && bucket !== 'site-assets') {
      return NextResponse.json(
        { error: 'Invalid bucket. Must be product-images or site-assets' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const maxSizeMB = (MAX_FILE_SIZE / 1024 / 1024).toFixed(1);
      return NextResponse.json(
        {
          error: `File too large. Maximum size: ${maxSizeMB}MB`,
        },
        { status: 400 }
      );
    }

    // Validate with helper function (additional checks)
    try {
      validateImageFile(file);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid file' },
        { status: 400 }
      );
    }

    // Upload file to Supabase Storage
    const result = await uploadFile(file, {
      bucket,
      path: path || undefined,
      upsert: false,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path,
      bucket: result.bucket,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to upload file',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { path, bucket } = body;

    if (!path || !bucket) {
      return NextResponse.json(
        { error: 'Missing path or bucket' },
        { status: 400 }
      );
    }

    // Validate bucket
    if (bucket !== 'product-images' && bucket !== 'site-assets') {
      return NextResponse.json(
        { error: 'Invalid bucket' },
        { status: 400 }
      );
    }

    // Delete file from storage
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete file',
      },
      { status: 500 }
    );
  }
}
