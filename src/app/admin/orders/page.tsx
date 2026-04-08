'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  MoreVertical, 
  ChevronRight,
  ChevronDown,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  RefreshCcw,
  MessageSquare,
  Phone,
  X,
  ShoppingCart,
  UserPlus,
  Zap,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { omsFetch } from '@/lib/api';

const statusStyles: Record<string, { label: string, icon: React.ElementType, color: string, border: string, bg: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50' },
  processing: { label: 'Processing', icon: RefreshCcw, color: 'text-blue-600', border: 'border-blue-200', bg: 'bg-blue-50' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-indigo-600', border: 'border-indigo-200', bg: 'bg-indigo-50' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50' },
  partially_fulfilled: { label: 'Partially Fulfilled', icon: Package, color: 'text-orange-600', border: 'border-orange-200', bg: 'bg-orange-50' },
  backordered: { label: 'Backordered', icon: AlertCircle, color: 'text-rose-600', border: 'border-rose-200', bg: 'bg-rose-50' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-slate-500', border: 'border-slate-200', bg: 'bg-slate-100' },
};

interface Order {
  id: string;
  customer: string;
  phone: string;
  status: string;
  total: string;
  date: string;
  items: number;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);
  
  const [newOrder, setNewOrder] = useState({
    customer: '',
    phone: '',
    items: 1,
    total: '',
    status: 'pending'
  });

  const fetchOrders = useCallback(async () => {
    try {
      const res = await omsFetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map((o: { order_id: string, customer_name: string, customer_phone: string, status: string, total_amount: string, created_at: string, items_count: number }): Order => ({
          id: o.order_id,
          customer: o.customer_name,
          phone: o.customer_phone,
          status: o.status,
          total: `₹${parseFloat(o.total_amount).toLocaleString('en-IN')}`,
          date: new Date(o.created_at).toLocaleString(),
          items: o.items_count
        }));
        setOrders(mapped);
      }
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const triggerSuccess = () => {
    setIsSuccessOpen(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#f59e0b']
    });
    setTimeout(() => setIsSuccessOpen(false), 3000);
  };

  const openWhatsApp = (orderId: string, phone: string) => {
     const message = encodeURIComponent(`Hello, I'm contacting you from your store regarding order ${orderId}.`);
     window.open(`https://wa.me/${phone.replace('+', '')}?text=${message}`, '_blank');
  };

  const createOrder = async () => {
    if (!newOrder.customer) return;
    try {
      const res = await omsFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: newOrder.customer,
          customerPhone: newOrder.phone,
          totalAmount: parseFloat(newOrder.total),
          itemsCount: newOrder.items
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
        setIsModalOpen(false);
        setNewOrder({ customer: '', phone: '', items: 1, total: '', status: 'pending' });
        triggerSuccess();
      }
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (status: string) => {
     if (!activeOrderId) return;
     try {
       const res = await omsFetch('/api/orders', {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ id: activeOrderId, status })
       });
       const data = await res.json();
       if (data.success) {
         fetchOrders();
         setIsStatusPickerOpen(false);
         setActiveOrderId(null);
         triggerSuccess();
       }
     } catch (err) { console.error(err); }
  };

  const exportOrdersToCSV = () => {
    const headers = ['Order ID', 'Customer', 'Phone', 'Status', 'Total', 'Date', 'Items'];
    const rows = orders.map(o => [
      o.id, 
      o.customer, 
      o.phone.replace(',', ' '), 
      o.status.toUpperCase(), 
      o.total.replace(/[₹$,]/g, ''), 
      o.date.replace(',', ' '), 
      o.items
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ProOMS_Orders_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert("Export Successful!");
  };

  return (
    <div className="space-y-6 relative">
      <AnimatePresence>
        {isSuccessOpen && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-white px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-4"
          >
             <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><Check className="w-5 h-5 font-black" /></div>
             <div>
                <p className="text-sm font-black uppercase tracking-widest leading-none">Order Dispatched</p>
                <p className="text-xs font-bold opacity-80 mt-1 italic">Customer and Warehouse notified.</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isStatusPickerOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/40">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               className="bg-white rounded-[40px] shadow-2xl border border-slate-200 p-8 w-full max-w-md"
             >
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                   <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2"><RefreshCcw className="w-5 h-5 text-indigo-600" /> Lifecycle Move</h3>
                   <button onClick={() => setIsStatusPickerOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                   {Object.keys(statusStyles).map((stat) => {
                      const s = statusStyles[stat];
                      if (!s) return null;
                      return (
                         <button 
                           key={stat} onClick={() => updateStatus(stat)}
                           className={cn("flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.02] active:scale-95 group", s.bg, s.border)}
                         >
                            <div className="flex items-center gap-3">
                               <s.icon className={cn("w-5 h-5", s.color)} />
                               <span className={cn("text-sm font-black uppercase tracking-tight", s.color)}>{s.label}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                         </button>
                      );
                   })}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-900/60 transition-all">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] shadow-2xl border border-white/20 w-full max-w-2xl overflow-hidden"
            >
               <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20"><ShoppingCart className="w-6 h-6" /></div>
                     <div>
                        <h2 className="text-2xl font-black tracking-tight leading-8">Manual Order Deck</h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-80 italic">Drafting new transaction</p>
                     </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-colors"><X className="w-6 h-6" /></button>
               </div>
               <div className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block pl-1 text-bold">Customer Full Name</label>
                        <div className="relative group">
                           <UserPlus className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                           <input type="text" value={newOrder.customer} onChange={(e) => setNewOrder({...newOrder, customer: e.target.value})} placeholder="e.g. Tony Stark" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block pl-1 text-bold">WhatsApp / Phone</label>
                        <div className="relative group">
                           <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                           <input type="text" value={newOrder.phone} onChange={(e) => setNewOrder({...newOrder, phone: e.target.value})} placeholder="+1 234 567 890" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none" />
                        </div>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-2 text-bold"><label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block pl-1">Total Bill (₹)</label><input type="number" value={newOrder.total} onChange={(e) => setNewOrder({...newOrder, total: e.target.value})} placeholder="0.00" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none" /></div>
                     <div className="space-y-2"><label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block pl-1 text-bold">Quantity Items</label><input type="number" value={newOrder.items} onChange={(e) => setNewOrder({...newOrder, items: parseInt(e.target.value) || 1})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none" /></div>
                     <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block pl-1 text-bold">Initial Status</label>
                        <select value={newOrder.status} onChange={(e) => setNewOrder({...newOrder, status: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none cursor-pointer appearance-none">
                           <option value="pending">Pending</option>
                           <option value="processing">Processing</option>
                           <option value="awaiting_payment">Awaiting Payment</option>
                        </select>
                     </div>
                  </div>
                  <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-indigo-600"><Zap className="w-5 h-5 animate-pulse font-black" /><span className="text-xs font-black uppercase tracking-widest italic tracking-tighter">Fulfillment AI Active</span></div>
                     <button onClick={createOrder} className="px-14 py-5 bg-indigo-600 text-white rounded-[24px] text-sm font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-[1.05] active:scale-95 flex items-center gap-2">Confirm & Create <CheckCircle2 className="w-5 h-5" /></button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">Order Management</h1>
          <p className="text-slate-500 font-medium italic font-bold opacity-80">Total Orders Processed: {orders.length}</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={exportOrdersToCSV} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-[20px] text-sm font-black text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"><Download className="w-4 h-4" /> Export CSV</button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-[20px] text-sm font-black shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"><Plus className="w-5 h-5 font-black" /> Manual Order</button>
        </div>
      </div>

      <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px] transition-all">
        <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20">
          <div className="relative group max-w-lg w-full">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input type="text" placeholder="Search by Order ID, Customer, or SKU..." className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[24px] text-sm font-bold focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all outline-none shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-[20px] text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"><Filter className="w-4 h-4 text-slate-400" /> Advanced Filters</button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block italic">{orders.length} Results Found</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-6 pl-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Details</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer info</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fulfillment Status</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grand Total</th>
                <th className="p-6 pr-12 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map((order) => {
                const style = statusStyles[order.status] || statusStyles.pending;
                if (!style) return null;
                const StatusIcon = style.icon;
                return (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="p-6 pl-12">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-indigo-600 group-hover:text-amber-500 cursor-pointer transition-colors uppercase tracking-tight">{order.id}</span>
                        <span className="text-[10px] text-slate-400 font-bold italic mt-1">{order.date}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[20px] bg-white shadow-sm flex items-center justify-center text-[12px] font-black text-slate-400 border border-slate-100 group-hover:border-indigo-200 transition-all">
                          {order.customer.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">{order.customer}</span>
                           <div className="flex items-center gap-1.5 mt-2">
                              <button onClick={() => openWhatsApp(order.id, order.phone)} className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"><Phone className="w-3 h-3" /> Messaging</button>
                           </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <button onClick={() => { setActiveOrderId(order.id); setIsStatusPickerOpen(true); }} className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-[14px] text-[10px] font-black uppercase tracking-tighter border shadow-sm transition-all hover:scale-105 active:scale-95", style.bg, style.color, style.border)}>
                        <StatusIcon className="w-4 h-4" />
                        {style.label}
                        <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </td>
                    <td className="p-6 text-center"><span className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-2xl text-xs font-black text-slate-800 border border-slate-100 shadow-sm">{order.items}</span></td>
                    <td className="p-6"><span className="text-sm font-black text-slate-900 tracking-tight leading-none italic opacity-80">{order.total}</span></td>
                    <td className="p-6 pr-12 text-right">
                      <div className="flex items-center justify-end gap-2 transition-all">
                        <button onClick={() => alert(`View: ${order.id}`)} className="p-3 text-slate-400 hover:text-indigo-600 bg-white rounded-[16px] border border-slate-100 shadow-sm transition-all"><Eye className="w-5 h-5" /></button>
                        <button className="p-3 text-slate-400 hover:text-emerald-600 bg-white rounded-[16px] border border-slate-100 shadow-sm transition-all" onClick={() => openWhatsApp(order.id, order.phone)}><MessageSquare className="w-5 h-5" /></button>
                        <button onClick={() => alert("Archive logic triggered.")} className="p-3 text-slate-400 hover:text-slate-900 bg-white rounded-[16px] border border-slate-100 shadow-sm transition-all"><MoreVertical className="w-5 h-5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
