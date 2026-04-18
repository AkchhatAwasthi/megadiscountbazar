import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Upload, X, ChevronUp, ChevronDown, Check, Info, Wand2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id?: string;
  name: string;
  price: number;
  original_price?: number;
  category_id?: string;
  weight?: string;
  pieces?: string;
  care_instructions?: string;
  description?: string;
  stock_quantity?: number;
  is_active?: boolean;
  is_bestseller?: boolean;
  new_arrival?: boolean;
  images?: string[];
  features?: any;
  product_specs?: any;
  marketing_info?: any;
  sku?: string;
  available_sizes?: string[];
  available_weights?: string[];
  size_chart_url?: string;
  is_tailored_available?: boolean;
  custom_size_note?: string;
}

interface ProductFormProps {
  product?: Product;
  isEdit?: boolean;
}

const ProductForm = ({ product: propProduct, isEdit = false }: ProductFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();

  const [formData, setFormData] = useState<Product>({
    name: '',
    price: 0,
    original_price: 0,
    category_id: '',
    weight: '',
    description: '',
    stock_quantity: 0,
    is_active: true,
    is_bestseller: false,
    new_arrival: false,
    sku: '',
    pieces: '',
    care_instructions: '',
    available_sizes: [],
    available_weights: [],
    size_chart_url: '',
    is_tailored_available: false,
    custom_size_note: ''
  });

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [urlPreviewError, setUrlPreviewError] = useState(false);
  const [previewTab, setPreviewTab] = useState<'card' | 'detail'>('card');

  // Clothing specific specs
  const [productSpecs, setProductSpecs] = useState({
    fabric: '',
    pattern: '',
    fit: '',
    occasion: '',
    sleeve_type: '',
    neck_type: '',
    work_type: '',
    origin: ''
  });

  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  const [marketingInfo, setMarketingInfo] = useState({
    marketedBy: '',
    address: '',
    city: '',
    state: '',
    license: ''
  });

  const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];

  useEffect(() => {
    fetchCategories();
    fetchAvailableFeatures();
    if (id && isEdit) {
      fetchProduct();
    } else if (propProduct) {
      setFormData(propProduct);
      setImages(propProduct.images || []);
    }
  }, [id, isEdit, propProduct]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAvailableFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('product_features')
        .select('name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableFeatures(data?.map(f => f.name) || []);
    } catch (error) {
      console.error('Error fetching features:', error);
      // Fallback to default features if table doesn't exist yet
      setAvailableFeatures([
        'Hand Embroidered', 'Pure Silk', 'Custom Fit', 'Designer Wear',
        'Ready to Ship', 'Sustainable Fabric', 'Handwoven', 'Zari Work', 'Bridal Exclusive'
      ]);
    }
  };

  const fetchProduct = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        ...data,
        available_sizes: (data as any).available_sizes || [],
        available_weights: (data as any).available_weights || [],
        size_chart_url: (data as any).size_chart_url || '',
        is_tailored_available: (data as any).is_tailored_available || false,
        custom_size_note: (data as any).custom_size_note || '',
        care_instructions: (data as any).care_instructions || (data as any).storage_instructions || ''
      });
      setImages(data.images || []);

      // Handle product specs
      const productData: any = data;
      if (productData.product_specs && typeof productData.product_specs === 'object') {
        const specs = productData.product_specs;
        setProductSpecs({
          fabric: specs.fabric || '',
          pattern: specs.pattern || '',
          fit: specs.fit || '',
          occasion: specs.occasion || '',
          sleeve_type: specs.sleeve_type || '',
          neck_type: specs.neck_type || '',
          work_type: specs.work_type || specs.work || '',
          origin: specs.origin || ''
        });
      }

      if (data.features && Array.isArray(data.features)) {
        setSelectedFeatures(data.features as string[]);
      } else if (data.features && typeof data.features === 'object') {
        const oldFeatures = data.features as any;
        const convertedFeatures = Object.entries(oldFeatures)
          .filter(([_, value]) => value === true)
          .map(([key, _]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
        setSelectedFeatures(convertedFeatures);
      }

      if (data.marketing_info && typeof data.marketing_info === 'object') {
        const info = data.marketing_info as any;
        setMarketingInfo({
          marketedBy: info.marketedBy || '',
          address: info.address || '',
          city: info.city || '',
          state: info.state || '',
          license: info.license || info.fssaiLicense || ''
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSKU = () => {
    if (!formData.name) {
      toast({
        title: "Name required",
        description: "Please enter a product name first to generate a SKU.",
        variant: "destructive",
      });
      return;
    }
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 15);
    const random = Math.floor(1000 + Math.random() * 9000);
    const newSku = `${slug.toUpperCase()}-${random}`;
    handleInputChange('sku', newSku);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
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
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (let i = 0; i < Math.min(files.length, 10 - images.length); i++) {
      const file = files[i];
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        newImages.push(imageUrl);
      }
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];

    try {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf('products')).join('/');

      await supabase.storage
        .from('product-images')
        .remove([filePath]);
    } catch (error) {
      console.error('Error removing image:', error);
    }

    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImageUp = (index: number) => {
    if (index <= 0) return;
    setImages(prev => {
      const newImages = [...prev];
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      return newImages;
    });
  };

  const moveImageDown = (index: number) => {
    if (index >= images.length - 1) return;
    setImages(prev => {
      const newImages = [...prev];
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      return newImages;
    });
  };

  const addImageFromUrl = () => {
    const url = imageUrlInput.trim();
    if (!url || images.length >= 10) return;
    setImages(prev => [...prev, url]);
    setImageUrlInput('');
    setUrlPreviewError(false);
  };

  const addNewFeature = async () => {
    if (!newFeature.trim()) return;

    try {
      const { error } = await supabase
        .from('product_features')
        .insert({ name: newFeature.trim(), is_active: true });

      if (error && !error.message.includes('relation "product_features" does not exist')) {
        throw error;
      }

      if (!availableFeatures.includes(newFeature.trim())) {
        setAvailableFeatures(prev => [...prev, newFeature.trim()].sort());
      }
      if (!selectedFeatures.includes(newFeature.trim())) {
        setSelectedFeatures(prev => [...prev, newFeature.trim()]);
      }
      setNewFeature('');
      toast({ title: "Feature added", description: `"${newFeature.trim()}" has been added to available features.` });
    } catch (error) {
      console.error('Error adding feature:', error);
      if (!availableFeatures.includes(newFeature.trim())) {
        setAvailableFeatures(prev => [...prev, newFeature.trim()].sort());
      }
      if (!selectedFeatures.includes(newFeature.trim())) {
        setSelectedFeatures(prev => [...prev, newFeature.trim()]);
      }
      setNewFeature('');
    }
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const removeFeatureFromAvailable = async (feature: string) => {
    try {
      const { error } = await supabase
        .from('product_features')
        .update({ is_active: false })
        .eq('name', feature);

      if (error && !error.message.includes('relation "product_features" does not exist')) {
        throw error;
      }

      setAvailableFeatures(prev => prev.filter(f => f !== feature));
      setSelectedFeatures(prev => prev.filter(f => f !== feature));

      toast({ title: "Feature removed", description: `"${feature}" has been removed from available features.` });
    } catch (error) {
      console.error('Error removing feature:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category_id || !formData.price) {
      toast({
        title: "Missing required fields",
        description: "Please fill in name, category, and price.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name: formData.name,
        price: Number(formData.price),
        original_price: Number(formData.original_price) || Number(formData.price),
        category_id: formData.category_id,
        weight: formData.weight,
        description: formData.description,
        stock_quantity: Number(formData.stock_quantity) || 0,
        is_active: formData.is_active,
        is_bestseller: formData.is_bestseller,
        new_arrival: formData.new_arrival,
        images: images,
        features: selectedFeatures,
        product_specs: productSpecs,
        sku: formData.sku,
        pieces: formData.pieces,
        care_instructions: formData.care_instructions,
        marketing_info: marketingInfo,
        available_sizes: formData.available_sizes,
        available_weights: formData.available_weights,
        size_chart_url: formData.size_chart_url,
        is_tailored_available: formData.is_tailored_available,
        custom_size_note: formData.custom_size_note
      };

      if (isEdit && id) {
        const { error } = await supabase
          .from('products')
          .update({
            ...productData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
      }

      toast({
        title: isEdit ? "Product updated!" : "Product created!",
        description: `${formData.name} has been ${isEdit ? 'updated' : 'added'} successfully.`,
      });

      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B38B46]"></div>
      </div>
    );
  }

  const CardStyle = "bg-[var(--color-surface-card)] border-[0.5px] border-[var(--color-border-default)] rounded-[12px] shadow-sm hover:border-[var(--color-brand-red)] hover:shadow-[0_8px_24px_rgba(0,113,220,0.1)] transition-all duration-220";
  const LabelStyle = "text-[var(--color-text-secondary)] text-[12px] font-[500] mb-1.5 block tracking-wide";
  const InputStyle = "h-[40px] px-3 bg-[var(--color-surface-card)] border-[1.5px] border-[var(--color-border-default)] rounded-[8px] text-[14px] text-[var(--color-text-primary)] focus:border-[var(--color-brand-red)] focus:outline-none transition-colors w-full";

  // Live Preview helpers
  const previewImage = images[0] || '';
  const previewCategoryName = categories.find(c => c.id === formData.category_id)?.name || '';
  const previewDiscount =
    Number(formData.original_price) > Number(formData.price) && Number(formData.price) > 0
      ? Math.round(((Number(formData.original_price) - Number(formData.price)) / Number(formData.original_price)) * 100)
      : 0;

  const renderCardPreview = () => (
    <div>
      <div style={{ border: '0.5px solid var(--color-border-default)', borderRadius: 12, padding: 12, background: 'var(--color-surface-card)', maxWidth: 240, margin: '0 auto' }}>
        <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', background: 'var(--color-surface-page)', marginBottom: 12 }}>
          {previewImage ? (
            <img src={previewImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 11, flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 24 }}>🖼️</span>
              <span>No image yet</span>
            </div>
          )}
          {previewDiscount > 0 ? (
            <span style={{ position: 'absolute', top: 6, left: 6, background: '#FCEBEB', color: '#A32D2D', padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 500 }}>{previewDiscount}% OFF</span>
          ) : formData.is_bestseller ? (
            <span style={{ position: 'absolute', top: 6, left: 6, background: '#FAEEDA', color: '#633806', padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 500 }}>BEST SELLER</span>
          ) : formData.new_arrival ? (
            <span style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(220,0,0,0.08)', color: '#0C447C', padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 500 }}>NEW</span>
          ) : null}
        </div>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 6px', lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2 as any, WebkitBoxOrient: 'vertical' as any, minHeight: 34 }}>
          {formData.name || 'Product Name'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 6 }}>
          <span style={{ color: '#F5A623', fontSize: 11 }}>★★★★★</span>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>(124)</span>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>₹{formData.price || 0}</span>
            {Number(formData.original_price) > Number(formData.price) && (
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', textDecoration: 'line-through' }}>₹{formData.original_price}</span>
            )}
          </div>
          {previewDiscount > 0 && (
            <span style={{ fontSize: 10, color: '#2E8B57', fontWeight: 500 }}>You save ₹{Number(formData.original_price) - Number(formData.price)}</span>
          )}
        </div>
        <div style={{ width: '100%', padding: '8px', background: 'var(--color-brand-yellow)', borderRadius: 7, textAlign: 'center', fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>
          🛒 Add to Cart
        </div>
      </div>
      <p style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 6 }}>Card view preview</p>
    </div>
  );

  const renderDetailPreview = () => (
    <div style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 2 }}>
      <div style={{ background: 'var(--color-surface-page)', borderRadius: 10, overflow: 'hidden', marginBottom: 8, position: 'relative', aspectRatio: '4/3' }}>
        {previewImage ? (
          <img src={previewImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 11, flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 20 }}>🖼️</span><span>No image yet</span>
          </div>
        )}
        {previewDiscount > 0 && (
          <span style={{ position: 'absolute', top: 6, left: 6, background: 'var(--color-brand-red)', color: 'white', padding: '2px 7px', borderRadius: 5, fontSize: 10, fontWeight: 600 }}>Save {previewDiscount}%</span>
        )}
      </div>
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 8, overflowX: 'auto' }}>
          {images.slice(0, 6).map((img, i) => (
            <img key={i} src={img} alt="" style={{ width: 36, height: 36, borderRadius: 5, objectFit: 'cover', border: i === 0 ? '1.5px solid var(--color-brand-red)' : '1px solid var(--color-border-default)', flexShrink: 0 }} />
          ))}
        </div>
      )}
      {previewCategoryName && (
        <span style={{ background: 'var(--color-brand-red-light)', color: 'var(--color-brand-red)', padding: '2px 10px', borderRadius: 100, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{previewCategoryName}</span>
      )}
      <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text-primary)', margin: '6px 0 4px', lineHeight: 1.2 }}>
        {formData.name || 'Product Name'}
      </h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, fontSize: 11 }}>
        <span style={{ color: '#F5A623' }}>★★★★★</span>
        <span style={{ color: 'var(--color-text-secondary)' }}>4.8 · 120 Reviews</span>
        <span style={{ color: '#2E8B57', fontWeight: 600, marginLeft: 4 }}>In Stock</span>
      </div>
      <div style={{ borderTop: '1px solid var(--color-border-default)', borderBottom: '1px solid var(--color-border-default)', padding: '8px 0', margin: '6px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
          <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)' }}>₹{formData.price || 0}</span>
          {Number(formData.original_price) > Number(formData.price) && (
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>₹{formData.original_price}</span>
          )}
        </div>
      </div>
      {(formData.available_sizes || []).length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>Select Size</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {(formData.available_sizes || []).map(s => (
              <span key={s} style={{ padding: '4px 10px', border: '1.5px solid var(--color-border-default)', borderRadius: 6, fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{s}</span>
            ))}
          </div>
        </div>
      )}
      {(formData.available_weights || []).length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>Select Weight</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {(formData.available_weights || []).map(w => (
              <span key={w} style={{ padding: '4px 10px', border: '1.5px solid var(--color-border-default)', borderRadius: 6, fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{w}</span>
            ))}
          </div>
        </div>
      )}
      <div style={{ width: '100%', padding: '9px', background: 'var(--color-brand-yellow)', borderRadius: 7, textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>Add to Cart</div>
      <div style={{ width: '100%', padding: '9px', background: 'transparent', border: '1.5px solid var(--color-brand-red)', color: 'var(--color-brand-red)', borderRadius: 7, textAlign: 'center', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Buy Now</div>
      {formData.description && (
        <div style={{ paddingTop: 8, borderTop: '1px solid var(--color-border-default)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 3 }}>Description</p>
          <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{formData.description}</p>
        </div>
      )}
      {(productSpecs.fabric || productSpecs.fit || productSpecs.occasion) && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border-default)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 5 }}>Specifications</p>
          {([['Fabric', productSpecs.fabric], ['Fit', productSpecs.fit], ['Occasion', productSpecs.occasion], ['Pattern', productSpecs.pattern]] as [string, string][]).filter(([, v]) => v).map(([label, val]) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: 4, marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>{label}</span>
              <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-primary)' }}>{val}</span>
            </div>
          ))}
        </div>
      )}
      {selectedFeatures.length > 0 && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border-default)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 5 }}>Features</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {selectedFeatures.map(f => (
              <span key={f} style={{ background: '#F1F5F9', color: 'var(--color-text-secondary)', padding: '2px 8px', borderRadius: 4, fontSize: 10 }}>{f}</span>
            ))}
          </div>
        </div>
      )}
      <p style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 8 }}>Detail page preview</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-[#D4B6A2]/20 pb-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/products')}
            className="text-[#5C4638] hover:text-[#4A1C1F] hover:bg-[#F9F9F7] p-0 mb-2 h-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="uppercase tracking-widest text-xs">Back to Products</span>
          </Button>
          <h1 className="text-[28px] font-[500] text-[var(--color-text-primary)] tracking-[-0.02em]">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-[#5C4638] font-light text-sm tracking-wide">
            {isEdit ? 'Update existing product details' : 'Create a new product in your catalog'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!isEdit && (
            <Badge variant="outline" className="border-[#B38B46] text-[#B38B46] uppercase tracking-widest">New</Badge>
          )}
          {isEdit && formData.is_active && (
            <Badge className="bg-green-50 text-green-700 border-0 uppercase tracking-widest">Active</Badge>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[var(--color-border-default)] pb-4 px-5">
              <CardTitle className="text-[17px] font-[500] text-[var(--color-text-primary)]">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className={LabelStyle}>Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    required
                    className={InputStyle}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className={LabelStyle}>Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleInputChange('category_id', value)}
                  >
                    <SelectTrigger className="border-[#D4B6A2]/30 bg-[#F9F9F7] text-[#4A1C1F] rounded-none">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#D4B6A2]/20">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="text-[#4A1C1F] focus:bg-[#F9F9F7] focus:text-[#4A1C1F]">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku" className={LabelStyle}>SKU</Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="Product SKU"
                    className={InputStyle}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={generateSKU}
                    className="border-[#D4B6A2]/50 text-[#5C4638] hover:bg-[#F9F9F7] text-xs uppercase tracking-wider h-10 px-3"
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className={LabelStyle}>Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                  className={InputStyle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[var(--color-border-default)] pb-4 px-5">
              <CardTitle className="text-[17px] font-[500] text-[var(--color-text-primary)]">Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className={LabelStyle}>Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                    className={InputStyle}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_price" className={LabelStyle}>Original Price (₹)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => handleInputChange('original_price', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className={InputStyle}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_quantity" className={LabelStyle}>Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    className={InputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className={LabelStyle}>Weight</Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="e.g., 500g (Default weight)"
                    className={InputStyle}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="available_weights" className={LabelStyle}>Available Weight Options (Comma separated)</Label>
                  <Input
                    id="available_weights"
                    value={formData.available_weights?.join(', ') || ''}
                    onChange={(e) => handleInputChange('available_weights', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="e.g., 500g, 1kg, 2kg"
                    className={InputStyle}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pieces" className={LabelStyle}>Pieces / Components</Label>
                  <Input
                    id="pieces"
                    value={formData.pieces}
                    onChange={(e) => handleInputChange('pieces', e.target.value)}
                    placeholder="e.g., 3 Piece Set"
                    className={InputStyle}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className={LabelStyle}>Available Sizes</Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SIZES.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        const current = formData.available_sizes || [];
                        handleInputChange('available_sizes',
                          current.includes(size) ? current.filter(s => s !== size) : [...current, size]
                        );
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 6,
                        border: '1.5px solid',
                        borderColor: (formData.available_sizes || []).includes(size) ? 'var(--color-brand-red)' : 'var(--color-border-default)',
                        background: (formData.available_sizes || []).includes(size) ? 'var(--color-brand-red-light)' : 'transparent',
                        color: (formData.available_sizes || []).includes(size) ? 'var(--color-brand-red)' : 'var(--color-text-secondary)',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    className="data-[state=checked]:bg-[var(--color-brand-red)] border-[var(--color-border-default)] rounded-[4px]"
                  />
                  <Label htmlFor="is_active" className={LabelStyle}>Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_bestseller"
                    checked={formData.is_bestseller}
                    onCheckedChange={(checked) => handleInputChange('is_bestseller', checked)}
                    className="data-[state=checked]:bg-[var(--color-brand-red)] border-[var(--color-border-default)] rounded-[4px]"
                  />
                  <Label htmlFor="is_bestseller" className={LabelStyle}>Mark as Best Seller</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new_arrival"
                    checked={formData.new_arrival}
                    onCheckedChange={(checked) => handleInputChange('new_arrival', checked)}
                    className="data-[state=checked]:bg-[var(--color-brand-red)] border-[var(--color-border-default)] rounded-[4px]"
                  />
                  <Label htmlFor="new_arrival" className={LabelStyle}>Mark as New Arrival</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Features */}
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[var(--color-border-default)] pb-4 px-5">
              <CardTitle className="text-[17px] font-[500] text-[var(--color-text-primary)]">Product Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Add New Feature */}
              <div className="space-y-2">
                <Label className={LabelStyle}>Add New Feature</Label>
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Enter new feature name"
                    onKeyPress={(e) => e.key === 'Enter' && addNewFeature()}
                    className={InputStyle}
                  />
                  <Button type="button" onClick={addNewFeature} disabled={!newFeature.trim()} className="bg-[#4A1C1F] hover:bg-[#5C4638] text-white uppercase tracking-widest text-xs rounded-none">
                    Add
                  </Button>
                </div>
              </div>

              {/* Available Features */}
              <div className="space-y-4">
                <Label className={LabelStyle}>Available Features</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-[#D4B6A2]/20 rounded-none p-4 bg-[#F9F9F7]">
                  {availableFeatures.map((feature) => (
                    <div key={feature} className="flex items-center justify-between space-x-2 p-2 hover:bg-white/50 rounded-none transition-colors">
                      <div className="flex items-center space-x-2 flex-1">
                        <Checkbox
                          id={feature}
                          checked={selectedFeatures.includes(feature)}
                          onCheckedChange={() => toggleFeature(feature)}
                          className="data-[state=checked]:bg-[var(--color-brand-red)] border-[var(--color-border-default)] rounded-[4px]"
                        />
                        <Label htmlFor={feature} className="text-sm cursor-pointer flex-1 text-[#5C4638] font-normal normal-case tracking-normal">
                          {feature}
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeatureFromAvailable(feature)}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-700 hover:bg-transparent"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Features Preview */}
              {selectedFeatures.length > 0 && (
                <div className="space-y-2">
                  <Label className={LabelStyle}>Selected Features ({selectedFeatures.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedFeatures.map((feature) => (
                      <Badge key={feature} variant="secondary" className="flex items-center gap-1 rounded-none bg-[#4A1C1F] text-[#F5EFE7] hover:bg-[#5C4638]">
                        {feature}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFeature(feature)}
                          className="h-4 w-4 p-0 hover:bg-transparent text-[#F5EFE7] hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Live Preview */}
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[var(--color-border-default)] pb-4 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[17px] font-[500] text-[var(--color-text-primary)]">Live Preview</CardTitle>
                <div style={{ display: 'flex', background: 'var(--color-surface-page)', borderRadius: 8, padding: 3, gap: 2 }}>
                  {(['card', 'detail'] as const).map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setPreviewTab(tab)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                        border: 'none',
                        cursor: 'pointer',
                        background: previewTab === tab ? 'var(--color-surface-card)' : 'transparent',
                        color: previewTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                        boxShadow: previewTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {tab === 'card' ? 'Card View' : 'Detail Page'}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {previewTab === 'card' ? renderCardPreview() : renderDetailPreview()}
            </CardContent>
          </Card>

          {/* Images */}
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[var(--color-border-default)] pb-4 px-5">
              <CardTitle className="text-[17px] font-[500] text-[var(--color-text-primary)]">Product Images (Max 10)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="images" className={LabelStyle}>Upload Images</Label>
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('images')?.click()}
                  disabled={images.length >= 10 || uploadingImage}
                  className="w-full border-[#D4B6A2]/50 text-[#5C4638] hover:bg-[#F9F9F7] uppercase tracking-widest text-xs rounded-none h-12"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingImage ? 'Uploading...' : `Upload Images (${images.length}/10)`}
                </Button>
              </div>

              <div className="space-y-2">
                <Label className={LabelStyle}>Or Paste Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={imageUrlInput}
                    onChange={(e) => { setImageUrlInput(e.target.value); setUrlPreviewError(false); }}
                    placeholder="https://example.com/image.jpg"
                    className={InputStyle}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImageFromUrl(); } }}
                  />
                  <Button
                    type="button"
                    onClick={addImageFromUrl}
                    disabled={!imageUrlInput.trim() || images.length >= 10}
                    className="bg-[#4A1C1F] hover:bg-[#5C4638] text-white text-xs uppercase tracking-widest rounded-none h-10 px-3 shrink-0"
                  >
                    Add
                  </Button>
                </div>
                {imageUrlInput && !urlPreviewError && (
                  <div className="relative mt-1 rounded overflow-hidden border border-[#D4B6A2]/20">
                    <img
                      src={imageUrlInput}
                      alt="URL preview"
                      className="w-full h-28 object-cover"
                      onError={() => setUrlPreviewError(true)}
                    />
                    <span className="absolute bottom-1 right-1 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">
                      Preview
                    </span>
                  </div>
                )}
                {urlPreviewError && imageUrlInput && (
                  <p className="text-[11px] text-red-500">Cannot load image from this URL</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover border border-[#D4B6A2]/20 rounded-none"
                    />
                    <div className="absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-6 w-6 p-0 bg-white/80 hover:bg-white text-black"
                        onClick={() => moveImageUp(index)}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-6 w-6 p-0 bg-white/80 hover:bg-white text-black"
                        onClick={() => moveImageDown(index)}
                        disabled={index === images.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                        disabled={uploadingImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    {index === 0 && (
                      <Badge className="absolute bottom-1 left-1 text-[10px] bg-[#B38B46] text-white rounded-none border-0">Primary</Badge>
                    )}
                    <Badge className="absolute top-1 left-1 text-[10px] bg-black/50 text-white rounded-none border-0 backdrop-blur-sm">
                      {index + 1}
                    </Badge>
                  </div>
                ))}
              </div>

              {images.length === 0 && (
                <div className="border border-dashed border-[#D4B6A2]/40 rounded-none p-8 text-center bg-[#F9F9F7]">
                  <Upload className="h-8 w-8 mx-auto text-[#D4B6A2] mb-2" />
                  <p className="text-sm text-[#5C4638]">
                    Upload product images
                  </p>
                  <p className="text-xs text-[#7E5A34]/70 mt-1">
                    PNG, JPG up to 10MB each
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clothing Specifications Breakdown */}
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[var(--color-border-default)] pb-4 px-5">
              <CardTitle className="text-[17px] font-[500] text-[var(--color-text-primary)]">Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="fabric" className={LabelStyle}>Fabric</Label>
                <Input
                  id="fabric"
                  value={productSpecs.fabric}
                  onChange={(e) => setProductSpecs({ ...productSpecs, fabric: e.target.value })}
                  placeholder="e.g., Silk, Chiffon"
                  className={InputStyle}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pattern" className={LabelStyle}>Pattern / Work</Label>
                <Input
                  id="pattern"
                  value={productSpecs.pattern}
                  onChange={(e) => setProductSpecs({ ...productSpecs, pattern: e.target.value })}
                  placeholder="e.g., Floral, Zari"
                  className={InputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fit" className={LabelStyle}>Fit</Label>
                  <Input
                    id="fit"
                    value={productSpecs.fit}
                    onChange={(e) => setProductSpecs({ ...productSpecs, fit: e.target.value })}
                    placeholder="e.g., Slim"
                    className={InputStyle}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occasion" className={LabelStyle}>Occasion</Label>
                  <Input
                    id="occasion"
                    value={productSpecs.occasion}
                    onChange={(e) => setProductSpecs({ ...productSpecs, occasion: e.target.value })}
                    placeholder="e.g., Wedding"
                    className={InputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sleeve_type" className={LabelStyle}>Sleeve Type</Label>
                  <Input
                    id="sleeve_type"
                    value={productSpecs.sleeve_type}
                    onChange={(e) => setProductSpecs({ ...productSpecs, sleeve_type: e.target.value })}
                    placeholder="e.g. Full Sleeve"
                    className={InputStyle}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neck_type" className={LabelStyle}>Neck Type</Label>
                  <Input
                    id="neck_type"
                    value={productSpecs.neck_type}
                    onChange={(e) => setProductSpecs({ ...productSpecs, neck_type: e.target.value })}
                    placeholder="e.g. Round Neck"
                    className={InputStyle}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin" className={LabelStyle}>Country of Origin</Label>
                <Input
                  id="origin"
                  value={productSpecs.origin}
                  onChange={(e) => setProductSpecs({ ...productSpecs, origin: e.target.value })}
                  placeholder="e.g., India"
                  className={InputStyle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Care & Marketing */}
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[var(--color-border-default)] pb-4 px-5">
              <CardTitle className="text-[17px] font-[500] text-[var(--color-text-primary)]">Care & Marketing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="care_instructions" className={LabelStyle}>Care Instructions</Label>
                <Textarea
                  id="care_instructions"
                  value={formData.care_instructions}
                  onChange={(e) => handleInputChange('care_instructions', e.target.value)}
                  placeholder="e.g., Dry Clean Only"
                  rows={2}
                  className={InputStyle}
                />
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="font-medium text-[#4A1C1F] text-sm uppercase tracking-wide border-b border-[#D4B6A2]/20 pb-2">Marketing Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="marketedBy" className={LabelStyle}>Marketed By</Label>
                  <Input
                    id="marketedBy"
                    value={marketingInfo.marketedBy}
                    onChange={(e) => setMarketingInfo({ ...marketingInfo, marketedBy: e.target.value })}
                    placeholder="Company name"
                    className={InputStyle}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className={LabelStyle}>Address</Label>
                  <Input
                    id="address"
                    value={marketingInfo.address}
                    onChange={(e) => setMarketingInfo({ ...marketingInfo, address: e.target.value })}
                    placeholder="Company address"
                    className={InputStyle}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className={LabelStyle}>City</Label>
                    <Input
                      id="city"
                      value={marketingInfo.city}
                      onChange={(e) => setMarketingInfo({ ...marketingInfo, city: e.target.value })}
                      placeholder="City"
                      className={InputStyle}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className={LabelStyle}>State</Label>
                    <Input
                      id="state"
                      value={marketingInfo.state}
                      onChange={(e) => setMarketingInfo({ ...marketingInfo, state: e.target.value })}
                      placeholder="State"
                      className={InputStyle}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fssaiLicense" className={LabelStyle}>License</Label>
                  <Input
                    id="fssaiLicense"
                    value={marketingInfo.license}
                    onChange={(e) => setMarketingInfo({ ...marketingInfo, license: e.target.value })}
                    placeholder="License number"
                    className={InputStyle}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className={`${CardStyle} mt-6`}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full h-[40px] bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] text-white rounded-[8px] font-[500] text-[14px] transition-all duration-200 hover:-translate-y-[1px]"
                  disabled={loading || uploadingImage}
                >
                  {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-[40px] bg-transparent border-[1.5px] border-[var(--color-brand-red)] text-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-light)] rounded-[8px] font-[500] text-[14px] transition-all"
                  onClick={() => navigate('/admin/products')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div >
      </form >
    </div >
  );
};

export default ProductForm;
