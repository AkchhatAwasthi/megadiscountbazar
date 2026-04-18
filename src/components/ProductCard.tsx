import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/currency';
import { ShoppingCart, Heart, Eye } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  category?: any;
  rating?: number;
  stock_quantity?: number;
  isBestSeller?: boolean;
  sku?: string;
  [key: string]: any;
}

interface ProductCardProps {
  product: Product;
  onViewDetail?: () => void;
  onQuickView?: (product?: Product) => void;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetail,
  onQuickView,
  index = 0,
}) => {
  const addToCart = useStore((state) => state.addToCart);

  const primaryImage = product.images?.[0] || product.image || '/placeholder.svg';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const categoryString = typeof product.category === 'object' && product.category?.name
      ? product.category.name
      : (typeof product.category === 'string' ? product.category : 'General');

    const defaultSize = product.available_sizes?.[0] || 'Standard';
    const defaultWeight = product.available_weights?.[0] || undefined;

    addToCart({
      ...product,
      category: categoryString,
      image: primaryImage,
    } as any, defaultSize, defaultWeight);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView?.(product);
  };

  const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity <= 0;

  // Badge logic
  let badgeText = '';
  let badgeType: 'sale' | 'new' | 'best' = 'new';

  if (product.originalPrice && product.originalPrice > product.price) {
    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    badgeText = `${discount}% OFF`;
    badgeType = 'sale';
  } else if (product.isBestSeller) {
    badgeText = 'BEST SELLER';
    badgeType = 'best';
  } else if (index < 4) {
    badgeText = 'NEW';
    badgeType = 'new';
  }

  const badgeStyles = {
    sale: { bg: 'bg-[#FCEBEB]', text: 'text-[#A32D2D]' },
    new: { bg: 'bg-[var(--color-brand-red-light)]', text: 'text-[#0C447C]' },
    best: { bg: 'bg-[#FAEEDA]', text: 'text-[#633806]' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-[var(--color-surface-card)] border-[0.5px] border-[var(--color-border-default)] rounded-[12px] p-[12px] cursor-pointer transition-all duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-[var(--color-brand-red)] hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,113,220,0.1)]"
      onClick={onViewDetail}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-[8px] bg-[var(--color-surface-page)] mb-3">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          loading="lazy"
        />
        
        {/* Badge Overlay */}
        {badgeText && (
          <div className="absolute top-2 left-2 flex gap-1 z-10">
            <span className={`inline-flex items-center px-[8px] py-[3px] rounded-[6px] text-[11px] font-[500] tracking-[0.02em] ${badgeStyles[badgeType].bg} ${badgeStyles[badgeType].text}`}>
              {badgeText}
            </span>
          </div>
        )}

        {/* Wishlist Icon */}
        <button 
          className="absolute top-2 right-2 size-[32px] flex items-center justify-center bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white text-[var(--color-brand-red)]"
          onClick={(e) => { e.stopPropagation(); /* Wishlist logic */ }}
        >
          <Heart className="size-[16px]" />
        </button>

        {/* Quick View Button Overlay */}
        <div className="absolute inset-x-2 bottom-2 z-20">
            <button
                onClick={handleQuickView}
                className="w-full py-2 bg-white/90 backdrop-blur-sm text-[var(--color-brand-red)] rounded-[8px] text-[12px] font-[500] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-white flex items-center justify-center gap-2"
            >
                <Eye className="size-[14px]" />
                Quick View
            </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="flex flex-col flex-grow">
        <h3 className="text-[17px] font-[500] text-[var(--color-text-primary)] leading-[1.35] mb-2 line-clamp-2 min-h-[46px]">
          {product.name}
        </h3>

        {/* Rating Placeholder */}
        <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center text-[var(--color-brand-yellow)]">
                {[...Array(5)].map((_, i) => (
                    <svg key={i} className="size-[12px] fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                ))}
            </div>
            <span className="text-[13px] text-[var(--color-text-secondary)]">(124)</span>
        </div>

        {/* Price Row */}
        <div className="flex flex-col gap-0.5 mb-4">
            <div className="flex items-center gap-2">
                <span className="text-[22px] font-[600] text-[var(--color-text-primary)]">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-[15px] font-[400] text-[var(--color-text-secondary)] line-through">
                    {formatPrice(product.originalPrice)}
                    </span>
                )}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[12px] text-[#2E8B57] font-[500]">You save {formatPrice(product.originalPrice - product.price)}</span>
            )}
        </div>

        {/* Action Button */}
        <div className="mt-auto">
            {isOutOfStock ? (
                <button disabled className="w-full py-[10px] bg-[var(--color-surface-page)] text-[var(--color-text-muted)] rounded-[8px] text-[14px] font-[500] cursor-not-allowed">
                    Out of Stock
                </button>
            ) : (
                <button
                    onClick={handleAddToCart}
                    className="w-full py-[10px] bg-[var(--color-brand-yellow)] text-[var(--color-text-primary)] rounded-[8px] text-[14px] font-[500] transition-all duration-200 hover:bg-[var(--color-brand-yellow-hover)] hover:shadow-[0_4px_12px_rgba(255,194,32,0.4)] hover:-translate-y-[1px] flex items-center justify-center gap-2"
                >
                    <ShoppingCart className="size-[16px]" />
                    Add to Cart
                </button>
            )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
