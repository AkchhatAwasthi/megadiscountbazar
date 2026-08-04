"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const SeasonalDrops = () => {
  const drops = [
    {
      badge: 'NEW',
      title: 'Refreshing Fragrances For Him',
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop',
      link: '/products?category=Beauty%20Products',
    },
    {
      badge: 'NEW',
      title: 'Premium Care Essentials For Him',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
      link: '/products?category=Beauty%20Products',
    },
  ];

  return (
    <div className="w-full my-8 px-4">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] md:text-[24px] font-[700] text-[var(--color-text-primary)] tracking-tight">
            New Seasonal Drops
          </h2>
          <Link
            href="/products"
            className="flex items-center gap-1 text-[13px] font-[600] text-[var(--color-brand-red)] hover:underline"
          >
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drops.map((drop, idx) => (
            <Link
              key={idx}
              href={drop.link}
              className="group relative h-[180px] md:h-[220px] rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex items-center p-6 bg-slate-900"
            >
              {/* Background Image */}
              <img
                src={drop.image}
                alt={drop.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

              {/* Text content */}
              <div className="relative z-10 max-w-[65%] flex flex-col items-start gap-2">
                <span className="bg-sky-500/20 text-sky-300 text-[10px] font-[700] px-2 py-0.5 rounded uppercase tracking-wider border border-sky-400/30">
                  {drop.badge}
                </span>
                <h3 className="text-white text-[18px] md:text-[22px] font-[700] leading-snug">
                  {drop.title}
                </h3>
                <span className="flex items-center gap-1 text-[12px] font-[600] text-red-400 group-hover:text-red-300 transition-colors mt-1">
                  SHOP NOW <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeasonalDrops;
