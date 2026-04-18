import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step { id: string; title: string; description?: string; }
interface StepperProps { steps: Step[]; currentStep: number; className?: string; }

const Stepper = ({ steps, currentStep, className }: StepperProps) => (
  <div className={cn('w-full', className)}>
    <div className="flex items-center">
      {steps.map((step, index) => {
        const num = index + 1;
        const isActive = num === currentStep;
        const isCompleted = num < currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center shrink-0">
              {/* Circle */}
              <div className={cn(
                'size-9 rounded-full border-2 flex items-center justify-center transition-all duration-200 font-[700] text-[14px]',
                isCompleted
                  ? 'bg-[var(--color-brand-red)] border-[var(--color-brand-red)] text-white'
                  : isActive
                    ? 'bg-white border-[var(--color-brand-red)] text-[var(--color-brand-red)] shadow-[0_0_0_4px_rgba(224,30,38,0.12)]'
                    : 'bg-white border-[var(--color-border-default)] text-[var(--color-text-muted)]'
              )}>
                {isCompleted ? <Check size={16} strokeWidth={3} /> : num}
              </div>

              {/* Label */}
              <div className="text-center mt-2">
                <p className={cn(
                  'text-[12px] font-[700] whitespace-nowrap transition-colors duration-200',
                  isCompleted || isActive ? 'text-[var(--color-brand-red)]' : 'text-[var(--color-text-muted)]'
                )}>
                  {step.title}
                </p>
                {step.description && (
                  <p className={cn(
                    'text-[11px] transition-colors duration-200 hidden sm:block',
                    isActive ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-muted)]'
                  )}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connector */}
            {!isLast && (
              <div className={cn(
                'flex-1 h-[2px] mx-3 mb-6 rounded-full transition-all duration-300',
                num < currentStep ? 'bg-[var(--color-brand-red)]' : 'bg-[var(--color-border-default)]'
              )} />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export default Stepper;
