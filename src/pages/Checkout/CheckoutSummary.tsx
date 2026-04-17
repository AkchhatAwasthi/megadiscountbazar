import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/utils/currency';
import { toNumber, formatCurrency } from '@/utils/settingsHelpers';
import { ShoppingCart, MapPin, CreditCard, ChevronLeft, Rocket, Tag, X } from 'lucide-react';

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

interface AddressDetails {
  plotNumber: string;
  buildingName: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  addressType: 'home' | 'work' | 'other';
  saveAs: string;
}

interface CheckoutSummaryProps {
  customerInfo: ContactInfo;
  addressDetails: AddressDetails;
  paymentMethod: string;
  cartItems: any[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  codFee: number;
  discount: number;
  total: number;
  settings: any;
  isMinOrderMet: boolean;
  minOrderShortfall: number;
  isProcessingPayment: boolean;
  estimatedDeliveryFee: number | null;
  estimatedDeliveryTime: string | null;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: any;
  setAppliedCoupon: (coupon: any) => void;
  availableCoupons: any[];
  onPlaceOrder: () => void;
  onPrev: () => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  isPincodeServiceable: boolean;
}

const CheckoutSummary = ({
  customerInfo,
  addressDetails,
  paymentMethod,
  cartItems,
  subtotal,
  tax,
  deliveryFee,
  codFee,
  discount,
  total,
  settings,
  isMinOrderMet,
  minOrderShortfall,
  isProcessingPayment,
  estimatedDeliveryFee,
  estimatedDeliveryTime,
  couponCode,
  setCouponCode,
  appliedCoupon,
  setAppliedCoupon,
  availableCoupons,
  onPlaceOrder,
  onPrev,
  onApplyCoupon,
  onRemoveCoupon,
  isPincodeServiceable
}: CheckoutSummaryProps) => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="size-10 bg-[var(--color-brand-red-light)] rounded-full flex items-center justify-center text-[var(--color-brand-red)] shadow-sm">
           <ShoppingCart size={20} />
        </div>
        <h2 className="text-[20px] md:text-[24px] font-[700] text-[var(--color-text-primary)] tracking-tight">Review Order</h2>
      </div>

      <div className="space-y-8">
        {/* Logistics & Payment Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Shipping Info */}
           <div className="p-6 rounded-[20px] bg-[var(--color-surface-page)] border-[1.5px] border-[var(--color-border-default)] hover:border-[var(--color-brand-red)]/30 hover:shadow-sm transition-all duration-300">
              <div className="flex items-center gap-2 mb-4 text-[var(--color-brand-red)]">
                 <MapPin size={18} />
                 <h3 className="text-[14px] font-[800] uppercase tracking-wider">Shipping Address</h3>
              </div>
              <div className="space-y-1">
                 <p className="text-[15px] font-[600] text-[var(--color-text-primary)]">{customerInfo.name}</p>
                 <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                    {addressDetails.plotNumber}, {addressDetails.buildingName && `${addressDetails.buildingName}, `}
                    {addressDetails.street}, {addressDetails.landmark && `${addressDetails.landmark}, `}
                    {addressDetails.city}, {addressDetails.state} - {addressDetails.pincode}
                 </p>
                 <p className="text-[13px] text-[var(--color-text-secondary)] pt-1">{customerInfo.phone}</p>
              </div>
           </div>

