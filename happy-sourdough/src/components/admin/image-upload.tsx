'use client';

/**
 * Image Upload Component
 * Drag-and-drop upload zone with preview, progress, and delete functionality
 * Supports multiple images and different storage buckets
 */

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import type { StorageBucket } from '@/lib/supabase/storage';

export interface UploadedImage {
  url: string;
  path: string;
  bucket: StorageBucket;
}

interface ImageUploadProps {
  bucket?: StorageBucket;
  maxFiles?: number;
  maxSize?: number; // in MB
  onUploadComplete?: (images: UploadedImage[]) => void;
  onDelete?: (image: UploadedImage) => void;
  className?: string;
  existingImages?: UploadedImage[];
  disabled?: boolean;
}

export function ImageUpload({
  bucket = 'product-images',
  maxFiles = 5,
  maxSize = 5,
  onUploadComplete,
  onDelete,
  className,
  existingImages = [],
  disabled = false,
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = useCallback(
    (file: File): boolean => {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP`);
        return false;
      }

      // Check file size
      const maxSizeBytes = maxSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        toast.error(
          `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: ${maxSize}MB`
        );
        return false;
      }

      return true;
    },
    [maxSize]
  );

  const uploadFile = async (file: File): Promise<UploadedImage | null> => {
    if (!validateFile(file)) {
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      return {
        url: result.url,
        path: result.path,
        bucket: result.bucket,
      };
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload image'
      );
      return null;
    }
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return;

      const fileArray = Array.from(files);

      // Check total file count
      if (images.length + fileArray.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} images allowed`);
        return;
      }

      setUploading(true);
      setProgress(0);

      const uploadedImages: UploadedImage[] = [];
      const totalFiles = fileArray.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = fileArray[i];
        const result = await uploadFile(file);

        if (result) {
          uploadedImages.push(result);
        }

        setProgress(((i + 1) / totalFiles) * 100);
      }

      if (uploadedImages.length > 0) {
        const newImages = [...images, ...uploadedImages];
        setImages(newImages);
        toast.success(`${uploadedImages.length} image(s) uploaded successfully`);

        if (onUploadComplete) {
          onUploadComplete(uploadedImages);
        }
      }

      setUploading(false);
      setProgress(0);
    },
    [images, maxFiles, onUploadComplete, disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      handleFiles(files);
    },
    [handleFiles, disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      handleFiles(files);

      // Reset input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFiles]
  );

  const handleDelete = async (image: UploadedImage) => {
    if (disabled) return;

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: image.path,
          bucket: image.bucket,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }

      const newImages = images.filter((img) => img.url !== image.url);
      setImages(newImages);
      toast.success('Image deleted successfully');

      if (onDelete) {
        onDelete(image);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete image'
      );
    }
  };

  return (
    <div className={className}>
      {/* Upload Zone */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          {uploading ? (
            <div className="w-full max-w-xs space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Uploading... {Math.round(progress)}%
              </p>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">
                  Drag and drop images here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, WebP up to {maxSize}MB • Max {maxFiles} images
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={image.url} className="relative group overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image);
                      }}
                      disabled={disabled}
                      className="h-10 w-10"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !uploading && (
        <div className="mt-6 text-center py-8 border border-dashed rounded-lg">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}
