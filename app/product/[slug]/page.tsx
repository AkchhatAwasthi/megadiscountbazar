import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';
import { createClient } from '../../../utils/supabase/server';

const ProductDetail = dynamic(() => import('../../../src/views/ProductDetail'), {
  ssr: false,
});

export const revalidate = 3600; // Revalidate every hour (ISR)

const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 3000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Fetch timeout')), timeoutMs)),
  ]);
};

// Static cookie-less client for generateStaticParams and generateMetadata
const getStaticSupabase = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Generate static routes for all active products for pre-rendering
export async function generateStaticParams() {
  try {
    const supabase = getStaticSupabase();
    const { data: products } = await supabase
      .from('products')
      .select('sku, id')
      .eq('is_active', true);

    if (!products) return [];

    return products.map((product) => ({
      slug: product.sku || product.id,
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

// Generate dynamic metadata for search engines
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = getStaticSupabase();
  let product: any = null;

  try {
    let { data } = await supabase
      .from('products')
      .select('*')
      .eq('sku', params.slug)
      .eq('is_active', true)
      .single();
    product = data;

    if (!product) {
      const { data: dataById } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.slug)
        .eq('is_active', true)
        .single();
      product = dataById;
    }
  } catch (error) {
    console.warn('Metadata fetch failed:', error);
  }

  if (!product) {
    return {
      title: 'Product Not Found | Megadiscountbazar',
    };
  }

  const title = `${product.name} | Megadiscountbazar`;
  const description = product.description ? product.description.substring(0, 160) : 'Shop premium products at Megadiscountbazar';
  const image = product.images?.[0] || product.image || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : [],
    },
    alternates: {
      canonical: `/product/${params.slug}`,
    },
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  let product: any = null;
  let variants: any[] = [];
  let relatedProducts: any[] = [];
  let coupons: any[] = [];

  try {
    // 1. Fetch main product
    let { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('sku', params.slug)
      .eq('is_active', true)
      .single();
    product = data;

    if (!product) {
      const { data: dataById } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', params.slug)
        .eq('is_active', true)
        .single();
      product = dataById;
    }

    // 2. Fetch variants, related products and coupons in parallel if product is found
    if (product) {
      const [variantsResult, relatedResult, couponsResult] = (await Promise.all([
        withTimeout(
          supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', product.id)
            .eq('is_active', true)
            .order('sort_order') as any
        ),
        withTimeout(
          supabase
            .from('products')
            .select('*, categories(name)')
            .eq('category_id', product.category_id)
            .neq('id', product.id)
            .eq('is_active', true)
            .limit(4) as any
        ),
        withTimeout(
          supabase
            .from('product_coupons')
            .select('coupon_id, coupons (id, code, description, discount_type, discount_value, min_order_amount, is_active, valid_until)')
            .eq('product_id', product.id) as any
        ),
      ])) as any[];

      variants = variantsResult.data || [];
      relatedProducts = relatedResult.data || [];
      
      // Fallback related products if category is empty
      if (relatedProducts.length === 0) {
        const fallbackResult = await supabase
          .from('products')
          .select('*, categories(name)')
          .neq('id', product.id)
          .eq('is_active', true)
          .limit(4);
        relatedProducts = fallbackResult.data || [];
      }

      // Filter and map valid coupons
      coupons = (couponsResult.data || [])
        .map((pc: any) => pc.cookies || (pc as any).cookies || (pc as any).coupons)
        .filter((c: any) => c && c.is_active && new Date(c.valid_until) > new Date()) || [];
    }
  } catch (error) {
    console.warn('Server-side product details fetch failed, falling back to client-side load:', error);
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-surface-page)] px-6 text-center">
        <h1 className="text-[28px] font-[500] text-[var(--color-text-primary)] mb-4">Product not found</h1>
        <Link href="/products" className="bg-[var(--color-brand-red)] text-white px-8 py-3 rounded-[8px] font-[500] text-[14px]">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": product.images?.[0] || product.image,
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock"
            }
          })
        }}
      />
      <ProductDetail
        initialProduct={product}
        initialRelated={relatedProducts}
        initialVariants={variants}
        initialCoupons={coupons}
      />
    </>
  );
}
