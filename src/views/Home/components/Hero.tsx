"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { heroService } from '@/services/heroService';
import { HeroSlide } from '@/types/hero';
import { useRouter } from 'next/navigation';

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    scale: 1.06,
    zIndex: 2,
  }),
  center: {
    x: 0,
    scale: 1,
    zIndex: 2,
    transition: {
      x: { type: 'spring' as const, stiffness: 260, damping: 30 },
      scale: { duration: 0.9, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
    },
  },
  exit: (dir: number) => ({
    x: dir < 0 ? '100%' : '-100%',
    scale: 0.97,
    zIndex: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 260, damping: 30 },
      scale: { duration: 0.6 },
    },
  }),
};

const Hero = ({ initialSlides }: { initialSlides?: HeroSlide[] }) => {
  const router = useRouter();
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides || []);
  const [loading, setLoading] = useState(!initialSlides);
  const [[page, direction], setPage] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 35, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 35, damping: 18 });
  const imageX = useTransform(springX, [0, 1], [-14, 14]);
  const imageY = useTransform(springY, [0, 1], [-9, 9]);

  useEffect(() => {
    if (!initialSlides || initialSlides.length === 0) {
      // old internal useEffect fetch logic
      heroService.getActiveSlides()
        .then(data => { setSlides(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [initialSlides]);

  const slidesCount = slides.length;
  const index = slidesCount > 0 ? Math.abs(page % slidesCount) : 0;

  const paginate = useCallback((newDir: number) => {
    setPage(prev => [prev[0] + newDir, newDir]);
  }, []);

  useEffect(() => {
    if (isPaused || slidesCount === 0) return;
    const timer = setInterval(() => paginate(1), 5000);
    return () => clearInterval(timer);
  }, [paginate, isPaused, slidesCount, page]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const resetMouse = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const handleCtaClick = (link?: string) => {
    if (link) {
      router.push(link);
    } else {
      router.push('/products');
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[56vh] min-h-[340px] bg-[var(--color-surface-page)] overflow-hidden">
        <motion.div
          className="w-full h-full"
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            background: 'linear-gradient(90deg, #F5F0E8 0%, #FDEAEA 40%, #F5F0E8 70%, #FFF9E6 100%)',
            backgroundSize: '300% 100%',
          }}
        />
      </div>
    );
  }

  if (!slidesCount) return null;

  const current = slides[index];
  const hasContent = !!(
    current.title?.trim() ||
    current.subtitle?.trim() ||
    current.description?.trim() ||
    current.cta_text?.trim()
  );

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 pt-3 pb-2 md:py-0">
      <div
        className="relative w-full h-[38vh] md:h-[56vh] min-h-[260px] md:min-h-[340px] rounded-2xl md:rounded-none overflow-hidden select-none cursor-pointer md:cursor-default shadow-sm border border-gray-100 md:border-none"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => { setIsPaused(false); resetMouse(); }}
        onClick={() => {
          if (window.innerWidth < 768) {
            handleCtaClick(current.cta_link);
          }
        }}
      >
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          {/* Parallax image */}
          <motion.div
            className="absolute -inset-[4%] w-[108%] h-[108%]"
            style={{ x: imageX, y: imageY }}
          >
            <picture className="block w-full h-full">
              {current.mobile_image && (
                <source media="(max-width: 767px)" srcSet={current.mobile_image} />
              )}
              <img
                src={current.image}
                alt={current.title}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </picture>
          </motion.div>

          {/* Vignette gradients for text readability */}
          {hasContent && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </>
          )}

          {/* Content Overlay */}
          {hasContent && (
            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-24 max-w-4xl z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex flex-col gap-2 md:gap-4"
              >
                {/* Subtitle */}
                {current.subtitle?.trim() && (
                  <motion.span 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-[var(--color-brand-gold)] uppercase tracking-[0.2em] text-[10px] md:text-sm font-semibold"
                  >
                    {current.subtitle}
                  </motion.span>
                )}

                {/* Title */}
                {current.title?.trim() && (
                  <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
                    className="text-white text-2xl md:text-7xl font-bold leading-snug md:leading-tight tracking-tight capitalize"
                  >
                    {current.title}
                  </motion.h1>
                )}

                {/* Description */}
                {current.description?.trim() && (
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-white/90 text-xs md:text-xl max-w-lg leading-relaxed font-normal line-clamp-2 md:line-clamp-none"
                  >
                    {current.description}
                  </motion.p>
                )}

                {/* CTA Button */}
                {current.cta_text?.trim() && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="pt-2 md:pt-4"
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleCtaClick(current.cta_link); }}
                      className="group relative px-5 py-2 md:px-10 md:py-4 bg-[var(--color-brand-red)] text-white font-bold rounded-lg md:rounded-none overflow-hidden transition-all duration-300 border border-[var(--color-brand-red)] hover:border-[var(--color-brand-gold)] shadow-md"
                    >
                      <span className="relative z-10 flex items-center gap-1.5">
                        <span className="tracking-wider uppercase text-xs md:text-sm font-bold">{current.cta_text}</span>
                        <ChevronRight size={16} strokeWidth={2.5} />
                      </span>
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          )}

          {/* Hover shimmer — subtle brand tint on hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              background: 'linear-gradient(135deg, rgba(204,27,27,0.07) 0%, rgba(255,215,0,0.04) 100%)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Left arrow */}
      <motion.button
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.32)' }}
        whileTap={{ scale: 0.88 }}
        onClick={(e) => { e.stopPropagation(); paginate(-1); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white shadow-md"
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
      </motion.button>

      {/* Right arrow */}
      <motion.button
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.32)' }}
        whileTap={{ scale: 0.88 }}
        onClick={(e) => { e.stopPropagation(); paginate(1); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white shadow-md"
      >
        <ChevronRight size={18} strokeWidth={2.5} />
      </motion.button>

      {/* Progress bar indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-[6px]">
        {slides.map((_, i) => (
          <motion.button
            key={i}
            onClick={(e) => { e.stopPropagation(); setPage([i, i > index ? 1 : -1]); }}
            animate={{
              width: i === index ? 44 : 16,
              backgroundColor: i === index ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.35)',
            }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.75)' }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="h-[3px] rounded-full cursor-pointer relative overflow-hidden"
          >
            {i === index && (
              <motion.span
                key={`fill-${page}`}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ backgroundColor: 'rgba(255,215,0,0.8)' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 5, ease: 'linear' }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-[18px] right-5 z-30 flex items-baseline gap-[3px] pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-white text-[13px] font-semibold tabular-nums"
          >
            {String(index + 1).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
        <span className="text-white/40 text-[10px] font-medium">
          / {String(slidesCount).padStart(2, '0')}
        </span>
      </div>
    </div>
  </div>
);
};

export default Hero;
