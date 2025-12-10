'use client';

/**
 * Product Image Manager Component
 * Manages product images (main image + gallery)
 * - Reorder gallery images via drag-and-drop
 * - Set main image from gallery
 * - Upload new images
 * - Delete images
 */

import { useState, useEffect, useCallback } from 'react';
import { Star, GripVertical, Trash2, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ImageUpload, type UploadedImage } from '@/components/admin/image-upload';
import { toast } from 'sonner';

export interface ProductImageData {
  imageUrl: string | null;
  galleryUrls: string[];
}

interface ProductImageManagerProps {
  initialData?: ProductImageData;
  onChange?: (data: ProductImageData) => void;
  disabled?: boolean;
}

export function ProductImageManager({
  initialData,
  onChange,
  disabled = false,
}: ProductImageManagerProps) {
  const [mainImage, setMainImage] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialData?.galleryUrls || []
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange({
        imageUrl: mainImage,
        galleryUrls: galleryImages,
      });
    }
  }, [mainImage, galleryImages, onChange]);

  const handleUploadComplete = useCallback(
    (uploadedImages: UploadedImage[]) => {
      const newUrls = uploadedImages.map((img) => img.url);

      // If no main image, set first uploaded image as main
      if (!mainImage && newUrls.length > 0) {
        setMainImage(newUrls[0]);
        setGalleryImages([...galleryImages, ...newUrls.slice(1)]);
      } else {
        setGalleryImages([...galleryImages, ...newUrls]);
      }
    },
    [mainImage, galleryImages]
  );

  const handleSetMainImage = useCallback(
    (url: string) => {
      if (disabled) return;

      // If already main image, do nothing
      if (url === mainImage) return;

      // Move current main image to gallery
      const newGallery = mainImage
        ? [...galleryImages.filter((img) => img !== url), mainImage]
        : galleryImages.filter((img) => img !== url);

      setMainImage(url);
      setGalleryImages(newGallery);
      toast.success('Main image updated');
    },
    [mainImage, galleryImages, disabled]
  );

  const handleDeleteImage = useCallback(
    (url: string) => {
      if (disabled) return;

      if (url === mainImage) {
        // If deleting main image, promote first gallery image to main
        if (galleryImages.length > 0) {
          setMainImage(galleryImages[0]);
          setGalleryImages(galleryImages.slice(1));
        } else {
          setMainImage(null);
        }
        toast.success('Main image deleted');
      } else {
        setGalleryImages(galleryImages.filter((img) => img !== url));
        toast.success('Gallery image deleted');
      }
    },
    [mainImage, galleryImages, disabled]
  );

  // Drag and drop handlers for reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newGallery = [...galleryImages];
    const draggedItem = newGallery[draggedIndex];
    newGallery.splice(draggedIndex, 1);
    newGallery.splice(index, 0, draggedItem);

    setGalleryImages(newGallery);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const allImages = mainImage ? [mainImage, ...galleryImages] : galleryImages;
  const existingImages: UploadedImage[] = allImages.map((url) => ({
    url,
    path: url.split('/').pop() || '',
    bucket: 'product-images',
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
          <CardDescription>
            Upload and manage product images. The main image is shown on product cards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Image Section */}
          {mainImage && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <h3 className="font-medium">Main Image</h3>
                <Badge variant="secondary" className="ml-auto">
                  Primary
                </Badge>
              </div>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-video group">
                    <img
                      src={mainImage}
                      alt="Main product image"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteImage(mainImage)}
                        disabled={disabled}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Gallery Section */}
          {galleryImages.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="h-4 w-4" />
                  <h3 className="font-medium">Gallery Images</h3>
                  <Badge variant="outline" className="ml-auto">
                    {galleryImages.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((url, index) => (
                    <Card
                      key={url}
                      className="relative group overflow-hidden cursor-move"
                      draggable={!disabled}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square relative">
                          <img
                            src={url}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {/* Drag handle */}
                          <div className="absolute top-2 left-2 bg-black/70 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="h-4 w-4 text-white" />
                          </div>
                          {/* Actions overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetMainImage(url);
                              }}
                              disabled={disabled}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Set Main
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteImage(url);
                              }}
                              disabled={disabled}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Upload New Images */}
          <Separator />
          <div>
            <h3 className="font-medium mb-3">Upload New Images</h3>
            <ImageUpload
              bucket="product-images"
              maxFiles={10}
              maxSize={5}
              onUploadComplete={handleUploadComplete}
              onDelete={(image) => handleDeleteImage(image.url)}
              disabled={disabled}
              existingImages={[]}
            />
          </div>

          {/* Helper Text */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Tips:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Upload high-quality images for best results</li>
              <li>
                The main image appears on product cards and in search results
              </li>
              <li>Gallery images can be reordered by dragging</li>
              <li>Click "Set Main" on any gallery image to make it the main image</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
