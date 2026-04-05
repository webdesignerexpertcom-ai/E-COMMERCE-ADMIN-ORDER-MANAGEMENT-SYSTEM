'use client';

import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  Key,
  Phone,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'google' | 'magic-link' | 'email' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [whatsappStep, setWhatsappStep] = useState<0 | 1 | 2>(0); // 0 = not using WA, 1 = entering phone, 2 = entering code
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        localStorage.setItem('oms_auth', 'true');
        router.push('/admin');
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMethod('email');
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage({ text: error.message, type: 'error' });
      setLoading(false);
    } else {
      localStorage.setItem('oms_auth', 'true');
      router.push('/admin');
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setMessage({ text: "Please enter your email first", type: 'error' });
      return;
    }
    setLoading(true);
    setMethod('magic-link');
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/admin',
      }
    });

    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setMessage({ text: "Check your email for the login link!", type: 'success' });
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: 'google') => {
    setLoading(true);
    setMethod('google');
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/admin',
      }
    });
    if (error) {
      setMessage({ text: error.message, type: 'error' });
      setLoading(false);
    }
  };

  const handleWhatsAppAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMethod('email'); // reuse loader
    setMessage(null);

    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    if (whatsappStep === 1) {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          channel: 'whatsapp',
        }
      });

      if (error) {
        setMessage({ text: error.message, type: 'error' });
      } else {
        setMessage({ text: "WhatsApp code sent! Check your app.", type: 'success' });
        setWhatsappStep(2);
      }
    } else if (whatsappStep === 2) {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        setMessage({ text: error.message, type: 'error' });
      } else {
        localStorage.setItem('oms_auth', 'true');
        router.push('/admin');
      }
    }
    setLoading(false);
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
           <div className="flex flex-col items-center text-center mb-10">
              <motion.div 
                 whileHover={{ scale: 1.1, rotate: 10 }}
                 className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center mb-6 shadow-2xl shadow-indigo-600/40 border-2 border-white/20"
              >
                 <Database className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-black text-white tracking-tighter mb-2">ProOMS <span className="text-indigo-500">Secure</span></h1>
              <p className="text-slate-400 font-medium italic opacity-80 uppercase tracking-widest text-[10px]">Enterprise Order Management System</p>
           </div>

           {message && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className={cn(
                 "mb-8 p-4 rounded-2xl text-xs font-bold text-center border",
                 message.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
               )}
             >
               {message.text}
             </motion.div>
           )}

           {/* Identity Commands */}
           <div className="space-y-6">
              {whatsappStep === 0 ? (
                <>
                  <button 
                     onClick={(e) => { e.preventDefault(); localStorage.setItem('oms_auth_demo', 'true'); router.push('/admin'); }}
                     className="w-full py-5 rounded-[28px] border-2 border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center gap-4 text-indigo-400 text-sm font-black uppercase tracking-[0.1em] hover:bg-indigo-500 hover:text-white transition-all active:scale-95 group relative overflow-hidden mb-4"
                  >
                     <ShieldCheck className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
                     1-Click Demo Login (Bypass)
                     <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                  
                  <button 
                     onClick={() => handleOAuth('google')}
                     disabled={loading}
                     className={cn(
                        "w-full py-5 rounded-[28px] border-2 border-white/10 flex items-center justify-center gap-4 text-white text-sm font-black uppercase tracking-[0.1em] hover:bg-white hover:text-slate-900 transition-all active:scale-95 group relative overflow-hidden mb-4",
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
                     {loading && method === 'google' ? 'Redirecting...' : 'Authenticate with Google'}
                     <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>

                  <button 
                     onClick={() => setWhatsappStep(1)}
                     className="w-full py-5 rounded-[28px] border-2 border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center gap-4 text-emerald-400 text-sm font-black uppercase tracking-[0.1em] hover:bg-emerald-500 hover:text-white transition-all active:scale-95 group relative overflow-hidden"
                  >
                     <MessageSquare className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors" />
                     Login via WhatsApp
                     <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>

                  <div className="flex items-center gap-4 px-6 py-2">
                     <div className="h-[1px] bg-white/10 flex-1" />
                     <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">OR SECURE DIRECT ACCESS</span>
                     <div className="h-[1px] bg-white/10 flex-1" />
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                     <div className="relative group">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                           type="email" 
                           required
                           placeholder="Corporate Email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full pl-14 pr-6 py-5 bg-white/5 border-2 border-white/10 rounded-[28px] text-white text-md font-bold focus:border-indigo-600 focus:bg-white/10 transition-all outline-none"
                        />
                     </div>
                     <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                           type={showPassword ? "text" : "password"} 
                           required
                           placeholder="Secret Password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full pl-14 pr-14 py-5 bg-white/5 border-2 border-white/10 rounded-[28px] text-white text-md font-bold focus:border-indigo-600 focus:bg-white/10 transition-all outline-none"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                        >
                          {showPassword ? <Zap className="w-4 h-4 fill-white" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>
                     </div>
                     
                     <div className="flex gap-3">
                       <button 
                          type="submit"
                          disabled={loading}
                          className="flex-[2] py-5 bg-indigo-600 text-white rounded-[28px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-3"
                       >
                          {loading && method === 'email' ? 'Checking...' : 'Sign In'} <CheckCircle2 className="w-4 h-4" />
                       </button>
                       <button 
                          type="button"
                          disabled={loading}
                          onClick={handleMagicLink}
                          title="Send Magic Link to Email"
                          className="flex-1 py-5 bg-white/5 border-2 border-white/10 text-white rounded-[28px] text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all active:scale-95"
                       >
                          {loading && method === 'magic-link' ? '...' : 'Magic'}
                       </button>
                     </div>
                  </form>
                </>
              ) : (
                <form onSubmit={handleWhatsAppAuth} className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <button 
                      type="button" 
                      onClick={() => setWhatsappStep(0)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h3 className="text-white font-bold text-lg leading-tight">WhatsApp Access</h3>
                      <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">End-to-End Encrypted</p>
                    </div>
                  </div>

                  {whatsappStep === 1 && (
                    <div className="relative group">
                       <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" />
                       <input 
                          type="tel" 
                          required
                          placeholder="WhatsApp Number (e.g. 9876543210)"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-14 pr-6 py-5 bg-white/5 border-2 border-white/10 rounded-[28px] text-white text-md font-bold focus:border-emerald-500 focus:bg-emerald-500/5 transition-all outline-none"
                       />
                    </div>
                  )}

                  {whatsappStep === 2 && (
                    <div className="relative group">
                       <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" />
                       <input 
                          type="text" 
                          required
                          placeholder="Enter 6-Digit Code"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full pl-14 pr-6 py-5 bg-white/5 border-2 border-white/10 rounded-[28px] text-white text-xl tracking-widest font-black focus:border-emerald-500 focus:bg-emerald-500/5 transition-all outline-none text-center"
                       />
                    </div>
                  )}

                  <button 
                     type="submit"
                     disabled={loading}
                     className="w-full py-5 bg-emerald-500 text-white rounded-[28px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/30 hover:bg-emerald-400 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                     {loading ? 'Verifying...' : whatsappStep === 1 ? 'Send Secure Code' : 'Verify & Login'} <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}
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

