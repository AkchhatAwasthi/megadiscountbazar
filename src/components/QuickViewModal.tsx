import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/currency';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { X, ShoppingCart, Heart, Plus, Minus, Check, Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
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
  available_sizes?: string[];
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
  const [selectedSize, setSelectedSize] = useState<string>('M');

  if (!product) return null;

  const images = product.images || [product.image];
  const currentImage = images[selectedImageIndex] || product.image || '';

  const displaySku = product.sku || `SKU-${product.id.slice(0, 8).toUpperCase()}`;
  const displayWeight = product.weight || '250g';
  const displayStock = product.stock_quantity || 0;
  const isLowStock = displayStock > 0 && displayStock < 10;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        ...product,
        image: currentImage
      } as any, selectedSize);
    }
    // Success feedback could be handled here or by listening to store changes
    onClose();
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (displayStock || 100)) {
      setQuantity(newQuantity);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-[1000px] max-h-[90vh] bg-white rounded-[16px] shadow-[0_24px_48px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col md:flex-row"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Close Button Mobile */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 md:hidden size-10 flex items-center justify-center bg-white border border-[var(--color-border-default)] rounded-full text-[var(--color-text-primary)] shadow-sm"
            >
              <X className="size-5" />
            </button>

            {/* Left: Image Gallery */}
            <div className="w-full md:w-[450px] bg-[var(--color-surface-page)] flex flex-col p-4 md:p-8 shrink-0">
               <div className="relative flex-1 bg-white rounded-[12px] border border-[var(--color-border-default)] overflow-hidden flex items-center justify-center mb-4">
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-full object-contain p-6"
                  />
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isBestSeller && (
                      <span className="bg-[var(--color-brand-yellow)] text-[var(--color-text-primary)] text-[11px] font-[600] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Best Seller
                      </span>
                    )}
                    {isLowStock && (
                      <span className="bg-[#E01E26] text-white text-[11px] font-[600] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Only {displayStock} Left
                      </span>
                    )}
                  </div>
               </div>

               {/* Thumbnails */}
               {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={cn(
                          "size-16 rounded-[8px] border-2 transition-all p-1 bg-white shrink-0",
                          selectedImageIndex === idx ? "border-[var(--color-brand-red)]" : "border-transparent hover:border-gray-300"
                        )}
                      >
                        <img src={img} alt="" className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
               )}
            </div>

            {/* Right: Product Details */}
            <div className="flex-1 flex flex-col bg-white overflow-y-auto">
              {/* Header */}
              <div className="p-6 md:p-10 pb-0">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[12px] font-[600] text-[var(--color-brand-red)] uppercase tracking-wider">
                     {product.category || 'Category'}
                   </span>
                   {/* Close Button Desktop */}
                   <button
                    onClick={onClose}
                    className="hidden md:flex size-10 items-center justify-center text-[var(--color-text-primary)]/40 hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <X className="size-6" />
                  </button>
                </div>
                
                <h2 className="text-[24px] md:text-[32px] font-[600] text-[var(--color-text-primary)] leading-[1.2] mb-4">
                   {product.name}
                </h2>

                <div className="flex items-center gap-4 mb-6">
                   <div className="flex items-center bg-[var(--color-surface-page)] px-3 py-1 rounded-[6px]">
                      <Star className="size-3.5 text-[var(--color-brand-yellow)] fill-[var(--color-brand-yellow)] mr-1.5" />
                      <span className="text-[13px] font-[600] text-[var(--color-text-primary)]">{product.rating || '4.8'}</span>
                   </div>
                   <span className="text-[14px] text-[var(--color-text-secondary)]">{displaySku}</span>
                </div>

                <div className="flex items-baseline gap-3 mb-8">
                   <span className="text-[28px] md:text-[36px] font-[600] text-[var(--color-brand-red)]">
                     {formatPrice(product.price)}
                   </span>
                   {product.originalPrice && (
                      <span className="text-[18px] text-[var(--color-text-secondary)] line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                   )}
                </div>

                <div className="h-px bg-[var(--color-border-default)] w-full mb-8"></div>

                {/* Options */}
                <div className="space-y-8 mb-10">
                   {/* Size Picker */}
                   <div>
                      <div className="flex justify-between items-center mb-3">
                         <span className="text-[14px] font-[600] text-[var(--color-text-primary)]">Select Size</span>
                         <button className="text-[13px] text-[var(--color-brand-red)] hover:underline font-[500]">Size Guide</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {['S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                            const isAvailable = product.available_sizes ? product.available_sizes.includes(size) : true;
                            const isSelected = selectedSize === size;
                            
                            return (
                               <button
                                 key={size}
                                 disabled={!isAvailable}
                                 onClick={() => setSelectedSize(size)}
                                 className={cn(
                                   "min-w-[56px] h-[48px] rounded-[10px] border-[1.5px] text-[14px] font-[600] transition-all flex items-center justify-center",
                                   isSelected 
                                     ? "border-[var(--color-brand-red)] bg-[var(--color-brand-red-light)] text-[var(--color-brand-red)]" 
                                     : isAvailable 
                                       ? "border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:border-[var(--color-brand-red)]" 
                                       : "border-[#F1F3F4] text-[#BDC1C6] cursor-not-allowed bg-[#F8F9FA]"
                                 )}
                               >
                                 {size}
                               </button>
                            );
                         })}
                      </div>
                   </div>

                   {/* Quantity */}
                   <div>
                      <span className="text-[14px] font-[600] text-[var(--color-text-primary)] block mb-3">Quantity</span>
                      <div className="flex items-center gap-4">
                         <div className="flex items-center border-[1.5px] border-[var(--color-border-default)] rounded-full h-[48px] px-2 bg-white">
                            <button
                              onClick={() => handleQuantityChange(-1)}
                              className="size-10 flex items-center justify-center transition-colors hover:text-[var(--color-brand-red)]"
                            >
                               <Minus className="size-4" />
                            </button>
                            <span className="w-10 text-center text-[15px] font-[600]">{quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(1)}
                              className="size-10 flex items-center justify-center transition-colors hover:text-[var(--color-brand-red)]"
                            >
                               <Plus className="size-4" />
                            </button>
                         </div>
                         {displayStock > 0 && (
                            <span className="text-[13px] font-[500] text-[#008A00] flex items-center">
                               <Check className="size-4 mr-1.5" /> 
                               In Stock
                            </span>
                         )}
                      </div>
                   </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto p-6 md:p-10 pt-0 flex gap-4">
                 <button
                    onClick={handleAddToCart}
                    disabled={displayStock === 0}
                    className="flex-1 bg-[var(--color-brand-yellow)] hover:bg-[#E5AF1C] text-[var(--color-text-primary)] h-[56px] rounded-full font-[600] text-[16px] flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:bg-[#F1F3F4] disabled:text-[#BDC1C6] disabled:shadow-none"
                 >
                    <ShoppingCart className="size-5" />
                    {displayStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                 </button>
                 <button className="size-[56px] rounded-full border-[1.5px] border-[var(--color-border-default)] flex items-center justify-center transition-all hover:bg-[var(--color-surface-page)] hover:border-[#BDC1C6] active:scale-[0.95]">
                    <Heart className="size-6 text-[var(--color-text-secondary)]" />
                 </button>
              </div>

              {/* View Full Info */}
              <div className="p-6 md:p-10 pt-0 pb-10">
                 <button 
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="w-full text-center text-[14px] font-[600] text-[var(--color-brand-red)] hover:underline"
                 >
                   View full details
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

