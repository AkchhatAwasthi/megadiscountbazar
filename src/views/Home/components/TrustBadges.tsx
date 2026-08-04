"use client";

import React from 'react';
import { Zap, Truck, ShieldCheck } from 'lucide-react';

const TrustBadges = () => {
  const badges = [
    {
      icon: Zap,
      iconBg: 'bg-red-50 text-[var(--color-brand-red)]',
      title: '30 Min Delivery',
    },
    {
      icon: Truck,
      iconBg: 'bg-emerald-50 text-emerald-600',
      title: 'Free Shipping',
    },
    {
      icon: ShieldCheck,
      iconBg: 'bg-blue-50 text-blue-600',
      title: '100% Secure',
    },
  ];

  return (
    <div className="w-full py-2 bg-gray-50/80 border-b border-[var(--color-border-default)]">
      <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-around gap-2">
        {badges.map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white shadow-2xs border border-gray-100 flex-1 justify-center max-w-[140px]"
            >
              <div className={`size-6 rounded-full flex items-center justify-center shrink-0 ${badge.iconBg}`}>
                <Icon size={13} />
              </div>
              <span className="text-[11px] font-[700] text-gray-800 tracking-tight whitespace-nowrap">
                {badge.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrustBadges;
