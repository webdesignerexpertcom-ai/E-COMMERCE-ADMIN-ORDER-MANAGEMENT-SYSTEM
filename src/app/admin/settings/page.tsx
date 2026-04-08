'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Shield, 
  Globe, 
  CreditCard, 
  Truck,
  Lock,
  Plus,
  RefreshCcw,
  Layout,
  Phone,
  Webhook
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'roles' | 'oms' | 'auth' | 'payments'>('general');
  const [storeName, setStoreName] = useState('Homemade Love');
  const [currency, setCurrency] = useState('INR (₹)');
  const [whatsappNumber, setWhatsappNumber] = useState('9492456488');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Payment states
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_dummykey123');
  const [isRazorpayEnabled, setIsRazorpayEnabled] = useState(true);

  const tabs = [
    { id: 'general', name: 'Storefront Info', icon: Globe },
    { id: 'payments', name: 'Razorpay Payments', icon: CreditCard },
    { id: 'roles', name: 'Access Control (RBAC)', icon: Shield },
    { id: 'oms', name: 'OMS Workflow', icon: Truck },
    { id: 'auth', name: 'Cloud & API Keys', icon: Webhook },
  ];

  return (
    <div className="space-y-10 max-w-[1200px] mx-auto pb-20">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-slate-900 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-slate-900/10">
          <Settings className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Administrative Suite</h1>
          <p className="text-slate-500 font-medium italic">Configure core logic, access, and storefront parameters.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-72 flex flex-col gap-2">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'general' | 'roles' | 'oms' | 'auth' | 'payments')}
              className={cn(
                "flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all border",
                activeTab === tab.id 
                  ? "bg-white text-indigo-600 border-indigo-200 shadow-lg shadow-indigo-600/5 translate-x-1" 
                  : "bg-transparent text-slate-400 border-transparent hover:bg-slate-100 hover:text-slate-600"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.name}
            </button>
          ))}
        </aside>

        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <section className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-6 mb-6">
                    <Layout className="w-6 h-6 text-indigo-600" />
                    <h3 className="text-xl font-black text-slate-900">Branding & Presence</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Store Name</label>
                      <input 
                        type="text" 
                        value={storeName} 
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Store name..." 
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Enterprise Currency</label>
                      <select 
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm cursor-pointer appearance-none"
                      >
                        <option value="USD ($)">USD ($)</option>
                        <option value="EUR (€)">EUR (€)</option>
                        <option value="INR (₹)">INR (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Store WhatsApp Number</label>
                      <div className="relative">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white"><Phone className="w-3 h-3" /></div>
                         <input 
                          type="text" 
                          value={whatsappNumber} 
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          className="w-full pl-14 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="w-full">
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Official Store Logo</label>
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                       <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                          <CreditCard className="w-8 h-8 text-slate-400" />
                       </div>
                       <p className="text-xs font-bold text-slate-500 italic">Drag and drop high-res PNG/SVG (Max 2MB)</p>
                    </div>
                  </div>
               </section>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <section className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-indigo-600" />
                      <h3 className="text-xl font-black text-slate-900">Razorpay Payment Gateway</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded", isRazorpayEnabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                        {isRazorpayEnabled ? 'Active' : 'Disabled'}
                      </span>
                      <button 
                        onClick={() => setIsRazorpayEnabled(!isRazorpayEnabled)}
                        className="relative inline-flex items-center cursor-pointer"
                      >
                        <div className={cn("w-11 h-6 rounded-full transition-colors", isRazorpayEnabled ? "bg-indigo-600" : "bg-slate-200")}>
                          <div className={cn("absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform", isRazorpayEnabled ? "translate-x-5" : "translate-x-0")} />
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block pl-1">Razorpay Key ID</label>
                       <input 
                         type="text" 
                         value={razorpayKeyId}
                         onChange={(e) => setRazorpayKeyId(e.target.value)}
                         placeholder="rzp_test_..."
                         className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block pl-1">Webhook Secret</label>
                       <input 
                         type="password" 
                         value="••••••••••••••••"
                         readOnly
                         className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm opacity-50 cursor-not-allowed" 
                       />
                    </div>
                  </div>

                  <div className="p-6 bg-indigo-50 rounded-[32px] border border-indigo-100 flex items-start gap-4">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                        <Lock className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-sm font-black text-indigo-900 uppercase tracking-tight mb-1">Dummy Payment Mode</p>
                        <p className="text-xs text-indigo-700/70 font-medium leading-relaxed">
                          Your account is currently in <strong>Test Mode</strong>. All transactions made via Razorpay will be simulated for development purposes. No real money will be deducted.
                        </p>
                     </div>
                  </div>
               </section>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <section className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-emerald-500" />
                      <h3 className="text-xl font-black text-white tracking-tight">Active Team Permissions</h3>
                    </div>
                    <button 
                      onClick={() => setIsInviteModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                    >
                      <Plus className="w-4 h-4" />
                      Invite Staff
                    </button>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: 'Sarah Williams', role: 'Super Admin', level: 'Level 10', color: 'text-indigo-400' },
                      { name: 'Marcus James', role: 'Inventory Manager', level: 'Level 5', color: 'text-emerald-400' },
                      { name: 'Elena Rodriguez', role: 'Fulfillment Specialist', level: 'Level 3', color: 'text-amber-400' },
                    ].map((staff) => (
                      <div key={staff.name} className="flex items-center justify-between p-5 bg-slate-800/40 rounded-3xl border border-slate-800 hover:border-slate-700 transition-colors group">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center font-black text-slate-300">
                             {staff.name[0]}
                           </div>
                           <div>
                             <p className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{staff.name}</p>
                             <p className={cn("text-[10px] font-black uppercase tracking-widest", staff.color)}>{staff.role} • {staff.level}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button className="p-2.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><Lock className="w-4 h-4" /></button>
                           <button className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all"><RefreshCcw className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
               </section>
            </div>
          )}

          {activeTab === 'oms' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <section className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-6 mb-8">
                     <Truck className="w-6 h-6 text-indigo-600" />
                     <h3 className="text-xl font-black text-slate-900 tracking-tight">Status Lifecycle Logic</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <p className="text-sm text-slate-500 font-medium italic mb-6">Define the sequential stages of your order fulfillment. Drag to reorder logic priority.</p>
                    {['Awaiting Payment', 'Packed & Labeled', 'Handover to Logistics', 'Partially Dispatched'].map((status, i) => (
                      <div key={i} className="flex items-center gap-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl group cursor-move">
                         <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-slate-300 group-hover:text-indigo-600 transition-colors">
                           {i + 1}
                         </div>
                         <div className="flex-1">
                           <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{status}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 italic">Auto-trigger log active</p>
                         </div>
                         <div className="flex items-center gap-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-1 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[-6px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                         </div>
                      </div>
                    ))}
                    <button className="flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline px-4 mt-4">
                       <Plus className="w-4 h-4" />
                       Append Status Code
                    </button>
                  </div>
               </section>
            </div>
          )}

          {activeTab === 'auth' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <section className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-2xl flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-indigo-500/10 text-indigo-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/10 animate-pulse">
                    <Webhook className="w-10 h-10 font-bold" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Cloud Infrastructure Connect</h3>
                  <p className="text-slate-400 font-medium max-w-sm mb-10 transition-colors hover:text-slate-300">Synchronize your local OMS with logistical endpoints via REST Webhooks & secure API Keys.</p>
                  
                  <div className="w-full space-y-4 max-w-md">
                     <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex items-center gap-4">
                        <div className="bg-white/5 p-2 rounded-xl border border-white/10 text-white"><Layout className="w-5 h-5" /></div>
                        <div className="flex-1 text-left">
                          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Public Key</p>
                          <p className="text-xs font-bold text-white truncate">pk_live_************************420</p>
                        </div>
                        <button className="p-2 text-indigo-400 hover:text-white transition-all">Copy</button>
                     </div>
                     <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95">
                        Rotate API Secret
                     </button>
                  </div>
               </section>
            </div>
          )}
        </div>
      </div>
      {/* Invite Staff Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-slate-200 p-8 overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Invite Team Member</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assign RBAC Permission Level</p>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block pl-1">Email Address</label>
                    <input type="email" placeholder="staff@store.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block pl-1">Role Type</label>
                    <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer">
                       <option>Inventory Manager</option>
                       <option>Support Agent</option>
                       <option>Fulfillment Officer</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => { setIsInviteModalOpen(false); alert('Invitation Sent Successfully!'); }}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                  >
                    Send Invitation
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
