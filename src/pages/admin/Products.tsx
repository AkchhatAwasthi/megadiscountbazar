import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, Package } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

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
        .select('name')
        .eq('is_active', true);

      if (error) throw error;
      const categoryNames = data?.map(cat => cat.name) || [];
      setCategories(['all', ...categoryNames]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
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
          <h1 style={{ fontSize: 22, fontWeight: 500, color: '#1A1A1A', margin: 0 }}>Products</h1>
          <p style={{ fontSize: 13, color: '#9AA0A6', margin: '4px 0 0' }}>Manage your product inventory</p>
        </div>
        <button
          onClick={() => navigate('/admin/products/add')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#0071DC', color: '#FFFFFF',
            border: 'none', borderRadius: 8, padding: '8px 18px',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#0055A6';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = '#0071DC';
            (e.currentTarget as HTMLElement).style.transform = 'none';
          }}
        >
          <Plus style={{ width: 16, height: 16 }} />
          Add Product
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{
        background: '#FFFFFF', border: '0.5px solid #E0E3E7', borderRadius: 12,
        padding: '16px 20px', marginBottom: 20,
        display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9AA0A6', pointerEvents: 'none' }} />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              height: 36, paddingLeft: 34,
              border: '1.5px solid #E0E3E7', borderRadius: 8,
              fontSize: 14, color: '#1A1A1A', background: '#FFFFFF', outline: 'none',
            }}
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            height: 36, padding: '0 36px 0 12px',
            border: '1.5px solid #E0E3E7', borderRadius: 8,
            fontSize: 14, color: '#1A1A1A', background: '#FFFFFF',
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
      <div style={{ background: '#FFFFFF', border: '0.5px solid #E0E3E7', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E0E3E7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 17, fontWeight: 500, color: '#1A1A1A' }}>Product List</span>
          <span style={{ fontSize: 12, color: '#9AA0A6' }}>{filteredProducts.length} items</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow style={{ background: '#F0F4F8' }} className="hover:bg-[#F0F4F8]">
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Product</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Price</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stock</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rating</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sales</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} style={{ borderBottom: '1px solid #F0F4F8' }}>
                  <TableCell><div style={{ height: 48, width: 48, background: '#F0F4F8', borderRadius: 8, animation: 'pulse 1.5s ease infinite' }}></div></TableCell>
                  <TableCell><div style={{ height: 14, width: 96, background: '#F0F4F8', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }}></div></TableCell>
                  <TableCell><div style={{ height: 14, width: 64, background: '#F0F4F8', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }}></div></TableCell>
                  <TableCell><div style={{ height: 14, width: 48, background: '#F0F4F8', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }}></div></TableCell>
                  <TableCell><div style={{ height: 24, width: 80, background: '#F0F4F8', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }}></div></TableCell>
                  <TableCell><div style={{ height: 14, width: 48, background: '#F0F4F8', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }}></div></TableCell>
                  <TableCell><div style={{ height: 14, width: 48, background: '#F0F4F8', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }}></div></TableCell>
                  <TableCell><div style={{ height: 32, width: 32, background: '#F0F4F8', borderRadius: 8, animation: 'pulse 1.5s ease infinite', marginLeft: 'auto' }}></div></TableCell>
                </TableRow>
              ))
            ) : paginatedProducts.length > 0 ? (
              paginatedProducts.map((product: any) => (
                <TableRow key={product.id}
                  style={{ borderBottom: '1px solid #F0F4F8', transition: 'background 0.12s ease' }}
                  className="hover:bg-[#F8FBFF]"
                >
                  <TableCell style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 8,
                        overflow: 'hidden', border: '1px solid #E0E3E7',
                        flexShrink: 0, background: '#F0F4F8',
                      }}>
                        <img
                          src={product.images?.[0] || '/placeholder.svg'}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                        />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A', margin: 0 }}>{product.name}</p>
                        <p style={{ fontSize: 11, color: '#9AA0A6', margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>SKU: {product.sku}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px', fontSize: 14, color: '#5F6368' }}>{product.categories?.name || 'Unknown'}</TableCell>
                  <TableCell style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>₹{product.price}</TableCell>
                  <TableCell style={{ padding: '12px 16px', fontSize: 14, color: '#5F6368' }}>{product.stock_quantity}</TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                      ...getStatusStyle(product),
                    }}>
                      {getStatus(product)}
                    </span>
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px', fontSize: 14, color: '#5F6368' }}>
                    <span style={{ color: '#FFC220' }}>★</span> {product.rating || 'N/A'}
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px', fontSize: 14, color: '#5F6368' }}>{product.sales || 0}</TableCell>
                  <TableCell style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#F0F4F8] rounded-lg data-[state=open]:bg-[#F0F4F8] text-[#5F6368]">
                          <span className="sr-only">Open menu</span>
                          <span style={{ fontSize: 20, lineHeight: 1 }}>⋯</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-lg border-[#E0E3E7] shadow-lg bg-white p-1 min-w-[120px]">
                        <DropdownMenuItem
                          onClick={() => navigate(`/product/${product.sku || product.id}`)}
                          className="rounded-md hover:bg-[#F8FBFF] cursor-pointer text-sm py-2 text-[#1A1A1A]"
                        >
                          <Eye className="mr-2 h-4 w-4 text-[#0071DC]" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                          className="rounded-md hover:bg-[#F8FBFF] cursor-pointer text-sm py-2 text-[#1A1A1A]"
                        >
                          <Edit className="mr-2 h-4 w-4 text-[#0071DC]" />
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
                    <p style={{ fontSize: 14, color: '#9AA0A6', margin: 0 }}>No products found.</p>
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
          background: '#FFFFFF', border: '0.5px solid #E0E3E7', borderRadius: 12,
          padding: '14px 20px', marginTop: 16,
        }}>
          <span style={{ fontSize: 13, color: '#5F6368' }}>
            Page {currentPage} of {totalPages} · {filteredProducts.length} items
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{
                minWidth: 32, height: 32, padding: '0 8px',
                border: '1px solid #E0E3E7', borderRadius: 6,
                background: '#FFFFFF', fontSize: 13, color: currentPage === 1 ? '#CBD5E1' : '#1A1A1A',
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
                  border: '1px solid', borderColor: page === currentPage ? '#0071DC' : '#E0E3E7',
                  borderRadius: 6,
                  background: page === currentPage ? '#0071DC' : '#FFFFFF',
                  fontSize: 13,
                  color: page === currentPage ? '#FFFFFF' : '#1A1A1A',
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
                border: '1px solid #E0E3E7', borderRadius: 6,
                background: '#FFFFFF', fontSize: 13, color: currentPage === totalPages ? '#CBD5E1' : '#1A1A1A',
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