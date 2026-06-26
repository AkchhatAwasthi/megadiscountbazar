import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

const CategoriesCarousel = () => {
  const navigate = useNavigate();
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
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-[64px] bg-[var(--color-surface-card)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-brand-red)] border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  // Category colours & emojis (fallback when no image_url)
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

  const handleNav = (name: string) =>
    navigate(`/products?category=${encodeURIComponent(name)}`);

  return (
    <section className="pt-[64px] md:pt-[96px] pb-0 bg-[var(--color-surface-card)] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-6">
          <div className="flex flex-col">
            <span className="text-[12px] font-[500] tracking-[0.05em] text-[var(--color-brand-red)] uppercase mb-2">
              Browse Collections
            </span>
            <h2 className="text-[28px] md:text-[32px] font-[500] text-[var(--color-text-primary)] leading-[1.2] tracking-[-0.02em]">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="hidden md:flex items-center justify-center px-5 py-2.5 border-[1.5px] border-[var(--color-brand-red)] text-[var(--color-brand-red)] rounded-[8px] text-[14px] font-[500] transition-all hover:bg-[var(--color-brand-red-light)] hover:-translate-y-[1px]"
          >
            View all categories
          </button>
        </div>

        {/* ── MOBILE: 4-column circle grid ── */}
        <div className="md:hidden">
          <div className="grid grid-cols-4 gap-x-3 gap-y-5 pb-8">
            {categories.map((category) => {
              const bg = categoryColors[category.name] || 'var(--color-brand-red)';
              const emoji = categoryEmojis[category.name] || '📦';
              return (
                <motion.button
                  key={category.id}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleNav(category.name)}
                  className="flex flex-col items-center gap-2 group"
                >
                  {/* Circle */}
                  <div
                    className="size-14 rounded-full flex items-center justify-center overflow-hidden transition-transform duration-150 group-active:scale-90"
                    style={{
                      background: category.image_url
                        ? undefined
                        : `linear-gradient(135deg, ${bg}ee 0%, ${bg} 100%)`,
                      boxShadow: `0 2px 8px ${bg}44`,
                    }}
                  >
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">{emoji}</span>
                    )}
                  </div>
                  {/* Label */}
                  <span
                    className="text-[11px] font-[600] leading-tight text-center w-full line-clamp-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
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
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 4000 }) as any]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {categories.map((category) => (
                <CarouselItem key={category.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
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
