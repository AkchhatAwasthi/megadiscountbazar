import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Heart,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Star,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/store/useStore';
import { formatPrice, calculateDiscount } from '@/utils/currency';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { scrollToTopInstant } from '@/utils/scrollToTop';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const { addToCart } = useStore();
  const { toast } = useToast();

  useEffect(() => {
    scrollToTopInstant();
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      let { data, error } = await supabase
        .from('products')
        .select(`*, categories(name)`)
        .eq('sku', slug)
        .eq('is_active', true)
        .single();

      if (error && error.code === 'PGRST116') {
        ({ data, error } = await supabase
          .from('products')
          .select(`*, categories(name)`)
          .eq('id', slug)
          .eq('is_active', true)
          .single());
      }

      if (error) throw error;
      setProduct(data);
      if (data?.images?.length) setActiveImage(data.images[0]);

      // Fetch product variants
      const { data: variantData } = await (supabase as any)
        .from('product_variants')
        .select('*')
        .eq('product_id', data.id)
        .eq('is_active', true)
        .order('sort_order');
      const activeVariants = variantData || [];
      setVariants(activeVariants);
      if (activeVariants.length > 0) setSelectedVariant(activeVariants[0]);

      if (data?.category_id) {
        fetchRelatedProducts(data.category_id, data.id);
      }
      fetchProductCoupons(data.id);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId: string, productId: string) => {
    try {
      let { data, error } = await supabase
        .from('products')
        .select(`*, categories(name)`)
        .eq('category_id', categoryId)
        .neq('id', productId)
        .eq('is_active', true)
        .limit(4);

      if (!data || data.length === 0) {
        const { data: randomData } = await supabase
          .from('products')
          .select(`*, categories(name)`)
          .neq('id', productId)
          .eq('is_active', true)
          .limit(4);
        data = randomData;
      }
      setRelatedProducts(data || []);
    } catch (error) {
      console.error('Error related products:', error);
    }
  };

  const fetchProductCoupons = async (productId: string) => {
    try {
      const { data: productCoupons } = await supabase
        .from('product_coupons')
        .select(`coupon_id, coupons (id, code, description, discount_type, discount_value, min_order_amount, is_active, valid_until)`)
        .eq('product_id', productId);

      const coupons = productCoupons
        ?.map((pc: any) => pc.coupons)
        .filter((c: any) => c && c.is_active && new Date(c.valid_until) > new Date()) || [];

      setAvailableCoupons(coupons);
    } catch (error) {
      console.error('Error coupons:', error);
    }
  };

  const handleAddToCart = () => {
    if (variants.length > 0 && !selectedVariant) {
      toast({ title: "Please select a variant", variant: "destructive" });
      return;
    }

    // Weight check only when no variants
    if (variants.length === 0) {
      const weights = product?.available_weights || [];
      if (weights.length > 0 && !selectedWeight) {
        toast({ title: "Please select a weight option", variant: "destructive" });
        return;
      }
    }

    const effectivePrice = selectedVariant ? selectedVariant.price : product.price;
    const effectiveOrigPrice = selectedVariant ? (selectedVariant.original_price || selectedVariant.price) : product.original_price;

    const productToAdd = {
      ...product,
      price: effectivePrice,
      originalPrice: effectiveOrigPrice,
      original_price: effectiveOrigPrice,
      image: product.images?.[0] || '/placeholder.svg',
      slug: product.sku || product.id,
      category: product.categories?.name || 'Unknown',
      inStock: (selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity) > 0,
    };

    const variantLabel = selectedVariant?.label || selectedWeight || undefined;

    for (let i = 0; i < quantity; i++) {
      addToCart(productToAdd, undefined, variantLabel);
    }

    toast({
      title: "Added to cart!",
      description: `${product.name}${selectedVariant ? ` · ${selectedVariant.label}` : ''} added successfully.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="size-12 border-4 border-[var(--color-brand-red)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-surface-page)] px-6 text-center">
        <h1 className="text-[28px] font-[500] text-[var(--color-text-primary)] mb-4">Product not found</h1>
        <Link to="/products" className="bg-[var(--color-brand-red)] text-white px-8 py-3 rounded-[8px] font-[500] text-[14px]">
          Back to Shop
        </Link>
      </div>
    );
  }

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayOriginalPrice = selectedVariant ? (selectedVariant.original_price || selectedVariant.price) : product.original_price;
  const discountPercentage = displayOriginalPrice ? calculateDiscount(displayOriginalPrice, displayPrice) : 0;

  return (
    <div className="bg-white min-h-screen font-inter selection:bg-[var(--color-brand-red)]/10">
      
      {/* Navigation Breadcrumb */}
      <div className="max-w-[1280px] mx-auto px-6 py-6 md:py-10">
         <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
            <Link to="/" className="hover:text-[var(--color-brand-red)] hover:underline">Home</Link>
            <ChevronRight size={14} />
            <Link to="/products" className="hover:text-[var(--color-brand-red)] hover:underline">Shop</Link>
            <ChevronRight size={14} />
            <span className="text-[var(--color-text-primary)] font-[500] truncate">{product.name}</span>
         </div>
      </div>

      <main className="max-w-[1280px] mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Gallery Section */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-6">
            {/* Thumbnails */}
            <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:max-h-[600px]">
              {product.images?.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`size-[72px] md:size-[84px] rounded-[8px] overflow-hidden border-[1.5px] shrink-0 transition-all ${
                    activeImage === img ? 'border-[var(--color-brand-red)] shadow-sm' : 'border-[var(--color-border-default)] hover:border-[var(--color-text-muted)]'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Stage */}
            <div className="order-1 md:order-2 flex-1 relative bg-[var(--color-surface-page)] rounded-[16px] overflow-hidden group">
               <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
               </AnimatePresence>

               {/* Tags Overlay */}
               <div className="absolute top-6 left-6 flex flex-col gap-2 pointer-events-none">
                  {discountPercentage > 0 && (
                    <span className="bg-[var(--red-sale)] text-white px-3 py-1.5 rounded-[6px] text-[11px] font-[600] uppercase tracking-wider">
                      Save {discountPercentage}%
                    </span>
                  )}
                  {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                    <span className="bg-[#FFF8E6] text-[#A67F00] px-3 py-1.5 rounded-[6px] text-[11px] font-[600] uppercase tracking-wider border border-[#FFE8A3]">
                      Limited Stock
                    </span>
                  )}
               </div>

               {/* Action Buttons */}
               <div className="absolute top-6 right-6 flex flex-col gap-3">
                  <button 
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="size-10 bg-white rounded-full flex items-center justify-center shadow-md border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:text-[var(--red-sale)] transition-colors"
                  >
                    <Heart size={20} className={isFavorite ? 'fill-current text-[var(--red-sale)]' : ''} />
                  </button>
                  <button className="size-10 bg-white rounded-full flex items-center justify-center shadow-md border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:text-[var(--color-brand-red)] transition-colors">
                    <Share2 size={20} />
                  </button>
               </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-2 bg-[var(--color-brand-red-light)] text-[var(--color-brand-red)] px-3 py-1 rounded-full">
                  <span className="text-[11px] font-[600] uppercase tracking-wider">{product.categories?.name || 'New Collection'}</span>
               </div>
               <h1 className="text-[32px] md:text-[44px] font-[600] text-[var(--color-text-primary)] leading-[1.1] tracking-tight">
                  {product.name}
               </h1>
               
               {/* Rating Summary */}
               <div className="flex items-center gap-3">
                  <div className="flex items-center text-[var(--color-brand-yellow)]">
                     {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill={s <= 4 ? "currentColor" : "none"} />)}
                  </div>
                  <span className="text-[14px] text-[var(--color-text-secondary)] font-[500]">(4.8 • 120 Reviews)</span>
                  <div className="h-4 w-px bg-[var(--color-border-default)]"></div>
                  <span className="text-[14px] text-[var(--green-fresh)] font-[600]">In Stock</span>
               </div>
            </div>

            <div className="space-y-1 py-4 border-y border-[var(--color-border-default)]/50">
               <div className="flex items-baseline gap-3">
                  <span className="text-[32px] font-[600] text-[var(--color-text-primary)] transition-all duration-200">{formatPrice(displayPrice)}</span>
                  {displayOriginalPrice > displayPrice && (
                    <span className="text-[17px] text-[var(--color-text-muted)] line-through">{formatPrice(displayOriginalPrice)}</span>
                  )}
                  {discountPercentage > 0 && (
                    <span className="text-[13px] font-[600] text-[#2E8B57] bg-green-50 px-2 py-0.5 rounded-[6px]">
                      {discountPercentage}% off
                    </span>
                  )}
               </div>
               <p className="text-[14px] text-[var(--color-text-secondary)]">
                  Prices include all applicable taxes.
               </p>
            </div>

            {/* Variant Selector */}
            {variants.length > 0 && (
              <div className="space-y-4">
                <span className="text-[14px] font-[600] text-[var(--color-text-primary)]">Select Variant</span>
                <div className="flex flex-wrap gap-3">
                  {variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`flex flex-col items-start px-4 py-3 rounded-[10px] border-[1.5px] transition-all text-left min-w-[100px] ${
                        selectedVariant?.id === v.id
                          ? 'border-[var(--color-brand-red)] bg-[var(--color-brand-red-light)]'
                          : 'border-[var(--color-border-default)] hover:border-[var(--color-text-muted)] bg-white'
                      }`}
                    >
                      <span className={`text-[14px] font-[600] leading-tight ${selectedVariant?.id === v.id ? 'text-[var(--color-brand-red)]' : 'text-[var(--color-text-primary)]'}`}>
                        {v.label}
                      </span>
                      <span className={`text-[13px] font-[500] mt-0.5 ${selectedVariant?.id === v.id ? 'text-[var(--color-brand-red)]' : 'text-[var(--color-text-secondary)]'}`}>
                        {formatPrice(v.price)}
                      </span>
                      {v.original_price > v.price && (
                        <span className="text-[11px] text-[#2E8B57] font-[500] mt-0.5">
                          {Math.round(((v.original_price - v.price) / v.original_price) * 100)}% off
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Weight Selector — hidden when product has variants */}
            {product?.available_weights?.length > 0 && variants.length === 0 && (
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[14px] font-[600] text-[var(--color-text-primary)]">Select Weight</span>
                 </div>
                 <div className="flex flex-wrap gap-3">
                    {product.available_weights.map((weight: string) => (
                      <button
                        key={weight}
                        onClick={() => setSelectedWeight(weight)}
                        className={`h-12 min-w-[64px] px-4 rounded-[8px] font-[600] text-[14px] transition-all border-[1.5px] ${
                          selectedWeight === weight
                            ? 'border-[var(--color-brand-red)] bg-[var(--color-brand-red-light)] text-[var(--color-brand-red)]'
                            : 'border-[var(--color-border-default)] hover:border-[var(--color-text-muted)] text-[var(--color-text-secondary)]'
                        }`}
                      >
                        {weight}
                      </button>
                    ))}
                 </div>
              </div>
            )}

            {/* Quantity & CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
               <div className="flex items-center border-[1.5px] border-[var(--color-border-default)] rounded-[8px] h-12">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="size-12 flex items-center justify-center hover:bg-[var(--color-surface-page)] transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-[600]">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="size-12 flex items-center justify-center hover:bg-[var(--color-surface-page)] transition-colors"
                  >
                    <Plus size={16} />
                  </button>
               </div>
               <button 
                 onClick={handleAddToCart}
                 className="flex-1 bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)] text-[var(--color-text-primary)] h-12 rounded-[8px] font-[600] text-[15px] transition-all active:scale-[0.98] shadow-sm"
               >
                 Add to Cart
               </button>
            </div>

            {/* Secondary CTA */}
            <button className="w-full h-12 border-[1.5px] border-[var(--color-brand-red)] text-[var(--color-brand-red)] rounded-[8px] font-[600] text-[15px] hover:bg-[var(--color-brand-red-light)] transition-all">
               Buy with Megadiscountstore Pay
            </button>

            {/* Delivery / Trust Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 border-t border-[var(--color-border-default)]/50 mt-4">
               <div className="flex items-center gap-4 group">
                  <div className="size-[48px] bg-[var(--color-surface-page)] rounded-[12px] flex items-center justify-center text-[var(--color-brand-red)]">
                     <Truck size={24} />
                  </div>
                  <div className="space-y-0.5">
                     <p className="text-[13px] font-[600] text-[var(--color-text-primary)]">Fast Delivery</p>
                     <p className="text-[12px] text-[var(--color-text-secondary)]">2-4 business days</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 group">
                  <div className="size-[48px] bg-[var(--color-surface-page)] rounded-[12px] flex items-center justify-center text-[var(--green-fresh)]">
                     <ShieldCheck size={24} />
                  </div>
                  <div className="space-y-0.5">
                     <p className="text-[13px] font-[600] text-[var(--color-text-primary)]">Secure Warranty</p>
                     <p className="text-[12px] text-[var(--color-text-secondary)]">1 year protection</p>
                  </div>
               </div>
            </div>

            {/* Accordion List */}
            <div className="divide-y divide-[var(--color-border-default)]/50 border-t border-[var(--color-border-default)]/50">
               <details className="group py-6" open>
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                     <span className="text-[15px] font-[600] text-[var(--color-text-primary)]">Product Description</span>
                     <ChevronDown size={20} className="group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="pt-4 text-[15px] text-[var(--color-text-secondary)] leading-[1.65]">
                    {product.description || "No description available for this product."}
                  </div>
               </details>
               {/* Specifications — universal, driven by product_specs + weight/pieces */}
               {(product.weight || product.pieces || selectedVariant?.weight || selectedVariant?.pieces ||
                 (product.product_specs && Object.values(product.product_specs).some(Boolean)) ||
                 (Array.isArray(product.features) && product.features.length > 0)) && (
               <details className="group py-6">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                     <span className="text-[15px] font-[600] text-[var(--color-text-primary)]">Specifications</span>
                     <ChevronDown size={20} className="group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="pt-4 space-y-3">
                     {/* Weight — from variant or product */}
                     {(selectedVariant?.weight || product.weight) && (
                       <div className="grid grid-cols-3 gap-4">
                         <span className="text-[13px] text-[var(--color-text-secondary)]">Weight</span>
                         <span className="col-span-2 text-[13px] font-[500] text-[var(--color-text-primary)]">{selectedVariant?.weight || product.weight}</span>
                       </div>
                     )}
                     {/* Pieces — from variant or product */}
                     {(selectedVariant?.pieces || product.pieces) && (
                       <div className="grid grid-cols-3 gap-4">
                         <span className="text-[13px] text-[var(--color-text-secondary)]">Pieces</span>
                         <span className="col-span-2 text-[13px] font-[500] text-[var(--color-text-primary)]">{selectedVariant?.pieces || product.pieces}</span>
                       </div>
                     )}
                     {/* Dynamic product_specs key-value pairs */}
                     {product.product_specs && typeof product.product_specs === 'object' &&
                       Object.entries(product.product_specs as Record<string, string>)
                         .filter(([, v]) => v)
                         .map(([key, value]) => (
                           <div key={key} className="grid grid-cols-3 gap-4">
                             <span className="text-[13px] text-[var(--color-text-secondary)] capitalize">{key.replace(/_/g, ' ')}</span>
                             <span className="col-span-2 text-[13px] font-[500] text-[var(--color-text-primary)]">{String(value)}</span>
                           </div>
                         ))
                     }
                     {/* Features as tags */}
                     {Array.isArray(product.features) && product.features.length > 0 && (
                       <div className="grid grid-cols-3 gap-4 items-start pt-1">
                         <span className="text-[13px] text-[var(--color-text-secondary)]">Features</span>
                         <div className="col-span-2 flex flex-wrap gap-2">
                           {product.features.map((f: string) => (
                             <span key={f} className="text-[12px] bg-[var(--color-surface-page)] text-[var(--color-text-secondary)] px-2.5 py-1 rounded-[6px] border border-[var(--color-border-default)]">{f}</span>
                           ))}
                         </div>
                       </div>
                     )}
                  </div>
               </details>
               )}
               {/* Care Instructions */}
               {product.care_instructions && (
               <details className="group py-6">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                     <span className="text-[15px] font-[600] text-[var(--color-text-primary)]">Care & Handling</span>
                     <ChevronDown size={20} className="group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="pt-4 text-[15px] text-[var(--color-text-secondary)] leading-[1.65]">
                     {product.care_instructions}
                  </div>
               </details>
               )}
            </div>
          </div>
        </div>

        {/* RELATED ITEMS */}
        {relatedProducts.length > 0 && (
          <section className="mt-32">
             <div className="flex justify-between items-end mb-10">
                <div>
                   <h2 className="text-[28px] font-[600] text-[var(--color-text-primary)] mb-2">You May Also Like</h2>
                   <p className="text-[15px] text-[var(--color-text-secondary)]">More products from the same collection.</p>
                </div>
                <Link to="/products" className="text-[14px] font-[600] text-[var(--color-brand-red)] hover:underline flex items-center gap-1">
                   View More <ChevronRight size={18} />
                </Link>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {relatedProducts.map((related: any) => (
                  <ProductCard 
                     key={related.id} 
                     product={related} 
                     onViewDetail={() => navigate(`/product/${related.sku || related.id}`)}
                  />
                ))}
             </div>
          </section>
        )}
      </main>

    </div>
  );
};

export default ProductDetail;
