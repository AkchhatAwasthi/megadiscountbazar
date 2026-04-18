import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package, X, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product { id: string; name: string; price: number; stock_quantity: number; images: string[]; }

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryId: string;
  categoryName: string;
}

const CategoryDeleteModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, categoryId, categoryName }) => {
  const [linkedProducts, setLinkedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && categoryId) fetchLinkedProducts();
  }, [isOpen, categoryId]);

  const fetchLinkedProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, images')
        .eq('category_id', categoryId);
      if (error) throw error;
      setLinkedProducts(data || []);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to fetch linked products', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (linkedProducts.length > 0) {
        const { error: pe } = await supabase.from('products').delete().eq('category_id', categoryId);
        if (pe) throw pe;
      }
      const { error: ce } = await supabase.from('categories').delete().eq('id', categoryId);
      if (ce) throw ce;
      toast({ title: 'Deleted', description: `"${categoryName}" and ${linkedProducts.length} product(s) deleted.` });
      onConfirm();
      onClose();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to delete', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !deleting && onClose()}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-[520px] bg-white rounded-[20px] shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            {/* Header */}
            <div className="flex items-start gap-4 p-6 border-b border-[var(--color-border-default)]">
              <div className="size-11 rounded-full bg-[#FEF2F2] flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-[#E01E26]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[18px] font-[700] text-[var(--color-text-primary)] leading-tight">Delete Category</h2>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
                  You're about to delete <span className="font-[700] text-[var(--color-text-primary)]">"{categoryName}"</span>
                </p>
              </div>
              <button
                onClick={() => !deleting && onClose()}
                disabled={deleting}
                className="size-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-page)] transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* Warning */}
              <div className="flex gap-3 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-[12px]">
                <AlertTriangle size={16} className="text-[#E01E26] mt-0.5 shrink-0" />
                <div className="text-[13px] text-[#991B1B] space-y-1">
                  <p className="font-[700]">This action cannot be undone. The following will be permanently deleted:</p>
                  <ul className="list-disc list-inside space-y-0.5 mt-1">
                    <li>The category "<strong>{categoryName}</strong>"</li>
                    <li>All {loading ? '…' : linkedProducts.length} linked product(s)</li>
                    <li>All associated data (images, variants, etc.)</li>
                  </ul>
                </div>
              </div>

              {/* Linked products */}
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 size={24} className="animate-spin text-[var(--color-brand-red)]" />
                </div>
              ) : linkedProducts.length > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package size={15} className="text-[var(--color-text-secondary)]" />
                    <p className="text-[13px] font-[700] text-[var(--color-text-primary)]">
                      {linkedProducts.length} product(s) will also be deleted
                    </p>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {linkedProducts.map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-[10px] bg-[var(--color-surface-page)] border border-[var(--color-border-default)]">
                        <div className="size-10 bg-white rounded-[8px] border border-[var(--color-border-default)] overflow-hidden flex items-center justify-center shrink-0">
                          <img src={p.images?.[0] || '/placeholder.svg'} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-[600] text-[var(--color-text-primary)] truncate">{p.name}</p>
                          <p className="text-[12px] text-[var(--color-text-secondary)]">₹{p.price} · Stock: {p.stock_quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Package size={32} className="text-[var(--color-text-muted)] mx-auto mb-2" />
                  <p className="text-[14px] text-[var(--color-text-secondary)]">No products linked. Only the category will be deleted.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--color-border-default)] bg-[var(--color-surface-page)]">
              <button
                onClick={onClose}
                disabled={deleting}
                className="px-5 h-10 rounded-[10px] border-[1.5px] border-[var(--color-border-default)] text-[14px] font-[600] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white hover:border-[var(--color-text-muted)] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || loading}
                className="flex items-center gap-2 px-5 h-10 rounded-[10px] bg-[#E01E26] hover:bg-[#C01020] text-white text-[14px] font-[700] transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {deleting
                  ? <><Loader2 size={14} className="animate-spin" />Deleting…</>
                  : <><Trash2 size={14} />Delete {linkedProducts.length > 0 ? `& ${linkedProducts.length} Product(s)` : 'Category'}</>
                }
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CategoryDeleteModal;
