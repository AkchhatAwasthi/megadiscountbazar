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
        <div className="size-10 bg-[var(--blue-light)] rounded-full flex items-center justify-center text-[var(--blue-primary)]">
           <User size={20} />
        </div>
        <h2 className="text-[20px] md:text-[24px] font-[600] text-[#1A1A1A]">Contact Information</h2>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[13px] font-[600] text-[#1A1A1A]">
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
                  "h-12 border-[#E0E3E7] rounded-[8px] focus:ring-[var(--blue-primary)]/10 font-inter text-[14px]",
                  contactErrors.some(e => e.includes('name') || e.includes('Name')) && "border-[#E01E26] bg-[#E01E26]/5"
                )}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-[13px] font-[600] text-[#1A1A1A]">
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
                  "h-12 border-[#E0E3E7] rounded-[8px] focus:ring-[var(--blue-primary)]/10 font-inter text-[14px]",
                  contactErrors.some(e => e.includes('phone') || e.includes('Phone')) && "border-[#E01E26] bg-[#E01E26]/5"
                )}
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[13px] font-[600] text-[#1A1A1A]">
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
                "h-12 border-[#E0E3E7] rounded-[10px] focus:ring-[var(--blue-primary)]/10 font-inter text-[14px]",
                contactErrors.some(e => e.includes('email') || e.includes('Email')) && "border-[#E01E26] bg-[#E01E26]/5"
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
            className="group bg-[var(--blue-primary)] hover:bg-[var(--blue-deep)] text-white font-[500] text-[14px] px-10 h-14 rounded-[8px] transition-all active:scale-[0.98] shadow-md"
          >
            Continue to Shipping
            <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutContactInfo;