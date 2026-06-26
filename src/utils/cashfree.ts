import { load } from '@cashfreepayments/cashfree-js';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/store/useStore';

export interface OrderData {
  orderId: string;
  amount: number;
  currency: string;
  items: CartItem[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryAddress: {
    address: string;
    lat: number;
    lng: number;
  };
}

export interface CashfreeResponse {
  cashfree_payment_id: string;
  cashfree_order_id: string;
}

export const initiateCashfreePayment = async (
  orderData: OrderData,
  onSuccess: (response: CashfreeResponse) => void,
  onError: (error: any) => void
): Promise<void> => {
  try {
    const cashfree = await load({
      mode: "sandbox", // TODO: Update to production when live
    });

    // 1. Create order on backend (Edge function)
    const { data, error } = await supabase.functions.invoke('create-cashfree-order', {
      body: { 
        orderId: orderData.orderId, 
        amount: orderData.amount, 
        currency: orderData.currency,
        customerDetails: {
          customer_id: `CUST_${orderData.customerInfo.phone.replace(/[^a-zA-Z0-9]/g, '')}`,
          customer_phone: orderData.customerInfo.phone,
          customer_name: orderData.customerInfo.name,
          customer_email: orderData.customerInfo.email
        }
      }
    });

    if (error || !data?.payment_session_id) {
       throw new Error(error?.message || 'Failed to initialize payment session. ' + (data?.error || ''));
    }

    // 2. Open Cashfree Checkout
    let checkoutOptions = {
      paymentSessionId: data.payment_session_id,
      redirectTarget: "_modal", 
    };

    cashfree.checkout(checkoutOptions).then((result: any) => {
      if(result.error){
          // This will be true whenever user clicks on close icon inside the modal or any error happens during the payment
          onError(new Error(result.error.message || "Payment failed or cancelled"));
      }
      if(result.redirect){
          // This will be true, if the payment mode doesn't support modal behavior.
          console.log("Payment will be redirected");
      }
      if(result.paymentDetails){
          // Verify payment status via edge function
          supabase.functions.invoke('verify-cashfree-payment', {
             body: { orderId: orderData.orderId }
          }).then(({ data: verifyData, error: verifyError }) => {
             if (verifyError || !verifyData?.success) {
                onError(new Error(verifyError?.message || "Payment verification failed"));
             } else {
                onSuccess({
                  cashfree_payment_id: verifyData.payment_id || 'payment_completed',
                  cashfree_order_id: orderData.orderId
                });
             }
          });
      }
    });
  } catch (error) {
    onError(error);
  }
};
