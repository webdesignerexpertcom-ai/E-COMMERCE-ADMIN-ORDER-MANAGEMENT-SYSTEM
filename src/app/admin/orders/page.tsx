'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  RefreshCcw,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const orders = [
  { id: 'ORD-84920', customer: 'Liam Neeson', status: 'delivered', total: '$1,240.00', date: '2026-04-04 14:20 PM', items: 3 },
  { id: 'ORD-84921', customer: 'John Wick', status: 'processing', total: '$850.50', date: '2026-04-04 13:45 PM', items: 1 },
  { id: 'ORD-84922', customer: 'Bruce Wayne', status: 'pending', total: '$3,400.00', date: '2026-04-04 11:10 AM', items: 5 },
  { id: 'ORD-84923', customer: 'Diana Prince', status: 'shipped', total: '$210.30', date: '2026-04-03 16:30 PM', items: 2 },
  { id: 'ORD-84924', customer: 'Clark Kent', status: 'partially_fulfilled', total: '$450.00', date: '2026-04-03 15:20 PM', items: 4 },
  { id: 'ORD-84925', customer: 'Tony Stark', status: 'backordered', total: '$12,500.00', date: '2026-04-03 10:05 AM', items: 12 },
  { id: 'ORD-84926', customer: 'Peter Parker', status: 'cancelled', total: '$45.00', date: '2026-04-02 18:45 PM', items: 1 },
  { id: 'ORD-84927', customer: 'Wanda Maximoff', status: 'refunded', total: '$320.00', date: '2026-04-02 09:12 AM', items: 2 },
];

const statusStyles: Record<string, { label: string, icon: any, color: string, border: string, bg: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50' },
  processing: { label: 'Processing', icon: RefreshCcw, color: 'text-blue-600', border: 'border-blue-200', bg: 'bg-blue-50' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-indigo-600', border: 'border-indigo-200', bg: 'bg-indigo-50' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50' },
  partially_fulfilled: { label: 'Partially Fulfilled', icon: Package, color: 'text-orange-600', border: 'border-orange-200', bg: 'bg-orange-50' },
  backordered: { label: 'Backordered', icon: AlertCircle, color: 'text-rose-600', border: 'border-rose-200', bg: 'bg-rose-50' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-slate-500', border: 'border-slate-200', bg: 'bg-slate-100' },
  refunded: { label: 'Refunded', icon: ArrowUpRight, color: 'text-slate-600', border: 'border-slate-300', bg: 'bg-slate-50' },
};

export default function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-slate-500 font-medium italic mt-1">Found 8 pending attention orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-4 h-4" />
            Manual Order
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/20">
          <div className="relative group max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by Order ID, Customer, or SKU..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4 text-slate-400" />
              Filter By Status
            </button>
            <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:block">8 results</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 pl-8 text-xs font-bold text-slate-400 uppercase tracking-widest">Order Details</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Items</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Grand Total</th>
                <th className="p-4 pr-8 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                const style = statusStyles[order.status];
                const StatusIcon = style.icon;
                return (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 pl-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-indigo-600 group-hover:underline cursor-pointer">{order.id}</span>
                        <span className="text-xs text-slate-400 font-medium mt-0.5">{order.date}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-200">
                          {order.customer.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-bold text-slate-900">{order.customer}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tight border",
                        style.bg, style.color, style.border
                      )}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {style.label}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-slate-200">
                        {order.items}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-black text-slate-900">{order.total}</span>
                    </td>
                    <td className="p-4 pr-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Quick View">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <p className="text-sm text-slate-500 font-medium">Showing <span className="font-bold text-slate-900">1 to 8</span> of 48 entries</p>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-white transition-colors disabled:opacity-30" disabled>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map(p => (
                <button key={p} className={cn(
                  "w-9 h-9 rounded-lg text-sm font-bold transition-all",
                  p === 1 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "hover:bg-white border border-transparent hover:border-slate-200 text-slate-600"
                )}>
                  {p}
                </button>
              ))}
              <span className="px-2 text-slate-400">...</span>
            </div>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
