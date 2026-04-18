import { useState } from 'react';
import { User, Phone, Mail, ChevronRight, AlertCircle } from 'lucide-react';
import { validateContactInfo } from '@/utils/validation';
import { cn } from '@/lib/utils';

interface ContactInfo { name: string; email: string; phone: string; }
interface Props {
  customerInfo: ContactInfo;
  setCustomerInfo: (info: ContactInfo) => void;
  onNext: () => void;
  errors?: string[];
}

const Field = ({
  id, label, icon: Icon, type = 'text', placeholder, value, onChange, hasError,
}: {
  id: string; label: string; icon: React.ElementType; type?: string;
  placeholder: string; value: string; onChange: (v: string) => void; hasError?: boolean;
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-[13px] font-[600] text-[var(--color-text-primary)] block">{label}</label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none">
        <Icon size={16} />
      </div>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn(
          'w-full h-12 pl-10 pr-4 rounded-[10px] border-[1.5px] text-[14px] font-[400] text-[var(--color-text-primary)] bg-white outline-none transition-all duration-200',
          'placeholder:text-[var(--color-text-muted)]',
          'hover:border-[var(--color-text-muted)] focus:border-[var(--color-brand-red)] focus:ring-2 focus:ring-[var(--color-brand-red)]/10',
          hasError ? 'border-[#E01E26] focus:border-[#E01E26] focus:ring-[#E01E26]/10' : 'border-[var(--color-border-default)]',
        )}
      />
    </div>
  </div>
);

const CheckoutContactInfo = ({ customerInfo, setCustomerInfo, onNext, errors }: Props) => {
  const [localErrors, setLocalErrors] = useState<string[]>([]);

  const handleNext = () => {
    const v = validateContactInfo(customerInfo);
    if (!v.isValid) { setLocalErrors(v.errors); return; }
    setLocalErrors([]);
    onNext();
  };

  const allErrors = [...localErrors, ...(errors || [])];

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      {/* Step title */}
      <div className="flex items-center gap-3 mb-8">
        <div className="size-10 rounded-full bg-[var(--color-brand-red)] flex items-center justify-center shadow-sm">
          <User size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-[20px] font-[700] text-[var(--color-text-primary)] leading-tight">Contact Information</h2>
          <p className="text-[13px] text-[var(--color-text-secondary)]">We'll use this to keep you updated on your order</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            id="name" label="Full Name *" icon={User} placeholder="John Doe"
            value={customerInfo.name}
            onChange={v => { setCustomerInfo({ ...customerInfo, name: v }); setLocalErrors([]); }}
            hasError={allErrors.some(e => e.toLowerCase().includes('name'))}
          />
          <Field
            id="phone" label="Phone Number *" icon={Phone} type="tel" placeholder="+91 98765 43210"
            value={customerInfo.phone}
            onChange={v => { setCustomerInfo({ ...customerInfo, phone: v }); setLocalErrors([]); }}
            hasError={allErrors.some(e => e.toLowerCase().includes('phone'))}
          />
        </div>
        <Field
          id="email" label="Email Address *" icon={Mail} type="email" placeholder="you@example.com"
          value={customerInfo.email}
          onChange={v => { setCustomerInfo({ ...customerInfo, email: v }); setLocalErrors([]); }}
          hasError={allErrors.some(e => e.toLowerCase().includes('email'))}
        />

        {allErrors.length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px]">
            <AlertCircle size={16} className="text-[#E01E26] mt-0.5 shrink-0" />
            <ul className="space-y-1">
              {allErrors.map((e, i) => <li key={i} className="text-[13px] text-[#E01E26] font-[500]">{e}</li>)}
            </ul>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-[var(--color-border-default)]/50">
          <button
            onClick={handleNext}
            className="group flex items-center gap-2 bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] text-white font-[600] text-[14px] px-8 h-12 rounded-[10px] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Continue to Shipping
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutContactInfo;
