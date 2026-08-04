"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/currency';
import { ShoppingCart, Heart, Eye, Zap } from 'lucide-react';

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
  const router = useRouter();

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

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleAddToCart(e);
    router.push('/checkout');
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView?.(product);
  };

  const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity <= 0;

  // Badge logic
  let badgeText = 'Bestseller';
  let isDiscount = false;

  if (product.originalPrice && product.originalPrice > product.price) {
    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    badgeText = `${discount}% OFF`;
    isDiscount = true;
  } else if (product.isBestSeller || index % 2 === 0) {
    badgeText = 'Bestseller';
  } else {
    badgeText = 'Top Rated';
  }

  const ratingVal = (4.2 + (index % 7) * 0.1).toFixed(1);
  const reviewCount = 90 + (index * 17) % 150;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-white border border-gray-200/80 rounded-2xl p-3 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-gray-300"
      onClick={onViewDetail}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 mb-2.5">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
          loading="lazy"
        />
        
        {/* Badge Overlay */}
        <div className="absolute top-2 left-2 flex gap-1 z-10">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-[700] tracking-wide uppercase shadow-2xs ${isDiscount ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-400 text-amber-950'}`}>
            {badgeText}
          </span>
        </div>

        {/* Wishlist Icon */}
        <motion.button 
          whileTap={{ scale: 0.85 }}
          className="absolute top-2 right-2 size-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-200/60 text-gray-700 hover:text-[var(--color-brand-red)] transition-colors z-10"
          onClick={(e) => { e.stopPropagation(); }}
        >
          <Heart className="size-4" />
        </motion.button>
      </div>

      {/* Product Content */}
      <div className="flex flex-col flex-grow">
        {/* Rating Score */}
        <div className="flex items-center gap-1 mb-1 text-[12px]">
          <span className="text-amber-500 font-[700]">★</span>
          <span className="font-[600] text-gray-800">{ratingVal}</span>
          <span className="text-gray-400">({reviewCount})</span>
        </div>

        {/* Title */}
        <h3 className="text-[13px] font-[700] text-gray-900 leading-tight mb-2 line-clamp-2 uppercase tracking-tight">
          {product.name}
        </h3>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 mb-3 mt-auto">
          <span className="text-[18px] font-[800] text-[var(--color-brand-red)]">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[13px] font-[400] text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Action Buttons: Vertical Stack (Top: Add to Cart, Bottom: Buy Now) */}
        <div className="flex flex-col gap-1.5 mt-auto pt-2 w-full">
          {isOutOfStock ? (
            <button disabled className="w-full py-2 bg-gray-100 text-gray-400 rounded-xl text-[12px] font-[600] cursor-not-allowed">
              Out of Stock
            </button>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="w-full py-1.5 px-2 bg-[#FFC220] hover:bg-[#e6ae1c] text-gray-900 rounded-xl text-[11px] sm:text-[12px] font-[700] transition-all shadow-2xs flex items-center justify-center gap-1.5"
                title="Add to Cart"
              >
                <ShoppingCart className="size-3.5 shrink-0" />
                <span>Add to Cart</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleBuyNow}
                className="w-full py-1.5 px-2 bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] text-white rounded-xl text-[11px] sm:text-[12px] font-[700] transition-all shadow-2xs flex items-center justify-center gap-1.5"
                title="Buy Now"
              >
                <Zap className="size-3.5 shrink-0" />
                <span>Buy Now</span>
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
