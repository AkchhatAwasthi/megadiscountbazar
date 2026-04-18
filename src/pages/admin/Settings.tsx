import { useState, useEffect } from 'react';
import {
  Save, Globe, CreditCard, Truck, DollarSign, Bell, Shield, Palette,
  Clock, Package, Check, Loader2, ChevronRight, ToggleLeft
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'business', label: 'Business', icon: DollarSign },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'delivery', label: 'Delivery', icon: Truck },
  { id: 'operations', label: 'Operations', icon: Clock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'display', label: 'Display', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
];

/* ─── small reusable pieces ─────────────────────────────────────────────── */
const Field = ({
  label, hint, children, half,
}: { label: string; hint?: string; children: React.ReactNode; half?: boolean }) => (
  <div className={cn('space-y-1.5', half && 'md:col-span-1')}>
    <label className="text-[13px] font-[600] text-[var(--color-text-primary)] block">{label}</label>
    {hint && <p className="text-[11px] text-[var(--color-text-secondary)]">{hint}</p>}
    {children}
  </div>
);

const TextInput = ({
  value, onChange, placeholder = '', type = 'text', min,
}: { value: string | number; onChange: (v: any) => void; placeholder?: string; type?: string; min?: number }) => (
  <input
    type={type}
    value={value}
    placeholder={placeholder}
    min={min}
    onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
    className="w-full h-10 px-3 rounded-[8px] border-[1.5px] border-[var(--color-border-default)] bg-white text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none hover:border-[var(--color-text-muted)] focus:border-[var(--color-brand-red)] focus:ring-2 focus:ring-[var(--color-brand-red)]/10 transition-all"
  />
);

