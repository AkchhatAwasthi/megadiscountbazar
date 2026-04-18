import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CategoryProductManager from '@/components/CategoryProductManager';

interface Category {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

interface CategoryFormProps {
  category?: Category;
  isEdit?: boolean;
}

const CategoryForm = ({ category: propCategory, isEdit = false }: CategoryFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();

  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    is_active: true,
    image_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    if (id && isEdit) {
      fetchCategory();
    } else if (propCategory) {
      setFormData({
        name: propCategory.name,
        description: propCategory.description,
        is_active: propCategory.is_active,
        image_url: propCategory.image_url
      });
    }
  }, [id, isEdit, propCategory]);

  const fetchCategory = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products(count)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name,
        description: data.description,
        is_active: data.is_active,
        image_url: data.image_url
      });

      setProductCount(data.products?.length || 0);
    } catch (error) {
      console.error('Error fetching category:', error);
      toast({
        title: "Error",
        description: "Failed to fetch category details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductRemoved = () => {
    setProductCount(prev => Math.max(0, prev - 1));
  };

  const handleInputChange = (field: keyof Category, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('category-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      handleInputChange('image_url', imageUrl);
    }
  };

  const removeImage = async () => {
    if (formData.image_url) {
      try {
        const url = new URL(formData.image_url);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts.slice(pathParts.indexOf('categories')).join('/');

        await supabase.storage
          .from('category-images')
          .remove([filePath]);
      } catch (error) {
        console.error('Error removing image:', error);
      }
    }
    handleInputChange('image_url', '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      toast({
        title: "Missing required fields",
        description: "Please fill in name and description.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isEdit && id) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            description: formData.description,
            is_active: formData.is_active,
            image_url: formData.image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({
            name: formData.name,
            description: formData.description,
            is_active: formData.is_active,
            image_url: formData.image_url
          });

        if (error) throw error;
      }

      toast({
        title: isEdit ? "Category updated!" : "Category created!",
        description: `${formData.name} has been ${isEdit ? 'updated' : 'added'} successfully.`,
      });

      navigate('/admin/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => navigate('/admin/categories')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 13, color: 'var(--color-text-secondary)', padding: 0, marginBottom: 8,
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
          Back to Categories
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>
          {isEdit ? 'Edit Category' : 'Add New Category'}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
          {isEdit ? 'Update category details and manage products' : 'Create a new product category'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}
          className="max-lg:grid-cols-1">

          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Basic Information */}
            <div style={{ background: 'var(--color-surface-card)', border: '0.5px solid var(--color-border-default)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border-default)' }}>
                <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text-primary)' }}>Basic Information</span>
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label htmlFor="name" style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    Category Name <span style={{ color: 'var(--color-brand-red-bright)' }}>*</span>
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter category name"
                    required
                    style={{
                      height: 40, padding: '0 12px',
                      border: '1.5px solid var(--color-border-default)', borderRadius: 8,
                      fontSize: 14, color: 'var(--color-text-primary)', background: 'var(--color-surface-card)', outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label htmlFor="description" style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    Description <span style={{ color: 'var(--color-brand-red-bright)' }}>*</span>
                  </label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter category description"
                    rows={4}
                    required
                    style={{
                      padding: '10px 12px',
                      border: '1.5px solid var(--color-border-default)', borderRadius: 8,
                      fontSize: 14, color: 'var(--color-text-primary)', background: 'var(--color-surface-card)', outline: 'none',
                      resize: 'vertical', minHeight: 100,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label htmlFor="status" style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Status</label>
                  <Select
                    value={formData.is_active ? 'active' : 'inactive'}
                    onValueChange={(value) => handleInputChange('is_active', value === 'active')}
                  >
                    <SelectTrigger style={{
                      height: 40, padding: '0 12px',
                      border: '1.5px solid var(--color-border-default)', borderRadius: 8,
                      fontSize: 14, color: 'var(--color-text-primary)', background: 'var(--color-surface-card)',
                    }}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[var(--color-border-default)] rounded-lg">
                      <SelectItem value="active" className="text-green-700">Active</SelectItem>
                      <SelectItem value="inactive" className="text-gray-500">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Product Management — Only in edit mode */}
            {isEdit && id && (
              <div style={{ border: '0.5px solid var(--color-border-default)', borderRadius: 12, overflow: 'hidden' }}>
                <CategoryProductManager
                  categoryId={id}
                  categoryName={formData.name || 'Category'}
                  onProductRemoved={handleProductRemoved}
                />
              </div>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Category Image */}
            <div style={{ background: 'var(--color-surface-card)', border: '0.5px solid var(--color-border-default)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border-default)' }}>
                <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text-primary)' }}>Category Image</span>
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Upload Image</label>
                <input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('imageFile')?.click()}
                  disabled={uploadingImage}
                  style={{
                    width: '100%', height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    border: '1.5px solid var(--color-brand-red)', borderRadius: 8, background: 'transparent',
                    color: 'var(--color-brand-red)', fontSize: 13, fontWeight: 500, cursor: uploadingImage ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s ease', opacity: uploadingImage ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { if (!uploadingImage) (e.currentTarget as HTMLElement).style.background = 'var(--color-brand-red-light)'; }}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <Upload style={{ width: 16, height: 16 }} />
                  {uploadingImage ? 'Uploading...' : 'Choose Image'}
                </button>

                {!formData.image_url && (
                  <div style={{
                    border: '2px dashed var(--color-border-default)', borderRadius: 10,
                    padding: 32, textAlign: 'center', background: '#FAFBFC',
                  }}>
                    <Upload style={{ width: 32, height: 32, color: '#CBD5E1', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>Upload category image</p>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>PNG, JPG up to 10MB</p>
                  </div>
                )}

                {formData.image_url && (
                  <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
                    <img
                      src={formData.image_url}
                      alt="Category preview"
                      style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }}
                    />
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.2s ease',
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.4)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0)'}
                    >
                      <button
                        type="button"
                        onClick={removeImage}
                        disabled={uploadingImage}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: 'var(--color-brand-red-bright)', color: 'var(--color-surface-card)', border: 'none',
                          borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                          opacity: uploadingImage ? 0.6 : 1,
                        }}
                      >
                        <X style={{ width: 14, height: 14 }} /> Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Category Card Preview */}
            <div style={{ background: 'var(--color-surface-card)', border: '0.5px solid var(--color-border-default)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text-primary)' }}>Card Preview</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', background: 'var(--color-surface-page)', padding: '3px 8px', borderRadius: 6 }}>Live</span>
              </div>
              <div style={{ padding: 20 }}>
                {/* Category Card mock */}
                <div style={{
                  borderRadius: 12, overflow: 'hidden', border: '0.5px solid var(--color-border-default)',
                  background: 'var(--color-surface-card)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'box-shadow 0.2s ease',
                }}>
                  {/* Image */}
                  <div style={{ position: 'relative', aspectRatio: '4/3', background: 'var(--color-surface-page)', overflow: 'hidden' }}>
                    {formData.image_url ? (
                      <img
                        src={formData.image_url}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--color-text-muted)' }}>
                        <span style={{ fontSize: 28 }}>🖼️</span>
                        <span style={{ fontSize: 11 }}>No image uploaded</span>
                      </div>
                    )}
                    {/* Status badge */}
                    <span style={{
                      position: 'absolute', top: 8, right: 8,
                      padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                      background: formData.is_active ? '#EAF3DE' : '#F1EFE8',
                      color: formData.is_active ? '#27500A' : '#444441',
                    }}>
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {/* Content */}
                  <div style={{ padding: '14px 16px' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px', lineHeight: 1.3 }}>
                      {formData.name || 'Category Name'}
                    </h3>
                    <p style={{
                      fontSize: 12, color: 'var(--color-text-secondary)', margin: '0 0 12px',
                      lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2 as any,
                      WebkitBoxOrient: 'vertical' as any, overflow: 'hidden',
                    }}>
                      {formData.description || 'Category description will appear here'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {isEdit ? `${productCount} products` : '0 products'}
                      </span>
                      <span style={{
                        fontSize: 12, fontWeight: 600, color: 'var(--color-brand-red)',
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        cursor: 'default',
                      }}>
                        Shop Now →
                      </span>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 8 }}>Updates as you type</p>
              </div>
            </div>

            {/* Category Stats — edit mode only */}
            {isEdit && (
              <div style={{ background: 'var(--color-surface-card)', border: '0.5px solid var(--color-border-default)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border-default)' }}>
                  <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text-primary)' }}>Category Stats</span>
                </div>
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--color-admin-table-head)' }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Products</span>
                    <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)' }}>{productCount}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                      background: formData.is_active ? '#EAF3DE' : '#F1EFE8',
                      color: formData.is_active ? '#27500A' : '#444441',
                    }}>
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ background: 'var(--color-surface-card)', border: '0.5px solid var(--color-border-default)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                style={{
                  width: '100%', height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: loading || uploadingImage ? '#5A8FFF' : 'var(--color-brand-red)',
                  color: 'var(--color-surface-card)', border: 'none', borderRadius: 8,
                  fontSize: 14, fontWeight: 500, cursor: loading || uploadingImage ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s ease',
                  opacity: loading || uploadingImage ? 0.7 : 1,
                }}
                onMouseEnter={e => { if (!loading && !uploadingImage) (e.currentTarget as HTMLElement).style.background = 'var(--color-brand-red-deep)'; }}
                onMouseLeave={e => { if (!loading && !uploadingImage) (e.currentTarget as HTMLElement).style.background = 'var(--color-brand-red)'; }}
              >
                {loading ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/categories')}
                disabled={loading}
                style={{
                  width: '100%', height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent', color: 'var(--color-text-secondary)',
                  border: '1.5px solid var(--color-border-default)', borderRadius: 8,
                  fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-page)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
                }}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
