"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '../../../components/ProductCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const BudgetDeals = () => {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgetDeals();
  }, []);

  const fetchBudgetDeals = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .lte('price', 499)
        .order('price', { ascending: true })
        .limit(10);

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching budget deals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-6 md:py-10 bg-emerald-50/40 border-y border-emerald-100/60 overflow-hidden my-4">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
              <Tag className="size-4" />
            </div>
            <div>
              <h2 className="text-[20px] md:text-[28px] font-[700] text-[var(--color-text-primary)] tracking-tight">
                Budget Corner: Under ₹499
              </h2>
            </div>
          </div>
          <button
            onClick={() => router.push('/products')}
            className="flex items-center gap-1 text-[13px] font-[600] text-[var(--color-brand-red)] hover:underline"
          >
            View all &gt;
          </button>
        </div>

        {/* Carousel */}
        <div className="relative">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <Carousel opts={{ align: "start", loop: false }} className="w-full">
              <CarouselContent className="-ml-3">
                {products.map((product, idx) => (
                  <CarouselItem key={product.id} className="pl-3 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <ProductCard
                      product={product}
                      index={idx}
                      onViewDetail={() => router.push(`/product/${product.sku || product.id}`)}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          )}
        </div>
      </div>
    </section>
  );
};

export default BudgetDeals;
