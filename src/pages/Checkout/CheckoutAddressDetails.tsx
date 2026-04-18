import { useState } from 'react';
import { validateAddressDetails } from '@/utils/validation';
import { formatCurrency } from '@/utils/settingsHelpers';
import { MapPin, Home, Briefcase, Globe, ChevronLeft, ChevronRight, Check, Truck, AlertCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressDetails {
  plotNumber: string; buildingName: string; street: string; landmark: string;
  city: string; state: string; pincode: string;
  addressType: 'home' | 'work' | 'other'; saveAs: string;
}
interface SavedAddress {
  id: string; name: string; address_line_1: string; address_line_2: string;
  city: string; state: string; pincode: string; landmark: string; type: string; is_default: boolean;
}
interface Props {
  addressDetails: AddressDetails; setAddressDetails: (d: AddressDetails) => void;
  savedAddresses: SavedAddress[]; selectedAddress: SavedAddress | null;
  setSelectedAddress: (a: SavedAddress | null) => void;
  useExistingAddress: boolean; setUseExistingAddress: (v: boolean) => void;
  showAddressForm: boolean; setShowAddressForm: (v: boolean) => void;
  settings: any; subtotal: number; currentUser: any;
  onNext: () => void; onPrev: () => void;
  estimatedDeliveryFee: number | null; setEstimatedDeliveryFee: (v: number | null) => void;
  estimatedDeliveryTime: string | null; setEstimatedDeliveryTime: (v: string | null) => void;
  cartItems: any[]; isPincodeServiceable: boolean; setIsPincodeServiceable: (v: boolean) => void;
}

const InputField = ({
  id, label, placeholder, value, onChange, required, maxLength, className,
}: {
  id: string; label: string; placeholder: string; value: string;
  onChange: (v: string) => void; required?: boolean; maxLength?: number; className?: string;
}) => (
  <div className={cn('space-y-1.5', className)}>
    <label htmlFor={id} className="text-[13px] font-[600] text-[var(--color-text-primary)] block">
      {label}{required && ' *'}
    </label>
    <input
      id={id} type="text" placeholder={placeholder} value={value} maxLength={maxLength}
      onChange={e => onChange(e.target.value)}
      className="w-full h-12 px-4 rounded-[10px] border-[1.5px] border-[var(--color-border-default)] text-[14px] text-[var(--color-text-primary)] bg-white outline-none placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)] focus:border-[var(--color-brand-red)] focus:ring-2 focus:ring-[var(--color-brand-red)]/10 transition-all duration-200"
    />
  </div>
);

const TypeIcon = ({ type }: { type: string }) =>
  type === 'home' ? <Home size={14} /> : type === 'work' ? <Briefcase size={14} /> : <Globe size={14} />;

const CheckoutAddressDetails = ({
  addressDetails, setAddressDetails, savedAddresses, selectedAddress, setSelectedAddress,
  useExistingAddress, setUseExistingAddress, showAddressForm, setShowAddressForm,
  settings, onNext, onPrev, estimatedDeliveryFee, estimatedDeliveryTime, currentUser,
}: Props) => {
  const [errors, setErrors] = useState<string[]>([]);

  const handleSavedSelect = (addr: SavedAddress) => {
    setSelectedAddress(addr);
    setUseExistingAddress(true);
    setAddressDetails({
      plotNumber: addr.address_line_1.split(',')[0] || '',
      buildingName: '',
      street: addr.address_line_2 || '',
      landmark: addr.landmark || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode,
      addressType: addr.type as 'home' | 'work' | 'other',
      saveAs: addr.type === 'other' ? addr.name : '',
    });
  };

  const handleNext = () => {
    if (!addressDetails.city || !addressDetails.state || !addressDetails.pincode) {
      setErrors(['Please fill in all required location fields.']); return;
    }
    if (!useExistingAddress) {
      const v = validateAddressDetails(addressDetails);
      if (!v.isValid) { setErrors(v.errors); return; }
    }
    setErrors([]);
    onNext();
  };

  const canProceed = useExistingAddress
    ? !!selectedAddress
    : !!(addressDetails.plotNumber && addressDetails.street && addressDetails.city && addressDetails.state && addressDetails.pincode);

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      {/* Step title */}
      <div className="flex items-center gap-3 mb-8">
        <div className="size-10 rounded-full bg-[var(--color-brand-red)] flex items-center justify-center shadow-sm">
          <MapPin size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-[20px] font-[700] text-[var(--color-text-primary)] leading-tight">Shipping Address</h2>
          <p className="text-[13px] text-[var(--color-text-secondary)]">Where should we deliver your order?</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Saved addresses */}
        {savedAddresses.length > 0 && !showAddressForm && !useExistingAddress && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-[700] text-[var(--color-text-secondary)] uppercase tracking-wider">Saved Addresses</p>
              <button
                onClick={() => setShowAddressForm(true)}
                className="text-[13px] font-[600] text-[var(--color-brand-red)] hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> New Address
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedAddresses.map(addr => (
                <button
                  key={addr.id}
                  onClick={() => handleSavedSelect(addr)}
                  className={cn(
                    'p-4 border-[1.5px] rounded-[12px] text-left transition-all duration-200',
                    selectedAddress?.id === addr.id
                      ? 'border-[var(--color-brand-red)] bg-[var(--color-brand-red-light)]/40 shadow-sm'
                      : 'border-[var(--color-border-default)] hover:border-[var(--color-brand-red)]/50 hover:bg-[var(--color-surface-page)]'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'size-7 rounded-full flex items-center justify-center border',
                        selectedAddress?.id === addr.id ? 'bg-[var(--color-brand-red)] text-white border-[var(--color-brand-red)]' : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)]'
                      )}>
                        <TypeIcon type={addr.type} />
                      </div>
                      <span className="text-[14px] font-[600] text-[var(--color-text-primary)] capitalize">{addr.name}</span>
                      {addr.is_default && (
                        <span className="text-[10px] font-[700] bg-[var(--color-brand-red-light)] text-[var(--color-brand-red)] px-2 py-0.5 rounded-full uppercase">Default</span>
                      )}
                    </div>
                    {selectedAddress?.id === addr.id && (
                      <div className="size-5 bg-[var(--color-brand-red)] rounded-full flex items-center justify-center">
                        <Check size={11} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                    {addr.address_line_1}{addr.address_line_2 ? `, ${addr.address_line_2}` : ''},&nbsp;
                    {addr.city}, {addr.state} — <span className="font-[600] text-[var(--color-text-primary)]">{addr.pincode}</span>
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Using saved address banner */}
        {useExistingAddress && (
          <div className="flex items-center justify-between p-4 bg-[var(--color-brand-red-light)]/40 border border-[var(--color-brand-red)]/30 rounded-[12px]">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-[var(--color-brand-red)]" />
              <span className="text-[14px] font-[600] text-[var(--color-text-primary)]">
                Using: {selectedAddress?.name}
              </span>
            </div>
            <button
              onClick={() => { setUseExistingAddress(false); setSelectedAddress(null); setShowAddressForm(true); }}
              className="text-[13px] font-[600] text-[var(--color-brand-red)] hover:underline uppercase tracking-wide"
            >
              Change
            </button>
          </div>
        )}

        {/* New address form */}
        {(savedAddresses.length === 0 || showAddressForm || useExistingAddress) && !useExistingAddress && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField id="plot" label="House / Flat / Plot" placeholder="e.g. 101, A-Wing" required
                value={addressDetails.plotNumber} onChange={v => setAddressDetails({ ...addressDetails, plotNumber: v })} />
              <InputField id="building" label="Building / Society"  placeholder="e.g. Sunshine Apartments"
                value={addressDetails.buildingName} onChange={v => setAddressDetails({ ...addressDetails, buildingName: v })} />
            </div>
            <InputField id="street" label="Street / Area / Locality" placeholder="e.g. MG Road, Near Market" required
              value={addressDetails.street} onChange={v => setAddressDetails({ ...addressDetails, street: v })} />
            <InputField id="landmark" label="Landmark" placeholder="e.g. Opposite Metro Station"
              value={addressDetails.landmark} onChange={v => setAddressDetails({ ...addressDetails, landmark: v })} />
            <div className="grid grid-cols-3 gap-4">
              <InputField id="pincode" label="Pincode" placeholder="6 digits" required maxLength={6}
                value={addressDetails.pincode} onChange={v => setAddressDetails({ ...addressDetails, pincode: v })} />
              <InputField id="city" label="City" placeholder="Mumbai" required
                value={addressDetails.city} onChange={v => setAddressDetails({ ...addressDetails, city: v })} />
              <InputField id="state" label="State" placeholder="Maharashtra" required
                value={addressDetails.state} onChange={v => setAddressDetails({ ...addressDetails, state: v })} />
            </div>

            {/* Address type */}
            <div className="space-y-2">
              <p className="text-[13px] font-[600] text-[var(--color-text-primary)]">Address Type</p>
              <div className="flex gap-3">
                {(['home', 'work', 'other'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setAddressDetails({ ...addressDetails, addressType: t })}
                    className={cn(
                      'flex items-center gap-1.5 px-4 h-9 rounded-full border-[1.5px] text-[13px] font-[600] capitalize transition-all',
                      addressDetails.addressType === t
                        ? 'border-[var(--color-brand-red)] bg-[var(--color-brand-red-light)] text-[var(--color-brand-red)]'
                        : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]'
                    )}
                  >
                    <TypeIcon type={t} />{t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Delivery estimate */}
        <div className="flex items-center justify-between p-4 rounded-[12px] bg-[var(--color-surface-page)] border border-[var(--color-border-default)]">
          <div className="flex items-center gap-3">
            <div className="size-9 bg-white rounded-full border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-brand-red)]">
              <Truck size={16} />
            </div>
            <div>
              <p className="text-[12px] text-[var(--color-text-secondary)] uppercase tracking-wider font-[600]">Estimated Delivery</p>
              <p className="text-[14px] font-[700] text-[var(--color-text-primary)]">{estimatedDeliveryTime || 'Standard Delivery'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-[var(--color-text-secondary)] uppercase tracking-wider font-[600]">Shipping</p>
            <p className={cn('text-[15px] font-[700]', estimatedDeliveryFee === 0 ? 'text-[#008A00]' : 'text-[var(--color-brand-red)]')}>
              {estimatedDeliveryFee === 0 ? 'FREE' : formatCurrency(estimatedDeliveryFee || 0, settings.currency_symbol)}
            </p>
          </div>
        </div>

        {/* Save to profile */}
        {currentUser && !useExistingAddress && (
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" defaultChecked
              className="size-4 rounded border-[var(--color-border-default)] text-[var(--color-brand-red)] focus:ring-[var(--color-brand-red)] transition-colors"
            />
            <span className="text-[13px] text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
              Save this address to my profile
            </span>
          </label>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px]">
            <AlertCircle size={16} className="text-[#E01E26] mt-0.5 shrink-0" />
            <ul className="space-y-1">
              {errors.map((e, i) => <li key={i} className="text-[13px] text-[#E01E26] font-[500]">{e}</li>)}
            </ul>
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-default)]/50">
          <button onClick={onPrev} className="flex items-center gap-2 text-[14px] font-[600] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            <ChevronLeft size={16} /> Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="group flex items-center gap-2 bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-[600] text-[14px] px-8 h-12 rounded-[10px] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Continue to Payment
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutAddressDetails;
