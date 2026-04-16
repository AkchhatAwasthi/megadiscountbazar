import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  User, 
  CreditCard, 
  Phone, 
  Mail, 
  Download,
  ChevronRight,
  Info,
  ShieldCheck,
  Calendar,
  Wallet
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { downloadInvoice, validateInvoiceData } from '@/utils/invoiceGenerator';
import { formatPrice } from '@/utils/currency';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  weight: string;
  category: string;
  selected_size?: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  codFee: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'confirmed' | 'placed';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  shippingAddress: {
    completeAddress: string;
    mapAddress?: string;
    plotNumber: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
  };
  orderDate: string;
  deliveryDate?: string;
  trackingNumber?: string;
  notes?: string;
  couponCode?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  estimatedDeliveryTime?: string;
  selectedSize?: string;
}

const UserOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchOrderDetail();
    }
  }, [id, user]);

  const fetchOrderDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data.user_id !== user?.id) {
        const customerInfo = data.customer_info as any;
        if (customerInfo?.email !== user?.email) {
          toast({ title: "Access Denied", variant: "destructive" });
          navigate('/profile');
          return;
        }
      }

      if (data) {
        const customerInfo = data.customer_info as any;
        const addressDetails = data.address_details as any;
        const deliveryLocation = data.delivery_location as any;
        const orderItems = data.items as any;

        const orderDetail: OrderDetail = {
          id: data.id,
          orderNumber: data.order_number,
          customerName: customerInfo?.name || 'Customer',
          customerEmail: customerInfo?.email || '',
          customerPhone: customerInfo?.phone || '',
          items: Array.isArray(orderItems) ? orderItems.map((item: any) => ({
            ...item,
            selected_size: item.selected_size || (data as any).selected_size
          })) : [],
          subtotal: data.subtotal,
          deliveryFee: data.delivery_fee,
          codFee: data.cod_fee || 0,
          tax: data.tax,
          discount: data.discount || 0,
          total: data.total,
          status: data.order_status as any,
          paymentStatus: data.payment_status as any,
          paymentMethod: data.payment_method,
          shippingAddress: {
            completeAddress: addressDetails?.complete_address || '',
            mapAddress: addressDetails?.map_address || deliveryLocation?.address || '',
            plotNumber: addressDetails?.plotNumber || '',
            street: addressDetails?.street || '',
            city: deliveryLocation?.address?.split(',').slice(-2, -1)[0]?.trim() || 'Unknown',
            state: deliveryLocation?.address?.split(',').slice(-1)[0]?.trim() || 'Unknown',
            pincode: addressDetails?.pincode || '',
            landmark: addressDetails?.landmark || '',
            latitude: addressDetails?.latitude || deliveryLocation?.lat,
            longitude: addressDetails?.longitude || deliveryLocation?.lng
          },
          orderDate: data.created_at,
          deliveryDate: data.actual_delivery,
          trackingNumber: data.tracking_url,
          notes: data.special_instructions,
          couponCode: data.coupon_code,
          razorpayPaymentId: data.razorpay_payment_id,
          razorpayOrderId: data.razorpay_order_id,
          selectedSize: (data as any).selected_size,
        };
        setOrder(orderDetail);
      }
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast({ title: "Error", variant: "destructive" });
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    try {
      const invoiceData = {
        invoice_number: `INV-${order.orderNumber}`,
        order_number: order.orderNumber,
        invoice_date: new Date().toLocaleDateString('en-IN'),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
        order_date: formatDate(order.orderDate),
        store_info: {
          store_name: 'Megadiscountstore',
          store_address: 'Premium Hypermarket Hub',
          store_phone: '+91 9996616153',
          store_email: 'support@megadiscountstore.com',
          currency_symbol: '₹'
        },
        customer_info: {
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone
        },
        delivery_address: {
          ...order.shippingAddress,
          street: order.shippingAddress.completeAddress || order.shippingAddress.street,
          complete_address: order.shippingAddress.completeAddress
        },
        items: order.items,
        pricing: {
          subtotal: order.subtotal,
          tax: order.tax,
          delivery_fee: order.deliveryFee,
          cod_fee: order.codFee,
          discount: order.discount,
          total: order.total
        },
        payment_info: {
          method: order.paymentMethod,
          status: order.paymentStatus,
          razorpay_payment_id: order.razorpayPaymentId
        },
        order_status: order.status,
        coupon_code: order.couponCode,
        special_instructions: order.notes
      };

      if (!validateInvoiceData(invoiceData)) throw new Error('Invalid invoice data');
      await downloadInvoice(invoiceData);
      toast({ title: "Success", description: "Invoice downloaded" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="size-10 border-[3px] border-[var(--blue-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--surface-light)] px-6 text-center">
        <h1 className="text-[28px] font-[600] text-[var(--text-primary)] mb-4">Order not found</h1>
        <button onClick={() => navigate('/profile')} className="bg-[var(--blue-primary)] text-white px-8 py-3 rounded-[8px] font-[600] text-[14px]">
          Back to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F7F8] min-h-screen font-inter selection:bg-[var(--blue-primary)]/10">
      
      {/* Header Sticky Bar */}
      <div className="bg-white border-b border-[var(--border-default)] sticky top-0 z-50 py-4 px-6 md:px-10">
         <div className="max-w-[1280px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => navigate('/profile')}
                 className="size-10 flex items-center justify-center rounded-full hover:bg-[var(--surface-light)] text-[var(--text-secondary)] transition-colors"
               >
                 <ArrowLeft size={20} />
               </button>
               <div>
                  <h1 className="text-[18px] md:text-[20px] font-[600] text-[var(--text-primary)]">Order Details</h1>
                  <p className="text-[12px] md:text-[13px] text-[var(--text-secondary)] font-[500]">ID: #{order.orderNumber}</p>
               </div>
            </div>
            <button 
              onClick={handleDownloadInvoice}
              className="hidden md:flex items-center gap-2 bg-[var(--blue-light)] text-[var(--blue-primary)] px-5 py-2.5 rounded-[8px] text-[14px] font-[600] hover:bg-[var(--blue-primary)] hover:text-white transition-all shadow-sm active:scale-[0.98]"
            >
              <Download size={18} />
              Download Invoice
            </button>
         </div>
      </div>

      <main className="max-w-[1280px] mx-auto px-6 py-10 md:py-16">
         
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Tracking & Items */}
            <div className="lg:col-span-8 space-y-8">
               
               {/* Order Status & Tracking Banner */}
               <div className="bg-white rounded-[16px] border border-[var(--border-default)] overflow-hidden shadow-sm">
                  <div className="bg-[var(--blue-primary)] p-8 text-white">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                           <div className="size-14 bg-white/20 rounded-full flex items-center justify-center">
                              <Package size={28} />
                           </div>
                           <div>
                              <p className="text-[13px] text-white/70 font-[600] uppercase tracking-wider">Current Status</p>
                              <h3 className="text-[24px] font-[600] capitalize leading-none mt-1">{order.status}</h3>
                           </div>
                        </div>
                        <div className="text-left md:text-right">
                           <p className="text-[13px] text-white/70 font-[600] uppercase tracking-wider">Estimated Delivery</p>
                           <h3 className="text-[20px] font-[600] mt-1">Tomorrow by 8:00 PM</h3>
                        </div>
                     </div>
                  </div>

                  {/* Horizontal Stepper */}
                  <div className="p-8 md:p-12">
                     <div className="flex items-center justify-between relative">
                        <div className="absolute top-[18px] left-0 w-full h-[2.5px] bg-[var(--border-default)] z-0"></div>
                        <div className={`absolute top-[18px] left-0 h-[2.5px] bg-[var(--green-fresh)] z-0 transition-all duration-1000`} style={{ width: order.status === 'delivered' ? '100%' : order.status === 'shipped' ? '66%' : '33%' }}></div>
                        
                        {[
                           { label: 'Placed', icon: Calendar, time: formatDate(order.orderDate), active: true },
                           { label: 'Confirmed', icon: ShieldCheck, time: 'Today, 10:45 AM', active: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) },
                           { label: 'Shipped', icon: Truck, time: 'Pending', active: ['shipped', 'delivered'].includes(order.status) },
                           { label: 'Delivered', icon: CheckCircle, time: 'Pending', active: order.status === 'delivered' }
                        ].map((step, idx) => (
                           <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                              <div className={`size-10 rounded-full flex items-center justify-center transition-all ${
                                 step.active ? 'bg-[var(--green-fresh)] text-white shadow-lg shadow-[var(--green-fresh)]/20' : 'bg-white border-[2.5px] border-[var(--border-default)] text-[var(--text-muted)]'
                              }`}>
                                 <step.icon size={18} />
                              </div>
                              <div className="text-center">
                                 <p className={`text-[13px] font-[700] uppercase tracking-wider ${step.active ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>{step.label}</p>
                                 <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 font-[500] hidden md:block">{step.active ? step.time : '--'}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Items List */}
               <div className="bg-white rounded-[16px] border border-[var(--border-default)] p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-default)]/50">
                     <h3 className="text-[18px] font-[600] text-[var(--text-primary)]">Ordered Items ({order.items.length})</h3>
                  </div>
                  <div className="space-y-6">
                     {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-6 items-center">
                           <div className="size-[100px] md:size-[120px] bg-[var(--surface-light)] rounded-[12px] overflow-hidden border border-[var(--border-default)] shrink-0">
                              <img src={item.image || '/placeholder.svg'} alt="" className="w-full h-full object-contain p-2" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                 <div>
                                    <h4 className="text-[17px] font-[600] text-[var(--text-primary)] leading-tight">{item.name}</h4>
                                    <div className="flex items-center gap-3 mt-2">
                                       <span className="text-[13px] text-[var(--text-secondary)] bg-[var(--surface-light)] px-2.5 py-1 rounded-full font-[600] border border-[var(--border-default)]">Size: {item.selected_size || 'N/A'}</span>
                                       <span className="text-[13px] text-[var(--text-secondary)] font-[500]">Qty: {item.quantity}</span>
                                    </div>
                                 </div>
                                 <div className="text-left md:text-right">
                                    <p className="text-[18px] font-[700] text-[var(--text-primary)]">{formatPrice(item.price)}</p>
                                    <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Item subtotal: {formatPrice(item.price * item.quantity)}</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Right Column: Address & Payment Summary */}
            <div className="lg:col-span-4 space-y-8">
               
               {/* Shipping Details */}
               <div className="bg-white rounded-[16px] border border-[var(--border-default)] p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="size-10 bg-[var(--blue-light)] text-[var(--blue-primary)] rounded-full flex items-center justify-center">
                        <MapPin size={20} />
                     </div>
                     <h3 className="text-[18px] font-[600] text-[var(--text-primary)]">Shipping Information</h3>
                  </div>
                  <div className="space-y-6">
                     <div>
                        <p className="text-[12px] text-[var(--text-muted)] font-[700] uppercase tracking-widest mb-1.5">Recipient</p>
                        <p className="text-[15px] font-[600] text-[var(--text-primary)]">{order.customerName}</p>
                     </div>
                     <div>
                        <p className="text-[12px] text-[var(--text-muted)] font-[700] uppercase tracking-widest mb-1.5">Delivery Address</p>
                        <p className="text-[14px] text-[var(--text-secondary)] leading-[1.6] font-[500]">
                           {order.shippingAddress.completeAddress || `${order.shippingAddress.plotNumber}, ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`}
                        </p>
                     </div>
                     <div className="pt-4 border-t border-[var(--border-default)]/50 grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3">
                           <Phone size={16} className="text-[var(--text-muted)]" />
                           <span className="text-[14px] text-[var(--text-secondary)] font-[500]">{order.customerPhone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <Mail size={16} className="text-[var(--text-muted)]" />
                           <span className="text-[14px] text-[var(--text-secondary)] font-[500] truncate">{order.customerEmail}</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Payment Summary */}
               <div className="bg-white rounded-[16px] border border-[var(--border-default)] p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="size-10 bg-[var(--blue-light)] text-[var(--blue-primary)] rounded-full flex items-center justify-center">
                        <Wallet size={20} />
                     </div>
                     <h3 className="text-[18px] font-[600] text-[var(--text-primary)]">Payment Summary</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center text-[15px]">
                        <span className="text-[var(--text-secondary)] font-[500]">Subtotal</span>
                        <span className="text-[var(--text-primary)] font-[600]">{formatPrice(order.subtotal)}</span>
                     </div>
                     <div className="flex justify-between items-center text-[15px]">
                        <span className="text-[var(--text-secondary)] font-[500]">Delivery Fee</span>
                        <span className="text-[var(--green-fresh)] font-[700] uppercase text-[12px] tracking-wide">
                           {order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}
                        </span>
                     </div>
                     {order.discount > 0 && (
                        <div className="flex justify-between items-center text-[15px]">
                           <span className="text-[var(--green-fresh)] font-[600]">Discount</span>
                           <span className="text-[var(--green-fresh)] font-[600]">-{formatPrice(order.discount)}</span>
                        </div>
                     )}
                     <div className="flex justify-between items-center text-[15px]">
                        <span className="text-[var(--text-secondary)] font-[500]">Tax & GST</span>
                        <span className="text-[var(--text-primary)] font-[600]">{formatPrice(order.tax)}</span>
                     </div>
                     
                     <div className="h-px bg-[var(--border-default)]/50 my-6"></div>

                     <div className="flex justify-between items-end">
                        <span className="text-[16px] font-[600] text-[var(--text-primary)]">Total Amount</span>
                        <div className="text-right">
                           <p className="text-[28px] font-[800] text-[var(--blue-primary)] leading-none">{formatPrice(order.total)}</p>
                           <p className="text-[12px] text-[var(--text-muted)] font-[600] mt-2 uppercase tracking-tight">Via {order.paymentMethod.toUpperCase()}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Help Center */}
               <div className="p-6 bg-[var(--surface-light)] rounded-[16px] border border-[var(--border-default)]">
                  <div className="flex gap-4">
                     <div className="size-10 bg-white rounded-full flex items-center justify-center text-[var(--text-muted)] shrink-0 shadow-sm border border-[var(--border-default)]">
                        <Info size={20} />
                     </div>
                     <div>
                        <h4 className="text-[15px] font-[600] text-[var(--text-primary)]">Need assistance?</h4>
                        <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                           Our help center is available for order tracking, cancellations or returns.
                        </p>
                        <button className="mt-4 text-[13px] font-[700] text-[var(--blue-primary)] hover:underline flex items-center gap-1">
                           Visit Help Center <ChevronRight size={14} />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </main>

    </div>
  );
};

export default UserOrderDetail;