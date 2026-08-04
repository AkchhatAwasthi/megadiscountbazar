import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const getStaticSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://megadiscountbazar.com';

  // 1. Static sitemap entries
  const staticPaths = [
    { url: `${baseUrl}/`, changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/products`, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/aqua-soft`, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/terms`, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/privacy-policy`, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/refund-policy`, changeFrequency: 'monthly' as const, priority: 0.7 },
  ];

  const staticEntries = staticPaths.map((p) => ({
    url: p.url,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  // 2. Fetch all active product SKUs/IDs dynamically from Supabase
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const supabase = getStaticSupabase();
    const { data: products } = await supabase
      .from('products')
      .select('sku, id, updated_at')
      .eq('is_active', true);

    if (products) {
      productEntries = products.map((product) => {
        const slug = product.sku || product.id;
        return {
          url: `${baseUrl}/product/${slug}`,
          lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.9,
        };
      });
    }
  } catch (error) {
    console.error('Failed to generate product sitemap entries:', error);
  }

  return [...staticEntries, ...productEntries];
}
