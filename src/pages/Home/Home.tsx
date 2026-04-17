import React from 'react';
import Hero from './components/Hero';
import CategoriesCarousel from './components/CategoriesCarousel';
import BestSellers from './components/BestSellers';
import NewArrivals from './components/NewArrivals';
import WhyChooseUs from './components/WhyChooseUs';
import InstagramCarousel from './components/InstagramCarousel';
import PromotionalBanner from './components/PromotionalBanner';
import Testimonials from '@/components/ui/testimonials';

const Home = () => {
  return (
    <main className="min-h-screen bg-white relative font-inter overflow-x-hidden">
      
      {/* 1. Hero Section - The Big Entrance */}
      <div className="relative z-0">
        <Hero />
      </div>

      <div className="flex flex-col w-full relative z-10 bg-white">
        
        {/* 2. Categories Carousel - Navigation/Exploration */}
        <div className="mt-[-40px] md:mt-[-80px] relative z-20">
           <CategoriesCarousel />
        </div>

        {/* 3. Best Sellers - Prime Real Estate for Conversion */}
        <section className="pt-0 pb-10 md:pb-20">
           <BestSellers />
        </section>

        {/* 4. Promotional Banner 1 - Electronics/Lifestyle Hook */}
        <div className="px-6 md:px-10 lg:px-20 mb-20 md:mb-32">
           <PromotionalBanner
             image="https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=2000&auto=format&fit=crop"
             subtitle="Premium Entertainment"
             title="The Visionary 4K Series"
             description="Experience cinematic brilliance in your living room. Ultra-high definition displays starting from just ₹49,999. Limited time anniversary offer."
             ctaText="Explore TV & Audio"
             link="/products?category=Electronics"
             align="left"
           />
        </div>

        {/* 5. New Arrivals - Freshness & Curiosity */}
        <section className="pb-20 md:pb-32">
           <NewArrivals />
        </section>

        {/* 6. Why Choose Us - Building Trust & Infrastructure */}
        <WhyChooseUs />

        {/* 7. Testimonials - Social Proof */}
        <div className="py-20 md:py-32 bg-[var(--color-surface-page)]/30">
           <Testimonials />
        </div>

        {/* 8. Promotional Banner 2 - Fashion/Apparel Hook */}
        <div className="px-6 md:px-10 lg:px-20 py-20 md:py-32">
           <PromotionalBanner
             image="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2000&auto=format&fit=crop"
             subtitle="Streetwear Evolution"
             title="The Archive Drop 2024"
             description="Minimalist silhouettes crafted with heavyweight GOTS-certified organic cotton. Built for durability, styled for the generation that knows no bounds."
             ctaText="Shop The Archive"
             link="/products?category=Fashion"
             align="right"
           />
        </div>

        {/* 9. Instagram / Social Feed - Community & Final Engagement */}
        <div className="pb-20 md:pb-32">
           <InstagramCarousel />
        </div>

      </div>
    </main>
  );
};

export default Home;
