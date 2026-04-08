'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { omsFetch } from '@/lib/api';
import { cn } from '@/lib/utils';
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

interface OrderRecord {
  order_id: string;
  customer_name: string;
  status: string;
  total_amount: number | string;
  created_at: string;
}

export default function AdminDashboard() {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoadingAlerts(true);
      const res = await omsFetch('/api/products');
      const result = await res.json();
      if (result.success) {
        const lowStock: AlertItem[] = result.data
          .filter((p: { stock_quantity?: number, stock?: number, low_stock_threshold?: number }) => {
            const actualStock = typeof p.stock_quantity !== 'undefined' ? p.stock_quantity : (typeof p.stock !== 'undefined' ? p.stock : 0);
            const threshold = p.low_stock_threshold || 10;
            return actualStock < threshold;
          })
          .map((p: { _id: string, id: string, name: string, velocity?: number, stock_quantity?: number, stock?: number }) => {
            const actualStock = typeof p.stock_quantity !== 'undefined' ? p.stock_quantity : (typeof p.stock !== 'undefined' ? p.stock : 0);
            return {
              id: p._id || p.id,
              item: p.name,
              level: actualStock === 0 ? 'Out of Stock' : `Critical: ${actualStock} left`,
              active: true,
              velocity: p.velocity || (Math.random() * 5 + 2).toFixed(1),
              daysLeft: actualStock > 0 ? Math.ceil(actualStock / (p.velocity || 3)) : 0
            };
          });
        setAlerts(lowStock.slice(0, 4));
      }
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  const fetchRecentOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const res = await omsFetch('/api/orders');
      const result = await res.json();
      if (result.success) {
        setOrders(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchRecentOrders();
  }, [fetchAlerts, fetchRecentOrders]);

  const triggerToast = (msg: string) => {
     setToastMessage(msg);
     setIsToastOpen(true);
     setTimeout(() => setIsToastOpen(false), 3000);
  };

  const handleRestock = async (id: string, name: string) => {
     triggerToast(`Restock Command: ${name}`);
     setAlerts(alerts.map(a => a.id === id ? { ...a, active: false } : a));

     try {
        await omsFetch('/api/products', {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ id, stock: 50, restockStatus: 'completed' }) 
        });
        triggerToast(`Restock Successful: ${name} (+50 units).`);
        fetchAlerts();
     } catch (err) {
        console.error("Restock failed:", err);
        triggerToast("Sync Error: Failed to restock.");
     }
  };

  const dashboardStats = useMemo(() => {
    const totalRev = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    const orderCount = orders.length;
    const avgVal = orderCount > 0 ? (totalRev / orderCount) : 0;

    return [
      { 
        label: 'Total Revenue', 
        value: `₹${totalRev.toLocaleString('en-IN')}`, 
        trend: '+12.5%', 
        isPositive: true, 
        icon: DollarSign,
        color: 'bg-emerald-500',
        shadow: 'shadow-emerald-500/20'
      },
      { 
        label: 'New Orders', 
        value: orderCount.toLocaleString(), 
        trend: '+5.2%', 
        isPositive: true, 
        icon: ShoppingBag,
        color: 'bg-indigo-600',
        shadow: 'shadow-indigo-600/20'
      },
      { 
        label: 'Avg. Order Value', 
        value: `₹${Math.round(avgVal).toLocaleString('en-IN')}`, 
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
  }, [orders]);

  const getTimeAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

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
                <p className="text-xs font-bold opacity-80 mt-1 italic">{toastMessage}</p>
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
            Last Sync: {loadingOrders || loadingAlerts ? 'Syncing...' : 'Live'}
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
        {dashboardStats.map((stat) => (
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
                {orders.slice(0, 4).map((order) => (
                  <tr key={order.order_id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 pl-8 text-sm font-bold text-blue-600">{order.order_id}</td>
                    <td className="p-4 text-sm font-medium text-slate-700">{order.customer_name}</td>
                    <td className="p-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                        order.status === 'delivered' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        order.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-blue-50 text-blue-700 border-blue-200"
                      )}>
                        <Clock className="w-3 h-3" />
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-900">₹{parseFloat(order.total_amount.toString()).toLocaleString('en-IN')}</td>
                    <td className="p-4 text-xs text-slate-400 font-medium tracking-wide">{getTimeAgo(order.created_at)}</td>
                  </tr>
                ))}
                {orders.length === 0 && !loadingOrders && (
                   <tr>
                      <td colSpan={5} className="p-10 text-center text-slate-400 font-bold italic">No active orders found.</td>
                   </tr>
                )}
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
               <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Inventory Secure</p>
               </div>
            )}
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={cn(
                  "p-4 rounded-xl border transition-all flex flex-col gap-3",
                  alert.active ? "bg-rose-50 border-rose-100" : "bg-slate-50 border-slate-200 opacity-60"
                )}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{alert.item}</h4>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                    alert.active ? "bg-rose-100 text-rose-700" : "bg-slate-200 text-slate-500"
                  )}>
                    {alert.level}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Velocity</p>
                         <p className="text-xs font-black text-slate-700">{alert.velocity} / d</p>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Depletion</p>
                         <p className="text-xs font-black text-rose-600">{alert.daysLeft} Days</p>
                      </div>
                   </div>
                   {alert.active && (
                      <button 
                        onClick={() => handleRestock(alert.id, alert.item)}
                        className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-900/10"
                      >
                         Restock
                      </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
