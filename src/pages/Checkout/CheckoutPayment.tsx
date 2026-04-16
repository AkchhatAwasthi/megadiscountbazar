import { CreditCard, Check, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { validatePaymentMethod } from '@/utils/validation';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/settingsHelpers';

interface CheckoutPaymentProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  settings: any;
  total: number;
  onNext: () => void;
  onPrev: () => void;
}

const CheckoutPayment = ({
  paymentMethod,
  setPaymentMethod,
  settings,
  total,
  onNext,
  onPrev
}: CheckoutPaymentProps) => {
  const handleNext = () => {
    const paymentValidation = validatePaymentMethod(paymentMethod, total, settings);
    if (!paymentValidation.isValid) return;
    onNext();
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="size-10 bg-[var(--blue-light)] rounded-full flex items-center justify-center text-[var(--blue-primary)]">
           <CreditCard size={20} />
        </div>
        <h2 className="text-[20px] md:text-[24px] font-[600] text-[#1A1A1A]">Payment Method</h2>
      </div>

      <div className="space-y-6">
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
          
          {/* Online Payment */}
          {settings.razorpay_enabled && (
             <div 
               onClick={() => setPaymentMethod('online')}
               className={cn(
                  "p-5 rounded-[12px] border-[1.5px] cursor-pointer transition-all",
                  paymentMethod === 'online' 
                    ? "border-[var(--blue-primary)] bg-[var(--blue-light)]/20 shadow-sm" 
                    : "border-[#E0E3E7] hover:border-[var(--blue-primary)]/50"
               )}
             >
                <div className="flex items-start gap-4">
                   <div className="mt-1">
                      <RadioGroupItem value="online" id="online" className="text-[var(--blue-primary)] border-[var(--blue-primary)]" />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                         <Label htmlFor="online" className="cursor-pointer text-[16px] font-[600] text-[#1A1A1A]">Pay Securely Online</Label>
                         <div className="flex gap-2 opacity-60">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="" className="h-3" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="" className="h-4" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="" className="h-4" />
                         </div>
                      </div>
                      <p className="text-[13px] text-[#5F6368] leading-relaxed">
                         Pay via Debit/Credit Card, UPI, NetBanking or popular Wallets. Safe & Secure processing.
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] font-[700] text-[#008A00] uppercase tracking-wider mt-3">
                         <ShieldCheck size={14} />
                         Secure Encryption Active
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* Cash on Delivery */}
          {settings.cod_enabled && total <= Number(settings.cod_threshold) && (
             <div 
               onClick={() => setPaymentMethod('cod')}
               className={cn(
                  "p-5 rounded-[12px] border-[1.5px] cursor-pointer transition-all",
                  paymentMethod === 'cod' 
                    ? "border-[var(--blue-primary)] bg-[var(--blue-light)]/20 shadow-sm" 
                    : "border-[#E0E3E7] hover:border-[var(--blue-primary)]/50"
               )}
             >
                <div className="flex items-start gap-4">
                   <div className="mt-1">
                      <RadioGroupItem value="cod" id="cod" className="text-[var(--blue-primary)] border-[var(--blue-primary)]" />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                         <Label htmlFor="cod" className="cursor-pointer text-[16px] font-[600] text-[#1A1A1A]">Cash on Delivery (COD)</Label>
                         {Number(settings.cod_charge) > 0 && (
                            <span className="text-[11px] font-[700] text-[var(--blue-primary)] bg-[var(--blue-light)] px-2 py-1 rounded-full uppercase">
                               + {formatCurrency(settings.cod_charge, settings.currency_symbol)} Fee
                            </span>
                         )}
                      </div>
                      <p className="text-[13px] text-[#5F6368] leading-relaxed">
                         Pay with cash when your items are delivered to your doorstep.
                      </p>
                   </div>
                </div>
             </div>
          )}

          {/* COD Unavailable */}
          {settings.cod_enabled && total > Number(settings.cod_threshold) && (
             <div className="p-4 bg-[#F6F7F8] rounded-[12px] border border-dashed border-[#E0E3E7]">
                <p className="text-[12px] text-[#5F6368] text-center font-[500]">
                   Cash on Delivery is not available for orders above {formatCurrency(settings.cod_threshold, settings.currency_symbol)}.
                </p>
             </div>
          )}

        </RadioGroup>

        <div className="flex items-center justify-between pt-8 border-t border-[#F6F7F8] mt-10">
           <button 
             onClick={onPrev}
             className="text-[#5F6368] hover:text-[#1A1A1A] text-[14px] font-[600] flex items-center gap-2 transition-colors"
           >
              <ChevronLeft size={18} />
              Back to Shipping
           </button>
           <Button
             onClick={handleNext}
             className="group bg-[var(--blue-primary)] hover:bg-[var(--blue-deep)] text-white font-[500] text-[14px] px-10 h-14 rounded-[8px] transition-all active:scale-[0.98] shadow-md"
           >
             Review Order
             <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
           </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPayment;