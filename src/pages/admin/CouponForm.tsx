import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface CouponFormProps {
  coupon?: any;
  isEdit?: boolean;
}

const CouponForm = ({ coupon: propCoupon, isEdit = false }: CouponFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_order_amount: 0,
    max_discount_amount: 0,
    usage_limit: 0,
    used_count: 0,
    valid_from: new Date(),
    valid_until: new Date(),
    is_active: true
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id && isEdit) {
      fetchCoupon();
    }
  }, [id, isEdit]);

  const fetchCoupon = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        ...data,
        valid_from: new Date(data.valid_from),
        valid_until: new Date(data.valid_until)
      });
    } catch (error) {
      console.error('Error fetching coupon:', error);
      toast({
        title: "Error",
        description: "Failed to fetch coupon details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateCouponCode = () => {
    const prefix = formData.discount_type === 'percentage' ? 'SAVE' : 'GET';
    const value = formData.discount_value || 10;
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${value}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.description || !formData.discount_value) {
      toast({
        title: "Missing required fields",
        description: "Please fill in code, description, and discount value.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const couponData = {
        code: formData.code,
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        min_order_amount: Number(formData.min_order_amount) || 0,
        max_discount_amount: Number(formData.max_discount_amount) || null,
        usage_limit: Number(formData.usage_limit) || null,
        used_count: Number(formData.used_count) || 0,
        valid_from: formData.valid_from.toISOString(),
        valid_until: formData.valid_until.toISOString(),
        is_active: formData.is_active
      };

      if (isEdit && id) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert(couponData);

        if (error) throw error;
      }

      toast({
        title: isEdit ? "Coupon updated!" : "Coupon created!",
        description: `Coupon ${formData.code} has been ${isEdit ? 'updated' : 'added'} successfully.`,
      });

      navigate('/admin/coupons');
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast({
        title: "Error",
        description: "Failed to save coupon. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const CardStyle = "bg-[var(--color-surface-card)] border-[0.5px] border-[var(--color-border-default)] rounded-[12px] shadow-sm hover:border-[var(--color-brand-red)] hover:shadow-[0_8px_24px_rgba(0,113,220,0.1)] transition-all duration-220";
  const LabelStyle = "text-[var(--color-text-secondary)] text-[12px] font-[500] mb-1.5 block tracking-wide";
  const InputStyle = "h-[40px] px-3 bg-[var(--color-surface-card)] border-[1.5px] border-[var(--color-border-default)] rounded-[8px] text-[14px] text-[var(--color-text-primary)] focus:border-[var(--color-brand-red)] focus:outline-none transition-colors w-full";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-[var(--color-border-default)] pb-6">
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/coupons')}
            className="flex items-center gap-1.5 text-[12px] font-[600] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Coupons
          </button>
          <h1 className="text-[22px] font-[700] text-[var(--color-text-primary)]">
            {isEdit ? 'Edit Coupon' : 'Add New Coupon'}
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
            {isEdit ? 'Modify existing coupon details' : 'Create a new discount code'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[var(--color-border-default)] pb-4 px-5">
              <CardTitle className="text-[17px] font-[500] text-[var(--color-text-primary)]">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className={LabelStyle}>Coupon Code *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      required
                      className={InputStyle}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleInputChange('code', generateCouponCode())}
                      className="h-[40px] border-[1.5px] border-[var(--color-brand-red)] text-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-light)] font-[500] rounded-[8px] transition-all"
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_type" className={LabelStyle}>Discount Type *</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value) => handleInputChange('discount_type', value)}
                  >
                    <SelectTrigger className="h-[40px] border-[1.5px] border-[var(--color-border-default)] bg-[var(--color-surface-card)] text-[var(--color-text-primary)] rounded-[8px] focus:border-[var(--color-brand-red)]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[var(--color-border-default)]">
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className={LabelStyle}>Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter coupon description"
                  rows={3}
                  required
                  className={InputStyle}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount_value" className={LabelStyle}>
                    Discount Value * {formData.discount_type === 'percentage' ? '(%)' : '(₹)'}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => handleInputChange('discount_value', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    required
                    className={InputStyle}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_order_amount" className={LabelStyle}>Min Order Value (₹)</Label>
                  <Input
                    id="min_order_amount"
                    type="number"
                    value={formData.min_order_amount}
                    onChange={(e) => handleInputChange('min_order_amount', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    className={InputStyle}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usage_limit" className={LabelStyle}>Usage Limit</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => handleInputChange('usage_limit', Number(e.target.value))}
                    placeholder="0 (Unlimited)"
                    min="0"
                    className={InputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={LabelStyle}>Valid From *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-[var(--color-border-default)] h-[40px] px-3 bg-[var(--color-surface-card)] text-[var(--color-text-primary)] rounded-[8px] hover:bg-[var(--color-surface-page)] hover:text-[var(--color-text-primary)]",
                          !formData.valid_from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-[var(--color-brand-red)]" />
                        {formData.valid_from ? format(formData.valid_from, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-[var(--color-border-default)] bg-white">
                      <Calendar
                        mode="single"
                        selected={formData.valid_from}
                        onSelect={(date) => handleInputChange('valid_from', date)}
                        initialFocus
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className={LabelStyle}>Valid Until *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-[var(--color-border-default)] h-[40px] px-3 bg-[var(--color-surface-card)] text-[var(--color-text-primary)] rounded-[8px] hover:bg-[var(--color-surface-page)] hover:text-[var(--color-text-primary)]",
                          !formData.valid_until && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-[var(--color-brand-red)]" />
                        {formData.valid_until ? format(formData.valid_until, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-[var(--color-border-default)] bg-white">
                      <Calendar
                        mode="single"
                        selected={formData.valid_until}
                        onSelect={(date) => handleInputChange('valid_until', date)}
                        initialFocus
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={`${CardStyle} mt-6`}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full h-[40px] bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] text-white rounded-[8px] font-[500] text-[14px] transition-all duration-200 hover:-translate-y-[1px]"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : isEdit ? 'Update Coupon' : 'Create Coupon'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-[40px] bg-transparent border-[1.5px] border-[var(--color-brand-red)] text-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-light)] rounded-[8px] font-[500] text-[14px] transition-all"
                  onClick={() => navigate('/admin/coupons')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default CouponForm;
