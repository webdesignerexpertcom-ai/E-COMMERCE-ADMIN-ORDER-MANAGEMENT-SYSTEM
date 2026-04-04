'use client';

import React, { useState } from 'react';
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
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

const inventory = [
  { id: '1', name: 'Premium Coffee Beans', sku: 'CFE-PRM-250', stock: 120, min: 20, status: 'in-stock', price: '$24.00', variants: 3 },
  { id: '2', name: 'Ceramic Mug Blue', sku: 'MUG-CER-BLU', stock: 12, min: 25, status: 'low-stock', price: '$15.00', variants: 0 },
  { id: '3', name: 'Milk Frother Pro', sku: 'FRT-PRO-001', stock: 0, min: 10, status: 'out-of-stock', price: '$45.00', variants: 2 },
  { id: '4', name: 'Linen Apron Grey', sku: 'APR-LIN-GRY', stock: 85, min: 15, status: 'in-stock', price: '$35.00', variants: 4 },
];

export default function InventoryHub() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inventory Hub</h1>
          <p className="text-slate-500 font-medium">Real-time stock tracking and SKU management</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <History className="w-4 h-4" />
            Audit Logs
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <Package className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Total SKUs</span>
          </div>
          <h2 className="text-3xl font-black text-emerald-900">428 <span className="text-sm font-medium text-emerald-600 ml-1">+12 this month</span></h2>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-rose-600 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Low Stock Alerts</span>
          </div>
          <h2 className="text-3xl font-black text-rose-900">14 <span className="text-sm font-medium text-rose-600 ml-1">Requires restock</span></h2>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <Layers className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Total Inventory Value</span>
          </div>
          <h2 className="text-3xl font-black text-indigo-900">$84,200.00</h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative group max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by SKU, Name or Category..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4 text-slate-400" />
              Category: All
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
              Bulk Adjust
            </button>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="p-4 pl-8 text-xs font-bold text-slate-400 uppercase tracking-widest w-[100px]">Stock</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Product / SKU</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Variants</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Price</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="p-4 pr-8 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Adjust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="p-4 pl-8">
                  <div className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-xl font-black text-sm border",
                    item.status === 'in-stock' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    item.status === 'low-stock' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                    'bg-rose-50 text-rose-700 border-rose-200'
                  )}>
                    {item.stock}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer">{item.name}</span>
                    <span className="text-xs font-black text-slate-400 mt-1 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {item.sku}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                   <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                    {item.variants > 0 ? `${item.variants} Options` : 'None'}
                    {item.variants > 0 && <ChevronDown className="w-3 h-3" />}
                  </span>
                </td>
                <td className="p-4 text-sm font-black text-slate-900">{item.price}</td>
                <td className="p-4 text-center">
                  <span className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border",
                    item.status === 'in-stock' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                    item.status === 'low-stock' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                    'text-rose-600 border-rose-200 bg-rose-50'
                  )}>
                    {item.status.replace('-', ' ')}
                  </span>
                </td>
                <td className="p-4 pr-8 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100">
                      <Plus className="w-4 h-4 font-black" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
