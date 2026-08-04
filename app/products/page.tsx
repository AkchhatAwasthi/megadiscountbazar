import type { Metadata } from 'next';
import { createClient } from '../../utils/supabase/server';
import Products from '../../src/views/Products';

export const revalidate = 1800; // Revalidate every 30 minutes (ISR)

export const metadata: Metadata = {
  title: 'Shop All Products | Megadiscountbazar',
  description: 'Explore the full catalog of premium products at Megadiscountbazar.',
};

const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 3000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Fetch timeout')), timeoutMs)),
  ]);
};

interface SearchParams {
  category?: string;
  search?: string;
  collection?: string;
  tag?: string;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient();
  const category = searchParams.category || 'All';
  const search = searchParams.search || '';
  const collection = searchParams.collection || '';
  const tag = searchParams.tag || '';

  let initialProducts: any[] = [];
  let initialCategories: string[] = ['All'];

  try {
    // 1. Fetch category ID if filtering by a specific category
    let categoryId: string | null = null;
    if (category && category !== 'All') {
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', category.trim())
        .limit(1);
      
      if (catData && catData.length > 0) {
        categoryId = catData[0].id;
      } else {
        // Force no results if category doesn't exist
        categoryId = '00000000-0000-0000-0000-000000000000';
      }
    }

    // 2. Fetch products and category names in parallel with timeout safety
    const productsQuery = supabase
      .from('products')
      .select('*, categories(id, name)')
      .eq('is_active', true)
      .range(0, 11);

    if (categoryId) {
      productsQuery.eq('category_id', categoryId);
    }
    if (collection === 'new-arrivals') {
      productsQuery.eq('new_arrival', true);
    }
    if (collection === 'bestsellers' || tag === 'favorites') {
      productsQuery.eq('is_bestseller', true);
    }
    if (search) {
      productsQuery.ilike('name', `%${search}%`);
    }

    productsQuery.order('created_at', { ascending: false });

    const [productsResult, categoriesResult] = (await Promise.all([
      withTimeout(productsQuery as any),
      withTimeout(supabase.from('categories').select('name').eq('is_active', true) as any),
    ])) as any[];

    initialProducts = productsResult.data || [];
    initialCategories = ['All', ...(categoriesResult.data?.map((c: any) => c.name) || [])];
  } catch (error) {
    console.warn('Server-side products fetch failed, falling back to client-side load:', error);
  }

  return (
    <Products
      initialProducts={initialProducts}
      initialCategories={initialCategories}
    />
  );
}
