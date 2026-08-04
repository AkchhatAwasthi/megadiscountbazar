import type { Metadata } from 'next';
import { createClient } from '../utils/supabase/server';
import Home from '../src/views/Home/Home';

export const revalidate = 3600; // Revalidate every hour (ISR)

export const metadata: Metadata = {
  title: 'Megadiscountbazar | The Premium Hypermarket',
  description: 'Shop premium products at Megadiscountbazar',
};

const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 3000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Fetch timeout')), timeoutMs)),
  ]);
};

export default async function Page() {
  const supabase = createClient();

  let heroSlides: any[] = [];
  let bestSellers: any[] = [];
  let newArrivals: any[] = [];

  try {
    // Fetch data in parallel with timeout safety
    const [heroSlidesResult, bestSellersResult, newArrivalsResult] = (await Promise.all([
      withTimeout(
        supabase
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true }) as any
      ),
      withTimeout(
        supabase
          .from('products')
          .select('*')
          .eq('is_bestseller', true)
          .eq('is_active', true)
          .limit(12) as any
      ),
      withTimeout(
        supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .eq('new_arrival', true)
          .order('created_at', { ascending: false })
          .limit(12) as any
      ),
    ])) as any[];

    heroSlides = heroSlidesResult.data || [];
    bestSellers = bestSellersResult.data || [];
    newArrivals = newArrivalsResult.data || [];
  } catch (error) {
    console.warn('Server-side fetch failed or timed out, falling back to client-side query:', error);
  }

  return (
    <Home
      heroSlides={heroSlides}
      bestSellers={bestSellers}
      newArrivals={newArrivals}
    />
  );
}
