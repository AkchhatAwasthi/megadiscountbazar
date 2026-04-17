import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Heart,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  Share2,
  Ruler,
  Info
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
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

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
    if (!selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }

    const productToAdd = {
      ...product,
      image: product.images?.[0] || '/placeholder.svg',
      slug: product.sku || product.id,
      category: product.categories?.name || 'Unknown',
      inStock: product.stock_quantity > 0,
    };

    for (let i = 0; i < quantity; i++) {
        addToCart(productToAdd, selectedSize);
    }

    toast({
      title: "Success",
      description: `${product.name} has been added to your cart.`,
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

  const discountPercentage = product.original_price ? calculateDiscount(product.original_price, product.price) : 0;
  const sizes = product?.available_sizes?.length > 0 ? product.available_sizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

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
                  <span className="text-[32px] font-[600] text-[var(--color-text-primary)]">{formatPrice(product.price)}</span>
                  {product.original_price > product.price && (
                    <span className="text-[17px] text-[var(--color-text-muted)] line-through">{formatPrice(product.original_price)}</span>
                  )}
               </div>
               <p className="text-[14px] text-[var(--color-text-secondary)]">
                  Prices include all applicable taxes.
               </p>
            </div>

            {/* Size Selector */}
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-[14px] font-[600] text-[var(--color-text-primary)]">Select Size</span>
                  <button className="text-[13px] font-[500] text-[var(--color-brand-red)] hover:underline flex items-center gap-1.5">
                     <Ruler size={16} />
                     Size Guide
                  </button>
               </div>
               <div className="flex flex-wrap gap-3">
                  {sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 min-w-[64px] px-4 rounded-[8px] font-[600] text-[14px] transition-all border-[1.5px] ${
                        selectedSize === size
                          ? 'border-[var(--color-brand-red)] bg-[var(--color-brand-red-light)] text-[var(--color-brand-red)]'
                          : 'border-[var(--color-border-default)] hover:border-[var(--color-text-muted)] text-[var(--color-text-secondary)]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
               </div>
            </div>

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
                    {product.description || "Premium quality apparel designed for modern lifestyle. Comfort meeting style."}
                  </div>
               </details>
               <details className="group py-6">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                     <span className="text-[15px] font-[600] text-[var(--color-text-primary)]">Specifications & Fit</span>
                     <ChevronDown size={20} className="group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="pt-4 space-y-3">
                     <div className="grid grid-cols-3 gap-4">
                        <span className="text-[13px] text-[var(--color-text-secondary)]">Fabric</span>
                        <span className="col-span-2 text-[13px] font-[500] text-[var(--color-text-primary)]">{product.product_specs?.fabric || "Cotton Blend"}</span>
                     </div>
                     <div className="grid grid-cols-3 gap-4">
                        <span className="text-[13px] text-[var(--color-text-secondary)]">Weight</span>
                        <span className="col-span-2 text-[13px] font-[500] text-[var(--color-text-primary)]">240 GSM Heavyweight</span>
                     </div>
                     <div className="grid grid-cols-3 gap-4">
                        <span className="text-[13px] text-[var(--color-text-secondary)]">Fit</span>
                        <span className="col-span-2 text-[13px] font-[500] text-[var(--color-text-primary)]">Oversized / Boxy</span>
                     </div>
                  </div>
               </details>
            </div>
          </div>
        </div>

        {/* RELATED ITEMS */}
        {relatedProducts.length > 0 && (
          <section className="mt-32">
             <div className="flex justify-between items-end mb-10">
                <div>
                   <h2 className="text-[28px] font-[600] text-[var(--color-text-primary)] mb-2">You May Also Like</h2>
                   <p className="text-[15px] text-[var(--color-text-secondary)]">Complete the look with these curated pieces.</p>
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
