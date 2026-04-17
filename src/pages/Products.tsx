import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Grid, List, Search, Filter } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ProductFiltersComponent from '../components/ProductFilters';
import { supabase } from '@/integrations/supabase/client';
import { scrollToTopInstant } from '@/utils/scrollToTop';
import { formatCurrency } from '@/utils/currency';
import { useSettings } from '@/hooks/useSettings';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';

interface ProductFilters {
  categories: string[];
  priceRange: number[];
  inStock: boolean;
  isBestseller: boolean;
  sortBy: string;
}

const Products = () => {
  const { selectedCategory, setSelectedCategory } = useStore();
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    categories: [],
    priceRange: [0, 50000],
    inStock: false,
    isBestseller: false,
    sortBy: 'newest',
  });

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleQuickView = (product: any) => {
    setQuickViewProduct({
      ...product,
      image: product.images?.[0] || product.image || '/placeholder.svg',
      slug: product.id
    });
    setIsQuickViewOpen(true);
  };

  const handleViewDetail = (product: any) => {
    const slug = product.sku || product.id;
    navigate(`/product/${slug}`);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  useEffect(() => {
    scrollToTopInstant();
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');
    if (categoryParam) {
       setSelectedCategory(categoryParam);
    }
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setProducts([]);
    fetchProducts(1);
  }, [selectedCategory, searchTerm, filters]);

  const fetchProducts = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setIsLoadingMore(true);

    try {
      let countQuery = supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (selectedCategory && selectedCategory !== 'All') {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('name', selectedCategory)
          .single();

        if (categoryData) {
          countQuery = countQuery.eq('category_id', categoryData.id);
        }
      }

      if (searchTerm) countQuery = countQuery.ilike('name', `%${searchTerm}%`);
      if (filters.priceRange[0] > 0) countQuery = countQuery.gte('price', filters.priceRange[0]);
      if (filters.priceRange[1] < 50000) countQuery = countQuery.lte('price', filters.priceRange[1]);

      const { count } = await countQuery;
      if (count !== null) setTotalProducts(count);

      let query = supabase
        .from('products')
        .select(`*, categories(id, name)`)
        .eq('is_active', true)
        .range((pageNum - 1) * 12, pageNum * 12 - 1);

      if (selectedCategory && selectedCategory !== 'All') {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('name', selectedCategory)
          .single();

        if (categoryData) query = query.eq('category_id', categoryData.id);
      }

      if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);
      if (filters.priceRange[0] > 0) query = query.gte('price', filters.priceRange[0]);
      if (filters.priceRange[1] < 50000) query = query.lte('price', filters.priceRange[1]);

      const sortOption = filters.sortBy || sortBy;
      switch (sortOption) {
        case 'price-low': query = query.order('price', { ascending: true }); break;
        case 'price-high': query = query.order('price', { ascending: false }); break;
        case 'newest': query = query.order('created_at', { ascending: false }); break;
        default: query = query.order('name', { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;

      if (pageNum === 1) setProducts(data || []);
      else setProducts(prev => [...prev, ...(data || [])]);
      setHasMore(data?.length === 12);

    } catch (error) {
      console.error('Error products:', error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from('categories').select('name').eq('is_active', true);
      const categoryNames = data?.map(cat => cat.name) || [];
      setCategories(['All', ...categoryNames]);
    } catch (error) {
      console.error('Error categories:', error);
    }
  };

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  }, [page, hasMore, isLoadingMore]);

  const lastProductElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, isLoadingMore, hasMore, loadMore]);

  return (
    <div className="bg-[var(--color-surface-page)] min-h-screen font-inter selection:bg-[var(--color-brand-red)]/10">
      
      {/* Search & Breadcrumb Bar */}
      <div className="bg-white border-b border-[var(--color-border-default)] py-4 px-6 md:px-10 lg:px-20">
         <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
               <Link to="/" className="hover:text-[var(--color-brand-red)] hover:underline">Home</Link>
               <ChevronDown size={14} className="-rotate-90" />
               <span className="text-[var(--color-text-primary)] font-[600]">Shop All</span>
            </div>
            
            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
               <input 
                 type="text" 
                 placeholder="Search products..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-[var(--color-surface-page)] border border-[var(--color-border-default)] rounded-[8px] h-11 pl-12 pr-4 text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-red)] focus:border-[var(--color-brand-red)] transition-all"
               />
            </div>
         </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 py-10">
         
         {/* Page Header */}
         <div className="mb-10 text-center md:text-left">
            <h1 className="text-[32px] md:text-[44px] font-[600] text-[var(--color-text-primary)] leading-tight tracking-tight">
               {selectedCategory !== 'All' ? selectedCategory : 'Collection Archive'}
            </h1>
            <p className="text-[17px] text-[var(--color-text-secondary)] mt-2">
               Discover our range of premium hypermarket products.
            </p>
         </div>

         {/* Grid Tools */}
         <div className="bg-white border border-[var(--color-border-default)] rounded-[12px] p-4 mb-10 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => setShowFilters(true)}
                 className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-brand-red)] text-white rounded-[8px] text-[14px] font-[500] hover:bg-[var(--color-brand-red-deep)] transition-all shadow-md active:scale-[0.98]"
               >
                 <Filter size={18} />
                 Filters
               </button>
               <div className="h-6 w-px bg-[var(--color-border-default)] hidden sm:block"></div>
               <span className="text-[14px] text-[var(--color-text-secondary)] font-[500] hidden sm:block">
                  Showing {products.length} of {totalProducts} items
               </span>
            </div>

            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <span className="text-[14px] text-[var(--color-text-secondary)] font-[500] hidden sm:block">Sort by:</span>
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="bg-[var(--color-surface-page)] border border-[var(--color-border-default)] rounded-[8px] h-10 px-3 text-[14px] font-[500] focus:outline-none"
                  >
                     <option value="newest">Newest Arrivals</option>
                     <option value="price-low">Price: Low to High</option>
                     <option value="price-high">Price: High to Low</option>
                     <option value="name">Alphabetical</option>
                  </select>
               </div>
               
               <div className="flex items-center border border-[var(--color-border-default)] rounded-[8px] overflow-hidden">
                  <button className="p-2.5 text-[var(--color-brand-red)] bg-[var(--color-brand-red-light)] transition-colors"><Grid size={20} /></button>
                  <button className="p-2.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-page)] transition-colors border-l border-[var(--color-border-default)]"><List size={20} /></button>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {loading ? (
               Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex flex-col gap-4">
                     <div className="bg-white border border-[var(--color-border-default)] aspect-[4/5] rounded-[12px]"></div>
                     <div className="space-y-2 px-2">
                        <div className="h-4 bg-[var(--color-border-default)] w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-[var(--color-border-default)] w-1/2 animate-pulse"></div>
                     </div>
                  </div>
               ))
            ) : products.map((product, index) => (
               <motion.div
                 key={product.id}
                 initial={{ opacity: 0, y: 12 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.4, delay: index * 0.05 }}
                 ref={index === products.length - 1 ? lastProductElementRef : null}
               >
                  <ProductCard
                    product={{
                      ...product,
                      image: product.images?.[0] || product.image || '/placeholder.svg',
                      slug: product.sku || product.id
                    }}
                    onQuickView={() => handleQuickView(product)}
                    onViewDetail={() => handleViewDetail(product)}
                  />
               </motion.div>
            ))}
         </div>

         {isLoadingMore && (
           <div className="flex flex-col items-center py-16 gap-3">
              <div className="size-8 border-[2.5px] border-[var(--color-brand-red)] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[13px] font-[600] text-[var(--color-brand-red)] uppercase tracking-wide">Loading more items</span>
           </div>
         )}
         
         {!hasMore && products.length > 0 && (
            <div className="text-center py-20">
               <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border-default)] to-transparent max-w-sm mx-auto mb-8"></div>
               <p className="text-[15px] text-[var(--color-text-muted)] italic">You've reached the end of the collection.</p>
            </div>
         )}
      </main>

      {/* Filter Sidebar Drawer */}
      <AnimatePresence>
         {showFilters && (
           <>
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
               onClick={() => setShowFilters(false)}
             />
             <motion.div
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200, mass: 0.8 }}
               className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-white shadow-[-16px_0_48px_rgba(0,0,0,0.15)] z-[110] flex flex-col overflow-hidden"
             >
               <div className="p-8 border-b border-[var(--color-border-default)] flex justify-between items-center">
                  <h3 className="text-[22px] font-[600] text-[var(--color-text-primary)]">Filter & Sort</h3>
                  <button onClick={() => setShowFilters(false)} className="size-10 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-page)] text-[var(--color-text-secondary)]">
                     <X size={24} />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar">
                  <ProductFiltersComponent
                    onFiltersChange={setFilters}
                    categories={categories}
                    className="w-full"
                  />
               </div>
               <div className="p-8 bg-[var(--color-surface-page)] border-t border-[var(--color-border-default)] flex gap-4">
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="flex-1 bg-[var(--color-brand-red)] text-white h-12 rounded-[8px] font-[600] text-[15px] shadow-md active:scale-[0.98]"
                  >
                    Apply Changes
                  </button>
                  <button 
                    onClick={() => {
                        setFilters({ categories: [], priceRange: [0, 50000], inStock: false, isBestseller: false, sortBy: 'newest' });
                        setShowFilters(false);
                    }}
                    className="px-6 border border-[var(--color-border-default)] text-[var(--color-text-secondary)] h-12 rounded-[8px] font-[600] text-[15px] hover:bg-white"
                  >
                     Reset
                  </button>
               </div>
             </motion.div>
           </>
         )}
      </AnimatePresence>

      {/* Quick View Modal */}
      {isQuickViewOpen && quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={isQuickViewOpen}
          onClose={closeQuickView}
        />
      )}
    </div>
  );
};

export default Products;
