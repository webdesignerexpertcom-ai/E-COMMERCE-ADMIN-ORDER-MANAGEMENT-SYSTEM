'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Activity, 
  AlertTriangle, 
  Zap, 
  TrendingUp,
  Package,
  Calendar,
  Edit2,
  Check,
  X,
  Bell,
  Mail,
  MessageSquare,
  Clock,
  ArrowRight,
  ShieldCheck,
  Settings,
  Cpu,
  Info,
  DollarSign,
  TrendingDown,
  Truck,
  History,
  ArrowUpRight,
  ChevronRight,
  Layers,
  ShoppingBag,
  ArrowLeft,
  Flame,
  MousePointerClick
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { omsFetch } from '@/lib/api';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStep, setEditStep] = useState(1);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<ProductIntelligence | null>(null);
  const [restockQty, setRestockQty] = useState(0);
  
  // Feedback
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Policy Control
  const [categoryPolicies, setCategoryPolicies] = useState<Record<string, number>>({
    'Coffee': 10,
    'Apparel': 10,
    'Appliances': 10,
    'General': 15
  });

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
          velocity: parseFloat(p.velocity || (Math.random() * 5 + 1).toFixed(1)),
          leadTime: parseInt(p.leadTime || 7),
          safetyBuffer: parseInt(p.safetyBuffer || (categoryPolicies[p.category] || categoryPolicies['General'])),
          restockStatus: p.restockStatus || 'none',
          incomingStock: parseInt(p.incomingStock || 0),
          price: parseFloat(p.price || 999),
          category: p.category || 'General'
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

  const calculateIntelligence = (p: ProductIntelligence) => {
    const demandDuringLead = p.velocity * p.leadTime;
    const bufferUnits = (demandDuringLead * (p.safetyBuffer / 100));
    const reorderPoint = Math.ceil(demandDuringLead + bufferUnits);
    
    // Impact calculations
    const daysToStockout = p.velocity > 0 ? (p.stock / p.velocity) : 999;
    const totalPossibleStock = p.stock + p.incomingStock;
    const futureStockoutDays = p.velocity > 0 ? (totalPossibleStock / p.velocity) : 999;

    let status: 'OUT OF STOCK' | 'CRITICAL' | 'LOW STOCK' | 'HEALTHY' = 'HEALTHY';
    if (p.stock <= 0) status = 'OUT OF STOCK';
    else if (p.stock < (p.velocity * 2)) status = 'CRITICAL';
    else if (p.stock < reorderPoint) status = 'LOW STOCK';
    
    const projectedLoss = (status !== 'HEALTHY' && p.velocity > 0) ? (p.velocity * (p.price || 0) * (p.leadTime)).toFixed(0) : '0';

    return { reorderPoint, daysToStockout, status, projectedLoss, totalPossibleStock, futureStockoutDays };
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory]);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

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
    } catch (err) {
       console.error(err);
    }
    return false;
  };

  const submitRestockOrder = async (p: ProductIntelligence, qty: number) => {
    if (qty <= 0) {
      triggerToast("Quantum Error: Order quantity must be greater than zero.");
      return;
    }
    const success = await handleUpdateProduct(p.id, {
      restockStatus: 'pending',
      incomingStock: qty
    });
    if (success) {
      triggerToast(`Fulfillment Order Dispatched: ${qty} units of ${p.sku}.`);
      setIsRestockModalOpen(false);
    }
  };

  return (
    <div className="space-y-12 min-h-screen pb-24 max-w-[1700px] mx-auto">
      <AnimatePresence>
        {isToastOpen && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900 border border-white/10 text-white px-10 py-5 rounded-[40px] shadow-3xl flex items-center gap-5 backdrop-blur-xl"
          >
             <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Check className="w-6 h-6 text-white" />
             </div>
             <p className="text-sm font-black uppercase tracking-[0.1em]">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Dashboard Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-4">
           <div className="flex items-center gap-4">
              <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                 Live Decisions Active
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <History className="w-4 h-4" /> Last Sync: Just Now
              </div>
           </div>
          <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-none">Decision Intel</h1>
          <p className="text-xl text-slate-500 font-bold italic opacity-60">High-frequency inventory intelligence & autonomous restock logic.</p>
        </div>

        <div className="flex items-center gap-6 bg-white p-5 rounded-[44px] shadow-xl shadow-slate-200/40 border border-slate-100">
           <div className="flex flex-col px-6 border-r border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Efficiency</span>
              <div className="flex items-center gap-4">
                 <div className="w-40 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600" />
                 </div>
                 <span className="text-lg font-black text-slate-900">82%</span>
              </div>
           </div>
           <button 
             onClick={() => { setActiveItem({ id: '', name: '', sku: '', category: 'General', stock: 0, min: 10, velocity: 1.0, leadTime: 7, safetyBuffer: 15, restockStatus: 'none', incomingStock: 0 } as any); setEditStep(1); setIsEditModalOpen(true); }}
             className="px-12 py-6 bg-slate-900 text-white rounded-[28px] text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
           >
             <Plus className="w-5 h-5" /> Provision New SKU
           </button>
        </div>
      </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {[
           { label: 'Out of Stock', status: 'OUT OF STOCK', count: products.filter(p => p.stock <= 0).length, color: 'slate-900', icon: Package, bg: 'bg-slate-50 border-slate-200' },
           { label: 'Critical Risk', status: 'CRITICAL', count: products.filter(p => calculateIntelligence(p).status === 'CRITICAL').length, color: 'rose-600', icon: Flame, bg: 'bg-rose-50 border-rose-100', animate: true },
           { label: 'Low Stock Signal', status: 'LOW STOCK', count: products.filter(p => calculateIntelligence(p).status === 'LOW STOCK').length, color: 'amber-500', icon: Activity, bg: 'bg-amber-50 border-amber-100' },
           { label: 'Projected Loss', status: 'RISK', count: `₹${Number(products.reduce((acc, p) => acc + parseFloat(calculateIntelligence(p).projectedLoss), 0)).toLocaleString()}`, color: 'emerald-600', icon: DollarSign, bg: 'bg-emerald-50 border-emerald-100' },
         ].map((card) => (
            <motion.div key={card.label} whileHover={{ y: -6 }} className={cn("p-10 rounded-[56px] border shadow-sm relative overflow-hidden group", card.bg)}>
               <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                  <card.icon className="w-32 h-32" />
               </div>
               <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className={cn("w-3 h-3 rounded-full", card.animate && "animate-ping", `bg-${card.color}`)} />
                  <span className={cn("text-[11px] font-black uppercase tracking-[0.2em]", `text-${card.color}`)}>{card.label}</span>
               </div>
               <h3 className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-2">{card.count}</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Autonomous Intelligence Signal</p>
            </motion.div>
         ))}
      </div>

      {/* Intelligence Control Center */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
         {/* Main Product Table */}
         <div className="xl:col-span-3 bg-white rounded-[72px] border border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden flex flex-col min-h-[700px]">
            <div className="p-12 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-10 bg-slate-50/10">
               <div className="relative group max-w-2xl w-full">
                  <Search className="w-6 h-6 absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Deep Search Identity Matrix..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-20 pr-10 py-7 bg-white border border-slate-200 rounded-[40px] text-md font-black focus:ring-[16px] focus:ring-indigo-600/5 shadow-inner outline-none transition-all placeholder:font-normal placeholder:italic placeholder:text-slate-300"
                  />
               </div>
               <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                  {categories.map(cat => (
                     <button 
                       key={cat} onClick={() => setActiveCategory(cat)}
                       className={cn(
                        "px-10 py-5 rounded-[28px] text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                        activeCategory === cat ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" : "bg-white text-slate-400 hover:border-slate-300 hover:bg-slate-50"
                      )}
                     >
                        {cat}
                     </button>
                  ))}
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                     <tr>
                        <th className="p-10 pb-6 text-[11px] font-black text-slate-400 uppercase tracking-widest pl-14">Product Asset</th>
                        <th className="p-10 pb-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Velocity Pulse</th>
                        <th className="p-10 pb-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Health Scan</th>
                        <th className="p-10 pb-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right pr-14">Operational Tools</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredProducts.map(p => {
                        const intel = calculateIntelligence(p);
                        return (
                           <tr key={p.id} className="group hover:bg-slate-50/30 transition-all cursor-default">
                              <td className="p-10 pl-14">
                                 <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 bg-white rounded-[32px] overflow-hidden border-4 border-slate-50 flex items-center justify-center font-black text-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                                       {p.image ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> : <Package className="w-8 h-8" />}
                                    </div>
                                    <div>
                                       <span className="text-lg font-black text-slate-900 block leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{p.name}</span>
                                       <div className="flex items-center gap-3">
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-lg">SKU: {p.sku}</span>
                                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{p.category}</span>
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-10 text-center">
                                 <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-2 mb-1">
                                       <TrendingUp className="w-4 h-4 text-emerald-500" />
                                       <span className="text-2xl font-black text-slate-900 leading-none">{p.velocity}</span>
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Units / Day</span>
                                 </div>
                              </td>
                              <td className="p-10">
                                 <div className="space-y-3">
                                    <div className="flex justify-between items-end px-1">
                                       <div className="flex flex-col">
                                          <span className="text-[11px] font-black text-slate-900">{p.stock} Units Current</span>
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">ROP Target: {intel.reorderPoint}</span>
                                       </div>
                                       <div className={cn(
                                          "text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-1.5 shadow-sm border",
                                          intel.status === 'CRITICAL' ? 'bg-rose-50 border-rose-100 text-rose-600 animate-pulse' :
                                          intel.status === 'LOW STOCK' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                          intel.status === 'OUT OF STOCK' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                       )}>
                                          {intel.status}
                                       </div>
                                    </div>
                                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                                       <motion.div 
                                          initial={{ width: 0 }} 
                                          animate={{ width: `${Math.min(100, (p.stock / (intel.reorderPoint * 1.5)) * 100)}%` }}
                                          className={cn(
                                             "h-full rounded-full transition-all duration-1000",
                                             intel.status === 'CRITICAL' ? 'bg-rose-500' : 
                                             intel.status === 'LOW STOCK' ? 'bg-amber-500' : 'bg-emerald-500'
                                          )}
                                       />
                                    </div>
                                    <div className="flex items-center justify-between">
                                       <p className="text-[10px] font-bold text-slate-500 italic flex items-center gap-1.5">
                                          <Clock className="w-3.5 h-3.5 opacity-40" /> 
                                          {intel.daysToStockout < 1 ? 'Out of Stock' : `Stockout Expected ${intel.daysToStockout <= 2 ? 'In 48 Hours' : `In ${Math.floor(intel.daysToStockout)} Days`}`}
                                       </p>
                                       {parseFloat(intel.projectedLoss) > 0 && (
                                          <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                                             <AlertTriangle className="w-3 h-3" /> Risk: ₹{Number(intel.projectedLoss).toLocaleString()}
                                          </span>
                                       )}
                                    </div>
                                 </div>
                              </td>
                              <td className="p-10 text-right pr-14">
                                 <div className="flex items-center justify-end gap-4">
                                    {p.restockStatus === 'pending' ? (
                                       <div className="px-8 py-5 bg-indigo-50 border border-indigo-100 rounded-[28px] text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-3">
                                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
                                          Ordered ({p.incomingStock})
                                       </div>
                                    ) : (
                                       <button 
                                          onClick={() => { setActiveItem(p); setRestockQty(Math.max(50, Math.ceil(p.velocity * 30 * 1.15))); setIsRestockModalOpen(true); }}
                                          className={cn(
                                             "px-10 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-[0.15em] transition-all hover:scale-[1.05] active:scale-95",
                                             intel.status === 'HEALTHY' ? "bg-white border border-slate-200 text-slate-400" : "bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30"
                                          )}
                                       >
                                          {intel.status === 'HEALTHY' ? 'Inspect' : 'Restock Protocol'}
                                       </button>
                                    )}
                                    <button 
                                      onClick={() => { setActiveItem(p); setEditStep(1); setIsEditModalOpen(true); }}
                                      className="p-5 bg-white border border-slate-100 rounded-[24px] text-slate-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1"
                                    >
                                       <Settings className="w-5 h-5" />
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

         {/* Sidebar Control Layer */}
         <div className="space-y-12">
            {/* Visual Demand Heatmap (Replaced with specific trend chart) */}
            <div className="bg-slate-900 rounded-[72px] p-12 text-white shadow-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:rotate-12 transition-transform duration-1000">
                   <TrendingUp className="w-48 h-48" />
                </div>
                <div className="flex items-center justify-between mb-10 relative z-10">
                   <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                         <LineChart className="w-8 h-8" />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black tracking-tight">Supply Pulse</h3>
                         <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Decision Intelligence Layer</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black">+4.2%</span>
                   </div>
                </div>
                
                <div className="h-[280px] w-full relative z-10">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={TREND_DATA}>
                         <defs>
                            <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                               <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="6 6" stroke="#ffffff10" vertical={false} />
                         <XAxis fontSize={10} stroke="#ffffff30" dataKey="name" axisLine={false} tickLine={false} dy={10} />
                         <YAxis fontSize={10} stroke="#ffffff30" axisLine={false} tickLine={false} dx={-10} />
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '24px', padding: '16px' }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900' }}
                            cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                         />
                         <Area type="monotone" dataKey="stock" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#primaryGrad)" />
                         <Area type="monotone" dataKey="demand" stroke="#fbbf24" strokeWidth={3} fillOpacity={0} />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mt-12 relative z-10">
                   <div className="p-6 bg-white/5 rounded-[32px] border border-white/5 group-hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Net Flow</p>
                         <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      </div>
                      <h4 className="text-3xl font-black tracking-tighter">842 <span className="text-xs text-slate-500 font-bold uppercase italic">Units</span></h4>
                   </div>
                   <div className="p-6 bg-white/5 rounded-[32px] border border-white/5 group-hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Accuracy</p>
                         <Check className="w-4 h-4 text-indigo-400" />
                      </div>
                      <h4 className="text-3xl font-black tracking-tighter">97.4<span className="text-sm font-black text-indigo-400">%</span></h4>
                   </div>
                </div>
            </div>

            {/* Smart Policies Panel */}
            <div className="bg-white rounded-[72px] border border-slate-200 p-12 shadow-xl shadow-slate-900/5 space-y-10">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-slate-900 rounded-[32px] flex items-center justify-center text-white shadow-2xl">
                         <ShieldCheck className="w-8 h-8" />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black tracking-tight">Safety Policies</h3>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Buffer Matrix Controls</p>
                      </div>
                   </div>
                   <button className="p-5 hover:bg-slate-50 border border-slate-100 rounded-3xl transition-all shadow-sm">
                      <Settings className="w-6 h-6 text-slate-400" />
                   </button>
                </div>
                
                <div className="space-y-5">
                   {Object.entries(categoryPolicies).map(([cat, val]) => (
                      <motion.div 
                        key={cat} whileHover={{ x: 6 }}
                        className="p-8 bg-slate-50 border border-slate-100 rounded-[40px] flex items-center justify-between group hover:bg-white hover:shadow-2xl hover:shadow-slate-900/10 transition-all border-2 border-transparent hover:border-indigo-100"
                      >
                         <div>
                            <p className="text-lg font-black text-slate-900 leading-tight mb-1">{cat}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 opacity-60">Protection Level</p>
                         </div>
                         <div className="flex items-center gap-4">
                            <input 
                              type="number" value={val} 
                              onChange={(e) => setCategoryPolicies({...categoryPolicies, [cat]: Number(e.target.value)})}
                              className="w-20 h-12 bg-white border border-slate-200 rounded-[20px] text-center font-black text-indigo-600 outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all"
                            />
                            <span className="text-sm font-black text-slate-300">%</span>
                         </div>
                      </motion.div>
                   ))}
                </div>

                <div className="pt-10 border-t border-slate-100">
                   <button 
                     onClick={() => triggerToast("System-wide recalibration initiated...")}
                     className="w-full py-6 bg-slate-100 text-slate-600 rounded-[32px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
                   >
                      Recalibrate Global Matrix
                   </button>
                </div>
            </div>
         </div>
      </div>

      {/* Decision Modal: Smart Restock Workflow */}
      <AnimatePresence>
        {isRestockModalOpen && activeItem && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-900/70">
             <motion.div 
               initial={{ scale: 0.8, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.8, y: 40, opacity: 0 }}
               className="bg-white rounded-[80px] shadow-4xl w-full max-w-4xl overflow-hidden border-8 border-white/20"
             >
                <div className="bg-slate-900 p-16 text-white relative flex items-center justify-between">
                   <div className="absolute top-0 right-0 p-16 opacity-[0.03] scale-[2] pointer-events-none"><Truck className="w-64 h-64" /></div>
                   <div className="flex items-center gap-10 relative z-10">
                      <div className="w-24 h-24 bg-indigo-600 rounded-[40px] flex items-center justify-center text-white shadow-3xl shadow-indigo-600/30">
                         <ShoppingBag className="w-12 h-12" />
                      </div>
                      <div>
                         <h2 className="text-5xl font-black tracking-tighter mb-2">Restock Command</h2>
                         <p className="text-[12px] font-black uppercase tracking-[0.3em] text-indigo-400">Inventory Replenishment Protocol active</p>
                      </div>
                   </div>
                   <button onClick={() => setIsRestockModalOpen(false)} className="p-6 hover:bg-white/10 rounded-3xl transition-all"><X className="w-10 h-10" /></button>
                </div>
                
                <div className="p-20 space-y-16">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      {/* Left: Intelligence Analytics */}
                      <div className="space-y-10">
                         <div className="p-10 bg-indigo-50/50 rounded-[56px] border-2 border-indigo-100 flex flex-col justify-between h-full">
                            <div className="space-y-8">
                               <div className="flex items-center gap-5">
                                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                                     <Activity className="w-7 h-7 text-indigo-600" />
                                  </div>
                                  <div>
                                     <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Impact Projection</p>
                                     <p className="text-2xl font-black text-slate-900">Coverage Window</p>
                                  </div>
                               </div>
                               
                               <div className="space-y-6">
                                  <div className="flex items-baseline justify-between border-b border-indigo-100/50 pb-4">
                                     <span className="text-sm font-bold text-slate-600 italic">Current Velocity</span>
                                     <span className="text-xl font-black text-slate-900">{activeItem.velocity} Units / Day</span>
                                  </div>
                                  <div className="flex items-baseline justify-between border-b border-indigo-100/50 pb-4">
                                     <span className="text-sm font-bold text-slate-600 italic">New Stock Coverage</span>
                                     <span className="text-xl font-black text-indigo-600">{restockQty > 0 ? (restockQty / activeItem.velocity).toFixed(0) : 0} Successive Days</span>
                                  </div>
                                  <div className="flex items-baseline justify-between">
                                     <span className="text-sm font-bold text-slate-600 italic">Post-Order Health</span>
                                     <span className="text-xl font-black text-emerald-600">HEALTHY (Sustainable)</span>
                                  </div>
                               </div>
                            </div>
                            
                            {restockQty > 500 && (
                               <div className="mt-10 p-6 bg-amber-500 rounded-[32px] text-white flex items-center gap-5 shadow-xl shadow-amber-500/20">
                                  <AlertTriangle className="w-8 h-8 shrink-0" />
                                  <p className="text-xs font-black uppercase leading-tight">Overstock Warning: Order quantity exceeds 60-day demand forecast by 25%.</p>
                               </div>
                            )}
                         </div>
                      </div>
                      
                      {/* Right: Order Configuration */}
                      <div className="space-y-10">
                         <div className="space-y-4">
                            <label className="text-[12px] font-black uppercase text-slate-400 tracking-[0.2em] pl-4 block">Fulfillment Quantity</label>
                            <div className="relative group">
                               <Layers className="w-6 h-6 absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-all" />
                               <input 
                                  type="number" 
                                  value={restockQty}
                                  onChange={(e) => setRestockQty(Number(e.target.value))}
                                  className="w-full pl-20 pr-10 py-10 bg-slate-50 border-4 border-slate-100 rounded-[44px] text-5xl font-black text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-inner"
                               />
                            </div>
                         </div>
                         
                         <div className="space-y-4">
                            <label className="text-[12px] font-black uppercase text-slate-400 tracking-[0.2em] pl-4 block">Dispatch Logistics</label>
                            <div className="grid grid-cols-2 gap-4">
                               <button className="p-8 bg-slate-900 text-white rounded-[32px] flex flex-col items-center gap-3 border-4 border-slate-900 shadow-xl">
                                  <Truck className="w-8 h-8" />
                                  <span className="text-[11px] font-black uppercase tracking-widest">Standard (7d)</span>
                               </button>
                               <button className="p-8 bg-white text-slate-400 rounded-[32px] flex flex-col items-center gap-3 border-4 border-slate-50 hover:bg-slate-50 transition-all">
                                  <Zap className="w-8 h-8" />
                                  <span className="text-[11px] font-black uppercase tracking-widest">Express (2d)</span>
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-8 pt-10 border-t border-slate-100">
                      <button 
                        onClick={() => setIsRestockModalOpen(false)}
                        className="px-14 py-8 bg-slate-100 text-slate-400 rounded-[36px] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-95"
                      >
                         Discard Order
                      </button>
                      <button 
                        onClick={() => submitRestockOrder(activeItem, restockQty)}
                        className="flex-1 py-10 bg-slate-900 text-white rounded-[44px] text-sm font-black uppercase tracking-[0.3em] shadow-4xl shadow-slate-900/30 hover:bg-indigo-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-6"
                      >
                         Authorize Disbursement Protocol <ArrowRight className="w-6 h-6" />
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Multistep Asset Configuration Flow (Add/Edit) */}
      <AnimatePresence>
        {isEditModalOpen && activeItem && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-3xl bg-slate-900/60 font-sans">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white rounded-[72px] shadow-3xl w-full max-w-2xl overflow-hidden border border-white/20"
            >
               {/* Progress Header */}
               <div className="bg-slate-900 px-12 py-10 flex items-center justify-between text-white relative">
                  <div className="flex items-center gap-8">
                     {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-3">
                           <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all",
                              s === editStep ? "bg-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/40 scale-125" : 
                              s < editStep ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/20 text-white/40"
                           )}>
                              {s < editStep ? <Check className="w-5 h-5" /> : s}
                           </div>
                           <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest hidden md:block",
                              s === editStep ? "text-white" : "text-white/30"
                           )}>
                              {s === 1 ? 'Attributes' : s === 2 ? 'Intelligence' : 'Provisioning'}
                           </span>
                        </div>
                     ))}
                  </div>
                  <button onClick={() => setIsEditModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X className="w-8 h-8 text-white/40" /></button>
               </div>
               
               <div className="p-16">
                  <AnimatePresence mode="wait">
                     {editStep === 1 && (
                        <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-10">
                           <div className="space-y-4">
                              <h3 className="text-4xl font-black tracking-tighter">Core Attributes</h3>
                              <p className="text-sm text-slate-400 font-bold italic">Define the physical identity and logistics identity of this asset.</p>
                           </div>
                           <div className="space-y-6">
                              <div className="space-y-3">
                                 <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-2">Asset Public Name</label>
                                 <input 
                                    type="text" value={activeItem.name} 
                                    onChange={(e) => setActiveItem({...activeItem, name: e.target.value})}
                                    placeholder="e.g. Arabica Dark Roast"
                                    className="w-full px-10 py-6 bg-slate-50 border-2 border-slate-100 rounded-[32px] text-lg font-black outline-none focus:bg-white focus:border-indigo-600 transition-all"
                                 />
                              </div>
                              <div className="grid grid-cols-2 gap-6">
                                 <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-2">Unique SKU ID</label>
                                    <input 
                                       type="text" value={activeItem.sku} 
                                       onChange={(e) => setActiveItem({...activeItem, sku: e.target.value})}
                                       className="w-full px-10 py-6 bg-slate-50 border-2 border-slate-100 rounded-[32px] text-lg font-black outline-none focus:bg-white focus:border-indigo-600 transition-all uppercase"
                                    />
                                 </div>
                                 <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-2">Asset Category</label>
                                    <select 
                                       value={activeItem.category}
                                       onChange={(e) => setActiveItem({...activeItem, category: e.target.value})}
                                       className="w-full px-10 py-6 bg-slate-50 border-2 border-slate-100 rounded-[32px] text-lg font-black outline-none appearance-none"
                                    >
                                       <option>General</option>
                                       <option>Apparel</option>
                                       <option>Coffee</option>
                                       <option>Appliances</option>
                                    </select>
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     )}

                     {editStep === 2 && (
                        <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-10">
                           <div className="space-y-4">
                              <h3 className="text-4xl font-black tracking-tighter">Supply Intelligence</h3>
                              <p className="text-sm text-slate-400 font-bold italic">Configure the predictive restock rules and safety net buffers.</p>
                           </div>
                           <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-3">
                                 <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-2">Mean Velocity (Units/d)</label>
                                 <input 
                                    type="number" step="0.1" value={activeItem.velocity} 
                                    onChange={(e) => setActiveItem({...activeItem, velocity: Number(e.target.value)})}
                                    className="w-full px-10 py-6 bg-slate-50 border-2 border-slate-100 rounded-[32px] text-2xl font-black outline-none focus:bg-white focus:border-indigo-600 transition-all text-indigo-600"
                                 />
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-2">Lead Time Horizon (d)</label>
                                 <input 
                                    type="number" value={activeItem.leadTime} 
                                    onChange={(e) => setActiveItem({...activeItem, leadTime: Number(e.target.value)})}
                                    className="w-full px-10 py-6 bg-slate-50 border-2 border-slate-100 rounded-[32px] text-2xl font-black outline-none focus:bg-white focus:border-indigo-600 transition-all"
                                 />
                              </div>
                           </div>
                           <div className="space-y-5 p-10 bg-indigo-50/50 rounded-[44px] border-2 border-indigo-100">
                              <div className="flex justify-between items-center mb-2 px-2">
                                 <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Custom Safety Buffer Index</span>
                                 <span className="text-2xl font-black text-indigo-600">{activeItem.safetyBuffer}%</span>
                              </div>
                              <input 
                                type="range" min="0" max="100" 
                                value={activeItem.safetyBuffer} 
                                onChange={(e) => setActiveItem({...activeItem, safetyBuffer: Number(e.target.value)})}
                                className="w-full h-4 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                              />
                           </div>
                        </motion.div>
                     )}

                     {editStep === 3 && (
                        <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-10">
                           <div className="space-y-4">
                              <h3 className="text-4xl font-black tracking-tighter text-emerald-600 flex items-center gap-4">
                                 <ShieldCheck className="w-10 h-10" /> Ready to Provision
                              </h3>
                              <p className="text-sm text-slate-400 font-bold italic">Simulating intelligence preview based on current system conditions.</p>
                           </div>
                           
                           <div className="space-y-6">
                              <div className="p-10 bg-slate-900 rounded-[48px] text-white flex flex-col gap-6 relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-8 opacity-10"><Zap className="w-16 h-16" /></div>
                                 <div className="grid grid-cols-2 gap-8 divide-x divide-white/10">
                                    <div className="flex flex-col">
                                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Calculated ROP</span>
                                       <span className="text-4xl font-black text-white">{calculateIntelligence(activeItem).reorderPoint} Units</span>
                                    </div>
                                    <div className="flex flex-col pl-8">
                                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Risk Factor</span>
                                       <span className={cn(
                                          "text-3xl font-black",
                                          activeItem.stock < 10 ? 'text-rose-500' : 'text-emerald-500'
                                       )}>
                                          {activeItem.stock < 10 ? 'CRITICAL' : 'OPTIMAL'}
                                       </span>
                                    </div>
                                 </div>
                                 <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                                    <p className="text-xs font-bold italic opacity-80 flex items-center gap-3">
                                       <Info className="w-4 h-4 text-indigo-400" />
                                       "This asset will stock out in approx {calculateIntelligence(activeItem).daysToStockout >= 999 ? 'infinite' : Math.floor(calculateIntelligence(activeItem).daysToStockout)} days if demand remains static."
                                    </p>
                                    <p className="text-xs font-bold italic opacity-80 flex items-center gap-3">
                                       <ShoppingBag className="w-4 h-4 text-emerald-400" />
                                       "Recommended procurement qty: {Math.max(50, Math.ceil(activeItem.velocity * 30 * 1.15))} units."
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>

                  <div className="mt-16 flex items-center gap-6">
                     {editStep > 1 && (
                        <button 
                           onClick={() => setEditStep(editStep - 1)}
                           className="flex-1 py-7 bg-slate-50 text-slate-400 rounded-[32px] text-[12px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all"
                        >
                           <ArrowLeft className="w-5 h-5" /> Previous
                        </button>
                     )}
                     <button 
                         onClick={() => {
                            if (editStep < 3) {
                               setEditStep(editStep + 1);
                            } else {
                               handleUpdateProduct(activeItem.id, {
                                  name: activeItem.name,
                                  sku: activeItem.sku,
                                  category: activeItem.category,
                                  velocity: activeItem.velocity,
                                  leadTime: activeItem.leadTime,
                                  safetyBuffer: activeItem.safetyBuffer
                               });
                               triggerToast("Asset Provisioning Successfully Mastered.");
                               setIsEditModalOpen(false);
                            }
                         }}
                         className="flex-[2] py-9 bg-slate-900 text-white rounded-[36px] text-[12px] font-black uppercase tracking-[0.2em] shadow-3xl hover:bg-indigo-600 active:scale-95 transition-all flex items-center justify-center gap-4"
                     >
                        {editStep < 3 ? 'Continue Integration' : 'Finalize Provisioning'} <ArrowRight className="w-5 h-5" />
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
