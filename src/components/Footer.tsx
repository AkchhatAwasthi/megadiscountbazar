import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Send } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

const Footer = () => {
  const { settings } = useSettings();

  const contactInfo = {
    phone: settings?.store_phone || '+91 9996616153',
    email: settings?.store_email || 'contact@supersweets.fit',
    address: settings?.store_address || 'Shop number 5, Patel Nagar, Jind, Haryana',
    storeName: settings?.store_name || 'Megadiscountstore'
  };

  return (
    <footer className="w-full bg-[var(--surface-white)] border-t border-[var(--border-default)] pt-[64px] pb-[32px]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-[64px]">
          
          {/* Logo & About (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <h3 className="text-[24px] font-[600] text-[var(--blue-primary)] tracking-tighter mb-4 uppercase">
              {contactInfo.storeName}
            </h3>
            <p className="text-[14px] text-[#5F6368] leading-[1.65] mb-8 max-w-sm">
                Your premier destination for high-quality electronics, fashion, and home essentials. Experience the premium hypermarket service directly at your doorstep.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, idx) => (
                <a 
                    key={idx} 
                    href="#" 
                    className="size-[36px] flex items-center justify-center border-[1.5px] border-[#E0E3E7] text-[#5F6368] rounded-[8px] transition-all hover:bg-[var(--blue-light)] hover:text-[var(--blue-primary)] hover:border-[var(--blue-primary)]"
                >
                  <Icon className="size-[18px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links (2 cols per group) */}
          <div className="lg:col-span-2">
            <h4 className="text-[14px] font-[600] text-[#1A1A1A] uppercase tracking-[0.05em] mb-6">Shop</h4>
            <ul className="flex flex-col gap-3">
              {['All Products', 'Groceries', 'Electronics', 'Fashion', 'Home & Living'].map((item) => (
                <li key={item}>
                  <Link to="/products" className="text-[14px] text-[#5F6368] hover:text-[var(--blue-primary)] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[14px] font-[600] text-[#1A1A1A] uppercase tracking-[0.05em] mb-6">Company</h4>
            <ul className="flex flex-col gap-3">
              {['About Us', 'Sustainability', 'Carreers', 'Press', 'Investors'].map((item) => (
                <li key={item}>
                  <Link to="/about" className="text-[14px] text-[#5F6368] hover:text-[var(--blue-primary)] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter (4 cols) */}
          <div className="lg:col-span-4">
            <h4 className="text-[14px] font-[600] text-[#1A1A1A] uppercase tracking-[0.05em] mb-6">Join our Newsletter</h4>
            <p className="text-[14px] text-[#5F6368] mb-6 leading-[1.5]">
                Get the latest drops, exclusive deals and market updates delivered to your inbox.
            </p>
            <div className="relative group">
                <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-[var(--surface-light)] border border-[var(--border-default)] rounded-[8px] text-[14px] focus:outline-none focus:border-[var(--blue-primary)] transition-all"
                />
                <button className="absolute right-2 top-1.5 size-[36px] bg-[var(--blue-primary)] text-white rounded-[6px] flex items-center justify-center transition-all hover:bg-[var(--blue-deep)]">
                    <Send className="size-[16px]" />
                </button>
            </div>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-t border-b border-[var(--border-default)] mb-8">
            <div className="flex items-start gap-4">
                <div className="size-[40px] bg-[var(--surface-light)] rounded-full flex items-center justify-center text-[var(--blue-primary)]">
                    <Phone className="size-[20px]" />
                </div>
                <div>
                    <h5 className="text-[13px] font-[600] text-[#1A1A1A]">Call Us</h5>
                    <p className="text-[13px] text-[#5F6368]">{contactInfo.phone}</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="size-[40px] bg-[var(--surface-light)] rounded-full flex items-center justify-center text-[var(--blue-primary)]">
                    <Mail className="size-[20px]" />
                </div>
                <div>
                    <h5 className="text-[13px] font-[600] text-[#1A1A1A]">Email Us</h5>
                    <p className="text-[13px] text-[#5F6368]">{contactInfo.email}</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="size-[40px] bg-[var(--surface-light)] rounded-full flex items-center justify-center text-[var(--blue-primary)]">
                    <MapPin className="size-[20px]" />
                </div>
                <div>
                    <h5 className="text-[13px] font-[600] text-[#1A1A1A]">Visit Us</h5>
                    <p className="text-[13px] text-[#5F6368]">{contactInfo.address}</p>
                </div>
            </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[13px] text-[#9AA0A6] font-[400]">
                © {new Date().getFullYear()} {contactInfo.storeName}. All rights reserved. | 100% Secure Checkout
            </p>
            <div className="flex items-center gap-8">
                {['Privacy Policy', 'Terms of Use', 'Returns'].map((item) => (
                    <Link key={item} to="#" className="text-[13px] font-[500] text-[#5F6368] hover:text-[var(--blue-primary)]">
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