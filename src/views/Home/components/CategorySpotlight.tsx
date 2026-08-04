"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const CategorySpotlight = () => {
  const spotlights = [
    {
      title: 'Home & Kitchen Refresh',
      subtitle: 'Up to 50% OFF',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop',
      link: '/products?category=Home%20%26%20Kitchen',
      bg: 'from-amber-900/80 via-black/40 to-transparent',
    },
    {
      title: 'Fashion & Accessories',
      subtitle: 'Trending Style Edits',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
      link: '/products?category=Fashion%20%26%20Accessories',
      bg: 'from-purple-900/80 via-black/40 to-transparent',
    },
    {
      title: 'Beauty & Skincare',
      subtitle: 'Organic & Glowing Essentials',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop',
      link: '/products?category=Beauty%20Products',
      bg: 'from-rose-900/80 via-black/40 to-transparent',
    },
    {
      title: 'Toys & Soft Plushies',
      subtitle: 'Kids Favorite Toys',
      image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=800&auto=format&fit=crop',
      link: '/products?category=Toys%20%26%20Games',
      bg: 'from-emerald-900/80 via-black/40 to-transparent',
    },
  ];

  return (
    <section className="py-6 md:py-10 px-4 max-w-[1280px] mx-auto overflow-hidden">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-[20px] md:text-[28px] font-[700] text-[var(--color-text-primary)] tracking-tight">
          Curated Category Spotlights
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {spotlights.map((spot, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -35 : 35, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            whileHover={{ y: -4 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.08, ease: 'easeOut' }}
          >
            <Link
              href={spot.link}
              className="group relative h-[160px] md:h-[220px] rounded-2xl overflow-hidden shadow-xs border border-gray-100 flex flex-col justify-end p-4 bg-slate-900 block"
            >
              <img
                src={spot.image}
                alt={spot.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-70"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${spot.bg}`} />

              <div className="relative z-10 flex flex-col items-start gap-1">
                <span className="text-[10px] md:text-[11px] font-[700] text-amber-300 uppercase tracking-wide">
                  {spot.subtitle}
                </span>
                <h3 className="text-white text-[14px] md:text-[17px] font-[700] leading-snug line-clamp-2">
                  {spot.title}
                </h3>
                <span className="mt-1 flex items-center gap-1 text-[11px] font-[600] text-white/90 group-hover:text-amber-300 transition-colors">
                  Explore Collection <ArrowUpRight size={13} />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategorySpotlight;
