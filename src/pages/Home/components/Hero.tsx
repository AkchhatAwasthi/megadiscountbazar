import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const HERO_SLIDES = [
  {
    id: 1,
    tag: "FRESH HARVEST",
    title: "Organic. Fresh. Directly to your kitchen.",
    description: "Experience the premium taste of hand-picked seasonal organic produce. Quality you can trust, delivered in under 60 minutes.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2400&auto=format&fit=crop",
    cta: "Shop Fresh Now",
    accent: "var(--green-fresh)",
    theme: "light"
  },
  {
    id: 2,
    tag: "PRO TECH 2026",
    title: "Precision Engineering. Unrivaled Performance.",
    description: "The next generation of workspace tech has arrived. Save up to ₹15,000 on our newest pro-series laptops and accessories.",
    image: "https://images.unsplash.com/photo-1593360011559-a86836339999?q=80&w=2400&auto=format&fit=crop",
    cta: "Explore Tech Deals",
    accent: "var(--color-brand-red)",
    theme: "dark"
  },
  {
    id: 3,
    tag: "ELITE FASHION",
    title: "Define Your Style. Wear Your Confidence.",
    description: "The Spring Elite Collection is here. Discover premium fabrics and tailored fits designed for the modern trendsetter.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2400&auto=format&fit=crop",
    cta: "Shop The Collection",
    accent: "#FF4D4D",
    theme: "light"
  }
];

const Hero = () => {
  const navigate = useNavigate();
  const [[page, direction], setPage] = useState([0, 0]);

  const index = Math.abs(page % HERO_SLIDES.length);

  const paginate = useCallback((newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  }, [page]);

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 6000);
    return () => clearInterval(timer);
  }, [paginate]);

  const current = HERO_SLIDES[index];

  // Modern Kinetic Transition variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      scale: 1.1,
      opacity: 1 // No fade
    }),
    center: {
      zIndex: 1,
      x: 0,
      scale: 1,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 35 } as any,
        scale: { duration: 0.8, ease: [0.4, 0, 0.2, 1] as any }
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      scale: 0.95,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 35 } as any,
        scale: { duration: 0.6 }
      }
    })
  };

  return (
    <div className="relative w-full h-[85vh] md:h-[90vh] min-h-[500px] overflow-hidden bg-[var(--color-surface-page)]">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
           key={page}
           custom={direction}
           variants={variants}
           initial="enter"
           animate="center"
           exit="exit"
           className="absolute inset-0 w-full h-full flex flex-col lg:flex-row items-center"
        >
          {/* Background Image Layer */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={current.image} 
              alt=""
              className="w-full h-full object-cover"
            />
            {/* Optimized Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-surface-card)] via-[var(--color-surface-card)]/70 to-transparent lg:block hidden"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface-card)]/80 via-transparent to-black/30 lg:hidden"></div>
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] lg:hidden"></div>
          </div>

          {/* Content Layer */}
          <div className="relative z-20 w-full max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-center lg:justify-start h-full pt-20 lg:pt-0">
             
             <div className="w-full lg:w-[60%] flex flex-col items-center lg:items-start text-center lg:text-left gap-6 md:gap-8">
                
                {/* Clean Tag - No Icons */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="px-4 py-1.5 border border-[var(--color-brand-red)] text-[var(--color-brand-red)] rounded-full"
                >
                   <span className="text-[11px] font-[600] tracking-[0.1em] uppercase">{current.tag}</span>
                </motion.div>

                {/* Bold Responsive Heading */}
                <div className="relative group">
                   <motion.h1
                     initial={{ y: 30, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.3, duration: 0.7 }}
                     className="text-[36px] sm:text-[48px] md:text-[64px] lg:text-[72px] font-[600] text-[var(--color-text-primary)] leading-[1.05] tracking-[-0.03em]"
                   >
                     {current.title}
                   </motion.h1>
                   {/* Minimalist Geometry instead of Icons */}
                   <div className="absolute -left-4 top-0 w-1 h-full bg-[var(--color-brand-red)] rounded-full lg:block hidden opacity-40"></div>
                </div>

                <motion.p
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.4, duration: 0.6 }}
                   className="text-[15px] sm:text-[17px] md:text-[19px] text-[var(--color-text-secondary)] max-w-[550px] leading-[1.6]"
                >
                   {current.description}
                </motion.p>

                {/* CTA Panel */}
                <motion.div
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.5, duration: 0.6 }}
                   className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
                >
                   <button
                     onClick={() => navigate('/products')}
                     className="w-full sm:w-auto px-[22px] py-[10px] bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] text-white rounded-[8px] text-[14px] font-[500] transition-all duration-200 hover:-translate-y-[1px] active:scale-95 flex items-center justify-center group border-none"
                   >
                      <span>{current.cta}</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                   </button>
                </motion.div>

             </div>

             {/* Right Floating Content - Preserved Visuals */}
             <div className="hidden lg:flex flex-1 justify-end h-full items-end pb-24 pr-10">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="bg-white/95 backdrop-blur-md p-6 rounded-[16px] border-[0.5px] border-[var(--color-border-default)] shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex flex-col gap-4"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[12px] bg-[var(--color-brand-red-light)] flex items-center justify-center text-[20px]">📦</div>
                      <div>
                         <h4 className="text-[15px] font-[600] text-[var(--color-text-primary)]">Ready for Shipping</h4>
                         <p className="text-[12px] text-[var(--color-text-secondary)]">Items processed in real-time</p>
                      </div>
                   </div>
                   <div className="h-[1px] w-full bg-black/5"></div>
                   <div className="flex items-center justify-between gap-12">
                      <div>
                         <p className="text-[10px] font-[600] text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Estimated Delivery</p>
                         <p className="text-[14px] font-[600] text-[var(--color-brand-red)]">Tonight @ 8:00 PM</p>
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-[var(--color-brand-red)] border-t-transparent animate-spin"></div>
                   </div>
                </motion.div>
             </div>
          </div>

          {/* Clean Indicators - No AI Dots */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6">
             {HERO_SLIDES.map((_, i) => (
                <button
                   key={i}
                   onClick={() => setPage([i, i > index ? 1 : -1])}
                   className="h-10 px-2 flex flex-col justify-center gap-1 group"
                >
                   <span className={`text-[10px] font-bold transition-colors ${index === i ? 'text-[var(--color-brand-red)]' : 'text-black/20 group-hover:text-black/40'}`}>
                      0{i + 1}
                   </span>
                   <div className={`h-0.5 rounded-full transition-all duration-500 ease-in-out ${index === i ? 'w-10 bg-[var(--color-brand-red)]' : 'w-6 bg-black/10'}`} />
                </button>
             ))}
          </div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Hero;

