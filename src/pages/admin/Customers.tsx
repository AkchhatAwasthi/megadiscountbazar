import { useState, useEffect } from 'react';
import { Search, Users, Mail, Phone, MapPin, Calendar, Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  joinDate: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      // Fetch profiles with order statistics
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch orders to calculate statistics
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('user_id, total, created_at, customer_info');

      if (ordersError) throw ordersError;

      // Process customer data with order statistics
      const customersData: Customer[] = profiles?.map(profile => {
        // Get orders for this user (by user_id or email fallback)
        const userOrders = orders?.filter(order =>
          order.user_id === profile.id ||
          (order.customer_info as any)?.email === profile.email
        ) || [];

        const totalOrders = userOrders.length;
        const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const lastOrder = userOrders.length > 0
          ? userOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null;

        // Determine status based on recent activity (active if ordered in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const isActive = lastOrder ? new Date(lastOrder) > thirtyDaysAgo : false;

        return {
          id: profile.id,
          name: profile.full_name || 'Unknown User',
          email: profile.email,
          phone: profile.phone || 'Not provided',
          location: 'Not specified', // We don't have location in profiles, could be derived from addresses
          totalOrders,
          totalSpent,
          lastOrder: lastOrder ? new Date(lastOrder).toLocaleDateString('en-IN') : 'Never',
          joinDate: new Date(profile.created_at).toLocaleDateString('en-IN'),
          status: isActive ? 'active' : 'inactive'
        };
      }) || [];

      setCustomers(customersData);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch customers data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };



  const statuses = ['all', 'active', 'inactive'];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-gray-100 text-gray-500 border-gray-200';
  };

  const customerStats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    inactive: customers.filter(c => c.status === 'inactive').length,
    totalRevenue: customers.reduce((sum, customer) => sum + customer.totalSpent, 0),
    avgOrderValue: customers.length > 0
      ? customers.reduce((sum, customer) => sum + customer.totalSpent, 0) / Math.max(customers.reduce((sum, customer) => sum + customer.totalOrders, 0), 1)
      : 0
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: 36, height: 36, border: '3px solid var(--color-brand-red-light)',
          borderTopColor: 'var(--color-brand-red)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Total Customers', value: customerStats.total, icon: <Users style={{ width: 16, height: 16, color: 'var(--color-brand-red)' }} />, iconBg: 'var(--color-brand-red-light)' },
    { label: 'Active', value: customerStats.active, icon: <Users style={{ width: 16, height: 16, color: '#2E8B57' }} />, iconBg: '#EAF3DE' },
    { label: 'Inactive', value: customerStats.inactive, icon: <Users style={{ width: 16, height: 16, color: 'var(--color-text-muted)' }} />, iconBg: 'var(--color-admin-table-head)' },
    { label: 'Total Revenue', value: `₹${customerStats.totalRevenue.toLocaleString('en-IN')}`, icon: <Users style={{ width: 16, height: 16, color: 'var(--color-brand-yellow)' }} />, iconBg: '#FFF8E6' },
    { label: 'Avg Order Value', value: `₹${Math.round(customerStats.avgOrderValue).toLocaleString('en-IN')}`, icon: <Users style={{ width: 16, height: 16, color: '#9B59B6' }} />, iconBg: '#EEEDFE' },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>Customers</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>Manage your customer relationships</p>
        </div>
      </div>

      {/* Stats KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}
        className="max-lg:grid-cols-3 max-sm:grid-cols-2">
        {kpiCards.map((card) => (
          <div key={card.label} style={{
            background: 'var(--color-surface-card)', border: '0.5px solid var(--color-border-default)', borderRadius: 12,
            padding: '16px 20px', transition: 'box-shadow 0.2s ease',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.07)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar / Filters */}
      <div style={{
        background: 'var(--color-surface-card)', border: '0.5px solid var(--color-border-default)', borderRadius: 12,
        padding: '16px 20px', marginBottom: 20,
        display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              height: 36, paddingLeft: 34, paddingRight: 12,
              border: '1.5px solid var(--color-border-default)', borderRadius: 8,
              fontSize: 14, color: 'var(--color-text-primary)', background: 'var(--color-surface-card)', outline: 'none',
            }}
          />
        </div>
        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            height: 36, padding: '0 36px 0 12px', border: '1.5px solid var(--color-border-default)',
            borderRadius: 8, fontSize: 14, color: 'var(--color-text-primary)', background: 'var(--color-surface-card)',
            cursor: 'pointer', outline: 'none', minWidth: 180,
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235F6368' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
          }}
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Customers' : status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Customers Table */}
      <div style={{ background: 'var(--color-surface-card)', border: '0.5px solid var(--color-border-default)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text-primary)' }}>Customer List</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{filteredCustomers.length} results</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow style={{ background: 'var(--color-admin-table-head)' }} className="hover:bg-[var(--color-admin-table-head)]">
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Customer</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Location</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Orders</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Spent</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last Order</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</TableHead>
              <TableHead style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}
                style={{ borderBottom: '1px solid var(--color-admin-table-head)', transition: 'background 0.12s ease' }}
                className="hover:bg-[var(--color-surface-page)]"
              >
                <TableCell style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: 'linear-gradient(135deg, var(--color-brand-red-light), #B5D4F4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0C447C' }}>
                        {customer.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>{customer.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '2px 0 0', fontFamily: 'monospace' }}>{customer.id.substring(0, 8)}...</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      <Mail style={{ width: 12, height: 12, color: 'var(--color-text-muted)' }} />
                      {customer.email}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      <Phone style={{ width: 12, height: 12, color: 'var(--color-text-muted)' }} />
                      {customer.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    <MapPin style={{ width: 12, height: 12, color: 'var(--color-text-muted)' }} />
                    {customer.location}
                  </div>
                </TableCell>
                <TableCell style={{ padding: '12px 16px', fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 500 }}>{customer.totalOrders}</TableCell>
                <TableCell style={{ padding: '12px 16px', fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 500 }}>₹{customer.totalSpent.toLocaleString('en-IN')}</TableCell>
                <TableCell style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    <Calendar style={{ width: 12, height: 12, color: 'var(--color-text-muted)' }} />
                    {customer.lastOrder}
                  </div>
                </TableCell>
                <TableCell style={{ padding: '12px 16px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                    background: customer.status === 'active' ? '#EAF3DE' : '#F1EFE8',
                    color: customer.status === 'active' ? '#27500A' : '#444441',
                  }}>
                    {customer.status}
                  </span>
                </TableCell>
                <TableCell style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[var(--color-admin-table-head)] rounded-lg data-[state=open]:bg-[var(--color-admin-table-head)] text-[var(--color-text-secondary)]">
                        <span className="sr-only">Open menu</span>
                        <span style={{ fontSize: 20, lineHeight: 1 }}>⋯</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-lg border-[var(--color-border-default)] shadow-lg bg-white p-1 min-w-[140px]">
                      <DropdownMenuItem className="rounded-md hover:bg-[var(--color-surface-page)] cursor-pointer text-sm py-2 text-[var(--color-text-primary)]">
                        <Eye className="mr-2 h-4 w-4 text-[var(--color-brand-red)]" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-md hover:bg-[var(--color-surface-page)] cursor-pointer text-sm py-2 text-[var(--color-text-primary)]">
                        <Edit className="mr-2 h-4 w-4 text-[var(--color-brand-red)]" />
                        Edit Customer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminCustomers;
