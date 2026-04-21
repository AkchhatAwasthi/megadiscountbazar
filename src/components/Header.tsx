import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, X, ChevronDown, ChevronRight, LogOut, Search, Heart, ShoppingBag, Menu } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/utils/currency';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SearchSidebar from './SearchSidebar';
import { useSettings } from '../hooks/useSettings';
import { supabase } from '@/integrations/supabase/client';

interface HeaderProps {
  isAdminRoute?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAdminRoute = false }) => {
  const navigate = useNavigate();
  const { cartItems, toggleCart } = useStore();
  const { user, signOut, isAdmin } = useAuth();
  const { settings } = useSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchNavigationData();
  }, []);

  const fetchNavigationData = async () => {
    try {
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (catData) setCategories(catData);
    } catch (error) {
      console.error("Error fetching nav data:", error);
    }
  };

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (isAdminRoute) return null;

  const NavLink = ({ to, children, className = "" }: { to: string; children: React.ReactNode; className?: string }) => (
    <Link
      to={to}
      className={`text-[14px] font-[400] text-white hover:text-white/80 transition-colors relative group py-2 ${className}`}
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-white transition-all duration-200 group-hover:w-full"></span>
    </Link>
  );

  return (
    <>
      {/* Top Banner - Dynamic Marquee */}
      <div className="bg-white text-[var(--color-brand-red-deep)] text-[12px] py-1.5 overflow-hidden relative font-[500] tracking-[0.02em]">
        <div className="whitespace-nowrap animate-marquee inline-block">
          <span className="mx-8">Free shipping on orders over ₹{settings.free_delivery_threshold} • New summer collection is live! • Shop the best deals at {settings.store_name || 'Megadiscountstore'} • Fast delivery in under 60 minutes!</span>
          <span className="mx-8">Free shipping on orders over ₹{settings.free_delivery_threshold} • New summer collection is live! • Shop the best deals at {settings.store_name || 'Megadiscountstore'} • Fast delivery in under 60 minutes!</span>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 bg-[var(--color-brand-red)] border-b border-[var(--color-brand-red-deep)] transition-transform duration-300 ease-in-out ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ height: '64px' }}
      >
        <div className="max-w-[1280px] mx-auto px-4 h-full flex items-center gap-6 lg:gap-10">
          
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 -ml-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <img src="https://res.cloudinary.com/dnxdgpe9c/image/upload/q_auto/f_auto/v1776801280/74b1d4a3-9fc2-4844-baae-7d978d626698_ucbosu.png" alt="Megadiscountstore" className="h-[40px] w-auto object-contain" />
            <span className="text-[24px] font-[600] text-white tracking-tight hidden sm:inline-block">
              Megadiscount<span className="text-white/90">store</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-[14px] font-[500] text-white hover:text-white/80 transition-colors focus:outline-none py-2">
                Category <ChevronDown className="w-4 h-4 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[var(--color-surface-card)] border border-[var(--color-border-default)] shadow-lg rounded-[8px] p-2 mt-1">
                {categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.id}
                    onClick={() => navigate(`/products?category=${encodeURIComponent(cat.slug || cat.name.toLowerCase())}`)}
                    className="px-3 py-2 text-[14px] text-[var(--color-text-primary)] hover:bg-[var(--color-brand-red-light)] hover:text-[var(--color-brand-red)] rounded-[6px] cursor-pointer transition-colors"
                  >
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <NavLink to="/products?collection=new-arrivals">New Drops</NavLink>
            <NavLink to="/products?collection=bestsellers">Bestsellers</NavLink>
            <NavLink to="/aqua-soft">Aqua Soft</NavLink>
          </nav>

          {/* Search Bar */}
          <div className="flex-grow hidden md:flex items-center max-w-[600px] relative group">
            <div 
              className="w-full flex items-center bg-[var(--color-surface-page)] border-[1.5px] border-[var(--color-border-default)] rounded-[var(--radius-input)] px-4 py-2 transition-all duration-200 group-focus-within:border-[var(--color-brand-red)] group-focus-within:bg-white group-focus-within:shadow-sm cursor-text"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-4 h-4 text-[var(--color-text-muted)] mr-3" />
              <input
                type="text"
                placeholder="Search everything at Megadiscountstore"
                className="bg-transparent border-none outline-none w-full text-[14px] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] cursor-pointer"
                readOnly
              />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-1 lg:gap-3 ml-auto">
             <button
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:flex"
              onClick={() => navigate('/products?tag=favorites')}
              title="Favorites"
            >
              <Heart className="w-5 h-5" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 p-2 text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none">
                <User className="w-5 h-5" />
                <span className="hidden xl:inline text-[14px] font-[500] ml-1">
                  {user ? 'Account' : 'Sign In'}
                </span>
                <ChevronDown className="hidden xl:inline w-3 h-3 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[var(--color-surface-card)] border border-[var(--color-border-default)] shadow-lg rounded-[8px] p-2 mt-1">
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-[var(--color-border-default)] mb-1">
                      <p className="text-[12px] text-[var(--color-text-secondary)]">Signed in as</p>
                      <p className="text-[14px] font-[600] truncate">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="px-3 py-2 text-[14px] text-[var(--color-text-primary)] hover:bg-[var(--color-brand-red-light)] hover:text-[var(--color-brand-red)] rounded-[6px] cursor-pointer">
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="px-3 py-2 text-[14px] text-[var(--color-text-primary)] hover:bg-[var(--color-brand-red-light)] hover:text-[var(--color-brand-red)] rounded-[6px] cursor-pointer">
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut} className="px-3 py-2 text-[14px] text-[var(--red-sale)] hover:bg-red-50 rounded-[6px] cursor-pointer">
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => navigate('/auth')} className="bg-[var(--color-brand-red)] text-white hover:bg-[var(--color-brand-red-deep)] px-3 py-2.5 text-[14px] font-[500] rounded-[6px] cursor-pointer text-center justify-center">
                    Sign In or Create Account
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              className="relative p-2 bg-white text-[var(--color-brand-red)] hover:bg-white/90 rounded-lg transition-all duration-200 active:scale-95 flex items-center gap-2 px-3 sm:px-4"
              onClick={toggleCart}
            >
              <ShoppingBag className="w-5 h-5" />
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-[10px] opacity-90 font-[400]">Cart</span>
                <span className="text-[13px] font-[600]">{formatPrice(cartTotal)}</span>
              </div>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[var(--color-brand-yellow)] text-[var(--color-text-primary)] text-[11px] font-[600] min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-[var(--color-brand-red)] shadow-sm">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "tween", duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-[320px] bg-[var(--color-surface-card)] z-50 shadow-2xl flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b border-[var(--color-border-default)]">
                <div className="flex items-center gap-2">
                  <img src="https://res.cloudinary.com/dnxdgpe9c/image/upload/q_auto/f_auto/v1776801280/74b1d4a3-9fc2-4844-baae-7d978d626698_ucbosu.png" alt="Megadiscountstore" className="h-[32px] w-auto object-contain" />
                  <h2 className="text-[18px] font-[600] text-[var(--color-brand-red)]">Megadiscountstore</h2>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-page)] rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto py-2">
                <div className="px-4 py-3 bg-[var(--color-brand-red-light)] mb-4 mx-4 rounded-lg">
                  <p className="text-[14px] font-[500] text-[var(--color-brand-red-deep)]">Welcome!</p>
                  <p className="text-[12px] text-[var(--color-text-secondary)]">Shop our latest deals and drops.</p>
                </div>
                
                <p className="px-6 py-2 text-[11px] font-[600] text-[var(--color-text-muted)] uppercase tracking-wider">Navigation</p>
                <button onClick={() => { navigate('/products'); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-between px-6 py-3 hover:bg-[var(--color-surface-page)] transition-colors">
                  <span className="text-[15px] font-[400]">All Products</span>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </button>
                <button onClick={() => { navigate('/products?collection=new-arrivals'); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-between px-6 py-3 hover:bg-[var(--color-surface-page)] transition-colors">
                  <span className="text-[15px] font-[400]">New Arrivals</span>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </button>
                <button onClick={() => { navigate('/products?collection=bestsellers'); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-between px-6 py-3 hover:bg-[var(--color-surface-page)] transition-colors">
                  <span className="text-[15px] font-[400]">Bestsellers</span>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </button>
                <button onClick={() => { navigate('/aqua-soft'); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-between px-6 py-3 hover:bg-[#eef4fb] transition-colors">
                  <span className="text-[15px] font-[600] text-[#5F86D6]">Aqua Soft</span>
                  <ChevronRight className="w-4 h-4 opacity-60 text-[#5F86D6]" />
                </button>

                <div className="border-t border-[var(--color-border-default)] my-4"></div>
                
                <p className="px-6 py-2 text-[11px] font-[600] text-[var(--color-text-muted)] uppercase tracking-wider">Category</p>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { navigate(`/products?category=${encodeURIComponent(cat.slug || cat.name.toLowerCase())}`); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-between px-6 py-3 hover:bg-[var(--color-surface-page)] transition-colors text-left"
                  >
                    <span className="text-[15px] font-[400] capitalize">{cat.name}</span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </button>
                ))}
              </div>

              <div className="p-4 border-t border-[var(--color-border-default)] bg-[var(--color-surface-page)]">
                {user ? (
                  <div className="space-y-2">
                    <button onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-[14px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-card)] rounded-lg transition-colors">
                      <User className="w-4 h-4" /> Account Settings
                    </button>
                    <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-[14px] text-[var(--red-sale)] hover:bg-[var(--color-surface-card)] rounded-lg transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { navigate('/auth'); setIsMobileMenuOpen(false); }}
                    className="w-full bg-[var(--color-brand-red)] text-white py-3 rounded-[8px] font-[500] text-[14px] hover:bg-[var(--color-brand-red-deep)] transition-colors shadow-sm"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchSidebar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;

