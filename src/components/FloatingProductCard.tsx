import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import QuickViewModal from './QuickViewModal';
import { X, GripVertical } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image?: string;
    images?: string[];
    category: string;
    weight?: string;
    pieces?: string;
    description?: string;
    stock_quantity?: number;
    slug: string;
    inStock: boolean;
    isBestSeller: boolean;
    new_arrival?: boolean;
}

const FloatingProductCard = () => {
    const location = useLocation();
    const [products, setProducts] = useState<Product[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    // Configuration
    const VISIBLE_DURATION = 8000; // 8 seconds per product
    const UPDATE_INTERVAL = 100; // Update progress every 100ms

    // Show only on specific pages
    const shouldShow = () => {
        const path = location.pathname;
        return path === '/' || path === '/products' || path.startsWith('/product/');
    };

    useEffect(() => {
        if (shouldShow()) {
            fetchProducts();
        }
    }, [location.pathname]);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .or('is_bestseller.eq.true,new_arrival.eq.true')
                .eq('is_active', true)
                .limit(10);

            if (error) throw error;

            if (data) {
                const formattedProducts = data.map((product: any) => ({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    originalPrice: product.original_price,
                    image: product.images?.[0] || '/placeholder.svg',
                    images: product.images,
                    category: product.is_bestseller ? 'Best Seller' : 'New Arrival',
                    weight: product.weight,
                    pieces: product.pieces,
                    description: product.description,
                    stock_quantity: product.stock_quantity,
                    slug: product.id,
                    inStock: product.stock_quantity !== undefined ? product.stock_quantity > 0 : true,
                    isBestSeller: product.is_bestseller,
                    new_arrival: product.new_arrival
                }));
                setProducts(formattedProducts);
            }
        } catch (err) {
            console.error('Error fetching floating products:', err);
        }
    };

    useEffect(() => {
        if (!shouldShow() || products.length === 0 || isHovered || isQuickViewOpen) return;

        const interval = setInterval(() => {
            setProgress((prev) => {
                const increment = (UPDATE_INTERVAL / VISIBLE_DURATION) * 100;
                if (prev + increment >= 100) {
                    // Time to switch
                    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
                    return 0;
                }
                return prev + increment;
            });
        }, UPDATE_INTERVAL);

        return () => clearInterval(interval);
    }, [products.length, isHovered, isQuickViewOpen, location.pathname]);

    const currentProduct = products[currentIndex];

    if (!shouldShow() || !currentProduct || !isVisible) return null;

    return (
        <>
            <motion.div
                drag
                dragMomentum={false}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-4 left-4 right-4 z-[50] flex items-end cursor-move sm:bottom-8 sm:left-8 sm:right-auto sm:w-auto"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Close Button (Floating Glass) */}
                <button
                    onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
                    className="absolute -top-3 -right-3 z-10 size-8 flex items-center justify-center rounded-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/20 shadow-lg text-black dark:text-white hover:bg-white/60 transition-all"
                >
                    <X size={14} />
                </button>

                {/* Main Card Container */}
                <div
                    onClick={() => { setQuickViewProduct(currentProduct); setIsQuickViewOpen(true); }}
                    className="relative w-full sm:w-[380px] bg-[#FFFFFF] border-[0.5px] border-[#E0E3E7] rounded-[12px] flex items-center p-3 shadow-lg hover:border-[#0071DC] transition-all duration-200 hover:-translate-y-[2px]"
                >
                    {/* Left: Product Image */}
                    <div className="relative h-[80px] w-[80px] sm:h-[90px] sm:w-[90px] rounded-[8px] overflow-hidden flex-shrink-0 group bg-[#F6F7F8]">
                        <img
                            src={currentProduct.image}
                            alt={currentProduct.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                        />
                    </div>

                    {/* Right: Product Details */}
                    <div className="flex flex-col flex-grow pl-4 pr-4 justify-center gap-1 overflow-hidden">
                        <div className="flex items-center gap-2 mb-0.5">
                            {currentProduct.isBestSeller ? (
                                <span className="bg-[#FAEEDA] text-[#633806] text-[11px] font-[500] px-2 py-[2px] rounded-[6px] tracking-[0.02em]">
                                    Best Seller
                                </span>
                            ) : (
                                <span className="bg-[#E6F1FB] text-[#0C447C] text-[11px] font-[500] px-2 py-[2px] rounded-[6px] tracking-[0.02em]">
                                    New
                                </span>
                            )}
                        </div>
                        <h3 className="text-[#1A1A1A] text-[15px] sm:text-[16px] font-[500] leading-[1.35] truncate tracking-[-0.01em]">
                            {currentProduct.name}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-baseline gap-2">
                                <span className="text-[#1A1A1A] font-[600] text-[16px] sm:text-[18px] leading-none">₹{currentProduct.price.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar Bottom */}
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#F6F7F8] rounded-b-[12px] overflow-hidden">
                        <motion.div
                            className="h-full bg-[#0071DC]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "linear", duration: 0.1 }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Quick View Modal */}
            {isQuickViewOpen && quickViewProduct && (
                <QuickViewModal
                    product={quickViewProduct}
                    isOpen={isQuickViewOpen}
                    onClose={() => { setIsQuickViewOpen(false); setQuickViewProduct(null); }}
                />
            )}
        </>
    );
};


export default FloatingProductCard;
