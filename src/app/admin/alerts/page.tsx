'use client';

import React, { useState } from 'react';
import {
   AlertTriangle,
   Bell,
   Package,
   Settings2,
   Clock,
   TrendingUp,
   ArrowRight,
   Zap,
   Mail,
   MessageSquare,
   Webhook,
   Filter,
   CheckCircle2,
   Trash2,
   Plus,
   Phone,
   Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const initialAlerts = [
   { id: '1', item: 'XL Blue Shirt', sku: 'SHIRT-BLU-XL', stock: 2, threshold: 15, velocity: '8.5/day', health: 'Critical', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', active: true },
   { id: '2', item: 'Organic Matcha Kit', sku: 'COF-MAT-KIT', stock: 5, threshold: 15, velocity: '4.2/day', health: 'Low Stock', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', active: true },
   { id: '3', item: 'Ceramic Pour Over', sku: 'ACC-CER-001', stock: 0, threshold: 10, velocity: '1.5/day', health: 'Out of Stock', color: 'text-rose-600', bg: 'bg-rose-50/50', border: 'border-rose-200', active: true },
];

export default function StockAlertsPage() {
   const [activeTab, setActiveTab] = useState<'alerts' | 'notifications' | 'thresholds'>('alerts');
   const [alerts, setAlerts] = useState(initialAlerts);
   const [notifications, setNotifications] = useState({
      email: true,
      messaging: true,
      webhook: false,
      whatsapp: true
   });
   const [isToastOpen, setIsToastOpen] = useState(false);
   const [toastMessage, setToastMessage] = useState('');

   const [auditState, setAuditState] = useState<'idle' | 'auditing' | 'optimized'>('idle');

   const triggerToast = (msg: string) => {
      setToastMessage(msg);
      setIsToastOpen(true);
      setTimeout(() => setIsToastOpen(false), 3000);
   };

   const toggleNotification = (key: keyof typeof notifications) => {
      setNotifications({ ...notifications, [key]: !notifications[key] });
      triggerToast(`${key.toUpperCase()} notifications updated.`);
   };

   const handleRestock = (id: string) => {
      setAlerts(alerts.map(a => {
         if (a.id === id) {
            triggerToast(`Supply Chain Order Logged for ${a.item}`);
            return {
               ...a,
               stock: a.threshold,
               health: 'Restock Triggered',
               color: 'text-emerald-600',
               bg: 'bg-emerald-50',
               border: 'border-emerald-100',
               active: false
            };
         }
         return a;
      }));
   };

   const handleAudit = () => {
      if (auditState !== 'idle') return;
      setAuditState('auditing');
      triggerToast('Executing Global Supply Audit...');
      setTimeout(() => {
         setAuditState('optimized');
         triggerToast('Buffer Optimized. System at 100%.');
      }, 2500);
   };

   return (
      <div className="space-y-10 max-w-[1200px] mx-auto relative px-4 pb-20">
         {/* Dynamic Toast System */}
         <AnimatePresence>
            {isToastOpen && (
               <motion.div
                  initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
                  className="fixed top-0 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 border border-white/10 text-white px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-4"
               >
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
                     <Check className="w-5 h-5 font-black text-white" />
                  </div>
                  <div>
                     <p className="text-sm font-black uppercase tracking-widest leading-none">Intelligence Signal</p>
                     <p className="text-xs font-bold opacity-80 mt-1 italic font-bold">{toastMessage}</p>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
               <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-rose-500/20 animate-pulse">
                  <AlertTriangle className="w-8 h-8" />
               </div>
               <div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">Stock Intelligence</h1>
                  <p className="text-slate-500 font-medium italic opacity-80 font-bold leading-none mt-1">Detection of inventory shortages and automated replenishment queue.</p>
               </div>
            </div>
            <div className="flex items-center bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
               <button
                  onClick={() => setActiveTab('alerts')}
                  className={cn("px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all rounded-xl", activeTab === 'alerts' ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" : "text-slate-400 hover:text-slate-600")}
               >Check Alerts</button>
               <button
                  onClick={() => setActiveTab('notifications')}
                  className={cn("px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all rounded-xl", activeTab === 'notifications' ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" : "text-slate-400 hover:text-slate-600")}
               >Notification Config</button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
               {activeTab === 'alerts' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     {alerts.map((alert) => (
                        <motion.div
                           whileHover={{ scale: 1.01 }}
                           key={alert.id}
                           className={cn("p-8 rounded-[40px] border flex flex-col md:flex-row items-center gap-8 group transition-all", alert.bg, alert.border)}
                        >
                           <div className="w-20 h-20 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 relative">
                              <Package className={cn("w-10 h-10 transition-transform group-hover:scale-110", alert.health === 'Restock Triggered' ? "text-emerald-500" : "")} />
                              {alert.active && alert.stock === 0 && <div className="absolute top-[-5px] right-[-5px] w-5 h-5 bg-rose-600 rounded-full border-2 border-white shadow-sm" />}
                              {!alert.active && <div className="absolute top-[-5px] right-[-5px] w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white"><Check className="w-3.5 h-3.5" /></div>}
                           </div>
                           <div className="flex-1 text-center md:text-left">
                              <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                                 <h3 className="text-xl font-black text-slate-900 tracking-tight">{alert.item}</h3>
                                 <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border shadow-sm", alert.color, alert.border, "bg-white")}>
                                    {alert.health}
                                 </span>
                              </div>
                              <p className="text-sm font-bold text-slate-400 tracking-tight mb-4 italic opacity-80">SKU: {alert.sku} • Velocity: {alert.velocity}</p>
                              <div className="flex items-center justify-center md:justify-start gap-8">
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 opacity-70">Stock Level</span>
                                    <span className={cn("text-2xl font-black", alert.color)}>{alert.stock} <span className="text-sm font-medium text-slate-400 italic">/ {alert.threshold}</span></span>
                                 </div>
                                 <div className="w-[1px] h-10 bg-slate-200 mx-2" />
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 opacity-70">Time to Out</span>
                                    <span className={cn("text-lg font-black", alert.color)}>{!alert.active ? 'SECURED' : (alert.stock === 0 ? 'CRITICAL' : `${Math.floor(alert.stock / 1)} Days`)}</span>
                                 </div>
                              </div>
                           </div>
                           <button
                              onClick={() => alert.active && handleRestock(alert.id)}
                              disabled={!alert.active}
                              className={cn(
                                 "px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2",
                                 alert.active
                                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/10 hover:bg-slate-800 hover:translate-x-1"
                                    : "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 cursor-default"
                              )}
                           >
                              {alert.active ? 'Initiate Restock' : 'Restock Logged'}
                              {!alert.active && <CheckCircle2 className="w-4 h-4" />}
                           </button>
                        </motion.div>
                     ))}
                  </div>
               )}

               {activeTab === 'notifications' && (
                  <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm animate-in zoom-in duration-500">
                     <div className="flex items-center gap-3 border-b border-slate-100 pb-8 mb-10">
                        <Bell className="w-8 h-8 text-indigo-600" />
                        <div>
                           <h3 className="text-2xl font-black text-slate-900 tracking-tight">Notification Channels</h3>
                           <p className="text-sm text-slate-500 font-medium font-bold opacity-80 mt-1 italic">Automatic alerts when inventory health drops below 10%.</p>
                        </div>
                     </div>

                     <div className="space-y-6">
                        {[
                           { id: 'whatsapp', name: 'WhatsApp Business Alert', desc: 'Direct-to-Admin (9492456488)', icon: Phone, color: 'text-emerald-600', active: notifications.whatsapp },
                           { id: 'email', name: 'Official Email Alert', desc: 'Direct to procurement@store.com', icon: Mail, color: 'text-indigo-600', active: notifications.email },
                           { id: 'messaging', name: 'Admin Messaging Bridge', icon: MessageSquare, color: 'text-rose-500', active: notifications.messaging, desc: 'Post to #stock-alerts' },
                           { id: 'webhook', name: 'Webhook Integration', icon: Webhook, color: 'text-slate-500', active: notifications.webhook, desc: 'Push to supply-chain API' },
                        ].map((channel) => (
                           <div key={channel.name} className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:border-indigo-200 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className={cn("w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm transition-transform hover:scale-110", channel.color)}>
                                    <channel.icon className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{channel.name}</p>
                                    <p className="text-xs text-slate-500 font-bold italic opacity-60 mt-0.5">{channel.desc}</p>
                                 </div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                 <input type="checkbox" className="sr-only peer" checked={channel.active} onChange={() => toggleNotification(channel.id as keyof typeof notifications)} />
                                 <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 ring-offset-2 peer-checked:ring-4 ring-indigo-500/20 shadow-sm"></div>
                              </label>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>

            <div className="space-y-8">
               <section className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-2xl text-center flex flex-col items-center relative overflow-hidden">
                  {auditState === 'optimized' && (
                     <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none" />
                  )}
                  <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-all duration-500", auditState === 'optimized' ? "bg-emerald-500 text-white shadow-[0_0_40px_rgba(16,185,129,0.5)]" : "bg-white/5 text-emerald-500 shadow-2xl shadow-emerald-500/50")}>
                     <Zap className="w-10 h-10 font-bold" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 leading-tight tracking-tight uppercase">Safety Buffer Logic</h3>
                  <p className="text-slate-400 text-sm font-medium italic mb-10 px-4 opacity-80">Maintain a 15% buffer above stockouts to ensure 100% order fulfillment rate.</p>

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4 border border-slate-700 relative">
                     <motion.div
                        initial={{ width: '82%' }}
                        animate={{ width: auditState === 'optimized' ? '100%' : '82%' }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                     />
                  </div>
                  <p className={cn("text-[10px] font-black uppercase tracking-[0.3em] mb-8 italic transition-colors", auditState === 'optimized' ? "text-emerald-400" : "text-slate-500")}>
                     Efficiency: {auditState === 'optimized' ? '100%' : '82%'} vs Goal
                  </p>

                  <button
                     onClick={handleAudit}
                     disabled={auditState !== 'idle'}
                     className={cn(
                        "w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-2",
                        auditState === 'idle' ? "bg-white text-slate-900 hover:bg-slate-100 active:scale-95" :
                           auditState === 'auditing' ? "bg-white/10 text-white border border-white/20" :
                              "bg-emerald-500 text-white border border-emerald-400 cursor-default"
                     )}
                  >
                     {auditState === 'idle' && <><Zap className="w-4 h-4 fill-slate-900" /> Audit Pulse</>}
                     {auditState === 'auditing' && <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Executing...</>}
                     {auditState === 'optimized' && <><Check className="w-4 h-4" /> System Optimized</>}
                  </button>
               </section>

               <section className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
                  <div className="flex items-center gap-3">
                     <Settings2 className="w-6 h-6 text-indigo-600" />
                     <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Thresholds</h4>
                  </div>
                  <div className="space-y-6">
                     {['Coffee Gen', 'Apparel High', 'Appliances Val'].map((cat, i) => (
                        <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0 hover:translate-x-1 transition-transform">
                           <p className="text-sm font-black text-slate-700 uppercase tracking-tight leading-none">{cat}</p>
                           <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 uppercase tracking-widest shadow-sm">10% Safety</span>
                        </div>
                     ))}
                     <button onClick={() => triggerToast("Direct Policy Edit Active.")} className="flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline px-2 mt-2">
                        <Plus className="w-4 h-4 font-black" /> Update Policy
                     </button>
                  </div>
               </section>
            </div>
         </div>
      </div>
   );
}
