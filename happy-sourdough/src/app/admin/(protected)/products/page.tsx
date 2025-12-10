'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, EyeOff, Star, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { ProductCategory } from '@/types/database';
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  toggleProductFeatured,
  createVariant,
  updateVariant,
  deleteVariant,
  generateSlug,
  type ProductWithVariants,
} from '@/lib/supabase/admin/products';
import { ProductImageManager, type ProductImageData } from '@/components/admin/products/product-image-manager';

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'bread', label: 'Bread' },
  { value: 'pastry', label: 'Pastry' },
  { value: 'cake', label: 'Cake' },
  { value: 'cookie', label: 'Cookie' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'merchandise', label: 'Merchandise' },
];

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  bread: 'bg-amber-100 text-amber-800',
  pastry: 'bg-pink-100 text-pink-800',
  cake: 'bg-purple-100 text-purple-800',
  cookie: 'bg-orange-100 text-orange-800',
  seasonal: 'bg-green-100 text-green-800',
  merchandise: 'bg-blue-100 text-blue-800',
};

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  base_price: number;
  image_url: string;
  gallery_urls: string[];
  is_available: boolean;
  is_featured: boolean;
  lead_time_hours: number;
}

interface VariantFormData {
  name: string;
  price_adjustment: number;
  sku: string;
  is_available: boolean;
  is_default: boolean;
}

const defaultProductForm: ProductFormData = {
  name: '',
  slug: '',
  description: '',
  category: 'bread',
  base_price: 0,
  image_url: '',
  gallery_urls: [],
  is_available: true,
  is_featured: false,
  lead_time_hours: 24,
};

