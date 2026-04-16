import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '../../../components/ProductCard';
import QuickViewModal from '../../../components/QuickViewModal';

const NewArrivals = () => {
  const navigate = useNavigate();
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    fetchNewArrivals();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResize = () => {
    if (window.innerWidth < 640) {
      setItemsPerView(2);
    } else if (window.innerWidth < 1024) {
      setItemsPerView(3);
    } else {
      setItemsPerView(4);
    }
  };

  const fetchNewArrivals = async () => {
    try {
      const result = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (result.error) throw result.error;

      // Filter for new arrivals on the client side if field exists, otherwise use newest
      const data = result.data || [];
      const arrivals = data.filter((p: any) => p.new_arrival === true || true).slice(0, 12);
      
      setNewArrivals(arrivals);
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (currentIndex < newArrivals.length - itemsPerView) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(Math.max(0, newArrivals.length - itemsPerView));
    }
  };

  if (newArrivals.length === 0 && !loading) return null;

  return (
    <section className="py-[64px] md:py-[96px] bg-[#F6F7F8] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="flex flex-col">
            <span className="text-[12px] font-[500] tracking-[0.05em] text-[var(--blue-primary)] uppercase mb-2">
              Just Arrived
            </span>
            <h2 className="text-[28px] md:text-[32px] font-[500] text-[#1A1A1A] leading-[1.2] tracking-[-0.02em]">
              New Seasonal Drops
            </h2>
          </div>

          <div className="flex items-center gap-3">
             <button
                onClick={() => navigate('/products?sort=newest')}
                className="hidden md:flex items-center justify-center px-5 py-2.5 border-[1.5px] border-[var(--blue-primary)] text-[var(--blue-primary)] rounded-[8px] text-[14px] font-[500] transition-all hover:bg-[var(--blue-light)] hover:-translate-y-[1px]"
             >
                See all arrivals
             </button>
             <div className="flex gap-2">
                <button
                    onClick={prevSlide}
                    className="size-[40px] flex items-center justify-center border-[1.5px] border-[#E0E3E7] rounded-[8px] transition-colors hover:bg-white"
                    aria-label="Previous Slide"
                >
                    <ChevronLeft className="size-[20px] text-[#1A1A1A]" />
                </button>
                <button
                    onClick={nextSlide}
                    className="size-[40px] flex items-center justify-center border-[1.5px] border-[#E0E3E7] rounded-[8px] transition-colors hover:bg-white"
                    aria-label="Next Slide"
                >
                    <ChevronRight className="size-[20px] text-[#1A1A1A]" />
                </button>
             </div>
          </div>
        </div>

        {/* Product Carousel */}
        <div className="relative">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white rounded-[12px] animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                }}
              >
                {newArrivals.map((product, idx) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-1/2 md:w-1/3 lg:w-1/4 px-3"
                  >
                    <ProductCard
                      product={product}
                      index={idx}
                      onQuickView={() => {
                        setQuickViewProduct(product);
                        setIsQuickViewOpen(true);
                      }}
                      onViewDetail={() => navigate(`/product/${product.sku || product.id}`)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile View All */}
        <div className="md:hidden mt-8">
           <button
              onClick={() => navigate('/products?sort=newest')}
              className="w-full flex items-center justify-center px-5 py-3 border-[1.5px] border-[var(--blue-primary)] text-[var(--blue-primary)] rounded-[8px] text-[14px] font-[500]"
           >
              See all arrivals
           </button>
        </div>
      </div>

      {isQuickViewOpen && quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={isQuickViewOpen}
          onClose={() => {
            setIsQuickViewOpen(false);
            setQuickViewProduct(null);
          }}
        />
      )}
    </section>
  );
};

export default NewArrivals;