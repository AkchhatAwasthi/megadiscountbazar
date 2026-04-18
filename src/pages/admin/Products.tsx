import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, Package, Upload, Download } from 'lucide-react';
import Papa from 'papaparse';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AdminProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [categoryObjects, setCategoryObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true);

      if (error) throw error;
      const categoryNames = data?.map(cat => cat.name) || [];
      setCategories(['all', ...categoryNames]);
      setCategoryObjects(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const downloadTemplate = () => {
    // ─── Simplified universal template (23 columns) ───────────────────────────
    // variants format: Label:Price:OriginalPrice:Weight:Pieces:Stock separated by |
    //   e.g.  "500g Pack:599:999:500g:1:50|1kg Pack:999:1799:1kg:1:30"
    const headers = [
      'name', 'price', 'original_price', 'category_name',
      'stock_quantity', 'weight', 'pieces',
      'description', 'care_instructions',
      'is_active', 'is_bestseller', 'new_arrival',
      'features', 'fabric', 'pattern', 'fit', 'occasion', 'origin',
      'marketed_by', 'city', 'state',
      'available_weights',
      'variants'
    ];

    const esc = (v: string) =>
      v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;

    // Row 1 — Clothing (no variants; weight options instead)
    const clothingRow = [
      'Floral Silk Kurta Set', '2499', '4999', 'Ethnic Wear',
      '30', '450g', '3 Piece Set',
      'Elegant embroidered silk kurta with palazzo and dupatta', 'Dry clean only',
      'true', 'false', 'true',
      'Hand Embroidered,Pure Silk,Designer Wear', 'Pure Silk', 'Floral Embroidery',
      'Straight Fit', 'Festive/Wedding', 'India',
      'GenzClothing Pvt Ltd', 'Mumbai', 'Maharashtra',
      '', ''
    ];

    // Row 2 — Electronics with variants (category auto-created if absent)
    const electronicsRow = [
      'GenzPhone Pro Smartphone', '24990', '34990', 'Electronics',
      '45', '180g', '1',
      'Flagship smartphone with 6.7-inch OLED display and 50MP camera system', 'Keep away from moisture',
      'true', 'true', 'false',
      '5G Ready,OLED Display,50MP Camera,5000mAh Battery', 'Metal', '', '', '', 'India',
      'GenzTech India', 'Bengaluru', 'Karnataka',
      '',
      '64GB:24990:34990::1:20|128GB:29990:39990::1:15|256GB:34990:44990::1:10'
    ];

    const csvContent = [
      headers.join(','),
      clothingRow.map(esc).join(','),
      electronicsRow.map(esc).join(','),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'PRODUCT_UPLOAD_TEMPLATE.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateBulkSKU = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 15);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${slug.toUpperCase()}-${random}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        try {
          const productsToInsert = [];
          const variantsByIndex: any[][] = [];
          const localCats = [...categoryObjects]; // mutable local copy for auto-created categories

          for (const row of rows) {
            if (!row.name || !row.price) continue;

            // Find or auto-create category
            let category_id = null;
            if (row.category_name?.trim()) {
              const trimmed = row.category_name.trim();
              const match = localCats.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
              if (match) {
                category_id = match.id;
              } else {
                const { data: newCat, error: catErr } = await supabase
                  .from('categories')
                  .insert({ name: trimmed, is_active: true })
                  .select('id, name')
                  .single();
                if (!catErr && newCat) {
                  category_id = newCat.id;
                  localCats.push(newCat);
                }
              }
            }

            // Build product_specs from spec columns
            const product_specs: Record<string, string> = {};
            ['fabric', 'pattern', 'fit', 'occasion', 'origin'].forEach(key => {
              if (row[key]?.trim()) product_specs[key] = row[key].trim();
            });

            const boolField = (val: any) =>
              ['true', '1', 'yes'].includes(String(val ?? '').toLowerCase().trim());

            const splitList = (val: string) =>
              val ? val.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

            const product: any = {
              name: row.name.trim(),
              price: Number(row.price) || 0,
              original_price: Number(row.original_price) || Number(row.price),
              category_id,
              weight: row.weight?.trim() || null,
              description: row.description?.trim() || null,
              stock_quantity: Number(row.stock_quantity) || 0,
              is_active: boolField(row.is_active),
              is_bestseller: boolField(row.is_bestseller),
              new_arrival: boolField(row.new_arrival),
              sku: generateBulkSKU(row.name),
              pieces: row.pieces?.trim() || null,
              care_instructions: row.care_instructions?.trim() || null,
              available_weights: splitList(row.available_weights),
              features: splitList(row.features),
            };

            if (Object.keys(product_specs).length > 0) {
              product.product_specs = product_specs;
            }

            if (row.marketed_by?.trim() || row.city?.trim() || row.state?.trim()) {
              product.marketing_info = {
                marketedBy: row.marketed_by?.trim() || '',
                city: row.city?.trim() || '',
                state: row.state?.trim() || '',
              };
            }

            // Parse variants column: "Label:Price:OrgPrice:Weight:Pieces:Stock|..."
            const rowVariants: any[] = [];
            if (row.variants?.trim()) {
              row.variants.split('|').forEach((seg: string, vi: number) => {
                const parts = seg.split(':');
                const vPrice = Number(parts[1]);
                if (parts[0]?.trim() && vPrice > 0) {
                  rowVariants.push({
                    label: parts[0].trim(),
                    price: vPrice,
                    original_price: Number(parts[2]) || vPrice,
                    weight: parts[3]?.trim() || null,
                    pieces: parts[4]?.trim() || null,
                    stock_quantity: Number(parts[5]) || 0,
                    sort_order: vi,
                    is_active: true,
                  });
                }
              });
            }

            // Strip nulls / empty arrays
            productsToInsert.push(
              Object.fromEntries(
                Object.entries(product).filter(
                  ([_, v]) => v != null && v !== '' && !(Array.isArray(v) && (v as any[]).length === 0)
                )
              )
            );
            variantsByIndex.push(rowVariants);
          }

          if (productsToInsert.length > 0) {
            const { data: insertedProducts, error } = await supabase
              .from('products')
              .insert(productsToInsert)
              .select('id');
            if (error) throw error;

            // Insert variants for products that have them
            const allVariants: any[] = [];
            (insertedProducts || []).forEach((p: any, i: number) => {
              (variantsByIndex[i] || []).forEach(v => allVariants.push({ ...v, product_id: p.id }));
            });
            if (allVariants.length > 0) {
              await (supabase as any).from('product_variants').insert(allVariants);
            }

            toast({
              title: "Success",
              description: `${productsToInsert.length} products uploaded successfully`,
            });
            fetchProducts();
            fetchCategories();
          } else {
            toast({
              title: "Notice",
              description: "No valid products found to upload.",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          console.error("Upload error:", error);
          toast({
            title: "Upload Failed",
            description: error.message || "Failed to bulk upload products",
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (error: any) => {
        setIsUploading(false);
        toast({
          title: "CSV Parse Error",
          description: error.message,
          variant: "destructive",
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.categories?.name === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatus = (product: any) => {
    if (product.stock_quantity <= 0) return 'out-of-stock';
    if (!product.is_active) return 'inactive';
    return 'active';
  };

  const getStatusStyle = (product: any) => {
    const status = getStatus(product);
    if (status === 'out-of-stock') return { background: '#FCEBEB', color: '#A32D2D' };
    if (status === 'inactive') return { background: '#F1EFE8', color: '#444441' };
    return { background: '#EAF3DE', color: '#27500A' };
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Page Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>Products</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>Manage your product inventory</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={downloadTemplate}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--color-surface-card)', color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-default)', borderRadius: 8, padding: '8px 16px',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-page)';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-brand-red)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-brand-red)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-card)';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-default)';
            }}
          >
            <Download style={{ width: 16, height: 16 }} />
            Template
          </button>
          
          <input 
            type="file" 
            hidden 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv" 
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--color-surface-card)', color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-default)', borderRadius: 8, padding: '8px 16px',
              fontSize: 13, fontWeight: 500, cursor: isUploading ? 'not-allowed' : 'pointer',
              opacity: isUploading ? 0.7 : 1,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              if (isUploading) return;
              (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-page)';
            }}
            onMouseLeave={e => {
              if (isUploading) return;
              (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-card)';
            }}
          >
            <Upload style={{ width: 16, height: 16 }} />
            {isUploading ? 'Uploading...' : 'Import CSV'}
          </button>

          <button
            onClick={() => navigate('/admin/products/add')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--color-brand-red)', color: 'var(--color-surface-card)',
              border: 'none', borderRadius: 8, padding: '8px 18px',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-brand-red-deep)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-brand-red)';
              (e.currentTarget as HTMLElement).style.transform = 'none';
            }}
          >
            <Plus style={{ width: 16, height: 16 }} />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{
        background: 'var(--color-surface-card)', border: '0.5px solid var(--color-border-default)', borderRadius: 12,
        padding: '16px 20px', marginBottom: 20,
        display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              height: 36, paddingLeft: 34,
              border: '1.5px solid var(--color-border-default)', borderRadius: 8,
              fontSize: 14, color: 'var(--color-text-primary)', background: 'var(--color-surface-card)', outline: 'none',
            }}
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            height: 36, padding: '0 36px 0 12px',
            border: '1.5px solid var(--color-border-default)', borderRadius: 8,
            fontSize: 14, color: 'var(--color-text-primary)', background: 'var(--color-surface-card)',
            cursor: 'pointer', outline: 'none', minWidth: 200,
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235F6368' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
          }}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div style={{ background: 'var(--color-surface-card)', border: '0.5px solid var(--color-border-default)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text-primary)' }}>Product List</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{filteredProducts.length} items</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow style={{ background: 'var(--color-admin-table-head)' }} className="hover:bg-[var(--color-admin-table-head)]">
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Product</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Price</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stock</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rating</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sales</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} style={{ borderBottom: '1px solid var(--color-admin-table-head)' }}>
                  <TableCell><div style={{ height: 48, width: 48, background: 'var(--color-admin-table-head)', borderRadius: 8, animation: 'pulse 1.5s ease infinite' }}></div></TableCell>
                  <TableCell><div style={{ height: 14, width: 96, background: 'var(--color-admin-table-head)', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }}></div></TableCell>
                  <TableCell><div style={{ height: 14, width: 64, background: 'var(--color-admin-table-head)', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }}></div></TableCell>
                  <TableCell><div style={{ height: 14, width: 48, background: 'var(--color-admin-table-head)', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }}></div></TableCell>
                  <TableCell><div style={{ height: 24, width: 80, background: 'var(--color-admin-table-head)', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }}></div></TableCell>
                  <TableCell><div style={{ height: 14, width: 48, background: 'var(--color-admin-table-head)', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }}></div></TableCell>
                  <TableCell><div style={{ height: 14, width: 48, background: 'var(--color-admin-table-head)', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }}></div></TableCell>
                  <TableCell><div style={{ height: 32, width: 32, background: 'var(--color-admin-table-head)', borderRadius: 8, animation: 'pulse 1.5s ease infinite', marginLeft: 'auto' }}></div></TableCell>
                </TableRow>
              ))
            ) : paginatedProducts.length > 0 ? (
              paginatedProducts.map((product: any) => (
                <TableRow key={product.id}
                  style={{ borderBottom: '1px solid var(--color-admin-table-head)', transition: 'background 0.12s ease' }}
                  className="hover:bg-[var(--color-surface-page)]"
                >
                  <TableCell style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 8,
                        overflow: 'hidden', border: '1px solid var(--color-border-default)',
                        flexShrink: 0, background: 'var(--color-admin-table-head)',
                      }}>
                        <img
                          src={product.images?.[0] || '/placeholder.svg'}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                        />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>{product.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>SKU: {product.sku}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px', fontSize: 14, color: 'var(--color-text-secondary)' }}>{product.categories?.name || 'Unknown'}</TableCell>
                  <TableCell style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>₹{product.price}</TableCell>
                  <TableCell style={{ padding: '12px 16px', fontSize: 14, color: 'var(--color-text-secondary)' }}>{product.stock_quantity}</TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                      ...getStatusStyle(product),
                    }}>
                      {getStatus(product)}
                    </span>
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px', fontSize: 14, color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-brand-yellow)' }}>★</span> {product.rating || 'N/A'}
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px', fontSize: 14, color: 'var(--color-text-secondary)' }}>{product.sales || 0}</TableCell>
                  <TableCell style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[var(--color-admin-table-head)] rounded-lg data-[state=open]:bg-[var(--color-admin-table-head)] text-[var(--color-text-secondary)]">
                          <span className="sr-only">Open menu</span>
                          <span style={{ fontSize: 20, lineHeight: 1 }}>⋯</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-lg border-[var(--color-border-default)] shadow-lg bg-white p-1 min-w-[120px]">
                        <DropdownMenuItem
                          onClick={() => navigate(`/product/${product.sku || product.id}`)}
                          className="rounded-md hover:bg-[var(--color-surface-page)] cursor-pointer text-sm py-2 text-[var(--color-text-primary)]"
                        >
                          <Eye className="mr-2 h-4 w-4 text-[var(--color-brand-red)]" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                          className="rounded-md hover:bg-[var(--color-surface-page)] cursor-pointer text-sm py-2 text-[var(--color-text-primary)]"
                        >
                          <Edit className="mr-2 h-4 w-4 text-[var(--color-brand-red)]" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="rounded-md hover:bg-red-50 text-red-600 cursor-pointer text-sm py-2 focus:bg-red-50 focus:text-red-700"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} style={{ padding: '48px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <Package style={{ width: 36, height: 36, color: '#CBD5E1' }} />
                    <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: 0 }}>No products found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--color-surface-card)', border: '0.5px solid var(--color-border-default)', borderRadius: 12,
          padding: '14px 20px', marginTop: 16,
        }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Page {currentPage} of {totalPages} · {filteredProducts.length} items
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{
                minWidth: 32, height: 32, padding: '0 8px',
                border: '1px solid var(--color-border-default)', borderRadius: 6,
                background: 'var(--color-surface-card)', fontSize: 13, color: currentPage === 1 ? '#CBD5E1' : 'var(--color-text-primary)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              ‹ Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                style={{
                  minWidth: 32, height: 32, padding: '0 8px',
                  border: '1px solid', borderColor: page === currentPage ? 'var(--color-brand-red)' : 'var(--color-border-default)',
                  borderRadius: 6,
                  background: page === currentPage ? 'var(--color-brand-red)' : 'var(--color-surface-card)',
                  fontSize: 13,
                  color: page === currentPage ? 'var(--color-surface-card)' : 'var(--color-text-primary)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{
                minWidth: 32, height: 32, padding: '0 8px',
                border: '1px solid var(--color-border-default)', borderRadius: 6,
                background: 'var(--color-surface-card)', fontSize: 13, color: currentPage === totalPages ? '#CBD5E1' : 'var(--color-text-primary)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
