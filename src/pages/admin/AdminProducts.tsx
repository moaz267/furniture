import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  description: string | null;
  description_ar: string | null;
  price: number;
  images: string[];
  category_id: string | null;
  in_stock: boolean;
  featured: boolean;
  material: string | null;
  material_ar: string | null;
  color: string | null;
  color_ar: string | null;
  dimensions: string | null;
}

interface Category {
  id: string;
  name: string;
  name_ar: string;
}

const emptyProduct: Omit<Product, 'id'> = {
  name: '',
  name_ar: '',
  slug: '',
  description: '',
  description_ar: '',
  price: 0,
  images: [],
  category_id: null,
  in_stock: true,
  featured: false,
  material: '',
  material_ar: '',
  color: '',
  color_ar: '',
  dimensions: '',
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data.map(p => ({ ...p, images: p.images || [] })));
    }
    setIsLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name, name_ar');
    if (data) setCategories(data);
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormData(emptyProduct);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      name_ar: product.name_ar,
      slug: product.slug,
      description: product.description || '',
      description_ar: product.description_ar || '',
      price: product.price,
      images: product.images || [],
      category_id: product.category_id,
      in_stock: product.in_stock,
      featured: product.featured,
      material: product.material || '',
      material_ar: product.material_ar || '',
      color: product.color || '',
      color_ar: product.color_ar || '',
      dimensions: product.dimensions || '',
    });
    setIsDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, publicUrl]
      }));
    }
    setUploadingImage(false);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    const productData = {
      ...formData,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description || null,
      description_ar: formData.description_ar || null,
      material: formData.material || null,
      material_ar: formData.material_ar || null,
      color: formData.color || null,
      color_ar: formData.color_ar || null,
      dimensions: formData.dimensions || null,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (!error) {
        await fetchProducts();
        setIsDialogOpen(false);
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (!error) {
        await fetchProducts();
        setIsDialogOpen(false);
      }
    }

    setIsSaving(false);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EG').format(price);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold">Products Management</h1>
            <p className="text-muted-foreground mt-1">Add, edit, and manage your furniture catalog</p>
          </div>
          <Button onClick={openCreateDialog} className="gradient-gold text-charcoal">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-card rounded-xl shadow-card overflow-hidden">
              <div className="aspect-square relative">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {product.featured && (
                    <Badge className="bg-gold text-charcoal">Featured</Badge>
                  )}
                  {!product.in_stock && (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{product.name_ar}</p>
                <p className="text-lg font-bold text-gold mt-2">
                  {formatPrice(product.price)} EGP
                </p>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEditDialog(product)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 bg-card rounded-xl">
            <p className="text-muted-foreground mb-4">No products yet</p>
            <Button onClick={openCreateDialog} className="gradient-gold text-charcoal">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          </div>
        )}
      </div>

      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Images */}
            <div>
              <Label>Product Images</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-gold transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-gold" />
                  ) : (
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  )}
                </label>
              </div>
            </div>

            {/* Names */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name (English)</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Name (Arabic)</Label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                  className="mt-1"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Description (English)</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label>Description (Arabic)</Label>
                <Textarea
                  value={formData.description_ar || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                  className="mt-1"
                  rows={3}
                  dir="rtl"
                />
              </div>
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (EGP)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category_id || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value || null }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Material */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Material (English)</Label>
                <Input
                  value={formData.material || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Material (Arabic)</Label>
                <Input
                  value={formData.material_ar || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, material_ar: e.target.value }))}
                  className="mt-1"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Color (English)</Label>
                <Input
                  value={formData.color || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Color (Arabic)</Label>
                <Input
                  value={formData.color_ar || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, color_ar: e.target.value }))}
                  className="mt-1"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Dimensions */}
            <div>
              <Label>Dimensions</Label>
              <Input
                value={formData.dimensions || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                placeholder="e.g., 200cm x 180cm x 45cm"
                className="mt-1"
              />
            </div>

            {/* Toggles */}
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.in_stock}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, in_stock: checked }))}
                />
                <Label>In Stock</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
                <Label>Featured</Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gradient-gold text-charcoal"
                onClick={handleSave}
                disabled={isSaving || !formData.name || !formData.name_ar || formData.price <= 0}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProducts;
