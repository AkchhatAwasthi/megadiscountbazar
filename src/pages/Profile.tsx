import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AddressManager from '@/components/AddressManager';
import { useNavigate } from 'react-router-dom';
import { User, Package, MapPin, LogOut, ChevronRight, Settings, ShieldCheck, CreditCard, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      let { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error orders:', error);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed Out" });
    navigate('/');
  };

  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  ];

  return (
    <div className="bg-[var(--color-surface-page)] min-h-screen font-inter selection:bg-[var(--color-brand-red)]/10">
      
      <div className="max-w-[1280px] mx-auto px-6 py-12 md:py-20 flex flex-col lg:flex-row gap-12">
        
        {/* Sidebar Navigation */}
        <aside className="lg:w-[320px] flex flex-col gap-6">
           <div className="bg-white p-8 rounded-[16px] border border-[var(--color-border-default)] shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                 <div className="size-[64px] bg-[var(--color-brand-red-light)] rounded-full flex items-center justify-center text-[var(--color-brand-red)] border border-[var(--color-brand-red)]/10">
                    <User size={32} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <h3 className="text-[18px] font-[600] text-[var(--color-text-primary)] truncate">{profileData.full_name || 'My Account'}</h3>
                    <p className="text-[13px] text-[var(--color-text-secondary)] truncate">{user?.email}</p>
                 </div>
              </div>

              <nav className="flex flex-col gap-2">
                 {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center justify-between p-3.5 rounded-[10px] transition-all group ${
                        activeTab === item.id 
                          ? 'bg-[var(--color-brand-red-light)] text-[var(--color-brand-red)] font-[600]' 
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-page)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                         <item.icon size={20} className={activeTab === item.id ? 'text-[var(--color-brand-red)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]'} />
                         <span className="text-[14px]">{item.label}</span>
                      </div>
                      <ChevronRight size={16} className={activeTab === item.id ? 'opacity-100' : 'opacity-0'} />
                    </button>
                 ))}
                 
                 <div className="h-px bg-[var(--color-border-default)] my-3"></div>

                 <button
                   onClick={handleSignOut}
                   className="flex items-center gap-3 p-3.5 rounded-[10px] text-[var(--red-sale)] hover:bg-[#FFF5F5] transition-all transition-colors"
                 >
                   <LogOut size={20} />
                   <span className="text-[14px] font-[600]">Log Out</span>
                 </button>
              </nav>
           </div>

           <div className="bg-[var(--color-brand-red)] text-white p-6 rounded-[16px] shadow-lg shadow-[var(--color-brand-red)]/20 relative overflow-hidden">
              <div className="relative z-10">
                 <h4 className="text-[16px] font-[600] mb-2">Member Support</h4>
                 <p className="text-[13px] text-white/80 leading-relaxed mb-4">
                    Need help with an order or your account? Our team is available 24/7.
                 </p>
                 <button className="bg-white text-[var(--color-brand-red)] px-5 py-2.5 rounded-[8px] text-[13px] font-[600] transition-transform active:scale-[0.98]">
                    Contact Help Center
                 </button>
              </div>
              <ShieldCheck className="absolute -bottom-8 -right-8 size-[140px] text-white/5" strokeWidth={1} />
           </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
           
           {/* Tab Content Header */}
           <div className="mb-10 bg-white p-8 md:p-10 rounded-[20px] border border-[var(--color-border-default)] shadow-sm">
              <div className="flex flex-col gap-2">
                 <h1 className="text-[28px] md:text-[36px] font-[600] text-[var(--color-text-primary)] tracking-tight">
                    {activeTab === 'profile' ? 'Profile Settings' : activeTab === 'orders' ? 'Order History' : 'Saved Addresses'}
                 </h1>
                 <p className="text-[15px] text-[var(--color-text-secondary)]">
                    {activeTab === 'profile' ? 'Manage your personal information and contact details.' : activeTab === 'orders' ? 'Track your active missions and past purchases.' : 'Update your shipping and billing addresses.'}
                 </p>
              </div>

              <div className="h-px bg-[var(--color-border-default)]/50 w-full mt-8 mb-8"></div>

              {/* Tab: Profile */}
              {activeTab === 'profile' && (
                 <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[13px] font-[600] text-[var(--color-text-primary)] uppercase tracking-wider">Full Name</label>
                          <input
                            type="text"
                            value={profileData.full_name}
                            onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                            className="w-full h-12 bg-[var(--color-surface-page)] border border-[var(--color-border-default)] rounded-[8px] px-4 text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-red)]"
                            placeholder="Your display name"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[13px] font-[600] text-[var(--color-text-primary)] uppercase tracking-wider">Phone Number</label>
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className="w-full h-12 bg-[var(--color-surface-page)] border border-[var(--color-border-default)] rounded-[8px] px-4 text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-red)]"
                            placeholder="+91"
                          />
                       </div>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[13px] font-[600] text-[var(--color-text-primary)] uppercase tracking-wider">Email Address</label>
                       <input
                         type="email"
                         value={user?.email || ''}
                         disabled
                         className="w-full h-12 bg-[var(--color-surface-page)] border border-[var(--color-border-default)] rounded-[8px] px-4 text-[14px] opacity-60 cursor-not-allowed"
                       />
                       <p className="text-[11px] text-[var(--color-text-muted)] font-[500]">* Email address cannot be changed for security reasons.</p>
                    </div>

                    <div className="pt-4">
                       <button
                         onClick={updateProfile}
                         disabled={loading}
                         className="bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)] text-[var(--color-text-primary)] px-10 py-3.5 rounded-[8px] font-[600] text-[15px] transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                       >
                         {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                       </button>
                    </div>
                 </div>
              )}

              {/* Tab: Orders */}
              {activeTab === 'orders' && (
                 <div className="space-y-6 animate-in fade-in duration-500">
                    {orders.length === 0 ? (
                       <div className="py-20 flex flex-col items-center justify-center text-center">
                          <div className="size-20 bg-[var(--color-surface-page)] rounded-full flex items-center justify-center text-[var(--color-text-muted)] mb-4">
                             <Package size={32} />
                          </div>
                          <p className="text-[18px] font-[600] text-[var(--color-text-primary)]">You haven't placed any orders yet</p>
                          <p className="text-[14px] text-[var(--color-text-secondary)] mt-2 mb-8">Ready to start shopping? Check out our latest collection.</p>
                          <button onClick={() => navigate('/products')} className="bg-[var(--color-brand-red)] text-white px-8 py-3 rounded-[8px] font-[600] text-[14px]">
                             Browse Products
                          </button>
                       </div>
                    ) : (
                       <div className="space-y-4">
                          {orders.map((order: any) => (
                             <div 
                               key={order.id} 
                               className="group flex flex-col md:flex-row items-center border border-[var(--color-border-default)] rounded-[12px] p-4 md:p-6 transition-all hover:border-[var(--color-brand-red)]/50 hover:bg-[var(--color-brand-red-light)]/5 cursor-pointer"
                               onClick={() => window.open(`/order-detail/${order.id}`, '_blank')}
                             >
                                <div className="size-[80px] bg-[var(--color-surface-page)] rounded-[10px] flex items-center justify-center shrink-0 overflow-hidden border border-[var(--color-border-default)]">
                                   {order.items?.[0]?.image ? (
                                      <img src={order.items[0].image} alt="" className="w-full h-full object-contain p-2" />
                                   ) : (
                                      <Package size={24} className="text-[var(--color-text-muted)]" />
                                   )}
                                </div>
                                <div className="flex-1 px-0 md:px-6 py-4 md:py-0 w-full">
                                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                      <div>
                                         <h4 className="text-[16px] font-[600] text-[var(--color-text-primary)]">Order #{order.order_number?.slice(-8).toUpperCase() || order.id.slice(0, 8)}</h4>
                                         <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
                                            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                         </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                         <span className={`px-3 py-1 rounded-full text-[11px] font-[700] uppercase tracking-wider ${
                                            order.order_status === 'delivered' ? 'bg-[#E6F4EA] text-[#1E7E34]' : 'bg-[#FFF8E6] text-[#A67F00]'
                                         }`}>
                                            {order.order_status}
                                         </span>
                                         <span className="text-[18px] font-[700] text-[var(--color-brand-red)]">₹{order.total?.toLocaleString('en-IN')}</span>
                                      </div>
                                   </div>
                                </div>
                                <div className="shrink-0 flex items-center justify-center p-2 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-red)] transition-colors">
                                   <ChevronRight size={24} />
                                </div>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
              )}

              {/* Tab: Addresses */}
              {activeTab === 'addresses' && (
                 <div className="animate-in fade-in duration-500">
                    <AddressManager />
                 </div>
              )}
           </div>

           {/* Security Strip */}
           <div className="bg-white border border-[var(--color-border-default)] rounded-[20px] p-6 flex items-center gap-6 shadow-sm">
              <div className="size-[48px] bg-[var(--green-fresh)]/10 text-[var(--green-fresh)] rounded-full flex items-center justify-center">
                 <ShieldCheck size={24} />
              </div>
              <div>
                 <h4 className="text-[15px] font-[600] text-[var(--color-text-primary)]">Privacy Protected</h4>
                 <p className="text-[13px] text-[var(--color-text-secondary)]">Your personal data is encrypted and secure with us.</p>
              </div>
           </div>
        </main>

      </div>

    </div>
  );
}
