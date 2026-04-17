import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronRight, History, PackageSearch, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/utils/currency';
import { useStore } from '@/store/useStore';

interface SearchSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchSidebar: React.FC<SearchSidebarProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const addToCart = useStore((state) => state.addToCart);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && suggestedProducts.length === 0) {
            fetchSuggestedProducts();
        }
    }, [isOpen]);

    const fetchSuggestedProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                   id, name, price, images, category_id, sku,
                   categories (name)
                `)
                .eq('is_active', true)
                .limit(4)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSuggestedProducts(data || []);
        } catch (err) {
            console.error('Error fetching suggestions:', err);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (debouncedQuery.trim().length > 1) {
            performSearch(debouncedQuery);
        } else {
            setSearchResults([]);
        }
    }, [debouncedQuery]);

    const performSearch = async (query: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
           id, name, price, images, category_id, sku,
           categories (name)
        `)
                .ilike('name', `%${query}%`)
                .eq('is_active', true)
                .limit(10);

            if (error) throw error;
            setSearchResults(data || []);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (product: any) => {
        navigate(`/product/${product.sku || product.id}`);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-[2px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="fixed left-0 top-0 h-full w-full md:w-[480px] bg-[var(--color-surface-card)] shadow-2xl z-[100] flex flex-col border-r border-[var(--color-border-default)]"
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: "tween", duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    >
                        {/* Header */}
                        <div className="p-6 flex items-center justify-between border-b border-[var(--color-border-default)]">
                            <div>
                                <h2 className="text-[20px] font-[600] text-[var(--color-text-primary)]">Search Products</h2>
                                <p className="text-[13px] text-[var(--color-text-secondary)]">Find what you're looking for</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-page)] text-[var(--color-text-primary)] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search Input Area */}
                        <div className="p-6 pb-0">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-brand-red)] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="What are you looking for?"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    className="w-full pl-12 pr-12 py-4 bg-[var(--color-surface-page)] border-[1.5px] border-transparent focus:border-[var(--color-brand-red)] focus:bg-white rounded-[var(--radius-input)] text-[15px] outline-none transition-all"
                                />
                                {loading && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-[var(--color-brand-red)] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Results / Suggestions */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            {searchResults.length > 0 ? (
                                <div className="space-y-4">
                                    <p className="text-[12px] font-[600] text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Search Results</p>
                                    {searchResults.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex gap-4 p-3 rounded-[12px] hover:bg-[var(--color-brand-red-light)] cursor-pointer group transition-all"
                                            onClick={() => handleProductClick(product)}
                                        >
                                            <div className="w-16 h-16 bg-[var(--color-surface-page)] rounded-[8px] overflow-hidden flex-shrink-0">
                                                <img
                                                    src={product.images?.[0] || '/placeholder.svg'}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center min-w-0">
                                                <h4 className="text-[15px] font-[500] text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-red)] transition-colors line-clamp-1">
                                                    {product.name}
                                                </h4>
                                                <div className="flex items-center justify-between mt-1">
                                                    <div className="flex flex-col">
                                                        <span className="text-[12px] text-[var(--color-text-secondary)]">
                                                            {product.categories?.name}
                                                        </span>
                                                        <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">
                                                            {formatPrice(product.price)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            addToCart({
                                                                ...product,
                                                                image: product.images?.[0] || '/placeholder.svg',
                                                                category: product.categories?.name || 'Search'
                                                            }, 'M');
                                                        }}
                                                        className="p-2 bg-[var(--color-brand-red)] text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-md"
                                                    >
                                                        <ShoppingCart className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : debouncedQuery.length > 1 && !loading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <PackageSearch className="w-12 h-12 text-[var(--color-text-muted)] mb-4" />
                                    <p className="text-[15px] font-[500] text-[var(--color-text-primary)]">No products found</p>
                                    <p className="text-[13px] text-[var(--color-text-secondary)]">Try another keyword or category</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Trending / Popular */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <History className="w-4 h-4 text-[var(--color-brand-red)]" />
                                            <h3 className="text-[14px] font-[600] text-[var(--color-text-primary)]">Recently Added</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {suggestedProducts.map((product) => (
                                                <div
                                                    key={product.id}
                                                    onClick={() => handleProductClick(product)}
                                                    className="flex gap-4 p-3 rounded-[12px] hover:bg-[var(--color-surface-page)] cursor-pointer group transition-all"
                                                >
                                                    <div className="w-14 h-14 bg-[var(--color-surface-page)] rounded-[8px] overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={product.images?.[0] || '/placeholder.svg'}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-center">
                                                        <h4 className="text-[14px] font-[500] text-[var(--color-text-primary)] line-clamp-1">
                                                            {product.name}
                                                        </h4>
                                                        <p className="text-[13px] font-[600] text-[var(--color-brand-red)] mt-0.5">
                                                            {formatPrice(product.price)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-[var(--color-border-default)]">
                            <button
                                onClick={() => { navigate('/products'); onClose(); }}
                                className="w-full py-3.5 bg-[var(--color-brand-red)] text-white rounded-[var(--radius-button)] text-[14px] font-[500] hover:bg-[var(--color-brand-red-deep)] transition-all flex items-center justify-center gap-2"
                            >
                                View all products
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SearchSidebar;

