'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Activity, 
  AlertTriangle, 
  Zap, 
  TrendingDown, 
  TrendingUp,
  Package,
  Calendar,
  ChevronRight,
  MoreVertical,
  Layers,
  Edit2,
  Trash2,
  Check,
  X,
  Bell,
  Mail,
  MessageSquare,
  Clock,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { omsFetch } from '@/lib/api';

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
}

export default function StockIntelligenceDashboard() {
  const [products, setProducts] = useState<ProductIntelligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductIntelligence | null>(null);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Settings
  const [globalSafetyBuffer, setGlobalSafetyBuffer] = useState(15);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    inApp: true
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await omsFetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.map((p: any) => ({
          ...p,
          id: p._id || p.id,
          // Ensure defaults if DB fields are null
          velocity: p.velocity || (Math.random() * 5 + 1).toFixed(1),
          leadTime: p.leadTime || 7,
          safetyBuffer: p.safetyBuffer || 15,
          restockStatus: p.restockStatus || 'none',
          incomingStock: p.incomingStock || 0
        })));
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastOpen(true);
    setTimeout(() => setIsToastOpen(false), 3000);
  };

  // Logic: Reorder Point = (Velocity * Lead Time) + Buffer
  const calculateIntelligence = (p: ProductIntelligence) => {
    const demandDuringLead = p.velocity * p.leadTime;
    const bufferUnits = (demandDuringLead * (p.safetyBuffer / 100));
    const reorderPoint = Math.ceil(demandDuringLead + bufferUnits);
    const stockoutDays = p.velocity > 0 ? Math.floor(p.stock / p.velocity) : 999;
    
    let status: 'Critical' | 'Low' | 'Healthy' = 'Healthy';
    if (p.stock <= p.min || stockoutDays <= 3) status = 'Critical';
    else if (p.stock <= reorderPoint) status = 'Low';

    return { reorderPoint, stockoutDays, status };
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory]);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const handleUpdateProduct = async (updated: Partial<ProductIntelligence>) => {
    if (!editingItem) return;
    try {
      const env = localStorage.getItem('oms-environment') || 'production';
      const res = await omsFetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-environment': env },
        body: JSON.stringify({ id: editingItem.id, ...updated })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Sync Successful: Asset Matrix Updated");
        fetchProducts();
        setIsEditModalOpen(false);
      }
    } catch (err) {
      triggerToast("Network Link Failure: Update Aborted");
    }
  };

  const initiateRestock = async (p: ProductIntelligence) => {
    if (p.restockStatus !== 'none') return;
    
    // Simulate restock logic
    const intel = calculateIntelligence(p);
    const orderQuantity = Math.max(50, Math.ceil(p.velocity * 30 * (1 + p.safetyBuffer/100)));
    
    triggerToast(`Replenishment protocol initiated for ${p.sku}...`);
    
    // Update local state and DB
    await handleUpdateProduct({ 
       ...p,
       restockStatus: 'pending',
       incomingStock: orderQuantity
    });
  };

  return (
    <div className="space-y-10 min-h-screen pb-20">
      <AnimatePresence>
        {isToastOpen && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 border border-white/10 text-white px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-4"
          >
             <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
             </div>
             <p className="text-sm font-black uppercase tracking-widest">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Global Settings */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-2">Stock Intelligence</h1>
          <p className="text-slate-500 font-bold italic opacity-70">Predictive replenishment fueled by sales velocity.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white border border-slate-200 rounded-[28px] p-2 flex items-center gap-2 shadow-sm">
              <span className="pl-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Global Buffer</span>
              <input 
                 type="number" 
                 value={globalSafetyBuffer} 
                 onChange={(e) => setGlobalSafetyBuffer(Number(e.target.value))}
                 className="w-16 h-10 bg-slate-50 border border-slate-100 rounded-2xl text-center font-black text-indigo-600 outline-none focus:bg-white transition-all"
              />
              <span className="pr-4 text-xs font-black text-slate-400">%</span>
           </div>
           <button 
             onClick={() => triggerToast("New Listing Matrix Opening...")}
             className="px-10 py-5 bg-indigo-600 text-white rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
           >
             <Plus className="w-5 h-5 font-black" /> Add New Asset
           </button>
        </div>
      </div>

      {/* Alerts Grid - The "Requires Action" View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {['Critical', 'Low', 'Healthy'].map((status) => {
            const items = products.filter(p => calculateIntelligence(p).status === status);
            const bgColor = status === 'Critical' ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                            status === 'Low' ? 'bg-amber-50 border-amber-100 text-amber-600' : 
                            'bg-emerald-50 border-emerald-100 text-emerald-600';
            const accentColor = status === 'Critical' ? 'bg-rose-600' : 
                               status === 'Low' ? 'bg-amber-500' : 
                               'bg-emerald-500';

            return (
              <motion.div 
                key={status}
                whileHover={{ y: -4 }}
                className={cn("p-10 rounded-[48px] border-2 shadow-sm relative overflow-hidden group", bgColor)}
              >
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                    {status === 'Critical' ? <AlertTriangle className="w-20 h-20" /> : <Activity className="w-20 h-20" />}
                 </div>
                 <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className={cn("w-3 h-3 rounded-full animate-pulse", accentColor)} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80">{status} Signal</span>
                 </div>
                 <div className="relative z-10">
                    <h3 className="text-6xl font-black tracking-tighter mb-1 leading-none">{items.length}</h3>
                    <p className="text-sm font-black uppercase tracking-widest opacity-60">Products {status === 'Healthy' ? 'Tracked' : 'Require Intervention'}</p>
                 </div>
              </motion.div>
            );
         })}
      </div>

      {/* Main Control Board */}
      <div className="bg-white rounded-[56px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Filters & Search Toolbar */}
        <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/20">
           <div className="relative group max-w-xl w-full">
              <Search className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Deep Search via SKU, Name, or Category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[32px] text-sm font-black focus:border-indigo-600 focus:ring-[12px] focus:ring-indigo-600/5 shadow-sm outline-none transition-all placeholder:text-slate-300"
              />
           </div>
           <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {categories.map(cat => (
                 <button 
                   key={cat}
                   onClick={() => setActiveCategory(cat)}
                   className={cn(
                     "px-8 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap",
                     activeCategory === cat ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                   )}
                 >
                   {cat}
                 </button>
              ))}
           </div>
        </div>

        {/* Intelligence Matrix - Stripe Table Style */}
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="p-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Intelligence</th>
                    <th className="p-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Pulse (Velocity)</th>
                    <th className="p-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Stock Health</th>
                    <th className="p-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Replenishment Cycle</th>
                    <th className="p-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action Protocol</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {filteredProducts.map((p) => {
                    const intel = calculateIntelligence(p);
                    const isDemo = ['1','2','3','4'].includes(p.id);

                    return (
                       <tr key={p.id} className="group hover:bg-slate-50/50 transition-all">
                          <td className="p-10">
                             <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-white rounded-[28px] border-2 border-slate-100 flex items-center justify-center p-1 shadow-sm group-hover:scale-110 transition-transform overflow-hidden font-black text-slate-200">
                                   {p.image ? (
                                     <img src={p.image} className="w-full h-full object-cover rounded-[24px]" />
                                   ) : <Package className="w-8 h-8 opacity-20" />}
                                </div>
                                <div>
                                   <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">{p.name}</span>
                                      {isDemo && <span className="text-[8px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-[6px] uppercase tracking-widest">Demo</span>}
                                   </div>
                                   <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">SKU: {p.sku}</span>
                                      <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{p.category}</span>
                                   </div>
                                </div>
                             </div>
                          </td>
                          <td className="p-10">
                             <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                   <TrendingUp className="w-4 h-4 text-emerald-500" />
                                   <span className="text-lg font-black text-slate-900 leading-none">{p.velocity}</span>
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Units / Day</span>
                                </div>
                                <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                                   <motion.div 
                                      initial={{ width: 0 }} animate={{ width: `${Math.min(100, p.velocity * 10)}%` }}
                                      className="h-full bg-emerald-500"
                                   />
                                </div>
                             </div>
                          </td>
                          <td className="p-10">
                             <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between gap-10">
                                   <span className="text-sm font-black text-slate-900">{p.stock} Units left</span>
                                   <span className={cn(
                                     "text-[10px] font-black uppercase tracking-widest",
                                     intel.status === 'Critical' ? 'text-rose-600' : intel.status === 'Low' ? 'text-amber-600' : 'text-emerald-600'
                                   )}>
                                     {intel.status}
                                   </span>
                                </div>
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                                   <motion.div 
                                      initial={{ width: 0 }} 
                                      animate={{ width: `${Math.min(100, (p.stock / (intel.reorderPoint * 2)) * 100)}%` }}
                                      className={cn(
                                        "h-full rounded-full transition-all",
                                        intel.status === 'Critical' ? 'bg-rose-500' : intel.status === 'Low' ? 'bg-amber-500' : 'bg-emerald-500'
                                      )}
                                   />
                                </div>
                                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 opacity-70">
                                   <span>0</span>
                                   <span>Reorder @ {intel.reorderPoint}</span>
                                </div>
                             </div>
                          </td>
                          <td className="p-10">
                              <div className="flex flex-col gap-3">
                                 <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span className={cn(
                                      "text-xs font-black uppercase tracking-widest",
                                      intel.stockoutDays <= 3 ? 'text-rose-600' : 'text-slate-600'
                                    )}>
                                       {intel.stockoutDays < 1 ? 'Out of Stock' : `Stockout in ${intel.stockoutDays} Days`}
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">LT: {p.leadTime} Days</span>
                                 </div>
                              </div>
                          </td>
                          <td className="p-10 pr-12 text-right">
                             <div className="flex items-center justify-end gap-3">
                                {p.restockStatus === 'pending' ? (
                                   <div className="px-6 py-3.5 bg-amber-50 border border-amber-200 rounded-[20px] text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                      <Zap className="w-3.5 h-3.5 animate-pulse" /> Ordered ({p.incomingStock})
                                   </div>
                                ) : (
                                   <button 
                                      disabled={p.isDemo}
                                      onClick={() => initiateRestock(p)}
                                      className={cn(
                                        "px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2",
                                        p.isDemo ? "bg-slate-100 text-slate-300 cursor-not-allowed" : 
                                        intel.status === 'Healthy' ? "bg-white border border-slate-200 text-slate-400" :
                                        "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95"
                                      )}
                                   >
                                      {intel.status === 'Healthy' ? 'Analyze' : 'Initiate Restock'} <ArrowRight className="w-4 h-4" />
                                   </button>
                                )}
                                <button 
                                  onClick={() => { setEditingItem(p); setIsEditModalOpen(true); }}
                                  className="p-4 text-slate-400 hover:text-indigo-600 bg-white rounded-2xl transition-all border border-slate-100 shadow-sm"
                                >
                                   <Edit2 className="w-5 h-5" />
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

      {/* Logic & Calibration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-slate-900 rounded-[56px] p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10">
               <Cpu className="w-32 h-32" />
            </div>
            <div className="relative z-10">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-indigo-600 rounded-3xl flex items-center justify-center">
                     <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                     <h3 className="text-3xl font-black tracking-tighter">Replenishment Logic</h3>
                     <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Dynamic Calculation Model</p>
                  </div>
               </div>
               
               <div className="space-y-8 max-w-md">
                  <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-4">
                     <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Formula Component Matrix</p>
                     <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                           <span className="text-sm font-bold text-slate-300 italic">Daily Sales Velocity</span>
                           <span className="text-sm font-black text-indigo-400">Var [X]</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-sm font-bold text-slate-300 italic">Supplier Lead Time (Days)</span>
                           <span className="text-sm font-black text-indigo-400">Var [L]</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-sm font-bold text-slate-300 italic">Safety Buffer Allowance</span>
                           <span className="text-sm font-black text-indigo-400">{globalSafetyBuffer}%</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="text-center py-6 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 rounded-[32px] border-2 border-indigo-600/30">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 block mb-2">Reorder Point Equation</span>
                     <p className="text-3xl font-black italic tracking-tighter">ROP = (X × L) + (X × L × {globalSafetyBuffer/100})</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-white rounded-[56px] border border-slate-200 p-12 shadow-sm">
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-900 border border-slate-200 shadow-sm">
                     <Bell className="w-8 h-8" />
                  </div>
                  <div>
                     <h3 className="text-3xl font-black tracking-tighter">Global Alerts</h3>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notification Orchestration</p>
                  </div>
               </div>
               <button className="p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-slate-100">
                  <Settings className="w-6 h-6 text-slate-400" />
               </button>
            </div>

            <div className="space-y-6">
               {[
                 { id: 'email', label: 'Electronic Mail Alerts', icon: Mail, description: 'Periodic intelligence digests' },
                 { id: 'sms', label: 'SMS Response Protocol', icon: MessageSquare, description: 'Immediate stockout emergencies' },
                 { id: 'inApp', label: 'Native Dashboard Signals', icon: Zap, description: 'Live event terminal feed' },
               ].map((item) => (
                 <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[32px] group hover:bg-white hover:shadow-xl hover:shadow-slate-900/5 transition-all">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                          <item.icon className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900 leading-none mb-1">{item.label}</p>
                          <p className="text-[10px] font-bold text-slate-400 italic opacity-80">{item.description}</p>
                       </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        //@ts-ignore
                        checked={notifications[item.id]} 
                        //@ts-ignore
                        onChange={(e) => setNotifications({...notifications, [item.id]: e.target.checked})} 
                      />
                      <div className="w-16 h-9 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Edit Intelligence Matrix Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingItem && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-900/40">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, rotate: -2 }} 
               animate={{ scale: 1, opacity: 1, rotate: 0 }} 
               exit={{ scale: 0.9, opacity: 0, rotate: 2 }}
               className="bg-white rounded-[56px] shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden"
            >
               <div className="bg-slate-900 p-10 text-white flex items-center justify-between">
                  <div className="flex items-center gap-5">
                     <div className="w-16 h-16 bg-amber-500 rounded-[28px] flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                        <Edit2 className="w-8 h-8" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-black tracking-tighter">Calibrate Asset Matrix</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-80">Refining Intelligence for {editingItem.sku}</p>
                     </div>
                  </div>
                  <button onClick={() => setIsEditModalOpen(false)} className="p-4 hover:bg-white/10 rounded-2xl transition-colors"><X className="w-8 h-8" /></button>
               </div>
               
               <div className="p-12 space-y-10">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block pl-2">Sales Velocity (µ/day)</label>
                        <input 
                           type="number" 
                           step="0.1"
                           value={editingItem.velocity}
                           onChange={(e) => setEditingItem({...editingItem, velocity: Number(e.target.value)})}
                           className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[28px] text-md font-black focus:bg-white focus:border-amber-500 transition-all outline-none"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block pl-2">Lead Time (Lead Days)</label>
                        <input 
                           type="number" 
                           value={editingItem.leadTime}
                           onChange={(e) => setEditingItem({...editingItem, leadTime: Number(e.target.value)})}
                           className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[28px] text-md font-black focus:bg-white focus:border-amber-500 transition-all outline-none"
                        />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="flex items-center justify-between px-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Asset Safety Buffer (%)</label>
                        <span className="text-amber-600 font-black">{editingItem.safetyBuffer}%</span>
                     </div>
                     <input 
                        type="range" 
                        min="0" max="100"
                        value={editingItem.safetyBuffer}
                        onChange={(e) => setEditingItem({...editingItem, safetyBuffer: Number(e.target.value)})}
                        className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-amber-500"
                     />
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200">
                           <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                           <p className="text-xs font-black uppercase tracking-widest text-slate-500">Calculated Reorder Point</p>
                           <p className="text-2xl font-black text-slate-900 tracking-tight">{calculateIntelligence(editingItem).reorderPoint} Units</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => handleUpdateProduct({ 
                           velocity: editingItem.velocity,
                           leadTime: editingItem.leadTime,
                           safetyBuffer: editingItem.safetyBuffer
                        })}
                        className="px-10 py-5 bg-slate-900 text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all"
                     >
                        Sync Calibration
                     </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
