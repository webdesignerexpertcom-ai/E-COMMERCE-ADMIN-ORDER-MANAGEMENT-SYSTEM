'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Activity, 
  Package,
  Check,
  X,
  Bell,
  Mail,
  MessageSquare,
  Clock,
  History,
  ChevronRight,
  Menu,
  Layout,
  Settings,
  Flame,
  DollarSign,
  Download,
  Archive,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { omsFetch } from '@/lib/api';
import { 
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
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<ProductIntelligence | null>(null);
  const [restockQty, setRestockQty] = useState(0);
  const [showArchived, setShowArchived] = useState(false);
  
  const [notifications, setNotifications] = useState({ email: true, sms: false, inApp: true });
  const [auditLogs] = useState([
    { id: 1, action: 'Provisioned SKU', target: 'COFFEE-DRK-10', user: 'System', time: '2m' },
    { id: 2, action: 'Threshold Calibrated', target: 'Apparel', user: '@Admin', time: '15m' },
    { id: 3, action: 'Restock Authorized', target: 'TEA-GRN-05', user: 'Auto-Bot', time: '1h' },
  ]);
  
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [categoryPolicies] = useState<Record<string, number>>({
    'Coffee': 10, 'Apparel': 10, 'Appliances': 10, 'General': 15
  });

  const fetchProducts = async () => {
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
          category: p.category || 'General',
          isArchived: !!p.isArchived
        })));
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastOpen(true);
    setTimeout(() => setIsToastOpen(false), 3000);
  };

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

  const submitRestockOrder = async (p: ProductIntelligence, qty: number) => {
    const success = await handleUpdateProduct(p.id, { restockStatus: 'pending', incomingStock: qty });
    if (success) {
      triggerToast(`${p.sku}: PROCUREMENT AUTHORIZED`);
      setIsRestockModalOpen(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["SKU", "Name", "Category", "Stock", "Velocity", "Status", "ROP"];
    const rows = products.map(p => {
      const intel = calculateIntelligence(p);
      return [p.sku, p.name, p.category, p.stock, p.velocity, intel.status, intel.reorderPoint];
    });
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `intelligence_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    triggerToast("INTELLIGENCE DATA EXPORTED");
  };

  const calculateIntelligence = (p: ProductIntelligence) => {
    const demandDuringLead = p.velocity * p.leadTime;
    const bufferUnits = (demandDuringLead * (p.safetyBuffer / 100));
    const reorderPoint = Math.ceil(demandDuringLead + bufferUnits);
    const daysToStockout = p.velocity > 0 ? (p.stock / p.velocity) : 999;
    let status: 'OUT OF STOCK' | 'CRITICAL' | 'LOW STOCK' | 'HEALTHY' = 'HEALTHY';
    if (p.stock <= 0) status = 'OUT OF STOCK';
    else if (p.stock < (p.velocity * 2)) status = 'CRITICAL';
    else if (p.stock < reorderPoint) status = 'LOW STOCK';
    const projectedLoss = (status !== 'HEALTHY' && p.velocity > 0) ? (p.velocity * (p.price || 0) * (p.leadTime)).toFixed(0) : '0';
    return { reorderPoint, daysToStockout, status, projectedLoss };
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, searchTerm, activeCategory]);

  return (
    <div className="min-h-screen pb-24 md:pb-32 max-w-[1700px] mx-auto px-4 sm:px-8 xl:px-12 space-y-10 md:space-y-16">
      <AnimatePresence>
        {isToastOpen && (
          <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }} className="fixed top-0 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900 text-white px-8 py-4 rounded-full shadow-4xl flex items-center gap-4 transition-all w-[90%] md:w-auto">
             <Check className="w-5 h-5 text-emerald-400" />
             <p className="text-[10px] md:text-xs font-black uppercase tracking-wider">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
         {mobileMenuOpen && (
            <div className="fixed inset-0 z-[2000] lg:hidden">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
               <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white p-10 flex flex-col gap-8 shadow-4xl">
                  <div className="flex justify-between items-center">
                     <h3 className="text-2xl font-black italic">Menu</h3>
                     <button onClick={() => setMobileMenuOpen(false)}><X className="w-8 h-8" /></button>
                  </div>
                  <nav className="flex flex-col gap-4">
                     {['Dashboard', 'Products', 'Alerts', 'Analytics', 'Settings'].map(item => (
                        <button key={item} onClick={() => setMobileMenuOpen(false)} className="p-6 text-left rounded-3xl bg-slate-50 text-slate-900 font-black uppercase tracking-widest text-xs hover:bg-slate-900 hover:text-white transition-all">{item}</button>
                     ))}
                  </nav>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full">Autonomous Mode</div>
          </div>
          <h1 className="text-4xl sm:text-7xl font-black text-slate-900 tracking-tighter leading-none">Intelligence</h1>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={exportToCSV}
             className="hidden sm:flex px-6 py-5 bg-white border border-slate-200 text-slate-900 rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-sm hover:border-slate-400 transition-all items-center gap-3"
           >
              <Download className="w-4 h-4" /> Export
           </button>
           <button onClick={() => { setActiveItem({ id: '', name: '', sku: '', category: 'General', stock: 0, min: 10, velocity: 1.0, leadTime: 7, safetyBuffer: 15, restockStatus: 'none', incomingStock: 0, isArchived: false } as any); setIsEditModalOpen(true); }} className="flex-1 md:flex-none px-10 py-5 bg-slate-900 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
             <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New SKU</span>
           </button>
           <button onClick={() => setMobileMenuOpen(true)} className="p-5 bg-white border border-slate-200 rounded-3xl text-slate-400 md:hidden shadow-sm"><Menu className="w-6 h-6" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'OOS SKUs', val: products.filter(p => p.stock <= 0).length, color: 'slate-900', icon: Package, bg: 'bg-slate-50' },
           { label: 'Critical', val: products.filter(p => calculateIntelligence(p).status === 'CRITICAL').length, color: 'rose-600', icon: Flame, bg: 'bg-rose-50' },
           { label: 'Low Stock', val: products.filter(p => calculateIntelligence(p).status === 'LOW STOCK').length, color: 'amber-500', icon: Activity, bg: 'bg-amber-50' },
           { label: 'Loss Risk', val: `₹${Math.floor(Number(products.reduce((acc, p) => acc + parseFloat(calculateIntelligence(p).projectedLoss), 0)) / 1000)}k`, color: 'emerald-600', icon: DollarSign, bg: 'bg-emerald-50' },
         ].map(card => (
            <div key={card.label} className={cn("p-8 rounded-[48px] border border-slate-100 relative overflow-hidden transition-all", card.bg)}>
               <span className={cn("text-[10px] font-black uppercase tracking-widest block mb-4", `text-${card.color}`)}>{card.label}</span>
               <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{card.val}</h3>
            </div>
         ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 justify-between">
          <div className="relative flex-1 max-w-2xl">
              <Search className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
              <input type="text" placeholder="Deep Search SKUs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-3xl text-sm font-black outline-none" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              <button 
                onClick={() => setShowArchived(!showArchived)}
                className={cn(
                  "px-6 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                  showArchived ? "bg-amber-100 border-amber-200 text-amber-700" : "bg-white text-slate-400"
                )}
              >
                 {showArchived ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                 {showArchived ? 'Viewing Archived' : 'Show Archived'}
              </button>
              {['All', 'Coffee', 'Apparel', 'Appliances', 'General'].map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("px-6 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap", activeCategory === cat ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-400")}>{cat}</button>
              ))}
          </div>
      </div>

      <div className="bg-white rounded-[48px] border border-slate-200 shadow-xl overflow-hidden hidden lg:block">
         <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
               <tr>
                  <th className="p-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-12">Product Ident</th>
                  <th className="p-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Velocity</th>
                  <th className="p-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Health Scan</th>
                  <th className="p-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-12">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {filteredProducts.map(p => {
                  const intel = calculateIntelligence(p);
                  return (
                     <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="p-8 pl-12 flex items-center gap-5">
                           <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center font-black text-slate-200 overflow-hidden shadow-sm">{p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <Package className="w-6 h-6" />}</div>
                           <div><span className="text-sm font-black text-slate-900 block leading-tight">{p.name}</span><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.sku}</span></div>
                        </td>
                        <td className="p-8 text-center"><span className="text-xl font-black text-slate-900 block">{p.velocity}</span><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic leading-none">u/day</span></td>
                        <td className="p-8 min-w-[300px]">
                           <div className="space-y-2">
                              <div className="flex justify-between items-end"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.stock} Units</span><span className={cn("text-[9px] font-black uppercase tracking-widest rounded-full px-3 py-1", intel.status === 'CRITICAL' ? 'bg-rose-100 text-rose-600' : intel.status === 'LOW STOCK' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600')}>{intel.status}</span></div>
                              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5"><div className={cn("h-full rounded-full transition-all", intel.status === 'CRITICAL' ? 'bg-rose-500' : 'bg-emerald-500')} style={{ width: `${Math.min(100, (p.stock / (intel.reorderPoint * 1.5)) * 100)}%` }} /></div>
                           </div>
                        </td>
                        <td className="p-8 text-right pr-12">
                           {p.restockStatus === 'pending' ? <div className="px-5 py-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center justify-end gap-2"><Clock className="w-4 h-4 animate-spin" /> Ordered ({p.incomingStock})</div> : <button onClick={() => { setActiveItem(p); setRestockQty(Math.max(50, Math.ceil(p.velocity * 30 * 1.15))); setIsRestockModalOpen(true); }} className="px-6 py-3.5 rounded-2xl text-[10px] font-black bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">Restock</button>}
                        </td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-6">
         {filteredProducts.map(p => {
            const intel = calculateIntelligence(p);
            return (
               <div key={p.id} className="bg-white rounded-[32px] border border-slate-100 p-6 space-y-6 shadow-sm relative">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-300 overflow-hidden">{p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <Package className="w-6 h-6" />}</div>
                     <div className="flex-1">
                        <span className="text-md font-black text-slate-900 block truncate">{p.name}</span>
                        <div className="flex items-center gap-2"><span className="text-[10px] font-black text-slate-400">{p.sku}</span><span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border", intel.status === 'CRITICAL' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100')}>{intel.status}</span></div>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Current Stock</p><span className="text-xl font-black text-slate-900">{p.stock}</span></div>
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Time to Out</p><span className="text-xl font-black text-indigo-600">{Math.floor(intel.daysToStockout)}d</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.restockStatus === 'pending' ? <button className="flex-1 py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><Clock className="w-4 h-4 animate-spin" /> Pending</button> : <button onClick={() => { setActiveItem(p); setRestockQty(Math.max(50, Math.ceil(p.velocity * 30 * 1.15))); setIsRestockModalOpen(true); }} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Restock</button>}
                    <button onClick={() => { setActiveItem(p); setIsEditModalOpen(true); }} className="p-4 border border-slate-100 rounded-2xl text-slate-400"><Settings className="w-5 h-5" /></button>
                  </div>
               </div>
            );
         })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          <div className="bg-slate-900 rounded-[64px] p-12 text-white shadow-2xl overflow-hidden relative group">
             <div className="flex items-center justify-between mb-8 relative z-10"><h3 className="text-2xl font-black tracking-tight flex items-center gap-3"><Layout className="w-8 h-8 text-indigo-500" /> Supply Pulse</h3></div>
             <div className="h-[300px] w-full relative z-10">
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

          <div className="bg-white rounded-[64px] border border-slate-200 p-12 shadow-sm space-y-8">
              <div className="flex items-center justify-between"><h3 className="text-2xl font-black leading-tight tracking-tight flex items-center gap-3"><Bell className="w-8 h-8 text-indigo-600" /> Notifications & Audit</h3></div>
              <div className="space-y-4">
                 {[ { id: 'email', label: 'Email Report', icon: Mail }, { id: 'sms', label: 'SMS Pipeline', icon: MessageSquare }, { id: 'inApp', label: 'In-App Pulse', icon: Bell } ].map(item => (
                    <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                       <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm text-slate-400"><item.icon className="w-5 h-5" /></div><span className="text-sm font-black text-slate-900">{item.label}</span></div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={notifications[item.id as keyof typeof notifications]} onChange={(e) => setNotifications({...notifications, [item.id]: e.target.checked})} />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                       </label>
                    </div>
                 ))}
              </div>
              <div className="pt-8 border-t border-slate-100"><h4 className="text-md font-black flex items-center gap-3 mb-6"><History className="w-5 h-5" /> Audit Pulse</h4><div className="space-y-4">{auditLogs.map(log => (<div key={log.id} className="flex gap-4 items-center justify-between"><p className="text-xs font-bold text-slate-600">{log.action}: <span className="text-slate-900">{log.target}</span></p><span className="text-[9px] font-black uppercase text-indigo-500">{log.time}</span></div>))}</div></div>
          </div>
      </div>

      <AnimatePresence>
        {isRestockModalOpen && activeItem && (
          <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 md:p-6 bg-slate-900/80 backdrop-blur-3xl overflow-y-auto">
             <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 200, opacity: 0 }} className="bg-white rounded-t-[48px] sm:rounded-[64px] shadow-4xl w-full max-w-2xl overflow-hidden border-t-8 sm:border-8 border-white/20">
                <div className="bg-slate-900 p-10 text-white flex justify-between items-center"><h2 className="text-2xl md:text-4xl font-black tracking-tighter">Ship Restock</h2><button onClick={() => setIsRestockModalOpen(false)}><X className="w-8 h-8" /></button></div>
                <div className="p-10 space-y-8">
                   <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[32px] space-y-2"><p className="text-[10px] md:text-sm font-bold text-slate-500 italic">&quot;This order pulse will cover demand for the next 30 operational days.&quot;</p></div>
                   <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 pl-2">Quantity</label><input type="number" value={restockQty} onChange={(e) => setRestockQty(Number(e.target.value))} className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[28px] text-4xl font-black outline-none focus:bg-white focus:border-indigo-600 transition-all" /></div>
                   <button onClick={() => submitRestockOrder(activeItem, restockQty)} className="w-full py-8 bg-slate-900 text-white rounded-[32px] text-[11px] font-black uppercase tracking-[0.3em] shadow-4xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-4">Ship Procurement <ChevronRight className="w-5 h-5" /></button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && activeItem && (
          <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 md:p-6 bg-slate-900/60 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 200, opacity: 0 }} className="bg-white rounded-t-[48px] sm:rounded-[64px] shadow-3xl w-full max-w-xl">
               <div className="bg-slate-900 p-8 text-white flex items-center justify-between"><div className="flex items-center gap-5"><Plus className="w-6 h-6 text-amber-500" /><h2 className="text-2xl font-black">Provision SKU</h2></div><button onClick={() => setIsEditModalOpen(false)}><X className="w-6 h-6" /></button></div>
               <div className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 pl-2">Name</label><input type="text" value={activeItem.name} onChange={(e) => setActiveItem({...activeItem, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 pl-2">SKU ID</label><input type="text" value={activeItem.sku} onChange={(e) => setActiveItem({...activeItem, sku: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none uppercase" /></div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 pl-2">Category</label>
                        <select value={activeItem.category} onChange={(e) => setActiveItem({...activeItem, category: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none h-full appearance-none">
                           <option>General</option>
                           <option>Apparel</option>
                           <option>Coffee</option>
                           <option>Appliances</option>
                        </select>
                     </div>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                     <div className="flex items-center gap-4 text-slate-900">
                        <Archive className="w-5 h-5" />
                        <div>
                           <p className="text-sm font-black">Archive Asset</p>
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Withdraw from Intelligence Cycle</p>
                        </div>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={activeItem.isArchived} onChange={(e) => setActiveItem({...activeItem, isArchived: e.target.checked})} />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                     </label>
                  </div>

                  <button onClick={async () => { if (await handleUpdateProduct(activeItem.id, activeItem)) { triggerToast(`${activeItem.sku}: PROVISIONED`); setIsEditModalOpen(false); } }} className="w-full py-7 bg-slate-900 text-white rounded-[28px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all text-xs">Authorize Provisioning</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
