import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface PromotionalBannerProps {
  image: string;
  subtitle: string;
  title: string;
  description?: string;
  ctaText: string;
  link: string;
  align?: 'left' | 'right' | 'center';
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  image,
  subtitle,
  title,
  description,
  ctaText,
  link,
  align = 'left',
}) => {
  const navigate = useNavigate();

  return (
    <section className="py-[64px] md:py-[96px] bg-[var(--surface-white)]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className={`relative overflow-hidden rounded-[16px] bg-[var(--blue-primary)] flex flex-col md:flex-row ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
          
          {/* Content side */}
          <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center items-start text-left z-10">
            <span className="text-[12px] font-[500] tracking-[0.05em] text-white/90 uppercase mb-3 px-3 py-1 bg-white/10 rounded-full">
              {subtitle}
            </span>
            <h2 className="text-[32px] md:text-[44px] font-[600] text-white leading-[1.1] tracking-[-0.03em] mb-6">
              {title}
            </h2>
            {description && (
              <p className="text-[16px] text-white/80 leading-[1.6] mb-8 max-w-md">
                {description}
              </p>
            )}
            <button
              onClick={() => navigate(link)}
              className="px-10 py-4 bg-[var(--yellow-accent)] text-[#1A1A1A] rounded-[8px] text-[15px] font-[600] transition-all hover:bg-[var(--yellow-hover)] hover:shadow-lg active:scale-95 flex items-center gap-2 group"
            >
              {ctaText}
              <ArrowRight className="size-[18px] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Image side */}
          <div className="w-full md:w-1/2 h-[300px] md:h-auto overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>

          {/* Subtle Background Decoration */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-black/10 to-transparent pointer-events-none hidden md:block"></div>
        </div>
      </div>
    </section>
  );
};

export default PromotionalBanner;