const defaultVariantForm: VariantFormData = {
  name: '',
  price_adjustment: 0,
  sku: '',
  is_available: true,
  is_default: false,
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Product dialogs
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithVariants | null>(null);
  const [productForm, setProductForm] = useState<ProductFormData>(defaultProductForm);
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<ProductWithVariants | null>(null);

  // Variant dialog
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [variantProduct, setVariantProduct] = useState<ProductWithVariants | null>(null);
  const [editingVariant, setEditingVariant] = useState<{ id: string } | null>(null);
  const [variantForm, setVariantForm] = useState<VariantFormData>(defaultVariantForm);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const stats = {
    total: products.length,
    available: products.filter((p) => p.is_available).length,
    featured: products.filter((p) => p.is_featured).length,
    categories: new Set(products.map((p) => p.category)).size,
  };

  // Product handlers
  const handleOpenProductDialog = (product?: ProductWithVariants) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        category: product.category,
        base_price: product.base_price,
        image_url: product.image_url || '',
        gallery_urls: product.gallery_urls || [],
        is_available: product.is_available,
        is_featured: product.is_featured,
        lead_time_hours: product.lead_time_hours,
      });
    } else {
      setEditingProduct(null);
      setProductForm(defaultProductForm);
    }
    setProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.slug || productForm.base_price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: productForm.name,
          slug: productForm.slug,
          description: productForm.description || null,
          category: productForm.category,
          base_price: productForm.base_price,
          image_url: productForm.image_url || null,
          is_available: productForm.is_available,
          is_featured: productForm.is_featured,
          lead_time_hours: productForm.lead_time_hours,
        });
        toast.success('Product updated successfully');
      } else {
        await createProduct({
          name: productForm.name,
          slug: productForm.slug,
          description: productForm.description,
          category: productForm.category,
          base_price: productForm.base_price,
          image_url: productForm.image_url || undefined,
          is_available: productForm.is_available,
          is_featured: productForm.is_featured,
          lead_time_hours: productForm.lead_time_hours,
        });
        toast.success('Product created successfully');
      }
      setProductDialogOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    try {
      setSaving(true);
      await deleteProduct(deletingProduct.id);
      toast.success('Product deleted successfully');
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (product: ProductWithVariants) => {
    try {
      await toggleProductAvailability(product.id, !product.is_available);
      toast.success(`Product ${product.is_available ? 'hidden' : 'shown'}`);
      loadProducts();
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      toast.error('Failed to update product');
    }
  };

  const handleToggleFeatured = async (product: ProductWithVariants) => {
    try {
      await toggleProductFeatured(product.id, !product.is_featured);
      toast.success(`Product ${product.is_featured ? 'unfeatured' : 'featured'}`);
      loadProducts();
    } catch (error) {
      console.error('Failed to toggle featured:', error);
      toast.error('Failed to update product');
    }
  };

  // Variant handlers
  const handleOpenVariantDialog = (product: ProductWithVariants, variant?: { id: string; name: string; price_adjustment: number; sku: string | null; is_available: boolean; is_default: boolean }) => {
    setVariantProduct(product);
    if (variant) {
      setEditingVariant({ id: variant.id });
      setVariantForm({
        name: variant.name,
        price_adjustment: variant.price_adjustment,
        sku: variant.sku || '',
        is_available: variant.is_available,
        is_default: variant.is_default,
      });
    } else {
      setEditingVariant(null);
      setVariantForm(defaultVariantForm);
    }
    setVariantDialogOpen(true);
  };

  const handleSaveVariant = async () => {
    if (!variantProduct || !variantForm.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      if (editingVariant) {
        await updateVariant(editingVariant.id, {
          name: variantForm.name,
          price_adjustment: variantForm.price_adjustment,
          sku: variantForm.sku || null,
          is_available: variantForm.is_available,
          is_default: variantForm.is_default,
        });
        toast.success('Variant updated successfully');
      } else {
        await createVariant({
          product_id: variantProduct.id,
          name: variantForm.name,
          price_adjustment: variantForm.price_adjustment,
          sku: variantForm.sku || undefined,
          is_available: variantForm.is_available,
          is_default: variantForm.is_default,
        });
        toast.success('Variant created successfully');
      }
      setVariantDialogOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Failed to save variant:', error);
      toast.error('Failed to save variant');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      await deleteVariant(variantId);
      toast.success('Variant deleted successfully');
      loadProducts();
    } catch (error) {
      console.error('Failed to delete variant:', error);
      toast.error('Failed to delete variant');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your bakery products and variants
          </p>
        </div>
        <Button onClick={() => handleOpenProductDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Featured</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{stats.featured}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.categories}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Products</CardTitle>
              <CardDescription>
                Manage product catalog and pricing
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => handleOpenProductDialog()}
              >
                Add your first product
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                              No img
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.slug}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={CATEGORY_COLORS[product.category]}>
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(product.base_price)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.variants.length === 0 ? (
                          <span className="text-sm text-muted-foreground">No variants</span>
                        ) : (
                          product.variants.slice(0, 2).map((v) => (
                            <Badge key={v.id} variant="outline" className="text-xs">
                              {v.name}
                              {v.price_adjustment !== 0 && (
                                <span className="ml-1">
                                  {v.price_adjustment > 0 ? '+' : ''}
                                  {formatPrice(v.price_adjustment)}
                                </span>
                              )}
                            </Badge>
                          ))
                        )}
                        {product.variants.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.variants.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.is_available ? (
                          <Badge variant="default" className="bg-green-500">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Hidden</Badge>
                        )}
                        {product.is_featured && (
                          <Badge variant="default" className="bg-amber-500">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenProductDialog(product)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenVariantDialog(product)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Variant
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleAvailability(product)}>
                            {product.is_available ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Hide Product
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Show Product
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleFeatured(product)}>
                            {product.is_featured ? (
                              <>
                                <StarOff className="mr-2 h-4 w-4" />
                                Remove Featured
                              </>
                            ) : (
                              <>
                                <Star className="mr-2 h-4 w-4" />
                                Make Featured
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setDeletingProduct(product);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Update product details and settings'
                : 'Add a new product to your catalog'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => {
                    setProductForm({
                      ...productForm,
                      name: e.target.value,
                      slug: editingProduct ? productForm.slug : generateSlug(e.target.value),
                    });
                  }}
                  placeholder="Sourdough Loaf"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={productForm.slug}
                  onChange={(e) =>
                    setProductForm({ ...productForm, slug: e.target.value })
                  }
                  placeholder="sourdough-loaf"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({ ...productForm, description: e.target.value })
                }
                placeholder="Describe your product..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={productForm.category}
                  onValueChange={(value) =>
                    setProductForm({
                      ...productForm,
                      category: value as ProductCategory,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="base_price">Base Price ($) *</Label>
                <Input
                  id="base_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.base_price}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      base_price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={productForm.image_url}
                  onChange={(e) =>
                    setProductForm({ ...productForm, image_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead_time">Lead Time (hours)</Label>
                <Input
                  id="lead_time"
                  type="number"
                  min="0"
                  value={productForm.lead_time_hours}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      lead_time_hours: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_available"
                  checked={productForm.is_available}
                  onCheckedChange={(checked) =>
                    setProductForm({ ...productForm, is_available: checked })
                  }
                />
                <Label htmlFor="is_available">Available for sale</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_featured"
                  checked={productForm.is_featured}
                  onCheckedChange={(checked) =>
                    setProductForm({ ...productForm, is_featured: checked })
                  }
                />
                <Label htmlFor="is_featured">Featured product</Label>
              </div>
            </div>

            {/* Variants section for editing */}
            {editingProduct && editingProduct.variants.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>Variants</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenVariantDialog(editingProduct)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Variant
                  </Button>
                </div>
                <div className="space-y-2">
                  {editingProduct.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div>
                        <div className="font-medium">{variant.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {variant.price_adjustment >= 0 ? '+' : ''}
                          {formatPrice(variant.price_adjustment)}
                          {variant.sku && ` • SKU: ${variant.sku}`}
                          {variant.is_default && ' • Default'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenVariantDialog(editingProduct, variant)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVariant(variant.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProduct} disabled={saving}>
              {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingProduct?.name}&quot;? This action
              cannot be undone and will also delete all variants.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Variant Dialog */}
      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? 'Edit Variant' : 'Add Variant'}
            </DialogTitle>
            <DialogDescription>
              {editingVariant
                ? 'Update variant details'
                : `Add a new variant to ${variantProduct?.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="variant_name">Name *</Label>
              <Input
                id="variant_name"
                value={variantForm.name}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, name: e.target.value })
                }
                placeholder="Large"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_adjustment">Price Adjustment ($)</Label>
                <Input
                  id="price_adjustment"
                  type="number"
                  step="0.01"
                  value={variantForm.price_adjustment}
                  onChange={(e) =>
                    setVariantForm({
                      ...variantForm,
                      price_adjustment: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Added to base price. Use negative for discount.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={variantForm.sku}
                  onChange={(e) =>
                    setVariantForm({ ...variantForm, sku: e.target.value })
                  }
                  placeholder="BREAD-001-L"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="variant_available"
                  checked={variantForm.is_available}
                  onCheckedChange={(checked) =>
                    setVariantForm({ ...variantForm, is_available: checked })
                  }
                />
                <Label htmlFor="variant_available">Available</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="variant_default"
                  checked={variantForm.is_default}
                  onCheckedChange={(checked) =>
                    setVariantForm({ ...variantForm, is_default: checked })
                  }
                />
                <Label htmlFor="variant_default">Default variant</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVariantDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVariant} disabled={saving}>
              {saving ? 'Saving...' : editingVariant ? 'Update Variant' : 'Add Variant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
