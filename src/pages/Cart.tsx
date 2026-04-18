import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/utils/settingsHelpers';
import { useSettings } from '@/hooks/useSettings';
import { toNumber, calculatePercentage } from '@/utils/settingsHelpers';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import {
  ShoppingBag, ChevronLeft, Trash2, ShieldCheck, Truck,
  RefreshCw, Plus, Minus, ArrowRight, Tag, PackageCheck, HeadphonesIcon
} from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useStore();
  const { settings, loading: settingsLoading } = useSettings();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('products').select('*').limit(4).then(({ data }) => {
      if (data) setRecommendations(data);
    });
  }, []);

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-page)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-brand-red)]" />
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + toNumber(item.price) * toNumber(item.quantity), 0);
  const tax = calculatePercentage(subtotal, settings.tax_rate);
  const freeDeliveryThreshold = toNumber(settings.free_delivery_threshold);
  const deliveryFee = freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold
    ? 0
    : toNumber(settings.delivery_charge);
  const total = subtotal + tax + deliveryFee;
  const progress = freeDeliveryThreshold > 0 ? Math.min((subtotal / freeDeliveryThreshold) * 100, 100) : 100;
  const minOrderAmount = toNumber(settings.min_order_amount);
  const isMinOrderMet = subtotal >= minOrderAmount;
  const amountToFreeShipping = freeDeliveryThreshold - subtotal;

  return (
    <div className="bg-[var(--color-surface-page)] min-h-screen">
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 md:py-14">

        {/* Back nav */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[13px] font-[600] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-8"
        >
          <ChevronLeft size={16} />
          Continue Shopping
        </button>

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-[28px] md:text-[36px] font-[700] text-[var(--color-text-primary)] leading-tight">
            Shopping Cart
          </h1>
          <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">
            {cartItems.length === 0
              ? 'Your cart is empty'
              : <><span className="font-[700] text-[var(--color-text-primary)]">{cartItems.length}</span> item{cartItems.length !== 1 ? 's' : ''} in your cart</>
            }
          </p>
        </div>

        {/* Empty state */}
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 bg-white rounded-[20px] border border-[var(--color-border-default)]">
            <div className="size-[100px] bg-[var(--color-surface-page)] rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={40} className="text-[var(--color-text-muted)]" />
            </div>
            <h2 className="text-[22px] font-[700] text-[var(--color-text-primary)] mb-2">Your cart is empty</h2>
            <p className="text-[14px] text-[var(--color-text-secondary)] mb-8 max-w-xs">
              Looks like you haven't added anything yet. Start exploring our collection.
            </p>
            <Link
              to="/products"
              className="flex items-center gap-2 bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] text-white px-8 py-3.5 rounded-[12px] font-[700] text-[14px] transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Explore Products <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left: Items */}
            <div className="lg:col-span-8 space-y-4">

              {/* Free shipping banner */}
              {freeDeliveryThreshold > 0 && (
                <div className="bg-white rounded-[16px] border border-[var(--color-border-default)] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[13px] font-[600] text-[var(--color-text-primary)]">
                      {progress >= 100 ? (
                        <span className="text-[#008A00]">You've unlocked FREE shipping!</span>
                      ) : (
                        <>Add <span className="text-[var(--color-brand-red)]">{formatCurrency(amountToFreeShipping, settings.currency_symbol)}</span> more for free shipping</>
                      )}
                    </p>
                    <Truck size={17} className={progress >= 100 ? 'text-[#008A00]' : 'text-[var(--color-text-muted)]'} />
                  </div>
                  <div className="h-1.5 w-full bg-[var(--color-surface-page)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${progress >= 100 ? 'bg-[#008A00]' : 'bg-[var(--color-brand-red)]'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Cart items card */}
              <div className="bg-white rounded-[20px] border border-[var(--color-border-default)] overflow-hidden divide-y divide-[var(--color-border-default)]/70">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedSize}-${item.selectedWeight}`}
                    className="flex gap-4 sm:gap-5 p-4 sm:p-6 hover:bg-[var(--color-surface-page)]/50 transition-colors group"
                  >
                    {/* Image */}
                    <div className="size-[88px] sm:size-[104px] bg-[var(--color-surface-page)] rounded-[12px] border border-[var(--color-border-default)] shrink-0 overflow-hidden flex items-center justify-center p-1.5 group-hover:border-[var(--color-brand-red)]/30 transition-colors">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          {item.category && (
                            <p className="text-[10px] font-[700] tracking-widest text-[var(--color-brand-red)] uppercase mb-0.5">
                              {item.category}
                            </p>
                          )}
                          <h3 className="text-[14px] sm:text-[15px] font-[700] text-[var(--color-text-primary)] leading-snug line-clamp-2">
                            {item.name}
                          </h3>
                          {(item.selectedSize || item.selectedWeight) && (
                            <p className="text-[12px] text-[var(--color-text-secondary)] mt-1">
                              {[
                                item.selectedSize && `Size: ${item.selectedSize}`,
                                item.selectedWeight && `${item.selectedWeight}`
                              ].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[16px] sm:text-[18px] font-[700] text-[var(--color-text-primary)]">
                            {formatCurrency(item.price * item.quantity, settings.currency_symbol)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                              {formatCurrency(item.price, settings.currency_symbol)} each
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quantity + Remove */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center h-9 rounded-[10px] border border-[var(--color-border-default)] overflow-hidden bg-[var(--color-surface-page)]">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1), item.selectedSize, item.selectedWeight)}
                            className="size-9 flex items-center justify-center hover:bg-white hover:text-[var(--color-brand-red)] transition-colors text-[var(--color-text-secondary)]"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-9 text-center text-[14px] font-[700] text-[var(--color-text-primary)]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedWeight)}
                            className="size-9 flex items-center justify-center hover:bg-white hover:text-[var(--color-brand-red)] transition-colors text-[var(--color-text-secondary)]"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedWeight)}
                          className="flex items-center gap-1.5 text-[12px] font-[600] text-[var(--color-text-muted)] hover:text-[#E01E26] transition-colors"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: ShieldCheck, title: 'Secure Checkout', sub: 'SSL encrypted payment' },
                  { icon: RefreshCw, title: 'Easy Returns', sub: '30-day return policy' },
                  { icon: PackageCheck, title: 'Quality Promise', sub: '100% genuine products' },
                ].map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="bg-white rounded-[14px] border border-[var(--color-border-default)] p-4 flex items-center gap-3">
                    <div className="size-9 bg-[var(--color-brand-red-light)]/40 rounded-full flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-[var(--color-brand-red)]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-[700] text-[var(--color-text-primary)]">{title}</p>
                      <p className="text-[11px] text-[var(--color-text-secondary)]">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Summary */}
            <aside className="lg:col-span-4 flex flex-col gap-4 sticky top-28">
              <div className="bg-white rounded-[20px] border border-[var(--color-border-default)] overflow-hidden">
                <div className="p-6 space-y-3">
                  <h2 className="text-[17px] font-[700] text-[var(--color-text-primary)] mb-5 flex items-center gap-2">
                    <Tag size={16} className="text-[var(--color-brand-red)]" />
                    Order Summary
                  </h2>

                  <div className="flex justify-between text-[14px]">
                    <span className="text-[var(--color-text-secondary)]">
                      Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
                    </span>
                    <span className="font-[600] text-[var(--color-text-primary)]">
                      {formatCurrency(subtotal, settings.currency_symbol)}
                    </span>
                  </div>

                  {tax > 0 && (
                    <div className="flex justify-between text-[14px]">
                      <span className="text-[var(--color-text-secondary)]">Tax ({settings.tax_rate}%)</span>
                      <span className="font-[600] text-[var(--color-text-primary)]">
                        {formatCurrency(tax, settings.currency_symbol)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-[14px]">
                    <span className="text-[var(--color-text-secondary)]">Shipping</span>
                    <span className={`font-[700] ${deliveryFee === 0 ? 'text-[#008A00]' : 'text-[var(--color-text-primary)]'}`}>
                      {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee, settings.currency_symbol)}
                    </span>
                  </div>
                </div>

                {/* Dark total panel */}
                <div className="flex items-center justify-between px-6 py-5 bg-[var(--color-text-primary)]">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-[600]">Total Payable</p>
                    <p className="text-[28px] font-[800] text-[var(--color-brand-yellow)] leading-tight">
                      {formatCurrency(total, settings.currency_symbol)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/30">
                    <ShieldCheck size={14} />
                    <span className="text-[11px] font-[600]">Incl. all taxes</span>
                  </div>
                </div>

                <div className="p-6 pt-5 space-y-4">
                  {!isMinOrderMet && (
                    <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px]">
                      <p className="text-[12px] text-[#991B1B] font-[600] leading-snug">
                        Minimum order is {formatCurrency(minOrderAmount, settings.currency_symbol)}. Add more items to proceed.
                      </p>
                    </div>
                  )}

                  <button
                    disabled={!isMinOrderMet}
                    onClick={() => navigate('/checkout')}
                    className="w-full h-[52px] rounded-[12px] bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] text-white font-[700] text-[15px] transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout <ArrowRight size={16} />
                  </button>

                  <Link
                    to="/products"
                    className="flex items-center justify-center gap-1.5 w-full h-10 rounded-[10px] border border-[var(--color-border-default)] text-[13px] font-[600] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)] transition-all"
                  >
                    <ChevronLeft size={14} />
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Help */}
              <div className="bg-white rounded-[16px] border border-[var(--color-border-default)] p-5 flex items-start gap-3">
                <div className="size-9 bg-[var(--color-surface-page)] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <HeadphonesIcon size={16} className="text-[var(--color-brand-red)]" />
                </div>
                <div>
                  <p className="text-[13px] font-[700] text-[var(--color-text-primary)]">Need help?</p>
                  <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                    Mon–Fri, 9am – 6pm. We're happy to assist.
                  </p>
                  <Link to="/contact" className="text-[13px] font-[700] text-[var(--color-brand-red)] hover:underline mt-1.5 inline-block">
                    Contact Support
                  </Link>
                </div>
              </div>
            </aside>

          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && cartItems.length > 0 && (
          <section className="mt-16 sm:mt-20">
            <h2 className="text-[22px] font-[700] text-[var(--color-text-primary)] mb-6">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {recommendations.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetail={() => navigate(`/product/${product.slug || product.id}`)}
                />
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
};

export default Cart;
