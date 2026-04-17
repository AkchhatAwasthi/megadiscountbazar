import { useState } from 'react';
import { User, Phone, Mail, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateContactInfo } from '@/utils/validation';
import { cn } from '@/lib/utils';

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

interface CheckoutContactInfoProps {
  customerInfo: ContactInfo;
  setCustomerInfo: (info: ContactInfo) => void;
  onNext: () => void;
  errors?: string[];
}

const CheckoutContactInfo = ({ customerInfo, setCustomerInfo, onNext, errors }: CheckoutContactInfoProps) => {
  const [contactErrors, setContactErrors] = useState<string[]>([]);

  const handleNext = () => {
    const validation = validateContactInfo(customerInfo);
    if (!validation.isValid) {
      setContactErrors(validation.errors);
      return;
    }
    setContactErrors([]);
    onNext();
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="size-10 bg-[var(--color-brand-red-light)] rounded-full flex items-center justify-center text-[var(--color-brand-red)] shadow-sm">
           <User size={20} />
        </div>
        <h2 className="text-[20px] md:text-[24px] font-[700] text-[var(--color-text-primary)] tracking-tight">Contact Information</h2>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[13px] font-[600] text-[#4A4E54] tracking-wide mb-1 block">
              Full Name *
            </Label>
            <div className="relative group">
              <Input
                id="name"
                type="text"
                placeholder="Ex. John Doe"
                value={customerInfo.name}
                onChange={(e) => {
                  setCustomerInfo({ ...customerInfo, name: e.target.value });
                  if (contactErrors.length > 0) setContactErrors([]);
                }}
                className={cn(
                  "h-[48px] px-4 border-[1.5px] border-[var(--color-border-default)] rounded-[10px] focus:border-[var(--color-brand-red)] focus:ring-[4px] focus:ring-[var(--color-brand-red)]/10 hover:border-[#CBD5E1] outline-none text-[var(--color-text-primary)] font-medium text-[14px] transition-all duration-300 shadow-sm w-full",
                  contactErrors.some(e => e.includes('name') || e.includes('Name')) && "border-[#E01E26] focus:border-[#E01E26] focus:ring-[#E01E26]/10"
                )}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-[13px] font-[600] text-[#4A4E54] tracking-wide mb-1 block">
              Phone Number *
            </Label>
            <div className="relative group">
              <Input
                id="phone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={customerInfo.phone}
                onChange={(e) => {
                  setCustomerInfo({ ...customerInfo, phone: e.target.value });
                  if (contactErrors.length > 0) setContactErrors([]);
                }}
                className={cn(
                  "h-[48px] px-4 border-[1.5px] border-[var(--color-border-default)] rounded-[10px] focus:border-[var(--color-brand-red)] focus:ring-[4px] focus:ring-[var(--color-brand-red)]/10 hover:border-[#CBD5E1] outline-none text-[var(--color-text-primary)] font-medium text-[14px] transition-all duration-300 shadow-sm w-full",
                  contactErrors.some(e => e.includes('phone') || e.includes('Phone')) && "border-[#E01E26] focus:border-[#E01E26] focus:ring-[#E01E26]/10"
                )}
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[13px] font-[600] text-[#4A4E54] tracking-wide mb-1 block">
            Email Address *
          </Label>
          <div className="relative group">
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={customerInfo.email}
              onChange={(e) => {
                setCustomerInfo({ ...customerInfo, email: e.target.value });
                if (contactErrors.length > 0) setContactErrors([]);
              }}
              className={cn(
                "h-[48px] px-4 border-[1.5px] border-[var(--color-border-default)] rounded-[10px] focus:border-[var(--color-brand-red)] focus:ring-[4px] focus:ring-[var(--color-brand-red)]/10 hover:border-[#CBD5E1] outline-none text-[var(--color-text-primary)] font-medium text-[14px] transition-all duration-300 shadow-sm w-full",
                contactErrors.some(e => e.includes('email') || e.includes('Email')) && "border-[#E01E26] focus:border-[#E01E26] focus:ring-[#E01E26]/10"
              )}
              required
            />
          </div>
        </div>

        {/* Validation Errors */}
        {(contactErrors.length > 0 || (errors && errors.length > 0)) && (
          <div className="bg-[#E01E26]/5 border border-[#E01E26]/20 p-4 rounded-[8px]">
            <ul className="text-[#E01E26] text-[12px] font-[600] space-y-1">
              {[...contactErrors, ...(errors || [])].map((error, index) => (
                <li key={index} className="flex items-center gap-2">
                   <span className="size-1 bg-[#E01E26] rounded-full"></span>
                   {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end pt-6">
          <Button
            onClick={handleNext}
            className="group bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] text-white font-[600] text-[15px] px-10 h-[52px] rounded-[10px] transition-all duration-300 hover:shadow-[0_8px_20px_rgba(0,113,220,0.24)] hover:-translate-y-[2px] active:scale-[0.98]"
          >
            Continue to Shipping
            <ChevronRight size={18} className="ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutContactInfo;
