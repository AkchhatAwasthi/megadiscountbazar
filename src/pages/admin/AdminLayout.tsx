import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Tags,
  Star,
  Image,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Tags },
    { name: 'Coupons', href: '/admin/coupons', icon: Tags },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Best Sellers', href: '/admin/bestsellers', icon: Star },
    { name: 'Instagram Posts', href: '/admin/instagram-posts', icon: Image },
    { name: 'Hero Slides', href: '/admin/hero', icon: Image },
    { name: 'Testimonials', href: '/admin/testimonials', icon: MessageCircle },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface-page)', fontFamily: "var(--font-inter)" }}>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
          className="lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 240,
        minHeight: '100vh',
        background: 'var(--color-admin-sidebar-bg)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        transition: 'transform 0.3s ease',
        transform: sidebarOpen ? 'translateX(0)' : undefined,
      }}
        className={`${sidebarOpen ? '' : 'max-lg:-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo area */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo/favicon icon.png" alt="Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-surface-card)', letterSpacing: '-0.01em' }}>
              Megadiscountstore
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: 4, borderRadius: 6 }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', paddingTop: 8, paddingBottom: 8 }}>
          <div style={{ padding: '16px 24px 6px', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
            Navigation
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 24px',
                  fontSize: 14,
                  fontWeight: active ? 500 : 400,
                  color: active ? 'var(--color-surface-card)' : '#CBD5E1',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  borderLeft: active ? '3px solid var(--color-brand-red)' : '3px solid transparent',
                  background: active ? 'rgba(0,113,220,0.18)' : 'transparent',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-surface-card)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = '#CBD5E1';
                  }
                }}
              >
                <Icon style={{ width: 18, height: 18, opacity: active ? 1 : 0.75, flexShrink: 0 }} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-brand-red), var(--color-brand-red-deep))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ color: 'var(--color-surface-card)', fontSize: 14, fontWeight: 500 }}>
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-surface-card)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.full_name || 'Admin User'}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(203,213,225,0.7)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || 'admin@example.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 0', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
              color: '#CBD5E1', fontSize: 12, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(231,64,64,0.15)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(231,64,64,0.4)';
              (e.currentTarget as HTMLElement).style.color = '#F87171';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)';
              (e.currentTarget as HTMLElement).style.color = '#CBD5E1';
            }}
          >
            <LogOut style={{ width: 14, height: 14 }} />
            Logout
          </button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 240, minHeight: '100vh' }} className="max-lg:ml-0">

        {/* Top bar */}
        <div style={{
          height: 60,
          background: 'var(--color-surface-card)',
          borderBottom: '1px solid var(--color-border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-secondary)', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center',
              }}
            >
              <Menu style={{ width: 20, height: 20 }} />
            </button>
            <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {navigation.find(n => isActive(n.href))?.name || 'Admin'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              to="/"
              style={{
                fontSize: 13, fontWeight: 500, color: 'var(--color-brand-red)',
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--color-brand-red)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--color-brand-red-light)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              ← Back to Store
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
