import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Truck, Clock, Heart, ArrowRight, Zap, CheckCircle, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: Shield,
    title: 'Guaranteed Quality',
    description: 'Every product in our catalog undergoes rigorous 5-step quality checks to ensure perfection.'
  },
  {
    icon: Truck,
    title: 'Express Logistics',
    description: 'Flash delivery within 24 hours. Optimized routing to get your orders to you in record time.'
  },
  {
    icon: Zap,
    title: 'Instant Support',
    description: 'Human-led customer service available 24/7. We resolve 95% of queries in under 15 minutes.'
  },
  {
    icon: CheckCircle,
    title: 'Maximum Value',
    description: 'Direct-to-consumer pricing ensures you get premium products at wholesale market prices.'
  },
];

const WhyChooseUs = () => {
  const navigate = useNavigate();

  return (
    <section className="py-[100px] md:py-[140px] bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.03] pointer-events-none">
         <div className="absolute top-20 left-10 size-[600px] bg-[var(--blue-primary)] rounded-full blur-[140px]"></div>
         <div className="absolute bottom-20 right-10 size-[400px] bg-[var(--yellow-accent)] rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-20">
           <div className="max-w-xl">
             <div className="inline-flex items-center gap-2 bg-[var(--blue-light)] text-[var(--blue-primary)] px-4 py-1.5 rounded-full mb-6">
                <Package size={14} className="animate-pulse" />
                <span className="text-[11px] font-[700] uppercase tracking-[0.1em]">The Premium Standard</span>
             </div>
             <h2 className="text-[36px] md:text-[52px] font-[600] text-[var(--text-primary)] leading-[1.05] tracking-tight">
               Elevating Every Aspect of Your <span className="text-[var(--blue-primary)]">Shopping Journey</span>
             </h2>
           </div>
           <div className="lg:pb-2">
             <p className="text-[17px] text-[var(--text-secondary)] leading-[1.65] max-w-lg">
               We bridge the gap between quality and affordability. Experience a hypermarket designed for the modern consumer who values speed, trust, and transparency.
             </p>
           </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-24">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
              className="group bg-[var(--surface-light)]/50 p-10 rounded-[20px] border border-[var(--border-default)] hover:bg-white hover:border-[var(--blue-primary)] hover:shadow-[0_24px_48px_rgba(0,113,220,0.08)] transition-all duration-500"
            >
              <div className="size-[60px] bg-white rounded-[16px] flex items-center justify-center text-[var(--blue-primary)] mb-8 shadow-sm group-hover:bg-[var(--blue-primary)] group-hover:text-white transition-colors duration-500">
                <feature.icon className="size-[28px]" />
              </div>
              <h3 className="text-[20px] font-[600] text-[var(--text-primary)] mb-4 leading-tight">
                {feature.title}
              </h3>
              <p className="text-[15px] text-[var(--text-secondary)] leading-[1.55]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Global Reach / Trust Badge */}
        <div className="bg-[#1A1A1A] rounded-[24px] overflow-hidden flex flex-col lg:flex-row shadow-2xl">
           <div className="flex-1 p-10 md:p-16 flex flex-col justify-center">
              <h3 className="text-[28px] md:text-[34px] font-[600] text-white mb-6 leading-tight">
                Trusted by 50,000+ happy customers across the nation.
              </h3>
              <div className="flex flex-wrap gap-8 items-center">
                 <div>
                    <p className="text-[32px] font-[700] text-[var(--yellow-accent)]">99.9%</p>
                    <p className="text-[12px] text-white/50 uppercase tracking-widest font-[600]">Delivery Rate</p>
                 </div>
                 <div className="w-px h-8 bg-white/10"></div>
                 <div>
                    <p className="text-[32px] font-[700] text-[var(--yellow-accent)]">4.8/5</p>
                    <p className="text-[12px] text-white/50 uppercase tracking-widest font-[600]">Customer Rating</p>
                 </div>
                 <div className="w-px h-8 bg-white/10"></div>
                 <div>
                    <p className="text-[32px] font-[700] text-[var(--yellow-accent)]">24/7</p>
                    <p className="text-[12px] text-white/50 uppercase tracking-widest font-[600]">Human Support</p>
                 </div>
              </div>
           </div>
           
           <div className="lg:w-[400px] bg-[var(--blue-primary)] p-10 md:p-16 flex flex-col items-center justify-center text-center">
              <p className="text-white/90 text-[15px] mb-8 font-[500]">
                 Experience the first-class shopping experience you deserve.
              </p>
              <button
                onClick={() => navigate('/products')}
                className="w-full bg-[var(--yellow-accent)] hover:bg-[var(--yellow-hover)] text-[#1A1A1A] px-8 py-4 rounded-[12px] font-[700] text-[15px] uppercase tracking-wider transition-all shadow-xl active:scale-95"
              >
                 Start Shopping
              </button>
           </div>
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;