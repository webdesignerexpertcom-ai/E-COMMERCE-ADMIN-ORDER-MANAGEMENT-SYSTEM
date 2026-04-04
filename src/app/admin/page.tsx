'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  PackageCheck,
  Check
} from 'lucide-react';
import { DashboardCharts } from '@/components/admin/DashboardCharts';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [alerts, setAlerts] = useState([
     { id: '1', item: 'Variant: XL Blue Shirt', level: 'Critical: 2 left', active: true },
     { id: '2', item: 'Variant: Ceramic Mug Black', level: 'Action: 0 left', active: true },
     { id: '3', item: 'Variant: Organic Matcha', level: 'Low: 4 left', active: true },
  ]);

  const triggerToast = (msg: string) => {
     setToastMessage(msg);
     setIsToastOpen(true);
     setTimeout(() => setIsToastOpen(false), 3000);
  };

  const handleRestock = (id: string, name: string) => {
     triggerToast(`Restock Triggered: ${name}`);
     setAlerts(alerts.map(a => a.id === id ? { ...a, active: false } : a));
  };

  const stats = [
    { 
      label: 'Total Revenue', 
      value: '$128,430.00', 
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
      value: '$45.14', 
      trend: '-2.4%', 
      isPositive: false, 
      icon: TrendingUp,
      color: 'bg-amber-500',
      shadow: 'shadow-amber-500/20'
    },
    { 
      label: 'Stock Health', 
      value: '92%', 
      trend: '+1.1%', 
      isPositive: true, 
      icon: PackageCheck,
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
          <p className="text-slate-500 font-medium">Welcome back, Sarah. Here's what's happening today.</p>
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
                   { id: '#ORD-089', name: 'Alina Vance', amount: '$240.00', time: '2 mins ago', status: 'Pending' },
                   { id: '#ORD-088', name: 'Marcus Jin', amount: '$85.50', time: '12 mins ago', status: 'Pending' },
                   { id: '#ORD-087', name: 'Elena Rostova', amount: '$310.25', time: '28 mins ago', status: 'Pending' },
                   { id: '#ORD-086', name: 'David Smith', amount: '$12.99', time: '1 hr ago', status: 'Pending' },
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
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-4 p-4 bg-rose-50/50 border border-rose-100 rounded-2xl">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-rose-200 shadow-sm relative">
                  <ShoppingBag className="w-6 h-6 text-rose-500" />
                  {alert.active && <div className="absolute top-[-4px] right-[-4px] w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{alert.item}</p>
                  <p className="text-xs text-rose-600 font-bold mt-0.5">{alert.active ? alert.level : "Restocked"}</p>
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
