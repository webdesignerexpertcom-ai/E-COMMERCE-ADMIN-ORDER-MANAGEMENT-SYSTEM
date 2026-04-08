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
  ArrowDownRight,
  ChevronRight
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

// Simulated data for charts
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
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<ProductIntelligence | null>(null);
  
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
          velocity: p.velocity || (Math.random() * 5 + 1).toFixed(1),
          leadTime: p.leadTime || 7,
          safetyBuffer: p.safetyBuffer || (categoryPolicies[p.category] || categoryPolicies['General']),
          restockStatus: p.restockStatus || 'none',
          incomingStock: p.incomingStock || 0,
          price: p.price || 999
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
    const totalPossibleStock = p.stock + p.incomingStock;
    const demandDuringLead = p.velocity * p.leadTime;
    const bufferUnits = (demandDuringLead * (p.safetyBuffer / 100));
    const reorderPoint = Math.ceil(demandDuringLead + bufferUnits);
    
    // Core Logic Rules
    let status: 'OUT OF STOCK' | 'CRITICAL' | 'LOW STOCK' | 'HEALTHY' = 'HEALTHY';
    const daysToStockout = p.velocity > 0 ? (p.stock / p.velocity) : 999;
    
    if (p.stock === 0) status = 'OUT OF STOCK';
    else if (p.stock < (p.velocity * 2)) status = 'CRITICAL';
    else if (p.stock < reorderPoint) status = 'LOW STOCK';
    
    const projectedLoss = status !== 'HEALTHY' ? (p.velocity * (p.price || 0) * (p.leadTime)).toFixed(2) : '0.00';

    return { reorderPoint, daysToStockout, status, projectedLoss, totalPossibleStock };
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
      const env = localStorage.getItem('oms-environment') || 'production';
      const res = await omsFetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-environment': env },
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
    const success = await handleUpdateProduct(p.id, {
      restockStatus: 'pending',
      incomingStock: qty
    });
    if (success) {
      triggerToast(`Restock Command Pulled: ${qty} units of ${p.sku} in transit.`);
      setIsRestockModalOpen(false);
    }
  };

  return (
    <div className="space-y-10 min-h-screen pb-20 max-w-[1600px] mx-auto">
      <AnimatePresence>
        {isToastOpen && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[500] bg-slate-900 border border-white/10 text-white px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-4"
          >
             <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
             </div>
             <p className="text-sm font-black uppercase tracking-widest">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Area */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full">Automated Mode</div>
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-50 bg-slate-200" />
                 ))}
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">+14 Team Members Monitoring</span>
           </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-3">Inventory Pulse</h1>
          <p className="text-slate-500 font-bold italic opacity-70 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Proactive stockouts prevention engine active and monitoring.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 rounded-[32px] shadow-sm border border-slate-200">
           <div className="flex flex-col px-6">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Fulfillment Goal</span>
              <div className="flex items-center gap-3 mt-1">
                 <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} className="h-full bg-indigo-600" />
                 </div>
                 <span className="text-sm font-black text-slate-900">82%</span>
              </div>
           </div>
           <button className="px-10 py-5 bg-indigo-600 text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
              <Plus className="w-5 h-5" /> Expand Catalog
           </button>
        </div>
      </div>

      {/* Analytics Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Status Cards */}
         {[
           { label: 'Out of Stock', status: 'OUT OF STOCK', color: 'slate-900', icon: Package },
           { label: 'Critical Signal', status: 'CRITICAL', color: 'rose-600', icon: AlertTriangle, animate: true },
           { label: 'Low Stock Alert', status: 'LOW STOCK', color: 'amber-500', icon: Activity },
           { label: 'Revenue at Risk', status: 'RISK', color: 'emerald-600', icon: DollarSign, isMoney: true },
         ].map((card) => {
            const items = card.status === 'RISK' ? products : products.filter(p => calculateIntelligence(p).status === card.status);
            const totalRisk = card.status === 'RISK' ? products.reduce((acc, p) => acc + parseFloat(calculateIntelligence(p).projectedLoss), 0).toFixed(0) : items.length;

            return (
              <motion.div 
                key={card.label}
                whileHover={{ y: -5 }}
                className={cn(
                  "p-8 rounded-[40px] border shadow-sm relative overflow-hidden group transition-all",
                  card.status === 'CRITICAL' ? 'bg-rose-50 border-rose-100' : 
                  card.status === 'LOW STOCK' ? 'bg-amber-50 border-amber-100' :
                  card.status === 'OUT OF STOCK' ? 'bg-slate-50 border-slate-200' : 'bg-emerald-50 border-emerald-100'
                )}
              >
                 <div className={cn("absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-125 transition-transform group-hover:rotate-12")}>
                    <card.icon className="w-40 h-40" />
                 </div>
                 <div className="flex items-center justify-between mb-4">
                    <span className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-2", `text-${card.color}`)}>
                       <div className={cn("w-2 h-2 rounded-full", `bg-${card.color}`, card.animate && "animate-pulse")} />
                       {card.label}
                    </span>
                    <Info className="w-4 h-4 text-slate-300 cursor-help" />
                 </div>
                 <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-1">
                    {card.isMoney ? `₹${Number(totalRisk).toLocaleString()}` : totalRisk}
                 </h2>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic opacity-70">
                    {card.status === 'RISK' ? "Projected Weekly Loss" : `SKUs requiring attention`}
                 </p>
              </motion.div>
            );
         })}
      </div>

      {/* Main Intelligence Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
         {/* Live Intelligence Feed (Table) */}
         <div className="xl:col-span-2 bg-white rounded-[56px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/10">
               <div className="relative group max-w-xl w-full">
                  <Search className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search SKUs, categories, or names..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[32px] text-sm font-black focus:ring-[12px] focus:ring-indigo-600/5 shadow-sm outline-none transition-all"
                  />
               </div>
               <div className="flex items-center gap-2">
                  {categories.map(cat => (
                     <button 
                       key={cat} onClick={() => setActiveCategory(cat)}
                       className={cn(
                        "px-6 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all",
                        activeCategory === cat ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-400 hover:border-slate-300"
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
                        <th className="p-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-10">SKU Intelligence</th>
                        <th className="p-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Velocity</th>
                        <th className="p-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Health Projection</th>
                        <th className="p-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-10">Operational Protocol</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredProducts.map(p => {
                        const intel = calculateIntelligence(p);
                        return (
                           <tr key={p.id} className="group hover:bg-slate-50/50 transition-all">
                              <td className="p-8 pl-10">
                                 <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-100 rounded-3xl overflow-hidden border border-slate-100 flex items-center justify-center font-black text-slate-300">
                                       {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <Package className="w-6 h-6" />}
                                    </div>
                                    <div>
                                       <span className="text-sm font-black text-slate-900 block leading-tight">{p.name}</span>
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{p.sku} • {p.category}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-8 text-center">
                                 <div className="flex flex-col items-center">
                                    <span className="text-lg font-black text-slate-900 leading-none">{p.velocity}</span>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Units / Day</span>
                                 </div>
                              </td>
                              <td className="p-8">
                                 <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                          {p.stock} / {intel.reorderPoint} ROP
                                       </span>
                                       <span className={cn(
                                          "text-[9px] font-black uppercase tracking-widest rounded-full px-2 py-0.5",
                                          intel.status === 'CRITICAL' ? 'bg-rose-100 text-rose-600' :
                                          intel.status === 'LOW STOCK' ? 'bg-amber-100 text-amber-600' :
                                          intel.status === 'HEALTHY' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-900 text-white'
                                       )}>
                                          {intel.status}
                                       </span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                       <motion.div 
                                          initial={{ width: 0 }} 
                                          animate={{ width: `${Math.min(100, (p.stock / (intel.reorderPoint * 1.5)) * 100)}%` }}
                                          className={cn(
                                             "h-full rounded-full transition-all duration-1000",
                                             intel.status === 'CRITICAL' ? 'bg-rose-500' : 'bg-emerald-500'
                                          )}
                                       />
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 italic">
                                       {intel.daysToStockout < 1 ? 'Out of stock' : `Forecasted stockout: ${Math.floor(intel.daysToStockout)} days`}
                                    </p>
                                 </div>
                              </td>
                              <td className="p-8 text-right pr-10">
                                 <div className="flex items-center justify-end gap-3">
                                    {p.restockStatus === 'pending' ? (
                                       <div className="px-6 py-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                          <Clock className="w-3.5 h-3.5 animate-spin" /> In-Transit ({p.incomingStock})
                                       </div>
                                    ) : (
                                       <button 
                                          onClick={() => { setActiveItem(p); setIsRestockModalOpen(true); }}
                                          className={cn(
                                             "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95",
                                             intel.status === 'HEALTHY' ? "bg-white border border-slate-200 text-slate-400" : "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                                          )}
                                       >
                                          {intel.status === 'HEALTHY' ? 'Details' : 'Initiate Restock'}
                                       </button>
                                    )}
                                    <button 
                                      onClick={() => { setActiveItem(p); setIsEditModalOpen(true); }}
                                      className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-colors shadow-sm"
                                    >
                                       <Edit2 className="w-4 h-4" />
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

         {/* Sidebar: Analytics & Policies */}
         <div className="space-y-10">
            {/* Visual Stock Trend */}
            <div className="bg-slate-900 rounded-[56px] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                         <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                         <h3 className="text-xl font-black">Stock Forecast</h3>
                         <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">7-Day Demand Projection</p>
                      </div>
                   </div>
                   <ArrowUpRight className="w-6 h-6 text-emerald-400" />
                </div>
                
                <div className="h-[250px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={TREND_DATA}>
                         <defs>
                            <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                         <XAxis fontSize={10} stroke="#ffffff40" dataKey="name" />
                         <YAxis fontSize={10} stroke="#ffffff40" />
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '16px' }}
                            itemStyle={{ color: '#fff' }}
                         />
                         <Area type="monotone" dataKey="stock" stroke="#6366f1" fillOpacity={1} fill="url(#colorStock)" />
                         <Area type="monotone" dataKey="demand" stroke="#fbbf24" fillOpacity={0} />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                   <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Avg Velocity</p>
                      <h4 className="text-2xl font-black">12.4 <span className="text-[10px] text-emerald-400 italic">+2.1%</span></h4>
                   </div>
                   <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Fulfillment Rate</p>
                      <h4 className="text-2xl font-black">88<span className="text-sm text-indigo-400 font-black">%</span></h4>
                   </div>
                </div>
            </div>

            {/* Config & Audit Sidebar */}
            <div className="bg-white rounded-[56px] border border-slate-200 p-10 shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900">
                      <Settings className="w-6 h-6" />
                   </div>
                   <h3 className="text-xl font-black tracking-tight">Policies</h3>
                </div>
                
                <div className="space-y-4">
                   {Object.entries(categoryPolicies).map(([cat, val]) => (
                      <div key={cat} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                         <div>
                            <p className="text-sm font-black text-slate-900">{cat}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Buffer Index</p>
                         </div>
                         <div className="flex items-center gap-3">
                            <input 
                              type="number" value={val} 
                              onChange={(e) => setCategoryPolicies({...categoryPolicies, [cat]: Number(e.target.value)})}
                              className="w-16 h-10 bg-white border border-slate-200 rounded-xl text-center font-black text-indigo-600 outline-none"
                            />
                            <span className="text-xs font-black text-slate-300">%</span>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="pt-8 border-t border-slate-100 italic">
                   <div className="flex items-center gap-3 text-slate-400 mb-4">
                      <History className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Recent System Actions</span>
                   </div>
                   <div className="space-y-4">
                      {[1,2].map(i => (
                         <div key={i} className="flex gap-3 text-[10px] font-bold text-slate-500 leading-tight">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1 shrink-0" />
                            <p>Threshold increased for <span className="text-slate-900 underline">Apparel</span> category by administrator <span className="text-indigo-600">@Sarah</span></p>
                         </div>
                      ))}
                   </div>
                </div>
            </div>
         </div>
      </div>

      {/* Restock Workflow Modal */}
      <AnimatePresence>
        {isRestockModalOpen && activeItem && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-900/60">
             <motion.div 
               initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
               className="bg-white rounded-[64px] shadow-3xl w-full max-w-2xl overflow-hidden border border-white/20"
             >
                <div className="bg-slate-900 p-12 text-white relative">
                   <div className="absolute top-0 right-0 p-12 opacity-10"><Zap className="w-24 h-24" /></div>
                   <div className="flex items-center gap-6 relative z-10">
                      <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl">
                         <Truck className="w-10 h-10" />
                      </div>
                      <div>
                         <h2 className="text-4xl font-black tracking-tighter mb-1">Stock Replenishment</h2>
                         <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Procurement Command Protocol</p>
                      </div>
                   </div>
                   <button onClick={() => setIsRestockModalOpen(false)} className="absolute top-10 right-10 p-4 hover:bg-white/10 rounded-2xl transition-colors"><X className="w-8 h-8" /></button>
                </div>
                
                <div className="p-16 space-y-12">
                   <div className="grid grid-cols-2 gap-10">
                      <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex flex-col justify-between">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-4">Stock Intelligence</span>
                         <div className="space-y-4">
                            <div className="flex justify-between">
                               <span className="text-xs font-bold text-slate-600">Daily Demand</span>
                               <span className="text-xs font-black text-slate-900">{activeItem.velocity} Units</span>
                            </div>
                            <div className="flex justify-between">
                               <span className="text-xs font-bold text-slate-600">Lead Time</span>
                               <span className="text-xs font-black text-slate-900">{activeItem.leadTime} Days</span>
                            </div>
                            <div className="flex justify-between pt-4 border-t border-slate-200">
                               <span className="text-xs font-bold text-indigo-600 uppercase">Recommended Qty</span>
                               <span className="text-lg font-black text-indigo-600">{Math.max(50, Math.ceil(activeItem.velocity * 30 * 1.15))} Units</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="space-y-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Order Quantity Units</label>
                            <input 
                               type="number" 
                               defaultValue={Math.max(50, Math.ceil(activeItem.velocity * 30 * 1.15))}
                               id="orderQty"
                               className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[28px] text-xl font-black text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-inner"
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Procurement Mode</label>
                            <select className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[28px] text-sm font-black text-slate-900 outline-none appearance-none cursor-pointer">
                               <option>Standard Dispatch (7 Days)</option>
                               <option>Expedited Protocol (2 Days)</option>
                               <option>Bulk Container (21 Days)</option>
                            </select>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-6">
                      <button 
                        onClick={() => setIsRestockModalOpen(false)}
                        className="flex-1 py-6 bg-slate-50 text-slate-400 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all underline underline-offset-4"
                      >
                         Abort Protocol
                      </button>
                      <button 
                        onClick={() => {
                           const qty = Number((document.getElementById('orderQty') as HTMLInputElement).value);
                           submitRestockOrder(activeItem, qty);
                        }}
                        className="flex-[2] py-8 bg-indigo-600 text-white rounded-[32px] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                      >
                         Authorize Procurement Order <ChevronRight className="w-5 h-5" />
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Identity Matrix Configuration Modal (Add/Edit) */}
      <AnimatePresence>
        {isEditModalOpen && activeItem && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-900/40">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white rounded-[64px] border border-slate-200 w-full max-w-xl overflow-hidden shadow-3xl"
            >
               <div className="bg-slate-900 p-10 text-white flex items-center justify-between">
                  <div className="flex items-center gap-5">
                     <div className="w-16 h-16 bg-amber-500 rounded-[28px] flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Edit2 className="w-8 h-8" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-black tracking-tighter">Calibrate Asset</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Refining parameters for {activeItem.sku}</p>
                     </div>
                  </div>
                  <button onClick={() => setIsEditModalOpen(false)} className="p-4 hover:bg-white/10 rounded-2xl transition-colors"><X className="w-8 h-8" /></button>
               </div>
               
               <div className="p-12 space-y-8">
                  <div className="space-y-3">
                     <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-2">Asset Public Identity</label>
                     <input 
                        type="text" 
                        value={activeItem.name} 
                        onChange={(e) => setActiveItem({...activeItem, name: e.target.value})}
                        className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[28px] text-md font-black focus:bg-white focus:border-amber-500 outline-none transition-all shadow-inner"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-2">Velocity (µ/day)</label>
                        <input 
                           type="number" step="0.1" value={activeItem.velocity} 
                           onChange={(e) => setActiveItem({...activeItem, velocity: Number(e.target.value)})}
                           className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-md font-black focus:bg-white focus:border-amber-500 outline-none transition-all shadow-inner"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-2">Lead Time (Days)</label>
                        <input 
                           type="number" value={activeItem.leadTime} 
                           onChange={(e) => setActiveItem({...activeItem, leadTime: Number(e.target.value)})}
                           className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-md font-black focus:bg-white focus:border-amber-500 outline-none transition-all shadow-inner"
                        />
                     </div>
                  </div>

                  <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100 space-y-4">
                     <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Current Risk Level</span>
                        <span className="text-xl font-black text-indigo-600">{calculateIntelligence(activeItem).status}</span>
                     </div>
                     <p className="text-[10px] font-bold text-slate-500 text-center leading-relaxed">
                        Changing these parameters will recalculate the reorder points and automated alerts for this specific SKU across the global network.
                     </p>
                  </div>

                  <button 
                    onClick={() => {
                       handleUpdateProduct(activeItem.id, {
                          name: activeItem.name,
                          velocity: activeItem.velocity,
                          leadTime: activeItem.leadTime
                       });
                       setIsEditModalOpen(false);
                       triggerToast("Asset Calibration Successfully Synchronized.");
                    }}
                    className="w-full py-8 bg-slate-900 text-white rounded-[32px] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                     Sync Matrix Configuration
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
