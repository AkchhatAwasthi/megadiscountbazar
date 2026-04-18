import { useState, useEffect } from 'react';
import { ChevronLeft, Lock, ShieldCheck, CreditCard, MapPin, BadgeCheck, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { formatPrice } from '@/utils/currency';
import { initiateRazorpayPayment, OrderData } from '@/utils/razorpay';

import Stepper from '@/components/Stepper';
import GuestOrderPopup from '@/components/GuestOrderPopup';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { validateContactInfo, validateAddressDetails, validatePaymentMethod } from '@/utils/validation';
import { useSettings } from '@/hooks/useSettings';
import { toNumber, formatCurrency, calculatePercentage, meetsThreshold } from '@/utils/settingsHelpers';

// Import the new components
import CheckoutContactInfo from './Checkout/CheckoutContactInfo';
import CheckoutAddressDetails from './Checkout/CheckoutAddressDetails';
import CheckoutPayment from './Checkout/CheckoutPayment';
import CheckoutSummary from './Checkout/CheckoutSummary';

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartItems, clearCart } = useStore();
  const { settings } = useSettings();
  const [currentStep, setCurrentStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [showGuestOrderPopup, setShowGuestOrderPopup] = useState(false);
  const [guestOrderData, setGuestOrderData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [estimatedDeliveryFee, setEstimatedDeliveryFee] = useState<number | null>(null);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<string | null>(null);
  const [isPincodeServiceable, setIsPincodeServiceable] = useState(true);

  // Form validation states
  const [contactErrors, setContactErrors] = useState<string[]>([]);
  const [addressErrors, setAddressErrors] = useState<string[]>([]);

  // Customer Information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Address Details
  const [addressDetails, setAddressDetails] = useState({
    plotNumber: '',
    buildingName: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'home' as 'home' | 'work' | 'other',
    saveAs: ''
  });

  const steps = [
    { id: 'info', title: 'Contact', description: 'Your info' },
    { id: 'address', title: 'Shipping', description: 'Address' },
    { id: 'payment', title: 'Payment', description: 'Method' },
    { id: 'summary', title: 'Review', description: 'Verify' }
  ];

  useEffect(() => {
    fetchProductCoupons();
    fetchSavedAddresses();
    getCurrentUser();
  }, [cartItems]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
      setCurrentUser(null);
    }
  };

  const fetchSavedAddresses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSavedAddresses([]);
        return;
      }

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setSavedAddresses(data || []);
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
    }
  };

  const handleSavedAddressSelect = (address: any) => {
    setSelectedAddress(address);
    setUseExistingAddress(true);

    setAddressDetails({
      plotNumber: address.address_line_1.split(',')[0] || '',
      buildingName: '',
      street: address.address_line_2 || '',
      landmark: address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode,
      addressType: address.type,
      saveAs: address.type === 'other' ? address.name : ''
    });
  };

  const saveAddressToProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      if (savedAddresses.length >= 3) {
        toast({
          title: "Address Limit Reached",
          description: "You can only save up to 3 addresses.",
          variant: "destructive",
        });
        return;
      }

      const addressData = {
        user_id: user.id,
        name: addressDetails.addressType === 'other' ? addressDetails.saveAs : addressDetails.addressType,
        address_line_1: addressDetails.plotNumber,
        address_line_2: addressDetails.street,
        city: addressDetails.city,
        state: addressDetails.state,
        pincode: addressDetails.pincode,
        landmark: addressDetails.landmark,
        type: addressDetails.addressType,
        latitude: null,
        longitude: null,
        is_default: savedAddresses.length === 0
      };

      const { error } = await supabase
        .from('addresses')
        .insert([addressData]);

      if (error) throw error;

      toast({
        title: "Address Saved",
        description: "Your address has been saved to your profile.",
      });

      fetchSavedAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const fetchProductCoupons = async () => {
    try {
      const productIds = cartItems.map(item => item.id);
      if (productIds.length === 0) return;

      const { data: productCoupons, error: pcError } = await supabase
        .from('product_coupons')
        .select(`
          coupon_id,
          coupons (
            id,
            code,
            description,
            discount_type,
            discount_value,
            min_order_amount,
            max_discount_amount,
            is_active,
            valid_from,
            valid_until
          )
        `)
        .in('product_id', productIds);

      if (pcError) throw pcError;

      const productSpecificCoupons = productCoupons
        ?.map(pc => pc.coupons)
        .filter(c => c !== null && c.is_active && new Date(c.valid_until) > new Date())
        .filter((coupon, index, self) =>
          index === self.findIndex(c => c.id === coupon.id)
        ) || [];

      setAvailableCoupons(productSpecificCoupons);
    } catch (error) {
      console.error('Error fetching product coupons:', error);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (toNumber(item.price) * toNumber(item.quantity)), 0);
  const tax = calculatePercentage(subtotal, settings.tax_rate);

  useEffect(() => {
    const freeThreshold = toNumber(settings.free_delivery_threshold);
    if (subtotal >= freeThreshold) {
      setEstimatedDeliveryFee(0);
      setEstimatedDeliveryTime('Standard Delivery');
    } else {
      setEstimatedDeliveryFee(toNumber(settings.delivery_charge));
      setEstimatedDeliveryTime('2-5 business days');
    }
  }, [subtotal, settings]);

  const deliveryFee = estimatedDeliveryFee !== null ? estimatedDeliveryFee : (
    meetsThreshold(subtotal, settings.free_delivery_threshold) ? 0 : toNumber(settings.delivery_charge)
  );
  const codFee = paymentMethod === 'cod' ? toNumber(settings.cod_charge) : 0;
  const total = subtotal + tax + deliveryFee + codFee - discount;

  const isMinOrderMet = subtotal >= toNumber(settings.min_order_amount);
  const minOrderShortfall = Math.max(0, toNumber(settings.min_order_amount) - subtotal);

  const applyCoupon = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast({
          title: "Invalid coupon",
          description: "Please check your coupon code.",
          variant: "destructive",
        });
        return;
      }

      if (data.min_order_amount && subtotal < data.min_order_amount) {
        toast({
          title: "Minimum order not met",
          description: `Minimum order of ${settings.currency_symbol}${data.min_order_amount} required.`,
          variant: "destructive",
        });
        return;
      }

      let discountAmount = 0;
      if (data.discount_type === 'percentage') {
        discountAmount = (subtotal * data.discount_value) / 100;
        if (data.max_discount_amount) {
          discountAmount = Math.min(discountAmount, data.max_discount_amount);
        }
      } else {
        discountAmount = data.discount_value;
      }

      setDiscount(discountAmount);
      setAppliedCoupon(data);
      toast({
        title: "Coupon applied!",
        description: `You saved ${settings.currency_symbol}${discountAmount.toFixed(2)} on your order.`,
      });
    } catch (error) {
      console.error('Error applying coupon:', error);
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode('');
    toast({
      title: "Coupon removed",
      description: "Coupon has been removed.",
    });
  };

  const handleNextStep = () => {
    if (subtotal < toNumber(settings.min_order_amount)) {
      toast({
        title: "Minimum Order Not Met",
        description: `Minimum order is ${formatCurrency(settings.min_order_amount, settings.currency_symbol)}.`,
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 1) {
      const validation = validateContactInfo(customerInfo);
      if (!validation.isValid) {
        setContactErrors(validation.errors);
        return;
      }
      setContactErrors([]);
    } else if (currentStep === 2) {
      if (!addressDetails.city || !addressDetails.state || !addressDetails.pincode) {
        toast({ title: "Incomplete Address", description: "Please fill in all location details." });
        return;
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) return;
    if (!addressDetails.city || !addressDetails.pincode) return;

    setIsProcessingPayment(true);

    try {
      const orderNumber = `PH${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const completeAddress = `${addressDetails.plotNumber}, ${addressDetails.buildingName ? addressDetails.buildingName + ', ' : ''}${addressDetails.street}, ${addressDetails.landmark ? 'Near ' + addressDetails.landmark + ', ' : ''}${addressDetails.city}, ${addressDetails.state} - ${addressDetails.pincode}`;
      const { data: { user } } = await supabase.auth.getUser();

      const orderData = {
        user_id: user?.id || null,
        order_number: orderNumber,
        customer_info: customerInfo as any,
        delivery_location: { address: completeAddress } as any,
        address_details: {
          ...addressDetails,
          complete_address: completeAddress,
          latitude: null,
          longitude: null
        } as any,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          weight: item.selectedWeight || item.weight,
          image: item.image,
          category: item.category || 'Product',
          selected_size: item.selectedSize || 'Standard'
        })) as any,
        subtotal: subtotal,
        tax: tax,
        delivery_fee: deliveryFee,
        cod_fee: codFee,
        discount: discount,
        total: total,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon?.code || null,
        selected_size: cartItems.map(item => item.selectedSize || 'Standard').join(', '),
        selected_weight: cartItems.map(item => item.selectedWeight).filter(Boolean).join(', ') || null
      };

      if (paymentMethod === 'cod') {
        const { error: dbError } = await supabase.from('orders').insert([{ ...orderData, payment_status: 'pending', order_status: 'placed' }]);
        if (dbError) throw dbError;
        
        if (!useExistingAddress && currentUser) await saveAddressToProfile();
        
        if (appliedCoupon) {
          await supabase.from('coupons').update({ used_count: appliedCoupon.used_count + 1 }).eq('id', appliedCoupon.id);
        }

        if (!currentUser) {
          setGuestOrderData({ ...orderData, orderNumber, deliveryDetails: addressDetails });
          useStore.getState().triggerAnimation('order-confirmed');
          setShowGuestOrderPopup(true);
        } else {
          useStore.getState().triggerAnimation('order-confirmed');
          navigate('/profile?tab=orders');
        }
        clearCart();
      } else {
        const razorpayOrderData: OrderData = {
          orderId: orderNumber,
          amount: Math.round(total),
          currency: 'INR',
          items: cartItems,
          customerInfo,
          deliveryAddress: { address: completeAddress, lat: 0, lng: 0 }
        };

        await initiateRazorpayPayment(
          razorpayOrderData,
          async (response) => {
            await supabase.from('orders').insert([{ ...orderData, payment_status: 'paid', order_status: 'confirmed', razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id }]);
            if (!useExistingAddress && currentUser) await saveAddressToProfile();
            clearCart();
            if (!currentUser) {
               setGuestOrderData({ ...orderData, orderNumber, paymentStatus: 'paid' });
               useStore.getState().triggerAnimation('order-confirmed');
               setShowGuestOrderPopup(true);
            } else {
               useStore.getState().triggerAnimation('order-confirmed');
               navigate('/profile?tab=orders');
            }
          },
          (error) => toast({ title: "Payment Failed", description: error.message, variant: "destructive" })
        );
      }
    } catch (error) {
      console.error('Order logic error:', error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (cartItems.length === 0 && !showGuestOrderPopup) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-surface-page)] p-6 text-center">
         <div className="size-[120px] bg-white rounded-full flex items-center justify-center mb-8 shadow-sm">
            <ShoppingBag className="size-[48px] text-[#BDC1C6]" />
         </div>
         <h2 className="text-[28px] font-[600] text-[var(--color-text-primary)] mb-4">Your bag is empty</h2>
         <p className="text-[var(--color-text-secondary)] mb-10 max-w-sm">Add some items to your bag before moving to checkout.</p>
         <Button onClick={() => navigate('/products')} className="bg-[var(--color-brand-red)] text-white rounded-[8px] px-10 h-12 font-[500] text-[14px] hover:bg-[var(--color-brand-red-deep)] transition-all">
           Start Shopping
         </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-page)] font-inter pb-20">
      
      {/* Checkout Navbar */}
      <nav className="bg-white border-b border-[var(--color-border-default)] sticky top-0 z-[50]">
         <div className="max-w-[1280px] mx-auto px-6 h-[72px] flex items-center justify-between">
            <button 
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <ChevronLeft size={20} />
              <span className="text-[14px] font-[600]">Back to Cart</span>
            </button>
            <div className="flex items-center gap-2">
               <ShieldCheck className="text-[#008A00] size-5" />
               <span className="text-[12px] font-[700] text-[var(--color-text-primary)] uppercase tracking-wider">Secure Checkout</span>
            </div>
         </div>
      </nav>

      <div className="max-w-[1280px] mx-auto px-6 py-10 md:py-16">
        
        {/* Page Header */}
        <div className="mb-12">
           <h1 className="text-[32px] md:text-[40px] font-[600] text-[var(--color-text-primary)] leading-tight">
             Checkout
           </h1>
           <div className="flex items-center gap-4 mt-3 text-[var(--color-text-secondary)]">
              <span className="flex items-center gap-1.5 text-[14px]">
                 <BadgeCheck size={16} className="text-[var(--color-brand-red)]" />
                 Satisfaction Guaranteed
              </span>
              <span className="size-1 bg-[#BDC1C6] rounded-full"></span>
              <span className="flex items-center gap-1.5 text-[14px]">
                 <Lock size={16} className="text-[var(--color-brand-red)]" />
                 AES-256 Encryption
              </span>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Checkout Section */}
          <div className="lg:col-span-8">
            
            {/* Stepper */}
            <div className="mb-12 bg-white p-6 md:p-8 rounded-[12px] border border-[var(--color-border-default)] shadow-sm">
               <Stepper steps={steps} currentStep={currentStep} />
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-[12px] border border-[var(--color-border-default)] shadow-sm p-6 md:p-10">
              {currentStep === 1 && (
                <CheckoutContactInfo
                  customerInfo={customerInfo}
                  setCustomerInfo={setCustomerInfo}
                  onNext={handleNextStep}
                  errors={contactErrors}
                />
              )}

              {currentStep === 2 && (
                <CheckoutAddressDetails
                  addressDetails={addressDetails}
                  setAddressDetails={setAddressDetails}
                  savedAddresses={savedAddresses}
                  selectedAddress={selectedAddress}
                  setSelectedAddress={setSelectedAddress}
                  useExistingAddress={useExistingAddress}
                  setUseExistingAddress={setUseExistingAddress}
                  showAddressForm={showAddressForm}
                  setShowAddressForm={setShowAddressForm}
                  settings={settings}
                  subtotal={subtotal}
                  currentUser={currentUser}
                  onNext={handleNextStep}
                  onPrev={handlePrevStep}
                  estimatedDeliveryFee={estimatedDeliveryFee}
                  setEstimatedDeliveryFee={setEstimatedDeliveryFee}
                  estimatedDeliveryTime={estimatedDeliveryTime}
                  setEstimatedDeliveryTime={setEstimatedDeliveryTime}
                  cartItems={cartItems}
                  isPincodeServiceable={isPincodeServiceable}
                  setIsPincodeServiceable={setIsPincodeServiceable}
                />
              )}

              {currentStep === 3 && (
                <CheckoutPayment
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  settings={settings}
                  total={total}
                  onNext={handleNextStep}
                  onPrev={handlePrevStep}
                />
              )}

              {currentStep === 4 && (
                <CheckoutSummary
                  customerInfo={customerInfo}
                  addressDetails={addressDetails}
                  paymentMethod={paymentMethod}
                  cartItems={cartItems}
                  subtotal={subtotal}
                  tax={tax}
                  deliveryFee={deliveryFee}
                  codFee={codFee}
                  discount={discount}
                  total={total}
                  settings={settings}
                  isMinOrderMet={isMinOrderMet}
                  minOrderShortfall={minOrderShortfall}
                  isProcessingPayment={isProcessingPayment}
                  estimatedDeliveryFee={estimatedDeliveryFee}
                  estimatedDeliveryTime={estimatedDeliveryTime}
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  appliedCoupon={appliedCoupon}
                  setAppliedCoupon={setAppliedCoupon}
                  availableCoupons={availableCoupons}
                  onPlaceOrder={handlePlaceOrder}
                  onPrev={handlePrevStep}
                  onApplyCoupon={applyCoupon}
                  onRemoveCoupon={removeCoupon}
                  isPincodeServiceable={isPincodeServiceable}
                />
              )}
            </div>

          </div>

          {/* Right Col: Minimal Sidebar Summary */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[12px] border border-[var(--color-border-default)] shadow-sm">
               <h2 className="text-[20px] font-[600] text-[var(--color-text-primary)] mb-8">Order Summary</h2>
               
               <div className="space-y-4 mb-8 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map((item) => (
                     <div key={`${item.id}-${item.selectedSize}-${item.selectedWeight}`} className="flex gap-4">
                        <div className="size-[64px] rounded-[10px] bg-[var(--color-surface-page)] border border-[var(--color-border-default)] shrink-0 flex items-center justify-center p-1">
                           <img src={item.image} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                           <h4 className="text-[14px] font-[600] text-[var(--color-text-primary)] leading-tight truncate">{item.name}</h4>
                           <p className="text-[12px] text-[var(--color-text-secondary)] mt-1">Qty: {item.quantity} • {[item.selectedSize, item.selectedWeight].filter(Boolean).join(' | ') || 'Std'}</p>
                        </div>
                        <div className="shrink-0 flex flex-col justify-center items-end">
                           <p className="text-[14px] font-[700] text-[var(--color-text-primary)]">
                              {formatCurrency(item.price * item.quantity, settings.currency_symbol)}
                           </p>
                        </div>
                     </div>
                  ))}
               </div>

               <div className="h-px bg-[var(--color-border-default)] w-full mb-6"></div>

               <div className="space-y-4 mb-4">
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-[var(--color-text-secondary)]">Subtotal</span>
                    <span className="text-[var(--color-text-primary)] font-[600]">{formatCurrency(subtotal, settings.currency_symbol)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-[var(--color-text-secondary)]">Shipping</span>
                    <span className={`font-[600] ${deliveryFee === 0 ? 'text-[#008A00]' : 'text-[var(--color-text-primary)]'}`}>
                      {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee, settings.currency_symbol)}
                    </span>
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-[var(--color-text-secondary)]">Tax ({settings.tax_rate}%)</span>
                      <span className="text-[var(--color-text-primary)] font-[600]">{formatCurrency(tax, settings.currency_symbol)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                     <div className="flex justify-between items-center text-[14px] text-[#008A00] font-[600]">
                        <span>Discount</span>
                        <span>-{formatCurrency(discount, settings.currency_symbol)}</span>
                     </div>
                  )}
               </div>

               <div className="pt-6 border-t border-[var(--color-surface-page)]">
                  <div className="flex justify-between items-center">
                     <span className="text-[18px] font-[700] text-[var(--color-text-primary)]">Total</span>
                     <span className="text-[24px] font-[700] text-[var(--color-brand-red)]">
                        {formatCurrency(total, settings.currency_symbol)}
                     </span>
                  </div>
               </div>
            </div>

            {/* Help Content */}
            <div className="bg-[var(--color-brand-red-light)]/30 border border-[var(--color-brand-red-light)] p-6 rounded-[12px]">
               <h3 className="text-[15px] font-[600] text-[var(--color-text-primary)] flex items-center gap-2 mb-2">
                  <ShieldCheck size={18} className="text-[var(--color-brand-red)]" />
                  Your privacy is our priority
               </h3>
               <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                  We use secure industry-standard encryption to protect your personal information during checkout.
               </p>
            </div>
          </aside>

        </div>
      </div>

      <GuestOrderPopup
        isOpen={showGuestOrderPopup}
        onClose={() => {
          setShowGuestOrderPopup(false);
          navigate('/');
        }}
        orderData={guestOrderData}
      />
    </div>
  );
};

export default Checkout;
