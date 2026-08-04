"use client";

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '../src/contexts/AuthContext';
import { TooltipProvider } from '../src/components/ui/tooltip';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { Toaster } from '../src/components/ui/toaster';
import { Toaster as Sonner } from '../src/components/ui/sonner';
import { useStore } from '../src/store/useStore';

// Global Layout Components
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import CartSidebar from '../src/components/CartSidebar';
import FloatingWhatsApp from '../src/components/FloatingWhatsApp';
import MobileBottomNav from '../src/components/MobileBottomNav';
import FloatingProductCard from '../src/components/FloatingProductCard';
import ShinobiToast from '../src/components/ShinobiToast';
import LottieOverlay from '../src/components/LottieOverlay';
import Preloader from '../src/components/Preloader';
import ScrollToTop from '../src/components/ScrollToTop';

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthPage = pathname === '/auth';
  const isProfilePage = pathname === '/profile';
  const isOrderDetailPage = pathname.startsWith('/order-detail/');
  const isAquaSoft = pathname === '/aqua-soft';

  const [preloaderComplete, setPreloaderComplete] = useState(false);
  const [skipPreloader, setSkipPreloader] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSkipPreloader(sessionStorage.getItem('preloader_done') === 'true');
    }
  }, []);

  return (
    <>
      {!preloaderComplete && !skipPreloader && (
        <Preloader onComplete={() => setPreloaderComplete(true)} />
      )}
      <div 
        className="min-h-screen bg-background pb-20 md:pb-0"
        style={{
          opacity: (preloaderComplete || skipPreloader) ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          visibility: (preloaderComplete || skipPreloader) ? 'visible' : 'hidden'
        }}
      >
        <ScrollToTop />
        {!isAuthPage && !isProfilePage && !isOrderDetailPage && <Header isAdminRoute={isAdminRoute} />}
        {children}
        {!isAuthPage && !isProfilePage && !isOrderDetailPage && !isAdminRoute && !isAquaSoft && <Footer />}
        {!isAuthPage && !isProfilePage && !isOrderDetailPage && !isAdminRoute && <CartSidebar />}
        {!isAuthPage && !isProfilePage && !isOrderDetailPage && !isAdminRoute && <FloatingWhatsApp />}
        {!isAdminRoute && <MobileBottomNav />}
        <ShinobiToast />
        <LottieOverlay />
        <FloatingProductCard />
      </div>
    </>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    // Trigger Zustand store manual rehydration on client mount
    useStore.persist.rehydrate();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
