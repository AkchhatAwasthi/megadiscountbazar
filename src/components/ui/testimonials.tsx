import { useEffect, useState } from "react";
import { fetchTestimonials, Testimonial } from "@/data/testimonials";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const data = await fetchTestimonials();
        setTestimonials(data);
      } catch (error) {
        console.error("Error loading testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="py-[64px] bg-[var(--surface-white)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--blue-primary)] border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="py-[64px] md:py-[96px] bg-[var(--surface-white)] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[12px] font-[500] tracking-[0.05em] text-[var(--blue-primary)] uppercase mb-2 block">
            Customer Voices
          </span>
          <h2 className="text-[28px] md:text-[32px] font-[500] text-[#1A1A1A] leading-[1.2] tracking-[-0.02em] mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-[15px] text-[#5F6368] leading-[1.65]">
            See what our customers have to say about their shopping experience and product quality at Paridhan Haat.
          </p>
        </div>

        {/* Global Testimonial Content Wrapper */}
        <div className="relative">
            {/* Smooth Infinite Marquee Effect */}
            <div className="flex overflow-hidden gap-6 py-4">
                <motion.div 
                    animate={{ x: [0, -1000] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="flex shrink-0 gap-6"
                >
                    {testimonials.concat(testimonials).map((testimonial, idx) => (
                        <div 
                            key={`${testimonial.id}-${idx}`}
                            className="w-[320px] md:w-[400px] shrink-0 bg-[var(--surface-light)] p-8 rounded-[16px] border border-[var(--border-default)] flex flex-col justify-between transition-all hover:border-[var(--blue-primary)] group"
                        >
                            <div>
                                <div className="flex items-center text-[var(--yellow-accent)] mb-4 gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="size-[14px] fill-current" />
                                    ))}
                                </div>
                                <p className="text-[15px] text-[#1A1A1A] leading-[1.6] italic mb-8 font-[400]">
                                    "{testimonial.text}"
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="size-[48px] rounded-full overflow-hidden border-2 border-white bg-white">
                                    <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="text-[14px] font-[600] text-[#1A1A1A]">{testimonial.name}</h4>
                                    <p className="text-[12px] text-[#5F6368] uppercase tracking-wider">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
            {/* Fade Gradients for edge masking */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--surface-white)] to-transparent pointer-events-none hidden md:block"></div>
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--surface-white)] to-transparent pointer-events-none hidden md:block"></div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;