const TextArea = ({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) => (
  <textarea
    value={value}
    rows={rows}
    onChange={e => onChange(e.target.value)}
    className="w-full px-3 py-2.5 rounded-[8px] border-[1.5px] border-[var(--color-border-default)] bg-white text-[14px] text-[var(--color-text-primary)] outline-none hover:border-[var(--color-text-muted)] focus:border-[var(--color-brand-red)] focus:ring-2 focus:ring-[var(--color-brand-red)]/10 transition-all resize-none"
  />
);

const SelectInput = ({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className="w-full h-10 px-3 rounded-[8px] border-[1.5px] border-[var(--color-border-default)] bg-white text-[14px] text-[var(--color-text-primary)] outline-none hover:border-[var(--color-text-muted)] focus:border-[var(--color-brand-red)] transition-all"
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const ToggleRow = ({
  label, hint, checked, onChange, badge,
}: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; badge?: string }) => (
  <div className="flex items-center justify-between gap-4 py-4 border-b border-[var(--color-border-default)]/60 last:border-0">
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <p className="text-[14px] font-[600] text-[var(--color-text-primary)]">{label}</p>
        {badge && (
          <span className={cn(
            'text-[10px] font-[700] px-2 py-0.5 rounded-full uppercase tracking-wide',
            checked ? 'bg-[var(--color-brand-red-light)] text-[var(--color-brand-red)]' : 'bg-[var(--color-surface-page)] text-[var(--color-text-muted)]'
          )}>
            {checked ? 'ON' : 'OFF'}
          </span>
        )}
      </div>
      {hint && <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">{hint}</p>}
    </div>
    <Switch
      checked={checked}
      onCheckedChange={onChange}
      className="data-[state=checked]:bg-[var(--color-brand-red)] shrink-0"
    />
  </div>
);

const Section = ({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) => (
  <div className="bg-white rounded-[14px] border border-[var(--color-border-default)] shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--color-border-default)]/60">
      <div className="size-8 rounded-[8px] bg-[var(--color-brand-red-light)] flex items-center justify-center">
        <Icon size={16} className="text-[var(--color-brand-red)]" />
      </div>
      <h3 className="text-[16px] font-[700] text-[var(--color-text-primary)]">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
const AdminSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({});

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('settings').select('key, value').order('category');
      if (error) throw error;
      const obj: Record<string, any> = {};
      data?.forEach(s => {
        try {
          obj[s.key] = typeof s.value === 'string' ? JSON.parse(s.value) : s.value;
        } catch {
          obj[s.key] = s.value;
        }
      });
      setSettings(obj);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string, value: any) => setSettings(p => ({ ...p, [key]: value }));
  const str = (key: string, fb = '') => String(settings[key] ?? fb);
  const num = (key: string, fb = 0) => Number(settings[key] ?? fb);
  const bool = (key: string) => Boolean(settings[key]);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase.from('settings').update({ value: JSON.stringify(value), updated_at: new Date().toISOString() }).eq('key', key);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast({ title: 'Saved!', description: 'All settings updated successfully.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={28} className="animate-spin text-[var(--color-brand-red)]" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border-default)]">
        <div>
          <h1 className="text-[26px] font-[700] text-[var(--color-text-primary)] leading-tight">Settings</h1>
          <p className="text-[14px] text-[var(--color-text-secondary)] mt-0.5">Configure your store preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'flex items-center gap-2 h-10 px-6 rounded-[8px] font-[600] text-[14px] transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shrink-0',
            saved
              ? 'bg-[#008A00] text-white'
              : 'bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] text-white'
          )}
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-[var(--color-surface-page)] p-1 rounded-[10px] border border-[var(--color-border-default)] overflow-x-auto no-scrollbar">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 h-9 rounded-[8px] text-[13px] font-[600] whitespace-nowrap transition-all duration-150 shrink-0',
                active
                  ? 'bg-[var(--color-brand-red)] text-white shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white'
              )}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── General ───────────────────────────────────────────────────── */}
      {activeTab === 'general' && (
        <div className="space-y-5">
          <Section title="Store Information" icon={Globe}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Store Name">
                <TextInput value={str('store_name')} onChange={v => set('store_name', v)} placeholder="My Store" />
              </Field>
              <Field label="Store Email">
                <TextInput value={str('store_email')} onChange={v => set('store_email', v)} placeholder="hello@store.com" type="email" />
              </Field>
              <Field label="Phone Number">
                <TextInput value={str('store_phone')} onChange={v => set('store_phone', v)} placeholder="+91 98765 43210" />
              </Field>
              <Field label="Address">
                <TextInput value={str('store_address')} onChange={v => set('store_address', v)} placeholder="123 Main St, City" />
              </Field>
            </div>
            <div className="mt-5">
              <Field label="Store Description">
                <TextArea value={str('store_description')} onChange={v => set('store_description', v)} />
              </Field>
            </div>
            <div className="mt-5">
              <Field label="Store Logo URL">
                <TextInput value={str('store_logo')} onChange={v => set('store_logo', v)} placeholder="https://..." />
              </Field>
            </div>
          </Section>
          <Section title="SEO" icon={Globe}>
            <div className="space-y-5">
              <Field label="Site Title">
                <TextInput value={str('site_title')} onChange={v => set('site_title', v)} />
              </Field>
              <Field label="Site Description">
                <TextArea value={str('site_description')} onChange={v => set('site_description', v)} rows={2} />
              </Field>
              <Field label="Keywords (comma-separated)">
                <TextInput value={str('site_keywords')} onChange={v => set('site_keywords', v)} placeholder="clothing, fashion, deals" />
              </Field>
            </div>
          </Section>
        </div>
      )}

      {/* ── Business ──────────────────────────────────────────────────── */}
      {activeTab === 'business' && (
        <div className="space-y-5">
          <Section title="Currency & Tax" icon={DollarSign}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Field label="Currency">
                <SelectInput value={str('currency', 'INR')} onChange={v => set('currency', v)} options={[
                  { value: 'INR', label: 'Indian Rupee (₹)' },
                  { value: 'USD', label: 'US Dollar ($)' },
                  { value: 'EUR', label: 'Euro (€)' },
                ]} />
              </Field>
              <Field label="Currency Symbol">
                <TextInput value={str('currency_symbol', '₹')} onChange={v => set('currency_symbol', v)} />
              </Field>
              <Field label="Tax Rate (%)">
                <TextInput value={num('tax_rate')} onChange={v => set('tax_rate', v)} type="number" min={0} />
              </Field>
            </div>
          </Section>
          <Section title="Order Limits" icon={Package}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Minimum Order Amount (₹)">
                <TextInput value={num('min_order_amount')} onChange={v => set('min_order_amount', v)} type="number" min={0} />
              </Field>
              <Field label="Maximum Order Amount (₹)">
                <TextInput value={num('max_order_amount')} onChange={v => set('max_order_amount', v)} type="number" min={0} />
              </Field>
              <Field label="Bulk Discount Threshold (₹)">
                <TextInput value={num('bulk_discount_threshold')} onChange={v => set('bulk_discount_threshold', v)} type="number" min={0} />
              </Field>
              <Field label="Bulk Discount (%)">
                <TextInput value={num('bulk_discount_percentage')} onChange={v => set('bulk_discount_percentage', v)} type="number" min={0} />
              </Field>
            </div>
          </Section>
        </div>
      )}

      {/* ── Payments ──────────────────────────────────────────────────── */}
      {activeTab === 'payments' && (
        <div className="space-y-5">
          <Section title="Payment Methods" icon={CreditCard}>
            <p className="text-[13px] text-[var(--color-text-secondary)] mb-4 pb-4 border-b border-[var(--color-border-default)]/60">
              Enable or disable payment options. Changes reflect immediately in checkout after saving.
            </p>
            <ToggleRow label="Razorpay Online Payment" hint="Card, UPI, NetBanking, Wallets via Razorpay gateway" checked={bool('razorpay_enabled')} onChange={v => set('razorpay_enabled', v)} badge="Razorpay" />
            <ToggleRow label="Cash on Delivery (COD)" hint="Allow customers to pay cash at delivery" checked={bool('cod_enabled')} onChange={v => set('cod_enabled', v)} badge="COD" />
            <ToggleRow label="UPI Payments" hint="UPI-based direct payments" checked={bool('upi_enabled')} onChange={v => set('upi_enabled', v)} />
            <ToggleRow label="Credit / Debit Card" hint="Enable card-based payments" checked={bool('card_enabled')} onChange={v => set('card_enabled', v)} />
            <ToggleRow label="Net Banking" hint="Enable net banking payments" checked={bool('netbanking_enabled')} onChange={v => set('netbanking_enabled', v)} />
          </Section>
          {/* Preview of what checkout will show */}
          <div className="p-5 rounded-[12px] bg-[var(--color-surface-page)] border border-[var(--color-border-default)]">
            <p className="text-[13px] font-[700] text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
              <ToggleLeft size={16} className="text-[var(--color-brand-red)]" />
              Checkout Preview
            </p>
            <div className="flex flex-wrap gap-2">
              {bool('razorpay_enabled') && (
                <span className="px-3 py-1.5 rounded-full bg-white border border-[var(--color-brand-red)]/30 text-[12px] font-[600] text-[var(--color-brand-red)]">
                  ✓ Online Payment (Razorpay) shown
                </span>
              )}
              {bool('cod_enabled') && (
                <span className="px-3 py-1.5 rounded-full bg-white border border-[#008A00]/30 text-[12px] font-[600] text-[#008A00]">
                  ✓ Cash on Delivery shown
                </span>
              )}
              {!bool('razorpay_enabled') && !bool('cod_enabled') && (
                <span className="px-3 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[12px] font-[600] text-[#E01E26]">
                  ⚠ No payment method enabled — customers cannot checkout!
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Delivery ──────────────────────────────────────────────────── */}
      {activeTab === 'delivery' && (
        <Section title="Delivery Settings" icon={Truck}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Standard Delivery Charge (₹)">
              <TextInput value={num('delivery_charge')} onChange={v => set('delivery_charge', v)} type="number" min={0} />
            </Field>
            <Field label="Free Delivery Above (₹)" hint="Set 0 to disable free delivery threshold">
              <TextInput value={num('free_delivery_threshold')} onChange={v => set('free_delivery_threshold', v)} type="number" min={0} />
            </Field>
            <Field label="COD Extra Charge (₹)">
              <TextInput value={num('cod_charge')} onChange={v => set('cod_charge', v)} type="number" min={0} />
            </Field>
            <Field label="Max Order for COD (₹)" hint="Orders above this amount cannot use COD">
              <TextInput value={num('cod_threshold')} onChange={v => set('cod_threshold', v)} type="number" min={0} />
            </Field>
            <Field label="Max Delivery Distance (km)">
              <TextInput value={num('max_delivery_distance')} onChange={v => set('max_delivery_distance', v)} type="number" min={0} />
            </Field>
          </div>
        </Section>
      )}

      {/* ── Operations ────────────────────────────────────────────────── */}
      {activeTab === 'operations' && (
        <Section title="Operations" icon={Clock}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Business Hours Start">
              <TextInput value={str('business_hours_start', '09:00')} onChange={v => set('business_hours_start', v)} type="time" />
            </Field>
            <Field label="Business Hours End">
              <TextInput value={str('business_hours_end', '20:00')} onChange={v => set('business_hours_end', v)} type="time" />
            </Field>
            <Field label="Order Processing Time (hours)">
              <TextInput value={num('order_processing_time')} onChange={v => set('order_processing_time', v)} type="number" min={0} />
            </Field>
            <Field label="Delivery Time Estimate (hours)">
              <TextInput value={num('delivery_time_estimate')} onChange={v => set('delivery_time_estimate', v)} type="number" min={0} />
            </Field>
            <Field label="Low Stock Alert Threshold">
              <TextInput value={num('low_stock_threshold', 10)} onChange={v => set('low_stock_threshold', v)} type="number" min={0} />
            </Field>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--color-border-default)]/60">
            <ToggleRow label="Auto-Approve Orders" hint="Automatically approve new orders without manual review" checked={bool('auto_approve_orders')} onChange={v => set('auto_approve_orders', v)} />
          </div>
        </Section>
      )}

      {/* ── Notifications ─────────────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <Section title="Notification Preferences" icon={Bell}>
          <ToggleRow label="Email Notifications" hint="Receive admin alerts via email" checked={bool('email_notifications')} onChange={v => set('email_notifications', v)} />
          <ToggleRow label="SMS Notifications" hint="Receive admin alerts via SMS" checked={bool('sms_notifications')} onChange={v => set('sms_notifications', v)} />
          <ToggleRow label="New Order Alerts" hint="Get notified immediately when an order is placed" checked={bool('order_notifications')} onChange={v => set('order_notifications', v)} />
          <ToggleRow label="Low Stock Alerts" hint="Alert when products drop below threshold" checked={bool('low_stock_alerts')} onChange={v => set('low_stock_alerts', v)} />
          <ToggleRow label="Payment Notifications" hint="Updates when payments succeed or fail" checked={bool('payment_notifications')} onChange={v => set('payment_notifications', v)} />
          <ToggleRow label="Customer Notifications" hint="Allow sending notifications to customers" checked={bool('customer_notifications')} onChange={v => set('customer_notifications', v)} />
        </Section>
      )}

      {/* ── Display ───────────────────────────────────────────────────── */}
      {activeTab === 'display' && (
        <Section title="Display Settings" icon={Palette}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <Field label="Products Per Page">
              <TextInput value={num('products_per_page', 12)} onChange={v => set('products_per_page', v)} type="number" min={1} />
            </Field>
            <Field label="Featured Products Count">
              <TextInput value={num('featured_products_count', 8)} onChange={v => set('featured_products_count', v)} type="number" min={1} />
            </Field>
            <Field label="Bestsellers Count">
              <TextInput value={num('bestsellers_count', 6)} onChange={v => set('bestsellers_count', v)} type="number" min={1} />
            </Field>
            <Field label="Language">
              <SelectInput value={str('language', 'english')} onChange={v => set('language', v)} options={[
                { value: 'english', label: 'English' },
                { value: 'hindi', label: 'Hindi' },
                { value: 'marathi', label: 'Marathi' },
              ]} />
            </Field>
          </div>
          <ToggleRow label="Enable Product Reviews" hint="Allow customers to write reviews" checked={bool('enable_reviews')} onChange={v => set('enable_reviews', v)} />
          <ToggleRow label="Enable Product Ratings" hint="Allow customers to rate products" checked={bool('enable_ratings')} onChange={v => set('enable_ratings', v)} />
        </Section>
      )}

      {/* ── Security ──────────────────────────────────────────────────── */}
      {activeTab === 'security' && (
        <Section title="Security Settings" icon={Shield}>
          <ToggleRow label="Two-Factor Authentication" hint="Require 2FA for admin logins" checked={bool('enable_two_factor')} onChange={v => set('enable_two_factor', v)} />
          <ToggleRow label="Require Email Verification" hint="New accounts must verify email before access" checked={bool('require_email_verification')} onChange={v => set('require_email_verification', v)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5 pt-5 border-t border-[var(--color-border-default)]/60">
            <Field label="Session Timeout (minutes)">
              <TextInput value={num('session_timeout', 30)} onChange={v => set('session_timeout', v)} type="number" min={5} />
            </Field>
            <Field label="Minimum Password Length">
              <TextInput value={num('password_min_length', 8)} onChange={v => set('password_min_length', v)} type="number" min={6} />
            </Field>
          </div>
        </Section>
      )}

      {/* Save reminder on mobile */}
      <div className="sm:hidden fixed bottom-4 left-4 right-4 z-50">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 rounded-[12px] bg-[var(--color-brand-red)] text-white font-[700] text-[15px] flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98]"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
