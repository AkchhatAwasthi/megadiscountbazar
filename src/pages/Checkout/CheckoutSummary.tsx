import { formatPrice } from '@/utils/currency';
import { formatCurrency } from '@/utils/settingsHelpers';
import { Input } from '@/components/ui/input';
import { ShoppingBag, MapPin, CreditCard, ChevronLeft, Truck, Tag, X, ShieldCheck, Loader2 } from 'lucide-react';

interface ContactInfo { name: string; email: string; phone: string; }
interface AddressDetails {
  plotNumber: string; buildingName: string; street: string; landmark: string;
  city: string; state: string; pincode: string;
  addressType: 'home' | 'work' | 'other'; saveAs: string;
}
interface Props {
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
  minOrderShortfall?: number;
  isProcessingPayment: boolean;
  estimatedDeliveryFee?: number | null;
  estimatedDeliveryTime?: string | null;
  couponCode: string;
  setCouponCode: (c: string) => void;
  appliedCoupon: any;
  setAppliedCoupon?: (c: any) => void;
  availableCoupons?: any[];
  onPlaceOrder: () => void;
  onPrev: () => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  isPincodeServiceable: boolean;
}

const InfoCard = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
  <div className="p-5 rounded-[14px] border border-[var(--color-border-default)] bg-[var(--color-surface-page)] hover:border-[var(--color-brand-red)]/30 transition-colors">
    <div className="flex items-center gap-2 mb-3">
      <Icon size={15} className="text-[var(--color-brand-red)]" />
      <span className="text-[12px] font-[700] text-[var(--color-text-secondary)] uppercase tracking-wider">{title}</span>
    </div>
    {children}
  </div>
);

