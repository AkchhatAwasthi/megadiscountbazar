import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Missing orderId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const appId = Deno.env.get('CASHFREE_APP_ID')
    const secretKey = Deno.env.get('CASHFREE_SECRET_KEY')
    const environment = Deno.env.get('CASHFREE_ENVIRONMENT') || 'SANDBOX'

    if (!appId || !secretKey) {
      return new Response(
        JSON.stringify({ error: 'Cashfree credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiUrl = environment === 'PRODUCTION' 
      ? `https://api.cashfree.com/pg/orders/${orderId}/payments` 
      : `https://sandbox.cashfree.com/pg/orders/${orderId}/payments`

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      }
    })

    if (!response.ok) {
      const errorData = await response.text()
      return new Response(
        JSON.stringify({ error: 'Failed to fetch payment details', details: errorData }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const payments = await response.json()
    
    // Check if any payment was successful
    const successfulPayment = payments.find((p: any) => p.payment_status === 'SUCCESS')

    if (successfulPayment) {
      return new Response(
        JSON.stringify({
          success: true,
          payment_id: successfulPayment.cf_payment_id,
          order_id: orderId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No successful payment found for this order'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
