import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateAddressDetails } from '@/utils/validation';
import { formatCurrency } from '@/utils/settingsHelpers';
import { MapPin, Home, Briefcase, Globe, ChevronLeft, ChevronRight, Check, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressDetails {
  plotNumber: string;
  buildingName: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  addressType: 'home' | 'work' | 'other';
  saveAs: string;
}

interface SavedAddress {
  id: string;
  name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  type: string;
  is_default: boolean;
}

interface CheckoutAddressDetailsProps {
  addressDetails: AddressDetails;
  setAddressDetails: (details: AddressDetails) => void;
  savedAddresses: SavedAddress[];
  selectedAddress: SavedAddress | null;
  setSelectedAddress: (address: SavedAddress | null) => void;
  useExistingAddress: boolean;
  setUseExistingAddress: (use: boolean) => void;
  showAddressForm: boolean;
  setShowAddressForm: (show: boolean) => void;
  settings: any;
  subtotal: number;
  currentUser: any;
  onNext: () => void;
  onPrev: () => void;
  estimatedDeliveryFee: number | null;
  setEstimatedDeliveryFee: (fee: number | null) => void;
  estimatedDeliveryTime: string | null;
  setEstimatedDeliveryTime: (time: string | null) => void;
  cartItems: any[];
  isPincodeServiceable: boolean;
  setIsPincodeServiceable: (serviceable: boolean) => void;
}

const CheckoutAddressDetails = ({
  addressDetails,
  setAddressDetails,
  savedAddresses,
  selectedAddress,
  setSelectedAddress,
  useExistingAddress,
  setUseExistingAddress,
  showAddressForm,
  setShowAddressForm,
  settings,
  onNext,
  onPrev,
  estimatedDeliveryFee,
  estimatedDeliveryTime,
  currentUser
}: CheckoutAddressDetailsProps) => {
  const [addressErrors, setAddressErrors] = useState<string[]>([]);

  const handleSavedAddressSelect = (address: SavedAddress) => {
    setSelectedAddress(address);
    setUseExistingAddress(true);

    setAddressDetails({
      plotNumber: address.address_line_1.split(',')[0] || '',
      buildingName: '',
      street: address.address_line_2 || '',
      landmark: address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode,
      addressType: address.type as 'home' | 'work' | 'other',
      saveAs: address.type === 'other' ? address.name : ''
    });
  };

  const handleNext = () => {
    if (!addressDetails.city || !addressDetails.state || !addressDetails.pincode) return;

    if (!useExistingAddress) {
      const validation = validateAddressDetails(addressDetails);
      if (!validation.isValid) {
        setAddressErrors(validation.errors);
        return;
      }
    }
    setAddressErrors([]);
    onNext();
  };

  const AddressTypeIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'home': return <Home size={16} />;
      case 'work': return <Briefcase size={16} />;
      default: return <Globe size={16} />;
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="size-10 bg-[var(--blue-light)] rounded-full flex items-center justify-center text-[var(--blue-primary)]">
           <MapPin size={20} />
        </div>
        <h2 className="text-[20px] md:text-[24px] font-[600] text-[#1A1A1A]">Shipping Address</h2>
      </div>

      <div className="space-y-8">
        {/* Saved Addresses */}
        {savedAddresses.length > 0 && !showAddressForm && !useExistingAddress && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h4 className="text-[13px] font-[700] text-[#5F6368] uppercase tracking-wider">Your Saved Addresses</h4>
              <button
                onClick={() => setShowAddressForm(true)}
                className="text-[13px] font-[600] text-[var(--blue-primary)] hover:underline"
              >
                + Add New Address
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedAddresses.map((address) => (
                <div
                  key={address.id}
                  className={cn(
                    "p-5 border-[1.5px] rounded-[12px] transition-all cursor-pointer relative",
                    selectedAddress?.id === address.id
                      ? "border-[var(--blue-primary)] bg-[var(--blue-light)]/20 shadow-sm"
                      : "border-[#E0E3E7] hover:border-[var(--blue-primary)]/50"
                  )}
                  onClick={() => handleSavedAddressSelect(address)}
                >
                   <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                         <div className="size-8 bg-white rounded-full border border-[#E0E3E7] flex items-center justify-center text-[#5F6368]">
                            <AddressTypeIcon type={address.type} />
                         </div>
                         <span className="text-[15px] font-[600] text-[#1A1A1A] capitalize">{address.name}</span>
                      </div>
                      {selectedAddress?.id === address.id && (
                         <div className="size-5 bg-[var(--blue-primary)] rounded-full flex items-center justify-center text-white">
                            <Check size={12} strokeWidth={3} />
                         </div>
                      )}
                   </div>
                   <p className="text-[13px] text-[#5F6368] leading-relaxed">
                      {address.address_line_1}, {address.address_line_2 && `${address.address_line_2}, `}
                      {address.city}, {address.state} - <span className="font-[600] text-[#1A1A1A]">{address.pincode}</span>
                   </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Address Form */}
        {(savedAddresses.length === 0 || showAddressForm || useExistingAddress) && (
          <div className="space-y-6">
            {useExistingAddress && (
              <div className="flex items-center justify-between p-4 bg-[var(--blue-light)]/20 border border-[var(--blue-primary)]/30 rounded-[12px]">
                 <div className="flex items-center gap-3">
                    <Check className="text-[var(--blue-primary)]" size={18} />
                    <span className="text-[14px] font-[600] text-[#1A1A1A]">
                       Using Saved Address: {selectedAddress?.name}
                    </span>
                 </div>
                 <button
                   onClick={() => {
                     setUseExistingAddress(false);
                     setSelectedAddress(null);
                     setShowAddressForm(true);
                   }}
                   className="text-[12px] font-[700] text-[var(--blue-primary)] hover:underline uppercase"
                 >
                   Change
                 </button>
              </div>
            )}

            {!useExistingAddress && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="plotNumber" className="text-[13px] font-[600] text-[#1A1A1A]">
                    House / Plot / Office *
                  </Label>
                  <Input
                    id="plotNumber"
                    type="text"
                    placeholder="E.g. 101, A-Wing"
                    value={addressDetails.plotNumber}
                    onChange={(e) => setAddressDetails({ ...addressDetails, plotNumber: e.target.value })}
                    className="h-12 border-[#E0E3E7] rounded-[8px] text-[14px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buildingName" className="text-[13px] font-[600] text-[#1A1A1A]">
                    Building / Complex
                  </Label>
                  <Input
                    id="buildingName"
                    type="text"
                    placeholder="E.g. Sunshine Apartments"
                    value={addressDetails.buildingName}
                    onChange={(e) => setAddressDetails({ ...addressDetails, buildingName: e.target.value })}
                    className="h-12 border-[#E0E3E7] rounded-[8px] text-[14px]"
                  />
                </div>
              </div>
            )}

            {!useExistingAddress && (
              <div className="space-y-2">
                <Label htmlFor="street" className="text-[13px] font-[600] text-[#1A1A1A]">
                  Street / Area / Locality *
                </Label>
                <Input
                  id="street"
                  type="text"
                  placeholder="E.g. MG Road, Near Market"
                  value={addressDetails.street}
                  onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })}
                  className="h-12 border-[#E0E3E7] rounded-[10px] text-[14px]"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                <Label htmlFor="pincode" className="text-[13px] font-[600] text-[#1A1A1A]">
                  Pincode *
                </Label>
                <Input
                  id="pincode"
                  type="text"
                  placeholder="6 Digits"
                  value={addressDetails.pincode}
                  onChange={(e) => setAddressDetails({ ...addressDetails, pincode: e.target.value })}
                  className="h-12 border-[#E0E3E7] rounded-[10px] text-[14px]"
                  maxLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-[13px] font-[600] text-[#1A1A1A]">
                  City *
                </Label>
                <Input
                  id="city"
                   type="text"
                  placeholder="E.g. Mumbai"
                  value={addressDetails.city}
                  onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })}
                  className="h-12 border-[#E0E3E7] rounded-[10px] text-[14px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-[13px] font-[600] text-[#1A1A1A]">
                  State *
                </Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="E.g. Maharashtra"
                  value={addressDetails.state}
                  onChange={(e) => setAddressDetails({ ...addressDetails, state: e.target.value })}
                  className="h-12 border-[#E0E3E7] rounded-[10px] text-[14px]"
                  required
                />
              </div>
            </div>

            {/* Delivery Estimation */}
            <div className="p-5 rounded-[12px] bg-[#F6F7F8] border border-[#E0E3E7] flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-3">
                  <div className="size-10 bg-white rounded-full flex items-center justify-center text-[var(--blue-primary)] border border-[#E0E3E7]">
                     <Rocket size={20} />
                  </div>
                  <div>
                     <p className="text-[12px] font-[700] text-[#5F6368] uppercase tracking-wider leading-none mb-1">Estimated Arrival</p>
                     <p className="text-[16px] font-[600] text-[#1A1A1A]">{estimatedDeliveryTime || 'Standard Delivery'}</p>
                  </div>
               </div>
               <div className="text-center md:text-right">
                  <p className="text-[12px] font-[700] text-[#5F6368] uppercase tracking-wider leading-none mb-1">Shipping Fee</p>
                  <p className={cn("text-[16px] font-[700]", estimatedDeliveryFee === 0 ? "text-[#008A00]" : "text-[var(--blue-primary)]")}>
                     {estimatedDeliveryFee === 0 ? 'FREE' : formatCurrency(estimatedDeliveryFee || 0, settings.currency_symbol)}
                  </p>
               </div>
            </div>

            {/* Save Address */}
            {currentUser && !useExistingAddress && (
              <div className="flex items-center gap-3 px-1">
                <input
                  type="checkbox"
                  id="saveAddress"
                  checked={true}
                  readOnly
                  className="size-4 rounded border-[#E0E3E7] text-[var(--blue-primary)] focus:ring-[var(--blue-primary)]"
                />
                <Label htmlFor="saveAddress" className="text-[13px] font-[600] text-[#5F6368] cursor-pointer hover:text-[#1A1A1A] transition-colors">
                  Save this address to my profile
                </Label>
              </div>
            )}
          </div>
        )}

        {addressErrors.length > 0 && (
          <div className="p-4 bg-[#E01E26]/5 border border-[#E01E26]/20 rounded-[12px]">
            <ul className="text-[#E01E26] text-[12px] font-[600] space-y-1">
              {addressErrors.map((error, index) => (
                <li key={index} className="flex items-center gap-2">
                   <span className="size-1 bg-[#E01E26] rounded-full"></span>
                   {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between pt-8 border-t border-[#F6F7F8] mt-10">
           <button 
             onClick={onPrev}
             className="text-[#5F6368] hover:text-[#1A1A1A] text-[14px] font-[600] flex items-center gap-2 transition-colors uppercase tracking-wider"
           >
              <ChevronLeft size={18} />
              Back
           </button>
           <Button
             onClick={handleNext}
             disabled={
               useExistingAddress
                 ? !selectedAddress || !addressDetails.city || !addressDetails.state || !addressDetails.pincode
                 : !addressDetails.plotNumber || !addressDetails.street || !addressDetails.city || !addressDetails.state || !addressDetails.pincode
             }
             className="group bg-[var(--blue-primary)] hover:bg-[var(--blue-deep)] text-white font-[500] text-[14px] px-10 h-14 rounded-[8px] transition-all active:scale-[0.98] shadow-md disabled:opacity-50 disabled:grayscale"
           >
             Continue to Payment
             <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
           </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutAddressDetails;