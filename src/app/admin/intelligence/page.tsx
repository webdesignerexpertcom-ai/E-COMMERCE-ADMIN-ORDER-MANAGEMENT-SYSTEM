'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Package, Check, X, Bell, Clock, 
  History, ChevronRight, Menu, Layout, Settings, Flame, DollarSign, 
  Download, Archive, Eye, EyeOff, User, PieChart, Home, Monitor, Zap, Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { omsFetch } from '@/lib/api';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ProductIntelligence {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  min: number;
  velocity: number;
  leadTime: number;
  safetyBuffer: number;
  restockStatus: 'none' | 'pending' | 'ordered' | 'completed';
  incomingStock: number;
  image?: string;
  isDemo?: boolean;
  price?: number;
  isArchived?: boolean;
}

const TREND_DATA = [
  { name: 'Mon', stock: 400, demand: 240 },
  { name: 'Tue', stock: 300, demand: 139 },
  { name: 'Wed', stock: 200, demand: 980 },
  { name: 'Thu', stock: 278, demand: 390 },
  { name: 'Fri', stock: 189, demand: 480 },
  { name: 'Sat', stock: 239, demand: 380 },
  { name: 'Sun', stock: 349, demand: 430 },
];

export default function StockIntelligenceDashboard() {
  const [products, setProducts] = useState<ProductIntelligence[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showArchived, setShowArchived] = useState(false);
  
  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<ProductIntelligence | null>(null);
  const [restockQty, setRestockQty] = useState(0);
  
  // Feedback
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await omsFetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.map((p: any) => ({
          ...p,
          id: p._id || p.id,
          stock: Number(p.stock || 0),
          velocity: parseFloat(p.velocity?.toString() || (Math.random() * 2 + 0.5).toFixed(1)),
          leadTime: parseInt(p.leadTime?.toString() || '7'),
          safetyBuffer: 15,
          restockStatus: p.restockStatus || 'none',
          incomingStock: parseInt(p.incomingStock?.toString() || '0'),
          price: parseFloat(p.price?.toString() || '999'),
          category: p.category || 'General',
          isArchived: !!p.isArchived
        })));
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleUpdateProduct = async (id: string, updates: Partial<ProductIntelligence>) => {
    try {
      const res = await omsFetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
        return true;
      }
    } catch (err) { console.error(err); }
    return false;
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastOpen(true);
    setTimeout(() => setIsToastOpen(false), 3000);
  };

  const calculateIntelligence = (p: ProductIntelligence) => {
    const stock = Number(p.stock || 0);
    const velocity = Number(p.velocity || 0.1); // Avoid 0
    const leadTime = Number(p.leadTime || 7);
    const price = Number(p.price || 0);

    const demandDuringLead = velocity * leadTime;
    const reorderPoint = Math.ceil(demandDuringLead + (demandDuringLead * 0.15));
    const daysToStockout = velocity > 0 ? (stock / velocity) : 999;
    
    let status: 'OUT OF STOCK' | 'CRITICAL' | 'LOW STOCK' | 'HEALTHY' = 'HEALTHY';
    if (stock <= 0) status = 'OUT OF STOCK';
    else if (stock < (velocity * 2)) status = 'CRITICAL';
    else if (stock < reorderPoint) status = 'LOW STOCK';
    
    const projectedLoss = (status !== 'HEALTHY' && velocity > 0) ? (velocity * price * leadTime).toFixed(0) : '0';
    return { reorderPoint, daysToStockout, status, projectedLoss, stock, velocity };
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch = (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = (activeCategory === 'All' || p.category === activeCategory);
        const matchesArchive = showArchived ? p.isArchived : !p.isArchived;
        return matchesSearch && matchesCategory && matchesArchive;
      })
      .sort((a, b) => {
        const priority = { 'OUT OF STOCK': 0, 'CRITICAL': 1, 'LOW STOCK': 2, 'HEALTHY': 3 };
        return priority[calculateIntelligence(a).status] - priority[calculateIntelligence(b).status];
      });
  }, [products, searchTerm, activeCategory, showArchived]);

  const exportToCSV = () => {
    const headers = ["SKU", "Name", "Stock", "Status"];
    const rows = products.map(p => [p.sku, p.name, p.stock, calculateIntelligence(p).status]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "inventory.csv";
    link.click();
    triggerToast("DATA EXPORTED");
  };

  async function submitRestockOrder(p: ProductIntelligence, qty: number) {
    const success = await handleUpdateProduct(p.id, { restockStatus: 'pending', incomingStock: qty });
    if (success) {
      triggerToast(`${p.sku}: REPLENISHMENT PULSE TRIGGERED`);
      setIsRestockModalOpen(false);
    }
  }

  const navItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'Products', icon: Package },
    { name: 'Alerts', icon: Bell },
    { name: 'Analytics', icon: PieChart },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 🖥️ LEFT SIDEBAR (Fixed Desktop) */}
      <aside className="hidden xl:flex w-72 flex-col bg-white border-r border-slate-200 fixed h-full z-40">
        <div className="p-8 pb-12">
          <div className="flex items-center gap-3 text-indigo-600 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black italic tracking-tighter text-slate-900">OMS Intelligence</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button 
                key={item.name} onClick={() => setActiveTab(item.name)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all group",
                  activeTab === item.name ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-5 h-5", activeTab === item.name ? "text-indigo-400" : "text-slate-300 group-hover:text-slate-600")} />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-slate-100 space-y-4">
           <div className="p-5 bg-indigo-50 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2">Enterprise Plan</p>
              <div className="w-full h-2 bg-indigo-200 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-indigo-600" />
              </div>
           </div>
           <button className="w-full flex items-center gap-3 text-sm font-black text-rose-500 p-2 hover:bg-rose-50 rounded-xl transition-all">
              <Archive className="w-4 h-4" /> System Recovery
           </button>
        </div>
      </aside>

      {/* 📱 MOBILE NAVIGATION (Bottom Bar) */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-20 z-50 px-6 flex items-center justify-between pb-safe">
          {navItems.slice(0, 4).map(item => (
            <button key={item.name} onClick={() => setActiveTab(item.name)} className={cn("flex flex-col items-center gap-1", activeTab === item.name ? "text-indigo-600" : "text-slate-400")}>
              <item.icon className="w-6 h-6" />
              <span className="text-[9px] font-black uppercase tracking-widest">{item.name}</span>
            </button>
          ))}
          <button onClick={() => setMobileMenuOpen(true)} className="flex flex-col items-center gap-1 text-slate-400">
             <Menu className="w-6 h-6" />
             <span className="text-[9px] font-black uppercase tracking-widest">More</span>
          </button>
      </nav>

      {/* 🚀 MAIN WRAPPER */}
      <main className={cn("flex-1 xl:ml-72 transition-all pb-32 xl:pb-12")}>
        
        {/* 🏢 TOP BAR (Responsive) */}
        <header className="sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-3xl z-[30] px-6 lg:px-12 py-6 border-b border-slate-200/40 flex items-center justify-between gap-6">
           <div className="relative flex-1 max-w-xl group">
              <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
              <input 
                type="text" placeholder="Deep search products or SKUs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-black outline-none shadow-sm focus:ring-4 focus:ring-indigo-600/5 transition-all"
              />
           </div>

           <div className="flex items-center gap-3 md:gap-5">
              <button onClick={exportToCSV} className="hidden sm:flex p-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 transition-all">
                <Download className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex relative">
                <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-600 relative">
                  <Bell className="w-5 h-5" />
                  <div className="w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white absolute top-3 right-3" />
                </button>
              </div>
              <button 
                onClick={() => { setActiveItem({ id: '', name: '', sku: '', category: 'General', stock: 0, min: 10, velocity: 1.0, leadTime: 7, safetyBuffer: 15, restockStatus: 'none', incomingStock: 0, isArchived: false }); setIsEditModalOpen(true); }}
                className="flex items-center gap-3 px-6 h-[52px] bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/10 text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
              >
                <Plus className="w-4 h-4" /> <span className="hidden lg:inline">Add Product</span>
              </button>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-200 rounded-2xl border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-slate-400">
                 <User className="w-6 h-6" />
              </div>
           </div>
        </header>

        {/* 📊 CONTENT PULSE */}
        <div className="p-6 lg:p-12 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
               <div className="flex items-center gap-2 mb-2">
                 <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" /> System Online
                 </span>
                 <span className="text-[10px] text-slate-400 font-bold">Updated {new Date().toLocaleTimeString()}</span>
               </div>
               <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Inventory Health</h2>
               <p className="text-slate-500 font-bold max-w-lg">Advanced reorder point tracking and demand forecasting logic active.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { id: 'all', label: 'Total SKUs', val: products.length, icon: Package, color: 'indigo' },
               { id: 'oos', label: 'Out of Stock', val: products.filter(p => p.stock <= 0).length, icon: EyeOff, color: 'rose' },
               { id: 'crit', label: 'Critical Alert', val: products.filter(p => calculateIntelligence(p).status === 'CRITICAL').length, icon: Flame, color: 'amber' },
               { id: 'risk', label: 'Value At Risk', val: `₹${Math.floor(Number(products.reduce((acc, p) => acc + parseFloat(calculateIntelligence(p).projectedLoss), 0)) / 1000)}k`, icon: DollarSign, color: 'emerald' },
             ].map(stat => (
               <div key={stat.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", 
                    stat.color === 'indigo' ? "bg-indigo-50 text-indigo-600" : 
                    stat.color === 'rose' ? "bg-rose-50 text-rose-600" :
                    stat.color === 'amber' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                     <stat.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.val}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
               </div>
             ))}
          </div>

          <section className="space-y-8">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                   {['All', 'Coffee', 'Apparel', 'Appliances', 'General'].map(cat => (
                      <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap", activeCategory === cat ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10 border-slate-900" : "bg-white text-slate-400 border-slate-200 hover:border-slate-400")}>
                        {cat}
                      </button>
                   ))}
                </div>
                <button 
                  onClick={() => setShowArchived(!showArchived)}
                  className={cn("px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all", showArchived ? "bg-amber-100 border-amber-200 text-amber-700" : "bg-white text-slate-400 border-slate-200")}
                >
                   {showArchived ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />} {showArchived ? 'View Active' : 'Show Archives'}
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map(p => {
                    const intel = calculateIntelligence(p);
                    const isCritical = intel.status === 'CRITICAL' || intel.status === 'OUT OF STOCK';
                    return (
                      <motion.div 
                        layout key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-[48px] border border-slate-100 p-8 space-y-8 shadow-sm flex flex-col group relative"
                      >
                         <div className="flex items-center justify-between">
                            <div className="w-16 h-16 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center font-black text-slate-200 overflow-hidden relative shadow-inner">
                               {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <Package className="w-8 h-8" />}
                               {p.isDemo && <div className="absolute inset-0 bg-indigo-600/5 backdrop-blur-[1px]" />}
                            </div>
                            <div className="text-right">
                               <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest", 
                                 intel.status === 'CRITICAL' ? 'bg-rose-100 text-rose-600' : 
                                 intel.status === 'OUT OF STOCK' ? 'bg-slate-900 text-white' : 
                                 intel.status === 'LOW STOCK' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                               )}>
                                  {intel.status}
                               </div>
                               <p className="text-[10px] font-black text-slate-400 mt-2 tracking-widest">{p.sku}</p>
                            </div>
                         </div>

                         <div className="space-y-1">
                            <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight line-clamp-1">{p.name}</h4>
                            <p className="text-sm font-bold text-slate-400">{p.category} Management</p>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-slate-50 rounded-[32px] border border-slate-100">
                               <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Stock</p>
                               <span className="text-2xl font-black text-slate-900">{intel.stock}</span>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-[32px] border border-slate-100">
                               <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Out In</p>
                               <span className={cn("text-2xl font-black", isCritical ? "text-rose-500" : "text-indigo-600")}>
                                 {Math.floor(intel.daysToStockout)}d
                               </span>
                            </div>
                         </div>

                         <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                               <span className="text-slate-400">Inventory Level</span>
                               <span className="text-slate-900">{Math.round((intel.stock / (intel.reorderPoint * 2 || 1)) * 100)}%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5 shadow-inner">
                               <div 
                                 className={cn("h-full rounded-full transition-all duration-700", isCritical ? "bg-rose-500" : "bg-indigo-600")} 
                                 style={{ width: `${Math.min(100, (intel.stock / (intel.reorderPoint * 2 || 1)) * 100)}%` }} 
                               />
                            </div>
                         </div>

                         <div className="mt-auto pt-6 flex flex-col gap-3">
                            {p.restockStatus === 'pending' ? (
                               <div className="w-full py-5 bg-indigo-50 border border-indigo-100 rounded-[28px] text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center justify-center gap-3">
                                  <Clock className="w-4 h-4 animate-spin" /> Ship Pending ({p.incomingStock})
                               </div>
                            ) : (
                               <button 
                                 onClick={() => { setActiveItem(p); setRestockQty(Math.max(50, Math.ceil((p.velocity || 1) * 30))); setIsRestockModalOpen(true); }}
                                 className={cn("w-full py-5 rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/5 active:scale-95 flex items-center justify-center gap-3", isCritical ? "bg-indigo-600 text-white hover:bg-slate-900" : "bg-white border-2 border-slate-100 text-slate-400 hover:border-slate-300")}
                               >
                                  <Truck className="w-4 h-4" /> Initiate Restock
                               </button>
                            )}
                            <button 
                              onClick={() => { setActiveItem(p); setIsEditModalOpen(true); }}
                              className="w-full py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                            >
                               Configure SKU Intelligence
                            </button>
                         </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
             </div>
          </section>
        </div>

        {/* 📉 GLOBAL ANALYTICS LAYER */}
        <section className="px-6 lg:p-12 pb-32">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div className="bg-slate-900 rounded-[56px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col">
                 <div className="flex items-center justify-between mb-10 relative z-10">
                    <h3 className="text-2xl font-black flex items-center gap-3 tracking-tighter italic"><Layout className="w-8 h-8 text-indigo-500" /> Supply Intelligence Matrix</h3>
                    <Monitor className="hidden sm:block w-6 h-6 opacity-20" />
                 </div>
                 <div className="h-[300px] w-full mt-auto relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={TREND_DATA}>
                          <defs><linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                          <XAxis fontSize={10} stroke="#ffffff30" dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis fontSize={10} stroke="#ffffff30" axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '24px', padding: '12px' }} itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '900' }} />
                          <Area type="monotone" dataKey="stock" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#pGrad)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-white rounded-[56px] border border-slate-200 p-8 md:p-12 shadow-sm space-y-10">
                 <div className="flex items-center gap-4"><History className="w-10 h-10 text-slate-900" /><h3 className="text-2xl font-black tracking-tight">System Event Pulse</h3></div>
                 <div className="space-y-6">
                    {['SKU_PROVISIONED', 'ROP_TICKED', 'PROCUREMENT_AUTH'].map((evt, i) => (
                       <div key={i} className="flex gap-5 items-start">
                          <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2 animate-pulse" />
                          <div className="flex-1">
                             <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-black uppercase text-indigo-500 tracking-widest">{evt}</span>
                                <span className="text-[9px] text-slate-400 font-bold">{i + 2}m ago</span>
                             </div>
                             <p className="text-xs font-bold text-slate-600">Decision executed by <span className="text-slate-900 font-black italic underline underline-offset-4 decoration-indigo-600/30 text-[10px]">Autopilot_v2.0</span></p>
                          </div>
                       </div>
                    ))}
                 </div>
                 <button className="w-full py-5 bg-slate-50 text-slate-400 rounded-[28px] text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:text-slate-900 hover:bg-white transition-all">View Full Analytics Engine</button>
              </div>
           </div>
        </section>
      </main>

      {/* 📥 MODALS & DRAWERS */}
      
      <AnimatePresence>
        {isToastOpen && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: -40, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-24 lg:bottom-12 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900 text-white px-8 py-5 rounded-full shadow-4xl flex items-center gap-4 border border-white/5">
             <Check className="w-5 h-5 text-emerald-400" />
             <p className="text-[10px] font-black uppercase tracking-widest">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
         {mobileMenuOpen && (
            <div className="fixed inset-0 z-[2000] xl:hidden flex items-end">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
               <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full bg-white rounded-t-[56px] p-10 flex flex-col gap-6 shadow-4xl border-t-8 border-indigo-600/20">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-2xl font-black italic tracking-tighter">Command System</h3>
                     <button onClick={() => setMobileMenuOpen(false)} className="p-3 bg-slate-50 rounded-2xl"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     {navItems.map(item => (
                        <button key={item.name} onClick={() => { setActiveTab(item.name); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-3 p-8 bg-slate-50 rounded-[40px] text-slate-900 hover:bg-slate-900 hover:text-white transition-all group">
                           <item.icon className="w-8 h-8 opacity-40 group-hover:opacity-100" />
                           <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                        </button>
                     ))}
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      <AnimatePresence>
        {(isRestockModalOpen || isEditModalOpen) && activeItem && (
          <div className="fixed inset-0 z-[1000] flex items-end lg:items-center justify-center p-0 md:p-6 bg-slate-900/80 backdrop-blur-3xl overflow-y-auto overflow-x-hidden">
             <motion.div 
               initial={{ y: 400, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 400, opacity: 0 }}
               className="bg-white rounded-t-[56px] lg:rounded-[64px] shadow-4xl w-full max-w-2xl overflow-hidden border-t-8 lg:border-8 border-white/20"
             >
                <div className="bg-slate-900 p-10 md:p-12 text-white flex justify-between items-center sm:shrink-0 sticky top-0 z-10">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                         {isRestockModalOpen ? <Truck className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
                      </div>
                      <div>
                         <h2 className="text-2xl md:text-4xl font-black tracking-tighter italic">{isRestockModalOpen ? 'Restock Auth' : 'Provision SKU'}</h2>
                         <p className="text-[9px] md:text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] mt-1 pulse">Authorization Protocol Active</p>
                      </div>
                   </div>
                   <button onClick={() => { setIsRestockModalOpen(false); setIsEditModalOpen(false); }} className="p-4 hover:bg-white/10 rounded-2xl transition-colors"><X className="w-8 h-8" /></button>
                </div>
                
                <div className="p-10 md:p-16 space-y-10 md:space-y-12 max-h-[70vh] overflow-y-auto no-scrollbar pb-32 lg:pb-16">
                   {isRestockModalOpen ? (
                     <div className="space-y-10">
                        <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[40px] space-y-4 shadow-inner">
                           <div className="flex justify-between items-center text-sm font-black">
                              <span className="text-slate-400 uppercase text-[10px] tracking-widest">Recommended Surge</span>
                              <span className="text-indigo-600 text-3xl">+{Math.ceil((activeItem.velocity || 0) * 30)} <span className="text-xs italic">UNITS</span></span>
                           </div>
                           <p className="text-xs font-bold text-slate-500 italic opacity-70 leading-relaxed">&quot;Calculated pulse based on velocity of {activeItem.velocity} u/day. This surge covers 30 days of estimated demand.&quot;</p>
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-4">Manual Adjustment</label>
                           <input 
                             type="number" value={restockQty} onChange={(e) => setRestockQty(Number(e.target.value))}
                             className="w-full px-10 py-8 bg-slate-50 border border-slate-200 rounded-[32px] text-5xl font-black text-slate-900 outline-none shadow-inner focus:bg-white focus:border-indigo-600 transition-all"
                           />
                        </div>
                        <button onClick={() => submitRestockOrder(activeItem, restockQty)} className="w-full py-8 bg-slate-900 text-white rounded-[32px] text-xs font-black uppercase tracking-[0.4em] shadow-4xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-4">Ship Shipment <ChevronRight className="w-5 h-5" /></button>
                     </div>
                   ) : (
                     <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 pl-4">Asset Ident</label><input type="text" value={activeItem.name} onChange={(e) => setActiveItem({...activeItem, name: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl font-black outline-none focus:bg-white" /></div>
                           <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 pl-4">SKU Pulse ID</label><input type="text" value={activeItem.sku} onChange={(e) => setActiveItem({...activeItem, sku: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl font-black outline-none uppercase focus:bg-white" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 pl-4">Velocity</label><input type="number" step="0.1" value={activeItem.velocity} onChange={(e) => setActiveItem({...activeItem, velocity: Number(e.target.value)})} className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl font-black outline-none focus:bg-white" /></div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-400 pl-4">Archive State</label>
                             <button onClick={() => setActiveItem({...activeItem, isArchived: !activeItem.isArchived})} className={cn("w-full px-8 py-5 border-2 rounded-3xl font-black text-xs uppercase transition-all", activeItem.isArchived ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-emerald-50 border-emerald-200 text-emerald-600")}>{activeItem.isArchived ? 'Archived' : 'Active'}</button>
                           </div>
                        </div>
                        <button onClick={async () => { if (await handleUpdateProduct(activeItem.id, activeItem)) { triggerToast("ASSET DEPLOYED"); setIsEditModalOpen(false); } }} className="w-full py-8 bg-slate-900 text-white rounded-[32px] text-xs font-black uppercase tracking-[0.4em] shadow-4xl hover:bg-indigo-600 transition-all active:scale-95">Verify & Provision</button>
                     </div>
                   )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