           {/* Payment Info */}
           <div className="p-6 rounded-[20px] bg-[var(--color-surface-page)] border-[1.5px] border-[var(--color-border-default)] hover:border-[var(--color-brand-red)]/30 hover:shadow-sm transition-all duration-300">
              <div className="flex items-center gap-2 mb-4 text-[var(--color-brand-red)]">
                 <CreditCard size={18} />
                 <h3 className="text-[14px] font-[800] uppercase tracking-wider">Payment Method</h3>
              </div>
              <div className="space-y-1">
                 <p className="text-[15px] font-[600] text-[var(--color-text-primary)]">
                    {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Secure Online Payment'}
                 </p>
                 <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                    {paymentMethod === 'cod' 
                       ? 'Pay total amount at the time of delivery.' 
                       : 'Payment will be processed via secure encrypted checkout.'}
                 </p>
              </div>
           </div>
        </div>

        {/* Order Details - Manifest */}
        <div className="space-y-4">
           <h3 className="text-[15px] font-[700] text-[var(--color-text-primary)] uppercase tracking-wider px-2">Order Details</h3>
           <div className="bg-white border border-[var(--color-border-default)] rounded-[12px] overflow-hidden divide-y divide-[var(--color-surface-page)]">
              {cartItems.map((item) => (
                 <div key={`${item.id}-${item.selectedSize}`} className="p-5 md:p-6 flex items-center gap-4 md:gap-6 group hover:bg-[var(--color-surface-page)] transition-colors duration-200">
                    <div className="size-[80px] bg-[var(--color-surface-page)] rounded-[12px] border border-[var(--color-border-default)] shrink-0 overflow-hidden flex items-center justify-center group-hover:border-[var(--color-brand-red)] transition-colors">
                       <img src={item.image} alt="" className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="text-[15px] font-[700] text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-brand-red)] transition-colors">{item.name}</h4>
                       <p className="text-[12px] text-[var(--color-text-secondary)] mt-1 uppercase font-[600] tracking-wide">
                          Qty: {item.quantity} • Size: {item.selectedSize || 'Std'}
                       </p>
                    </div>
                    <div className="shrink-0 text-right">
                       <p className="text-[16px] font-[700] text-[var(--color-text-primary)]">
                          {formatCurrency(item.price * item.quantity, settings.currency_symbol)}
                       </p>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Coupon Section */}
        <div className="p-6 pt-2">
           {appliedCoupon ? (
               <div className="flex items-center justify-between p-4 bg-[var(--color-brand-red-light)]/60 border-[1.5px] border-[var(--color-brand-red)]/30 rounded-[12px] px-6 transition-all hover:bg-[var(--color-brand-red-light)]">
                  <div className="flex items-center gap-3">
                     <div className="size-8 bg-[var(--color-brand-red)] rounded-full flex items-center justify-center text-white shadow-sm">
                        <Tag size={14} />
                     </div>
                     <div>
                        <span className="text-[13px] font-[800] text-[var(--color-text-primary)] uppercase tracking-wider">{appliedCoupon.code}</span>
                        <span className="text-[11px] text-[var(--color-brand-red)] block font-[700]">Coupon Applied</span>
                     </div>
                  </div>
                  <button 
                   onClick={onRemoveCoupon}
                   className="text-[var(--color-text-secondary)] hover:text-[#E01E26] transition-colors"
                   aria-label="Remove Coupon"
                  >
                     <X size={18} />
                  </button>
               </div>
            ) : (
               <div className="flex gap-2">
                  <div className="relative flex-1 group">
                     <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BDC1C6] group-hover:text-[var(--color-text-secondary)] transition-colors" size={16} />
                     <Input
                       placeholder="GOT A COUPON?"
                       value={couponCode}
                       onChange={(e) => setCouponCode(e.target.value)}
                       className="h-[52px] pl-[42px] rounded-[10px] border-[1.5px] border-[var(--color-border-default)] font-[600] text-[14px] focus:border-[var(--color-brand-red)] focus:ring-[4px] focus:ring-[var(--color-brand-red)]/10 hover:border-[#CBD5E1] transition-all shadow-sm w-full uppercase"
                     />
                  </div>
                  <Button
                    onClick={onApplyCoupon}
                    className="h-[52px] px-8 rounded-[10px] bg-[var(--color-brand-red)] text-white font-[700] text-[14px] hover:bg-[var(--color-brand-red-deep)] transition-all shadow-md active:scale-[0.98] hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,113,220,0.24)]"
                  >
                     Apply
                  </Button>
               </div>
            )}
        </div>

        {/* Totals Breakdown */}
        <div className="bg-[var(--color-text-primary)] text-white p-8 rounded-[12px] shadow-[0_24px_48px_rgba(0,0,0,0.15)] relative overflow-hidden">
           {/* Subtle background pattern */}
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_20%_30%,_white_1px,_transparent_0)] bg-[length:24px_24px]"></div>
           
