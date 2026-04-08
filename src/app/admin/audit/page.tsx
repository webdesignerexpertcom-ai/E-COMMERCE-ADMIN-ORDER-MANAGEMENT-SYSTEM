'use client';

import React from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Database, 
  Zap, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

const auditLogs = [
  { id: '1', admin: 'Sarah Williams', action: 'Update Price', entity: 'Product', target: 'Espresso Roast', time: '2 mins ago', details: 'Changed price from ₹2,200.00 to ₹2,400.00', status: 'success' },
  { id: '2', admin: 'Marcus James', action: 'Restock', entity: 'Inventory', target: 'Ceramic Mug', time: '15 mins ago', details: 'Added 50 units', status: 'success' },
  { id: '3', admin: 'System Trigger', action: 'Auto-Segment', entity: 'Customer', target: 'Emily Davis', time: '1 hour ago', details: 'Moved to VIP segment via CLV trigger', status: 'info' },
  { id: '4', admin: 'Sarah Williams', action: 'Delete Variant', entity: 'Catalog', target: 'Blue Mug / S', time: '3 hours ago', details: 'Soft deleted variant for seasonality', status: 'warning' },
  { id: '5', admin: 'Security Firewall', action: 'Login Attempt', entity: 'Admin', target: 'IP: 192.168.1.1', time: '5 hours ago', details: 'Successful session started', status: 'success' },
  { id: '6', admin: 'Sarah Williams', action: 'Update Status', entity: 'Order', target: '#ORD-84922', time: 'Yesterday', details: 'Changed status to Shipped', status: 'success' },
];

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  success: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: ShieldCheck },
  warning: { bg: 'bg-rose-50', text: 'text-rose-600', icon: AlertCircle },
  info: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: Zap },
};

export default function AuditLogsPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Global Audit Trail</h1>
          <p className="text-slate-500 font-medium italic">Full traceability of every operational mutation in the system.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95">
              Export Compliance PDF
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
          <div className="relative group max-w-lg w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search logs by Admin, Entity or Action..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
             <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
               <Filter className="w-4 h-4 text-slate-400" />
               Entity: All
             </button>
             <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
               <Clock className="w-4 h-4 text-slate-400" />
               Last 24h
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-5 pl-10 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[200px]">Timestamp / Admin</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[180px]">Action & Entity</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mutation Details</th>
                <th className="p-5 pr-10 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Target ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {auditLogs.map((log) => {
                const config = statusConfig[log.status];
                const Icon = config.icon;
                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="p-5 pl-10">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-indigo-500" />
                           <span className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{log.admin}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold italic ml-4">{log.time}</span>
                      </div>
                    </td>
                    <td className="p-5">
                       <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter border",
                        config.bg, config.text, "border-transparent"
                      )}>
                        <Icon className="w-3.5 h-3.5" />
                        {log.action}
                      </span>
                    </td>
                    <td className="p-5">
                       <div className="flex items-center gap-3">
                          <p className="text-sm font-bold text-slate-600 max-w-md line-clamp-1">{log.details}</p>
                          <ChevronDown className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                    </td>
                    <td className="p-5 pr-10 text-right">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 py-1 bg-slate-100 rounded border border-slate-200">
                          {log.entity}: {log.target}
                       </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/20 flex flex-col items-center justify-center">
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-dashed border-slate-200 pb-1">Operational Lifecycle Log</p>
           <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between group cursor-pointer hover:border-indigo-200 transition-all">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                   <Database className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Postgres Storage Utilization</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logs are purged after 90 days for GDPR compliance</p>
                 </div>
              </div>
              <ArrowRight className="w-6 h-6 text-slate-300 group-hover:translate-x-2 group-hover:text-indigo-600 transition-all" />
           </div>
        </div>
      </div>
    </div>
  );
}
