import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, amount, currency, customerDetails } = await req.json()

    // Validate required fields
    if (!orderId || !amount || !customerDetails) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Cashfree credentials from environment
    const appId = Deno.env.get('CASHFREE_APP_ID')
    const secretKey = Deno.env.get('CASHFREE_SECRET_KEY')
    const environment = Deno.env.get('CASHFREE_ENVIRONMENT') || 'SANDBOX' // 'SANDBOX' or 'PRODUCTION'

    if (!appId || !secretKey) {
      return new Response(
        JSON.stringify({ error: 'Cashfree credentials not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const apiUrl = environment === 'PRODUCTION' 
      ? 'https://api.cashfree.com/pg/orders' 
      : 'https://sandbox.cashfree.com/pg/orders'

    const cashfreeOrderData = {
      order_id: orderId,
      order_amount: amount,
      order_currency: currency || 'INR',
      customer_details: {
        customer_id: customerDetails.customer_id,
        customer_phone: customerDetails.customer_phone,
        customer_name: customerDetails.customer_name,
        customer_email: customerDetails.customer_email || 'example@email.com'
      },
      order_meta: {
        // Option to pass return url if redirecting, but using JS SDK so not strictly needed
      }
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cashfreeOrderData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Cashfree API Error:', errorData)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create Cashfree order',
          details: errorData 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const cashfreeOrder = await response.json()

    return new Response(
      JSON.stringify({
        payment_session_id: cashfreeOrder.payment_session_id,
        order_id: cashfreeOrder.order_id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating Cashfree order:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
