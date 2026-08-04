"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Grid2X2, ShoppingCart, User, X, Heart, LayoutGrid } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Category {
  name: string;
  icon?: string;
}

const categoryColors: Record<string, string> = {
  'Gifts & Gadgets':     '#1A3C6E',
  'Kitchen Accessories': '#B22222',
  'Toys':                '#3A7D3A',
  'Ladies Wear':         '#C2185B',
  'Beauty Products':     '#5B2D8E',
  'Grocery':             '#2E7D32',
  'Sports':              '#E65100',
  'Pharmacy':            '#0277BD',
};

const categoryEmojis: Record<string, string> = {
  'Gifts & Gadgets':     '🎁',
  'Kitchen Accessories': '🍳',
  'Toys':                '🧸',
  'Ladies Wear':         '👗',
  'Beauty Products':     '💄',
  'Grocery':             '🛒',
  'Sports':              '⚽',
  'Pharmacy':            '💊',
};

const MobileBottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname() || '';
  const cartItems = useStore((s) => s.cartItems);
  const toggleCart = useStore((s) => s.toggleCart);
  const { user } = useAuth();

  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const currentPath = pathname;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  // Fetch categories when sheet opens
  useEffect(() => {
    if (!categorySheetOpen) return;
    setLoadingCats(true);
    supabase
      .from('categories')
      .select('name')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        setCategories(data || []);
        setLoadingCats(false);
      });
  }, [categorySheetOpen]);

  const handleCategorySelect = (name: string) => {
    setCategorySheetOpen(false);
    router.push(`/products?category=${encodeURIComponent(name)}`);
  };

  const handleProductsTab = () => {
    setCategorySheetOpen(true);
  };

  interface TabItem {
    id: string;
    label: string;
    icon: any;
    active: boolean;
    onClick: () => void;
    isFab?: boolean;
    badge?: number;
  }

  const tabs: TabItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      active: isActive('/') && !isActive('/products') && !isActive('/cart') && !isActive('/profile') && !isActive('/auth'),
      onClick: () => router.push('/'),
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Grid2X2,
      active: categorySheetOpen,
      onClick: handleProductsTab,
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingCart,
      active: isActive('/cart'),
      onClick: () => toggleCart(),
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      active: isActive('/products') && currentPath.includes('favorites'),
      onClick: () => router.push('/products?tag=favorites'),
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      active: isActive('/profile') || isActive('/auth'),
      onClick: () => router.push(user ? '/profile' : '/auth'),
    },
  ];

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--color-border-default)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-center justify-around h-16 px-1 relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.88 }}
                onClick={tab.onClick}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative transition-all duration-200"
                id={`mobile-nav-${tab.id}`}
              >
                <span className="relative flex items-center justify-center">
                  <motion.span
                    animate={{ scale: tab.active ? [1, 1.18, 1] : 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Icon
                      size={20}
                      strokeWidth={tab.active ? 2.5 : 1.8}
                      style={{ color: tab.active ? 'var(--color-brand-red)' : '#6B7280' }}
                    />
                  </motion.span>
                  {tab.badge ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full text-[10px] font-[700] text-white flex items-center justify-center px-1 shadow-2xs"
                      style={{ background: 'var(--color-brand-red)' }}
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </motion.span>
                  ) : null}
                </span>

                <span
                  className={`relative text-[10px] leading-none mt-0.5 ${tab.active ? 'font-[700] text-[var(--color-brand-red)]' : 'font-[500] text-gray-500'}`}
                >
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Category Bottom Sheet */}
      <AnimatePresence>
        {categorySheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] md:hidden"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
              onClick={() => setCategorySheetOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-[70] md:hidden rounded-t-[24px] overflow-hidden"
              style={{
                background: 'var(--color-surface-card)',
                maxHeight: '80vh',
                paddingBottom: 'env(safe-area-inset-bottom, 12px)',
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-border-default)' }} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
                <div>
                  <h2 className="text-[17px] font-[700]" style={{ color: 'var(--color-text-primary)' }}>
                    Shop by Category
                  </h2>
                  <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    Select a category to browse
                  </p>
                </div>
                <button
                  onClick={() => setCategorySheetOpen(false)}
                  className="size-9 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: 'var(--color-surface-page)' }}
                >
                  <X size={18} style={{ color: 'var(--color-text-secondary)' }} />
                </button>
              </div>

              {/* Category Grid */}
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 100px)' }}>
                {loadingCats ? (
                  <div className="grid grid-cols-4 gap-x-3 gap-y-5 px-5 py-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div
                          className="size-14 rounded-full animate-pulse"
                          style={{ background: 'var(--color-surface-page)' }}
                        />
                        <div
                          className="h-2.5 w-10 rounded-full animate-pulse"
                          style={{ background: 'var(--color-surface-page)' }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-x-3 gap-y-5 px-5 pt-4 pb-8">
                    {/* All Products — always first */}
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={() => handleCategorySelect('All')}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div
                        className="size-[72px] rounded-full flex items-center justify-center text-2xl shadow-sm transition-transform duration-150 group-active:scale-90"
                        style={{
                          background: 'linear-gradient(135deg, #CC1B1B 0%, #8B0000 100%)',
                          boxShadow: '0 2px 8px rgba(204,27,27,0.30)',
                        }}
                      >
                        🛍️
                      </div>
                      <span
                        className="text-[11px] font-[600] leading-tight text-center w-full line-clamp-2"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        All
                      </span>
                    </motion.button>

                    {categories.map((cat) => {
                      const bg = categoryColors[cat.name] || 'var(--color-brand-red)';
                      const emoji = categoryEmojis[cat.name] || '📦';
                      return (
                        <motion.button
                          key={cat.name}
                          whileTap={{ scale: 0.93 }}
                          onClick={() => handleCategorySelect(cat.name)}
                          className="flex flex-col items-center gap-2 group"
                        >
                          {/* Small premium circle */}
                          <div
                            className="size-[72px] rounded-full flex items-center justify-center text-2xl transition-transform duration-150 group-active:scale-90"
                            style={{
                              background: `linear-gradient(135deg, ${bg}ee 0%, ${bg} 100%)`,
                              boxShadow: `0 2px 8px ${bg}44`,
                            }}
                          >
                            {emoji}
                          </div>
                          {/* Label */}
                          <span
                            className="text-[11px] font-[600] leading-tight text-center w-full line-clamp-2"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {cat.name}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileBottomNav;
