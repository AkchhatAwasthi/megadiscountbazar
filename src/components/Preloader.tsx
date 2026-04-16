import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Preloader() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2800);

        if (isLoading) {
            document.body.style.overflow = "hidden";
        }

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = "unset";
        };
    }, [isLoading]);

    return (
        <AnimatePresence mode="wait">
            {isLoading && (
                <motion.div
                    className="fixed inset-0 z-[9999] bg-[#000814] flex items-center justify-center overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ 
                        opacity: 0,
                        transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
                    }}
                >
                    {/* Atmospheric Background Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div 
                            className="absolute -top-[10%] -left-[10%] size-[40%] bg-blue-600/10 blur-[120px] rounded-full"
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.5, 0.3] 
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div 
                            className="absolute -bottom-[10%] -right-[10%] size-[40%] bg-blue-400/10 blur-[120px] rounded-full"
                            animate={{ 
                                scale: [1.2, 1, 1.2],
                                opacity: [0.2, 0.4, 0.2] 
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>

                    <div className="relative flex flex-col items-center">
                        {/* Premium Logo Animation */}
                        <div className="relative mb-12">
                            {/* Rotating Ring */}
                            <motion.div 
                                className="absolute -inset-4 rounded-full border border-blue-500/20"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                            />
                            
                            <motion.div 
                                className="absolute -inset-4 rounded-full border-t-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
                                className="relative size-[100px] bg-gradient-to-br from-[#0071DC] to-[#0055A6] rounded-2xl flex items-center justify-center shadow-[0_20px_40px_rgba(0,113,222,0.25)] border border-white/10"
                            >
                                <span className="text-white text-[48px] font-[700] tracking-tighter select-none">M</span>
                                
                                {/* Inner Gloss */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                            </motion.div>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="overflow-hidden mb-2">
                                <motion.h1
                                    initial={{ y: 40, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                                    className="text-[28px] md:text-[32px] font-[600] text-white tracking-[-0.03em]"
                                >
                                    Megadiscount<span className="text-[#0071DC]">store</span>
                                </motion.h1>
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                                className="flex flex-col items-center gap-4"
                            >
                                <p className="text-[12px] text-blue-100/40 tracking-[0.4em] uppercase font-[500]">
                                    Premium Experience
                                </p>

                                {/* Aesthetic Progress Bar */}
                                <div className="w-[180px] h-[3px] bg-white/5 rounded-full overflow-hidden relative">
                                    <motion.div 
                                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2.2, ease: [0.4, 0, 0.2, 1] }}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Footer Trust Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 1 }}
                        className="absolute bottom-12 flex items-center gap-2 text-[11px] text-white/20 font-[500] tracking-[0.1em] uppercase"
                    >
                        <div className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Secure Connection Established
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
