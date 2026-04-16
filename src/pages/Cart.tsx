import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/utils/settingsHelpers';
import { useSettings } from '@/hooks/useSettings';
import { toNumber, calculatePercentage } from '@/utils/settingsHelpers';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProductCard from '@/components/ProductCard';
import { ShoppingBag, ChevronLeft, Trash2, ShieldCheck, Truck, RefreshCw, Plus, Minus } from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useStore();
  const { settings, loading: settingsLoading } = useSettings();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Fetch random recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .limit(4);

        if (data) setRecommendations(data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };
    fetchRecommendations();
  }, []);

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--blue-primary)]"></div>
      </div>
    );
  }

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (toNumber(item.price) * toNumber(item.quantity)), 0);
  const tax = calculatePercentage(subtotal, settings.tax_rate);
  const freeDeliveryThreshold = toNumber(settings.free_delivery_threshold);

  const deliveryFee = (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold)
    ? 0
    : toNumber(settings.delivery_charge);

  const total = subtotal + tax + deliveryFee;

  // Free Shipping Progress
  const progress = freeDeliveryThreshold > 0
    ? Math.min((subtotal / freeDeliveryThreshold) * 100, 100)
    : 100;

  const minOrderAmount = toNumber(settings.min_order_amount);
  const isMinOrderMet = subtotal >= minOrderAmount;

  return (
    <div className="bg-[#F6F7F8] min-h-screen font-inter selection:bg-[var(--blue-primary)]/10">
      
      <main className="max-w-[1280px] mx-auto px-6 py-12 md:py-16">
        
        {/* Navigation Breadcrumb */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[var(--blue-primary)] font-[600] text-[14px] mb-8 hover:underline"
        >
          <ChevronLeft size={18} />
          Continue Shopping
        </button>

        {/* Page Title */}
        <div className="mb-10">
           <h1 className="text-[32px] md:text-[42px] font-[600] text-[#1A1A1A] leading-tight">
             Shopping Cart
           </h1>
           <p className="text-[16px] text-[#5F6368] mt-2">
             You have <span className="font-[600] text-[#1A1A1A]">{cartItems.length} items</span> in your cart
           </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 py-24 bg-white rounded-[24px] border border-[#E0E3E7] shadow-sm">
            <div className="size-[120px] bg-[#F6F7F8] rounded-full flex items-center justify-center mb-8">
               <ShoppingBag className="size-[48px] text-[#BDC1C6]" />
            </div>
            <h2 className="text-[28px] font-[600] text-[#1A1A1A] mb-4">Your cart is empty</h2>
            <p className="text-[#5F6368] mb-10 max-w-sm text-[16px]">Looks like you haven't added anything to your cart yet. Let's start shopping!</p>
            <Link to="/products" className="bg-[var(--blue-primary)] hover:bg-[var(--blue-deep)] text-white px-10 py-4 rounded-full font-[600] text-[16px] transition-all shadow-md active:scale-[0.98]">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Col: Cart Items */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Free Shipping Alert */}
              {freeDeliveryThreshold > 0 && (
                <div className="bg-white p-6 rounded-[16px] border border-[#E0E3E7] shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[14px] font-[600] text-[#1A1A1A]">
                      {progress < 100 
                        ? `Add ${formatCurrency(freeDeliveryThreshold - subtotal, settings.currency_symbol)} more for FREE SHIPPING` 
                        : "You've unlocked FREE SHIPPING!"}
                    </p>
                    <Truck className={progress >= 100 ? "text-[#008A00]" : "text-[#5F6368]"} size={20} />
                  </div>
                  <div className="h-2 w-full bg-[#F6F7F8] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ease-out ${progress >= 100 ? 'bg-[#008A00]' : 'bg-[var(--blue-primary)]'}`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="bg-white rounded-[24px] border border-[#E0E3E7] shadow-sm overflow-hidden">
                {cartItems.map((item, index) => (
                  <div 
                    key={`${item.id}-${item.selectedSize}`} 
                    className={`flex flex-col md:flex-row gap-6 p-6 md:p-8 ${index !== cartItems.length - 1 ? 'border-bottom border-[#E0E3E7]' : ''}`}
                    style={index !== cartItems.length - 1 ? { borderBottom: '1px solid #E0E3E7' } : {}}
                  >
                    {/* Item Image */}
                    <div className="size-[120px] md:size-[140px] bg-[#F6F7F8] rounded-[16px] border border-[#E0E3E7] shrink-0 overflow-hidden flex items-center justify-center group">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                          <span className="text-[11px] font-[700] tracking-widest text-[var(--blue-primary)] uppercase">
                            {item.category || 'Product'}
                          </span>
                          <h3 className="text-[18px] md:text-[20px] font-[600] text-[#1A1A1A] mt-1 leading-snug">{item.name}</h3>
                          <p className="text-[14px] text-[#5F6368] mt-2">
                             Size: <span className="font-[600] text-[#1A1A1A]">{item.selectedSize || 'Standard'}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                           <p className="text-[20px] font-[700] text-[#1A1A1A]">
                             {formatCurrency(item.price * item.quantity, settings.currency_symbol)}
                           </p>
                           {item.quantity > 1 && (
                             <p className="text-[12px] text-[#5F6368] mt-1">
                               {formatCurrency(item.price, settings.currency_symbol)} / unit
                             </p>
                           )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center border-[1.5px] border-[#E0E3E7] rounded-full h-[40px] bg-white overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1), item.selectedSize)}
                            className="size-[40px] flex items-center justify-center hover:bg-[#F6F7F8] text-[#1A1A1A] transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-[40px] text-center text-[15px] font-[600]">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                            className="size-[40px] flex items-center justify-center hover:bg-[#F6F7F8] text-[#1A1A1A] transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button 
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          className="flex items-center gap-2 text-[#E01E26] font-[600] text-[13px] hover:underline"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="bg-white p-5 rounded-[16px] border border-[#E0E3E7] flex items-center gap-4">
                    <div className="size-[40px] bg-[#F6F7F8] rounded-full flex items-center justify-center text-[var(--blue-primary)]">
                       <ShieldCheck size={20} />
                    </div>
                    <div>
                       <p className="text-[13px] font-[600] text-[#1A1A1A]">Secure Checkout</p>
                       <p className="text-[11px] text-[#5F6368]">Your data is encrypted</p>
                    </div>
                 </div>
                 <div className="bg-white p-5 rounded-[16px] border border-[#E0E3E7] flex items-center gap-4">
                    <div className="size-[40px] bg-[#F6F7F8] rounded-full flex items-center justify-center text-[var(--blue-primary)]">
                       <RefreshCw size={20} />
                    </div>
                    <div>
                       <p className="text-[13px] font-[600] text-[#1A1A1A]">Easy Returns</p>
                       <p className="text-[11px] text-[#5F6368]">30-day return policy</p>
                    </div>
                 </div>
                 <div className="bg-white p-5 rounded-[16px] border border-[#E0E3E7] flex items-center gap-4">
                    <div className="size-[40px] bg-[#F6F7F8] rounded-full flex items-center justify-center text-[var(--blue-primary)]">
                       <Truck size={20} />
                    </div>
                    <div>
                       <p className="text-[13px] font-[600] text-[#1A1A1A]">Track Order</p>
                       <p className="text-[11px] text-[#5F6368]">Real-time item tracking</p>
                    </div>
                 </div>
              </div>

            </div>

            {/* Right Col: Summary */}
            <aside className="lg:col-span-4 flex flex-col gap-6 sticky top-28">
              <div className="bg-white p-8 rounded-[24px] border border-[#E0E3E7] shadow-sm">
                <h2 className="text-[22px] font-[600] text-[#1A1A1A] mb-8">Order Summary</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-[15px]">
                    <span className="text-[#5F6368]">Subtotal</span>
                    <span className="text-[#1A1A1A] font-[600]">{formatCurrency(subtotal, settings.currency_symbol)}</span>
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between items-center text-[15px]">
                      <span className="text-[#5F6368]">Tax ({settings.tax_rate}%)</span>
                      <span className="text-[#1A1A1A] font-[600]">{formatCurrency(tax, settings.currency_symbol)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[15px]">
                    <span className="text-[#5F6368]">Shipping</span>
                    <span className={`font-[600] ${deliveryFee === 0 ? 'text-[#008A00]' : 'text-[#1A1A1A]'}`}>
                      {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee, settings.currency_symbol)}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-[#E0E3E7] w-full mb-6"></div>

                <div className="flex justify-between items-center mb-8">
                   <span className="text-[18px] font-[600] text-[#1A1A1A]">Total</span>
                   <span className="text-[26px] font-[700] text-[var(--blue-primary)]">
                     {formatCurrency(total, settings.currency_symbol)}
                   </span>
                </div>

                {/* Minimum Order Warning */}
                {!isMinOrderMet && (
                  <div className="p-4 bg-[#E01E26]/5 border border-[#E01E26]/20 rounded-[12px] mb-6">
                    <p className="text-[12px] text-[#E01E26] font-[600] leading-snug">
                       Minimum order amount is {formatCurrency(minOrderAmount, settings.currency_symbol)}. Please add more items to proceed.
                    </p>
                  </div>
                )}

                <button 
                  disabled={!isMinOrderMet}
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-[#FFC220] hover:bg-[#E5AF1C] text-[#1A1A1A] py-5 rounded-full font-[700] text-[18px] transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                >
                  Checkout
                </button>

                <div className="flex flex-col items-center gap-4 mt-8">
                   <p className="text-[12px] text-[#BDC1C6] font-[600] uppercase tracking-[0.1em]">Payment Secure & Encrypted</p>
                   <div className="flex justify-center gap-4 opacity-30 grayscale">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5" />
                   </div>
                </div>
              </div>

              {/* Help & Support */}
              <div className="bg-white p-6 rounded-[24px] border border-[#E0E3E7] shadow-sm flex flex-col gap-3">
                 <h3 className="text-[16px] font-[600] text-[#1A1A1A]">Need any help?</h3>
                 <p className="text-[13px] text-[#5F6368] leading-relaxed">Our support team is available mon-fri, 9am - 6pm. We're here to help with your purchase.</p>
                 <Link to="/contact" className="text-[var(--blue-primary)] font-[600] text-[14px] hover:underline mt-2">
                   Contact Support
                 </Link>
              </div>
            </aside>

          </div>
        )}

        {/* Essential Add-ons */}
        {recommendations.length > 0 && cartItems.length > 0 && (
          <section className="mt-24">
            <h2 className="text-[24px] md:text-[28px] font-[600] text-[#1A1A1A] mb-10">Essential Add-ons</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
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