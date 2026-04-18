import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, Package, ShoppingCart,
  IndianRupee, Calendar, Download, RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/currency';

const COLORS = ['#E01E26', '#F59E0B', '#10B981', '#6366F1', '#EC4899', '#14B8A6'];

const CustomTooltip = ({ active, payload, label, prefix = '' }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--color-text-primary)] text-white px-3 py-2 rounded-[8px] shadow-xl text-[12px]">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-[600]">{prefix}{typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}</p>
      ))}
    </div>
  );
};

const MetricCard = ({ label, value, growth, trend, icon: Icon, color, bg }: any) => (
  <div className="bg-white rounded-[14px] border border-[var(--color-border-default)] p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="size-10 rounded-[10px] flex items-center justify-center" style={{ background: bg }}>
        <Icon size={18} style={{ color }} />
      </div>
      <span className={`flex items-center gap-1 text-[11px] font-[700] px-2 py-1 rounded-full ${trend === 'up' ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
        {trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {Math.abs(growth).toFixed(1)}%
      </span>
    </div>
    <p className="text-[22px] font-[800] text-[var(--color-text-primary)] leading-none">{value}</p>
    <p className="text-[12px] text-[var(--color-text-secondary)] mt-1.5">{label}</p>
    <p className="text-[11px] text-[var(--color-text-muted)] mt-1">vs previous period</p>
  </div>
);

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'customers'>('overview');
  const [metrics, setMetrics] = useState<any>({
    revenue: { current: 0, growth: 0, trend: 'up' },
    orders: { current: 0, growth: 0, trend: 'up' },
    customers: { current: 0, growth: 0, trend: 'up' },
    avgOrder: { current: 0, growth: 0, trend: 'up' },
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => { fetchData(); }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const now = new Date();
      const periodStart = new Date(now.getTime() - days * 86400000);
      const prevStart = new Date(periodStart.getTime() - days * 86400000);

      const [ordersRes, profilesRes] = await Promise.all([
        supabase.from('orders').select('total, created_at, customer_info, items, order_status, user_id').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, created_at, full_name, email'),
      ]);
      const allOrders = ordersRes.data || [];
      const profiles = profilesRes.data || [];

      const cur = allOrders.filter(o => new Date(o.created_at) >= periodStart);
      const prev = allOrders.filter(o => {
        const d = new Date(o.created_at);
        return d >= prevStart && d < periodStart;
      });

      const curRev = cur.reduce((s, o) => s + (o.total || 0), 0);
      const prevRev = prev.reduce((s, o) => s + (o.total || 0), 0);
      const curCust = profiles.filter(p => new Date(p.created_at) >= periodStart).length;
      const prevCust = profiles.filter(p => {
        const d = new Date(p.created_at);
        return d >= prevStart && d < periodStart;
      }).length;
      const curAvg = cur.length > 0 ? curRev / cur.length : 0;
      const prevAvg = prev.length > 0 ? prevRev / prev.length : 0;

      const g = (a: number, b: number) => b > 0 ? ((a - b) / b) * 100 : 0;
      setMetrics({
        revenue: { current: curRev, growth: g(curRev, prevRev), trend: curRev >= prevRev ? 'up' : 'down' },
        orders: { current: cur.length, growth: g(cur.length, prev.length), trend: cur.length >= prev.length ? 'up' : 'down' },
        customers: { current: curCust, growth: g(curCust, prevCust), trend: curCust >= prevCust ? 'up' : 'down' },
        avgOrder: { current: curAvg, growth: g(curAvg, prevAvg), trend: curAvg >= prevAvg ? 'up' : 'down' },
      });

      // Daily chart data
      const dayMap: Record<string, { revenue: number; orders: number }> = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        dayMap[key] = { revenue: 0, orders: 0 };
      }
      cur.forEach(o => {
        const key = new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        if (dayMap[key]) { dayMap[key].revenue += o.total || 0; dayMap[key].orders += 1; }
      });
      setChartData(Object.entries(dayMap).map(([date, v]) => ({ date, ...v })));

      // Category breakdown
      const catMap: Record<string, { revenue: number; orders: number; qty: number }> = {};
      cur.forEach(o => {
        (o.items as any[] || []).forEach((item: any) => {
          const cat = item.category || 'General';
          if (!catMap[cat]) catMap[cat] = { revenue: 0, orders: 0, qty: 0 };
          catMap[cat].revenue += (item.price || 0) * (item.quantity || 0);
          catMap[cat].orders += 1;
          catMap[cat].qty += item.quantity || 0;
        });
      });
      setCategoryData(Object.entries(catMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 6));

      // Order status
      const sMap: Record<string, number> = {};
      allOrders.forEach(o => {
        const s = o.order_status || 'pending';
        sMap[s] = (sMap[s] || 0) + 1;
      });
      setOrderStatusData(Object.entries(sMap).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      // Top customers
      const custMap = new Map<string, any>();
      cur.forEach(o => {
        const id = o.user_id || (o.customer_info as any)?.email || 'guest';
        let name = 'Guest';
        if (o.user_id) {
          const p = profiles.find(p => p.id === o.user_id);
          name = p?.full_name || p?.email || 'Customer';
        } else if (o.customer_info) {
          name = (o.customer_info as any)?.name || 'Guest';
        }
        if (!custMap.has(id)) custMap.set(id, { name, orders: 0, spent: 0 });
        const c = custMap.get(id);
        c.orders += 1;
        c.spent += o.total || 0;
      });
      setTopCustomers([...custMap.values()].sort((a, b) => b.spent - a.spent).slice(0, 6));

    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to load analytics', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="size-8 rounded-full border-[3px] border-[var(--color-brand-red-light)] border-t-[var(--color-brand-red)] animate-spin" />
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'categories', label: 'Categories' },
    { key: 'customers', label: 'Customers' },
  ] as const;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-[700] text-[var(--color-text-primary)]">Analytics</h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">Business performance insights</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 h-9 px-3 rounded-[8px] border border-[var(--color-border-default)] bg-white text-[13px]">
            <Calendar size={14} className="text-[var(--color-text-muted)]" />
            <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="bg-transparent border-none outline-none text-[var(--color-text-primary)] text-[13px] cursor-pointer">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <button onClick={fetchData} className="h-9 w-9 flex items-center justify-center rounded-[8px] border border-[var(--color-border-default)] bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-brand-red)] transition-colors">
            <RefreshCw size={14} />
          </button>
          <button className="h-9 px-3 flex items-center gap-1.5 rounded-[8px] border border-[var(--color-border-default)] bg-white text-[12px] font-[600] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="Revenue" value={formatPrice(metrics.revenue.current)} growth={metrics.revenue.growth} trend={metrics.revenue.trend} icon={IndianRupee} color="var(--color-brand-red)" bg="var(--color-brand-red-light)" />
        <MetricCard label="Orders" value={metrics.orders.current} growth={metrics.orders.growth} trend={metrics.orders.trend} icon={ShoppingCart} color="#D97706" bg="#FEF3C7" />
        <MetricCard label="New Customers" value={metrics.customers.current} growth={metrics.customers.growth} trend={metrics.customers.trend} icon={Users} color="#7C3AED" bg="#EDE9FE" />
        <MetricCard label="Avg. Order Value" value={formatPrice(metrics.avgOrder.current)} growth={metrics.avgOrder.growth} trend={metrics.avgOrder.trend} icon={Package} color="#059669" bg="#D1FAE5" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-[var(--color-surface-page)] p-1 rounded-[10px] w-fit border border-[var(--color-border-default)]">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 h-8 rounded-[8px] text-[13px] font-[600] transition-all ${activeTab === t.key ? 'bg-white text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-5">

          {/* Revenue + Orders charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 bg-white rounded-[14px] border border-[var(--color-border-default)] p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[14px] font-[700] text-[var(--color-text-primary)]">Revenue Over Time</p>
                  <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">Daily revenue breakdown</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-brand-red)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--color-brand-red)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false}
                    interval={dateRange === '7d' ? 0 : dateRange === '30d' ? 4 : 9} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false}
                    tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} width={48} />
                  <Tooltip content={<CustomTooltip prefix="₹" />} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-brand-red)" strokeWidth={2}
                    fill="url(#aGrad)" dot={false} activeDot={{ r: 4, fill: 'var(--color-brand-red)' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-[14px] border border-[var(--color-border-default)] p-5">
              <p className="text-[14px] font-[700] text-[var(--color-text-primary)] mb-1">Order Status</p>
              <p className="text-[12px] text-[var(--color-text-secondary)] mb-5">All-time breakdown</p>
              {orderStatusData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={orderStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={64} innerRadius={36} strokeWidth={0}>
                        {orderStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => [v, 'Orders']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-3">
                    {orderStatusData.map((s, i) => (
                      <div key={s.name} className="flex items-center justify-between text-[12px]">
                        <div className="flex items-center gap-2">
                          <div className="size-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-[var(--color-text-secondary)]">{s.name}</span>
                        </div>
                        <span className="font-[700] text-[var(--color-text-primary)]">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-40 text-[var(--color-text-muted)] text-[13px]">No data yet</div>
              )}
            </div>
          </div>

          {/* Orders bar chart */}
          <div className="bg-white rounded-[14px] border border-[var(--color-border-default)] p-5">
            <p className="text-[14px] font-[700] text-[var(--color-text-primary)] mb-1">Daily Orders</p>
            <p className="text-[12px] text-[var(--color-text-secondary)] mb-5">Order volume per day</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false}
                  interval={dateRange === '7d' ? 0 : dateRange === '30d' ? 4 : 9} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" fill="var(--color-brand-red)" radius={[4, 4, 0, 0]} maxBarSize={32} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Bar chart */}
            <div className="bg-white rounded-[14px] border border-[var(--color-border-default)] p-5">
              <p className="text-[14px] font-[700] text-[var(--color-text-primary)] mb-1">Revenue by Category</p>
              <p className="text-[12px] text-[var(--color-text-secondary)] mb-5">Current period</p>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false}
                      tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip content={<CustomTooltip prefix="₹" />} />
                    <Bar dataKey="revenue" fill="var(--color-brand-red)" radius={[0, 4, 4, 0]} maxBarSize={20} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-[var(--color-text-muted)] text-[13px]">No category data yet</div>
              )}
            </div>

            {/* Category table */}
            <div className="bg-white rounded-[14px] border border-[var(--color-border-default)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--color-border-default)]">
                <p className="text-[14px] font-[700] text-[var(--color-text-primary)]">Category Performance</p>
              </div>
              <div className="divide-y divide-[var(--color-border-default)]/60">
                {categoryData.length === 0 ? (
                  <p className="text-center text-[13px] text-[var(--color-text-muted)] py-8">No data yet</p>
                ) : categoryData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--color-surface-page)] transition-colors">
                    <div className="size-8 rounded-[8px] flex items-center justify-center text-[12px] font-[800] shrink-0"
                      style={{ background: i === 0 ? 'var(--color-brand-red)' : 'var(--color-surface-page)', color: i === 0 ? 'white' : 'var(--color-text-muted)' }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-[600] text-[var(--color-text-primary)]">{cat.name}</p>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{cat.orders} items · {cat.qty} units</p>
                    </div>
                    <p className="text-[13px] font-[700] text-[var(--color-text-primary)] shrink-0">{formatPrice(cat.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="space-y-5">
          <div className="bg-white rounded-[14px] border border-[var(--color-border-default)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border-default)]">
              <p className="text-[14px] font-[700] text-[var(--color-text-primary)]">Top Customers</p>
              <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">By total spend in selected period</p>
            </div>
            <div className="divide-y divide-[var(--color-border-default)]/60">
              {topCustomers.length === 0 ? (
                <p className="text-center text-[13px] text-[var(--color-text-muted)] py-8">No customer data yet</p>
              ) : topCustomers.map((c, i) => (
                <div key={c.name + i} className="flex items-center gap-3 px-5 py-4 hover:bg-[var(--color-surface-page)] transition-colors">
                  <div className="size-9 rounded-full flex items-center justify-center text-[13px] font-[800] shrink-0 text-white"
                    style={{ background: i < 3 ? `hsl(${i * 60}, 65%, 45%)` : 'var(--color-surface-page)', color: i < 3 ? 'white' : 'var(--color-text-muted)' }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-[600] text-[var(--color-text-primary)] truncate">{c.name}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{c.orders} order{c.orders !== 1 ? 's' : ''} · avg {formatPrice(c.spent / c.orders)}</p>
                  </div>
                  <p className="text-[14px] font-[800] text-[var(--color-text-primary)] shrink-0">{formatPrice(c.spent)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer acquisition trend */}
          <div className="bg-white rounded-[14px] border border-[var(--color-border-default)] p-5">
            <p className="text-[14px] font-[700] text-[var(--color-text-primary)] mb-1">Customer Summary</p>
            <p className="text-[12px] text-[var(--color-text-secondary)] mb-5">Period stats</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'New This Period', value: metrics.customers.current, color: '#7C3AED' },
                { label: 'Total Orders', value: metrics.orders.current, color: 'var(--color-brand-red)' },
                { label: 'Avg Order Value', value: formatPrice(metrics.avgOrder.current), color: '#059669' },
                { label: 'Total Revenue', value: formatPrice(metrics.revenue.current), color: '#D97706' },
              ].map(stat => (
                <div key={stat.label} className="rounded-[10px] p-4" style={{ background: 'var(--color-surface-page)' }}>
                  <p className="text-[20px] font-[800] leading-none" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[11px] text-[var(--color-text-secondary)] mt-1.5 leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
