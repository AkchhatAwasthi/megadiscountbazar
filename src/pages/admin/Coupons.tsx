import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Tag, Calendar, Users, TrendingUp, Search, Ticket } from 'lucide-react';
import { formatPrice } from '@/utils/currency';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  status: 'active' | 'inactive' | 'expired';
}

const statusCfg: Record<string, { bg: string; color: string }> = {
  active: { bg: '#D1FAE5', color: '#065F46' },
  inactive: { bg: '#F1F5F9', color: '#475569' },
  expired: { bg: '#FEE2E2', color: '#991B1B' },
};

const AdminCoupons = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCoupons((data || []).map(c => ({
        id: c.id, code: c.code, description: c.description || '',
        type: c.discount_type === 'percentage' ? 'percentage' : 'fixed',
        value: c.discount_value,
        minOrderValue: c.min_order_amount || 0,
        maxDiscountAmount: c.max_discount_amount,
        usageLimit: c.usage_limit || 0,
        usedCount: c.used_count || 0,
        validFrom: c.valid_from, validUntil: c.valid_until,
        status: !c.is_active ? 'inactive' : (c.valid_until && new Date(c.valid_until) < new Date()) ? 'expired' : 'active',
      })));
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to fetch coupons', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Coupon deleted successfully' });
      fetchCoupons();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const filtered = coupons.filter(c =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statCards = [
    { label: 'Total Coupons', value: coupons.length, icon: Ticket, color: 'var(--color-brand-red)', bg: 'var(--color-brand-red-light)' },
    { label: 'Active', value: coupons.filter(c => c.status === 'active').length, icon: TrendingUp, color: '#059669', bg: '#D1FAE5' },
    { label: 'Total Uses', value: coupons.reduce((s, c) => s + c.usedCount, 0), icon: Users, color: '#7C3AED', bg: '#EDE9FE' },
    { label: 'Expired', value: coupons.filter(c => c.status === 'expired').length, icon: Calendar, color: '#D97706', bg: '#FEF3C7' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="size-8 rounded-full border-[3px] border-[var(--color-brand-red-light)] border-t-[var(--color-brand-red)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-[700] text-[var(--color-text-primary)]">Coupons</h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">Manage discounts and promotional codes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/coupons/assign')}
            className="flex items-center gap-1.5 h-9 px-4 rounded-[8px] border border-[var(--color-border-default)] bg-white text-[13px] font-[600] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)] transition-all"
          >
            <Tag size={14} /> Assign
          </button>
          <button
            onClick={() => navigate('/admin/coupons/add')}
            className="flex items-center gap-1.5 h-9 px-4 rounded-[8px] bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] text-white text-[13px] font-[600] transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <Plus size={14} /> Add Coupon
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-[14px] border border-[var(--color-border-default)] p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="size-9 rounded-[9px] flex items-center justify-center" style={{ background: c.bg }}>
                  <Icon size={16} style={{ color: c.color }} />
                </div>
              </div>
              <p className="text-[24px] font-[800] text-[var(--color-text-primary)] leading-none">{c.value}</p>
              <p className="text-[12px] text-[var(--color-text-secondary)] mt-1.5">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Search + Table */}
      <div className="bg-white rounded-[14px] border border-[var(--color-border-default)] overflow-hidden">

        {/* Table header with search */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[var(--color-border-default)]">
          <div>
            <p className="text-[14px] font-[700] text-[var(--color-text-primary)]">All Coupons</p>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="h-9 pl-9 pr-3 rounded-[8px] border border-[var(--color-border-default)] text-[13px] text-[var(--color-text-primary)] bg-[var(--color-surface-page)] outline-none focus:border-[var(--color-brand-red)] transition-colors w-56"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--color-surface-page)' }}>
                {['Code', 'Description', 'Discount', 'Min Order', 'Usage', 'Valid Until', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-[700] uppercase tracking-widest text-[var(--color-text-secondary)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-default)]/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[13px] text-[var(--color-text-muted)]">
                    <Ticket size={28} className="mx-auto mb-2 opacity-30" />
                    No coupons found
                  </td>
                </tr>
              ) : filtered.map(coupon => {
                const ss = statusCfg[coupon.status] || statusCfg.inactive;
                const usagePct = coupon.usageLimit > 0 ? (coupon.usedCount / coupon.usageLimit) * 100 : 0;
                return (
                  <tr key={coupon.id} className="hover:bg-[var(--color-surface-page)] transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[12px] font-[700] text-[var(--color-text-primary)] bg-[var(--color-surface-page)] border border-[var(--color-border-default)] px-2 py-0.5 rounded-[6px]">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[13px] text-[var(--color-text-secondary)] max-w-[160px] truncate">{coupon.description}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] font-[700] text-[var(--color-text-primary)]">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-[var(--color-text-secondary)]">
                      {formatPrice(coupon.minOrderValue)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="w-20">
                        <div className="flex justify-between text-[11px] text-[var(--color-text-secondary)] mb-1">
                          <span>{coupon.usedCount}</span>
                          <span>{coupon.usageLimit || '∞'}</span>
                        </div>
                        <div className="h-1 rounded-full bg-[var(--color-surface-page)] border border-[var(--color-border-default)]">
                          <div className="h-full rounded-full bg-[var(--color-brand-red)]" style={{ width: `${Math.min(usagePct, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-[var(--color-text-secondary)]">
                      {coupon.validUntil ? format(new Date(coupon.validUntil), 'dd MMM yyyy') : 'No expiry'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-[700] uppercase tracking-wide capitalize"
                        style={{ background: ss.bg, color: ss.color }}>
                        {coupon.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/coupons/edit/${coupon.id}`)}
                          className="size-8 rounded-[6px] bg-[var(--color-surface-page)] border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-brand-red-light)] hover:text-[var(--color-brand-red)] hover:border-[var(--color-brand-red)]/30 transition-all"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="size-8 rounded-[6px] bg-[var(--color-surface-page)] border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
