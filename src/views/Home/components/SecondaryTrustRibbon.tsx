"use client";

import React from 'react';
import { Tag, Star, Percent, RotateCcw } from 'lucide-react';

const SecondaryTrustRibbon = () => {
  const items = [
    {
      icon: Tag,
      color: 'bg-rose-100 text-rose-600',
      title: 'Latest Arrivals',
      subtitle: 'New products every week',
    },
    {
      icon: Star,
      color: 'bg-amber-100 text-amber-600',
      title: 'Top Quality',
      subtitle: 'Premium & trusted brands',
    },
    {
      icon: Percent,
      color: 'bg-emerald-100 text-emerald-600',
      title: 'Best Prices',
      subtitle: 'Unbeatable deals',
    },
    {
      icon: RotateCcw,
      color: 'bg-sky-100 text-sky-600',
      title: 'Easy Returns',
      subtitle: 'Hassle free returns',
    },
  ];

  return (
    <div className="w-full my-6 px-4">
      <div className="max-w-[1280px] mx-auto bg-gray-50 border border-[var(--color-border-default)] rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center gap-3">
              <div className={`size-9 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <h4 className="text-[13px] font-[600] text-[var(--color-text-primary)] leading-snug">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[var(--color-text-muted)] leading-tight">
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SecondaryTrustRibbon;
