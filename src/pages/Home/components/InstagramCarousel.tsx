import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Instagram, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface InstagramPost {
  id: string;
  embed_html: string;
  caption: string;
}

const InstagramCarousel = () => {
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInstagramPosts();
  }, []);

  const fetchInstagramPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('instagram_posts')
        .select('id, embed_html, caption')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setInstagramPosts(data || []);
    } catch (error) {
      console.error('Error fetching Instagram posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load Instagram embed script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//www.instagram.com/embed.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.instgrm) {
        // @ts-ignore
        window.instgrm.Embeds.process();
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [instagramPosts]);

  const scrollPrev = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  if (loading || instagramPosts.length === 0) return null;

  return (
    <section className="py-[64px] md:py-[96px] bg-[var(--surface-white)] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="flex flex-col">
            <span className="text-[12px] font-[500] tracking-[0.05em] text-[var(--blue-primary)] uppercase mb-2">
              Follow Us
            </span>
            <h2 className="text-[28px] md:text-[32px] font-[500] text-[#1A1A1A] leading-[1.2] tracking-[-0.02em]">
              Stay Connected on Instagram
            </h2>
            <p className="text-[15px] text-[#5F6368] mt-3 max-w-2xl leading-[1.6]">
              Follow @paridhanhaat for the latest updates, drops, and customer highlights.
            </p>
          </div>

          <div className="flex items-center gap-3">
             <button
                onClick={() => window.open('https://instagram.com/paridhanhaat', '_blank')}
                className="hidden md:flex items-center justify-center px-6 py-2.5 bg-[var(--blue-primary)] text-white rounded-[8px] text-[14px] font-[500] transition-all hover:bg-[var(--blue-deep)] hover:-translate-y-[1px]"
             >
                <Instagram className="size-[16px] mr-2" />
                Follow @paridhanhaat
             </button>
             <div className="flex gap-2">
                <button
                    onClick={scrollPrev}
                    className="size-[40px] flex items-center justify-center border-[1.5px] border-[#E0E3E7] rounded-[8px] transition-colors hover:bg-[#F6F7F8]"
                    aria-label="Previous Slide"
                >
                    <ChevronLeft className="size-[20px] text-[#1A1A1A]" />
                </button>
                <button
                    onClick={scrollNext}
                    className="size-[40px] flex items-center justify-center border-[1.5px] border-[#E0E3E7] rounded-[8px] transition-colors hover:bg-[#F6F7F8]"
                    aria-label="Next Slide"
                >
                    <ChevronRight className="size-[20px] text-[#1A1A1A]" />
                </button>
             </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto hide-scrollbar pb-10 pt-2 snap-x"
          >
            {instagramPosts.map((post) => (
              <motion.div 
                key={post.id} 
                className="min-w-[280px] md:min-w-[320px] snap-start bg-white rounded-[12px] border border-[var(--border-default)] overflow-hidden transition-all duration-300 hover:border-[var(--blue-primary)] hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,113,220,0.1)] group"
              >
                {/* Embed Side */}
                <div className="relative aspect-[4/5] bg-[#F6F7F8]">
                   <div 
                      dangerouslySetInnerHTML={{ __html: post.embed_html }} 
                      className="w-full h-full [&_blockquote]:!m-0 [&_iframe]:!w-full [&_iframe]:!h-full [&_iframe]:!rounded-none" 
                   />
                   
                   {/* Hover Overlay */}
                   <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>

                {/* Card Footer */}
                <div className="p-5 border-t border-[var(--border-default)] flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="size-[24px] bg-[var(--blue-light)] rounded-full flex items-center justify-center text-[var(--blue-primary)]">
                       <Instagram className="size-[12px]" />
                    </div>
                    <span className="text-[13px] font-[600] text-[#1A1A1A]">@paridhanhaat</span>
                  </div>
                  <button 
                    onClick={() => window.open('https://instagram.com/paridhanhaat', '_blank')}
                    className="w-full py-2 border-[1.5px] border-[var(--blue-primary)] text-[var(--blue-primary)] rounded-[8px] text-[12px] font-[500] transition-all hover:bg-[var(--blue-light)]"
                  >
                    View Post
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Masking Gradients */}
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[var(--surface-white)] to-transparent pointer-events-none hidden md:block"></div>
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--surface-white)] to-transparent pointer-events-none hidden md:block"></div>
        </div>

        {/* Mobile Call to Action */}
        <div className="md:hidden mt-8">
            <button
                onClick={() => window.open('https://instagram.com/paridhanhaat', '_blank')}
                className="w-full py-4 bg-[var(--blue-primary)] text-white rounded-[8px] text-[14px] font-[600] flex items-center justify-center gap-2"
            >
                <Instagram className="size-[18px]" />
                Follow us on Instagram
            </button>
        </div>

      </div>
    </section>
  );
};

export default InstagramCarousel;