           <div className="relative z-10">
              <div className="space-y-4 mb-8">
                 <div className="flex justify-between items-center text-[14px] text-gray-400">
                    <span className="uppercase tracking-widest font-[700]">Subtotal</span>
                    <span className="text-white font-[700] text-[16px]">{formatPrice(subtotal)}</span>
                 </div>
                 <div className="flex justify-between items-center text-[14px] text-gray-400">
                    <span className="uppercase tracking-widest font-[700]">Transport</span>
                    <span className="text-white font-[700] text-[16px]">
                       {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                    </span>
                 </div>
                 <div className="flex justify-between items-center text-[14px] text-gray-400">
                    <span className="uppercase tracking-widest font-[700]">Taxes</span>
                    <span className="text-white font-[700] text-[16px]">{formatPrice(tax)}</span>
                 </div>
                 {paymentMethod === 'cod' && Number(settings.cod_charge) > 0 && (
                   <div className="flex justify-between items-center text-[14px] text-gray-400">
                      <span className="uppercase tracking-widest font-[700]">COD Fee</span>
                      <span className="text-white font-[700] text-[16px]">{formatPrice(codFee)}</span>
                   </div>
                 )}
                 {discount > 0 && (
                   <div className="flex justify-between items-center text-[#00E676] bg-[#00E676]/5 p-3 rounded-[12px] -mx-2">
                      <span className="uppercase tracking-widest font-[700] text-[12px] flex items-center gap-2">
                        <Tag size={12} /> Discount Applied
                      </span>
                      <span className="font-[800] text-[16px]">-{formatPrice(discount)}</span>
                   </div>
                 )}
              </div>

              <div className="h-px bg-white/10 w-full mb-8 border-t border-dashed"></div>

              <div className="flex justify-between items-end">
                 <div className="flex flex-col">
                    <span className="text-gray-400 text-[12px] font-[700] uppercase tracking-[0.2em] mb-1">Total Payable</span>
                    <span className="text-[32px] md:text-[42px] font-[800] text-[var(--color-brand-yellow)] leading-none drop-shadow-[0_4px_12px_rgba(255,194,32,0.2)]">
                       {formatPrice(total)}
                    </span>
                 </div>
                 <div className="text-right pb-1">
                    <span className="text-[11px] text-gray-500 uppercase tracking-widest font-[600]">Included all region taxes</span>
                 </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={onPlaceOrder}
                disabled={isProcessingPayment || !isMinOrderMet || !isPincodeServiceable}
                className="w-full mt-10 h-[64px] rounded-[12px] bg-[var(--color-brand-red)] text-white hover:bg-[var(--color-brand-red-deep)] font-[700] text-[18px] transition-all shadow-[0_12px_24px_rgba(0,113,220,0.24)] hover:-translate-y-[2px] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:hover:-translate-y-0 disabled:hover:shadow-none group uppercase tracking-wider"
              >
                {isProcessingPayment ? (
                   <div className="flex items-center gap-3">
                      <div className="size-5 border-3 border-[var(--color-text-primary)]/30 border-t-[var(--color-text-primary)] rounded-full animate-spin"></div>
                      Processing...
                   </div>
                ) : (
                   <div className="flex items-center gap-3">
                      Place Order
                      <Rocket size={20} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                   </div>
                )}
              </Button>

              {!isPincodeServiceable && (
                 <p className="text-[#FF5252] text-[12px] text-center mt-4 font-[700] uppercase tracking-wider animate-pulse">
                    Pincode {addressDetails.pincode} is currently not serviceable
                 </p>
              )}
           </div>
        </div>

        <div className="flex items-center justify-center pt-8">
           <button 
             onClick={onPrev}
             className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-[14px] font-[600] flex items-center gap-2 transition-colors uppercase tracking-wider"
           >
              <ChevronLeft size={18} />
              Back to Payment
           </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;
