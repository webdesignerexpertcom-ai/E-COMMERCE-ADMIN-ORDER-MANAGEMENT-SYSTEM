'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  History, 
  ArrowUp, 
  ArrowDown, 
  AlertTriangle,
  Layers,
  ChevronDown,
  Edit2,
  Trash2,
  MoreVertical,
  Zap,
  ArrowRight,
  Check,
  X,
  Database,
  ArrowUpRight,
  Settings2,
  PackageCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const initialInventory = [
  { 
    id: '1', name: 'XL Blue Shirt', sku: 'SHIRT-BLU-XL', stock: 2, min: 15, status: 'low-stock', price: '$24.00', 
    variants: [
      { id: 'v1', size: 'XL', color: 'Blue', stock: 2, sku: 'SHIRT-BLU-XL' },
      { id: 'v2', size: 'L', color: 'Blue', stock: 15, sku: 'SHIRT-BLU-L' },
      { id: 'v3', size: 'M', color: 'Blue', stock: 25, sku: 'SHIRT-BLU-M' },
    ]
  },
  { 
    id: '2', name: 'Ceramic Mug Blue', sku: 'MUG-CER-BLU', stock: 12, min: 25, status: 'low-stock', price: '$15.00', 
    variants: [] 
  },
  { 
    id: '3', name: 'Milk Frother Pro', sku: 'FRT-PRO-001', stock: 0, min: 10, status: 'out-of-stock', price: '$45.00', 
    variants: [
      { id: 'v4', model: 'Pro Black', stock: 0, sku: 'FRT-PRO-BLK' },
      { id: 'v5', model: 'Pro Silver', stock: 5, sku: 'FRT-PRO-SLV' },
    ] 
  },
  { 
    id: '4', name: 'Linen Apron Grey', sku: 'APR-LIN-GRY', stock: 85, min: 15, status: 'in-stock', price: '$35.00', 
    variants: [
      { id: 'v6', size: 'Standard', color: 'Grey', stock: 85, sku: 'APR-LIN-GRY' },
    ] 
  },
];

