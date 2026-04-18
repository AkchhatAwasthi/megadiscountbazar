import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import {
  PlusCircle, Trash2, Save, AlertCircle, Star, MessageSquare,
  Edit, X, ChevronUp, ChevronDown, Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string | null;
  image_url: string | null;
  text: string;
  rating: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const inputCls = "w-full h-10 px-3 bg-white border border-[var(--color-border-default)] rounded-[8px] text-[14px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-red)] transition-colors";
const labelCls = "block text-[12px] font-[600] text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide";

const StarRating = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={16}
        className={`${i <= value ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[var(--color-border-default)]'} ${onChange ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
        onClick={() => onChange?.(i)}
      />
    ))}
  </div>
);

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Testimonial | null>(null);
  const [newT, setNewT] = useState({ name: '', role: '', company: '', image_url: '', text: '', rating: 5, is_active: true, sort_order: 0 });

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('testimonials').select('*').order('sort_order', { ascending: true });
      if (error) throw error;
      setTestimonials(data || []);
    } catch { toast({ title: 'Error', description: 'Failed to fetch testimonials', variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!newT.name || !newT.text) return toast({ title: 'Required', description: 'Name and text are required', variant: 'destructive' });
    try {
      setSaving(true);
      const { error } = await supabase.from('testimonials').insert([{
        name: newT.name, role: newT.role, company: newT.company || null,
        image_url: newT.image_url || null, text: newT.text, rating: newT.rating,
        is_active: newT.is_active, sort_order: newT.sort_order || testimonials.length + 1,
      }]);
      if (error) throw error;
      toast({ title: 'Added', description: 'Testimonial created successfully' });
      setNewT({ name: '', role: '', company: '', image_url: '', text: '', rating: 5, is_active: true, sort_order: 0 });
      fetch();
    } catch { toast({ title: 'Error', description: 'Failed to create testimonial', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!editData) return;
    try {
      setSaving(true);
      const { error } = await supabase.from('testimonials').update({
        name: editData.name, role: editData.role, company: editData.company,
        image_url: editData.image_url, text: editData.text, rating: editData.rating,
        is_active: editData.is_active, sort_order: editData.sort_order,
      }).eq('id', editData.id);
      if (error) throw error;
      toast({ title: 'Updated', description: 'Testimonial updated successfully' });
      setEditingId(null); setEditData(null);
      fetch();
    } catch { toast({ title: 'Error', description: 'Failed to update testimonial', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) return toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    toast({ title: 'Deleted', description: 'Testimonial removed' });
    fetch();
  };

  const moveTestimonial = async (id: string, dir: 'up' | 'down') => {
    const idx = testimonials.findIndex(t => t.id === id);
    if (idx === -1) return;
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= testimonials.length) return;
    const updated = [...testimonials];
    const temp = updated[idx].sort_order;
    updated[idx].sort_order = updated[newIdx].sort_order;
    updated[newIdx].sort_order = temp;
    setTestimonials(updated);
    await Promise.all([
      supabase.from('testimonials').update({ sort_order: updated[idx].sort_order }).eq('id', updated[idx].id),
      supabase.from('testimonials').update({ sort_order: updated[newIdx].sort_order }).eq('id', updated[newIdx].id),
    ]);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="size-8 rounded-full border-[3px] border-[var(--color-brand-red-light)] border-t-[var(--color-brand-red)] animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-[700] text-[var(--color-text-primary)]">Testimonials</h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">Customer reviews and social proof</p>
        </div>
      </div>

      {/* Add Form */}
      <div className="bg-white rounded-[14px] border border-[var(--color-border-default)] overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--color-border-default)]">
          <div className="size-8 rounded-[8px] bg-[var(--color-brand-red-light)] flex items-center justify-center">
            <MessageSquare size={15} className="text-[var(--color-brand-red)]" />
          </div>
          <p className="text-[14px] font-[700] text-[var(--color-text-primary)]">Add New Testimonial</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Name *</label>
              <input className={inputCls} placeholder="Customer name" value={newT.name} onChange={e => setNewT({ ...newT, name: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Role *</label>
              <input className={inputCls} placeholder="e.g. Fashion Enthusiast" value={newT.role} onChange={e => setNewT({ ...newT, role: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Company</label>
              <input className={inputCls} placeholder="Optional" value={newT.company} onChange={e => setNewT({ ...newT, company: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Image URL</label>
              <input className={inputCls} placeholder="https://..." value={newT.image_url} onChange={e => setNewT({ ...newT, image_url: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Review Text *</label>
            <textarea className={`${inputCls} h-auto py-2.5 resize-none`} rows={3} placeholder="Enter the customer's review..."
              value={newT.text} onChange={e => setNewT({ ...newT, text: e.target.value })} />
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <label className={labelCls}>Rating</label>
              <StarRating value={newT.rating} onChange={v => setNewT({ ...newT, rating: v })} />
            </div>
            <div>
              <label className={labelCls}>Sort Order</label>
              <input type="number" min="0" className={`${inputCls} w-24`} value={newT.sort_order || ''} onChange={e => setNewT({ ...newT, sort_order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex items-center gap-2.5 pt-4">
              <Switch checked={newT.is_active} onCheckedChange={v => setNewT({ ...newT, is_active: v })} className="data-[state=checked]:bg-[var(--color-brand-red)]" />
              <span className="text-[13px] font-[600] text-[var(--color-text-primary)]">Active</span>
            </div>
          </div>
          <div className="pt-1">
            <button onClick={handleCreate} disabled={saving}
              className="flex items-center gap-1.5 h-9 px-5 rounded-[8px] bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-deep)] text-white text-[13px] font-[600] transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <PlusCircle size={13} />}
              {saving ? 'Adding...' : 'Add Testimonial'}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[15px] font-[700] text-[var(--color-text-primary)]">
            All Testimonials <span className="text-[var(--color-text-muted)] font-[400] text-[13px]">({testimonials.length})</span>
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[14px] border border-[var(--color-border-default)]">
            <AlertCircle size={32} className="text-[var(--color-text-muted)] mb-3 opacity-40" />
            <p className="text-[14px] text-[var(--color-text-muted)]">No testimonials yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {testimonials.map((t, idx) => (
              <div key={t.id} className="bg-white rounded-[14px] border border-[var(--color-border-default)] overflow-hidden hover:shadow-md transition-shadow">
                {editingId === t.id && editData ? (
                  /* Edit form */
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Name *</label>
                        <input className={inputCls} value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelCls}>Role</label>
                        <input className={inputCls} value={editData.role} onChange={e => setEditData({ ...editData, role: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelCls}>Company</label>
                        <input className={inputCls} value={editData.company || ''} onChange={e => setEditData({ ...editData, company: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelCls}>Sort Order</label>
                        <input type="number" className={inputCls} value={editData.sort_order} onChange={e => setEditData({ ...editData, sort_order: parseInt(e.target.value) || 0 })} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Image URL</label>
                      <input className={inputCls} value={editData.image_url || ''} onChange={e => setEditData({ ...editData, image_url: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Review Text</label>
                      <textarea className={`${inputCls} h-auto py-2.5 resize-none`} rows={3} value={editData.text} onChange={e => setEditData({ ...editData, text: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <label className={labelCls}>Rating</label>
                        <StarRating value={editData.rating || 0} onChange={v => setEditData({ ...editData, rating: v })} />
                      </div>
                      <div className="flex items-center gap-2 pt-4">
                        <Switch checked={editData.is_active} onCheckedChange={v => setEditData({ ...editData, is_active: v })} className="data-[state=checked]:bg-[var(--color-brand-red)]" />
                        <span className="text-[12px] font-[600] text-[var(--color-text-primary)]">Active</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={handleUpdate} disabled={saving}
                        className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-[8px] bg-[var(--color-brand-red)] text-white text-[13px] font-[600] hover:bg-[var(--color-brand-red-deep)] transition-all disabled:opacity-60">
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        Save
                      </button>
                      <button onClick={() => { setEditingId(null); setEditData(null); }}
                        className="flex-1 h-9 flex items-center justify-center rounded-[8px] border border-[var(--color-border-default)] text-[13px] font-[600] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display card */
                  <div>
                    {/* Card body */}
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={t.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=E01E26&color=fff&size=64`}
                          alt={t.name}
                          className="size-10 rounded-full object-cover border border-[var(--color-border-default)]"
                          onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=E01E26&color=fff&size=64`; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-[700] text-[var(--color-text-primary)] truncate">{t.name}</p>
                          <p className="text-[11px] text-[var(--color-text-muted)] truncate">{t.role}{t.company ? `, ${t.company}` : ''}</p>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-[700] uppercase"
                          style={{ background: t.is_active ? '#D1FAE5' : '#FEE2E2', color: t.is_active ? '#065F46' : '#991B1B' }}>
                          {t.is_active ? 'Active' : 'Off'}
                        </span>
                      </div>
                      <StarRating value={t.rating || 0} />
                      <p className="text-[13px] text-[var(--color-text-secondary)] mt-2.5 line-clamp-3 leading-relaxed italic">"{t.text}"</p>
                    </div>

                    {/* Card footer */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border-default)] bg-[var(--color-surface-page)]">
                      <div className="flex gap-1">
                        <button onClick={() => moveTestimonial(t.id, 'up')} disabled={idx === 0}
                          className="size-7 flex items-center justify-center rounded-[6px] border border-[var(--color-border-default)] bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 transition-all">
                          <ChevronUp size={12} />
                        </button>
                        <button onClick={() => moveTestimonial(t.id, 'down')} disabled={idx === testimonials.length - 1}
                          className="size-7 flex items-center justify-center rounded-[6px] border border-[var(--color-border-default)] bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 transition-all">
                          <ChevronDown size={12} />
                        </button>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => { setEditingId(t.id); setEditData({ ...t }); }}
                          className="size-8 rounded-[6px] bg-white border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-brand-red-light)] hover:text-[var(--color-brand-red)] hover:border-[var(--color-brand-red)]/30 transition-all">
                          <Edit size={13} />
                        </button>
                        <button onClick={() => handleDelete(t.id)}
                          className="size-8 rounded-[6px] bg-white border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Testimonials;
