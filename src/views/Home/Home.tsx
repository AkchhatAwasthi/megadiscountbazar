"use client";

import React from 'react';
import TrustBadges from './components/TrustBadges';
import Hero from './components/Hero';
import CategoriesCarousel from './components/CategoriesCarousel';
import BestSellers from './components/BestSellers';
import FlashDeals from './components/FlashDeals';
import CategorySpotlight from './components/CategorySpotlight';
import TopRatedProducts from './components/TopRatedProducts';
import BudgetDeals from './components/BudgetDeals';
import SecondaryTrustRibbon from './components/SecondaryTrustRibbon';
import SeasonalDrops from './components/SeasonalDrops';
import NewArrivals from './components/NewArrivals';
import WhyChooseUs from './components/WhyChooseUs';
import InstagramCarousel from './components/InstagramCarousel';
import PromotionalBanner from './components/PromotionalBanner';
import Testimonials from '@/components/ui/testimonials';
import AnimatedSection from '@/components/AnimatedSection';

interface HomeProps {
  heroSlides?: any[];
  bestSellers?: any[];
  newArrivals?: any[];
}

const Home = ({ heroSlides, bestSellers, newArrivals }: HomeProps) => {
  return (
    <main className="min-h-screen bg-white relative font-inter overflow-x-hidden pb-12 md:pb-0">
      
      {/* 1. Top Trust & Delivery Badges Bar */}
      <AnimatedSection direction="none" delay={0.05}>
        <TrustBadges />
      </AnimatedSection>

      {/* 2. Hero Carousel Banner */}
      <div className="relative z-0">
        <Hero initialSlides={heroSlides} />
      </div>

      <div className="flex flex-col w-full relative z-10 bg-white">
        
        {/* 3. Sleek Category Presentation */}
        <AnimatedSection direction="up" delay={0.08}>
          <CategoriesCarousel />
        </AnimatedSection>

        {/* 4. Flash Deals (Countdown Timer) - Slide in from Left */}
        <AnimatedSection direction="left" delay={0.08}>
          <FlashDeals />
        </AnimatedSection>

        {/* 5. Best Selling Products - Slide in from Right */}
        <AnimatedSection direction="right" delay={0.08}>
          <section className="py-2">
             <BestSellers initialProducts={bestSellers} />
          </section>
        </AnimatedSection>

        {/* 6. Category Spotlight Grid */}
        <AnimatedSection direction="up" delay={0.08}>
          <CategorySpotlight />
        </AnimatedSection>

        {/* 7. Top Rated Products (4.5★+) - Slide in from Left */}
        <AnimatedSection direction="left" delay={0.08}>
          <TopRatedProducts />
        </AnimatedSection>

        {/* 8. New Seasonal Drops - Slide in from Right */}
        <AnimatedSection direction="right" delay={0.08}>
          <SeasonalDrops />
        </AnimatedSection>

        {/* 9. Budget Corner (Under ₹499) - Slide in from Left */}
        <AnimatedSection direction="left" delay={0.08}>
          <BudgetDeals />
        </AnimatedSection>

        {/* 10. New Arrivals - Slide in from Right */}
        <AnimatedSection direction="right" delay={0.08}>
          <section className="py-4">
             <NewArrivals initialProducts={newArrivals} />
          </section>
        </AnimatedSection>

        {/* 11. Secondary Trust Ribbon */}
        <AnimatedSection direction="up" delay={0.08}>
          <SecondaryTrustRibbon />
        </AnimatedSection>

        {/* 12. Why Choose Us */}
        <AnimatedSection direction="up" delay={0.08}>
          <WhyChooseUs />
        </AnimatedSection>

        {/* 13. Testimonials */}
        <AnimatedSection direction="up" delay={0.08}>
          <div className="py-8 md:py-20 bg-[var(--color-surface-page)]/30">
             <Testimonials />
          </div>
        </AnimatedSection>

        {/* 14. Promotional Banner - Slide in from Left */}
        <AnimatedSection direction="left" delay={0.08}>
          <div className="px-4 md:px-10 lg:px-20 py-8 md:py-20">
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
        </AnimatedSection>

        {/* 15. Instagram / Social Feed */}
        <AnimatedSection direction="up" delay={0.08}>
          <div className="pb-8 md:pb-20">
             <InstagramCarousel />
          </div>
        </AnimatedSection>

      </div>
    </main>
  );
};

export default Home;
