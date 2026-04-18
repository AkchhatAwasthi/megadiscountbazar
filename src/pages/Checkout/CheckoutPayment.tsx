import { CreditCard, ChevronLeft, ChevronRight, ShieldCheck, Banknote, Zap } from 'lucide-react';
import { validatePaymentMethod } from '@/utils/validation';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/settingsHelpers';

interface Props {
  paymentMethod: string;
  setPaymentMethod: (m: string) => void;
  settings: any;
  total: number;
  onNext: () => void;
  onPrev: () => void;
}

const CheckoutPayment = ({ paymentMethod, setPaymentMethod, settings, total, onNext, onPrev }: Props) => {
  const handleNext = () => {
    const v = validatePaymentMethod(paymentMethod, total, settings);
    if (!v.isValid) return;
    onNext();
  };

  const codAllowed = settings.cod_enabled && total <= Number(settings.cod_threshold);

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      {/* Step title */}
      <div className="flex items-center gap-3 mb-8">
        <div className="size-10 rounded-full bg-[var(--color-brand-red)] flex items-center justify-center shadow-sm">
          <CreditCard size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-[20px] font-[700] text-[var(--color-text-primary)] leading-tight">Payment Method</h2>
          <p className="text-[13px] text-[var(--color-text-secondary)]">Choose how you'd like to pay</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Online payment */}
        {settings.razorpay_enabled && (
          <button
            onClick={() => setPaymentMethod('online')}
            className={cn(
              'w-full p-5 rounded-[14px] border-[1.5px] text-left transition-all duration-200 group',
              paymentMethod === 'online'
                ? 'border-[var(--color-brand-red)] bg-[var(--color-brand-red-light)]/30 shadow-sm ring-1 ring-[var(--color-brand-red)]/20'
                : 'border-[var(--color-border-default)] hover:border-[var(--color-brand-red)]/50 hover:bg-[var(--color-surface-page)]'
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                'size-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                paymentMethod === 'online' ? 'border-[var(--color-brand-red)]' : 'border-[var(--color-border-default)]'
              )}>
                {paymentMethod === 'online' && <div className="size-2.5 bg-[var(--color-brand-red)] rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-[var(--color-brand-red)]" />
                    <span className="text-[15px] font-[700] text-[var(--color-text-primary)]">Pay Securely Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3.5 opacity-70" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 opacity-70" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-4 opacity-70" />
                  </div>
                </div>
                <p className="text-[13px] text-[var(--color-text-secondary)]">
                  Card, UPI, NetBanking, Wallets — processed instantly.
                </p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <ShieldCheck size={13} className="text-[#008A00]" />
                  <span className="text-[11px] font-[700] text-[#008A00] uppercase tracking-wide">256-bit Encrypted</span>
                </div>
              </div>
            </div>
          </button>
        )}

        {/* COD */}
        {codAllowed ? (
          <button
            onClick={() => setPaymentMethod('cod')}
            className={cn(
              'w-full p-5 rounded-[14px] border-[1.5px] text-left transition-all duration-200',
              paymentMethod === 'cod'
                ? 'border-[var(--color-brand-red)] bg-[var(--color-brand-red-light)]/30 shadow-sm ring-1 ring-[var(--color-brand-red)]/20'
                : 'border-[var(--color-border-default)] hover:border-[var(--color-brand-red)]/50 hover:bg-[var(--color-surface-page)]'
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                'size-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                paymentMethod === 'cod' ? 'border-[var(--color-brand-red)]' : 'border-[var(--color-border-default)]'
              )}>
                {paymentMethod === 'cod' && <div className="size-2.5 bg-[var(--color-brand-red)] rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Banknote size={16} className="text-[var(--color-brand-red)]" />
                    <span className="text-[15px] font-[700] text-[var(--color-text-primary)]">Cash on Delivery</span>
                  </div>
                  {Number(settings.cod_charge) > 0 && (
                    <span className="text-[11px] font-[700] text-[var(--color-brand-red)] bg-[var(--color-brand-red-light)] px-2.5 py-1 rounded-full uppercase">
                      +{formatCurrency(settings.cod_charge, settings.currency_symbol)} fee
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-[var(--color-text-secondary)]">
                  Pay with cash when your order arrives at your door.
                </p>
              </div>
            </div>
          </button>
        ) : settings.cod_enabled && (
          <div className="p-4 rounded-[12px] bg-[var(--color-surface-page)] border border-dashed border-[var(--color-border-default)] text-center">
            <p className="text-[13px] text-[var(--color-text-secondary)]">
              COD unavailable for orders above {formatCurrency(settings.cod_threshold, settings.currency_symbol)}.
            </p>
          </div>
        )}

        {/* Security badges */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { label: 'SSL Secure', sub: 'End-to-end encrypted' },
            { label: 'PCI DSS', sub: 'Payment compliant' },
            { label: 'Razorpay', sub: 'Powered by' },
          ].map(b => (
            <div key={b.label} className="flex flex-col items-center p-3 rounded-[10px] bg-[var(--color-surface-page)] border border-[var(--color-border-default)] text-center">
              <span className="text-[12px] font-[700] text-[var(--color-text-primary)]">{b.label}</span>
              <span className="text-[11px] text-[var(--color-text-secondary)]">{b.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--color-border-default)]/50">
        <button onClick={onPrev} className="flex items-center gap-2 text-[14px] font-[600] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={handleNext}
          className="group flex items-center gap-2 bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] text-white font-[600] text-[14px] px-8 h-12 rounded-[10px] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
        >
          Review Order
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default CheckoutPayment;
