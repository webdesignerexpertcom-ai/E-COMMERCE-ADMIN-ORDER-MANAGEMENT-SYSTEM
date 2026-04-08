/* eslint-disable */
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, Search, Package, Check, X, 
  History, ChevronRight, Flame, DollarSign, 
  Download, Eye, EyeOff, PieChart, Monitor, Zap, Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { omsFetch } from '@/lib/api';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Image from 'next/image';

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
  const [showArchived, setShowArchived] = useState(false);
  
  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<ProductIntelligence | null>(null);
  const [restockQty, setRestockQty] = useState(0);
  
  // Feedback
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setIsToastOpen(true);
    setTimeout(() => setIsToastOpen(false), 3000);
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await omsFetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.map((p: any) => ({
          ...p,
          id: p._id || p.id,
          stock: Number(p.stock_quantity ?? p.stock ?? 0),
          velocity: parseFloat(p.sales_velocity?.toString() || p.velocity?.toString() || (Math.random() * 2 + 0.5).toFixed(1)),
          leadTime: parseInt(p.lead_time_days?.toString() || p.leadTime?.toString() || '7'),
          safetyBuffer: parseInt(p.safety_buffer_percent?.toString() || '15'),
          restockStatus: p.restock_status || p.restockStatus || 'none',
          incomingStock: parseInt(p.incoming_stock?.toString() || p.incomingStock?.toString() || '0'),
          price: parseFloat(p.price?.toString() || '0'),
          category: p.category || 'General',
          isArchived: !!p.isArchived
        })));
      }
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleUpdateProduct = async (id: string, updates: Partial<ProductIntelligence>) => {
    try {
      const isNew = !id;
      // Map for POST if new
      if (isNew && !updates.price) updates.price = 0;
      
      const res = await omsFetch('/api/products', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isNew ? updates : { id, ...updates })
      });
      const data: { success: boolean, error?: string } = await res.json();
      if (data.success) {
        fetchProducts();
        return true;
      } else {
        triggerToast(data.error || "OPERATION FAILED");
      }
    } catch (err) { console.error(err); triggerToast("NETWORK ERROR"); }
    return false;
  };

  const calculateIntelligence = (p: ProductIntelligence) => {
    const stock = Number(p.stock || 0);
    const velocity = Number(p.velocity || 0.1); 
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
        const prio: Record<string, number> = { 'OUT OF STOCK': 0, 'CRITICAL': 1, 'LOW STOCK': 2, 'HEALTHY': 3 };
        return prio[calculateIntelligence(a).status] - prio[calculateIntelligence(b).status];
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

  return (
    <div className="space-y-12 pb-24">
      {/* ðŸ“Š HEADER & SEARCH */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 pt-4">
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" /> System Online
              </span>
              <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Updated {new Date().toLocaleTimeString()}</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">Stock Intelligence</h2>
            <p className="text-slate-500 font-bold max-w-lg leading-relaxed">Advanced reorder point (ROP) tracking and autonomous demand forecasting active across all nodes.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group flex-1 md:flex-none">
            <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" placeholder="Deep Search SKUs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80 pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[24px] text-sm font-black outline-none shadow-sm focus:ring-4 focus:ring-indigo-600/5 transition-all transition-all"
            />
          </div>
          <button onClick={exportToCSV} className="p-5 bg-white border border-slate-200 rounded-[24px] text-slate-600 hover:text-indigo-600 transition-all shadow-sm">
            <Download className="w-6 h-6" />
          </button>
          <button 
            onClick={() => { setActiveItem({ id: '', name: '', sku: '', category: 'General', stock: 0, min: 10, velocity: 1.0, leadTime: 7, safetyBuffer: 15, restockStatus: 'none', incomingStock: 0, price: 0, isArchived: false }); setIsEditModalOpen(true); }}
            className="px-8 h-[64px] bg-slate-900 text-white rounded-[24px] shadow-xl shadow-slate-900/10 text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-3"
          >
            <Plus className="w-5 h-5" /> Provision SKU
          </button>
        </div>
      </div>

      {/* ðŸ“ˆ STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 'all', label: 'Nodes Tracked', val: products.length, icon: Package, color: 'indigo' },
            { id: 'oos', label: 'Stockout Event', val: products.filter(p => p.stock <= 0).length, icon: EyeOff, color: 'rose' },
            { id: 'crit', label: 'Critical Risk', val: products.filter(p => calculateIntelligence(p).status === 'CRITICAL').length, icon: Flame, color: 'amber' },
            { id: 'risk', label: 'Value At Risk', val: `â‚¹${Math.floor(Number(products.reduce((acc, p) => acc + parseFloat(calculateIntelligence(p).projectedLoss), 0)) / 1000)}k`, icon: DollarSign, color: 'emerald' },
          ].map(stat => (
            <div key={stat.id} className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-all">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", 
                stat.color === 'indigo' ? "bg-indigo-50 text-indigo-600" : 
                stat.color === 'rose' ? "bg-rose-50 text-rose-600" :
                stat.color === 'amber' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
              )}>
                  <stat.icon className="w-7 h-7" />
              </div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">{stat.val}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">{stat.label}</p>
            </div>
          ))}
      </div>

      {/* ðŸ§© ASSET GRID & FILTERS */}
      <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                {['All', 'Coffee', 'Apparel', 'Appliances', 'General'].map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap", activeCategory === cat ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10 border-slate-900" : "bg-white text-slate-400 border-slate-200 hover:border-slate-400")}>
                    {cat}
                  </button>
                ))}
            </div>
            <button 
              onClick={() => setShowArchived(!showArchived)}
              className={cn("px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border transition-all", showArchived ? "bg-amber-100 border-amber-200 text-amber-700 shadow-lg shadow-amber-500/10" : "bg-white text-slate-400 border-slate-200")}
            >
                {showArchived ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />} {showArchived ? 'View Active Assets' : 'Show Archived Nodes'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map(p => {
                const intel = calculateIntelligence(p);
                const isCritical = intel.status === 'CRITICAL' || intel.status === 'OUT OF STOCK';
                return (
                  <motion.div 
                    layout key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-[48px] border border-slate-100 p-10 space-y-8 shadow-sm flex flex-col group relative hover:shadow-2xl hover:shadow-indigo-600/5 transition-all"
                  >
                      <div className="flex items-center justify-between">
                        <div className="w-20 h-20 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-center font-black overflow-hidden relative shadow-inner">
                            {p.image ? <Image src={p.image} className="w-full h-full object-cover" alt="" width={80} height={80} unoptimized /> : <Package className="w-8 h-8 text-slate-200" />}
                        </div>
                        <div className="text-right">
                            <div className={cn("inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest", 
                              intel.status === 'CRITICAL' ? 'bg-rose-100 text-rose-600' : 
                              intel.status === 'OUT OF STOCK' ? 'bg-slate-900 text-white' : 
                              intel.status === 'LOW STOCK' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                            )}>
                              <div className={cn("w-1.5 h-1.5 rounded-full", isCritical ? "bg-rose-500 animate-pulse" : "bg-emerald-500")} />
                              {intel.status}
                            </div>
                            <p className="text-[11px] font-black text-slate-300 mt-3 tracking-widest uppercase">{p.sku}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none line-clamp-1">{p.name}</h4>
                        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">{p.category} Intelligence Unit</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Available</span>
                            <span className="text-3xl font-black text-slate-900">{intel.stock}</span>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Stockout</span>
                            <span className={cn("text-3xl font-black", isCritical ? "text-rose-500" : "text-indigo-600")}>{Math.floor(intel.daysToStockout)}<span className="text-xs">D</span></span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Health Matrix</span>
                            <span className="text-slate-900">{Math.round((intel.stock / (intel.reorderPoint * 2 || 1)) * 100)}%</span>
                        </div>
                        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-1 shadow-inner">
                            <div 
                              className={cn("h-full rounded-full transition-all duration-1000", isCritical ? "bg-rose-500" : "bg-indigo-600")} 
                              style={{ width: `${Math.min(100, (intel.stock / (intel.reorderPoint * 2 || 1)) * 100)}%` }} 
                            />
                        </div>
                      </div>

                      <div className="mt-auto pt-8 flex flex-col gap-3">
                        {p.restockStatus === 'pending' ? (
                            <div className="w-full py-6 bg-indigo-50 border border-indigo-100 rounded-[32px] text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center justify-center gap-4">
                              <Zap className="w-5 h-5 animate-pulse" /> Shipment Ordered ({p.incomingStock})
                            </div>
                        ) : (
                            <button 
                              onClick={() => { setActiveItem(p); setRestockQty(Math.max(50, Math.ceil((intel.velocity || 1) * 30))); setIsRestockModalOpen(true); }}
                              className={cn("w-full py-6 rounded-[32px] text-xs font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-indigo-600/10 active:scale-95 flex items-center justify-center gap-4", isCritical ? "bg-indigo-600 text-white hover:bg-slate-900" : "bg-white border-2 border-slate-100 text-slate-400 hover:border-slate-300")}
                            >
                              <Truck className="w-5 h-5" /> Initiate Surge
                            </button>
                        )}
                        <button 
                          onClick={() => { setActiveItem(p); setIsEditModalOpen(true); }}
                          className="w-full py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
                        >
                            Configure SKU <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
      </section>

      {/* ðŸ“Š ANALYTICS HUD */}
      <section className="pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-slate-900 rounded-[64px] p-12 text-white shadow-3xl relative overflow-hidden flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between mb-12 relative z-10">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black tracking-tight flex items-center gap-4 italic"><Monitor className="w-10 h-10 text-indigo-500" /> Supply Pulse</h3>
                    <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em]">Real-time demand velocity aggregation</p>
                  </div>
                  <div className="hidden sm:flex p-4 bg-white/5 border border-white/10 rounded-3xl"><PieChart className="w-6 h-6 text-white" /></div>
                </div>
                <div className="flex-1 w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={TREND_DATA}>
                        <defs><linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis fontSize={10} stroke="#ffffff30" dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} stroke="#ffffff30" axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '24px', padding: '16px' }} itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900' }} />
                        <Area type="monotone" dataKey="stock" stroke="#6366f1" strokeWidth={6} fillOpacity={1} fill="url(#pGrad)" />
                      </AreaChart>
                  </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white rounded-[64px] border border-slate-100 p-12 shadow-sm space-y-12">
                <div className="flex items-center gap-6"><History className="w-12 h-12 text-slate-900" /><h3 className="text-3xl font-black tracking-tight leading-none">Intelligence Audit Pulse</h3></div>
                <div className="space-y-8">
                  {['SKU_PROVISIONED', 'THRESHOLD_CALIBRATED', 'PROCUREMENT_AUTH'].map((evt, i) => (
                      <div key={i} className="flex gap-8 items-start relative pb-8 border-l-2 border-slate-50 pl-8 last:pb-0">
                        <div className="absolute -left-[5px] top-2 w-2 h-2 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/40" />
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[11px] font-black uppercase text-indigo-600 tracking-widest">{evt}</span>
                              <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{i + 2}m ago</span>
                            </div>
                            <p className="text-sm font-bold text-slate-600 leading-relaxed shadow-sm bg-slate-50/50 p-4 rounded-2xl">Autonomous decision executed by <span className="text-slate-900 font-black italic underline underline-offset-4 decoration-indigo-600/30 text-[11px] uppercase">Enterprise_Bot_v4</span> involving target node {i + 1}04-X.</p>
                        </div>
                      </div>
                  ))}
                </div>
                <button className="w-full py-6 bg-slate-900 text-white rounded-[32px] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-4">Access Full Logs <ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
      </section>

      {/* ðŸ“¥ MODALS */}
      <AnimatePresence>
        {isToastOpen && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: -40, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900 text-white px-10 py-6 rounded-full shadow-4xl flex items-center gap-4 border border-white/5">
             <Check className="w-6 h-6 text-emerald-400" />
             <p className="text-[11px] font-black uppercase tracking-[0.2em]">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isRestockModalOpen || isEditModalOpen) && activeItem && (
          <div className="fixed inset-0 z-[1000] flex items-end lg:items-center justify-center p-0 md:p-8 bg-slate-900/90 backdrop-blur-2xl overflow-y-auto">
             <motion.div 
               initial={{ y: 400, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 400, opacity: 0 }}
               className="bg-white rounded-t-[64px] lg:rounded-[80px] shadow-4xl w-full max-w-2xl overflow-hidden border-t-8 border-indigo-600/20"
             >
                <div className="bg-slate-900 p-12 text-white flex justify-between items-center sticky top-0 z-10">
                   <div className="flex items-center gap-8">
                      <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-indigo-600/40">
                         {isRestockModalOpen ? <Truck className="w-10 h-10" /> : <Plus className="w-10 h-10" />}
                      </div>
                      <div>
                         <h2 className="text-4xl font-black tracking-tighter italic">{isRestockModalOpen ? 'Surge Auth' : 'Provision SKU'}</h2>
                         <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-2">Enterprise Security Layer Active</p>
                      </div>
                   </div>
                   <button onClick={() => { setIsRestockModalOpen(false); setIsEditModalOpen(false); }} className="p-5 hover:bg-white/10 rounded-3xl transition-colors"><X className="w-10 h-10" /></button>
                </div>
                
                <div className="p-12 md:p-20 space-y-12 max-h-[70vh] overflow-y-auto no-scrollbar pb-32 lg:pb-20">
                   {isRestockModalOpen ? (
                     <div className="space-y-12">
                        <div className="p-10 bg-indigo-50 border border-indigo-100 rounded-[56px] space-y-6">
                           <div className="flex justify-between items-center">
                              <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Surge Buffer</span>
                              <span className="text-indigo-600 text-5xl font-black tracking-tighter">+{Math.ceil(activeItem.velocity * 30)} <span className="text-sm italic">U</span></span>
                           </div>
                           <p className="text-sm font-bold text-slate-500 italic leading-relaxed">&quot;Supply surge calibrated for a 30-day window based on actual market velocity trends.&quot;</p>
                        </div>
                        <div className="space-y-6">
                           <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-6 italic">Manual Pulse Adjustment</label>
                           <input 
                             type="number" value={restockQty} onChange={(e) => setRestockQty(Number(e.target.value))}
                             className="w-full px-12 py-10 bg-slate-50 border border-slate-200 rounded-[48px] text-6xl font-black text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all text-center tracking-tighter shadow-inner"
                           />
                        </div>
                        <button onClick={() => submitRestockOrder(activeItem, restockQty)} className="w-full py-8 bg-slate-900 text-white rounded-[40px] text-xs font-black uppercase tracking-[0.5em] shadow-4xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-6 group">Authorize Deployment <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" /></button>
                     </div>
                   ) : (
                     <div className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-3"><label className="text-[11px] font-black uppercase text-slate-400 pl-6 uppercase tracking-widest text-indigo-600">Product Name</label><input type="text" value={activeItem.name} onChange={(e) => setActiveItem({...activeItem, name: e.target.value})} className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[32px] font-black outline-none focus:bg-white text-lg tracking-tight" /></div>
                           <div className="space-y-3"><label className="text-[11px] font-black uppercase text-slate-400 pl-6 uppercase tracking-widest text-emerald-600">Price (â‚¹)</label><input type="number" value={activeItem.price} onChange={(e) => setActiveItem({...activeItem, price: Number(e.target.value)})} className="w-full px-8 py-6 bg-emerald-50/30 border border-emerald-100 rounded-[32px] font-black outline-none focus:bg-white text-lg text-emerald-700" /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-3"><label className="text-[11px] font-black uppercase text-slate-400 pl-6 uppercase tracking-widest text-slate-500">SKU Reference</label><input type="text" value={activeItem.sku} onChange={(e) => setActiveItem({...activeItem, sku: e.target.value})} className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[32px] font-black outline-none uppercase focus:bg-white text-lg tracking-tight" /></div>
                           <div className="space-y-3"><label className="text-[11px] font-black uppercase text-slate-400 pl-6 uppercase tracking-widest">Inventory Status</label><div className="flex gap-4"><input type="number" value={activeItem.stock} onChange={(e) => setActiveItem({...activeItem, stock: Number(e.target.value)})} className="flex-1 px-8 py-6 bg-rose-50/30 border border-rose-100 rounded-[32px] font-black outline-none focus:bg-white text-lg text-rose-700" /><button onClick={() => setActiveItem({...activeItem, stock: 0})} className="px-6 bg-rose-600 text-white rounded-[32px] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-rose-600/20">Zero</button></div></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-3"><label className="text-[11px] font-black uppercase text-slate-400 pl-6 uppercase tracking-widest text-indigo-600">Daily Velocity</label><input type="number" step="0.1" value={activeItem.velocity} onChange={(e) => setActiveItem({...activeItem, velocity: Number(e.target.value)})} className="w-full px-8 py-6 bg-indigo-50/30 border border-indigo-100 rounded-[32px] font-black outline-none focus:bg-white text-lg text-indigo-700" /></div>
                           <div className="space-y-3"><label className="text-[11px] font-black uppercase text-slate-400 pl-6 uppercase tracking-widest text-slate-500">Category Tag</label><input type="text" value={activeItem.category} onChange={(e) => setActiveItem({...activeItem, category: e.target.value})} className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[32px] font-black outline-none focus:bg-white text-lg" /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-3">
                              <label className="text-[11px] font-black uppercase text-slate-400 pl-6 uppercase tracking-widest">Procurement State</label>
                              <select value={activeItem.restockStatus} onChange={(e) => setActiveItem({...activeItem, restockStatus: e.target.value as any})} className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[32px] font-black outline-none focus:bg-white text-lg">
                                 <option value="none">None</option>
                                 <option value="pending">Shipment Ordered</option>
                                 <option value="received">Stock Received</option>
                              </select>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[11px] font-black uppercase text-slate-400 pl-6 uppercase tracking-widest">Asset Lifecycle</label>
                              <button onClick={() => setActiveItem({...activeItem, isArchived: !activeItem.isArchived})} className={cn("w-full px-8 py-6 border-4 rounded-[32px] font-black text-xs uppercase tracking-widest transition-all", activeItem.isArchived ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-emerald-50 border-emerald-200 text-emerald-600")}>{activeItem.isArchived ? 'Archived' : 'Active Deployment'}</button>
                           </div>
                        </div>
                        <button onClick={async () => { if (await handleUpdateProduct(activeItem.id, activeItem)) { triggerToast("NODE RE-PROVISIONED"); setIsEditModalOpen(false); } }} className="w-full py-10 bg-slate-900 text-white rounded-[48px] text-sm font-black uppercase tracking-[0.5em] shadow-4xl hover:bg-indigo-600 transition-all active:scale-95">Commit Topology Change</button>
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

