import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '../../../components/ProductCard';
import QuickViewModal from '../../../components/QuickViewModal';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const NewArrivals = () => {
  const navigate = useNavigate();
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    fetchNewArrivals();
  }, []);

  const fetchNewArrivals = async () => {
    try {
      const result = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('new_arrival', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (result.error) throw result.error;

      setNewArrivals(result.data || []);
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (newArrivals.length === 0 && !loading) return null;

  return (
    <section className="py-[64px] md:py-[96px] bg-[var(--color-surface-page)] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="flex flex-col">
            <span className="text-[12px] font-[500] tracking-[0.05em] text-[var(--color-brand-red)] uppercase mb-2">
              Just Arrived
            </span>
            <h2 className="text-[28px] md:text-[32px] font-[500] text-[var(--color-text-primary)] leading-[1.2] tracking-[-0.02em]">
              New Seasonal Drops
            </h2>
          </div>

          <div className="flex items-center gap-3">
             <button
                onClick={() => navigate('/products?collection=new-arrivals')}
                className="hidden md:flex items-center justify-center px-5 py-2.5 border-[1.5px] border-[var(--color-brand-red)] text-[var(--color-brand-red)] rounded-[8px] text-[14px] font-[500] transition-all hover:bg-[var(--color-brand-red-light)] hover:-translate-y-[1px]"
             >
                See all arrivals
             </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white rounded-[12px] animate-pulse"></div>
              ))}
            </div>
          ) : (
            <Carousel
              opts={{
                align: "start",
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {newArrivals.map((product, idx) => (
                  <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <ProductCard
                      product={product}
                      index={idx}
                      onQuickView={() => {
                        setQuickViewProduct(product);
                        setIsQuickViewOpen(true);
                      }}
                      onViewDetail={() => navigate(`/product/${product.sku || product.id}`)}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              <div className="flex justify-end gap-3 mt-8">
                <CarouselPrevious className="static translate-y-0 size-[45px] border-[1.5px] border-[var(--color-border-default)] hover:bg-white hover:text-[var(--color-brand-red)] transition-all" />
                <CarouselNext className="static translate-y-0 size-[45px] border-[1.5px] border-[var(--color-border-default)] hover:bg-white hover:text-[var(--color-brand-red)] transition-all" />
              </div>
            </Carousel>
          )}
        </div>

        {/* Mobile View All */}
        <div className="md:hidden mt-8">
           <button
              onClick={() => navigate('/products?collection=new-arrivals')}
              className="w-full flex items-center justify-center px-5 py-3 border-[1.5px] border-[var(--color-brand-red)] text-[var(--color-brand-red)] rounded-[8px] text-[14px] font-[500]"
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
