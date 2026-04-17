import React, { useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const LottieOverlay = () => {
    const { animation, closeAnimation } = useStore();

    useEffect(() => {
        if (animation.isOpen) {
            // Adjust duration based on type for full animation play
            const duration = animation.type === 'order-confirmed' || animation.type === 'welcome' ? 4000 : 2500;
            const timer = setTimeout(() => {
                closeAnimation();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [animation.isOpen, closeAnimation, animation.type]);

    if (!animation.isOpen) return null;

    const getAnimationConfig = () => {
        switch (animation.type) {
            case 'add-to-basket':
                return {
                    src: "/animated icons/Add to basket.lottie",
                    title: "ITEM SECURED",
                    subtitle: "Successfully added to your collection",
                    color: "var(--color-brand-red)",
                    accentColor: "rgba(204, 27, 27, 0.1)",
                    loop: false
                };
            case 'bye-bye':
                return {
                    src: "/animated icons/Bye-bye.lottie",
                    title: "SEE YOU SOON",
                    subtitle: "Logged out safely. Come back soon!",
                    color: "var(--color-text-secondary)",
                    accentColor: "#F5F0E8",
                    loop: true
                };
            case 'welcome':
                return {
                    src: "/animated icons/Welcome Screen.lottie",
                    title: "WELCOME BACK",
                    subtitle: "Everything you need, all in one place",
                    color: "var(--color-brand-red)",
                    accentColor: "var(--color-brand-yellow)",
                    loop: false
                };
            case 'order-confirmed':
                return {
                    src: "/animated icons/Order Confirmed.lottie",
                    title: "ORDER PLACED",
                    subtitle: "Your premium selection is being prepared",
                    color: "#008A00", // Green for success
                    accentColor: "rgba(0, 138, 0, 0.1)",
                    loop: false
                };
            default:
                return null;
        }
    };

    const config = getAnimationConfig();
    if (!config) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100000] flex items-center justify-center pointer-events-auto p-6">
                {/* Clean Solid Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#1A1A1A]/90" // Solid dark with high opacity
                />

                {/* Premium Solid Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 1.05 }}
                    transition={{ type: "spring", damping: 30, stiffness: 450 }}
                    className="relative bg-white border border-[var(--color-border-default)] rounded-[24px] p-8 md:p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6 text-center max-w-[440px] w-full"
                >
                    {/* Animated Icon with accent background */}
                    <div 
                        className="w-48 h-48 md:w-56 md:h-56 rounded-full flex items-center justify-center p-4 relative"
                        style={{ backgroundColor: config.accentColor }}
                    >
                        <DotLottieReact
                            src={config.src}
                            autoplay
                            loop={config.loop}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>

                    {/* Content Section */}
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 
                                className="text-2xl md:text-3xl font-[700] uppercase tracking-wider mb-2"
                                style={{ color: config.color }}
                            >
                                {config.title}
                            </h2>
                            <div className="h-1 w-12 mx-auto rounded-full mb-4" style={{ backgroundColor: config.color }} />
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-[var(--color-text-secondary)] text-[16px] md:text-[18px] font-medium leading-relaxed px-4"
                        >
                            {config.subtitle}
                        </motion.p>
                    </div>

                    {/* Bottom Status Indicator */}
                    <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 3.5, ease: "linear" }}
                        className="absolute bottom-0 left-0 right-0 h-1.5 origin-left"
                        style={{ backgroundColor: config.color }}
                    />
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LottieOverlay;

