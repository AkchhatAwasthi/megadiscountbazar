import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { heroService } from '@/services/heroService';
import { HeroSlide } from '@/types/hero';

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

import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [[page, direction], setPage] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 35, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 35, damping: 18 });
  const imageX = useTransform(springX, [0, 1], [-14, 14]);
  const imageY = useTransform(springY, [0, 1], [-9, 9]);

  useEffect(() => {
    heroService.getActiveSlides()
      .then(data => { setSlides(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
      navigate(link);
    } else {
      navigate('/products');
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

  return (
    <div
      className="relative w-full h-[56vh] min-h-[340px] overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => { setIsPaused(false); resetMouse(); }}
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
            <img
              src={current.image}
              alt={current.title}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </motion.div>

          {/* Vignette gradients for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center px-12 md:px-24 max-w-4xl z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col gap-4"
            >
              {/* Subtitle */}
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-[var(--color-brand-gold)] uppercase tracking-[0.3em] text-xs md:text-sm font-semibold"
              >
                {current.subtitle}
              </motion.span>

              {/* Title */}
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
                className="text-white text-5xl md:text-7xl font-bold leading-tight tracking-tight capitalize"
              >
                {current.title}
              </motion.h1>

              {/* Description */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-white/80 text-lg md:text-xl max-w-lg leading-relaxed font-light"
              >
                {current.description}
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="pt-4"
              >
                <button 
                  onClick={() => handleCtaClick(current.cta_link)}
                  className="group relative px-10 py-4 bg-[var(--color-brand-primary)] text-white font-bold rounded-none overflow-hidden transition-all duration-300 border border-[var(--color-brand-primary)] hover:border-[var(--color-brand-gold)] shadow-lg hover:shadow-[0_0_30px_rgba(204,27,27,0.4)]"
                >
                  {/* Background Slide Layer */}
                  <div className="absolute inset-x-0 bottom-0 h-0 bg-[var(--color-brand-gold)] transition-all duration-300 ease-out group-hover:h-full" />
                  
                  {/* Text Container */}
                  <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover:text-[var(--color-background-dark)]">
                    <span className="tracking-widest uppercase text-sm font-bold">{current.cta_text}</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ChevronRight size={20} strokeWidth={3} />
                    </motion.span>
                  </span>
                </button>
              </motion.div>
            </motion.div>
          </div>

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
        onClick={() => paginate(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white shadow-md"
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
      </motion.button>

      {/* Right arrow */}
      <motion.button
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.32)' }}
        whileTap={{ scale: 0.88 }}
        onClick={() => paginate(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white shadow-md"
      >
        <ChevronRight size={18} strokeWidth={2.5} />
      </motion.button>

      {/* Progress bar indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-[6px]">
        {slides.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setPage([i, i > index ? 1 : -1])}
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
  );
};

export default Hero;
