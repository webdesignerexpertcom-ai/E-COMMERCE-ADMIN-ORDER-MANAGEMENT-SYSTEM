'use client';

import React from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  Mail, 
  Phone, 
  TrendingUp, 
  ShieldCheck,
  Star,
  Clock,
  ExternalLink,
  MoreVertical,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

const customers = [
  { 
    name: 'Emily Davis', 
    email: 'emily.d@example.com', 
    clv: '$4,280.00', 
    segment: 'VIP', 
    lastOrder: '2 hours ago', 
    orders: 12,
    tags: ['Premium', 'High Repeat']
  },
  { 
    name: 'Michael Chen', 
    email: 'm.chen@example.com', 
    clv: '$280.50', 
    segment: 'New', 
    lastOrder: '1 day ago', 
    orders: 1,
    tags: ['New']
  },
  { 
    name: 'Sarah Connor', 
    email: 'sarah.c@tech.net', 
    clv: '$1,150.00', 
    segment: 'Loyal', 
    lastOrder: '5 days ago', 
    orders: 6,
    tags: ['Tech Enthusiast']
  },
  { 
    name: 'James Bond', 
    email: '007@mi6.gov.uk', 
    clv: '$12,500.00', 
    segment: 'VIP', 
    lastOrder: '1 month ago', 
    orders: 24,
    tags: ['International']
  },
  { 
    name: 'Peter Parker', 
    email: 'p.parker@dailybugle.com', 
    clv: '$45.00', 
    segment: 'At Risk', 
    lastOrder: '6 months ago', 
    orders: 1,
    tags: ['Budget']
  }
];

const segmentStyles: any = {
  'VIP': { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: Star },
  'Loyal': { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: ShieldCheck },
  'New': { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock },
  'At Risk': { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: Clock },
};

export default function CustomerCRM() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer CRM</h1>
          <p className="text-slate-500 font-medium">Customer Intelligence & Lifetime Value tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            Segment All
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]">
            Bulk Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative group max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by Name, Email, or Phone..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4 text-slate-400" />
              Segmentation: All
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 pl-8 text-xs font-bold text-slate-400 uppercase tracking-widest">Customer Details</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Orders</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Lifetime Value (CLV)</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Segment</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Last Activity</th>
                <th className="p-4 pr-8 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {customers.map((c) => {
                const style = segmentStyles[c.segment];
                const Icon = style.icon;
                return (
                  <tr key={c.email} className="hover:bg-slate-50/80 transition-all group">
                    <td className="p-4 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100/50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:scale-105 transition-transform">
                          <span className="text-base font-black uppercase">{c.name[0]}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors cursor-pointer">{c.name}</span>
                          <span className="text-xs text-slate-500 font-medium tracking-tight mt-0.5">{c.email}</span>
                          <div className="flex gap-1 mt-2">
                            {c.tags.map(t => (
                              <span key={t} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-tight italic">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black",
                        c.orders > 10 ? "bg-amber-100 text-amber-600 border border-amber-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                      )}>
                        {c.orders}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-black text-slate-900 tracking-tight">{c.clv}</span>
                      </div>
                    </td>
                    <td className="p-4">
                       <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                        style.bg, style.color, style.border
                      )}>
                        <Icon className="w-3.5 h-3.5" />
                        {c.segment}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-400 italic">
                      {c.lastOrder}
                    </td>
                    <td className="p-4 pr-8 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100">
                          <MessageSquare className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/30">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">VIP Ratio</p>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-[40%] h-full bg-indigo-600 rounded-full" />
                  </div>
                  <span className="text-sm font-black text-slate-900">40%</span>
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">New Gen Rate</p>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-[15%] h-full bg-emerald-500 rounded-full" />
                  </div>
                  <span className="text-sm font-black text-slate-900">15%</span>
                </div>
              </div>
            </div>
            <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-colors">
              Advanced Audience Builder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
