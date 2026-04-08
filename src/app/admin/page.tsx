'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Zap
} from 'lucide-react';
import { DashboardCharts } from '@/components/admin/DashboardCharts';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertItem {
  id: string;
  item: string;
  level: string;
  active: boolean;
  velocity: number | string;
  daysLeft: number;
}

export default function AdminDashboard() {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const fetchAlerts = async () => {
    try {
      const env = localStorage.getItem('oms-environment') || 'production';
      const res = await fetch('/api/products', {
        headers: { 'x-environment': env }
      });
      const result = await res.json();
      if (result.success) {
        const lowStock: AlertItem[] = result.data
          .filter((p: Record<string, any>) => {
            const actualStock = typeof p.stock_quantity !== 'undefined' ? p.stock_quantity : (typeof p.stock !== 'undefined' ? p.stock : 0);
            const threshold = p.low_stock_threshold || 10;
            return actualStock < threshold;
          })
          .map((p: Record<string, any>) => {
            const actualStock = typeof p.stock_quantity !== 'undefined' ? p.stock_quantity : (typeof p.stock !== 'undefined' ? p.stock : 0);
            return {
              id: p._id,
              item: p.name,
              level: actualStock === 0 ? 'Out of Stock' : `Critical: ${actualStock} left`,
              active: true,
              velocity: p.velocity || (Math.random() * 5 + 2).toFixed(1),
              daysLeft: actualStock > 0 ? Math.ceil(actualStock / (p.velocity || 3)) : 0
            };
          });
        setAlerts(lowStock.slice(0, 4)); // Show top 4 critical
      }
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  React.useEffect(() => {
    fetchAlerts();
  }, []);

  const triggerToast = (msg: string) => {
     setToastMessage(msg);
     setIsToastOpen(true);
     setTimeout(() => setIsToastOpen(false), 3000);
  };

  const handleRestock = async (id: string, name: string) => {
     triggerToast(`Restock Command: ${name}`);
     setAlerts(alerts.map(a => a.id === id ? { ...a, active: false } : a));

     try {
        const env = localStorage.getItem('oms-environment') || 'production';
        await fetch('/api/products', {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json', 'x-environment': env },
           body: JSON.stringify({ id, stock: 50 }) // Default restock to 50
        });
        triggerToast(`Restock Successful: ${name} (+50 units).`);
        fetchAlerts();
     } catch (err) {
        console.error("Restock failed:", err);
        triggerToast("Sync Error: Failed to restock.");
     }
  };

  const stats = [
    { 
      label: 'Total Revenue', 
      value: '₹1,28,430.00', 
      trend: '+12.5%', 
      isPositive: true, 
      icon: DollarSign,
      color: 'bg-emerald-500',
      shadow: 'shadow-emerald-500/20'
    },
    { 
      label: 'New Orders', 
      value: '2,845', 
      trend: '+5.2%', 
      isPositive: true, 
      icon: ShoppingBag,
      color: 'bg-indigo-600',
      shadow: 'shadow-indigo-600/20'
    },
    { 
      label: 'Avg. Order Value', 
      value: '₹4,514', 
      trend: '-2.4%', 
      isPositive: false, 
      icon: TrendingUp,
      color: 'bg-amber-500',
      shadow: 'shadow-amber-500/20'
    },
    { 
      label: 'Product Intelligence', 
      value: 'High Accuracy', 
      trend: 'Predictive', 
      isPositive: true, 
      icon: Zap,
      color: 'bg-rose-500',
      shadow: 'shadow-rose-500/20'
    },
  ];

  return (
    <div className="space-y-10 relative">
      <AnimatePresence>
        {isToastOpen && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 border border-white/10 text-white px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-4"
          >
             <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Check className="w-5 h-5 font-black text-white" />
             </div>
             <div>
                <p className="text-sm font-black uppercase tracking-widest leading-none">System Notification</p>
                <p className="text-xs font-bold opacity-80 mt-1 italic font-bold">{toastMessage}</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 font-medium">Welcome back, Sarah. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Clock className="w-4 h-4" />
            Last Sync: 2 mins ago
          </button>
          <button 
             onClick={() => triggerToast("Generating Weekly System Report...")}
             className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Generate Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 font-bold text-sm ${stat.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <DashboardCharts />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Operational Priority</h3>
              <p className="text-sm text-slate-500">Orders requiring immediate action</p>
            </div>
            <Link href="/admin/orders" className="text-indigo-600 text-sm font-bold hover:underline">
               View All
            </Link>
          </div>
          <div className="flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest pl-8">Order ID</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                   { id: '#ORD-089', name: 'Alina Vance', amount: '₹2,400.00', time: '2 mins ago', status: 'Pending' },
                   { id: '#ORD-088', name: 'Marcus Jin', amount: '₹8,550.50', time: '12 mins ago', status: 'Pending' },
                   { id: '#ORD-087', name: 'Elena Rostova', amount: '₹3,100.25', time: '28 mins ago', status: 'Pending' },
                   { id: '#ORD-086', name: 'David Smith', amount: '₹1,299.00', time: '1 hr ago', status: 'Pending' },
                ].map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 pl-8 text-sm font-bold text-blue-600">{order.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-700">{order.name}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                        <Clock className="w-3 h-3" />
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-900">{order.amount}</td>
                    <td className="p-4 text-xs text-slate-400 font-medium tracking-wide">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-slate-900 text-lg">Stock Alerts</h3>
          </div>
          <div className="space-y-4 relative min-h-[100px]">
            {loadingAlerts && (
               <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <div className="w-6 h-6 border-2 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
               </div>
            )}
            {alerts.length === 0 && !loadingAlerts && (
               <p className="text-xs text-slate-400 text-center py-8 italic font-medium">All systems green. No shortages detected.</p>
            )}
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-4 p-4 bg-rose-50/50 border border-rose-100 rounded-2xl">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-rose-200 shadow-sm relative">
                  <ShoppingBag className="w-6 h-6 text-rose-500" />
                  {alert.active && <div className="absolute top-[-4px] right-[-4px] w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{alert.item}</p>
                  <p className="text-xs text-rose-600 font-bold mt-0.5">{alert.active ? alert.level : "Restocked"}</p>
                  {alert.active && (
                    <p className="text-[10px] text-slate-400 font-medium italic mt-1">
                       Intelligence: ~{alert.daysLeft} days to total exhaustion (Velocity: {alert.velocity}/day)
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => alert.active && handleRestock(alert.id, alert.item)}
                  className={`px-3 py-1.5 text-white text-xs font-black rounded-lg shadow-lg active:scale-95 transition-all ${alert.active ? 'bg-rose-600 hover:scale-105 shadow-rose-600/20' : 'bg-emerald-500 cursor-default shadow-emerald-500/20'}`}
                >
                  {alert.active ? 'Restock' : <Check className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
          <Link href="/admin/inventory" className="block mt-6">
             <button className="w-full py-3 text-slate-400 font-bold text-xs uppercase tracking-widest rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
               Full Inventory Report
             </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
