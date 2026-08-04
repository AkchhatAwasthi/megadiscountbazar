"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Clock, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '../../../components/ProductCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const FlashDeals = () => {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    fetchFlashDeals();

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchFlashDeals = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })
        .limit(8);

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching flash deals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-4 md:py-8 bg-gradient-to-b from-red-50/60 via-white to-white my-3 md:my-6 rounded-2xl md:rounded-3xl max-w-[1280px] mx-auto px-3 md:px-8 border border-red-100 shadow-2xs">
      {/* Refined Minimalist Header */}
      <div className="flex flex-row items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="bg-[var(--color-brand-red)] text-white text-[11px] font-[800] px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
            <Zap className="size-3.5 fill-current" />
            Flash Sale
          </span>
          <span className="text-[12px] font-[600] text-gray-500 hidden sm:inline">
            Limited Time Offers
          </span>
        </div>

        {/* Minimalist Professional Timer */}
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-gray-200 shadow-2xs">
          <Clock className="size-3.5 text-[var(--color-brand-red)] shrink-0" />
          <span className="text-[10px] font-[700] text-gray-500 uppercase tracking-tight hidden xs:inline">Ends in:</span>
          <div className="flex items-center gap-1 font-mono text-[12px] font-[800] text-gray-900">
            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-900">{String(timeLeft.hours).padStart(2, '0')}h</span>
            <span className="text-gray-400 font-normal">:</span>
            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-900">{String(timeLeft.minutes).padStart(2, '0')}m</span>
            <span className="text-gray-400 font-normal">:</span>
            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-900 text-red-600">{String(timeLeft.seconds).padStart(2, '0')}s</span>
          </div>
        </div>
      </div>

      {/* Deals Carousel */}
      <div className="relative">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <Carousel opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent className="-ml-2">
              {products.map((product, idx) => (
                <CarouselItem key={product.id} className="pl-2 basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <ProductCard
                    product={{
                      ...product,
                      originalPrice: product.originalPrice || Math.round(product.price * 1.35),
                    }}
                    index={idx}
                    onViewDetail={() => router.push(`/product/${product.sku || product.id}`)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default FlashDeals;
