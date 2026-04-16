import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, User, CreditCard, Phone, Mail, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { downloadInvoice, validateInvoiceData } from '@/utils/invoiceGenerator';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  weight: string;
}

interface OrderDetail {
  id: string;
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  couponCode?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    mapAddress?: string;
    latitude?: number;
    longitude?: number;
  };
  orderDate: string;
  deliveryDate?: string;
  trackingNumber?: string;
  notes?: string;
  selectedSize?: string;
}

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const customerInfo = data.customer_info as any;
        const addressDetails = data.address_details as any;
        const orderItems = data.items as any;

        const deliveryLocation = data.delivery_location as any;

        const orderDetail: OrderDetail = {
          id: data.order_number,
          customerName: customerInfo?.name || 'Unknown Customer',
          customerEmail: customerInfo?.email || '',
          customerPhone: customerInfo?.phone || '',
          items: Array.isArray(orderItems) ? orderItems : [],
          subtotal: data.subtotal,
          deliveryFee: data.delivery_fee,
          codFee: data.cod_fee || 0,
          tax: data.tax,
          discount: data.discount || 0,
          total: data.total,
          status: data.order_status as any,
          paymentStatus: data.payment_status as any,
          paymentMethod: data.payment_method,
          couponCode: data.coupon_code,
          razorpayPaymentId: data.razorpay_payment_id,
          razorpayOrderId: data.razorpay_order_id,
          shippingAddress: {
            street: addressDetails?.complete_address || addressDetails?.address_line_1 || '',
            city: deliveryLocation?.address || addressDetails?.city || '',
            state: addressDetails?.state || '',
            pincode: addressDetails?.pincode || '',
            landmark: addressDetails?.landmark || '',
            mapAddress: addressDetails?.map_address || deliveryLocation?.address || '',
            latitude: addressDetails?.latitude || deliveryLocation?.lat,
            longitude: addressDetails?.longitude || deliveryLocation?.lng
          },
          orderDate: data.created_at,
          deliveryDate: data.actual_delivery,
          trackingNumber: data.tracking_url,
          notes: data.special_instructions,
          selectedSize: (data as any).selected_size,
        };
        setOrder(orderDetail);
        setCurrentStatus(orderDetail.status);
      }
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'pending':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const updateOrderStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setCurrentStatus(newStatus);
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;

    try {
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['store_name', 'store_address', 'store_phone', 'store_email', 'currency_symbol']);

      if (settingsError) {
        console.warn('Error fetching settings:', settingsError);
      }

      const storeSettings = settings?.reduce((acc: Record<string, any>, setting: any) => {
        acc[setting.key] = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
        return acc;
      }, {}) || {};

      const invoiceData = {
        invoice_number: `INV-${order.id}`,
        order_number: order.id,
        invoice_date: new Date().toLocaleDateString('en-IN'),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
        order_date: formatDate(order.orderDate),
        store_info: {
          store_name: storeSettings.store_name || 'Paridhan Haat',
          store_address: storeSettings.store_address || 'Shop number 5, Patel Nagar, Hansi road, Patiala chowk, JIND (Haryana) 126102',
          store_phone: storeSettings.store_phone || '+91 9996616153',
          store_email: storeSettings.store_email || 'contact@paridhanhaat.com',
          currency_symbol: storeSettings.currency_symbol || '₹'
        },
        customer_info: {
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone
        },
        delivery_address: order.shippingAddress,
        items: order.items.map(i => ({
          ...i,
          selected_size: (i as any).selected_size || order.selectedSize
        })),
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

      if (!validateInvoiceData(invoiceData)) {
        throw new Error('Invalid invoice data');
      }

      await downloadInvoice(invoiceData);

      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      });
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[var(--surface-light)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--blue-primary)]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center animate-in fade-in duration-500">
        <h1 className="text-[24px] font-[600] text-[#1A1A1A] mb-4">Order not found</h1>
        <Button onClick={() => navigate('/admin/orders')} className="bg-[var(--blue-primary)] hover:bg-[var(--blue-deep)] text-white uppercase tracking-wider text-[12px] font-[600] rounded-[6px] px-6">
          Back to Orders
        </Button>
      </div>
    );
  }

  const CardStyle = "border border-[#E0E3E7] shadow-sm bg-white hover:border-[var(--blue-primary)] hover:-translate-y-[2px] transition-all duration-220 rounded-[12px]";
  const LabelStyle = "text-[#5F6368] text-[12px] uppercase tracking-wider font-[600]";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1280px] mx-auto bg-[var(--surface-light)] min-h-screen pb-12">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/admin/orders')} className="text-[#5F6368] hover:bg-[#E6F1FB] hover:text-[#1A1A1A] rounded-[8px]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="uppercase tracking-wider text-[12px] font-[600]">Back</span>
          </Button>
          <div>
            <h1 className="text-[28px] md:text-[32px] font-[600] text-[#1A1A1A] tracking-tight">Order #{order.id}</h1>
            <p className="text-[#5F6368] text-[14px]">
              Placed on <span className="font-[500] text-[#1A1A1A]">{formatDate(order.orderDate)}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleDownloadInvoice}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-[var(--blue-primary)] text-[var(--blue-primary)] hover:bg-[#E6F1FB] text-[12px] uppercase tracking-wider font-[600] rounded-[6px] h-9 px-4 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download Invoice</span>
            <span className="sm:hidden">Invoice</span>
          </Button>

          <Badge className={`rounded-[6px] px-3 py-1.5 text-[11px] uppercase tracking-wider font-[600] border-0 capitalize ${getStatusColor(currentStatus)}`}>
            {currentStatus}
          </Badge>
          <Badge className={`rounded-[6px] px-3 py-1.5 text-[11px] uppercase tracking-wider font-[600] border-0 capitalize ${getPaymentStatusColor(order.paymentStatus)}`}>
            {order.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[#E0E3E7] pb-4">
              <CardTitle className="font-[600] text-[20px] text-[#1A1A1A]">Order Items ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-[#E0E3E7] rounded-[10px] bg-white hover:border-[var(--blue-primary)]/50 transition-colors">
                    <div className="w-[72px] h-[72px] rounded-[8px] border border-[#E0E3E7] overflow-hidden bg-[#F6F7F8] shrink-0 p-1">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-[600] text-[#1A1A1A] text-[15px]">{item.name}</h3>
                      <p className="text-[13px] text-[#5F6368]">{item.weight}</p>
                      {order.selectedSize && (
                        <p className="text-[12px] text-[var(--blue-primary)] font-[500] mt-1">Size: {order.selectedSize}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-[600] text-[#1A1A1A]">₹{item.price} × {item.quantity}</p>
                      <p className="text-[14px] text-[var(--blue-primary)] font-[600]">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6 bg-[#E0E3E7]" />

              <div className="space-y-6">
                <div className="bg-[#F6F7F8] p-6 rounded-[12px] border border-[#E0E3E7]">
                  <h4 className="font-[600] text-[#1A1A1A] text-[16px] mb-4">Pricing Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[14px]">
                      <span className="text-[#5F6368]">Item Total ({order.items.length} items)</span>
                      <span className="text-[#1A1A1A] font-[500]">₹{order.subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-[14px]">
                      <span className="text-[#5F6368]">Delivery Fee</span>
                      <span>
                        {order.deliveryFee === 0 ? (
                          <span className="text-[#008A00] font-[600]">FREE</span>
                        ) : (
                          <span className="text-[#1A1A1A] font-[500]">₹{order.deliveryFee.toLocaleString('en-IN')}</span>
                        )}
                      </span>
                    </div>

                    {order.codFee > 0 && (
                      <div className="flex justify-between text-[14px]">
                        <span className="text-[#5F6368]">COD Fee</span>
                        <span className="text-[#1A1A1A] font-[500]">₹{order.codFee.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-[14px]">
                      <span className="text-[#5F6368]">Tax & Charges</span>
                      <span className="text-[#1A1A1A] font-[500]">₹{order.tax.toLocaleString('en-IN')}</span>
                    </div>

                    {order.discount > 0 && (
                      <div className="flex justify-between text-[14px]">
                        <span className="text-[#008A00] font-[500]">
                          Discount {order.couponCode && (
                            <span className="font-[600] ml-1">({order.couponCode})</span>
                          )}
                        </span>
                        <span className="text-[#008A00] font-[600]">-₹{order.discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <Separator className="my-3 bg-[#E0E3E7]" />

                    <div className="flex justify-between text-[18px] font-[600] text-[#1A1A1A]">
                      <span>Total Amount</span>
                      <span className="text-[var(--blue-primary)] text-[22px] font-[700]">₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-[#E6F1FB]/40 p-6 rounded-[12px] border border-[#0071DC]/20">
                  <h4 className="font-[600] text-[#1A1A1A] text-[16px] mb-4">Payment Information</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[14px]">
                      <span className="text-[#5F6368]">Payment Method</span>
                      <span className="text-[#1A1A1A] font-[600] uppercase tracking-wider text-[12px]">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                      </span>
                    </div>

                    <div className="flex justify-between text-[14px] items-center">
                      <span className="text-[#5F6368]">Payment Status</span>
                      <Badge className={`rounded-[6px] px-2.5 py-1 text-[11px] uppercase font-[600] tracking-wider border-0 ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </Badge>
                    </div>

                    {order.razorpayPaymentId && (
                      <div className="pt-4 border-t border-[#0071DC]/20">
                        <div className="space-y-3">
                          <div className="flex justify-between text-[13px] items-center">
                            <span className="text-[#5F6368]">Payment ID</span>
                            <span className="font-mono text-[#1A1A1A] font-[600] bg-white px-2.5 py-1 border border-[#E0E3E7] rounded-[4px]">{order.razorpayPaymentId}</span>
                          </div>
                          {order.razorpayOrderId && (
                            <div className="flex justify-between text-[13px] items-center">
                              <span className="text-[#5F6368]">Order ID</span>
                              <span className="font-mono text-[#1A1A1A] font-[600] bg-white px-2.5 py-1 border border-[#E0E3E7] rounded-[4px]">{order.razorpayOrderId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && (
                      <div className="pt-3 border-t border-[#0071DC]/20">
                        <p className="text-[13px] text-[#5F6368] font-[500]">
                          Customer will pay <span className="font-[700] text-[#1A1A1A]">₹{order.total.toLocaleString('en-IN')}</span> on delivery
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[#E0E3E7] pb-4">
              <CardTitle className="font-[600] text-[18px] text-[#1A1A1A]">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E0E3E7]">
                <div className="flex items-start space-x-4 relative z-10">
                  <div className="w-5 h-5 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="font-[600] text-[#1A1A1A]">Order Placed</p>
                    <p className="text-[13px] text-[#5F6368]">{formatDate(order.orderDate)}</p>
                  </div>
                </div>

                {currentStatus !== 'pending' && (
                  <div className="flex items-start space-x-4 relative z-10">
                    <div className="w-5 h-5 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center mt-0.5">
                      <Package className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-[600] text-[#1A1A1A]">Order Confirmed</p>
                      <p className="text-[13px] text-[#5F6368]">Processing your order</p>
                    </div>
                  </div>
                )}

                {['shipped', 'delivered'].includes(currentStatus) && (
                  <div className="flex items-start space-x-4 relative z-10">
                    <div className="w-5 h-5 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center mt-0.5">
                      <Truck className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-[600] text-[#1A1A1A]">Order Shipped</p>
                      <p className="text-[13px] text-[#5F6368]">
                        Tracking: {order.trackingNumber || 'Not available'}
                      </p>
                    </div>
                  </div>
                )}

                {currentStatus === 'delivered' && (
                  <div className="flex items-start space-x-4 relative z-10">
                    <div className="w-5 h-5 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <p className="font-[600] text-[#1A1A1A]">Order Delivered</p>
                      <p className="text-[13px] text-[#5F6368]">
                        {order.deliveryDate ? formatDate(order.deliveryDate) : 'Delivered'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[#E0E3E7] pb-4">
              <CardTitle className="font-[600] text-[18px] text-[#1A1A1A]">Update Order Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Select value={currentStatus} onValueChange={updateOrderStatus}>
                <SelectTrigger className="w-full border-[#E0E3E7] focus:border-[var(--blue-primary)] focus-visible:ring-1 focus-visible:ring-[var(--blue-primary)] bg-white text-[#1A1A1A] rounded-[8px] h-12 text-[14px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E0E3E7] rounded-[8px]">
                  <SelectItem value="pending" className="cursor-pointer hover:bg-[#F6F7F8] text-[#1A1A1A]">Pending</SelectItem>
                  <SelectItem value="processing" className="cursor-pointer hover:bg-[#F6F7F8] text-[#1A1A1A]">Processing</SelectItem>
                  <SelectItem value="shipped" className="cursor-pointer hover:bg-[#F6F7F8] text-[#1A1A1A]">Shipped</SelectItem>
                  <SelectItem value="delivered" className="cursor-pointer hover:bg-[#F6F7F8] text-[#1A1A1A]">Delivered</SelectItem>
                  <SelectItem value="cancelled" className="cursor-pointer hover:bg-[#FCEBEB] text-[#E74040]">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[#E0E3E7] pb-4">
              <CardTitle className="font-[600] text-[18px] text-[#1A1A1A]">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[var(--blue-light)] flex items-center justify-center text-[var(--blue-primary)]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-[600] text-[#1A1A1A] text-[15px]">{order.customerName}</p>
                  <p className="text-[12px] text-[#5F6368] uppercase tracking-wider font-[500]">Customer</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[var(--blue-light)] flex items-center justify-center text-[var(--blue-primary)]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-[600] text-[#1A1A1A] text-[14px] break-all">{order.customerEmail}</p>
                  <p className="text-[12px] text-[#5F6368] uppercase tracking-wider font-[500]">Email</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[var(--blue-light)] flex items-center justify-center text-[var(--blue-primary)]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-[600] text-[#1A1A1A] text-[14px]">{order.customerPhone}</p>
                  <p className="text-[12px] text-[#5F6368] uppercase tracking-wider font-[500]">Phone</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[#E0E3E7] pb-4">
              <CardTitle className="font-[600] text-[18px] text-[#1A1A1A]">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[var(--blue-primary)] mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-[600] text-[#1A1A1A]">{order.customerName}</p>
                  <p className="text-[14px] text-[#5F6368] leading-relaxed">
                    {order.shippingAddress.street}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                  {order.shippingAddress.landmark && (
                    <p className="text-[13px] text-[#1A1A1A] font-[500] mt-1 bg-[#F6F7F8] p-2 rounded-[8px]">
                      Landmark: {order.shippingAddress.landmark}
                    </p>
                  )}
                </div>
              </div>

              {/* Map Address Section */}
              {order.shippingAddress.mapAddress && (
                <div className="border-t border-[#E0E3E7] pt-4 mt-2">
                  <h4 className="text-[12px] text-[#5F6368] uppercase tracking-wider font-[600] mb-2">Map Location</h4>
                  <div className="bg-[#E6F1FB]/30 p-3 rounded-[8px] border border-[var(--blue-primary)]/20">
                    <p className="text-[13px] text-[#1A1A1A] leading-relaxed">{order.shippingAddress.mapAddress}</p>
                    {order.shippingAddress.latitude && order.shippingAddress.longitude && (
                      <div className="mt-2 flex items-center space-x-4 text-[11px] text-[#5F6368]">
                        <span>Lat: {order.shippingAddress.latitude.toFixed(6)}</span>
                        <span>Lng: {order.shippingAddress.longitude.toFixed(6)}</span>
                        <a
                          href={`https://www.google.com/maps?q=${order.shippingAddress.latitude},${order.shippingAddress.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--blue-primary)] hover:text-[#0055A6] underline ml-auto font-[600]"
                        >
                          View Map
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card className={CardStyle}>
              <CardHeader className="border-b border-[#E0E3E7] pb-4">
                <CardTitle className="font-[600] text-[18px] text-[#1A1A1A]">Special Instructions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-[#FFF8E6] p-4 rounded-[8px] border border-[#FFC220]/30">
                  <p className="text-[14px] text-[#1A1A1A] italic">"{order.notes}"</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;