'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Database, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  Zap,
  Lock,
  Globe,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'google' | 'whatsapp' | 'email' | null>(null);

  const handleLogin = (selectedMethod: 'google' | 'email' | 'whatsapp') => {
    setLoading(true);
    setMethod(selectedMethod);
    // Simulating Secure Auth Handshake
    setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('oms_auth', 'true');
        }
        router.push('/admin');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-xl relative">
        <motion.div 
           initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
           className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[64px] p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative"
        >
           {/* Top Header Deck */}
           <div className="flex flex-col items-center text-center mb-12">
              <motion.div 
                 whileHover={{ scale: 1.1, rotate: 10 }}
                 className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center mb-6 shadow-2xl shadow-indigo-600/40 border-2 border-white/20"
              >
                 <Database className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-black text-white tracking-tighter mb-2">ProOMS <span className="text-indigo-500">Secure</span></h1>
              <p className="text-slate-400 font-medium italic opacity-80 uppercase tracking-widest text-[10px]">Enterprise Order Management System</p>
           </div>

           {/* Identity Commands */}
           <div className="space-y-6">
              <button 
                 onClick={() => handleLogin('google')}
                 disabled={loading}
                 className={cn(
                    "w-full py-5 rounded-[28px] border-2 border-white/10 flex items-center justify-center gap-4 text-white text-sm font-black uppercase tracking-[0.1em] hover:bg-white hover:text-slate-900 transition-all active:scale-95 group relative overflow-hidden",
                    loading && method === 'google' ? "bg-white text-slate-900" : ""
                 )}
              >
                 {loading && method === 'google' ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full" />
                 ) : (
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center p-1 group-hover:bg-slate-900 transition-colors">
                       <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-full" />
                    </div>
                 )}
                 {loading && method === 'google' ? 'Establishing Handshake...' : 'Authenticate with Google'}
                 <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                 onClick={() => handleLogin('whatsapp')}
                 disabled={loading}
                 className={cn(
                    "w-full py-5 rounded-[28px] border-2 border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center gap-4 text-emerald-400 text-sm font-black uppercase tracking-[0.1em] hover:bg-emerald-500 hover:text-white transition-all active:scale-95 group relative overflow-hidden",
                    loading && method === 'whatsapp' ? "bg-emerald-500 text-white" : ""
                 )}
              >
                 {loading && method === 'whatsapp' ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                 ) : (
                    <MessageSquare className="w-5 h-5" />
                 )}
                 {loading && method === 'whatsapp' ? 'Sending OTP...' : 'WhatsApp OTP Login'}
              </button>

              <div className="flex items-center gap-4 px-6 py-2">
                 <div className="h-[1px] bg-white/10 flex-1" />
                 <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">OR IDENTITY BRIDGE</span>
                 <div className="h-[1px] bg-white/10 flex-1" />
              </div>

              <div className="space-y-4">
                 <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                       type="email" 
                       placeholder="Corporate Email Address"
                       className="w-full pl-14 pr-6 py-5 bg-white/5 border-2 border-white/10 rounded-[28px] text-white text-md font-bold focus:border-indigo-600 focus:bg-white/10 transition-all outline-none"
                    />
                 </div>
                 <button 
                    onClick={() => handleLogin('email')}
                    disabled={loading}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[28px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-3"
                 >
                    {loading && method === 'email' ? 'Verifying...' : 'Continue with Email'} <Zap className="w-4 h-4 fill-white" />
                 </button>
              </div>
           </div>

           {/* Compliance / Footer Deck */}
           <div className="mt-12 flex items-center justify-center gap-8 text-[9px] font-black text-white/30 uppercase tracking-widest border-t border-white/5 pt-10">
              <div className="flex items-center gap-2 border-r border-white/5 pr-8">
                 <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Protocol
              </div>
              <div className="flex items-center gap-2">
                 <Lock className="w-4 h-4 text-amber-500" /> SSL Encrypted
              </div>
           </div>
        </motion.div>

        {/* Global Stats Deck */}
        <div className="mt-8 grid grid-cols-3 gap-4">
           {[
              { label: 'Uptime', val: '99.98%', icon: Globe, color: 'text-emerald-500' },
              { label: 'Security', val: 'Active', icon: Lock, color: 'text-indigo-400' },
              { label: 'Signals', val: 'Nominal', icon: Zap, color: 'text-amber-500' },
           ].map((stat, i) => (
              <motion.div 
                 key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i * 0.1) }}
                 className="bg-white/5 border border-white/10 rounded-3xl p-4 flex flex-col items-center text-center"
              >
                 <stat.icon className={cn("w-4 h-4 mb-2", stat.color)} />
                 <p className="text-[8px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                 <p className="text-xs font-black text-white">{stat.val}</p>
              </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
}
