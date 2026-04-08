'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ArrowUp, 
  ArrowDown, 
  Package, 
  User, 
  Clock,
  Search,
  Filter,
  CheckCircle2,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WarehouseEvent {
  id: string;
  sku: string;
  type: 'restock' | 'dispatch' | 'adjustment';
  amount: number;
  performer: string;
  timestamp: string;
  notes: string;
}

export default function WarehouseEvents() {
  const [events, setEvents] = useState<WarehouseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEvents = () => {
     setLoading(true);
     // Simulate fetching real-time warehouse events
     setTimeout(() => {
        const dummyEvents: WarehouseEvent[] = [
           { id: 'EV-001', sku: 'LINEN-SHIRT-BLU', type: 'restock', amount: 50, performer: 'Admin Sarah', timestamp: '2 mins ago', notes: 'Verified restock from primary supplier' },
           { id: 'EV-002', sku: 'CERAMIC-MUG-WHT', type: 'dispatch', amount: -2, performer: 'System (OMS)', timestamp: '12 mins ago', notes: 'Order #ORD-089 fulfillment' },
           { id: 'EV-003', sku: 'LIFESYLE-HOODIE', type: 'adjustment', amount: 12, performer: 'Warehouse Mike', timestamp: '45 mins ago', notes: 'Stock reconciling after audit' },
           { id: 'EV-004', sku: 'LEATHER-BAG-BRN', type: 'restock', amount: 15, performer: 'Admin Sarah', timestamp: '1 hr ago', notes: 'Seasonal inventory boost' },
           { id: 'EV-005', sku: 'COTTON-TEE-BLK', type: 'dispatch', amount: -1, performer: 'System (OMS)', timestamp: '3 hrs ago', notes: 'Order #ORD-087 fulfillment' }
        ];
        setEvents(dummyEvents);
        setLoading(false);
     }, 800);
  };

  useEffect(() => {
     fetchEvents();
  }, []);

  const filteredEvents = events.filter(e => 
     e.sku.toLowerCase().includes(searchTerm.toLowerCase()) || 
     e.performer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">Warehouse Event Feed</h1>
           <p className="text-slate-500 font-medium italic mt-1 font-bold opacity-80">Real-time terminal for SKU movements and restock protocols</p>
        </div>
        <div className="flex items-center gap-4">
           <button 
              onClick={fetchEvents}
              className="px-8 py-3.5 bg-slate-900 text-white rounded-[20px] text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2 shadow-2xl shadow-slate-900/10"
           >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              Sync Stream
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
         <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20">
            <div className="relative group max-w-lg w-full">
               <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
               <input 
                  type="text" 
                  placeholder="Filter by SKU or Performer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[24px] text-sm font-bold focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all outline-none shadow-sm"
               />
            </div>
            <div className="flex items-center gap-4">
               <button className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-[20px] text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                  <Filter className="w-4 h-4 text-slate-400" />
                  Activity Filters
               </button>
            </div>
         </div>

         <div className="overflow-x-auto relative">
            {loading && (
               <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/20 animate-pulse">
                        <Zap className="w-6 h-6 text-white" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Reconciling Activity Stream...</p>
                  </div>
               </div>
            )}

            <table className="w-full text-left border-collapse min-w-[1000px]">
               <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                     <th className="p-8 pl-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Type</th>
                     <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU Identity</th>
                     <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Magnitude</th>
                     <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized By</th>
                     <th className="p-8 pr-12 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Timestamp</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  <AnimatePresence>
                     {filteredEvents.map((event) => (
                        <motion.tr 
                           key={event.id}
                           initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                           className="hover:bg-slate-50/80 transition-all group"
                        >
                           <td className="p-8 pl-12">
                              <div className={cn(
                                 "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                 event.type === 'restock' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                 event.type === 'dispatch' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                 "bg-indigo-50 text-indigo-600 border-indigo-100"
                              )}>
                                 {event.type === 'restock' ? <ArrowUp className="w-3 h-3" /> : 
                                  event.type === 'dispatch' ? <ArrowDown className="w-3 h-3" /> : 
                                  <Database className="w-3 h-3" />}
                                 {event.type}
                              </div>
                           </td>
                           <td className="p-8">
                              <div className="flex flex-col">
                                 <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{event.sku}</span>
                                 <span className="text-[10px] font-medium text-slate-400 mt-1 italic opacity-70">{event.notes}</span>
                              </div>
                           </td>
                           <td className="p-8 text-center">
                              <span className={cn(
                                 "text-lg font-black",
                                 event.amount > 0 ? "text-emerald-600" : "text-rose-600"
                              )}>
                                 {event.amount > 0 ? `+${event.amount}` : event.amount}
                              </span>
                           </td>
                           <td className="p-8">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200">
                                    <User className="w-4 h-4" />
                                 </div>
                                 <span className="text-sm font-bold text-slate-700">{event.performer}</span>
                              </div>
                           </td>
                           <td className="p-8 pr-12 text-right">
                              <div className="flex flex-col items-end">
                                 <span className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 opacity-40" />
                                    {event.timestamp}
                                 </span>
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-40 mt-1">{event.id}</span>
                              </div>
                           </td>
                        </motion.tr>
                     ))}
                  </AnimatePresence>
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

// Missing icon fix
function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
