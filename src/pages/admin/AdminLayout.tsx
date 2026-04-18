import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings,
  Menu, X, LogOut, Tags, Star, Image, MessageCircle, Ticket, Layers,
  TrendingUp, Instagram, ChevronDown, ChevronRight, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navSections = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Catalog',
    items: [
      { name: 'Products', href: '/admin/products', icon: Package },
      { name: 'Categories', href: '/admin/categories', icon: Layers },
    ]
  },
  {
    label: 'Sales',
    items: [
      { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { name: 'Customers', href: '/admin/customers', icon: Users },
      { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
    ]
  },
  {
    label: 'Insights',
    items: [
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { name: 'Best Sellers', href: '/admin/bestsellers', icon: TrendingUp },
    ]
  },
  {
    label: 'Content',
    items: [
      { name: 'Hero Slides', href: '/admin/hero', icon: Image },
      { name: 'Instagram', href: '/admin/instagram-posts', icon: Instagram },
      { name: 'Testimonials', href: '/admin/testimonials', icon: MessageCircle },
    ]
  },
  {
    label: 'System',
    items: [
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ]
  },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate('/auth');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(href);
  };

  const currentPageName = navSections
    .flatMap(s => s.items)
    .find(item => isActive(item.href))?.name || 'Admin';

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-surface-page)', fontFamily: 'var(--font-inter)' }}>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 248, background: 'var(--color-admin-sidebar-bg)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg flex items-center justify-center overflow-hidden bg-white/10">
              <img src="/logo/favicon icon.png" alt="Logo" className="h-5 w-auto object-contain" />
            </div>
            <div>
              <p className="text-[13px] font-[600] text-white leading-none">Megadiscount</p>
              <p className="text-[10px] text-white/40 mt-0.5">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden size-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navSections.map((section) => (
            <div key={section.label} className="mb-2">
              <p className="px-2 py-1.5 text-[9px] font-[700] uppercase tracking-[0.15em] text-white/30">
                {section.label}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-[13px] font-[500] transition-all duration-150 mb-0.5 ${
                      active
                        ? 'bg-[var(--color-brand-red)] text-white shadow-sm'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.07]'
                    }`}
                  >
                    <Icon size={15} className="shrink-0" style={{ opacity: active ? 1 : 0.8 }} />
                    <span>{item.name}</span>
                    {active && <ChevronRight size={12} className="ml-auto opacity-60" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5 px-2 py-2 mb-2 rounded-[8px]" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="size-8 rounded-full flex items-center justify-center shrink-0 text-white text-[13px] font-[700]"
              style={{ background: 'linear-gradient(135deg, var(--color-brand-red), #c01020)' }}>
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-[600] text-white truncate leading-none">
                {profile?.full_name || 'Admin User'}
              </p>
              <p className="text-[10px] text-white/40 truncate mt-0.5">
                {user?.email || 'admin@example.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 h-8 rounded-[7px] text-[12px] font-[500] text-white/50 hover:text-[#F87171] transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-h-screen max-lg:ml-0" style={{ marginLeft: 248 }}>

        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 h-[58px] shrink-0"
          style={{ background: 'var(--color-surface-card)', borderBottom: '1px solid var(--color-border-default)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center size-8 rounded-[7px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-page)] transition-colors"
            >
              <Menu size={18} />
            </button>
            <div>
              <span className="text-[15px] font-[600] text-[var(--color-text-primary)]">{currentPageName}</span>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[12px] font-[600] text-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-light)] px-3 h-8 rounded-[7px] transition-colors"
            style={{ border: '1.5px solid var(--color-brand-red)' }}
          >
            <ExternalLink size={12} />
            View Store
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
