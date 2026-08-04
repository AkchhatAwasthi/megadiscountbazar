"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface Category {
  id: string;
  name: string;
  image_url: string;
}

// Fallback colours & emojis when a category has no image
const categoryColors: Record<string, string> = {
  'Gifts & Gadgets':     '#1A3C6E',
  'Kitchen Accessories': '#B22222',
  'Toys':                '#3A7D3A',
  'Ladies Wear':         '#C2185B',
  'Beauty Products':     '#5B2D8E',
  'Grocery':             '#2E7D32',
  'Sports':              '#E65100',
  'Pharmacy':            '#0277BD',
};
const categoryEmojis: Record<string, string> = {
  'Gifts & Gadgets':     '🎁',
  'Kitchen Accessories': '🍳',
  'Toys':                '🧸',
  'Ladies Wear':         '👗',
  'Beauty Products':     '💄',
  'Grocery':             '🛒',
  'Sports':              '⚽',
  'Pharmacy':            '💊',
};

const CategoriesCarousel = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      setCategories((data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        image_url: cat.image_url || ''
      })));
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNav = (name: string) =>
    router.push(`/products?category=${encodeURIComponent(name)}`);

  if (loading) {
    return (
      <section className="py-[64px] bg-[var(--color-surface-card)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-brand-red)] border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-6 md:py-12 bg-[var(--color-surface-card)] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-[20px] md:text-[28px] font-[700] text-[var(--color-text-primary)] tracking-tight">
            Shop by Category
          </h2>
          <button
            onClick={() => router.push('/products')}
            className="flex items-center gap-1 text-[13px] font-[600] text-[var(--color-brand-red)] hover:underline"
          >
            View all &gt;
          </button>
        </div>

        {/* ── MOBILE: Clean 2-Line Grid (4 items per line) ── */}
        <div className="md:hidden">
          <div className="grid grid-cols-4 gap-x-3 gap-y-4 pb-2">
            {categories.slice(0, 8).map((category, idx) => {
              const bg = categoryColors[category.name] || '#CC1B1B';
              const emoji = categoryEmojis[category.name] || '📦';
              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.85, y: 15 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  whileTap={{ scale: 0.92 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => handleNav(category.name)}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className="size-[58px] rounded-2xl flex items-center justify-center overflow-hidden border border-gray-200/70 shadow-2xs group-hover:shadow-md group-hover:scale-105 transition-all bg-gray-50"
                    style={{
                      background: category.image_url
                        ? undefined
                        : `linear-gradient(135deg, ${bg}15 0%, ${bg}30 100%)`,
                    }}
                  >
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <span className="text-xl">{emoji}</span>
                    )}
                  </div>
                  <span className="text-[11px] font-[600] text-gray-800 leading-tight text-center w-full line-clamp-1 group-hover:text-[var(--color-brand-red)] transition-colors">
                    {category.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── DESKTOP: Carousel (unchanged) ── */}
        <div className="relative hidden md:block">
          <Carousel
            opts={{ align: 'start', loop: true }}
            plugins={[Autoplay({ delay: 4000 }) as any]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {categories.map((category) => (
                <CarouselItem
                  key={category.id}
                  className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
                >
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="flex flex-col items-center group cursor-pointer"
                    onClick={() => handleNav(category.name)}
                  >
                    <div className="w-full aspect-square rounded-full bg-[var(--color-surface-page)] flex items-center justify-center overflow-hidden mb-4 transition-colors group-hover:bg-[var(--color-brand-red-light)] border border-[var(--color-border-default)]">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="text-[24px] opacity-40">🏷️</div>
                      )}
                    </div>
                    <span className="text-[14px] font-[500] text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-red)] transition-colors text-center">
                      {category.name}
                    </span>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="flex justify-center mt-8 gap-3">
              <CarouselPrevious className="static translate-y-0 size-[40px] border-[var(--color-border-default)]" />
              <CarouselNext className="static translate-y-0 size-[40px] border-[var(--color-border-default)]" />
            </div>
          </Carousel>
        </div>

      </div>
    </section>
  );
};

export default CategoriesCarousel;