const CheckoutSummary = ({
  customerInfo, addressDetails, paymentMethod, cartItems,
  subtotal, tax, deliveryFee, codFee, discount, total,
  settings, isMinOrderMet, isProcessingPayment,
  couponCode, setCouponCode, appliedCoupon,
  onPlaceOrder, onPrev, onApplyCoupon, onRemoveCoupon, isPincodeServiceable,
}: Props) => {
  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 space-y-7">
      {/* Step title */}
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-[var(--color-brand-red)] flex items-center justify-center shadow-sm">
          <ShoppingBag size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-[20px] font-[700] text-[var(--color-text-primary)] leading-tight">Review Your Order</h2>
          <p className="text-[13px] text-[var(--color-text-secondary)]">Double-check before placing</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard icon={MapPin} title="Shipping To">
          <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">{customerInfo.name}</p>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-1 leading-relaxed">
            {addressDetails.plotNumber}{addressDetails.buildingName ? `, ${addressDetails.buildingName}` : ''},&nbsp;
            {addressDetails.street}{addressDetails.landmark ? `, ${addressDetails.landmark}` : ''},{' '}
            {addressDetails.city}, {addressDetails.state} — {addressDetails.pincode}
          </p>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">{customerInfo.phone}</p>
        </InfoCard>

        <InfoCard icon={CreditCard} title="Payment Via">
          <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">
            {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Secure Online Payment'}
          </p>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-1 leading-relaxed">
            {paymentMethod === 'cod'
              ? 'Pay the total amount when your order arrives.'
              : 'Encrypted Razorpay checkout — Card / UPI / Wallet.'}
          </p>
        </InfoCard>
      </div>

      {/* Order Items */}
      <div>
        <p className="text-[13px] font-[700] text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
          Order Items ({cartItems.length})
        </p>
        <div className="border border-[var(--color-border-default)] rounded-[14px] overflow-hidden divide-y divide-[var(--color-border-default)]/60">
          {cartItems.map(item => (
            <div key={`${item.id}-${item.selectedWeight}-${item.selectedSize}`}
              className="flex items-center gap-4 p-4 hover:bg-[var(--color-surface-page)] transition-colors group"
            >
              <div className="size-16 bg-[var(--color-surface-page)] rounded-[10px] border border-[var(--color-border-default)] shrink-0 overflow-hidden flex items-center justify-center p-1 group-hover:border-[var(--color-brand-red)]/30 transition-colors">
                <img src={item.image} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-[600] text-[var(--color-text-primary)] truncate">{item.name}</p>
                <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
                  Qty: {item.quantity}{(item.selectedWeight || item.selectedSize) ? ` · ${item.selectedWeight || item.selectedSize}` : ''}
                </p>
              </div>
              <p className="text-[14px] font-[700] text-[var(--color-text-primary)] shrink-0">
                {formatCurrency(item.price * item.quantity, settings.currency_symbol)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Coupon */}
      <div>
        {appliedCoupon ? (
          <div className="flex items-center justify-between p-4 bg-[var(--color-brand-red-light)]/40 border border-[var(--color-brand-red)]/30 rounded-[12px]">
            <div className="flex items-center gap-3">
              <div className="size-8 bg-[var(--color-brand-red)] rounded-full flex items-center justify-center">
                <Tag size={13} className="text-white" />
              </div>
              <div>
                <p className="text-[13px] font-[700] text-[var(--color-text-primary)] uppercase tracking-wider">{appliedCoupon.code}</p>
                <p className="text-[11px] text-[var(--color-brand-red)] font-[600]">Coupon applied!</p>
              </div>
            </div>
            <button onClick={onRemoveCoupon} className="text-[var(--color-text-secondary)] hover:text-[#E01E26] transition-colors p-1">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <Input
                placeholder="Coupon code"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onApplyCoupon()}
                className="h-12 pl-10 rounded-[10px] border-[1.5px] border-[var(--color-border-default)] text-[14px] font-[600] uppercase focus:border-[var(--color-brand-red)] focus:ring-2 focus:ring-[var(--color-brand-red)]/10 transition-all"
              />
            </div>
            <button
              onClick={onApplyCoupon}
              className="h-12 px-6 rounded-[10px] bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] text-white font-[700] text-[14px] transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Pricing summary */}
      <div className="rounded-[16px] border border-[var(--color-border-default)] overflow-hidden">
        <div className="p-5 space-y-3 bg-white">
          <div className="flex justify-between text-[14px]">
            <span className="text-[var(--color-text-secondary)]">Subtotal</span>
            <span className="font-[600] text-[var(--color-text-primary)]">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-[var(--color-text-secondary)]">Shipping</span>
            <span className={`font-[600] ${deliveryFee === 0 ? 'text-[#008A00]' : 'text-[var(--color-text-primary)]'}`}>
              {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
            </span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between text-[14px]">
              <span className="text-[var(--color-text-secondary)]">Tax ({settings.tax_rate}%)</span>
              <span className="font-[600] text-[var(--color-text-primary)]">{formatPrice(tax)}</span>
            </div>
          )}
          {codFee > 0 && (
            <div className="flex justify-between text-[14px]">
              <span className="text-[var(--color-text-secondary)]">COD Fee</span>
              <span className="font-[600] text-[var(--color-text-primary)]">{formatPrice(codFee)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-[14px] text-[#008A00] font-[600]">
              <span>Discount</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between p-5 bg-[var(--color-text-primary)]">
          <div>
            <p className="text-[11px] text-white/50 uppercase tracking-widest font-[600]">Total Payable</p>
            <p className="text-[30px] font-[800] text-[var(--color-brand-yellow)] leading-tight">{formatPrice(total)}</p>
          </div>
          <div className="flex items-center gap-1.5 text-white/40">
            <ShieldCheck size={14} />
            <span className="text-[11px] font-[600]">Incl. all taxes</span>
          </div>
        </div>
      </div>

      {/* Delivery estimate */}
      <div className="flex items-center gap-3 p-4 rounded-[12px] bg-[var(--color-surface-page)] border border-[var(--color-border-default)]">
        <Truck size={18} className="text-[var(--color-brand-red)] shrink-0" />
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          Estimated delivery in <span className="font-[700] text-[var(--color-text-primary)]">2–5 business days</span>
        </p>
      </div>

      {/* Place Order button */}
      <button
        onClick={onPlaceOrder}
        disabled={isProcessingPayment || !isMinOrderMet || !isPincodeServiceable}
        className="w-full h-[60px] rounded-[14px] bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] text-white font-[700] text-[16px] transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3"
      >
        {isProcessingPayment ? (
          <><Loader2 size={20} className="animate-spin" /> Processing…</>
        ) : (
          <>{paymentMethod === 'cod' ? 'Place Order' : 'Proceed to Pay'} — {formatPrice(total)}</>
        )}
      </button>

      {!isPincodeServiceable && (
        <p className="text-center text-[13px] font-[600] text-[#E01E26]">
          Delivery not available for pincode {addressDetails.pincode}.
        </p>
      )}

      {/* Back */}
      <div className="flex justify-center">
        <button onClick={onPrev} className="flex items-center gap-1.5 text-[13px] font-[600] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
          <ChevronLeft size={15} /> Back to Payment
        </button>
      </div>
    </div>
  );
};

export default CheckoutSummary;