export default function InventoryHub() {
  const router = useRouter();
  const [inventory, setInventory] = useState(initialInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkAdjustment, setBulkAdjustment] = useState({ amount: '0', status: '' });
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [isVariantExplorerOpen, setIsVariantExplorerOpen] = useState(false);

  const triggerToast = (msg: string) => {
     setToastMessage(msg);
     setIsToastOpen(true);
     setTimeout(() => setIsToastOpen(false), 3000);
  };

  const adjustStock = (id: string, amount: number) => {
     setInventory(inventory.map(item => {
        if (item.id === id) {
           const newStock = Math.max(0, item.stock + amount);
           let newStatus = 'in-stock';
           if (newStock === 0) newStatus = 'out-of-stock';
           else if (newStock < item.min) newStatus = 'low-stock';
           return { ...item, stock: newStock, status: newStatus };
        }
        return item;
     }));
     triggerToast("Inventory Count Updated.");
  };

  const toggleSelect = (id: string) => {
     setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
     if (selectedIds.length === inventory.length) setSelectedIds([]);
     else setSelectedIds(inventory.map(i => i.id));
  };

  const handleBulkApply = () => {
     const amount = parseInt(bulkAdjustment.amount) || 0;
     setInventory(inventory.map(item => {
        if (selectedIds.includes(item.id)) {
           const newStock = Math.max(0, item.stock + amount);
           let newStatus = bulkAdjustment.status || item.status;
           if (newStock === 0) newStatus = 'out-of-stock';
           else if (newStock < item.min && !bulkAdjustment.status) newStatus = 'low-stock';
           return { ...item, stock: newStock, status: newStatus };
        }
        return item;
     }));
     setIsBulkModalOpen(false);
     setSelectedIds([]);
     setBulkAdjustment({ amount: '0', status: '' });
     triggerToast(`Bulk Adjustment applied to ${selectedIds.length} SKUs.`);
  };

  const filteredInventory = inventory.filter(p => 
     p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative pb-20">
       {/* Real-time Toast System */}
       <AnimatePresence>
        {isToastOpen && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 border border-white/10 text-white px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-4"
          >
             <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Check className="w-5 h-5 font-black text-white" />
             </div>
             <div>
                <p className="text-sm font-black uppercase tracking-widest leading-none">Warehouse Event</p>
                <p className="text-xs font-bold opacity-80 mt-1 italic font-bold">{toastMessage}</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Variant Context Modal */}
      <AnimatePresence>
         {isVariantExplorerOpen && activeItem && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-2xl bg-slate-900/40">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-[48px] shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden"
                >
                   <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                            <Layers className="w-6 h-6" />
                         </div>
                         <div>
                            <h2 className="text-2xl font-black tracking-tight leading-none mb-1">{activeItem.name}</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-80 italic">Matrix Command Hub</p>
                         </div>
                      </div>
                      <button onClick={() => setIsVariantExplorerOpen(false)} className="p-3 hover:bg-white/10 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
                   </div>
                   <div className="p-10 space-y-6">
                      <div className="grid grid-cols-1 gap-3">
                         {activeItem.variants.length > 0 ? activeItem.variants.map((v: any) => (
                            <div key={v.id} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:border-indigo-100 transition-all">
                               <div className="flex flex-col">
                                  <span className="text-sm font-black text-slate-900 leading-tight uppercase">{v.size ? `${v.size} / ` : ''}{v.color || v.model}</span>
                                  <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest italic opacity-70 leading-none">{v.sku}</span>
                               </div>
                               <div className="flex items-center gap-4">
                                  <div className={cn(
                                     "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                                     v.stock === 0 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  )}>
                                     {v.stock} unit{v.stock !== 1 && 's'}
                                  </div>
                                  <button className="p-2.5 bg-white border border-slate-200 rounded-2xl hover:text-indigo-600 transition-all shadow-sm">
                                     <ArrowUpRight className="w-4 h-4" />
                                  </button>
                               </div>
                            </div>
                         )) : (
                            <div className="text-center py-10 space-y-4">
                               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                  <PackageCheck className="w-8 h-8 opacity-40" />
                               </div>
                               <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic leading-none">No active matrices detected for this SKU.</p>
                            </div>
                         )}
                      </div>
                      <button 
                        onClick={() => { setIsVariantExplorerOpen(false); router.push('/admin/catalog/new'); }}
                        className="w-full py-5 bg-indigo-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                      >
                         <Plus className="w-4 h-4" /> Add New Matrix Variation
                      </button>
                   </div>
                </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Bulk Action Header Slider */}
      <AnimatePresence>
         {selectedIds.length > 0 && (
            <motion.div 
               initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
               className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 border border-white/10 text-white px-10 py-6 rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] flex items-center gap-10 min-w-[600px] backdrop-blur-xl"
            >
               <div className="flex items-center gap-4 border-r border-white/10 pr-10">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/30">
                     {selectedIds.length}
                  </div>
                  <div>
                     <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60 italic mb-0.5 leading-none">SKUs Selected</p>
                     <p className="text-sm font-black uppercase tracking-tight">Active Command Deck</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 flex-1">
                  <button 
                     onClick={() => setIsBulkModalOpen(true)}
                     className="flex-1 py-4 bg-white text-slate-900 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                     <Zap className="w-4 h-4 fill-indigo-600 text-indigo-600" />
                     Instant Bulk Adjustment
                  </button>
                  <button 
                    onClick={() => setSelectedIds([])}
                    className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-[24px] border border-white/10 transition-all active:scale-95"
                  >
                    <X className="w-5 h-5" />
                  </button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Bulk Adjustment Modal */}
      <AnimatePresence>
         {isBulkModalOpen && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 backdrop-blur-2xl bg-slate-900/60">
               <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-[48px] shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden"
               >
                  <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                           <Layers className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Bulk Command Hub</h2>
                     </div>
                     <button onClick={() => setIsBulkModalOpen(false)} className="p-3 hover:bg-white/10 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="p-10 space-y-10">
                     <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block pl-1 italic">Stock Change Quantity (+/-)</label>
                        <div className="relative">
                           <Database className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input 
                              type="number" 
                              value={bulkAdjustment.amount}
                              onChange={(e) => setBulkAdjustment({...bulkAdjustment, amount: e.target.value})}
                              placeholder="e.g. 50 or -10"
                              className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[28px] text-lg font-black focus:bg-white focus:border-indigo-500 transition-all outline-none"
                           />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block pl-1 italic">Force Global Status (Optional)</label>
                        <select 
                           value={bulkAdjustment.status}
                           onChange={(e) => setBulkAdjustment({...bulkAdjustment, status: e.target.value})}
                           className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[28px] text-sm font-black uppercase tracking-[0.1em] focus:bg-white focus:border-indigo-500 transition-all outline-none cursor-pointer appearance-none"
                        >
                           <option value="">Maintain Current Intelligence</option>
                           <option value="in-stock">Force In Stock</option>
                           <option value="low-stock">Force Low Stock Signal</option>
                           <option value="out-of-stock">Force Out of Stock</option>
                        </select>
                     </div>
                     <button 
                        onClick={handleBulkApply}
                        className="w-full py-6 bg-indigo-600 text-white rounded-[32px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                     >
                        Apply to {selectedIds.length} Variants <ArrowUpRight className="w-5 h-5" />
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">Inventory Hub</h1>
          <p className="text-slate-500 font-medium italic mt-1 font-bold opacity-80">Real-time stock tracking and SKU management</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => alert("Loading Audit Logs...")}
            className="flex items-center gap-3 px-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-sm font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <History className="w-5 h-5 text-slate-400" />
            Audit Logs
          </button>
          <button 
            onClick={() => router.push('/admin/catalog/new')}
            className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600 text-white rounded-[20px] text-sm font-black shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5 font-black text-white" />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[40px] shadow-sm border-2">
          <div className="flex items-center gap-3 text-emerald-600 mb-2 font-black italic tracking-tighter">
            <Package className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-widest">Total SKUs Active</span>
          </div>
          <h2 className="text-4xl font-black text-emerald-900 tracking-tight leading-none">{inventory.length} <span className="text-sm font-bold text-emerald-600 ml-1 opacity-70 tracking-tighter italic font-black uppercase">+12 this month</span></h2>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-8 rounded-[40px] shadow-sm border-2">
          <div className="flex items-center gap-3 text-rose-600 mb-2 font-black italic tracking-tighter">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-widest">Low Stock Signal</span>
          </div>
          <h2 className="text-4xl font-black text-rose-900 tracking-tight leading-none">{inventory.filter(i => i.status !== 'in-stock').length} <span className="text-sm font-bold text-rose-600 ml-1 opacity-70 tracking-tighter italic font-black uppercase text-rose-500">Requires Attention</span></h2>
        </div>
        <div className="bg-slate-900 p-8 rounded-[40px] border-4 border-indigo-600 shadow-2xl text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-3 text-indigo-400 mb-2 font-black italic tracking-tighter">
            <Zap className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-widest">Inventory Asset Value</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight leading-none">$84,200.50</h2>
        </div>
      </div>

      <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20">
          <div className="relative group max-w-lg w-full">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Live SKU Search (e.g. Blue Shirt)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[24px] text-sm font-bold focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all outline-none shadow-sm"
            />
          </div>
          <div className="flex items-center gap-4">
             <button className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-[20px] text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <Filter className="w-4 h-4 text-slate-400" />
              Store Filters
            </button>
            <button 
               onClick={() => selectedIds.length > 0 ? setIsBulkModalOpen(true) : triggerToast("Select items first for Bulk Adjustment.")}
               className={cn(
                  "flex items-center gap-3 px-8 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95",
                  selectedIds.length > 0 ? "bg-indigo-600 text-white shadow-indigo-600/30" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
               )}
            >
              <Zap className="w-5 h-5 font-black" />
              Bulk Adjust {selectedIds.length > 0 && `(${selectedIds.length})`}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-8 pl-12 w-[60px]">
                   <input 
                     type="checkbox" 
                     className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                     checked={selectedIds.length === inventory.length && inventory.length > 0}
                     onChange={selectAll}
                   />
                </th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[140px]">Stock Count</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Intelligence / SKU</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Variants Active</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Price</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Health Scan</th>
                <th className="p-8 pr-12 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Operational Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInventory.map((item) => (
                <tr key={item.id} className={cn("hover:bg-slate-50/80 transition-all group", selectedIds.includes(item.id) && "bg-indigo-50/30")}>
                  <td className="p-8 pl-12">
                     <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                     />
                  </td>
                  <td className="p-8">
                    <div className={cn(
                      "w-16 h-16 flex items-center justify-center rounded-[24px] font-black text-xl border-2 shadow-sm transition-all",
                      item.status === 'in-stock' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-600/5' :
                      item.status === 'low-stock' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    )}>
                      {item.stock}
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col">
                      <span className="text-md font-black text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer uppercase tracking-tight">{item.name}</span>
                      <span className="text-[10px] font-black text-slate-400 mt-2.5 flex items-center gap-1.5 italic tracking-widest opacity-70 uppercase leading-none">
                        <Layers className="w-3.5 h-3.5 opacity-40 shrink-0" />
                        {item.sku}
                      </span>
                    </div>
                  </td>
                  <td className="p-8 text-center">
                     <button 
                        onClick={() => { setActiveItem(item); setIsVariantExplorerOpen(true); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-[16px] text-[10px] font-black uppercase tracking-tighter shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-all active:scale-95"
                     >
                      {item.variants.length > 0 ? `${item.variants.length} Matrices` : 'Parent Only'}
                      {item.variants.length > 0 && <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
                    </button>
                  </td>
                  <td className="p-8 text-md font-black text-slate-900 tracking-tight leading-none italic opacity-80">{item.price}</td>
                  <td className="p-8 text-center">
                    <span className={cn(
                      "px-4 py-2 rounded-[16px] text-[10px] font-black uppercase tracking-widest border-2 shadow-sm",
                      item.status === 'in-stock' ? 'text-emerald-600 border-emerald-100 bg-emerald-50' :
                      item.status === 'low-stock' ? 'text-amber-600 border-amber-100 bg-amber-50' :
                      'text-rose-600 border-rose-100 bg-rose-50'
                    )}>
                      {item.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="p-8 pr-12 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="flex items-center bg-white border-2 border-slate-200 rounded-[24px] p-1.5 shadow-sm gap-2">
                        <button 
                          onClick={() => adjustStock(item.id, 1)}
                          className="w-10 h-10 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all font-black"
                           title="Restock Variant"
                        >
                          <Plus className="w-5 h-5 font-black" />
                        </button>
                        <div className="w-[1px] h-6 bg-slate-100 mx-1" />
                        <button 
                          onClick={() => adjustStock(item.id, -1)}
                          className="w-10 h-10 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                           title="Manual Dispatch"
                        >
                          <ArrowDown className="w-5 h-5" />
                        </button>
                      </div>
                      <button className="p-4 text-slate-400 hover:text-indigo-600 bg-white rounded-[20px] transition-all border border-slate-100 shadow-sm">
                        <Edit2 className="w-6 h-6" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
