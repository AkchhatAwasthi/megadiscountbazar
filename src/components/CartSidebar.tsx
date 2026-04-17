import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { toNumber, formatCurrency, calculatePercentage } from '../utils/settingsHelpers';
import { X, ShoppingBag, Trash2, Plus, Minus, Truck, ShieldCheck, ArrowRight } from 'lucide-react';

interface CartSidebarProps {
  isAdminRoute?: boolean;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isAdminRoute = false }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  const {
    cartItems,
    isCartOpen,
    toggleCart,
    updateQuantity,
    removeFromCart
  } = useStore();

  const navigate = useNavigate();
  const { settings, loading: settingsLoading } = useSettings();

  // Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isCartOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        toggleCart();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCartOpen, toggleCart]);

  if (isAdminRoute || settingsLoading) {
    return null;
  }

  // Calculations
  const subtotal = cartItems.reduce((total, item) => {
    const price = toNumber(item.price);
    const quantity = toNumber(item.quantity);
    return total + (price * quantity);
  }, 0);

  const tax = calculatePercentage(subtotal, settings.tax_rate);
  const freeDeliveryThreshold = toNumber(settings.free_delivery_threshold);
  const deliveryFee = (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold)
    ? 0
    : toNumber(settings.delivery_charge);

  const total = subtotal + tax + deliveryFee;

  // Progress Bar Logic
  const progress = freeDeliveryThreshold > 0
    ? Math.min((subtotal / freeDeliveryThreshold) * 100, 100)
    : 100;

  const amountToFreeShipping = Math.max(freeDeliveryThreshold - subtotal, 0);

  const handleCheckout = () => {
    toggleCart();
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
          />

          {/* Sidebar */}
          <motion.div
            ref={sidebarRef}
            className="relative flex h-full w-full max-w-[420px] flex-col bg-white shadow-[-32px_0_64px_rgba(0,0,0,0.1)] overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
          >
            {/* Header */}
            <header className="flex items-center justify-between px-6 pt-8 pb-4 shrink-0">
               <div className="flex items-center gap-3">
                  <div className="size-[40px] bg-[var(--color-brand-red-light)] rounded-full flex items-center justify-center text-[var(--color-brand-red)] relative">
                     <ShoppingBag size={20} />
                     {cartItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 size-5 bg-[#E01E26] text-white text-[10px] font-[700] rounded-full flex items-center justify-center border-2 border-white">
                           {cartItems.length}
                        </span>
                     )}
                  </div>
                  <h2 className="text-[20px] font-[600] text-[var(--color-text-primary)] leading-none">Your Cart</h2>
               </div>
               <button
                onClick={toggleCart}
                className="size-10 flex items-center justify-center rounded-full bg-[var(--color-surface-page)] hover:bg-[var(--color-border-default)] transition-colors text-[var(--color-text-secondary)]"
              >
                <X size={20} />
              </button>
            </header>

            {/* Free Shipping Progress */}
            {freeDeliveryThreshold > 0 && cartItems.length > 0 && (
              <div className="px-6 py-4 bg-[var(--color-surface-page)]/50 mt-2">
                 <div className="flex justify-between items-center mb-2">
                    <p className="text-[12px] font-[600] text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
                       <Truck size={14} className="text-[var(--color-brand-red)]" />
                       Shipping
                    </p>
                    <span className="text-[12px] font-[700] text-[var(--color-brand-red)]">
                       {progress < 100 ? `${Math.round(progress)}%` : 'Unlocked!'}
                    </span>
                 </div>
                 <div className="h-1.5 w-full bg-[var(--color-border-default)] rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full transition-all duration-700 ease-out ${progress >= 100 ? 'bg-[#008A00]' : 'bg-[var(--color-brand-red)]'}`} 
                      style={{ width: `${progress}%` }}
                    />
                 </div>
                 {progress < 100 ? (
                    <p className="text-[11px] text-[var(--color-text-secondary)] font-[500]">
                       Add <span className="text-[var(--color-text-primary)] font-[700]">{formatCurrency(amountToFreeShipping, settings.currency_symbol)}</span> more for <span className="text-[var(--color-text-primary)] font-[700]">Free Shipping</span>
                    </p>
                 ) : (
                    <p className="text-[11px] text-[#008A00] font-[700] uppercase">Free Shipping Unlocked</p>
                 )}
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                   <div className="size-[80px] bg-[var(--color-surface-page)] rounded-full flex items-center justify-center mb-6 text-[#BDC1C6]">
                      <ShoppingBag size={32} />
                   </div>
                   <p className="text-[18px] font-[600] text-[var(--color-text-primary)]">Your cart is empty</p>
                   <p className="text-[14px] text-[var(--color-text-secondary)] mt-2 mb-8">Start adding items to your cart to see them here.</p>
                   <button 
                     onClick={toggleCart}
                     className="px-8 flex items-center justify-center h-[40px] bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] hover:-translate-y-[1px] text-white rounded-[8px] text-[14px] font-[500] transition-all active:scale-[0.98]"
                   >
                      Browse Products
                   </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 group">
                    {/* Item Image */}
                    <div className="size-[96px] bg-[var(--color-surface-page)] rounded-[12px] border border-[var(--color-border-default)] shrink-0 overflow-hidden flex items-center justify-center relative">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-[15px] font-[600] text-[var(--color-text-primary)] leading-tight line-clamp-2">{item.name}</h3>
                          <button 
                             onClick={() => removeFromCart(item.id, item.selectedSize)}
                             className="text-[#BDC1C6] hover:text-[#E01E26] transition-colors shrink-0"
                          >
                             <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-[12px] text-[var(--color-text-secondary)] mt-1 uppercase font-[600] tracking-wider">
                           Size: {item.selectedSize || 'Std'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border-[1.5px] border-[var(--color-border-default)] rounded-[8px] h-[32px] bg-white overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                            disabled={item.quantity <= 1}
                            className="size-[32px] flex items-center justify-center hover:bg-[var(--color-surface-page)] text-[var(--color-text-primary)] transition-colors disabled:opacity-30"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-[32px] text-center text-[13px] font-[700]">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                            className="size-[32px] flex items-center justify-center hover:bg-[var(--color-surface-page)] text-[var(--color-text-primary)] transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="text-[15px] font-[700] text-[var(--color-text-primary)]">
                           {formatCurrency(item.price * item.quantity, settings.currency_symbol)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar Footer */}
            {cartItems.length > 0 && (
              <footer className="bg-white p-6 border-t border-[var(--color-border-default)] shadow-[0_-16px_32px_rgba(0,0,0,0.05)]">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] text-[var(--color-text-secondary)]">Subtotal</span>
                    <span className="text-[15px] font-[600] text-[var(--color-text-primary)] font-inter">
                       {formatCurrency(subtotal, settings.currency_symbol)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] text-[var(--color-text-secondary)]">Shipping</span>
                    <span className={`text-[14px] font-[600] ${deliveryFee === 0 ? 'text-[#008A00]' : 'text-[var(--color-text-primary)]'}`}>
                      {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee, settings.currency_symbol)}
                    </span>
                  </div>
                  <div className="pt-4 flex justify-between items-baseline border-t border-[var(--color-surface-page)]">
                    <span className="text-[18px] font-[700] text-[var(--color-text-primary)]">Total</span>
                    <span className="text-[24px] font-[700] text-[var(--color-brand-red)] leading-none">
                       {formatCurrency(total, settings.currency_symbol)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                   <button
                     onClick={handleCheckout}
                     className="w-full bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)] hover:shadow-[0_4px_12px_rgba(255,194,32,0.4)] hover:-translate-y-[1px] text-[var(--color-text-primary)] h-[56px] rounded-[8px] font-[500] text-[16px] flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
                   >
                     Checkout
                     <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                   
                   <div className="flex items-center justify-center gap-4 py-2 border-t border-[var(--color-surface-page)] mt-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-[600] text-[#BDC1C6] uppercase tracking-[0.05em]">
                         <ShieldCheck size={12} />
                         Secure Checkout
                      </div>
                   </div>
                </div>
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
