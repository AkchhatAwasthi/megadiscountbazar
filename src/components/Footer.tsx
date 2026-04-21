import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Send } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

const Footer = () => {
  const { settings } = useSettings();

  const contactInfo = {
    phone: '9839511015',
    email: 'megadiscountbazar18@gmail.com',
    address: 'Tripathi Katra, Madwa, Lamahi, Varanasi, in front of Gautam Garden Marriage Lawn, PIN Code 221007',
    storeName: settings?.store_name || 'Megadiscountstore'
  };

  return (
    <footer className="w-full bg-[var(--color-surface-card)] border-t border-[var(--color-border-default)] pt-[64px] pb-[32px]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-[64px]">
          
          {/* Logo & About (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <h3 className="text-[24px] font-[600] text-[var(--color-brand-red)] tracking-tighter mb-4 uppercase">
              {contactInfo.storeName}
            </h3>
            <p className="text-[14px] text-[var(--color-text-secondary)] leading-[1.65] mb-8 max-w-sm">
                Your premier destination for high-quality electronics, fashion, and home essentials. Experience the premium hypermarket service directly at your doorstep.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, idx) => (
                <a 
                    key={idx} 
                    href="#" 
                    className="size-[36px] flex items-center justify-center border-[1.5px] border-[var(--color-border-default)] text-[var(--color-text-secondary)] rounded-[8px] transition-all hover:bg-[var(--color-brand-red-light)] hover:text-[var(--color-brand-red)] hover:border-[var(--color-brand-red)]"
                >
                  <Icon className="size-[18px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links (2 cols per group) */}
          <div className="lg:col-span-2">
            <h4 className="text-[14px] font-[600] text-[var(--color-text-primary)] uppercase tracking-[0.05em] mb-6">Shop</h4>
            <ul className="flex flex-col gap-3">
              {['All Products', 'Groceries', 'Electronics', 'Fashion', 'Home & Living'].map((item) => (
                <li key={item}>
                  <Link to="/products" className="text-[14px] text-[var(--color-text-secondary)] hover:text-[var(--color-brand-red)] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[14px] font-[600] text-[var(--color-text-primary)] uppercase tracking-[0.05em] mb-6">Company</h4>
            <ul className="flex flex-col gap-3">
              {['About Us', 'Sustainability', 'Carreers', 'Press', 'Investors'].map((item) => (
                <li key={item}>
                  <Link to="/about" className="text-[14px] text-[var(--color-text-secondary)] hover:text-[var(--color-brand-red)] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter (4 cols) */}
          <div className="lg:col-span-4">
            <h4 className="text-[14px] font-[600] text-[var(--color-text-primary)] uppercase tracking-[0.05em] mb-6">Join our Newsletter</h4>
            <p className="text-[14px] text-[var(--color-text-secondary)] mb-6 leading-[1.5]">
                Get the latest drops, exclusive deals and market updates delivered to your inbox.
            </p>
            <div className="relative group">
                <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-[var(--color-surface-page)] border border-[var(--color-border-default)] rounded-[8px] text-[14px] focus:outline-none focus:border-[var(--color-brand-red)] transition-all"
                />
                <button className="absolute right-2 top-1.5 size-[36px] bg-[var(--color-brand-red)] text-white rounded-[6px] flex items-center justify-center transition-all hover:bg-[var(--color-brand-red-deep)]">
                    <Send className="size-[16px]" />
                </button>
            </div>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-t border-b border-[var(--color-border-default)] mb-8">
            <div className="flex items-start gap-4">
                <div className="size-[40px] bg-[var(--color-surface-page)] rounded-full flex items-center justify-center text-[var(--color-brand-red)]">
                    <Phone className="size-[20px]" />
                </div>
                <div>
                    <h5 className="text-[13px] font-[600] text-[var(--color-text-primary)]">Call Us</h5>
                    <p className="text-[13px] text-[var(--color-text-secondary)]">{contactInfo.phone}</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="size-[40px] bg-[var(--color-surface-page)] rounded-full flex items-center justify-center text-[var(--color-brand-red)]">
                    <Mail className="size-[20px]" />
                </div>
                <div>
                    <h5 className="text-[13px] font-[600] text-[var(--color-text-primary)]">Email Us</h5>
                    <p className="text-[13px] text-[var(--color-text-secondary)]">{contactInfo.email}</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="size-[40px] bg-[var(--color-surface-page)] rounded-full flex items-center justify-center text-[var(--color-brand-red)]">
                    <MapPin className="size-[20px]" />
                </div>
                <div>
                    <h5 className="text-[13px] font-[600] text-[var(--color-text-primary)]">Visit Us</h5>
                    <p className="text-[13px] text-[var(--color-text-secondary)]">{contactInfo.address}</p>
                </div>
            </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[13px] text-[var(--color-text-muted)] font-[400]">
                © {new Date().getFullYear()} {contactInfo.storeName}. All rights reserved. | 100% Secure Checkout
            </p>
            <div className="flex items-center gap-8">
                {['Privacy Policy', 'Terms of Use', 'Returns'].map((item) => (
                    <Link key={item} to="#" className="text-[13px] font-[500] text-[var(--color-text-secondary)] hover:text-[var(--color-brand-red)]">
                        {item}
                    </Link>
                ))}
            </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
