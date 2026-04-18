import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/currency';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { X, ShoppingCart, Heart, Plus, Minus, Check, Star, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { calculateDiscount } from '@/utils/currency';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  original_price?: number;
  image?: string;
  images?: string[];
  weight?: string;
  pieces?: string;
  rating?: number;
  stock_quantity?: number;
  isBestSeller?: boolean;
  features?: string[];
  sku?: string;
  description?: string;
  category?: string;
  available_weights?: string[];
  [key: string]: any;
}

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const addToCart = useStore((state) => state.addToCart);
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState<string>('');
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (isOpen && product?.id) {
      setSelectedImageIndex(0);
      setQuantity(1);
      setSelectedWeight('');
      setAdded(false);
      fetchVariants(product.id);
    }
  }, [isOpen, product?.id]);

  const fetchVariants = async (productId: string) => {
    const { data } = await (supabase as any)
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('sort_order');
    const active = data || [];
    setVariants(active);
    setSelectedVariant(active.length > 0 ? active[0] : null);
  };

  if (!product) return null;

  const images = product.images?.filter(Boolean) || [product.image].filter(Boolean);
  const currentImage = images[selectedImageIndex] || product.image || '/placeholder.svg';
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const rawOriginal = selectedVariant
    ? (selectedVariant.original_price || selectedVariant.price)
    : (product.originalPrice || product.original_price || product.price);
  const displayOriginal = rawOriginal;
  const discountPct = displayOriginal > displayPrice ? calculateDiscount(displayOriginal, displayPrice) : 0;

  const displaySku = product.sku || `SKU-${product.id.slice(0, 8).toUpperCase()}`;
  const displayStock = selectedVariant ? selectedVariant.stock_quantity : (product.stock_quantity || 0);
  const isLowStock = displayStock > 0 && displayStock < 10;
  const isOutOfStock = displayStock === 0;

  const handleAddToCart = () => {
    if (variants.length > 0 && !selectedVariant) return;
    if (variants.length === 0 && (product.available_weights || []).length > 0 && !selectedWeight) return;

    const effectivePrice = selectedVariant ? selectedVariant.price : product.price;
    const effectiveOrigPrice = selectedVariant
      ? (selectedVariant.original_price || selectedVariant.price)
      : (product.originalPrice || product.original_price || product.price);

    for (let i = 0; i < quantity; i++) {
      addToCart({
        ...product,
        price: effectivePrice,
        originalPrice: effectiveOrigPrice,
        original_price: effectiveOrigPrice,
        image: currentImage,
      } as any, undefined, selectedVariant?.label || selectedWeight || undefined);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full sm:max-w-[960px] max-h-[92vh] sm:max-h-[88vh] bg-white rounded-t-[24px] sm:rounded-[20px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            {/* Drag handle — mobile */}
            <div className="sm:hidden w-10 h-1 bg-[var(--color-border-default)] rounded-full mx-auto mt-3 mb-1 shrink-0" />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 size-9 flex items-center justify-center bg-white border border-[var(--color-border-default)] rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:shadow-sm transition-all"
            >
              <X size={18} />
            </button>

            {/* ── Left: Gallery ── */}
            <div className="w-full md:w-[420px] bg-[var(--color-surface-page)] flex flex-col shrink-0 p-4 md:p-6">
              <div className="relative aspect-square bg-white rounded-[14px] border border-[var(--color-border-default)] overflow-hidden flex items-center justify-center mb-3">
                <motion.img
                  key={currentImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-6"
                />
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                  {discountPct > 0 && (
                    <span className="bg-[var(--color-brand-red)] text-white text-[11px] font-[700] px-2.5 py-1 rounded-[6px] uppercase tracking-wide shadow-sm">
                      -{discountPct}%
                    </span>
                  )}
                  {product.isBestSeller && (
                    <span className="bg-[var(--color-brand-yellow)] text-[var(--color-text-primary)] text-[11px] font-[600] px-2.5 py-1 rounded-[6px] uppercase tracking-wide shadow-sm">
                      Best Seller
                    </span>
                  )}
                  {isLowStock && (
                    <span className="bg-[#FFF3CD] text-[#856404] text-[11px] font-[600] px-2.5 py-1 rounded-[6px] uppercase tracking-wide border border-[#FFE69C]">
                      Only {displayStock} left
                    </span>
                  )}
                </div>
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={cn(
                        'size-14 rounded-[8px] border-[1.5px] p-1 bg-white shrink-0 transition-all',
                        selectedImageIndex === idx
                          ? 'border-[var(--color-brand-red)] shadow-sm'
                          : 'border-transparent hover:border-[var(--color-border-default)]'
                      )}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Details ── */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="p-5 md:p-8 flex-1">
                {/* Category + SKU */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-[700] text-[var(--color-brand-red)] uppercase tracking-widest">
                    {product.category || 'Product'}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)] font-[500]">{displaySku}</span>
                </div>

                {/* Title */}
                <h2 className="text-[20px] md:text-[26px] font-[600] text-[var(--color-text-primary)] leading-[1.2] mb-3 pr-8">
                  {product.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-0.5 text-[var(--color-brand-yellow)]">
                    {[1,2,3,4,5].map(s => <Star key={s} size={13} fill={s <= Math.round(product.rating || 4.8) ? 'currentColor' : 'none'} />)}
                  </div>
                  <span className="text-[13px] text-[var(--color-text-secondary)]">{product.rating || '4.8'}</span>
                  {displayStock > 0
                    ? <span className="text-[12px] font-[600] text-[#008A00] flex items-center gap-1"><Check size={12} />In Stock</span>
                    : <span className="text-[12px] font-[600] text-[var(--color-brand-red)]">Out of Stock</span>
                  }
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-5 py-4 border-y border-[var(--color-border-default)]/50">
                  <span className="text-[26px] md:text-[32px] font-[600] text-[var(--color-text-primary)] transition-all duration-200">
                    {formatPrice(displayPrice)}
                  </span>
                  {displayOriginal > displayPrice && (
                    <span className="text-[16px] text-[var(--color-text-muted)] line-through">
                      {formatPrice(displayOriginal)}
                    </span>
                  )}
                </div>

                {/* Variant Selector */}
                {variants.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[13px] font-[600] text-[var(--color-text-primary)] mb-3">Select Variant</p>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={cn(
                            'flex flex-col items-start px-3.5 py-2.5 rounded-[10px] border-[1.5px] transition-all text-left min-w-[80px]',
                            selectedVariant?.id === v.id
                              ? 'border-[var(--color-brand-red)] bg-[var(--color-brand-red-light)]'
                              : 'border-[var(--color-border-default)] hover:border-[var(--color-text-muted)]'
                          )}
                        >
                          <span className={cn('text-[13px] font-[600] leading-tight', selectedVariant?.id === v.id ? 'text-[var(--color-brand-red)]' : 'text-[var(--color-text-primary)]')}>
                            {v.label}
                          </span>
                          <span className={cn('text-[12px] font-[500] mt-0.5', selectedVariant?.id === v.id ? 'text-[var(--color-brand-red)]' : 'text-[var(--color-text-secondary)]')}>
                            {formatPrice(v.price)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weight Selector */}
                {variants.length === 0 && (product.available_weights || []).length > 0 && (
                  <div className="mb-5">
                    <p className="text-[13px] font-[600] text-[var(--color-text-primary)] mb-3">Select Weight</p>
                    <div className="flex flex-wrap gap-2">
                      {(product.available_weights || []).map((w: string) => (
                        <button
                          key={w}
                          onClick={() => setSelectedWeight(w)}
                          className={cn(
                            'h-10 px-4 rounded-[8px] border-[1.5px] text-[13px] font-[600] transition-all',
                            selectedWeight === w
                              ? 'border-[var(--color-brand-red)] bg-[var(--color-brand-red-light)] text-[var(--color-brand-red)]'
                              : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]'
                          )}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <p className="text-[13px] font-[600] text-[var(--color-text-primary)] mb-3">Quantity</p>
                  <div className="flex items-center border-[1.5px] border-[var(--color-border-default)] rounded-[10px] h-11 w-fit bg-white">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="size-11 flex items-center justify-center hover:text-[var(--color-brand-red)] transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-[15px] font-[600]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(displayStock || 99, q + 1))}
                      className="size-11 flex items-center justify-center hover:text-[var(--color-brand-red)] transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 md:p-8 pt-0 space-y-3 border-t border-[var(--color-border-default)]/50">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={cn(
                      'flex-1 h-12 rounded-[10px] font-[600] text-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]',
                      added
                        ? 'bg-[#008A00] text-white'
                        : isOutOfStock
                          ? 'bg-[var(--color-surface-page)] text-[var(--color-text-muted)] cursor-not-allowed'
                          : 'bg-[var(--color-brand-yellow)] hover:bg-[#E5AF1C] text-[var(--color-text-primary)] shadow-sm'
                    )}
                  >
                    {added ? <><Check size={16} />Added!</> : <><ShoppingCart size={16} />{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</>}
                  </button>
                  <button
                    onClick={() => {}}
                    className="size-12 rounded-[10px] border-[1.5px] border-[var(--color-border-default)] flex items-center justify-center transition-all hover:bg-[var(--color-surface-page)] hover:border-[var(--color-brand-red)] group"
                  >
                    <Heart size={18} className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-brand-red)] transition-colors" />
                  </button>
                </div>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full h-12 rounded-[10px] bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] text-white font-[600] text-[14px] transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => { onClose(); navigate(`/product/${product.sku || product.id}`); }}
                  className="w-full text-center text-[13px] font-[600] text-[var(--color-text-secondary)] hover:text-[var(--color-brand-red)] flex items-center justify-center gap-1.5 transition-colors py-1"
                >
                  View full details <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
