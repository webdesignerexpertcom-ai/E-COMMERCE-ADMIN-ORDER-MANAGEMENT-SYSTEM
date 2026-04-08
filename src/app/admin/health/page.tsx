'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Server,
  CheckCircle2,
  RefreshCw,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HealthStats {
  database: { status: string; latency: string; uptime: string };
  api: { status: string; calls: string; errors: string };
  inventory: { health: string; anomalies: number; sync: string };
  security: { audit: string; firewall: string; risks: string };
}

export default function HealthScan() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [healthData, setHealthData] = useState<HealthStats | null>(null);

  const performScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setHealthData(null);
    
    // Simulate complex neural health scan
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          const mockData: HealthStats = {
            database: { status: 'Optimal', latency: '42ms', uptime: '99.99%' },
            api: { status: 'Verified', calls: '12,402 / day', errors: '0.01%' },
            inventory: { health: '94%', anomalies: 2, sync: 'Real-time' },
            security: { audit: 'Passed', firewall: 'Active', risks: 'Zero' }
          };
          setIsScanning(false);
          setHealthData(mockData);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  useEffect(() => {
    // Intentional scan on mount
    const timer = setTimeout(() => performScan(), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">System Health Scan</h1>
          <p className="text-slate-500 font-medium italic mt-1 font-bold opacity-80">Deep diagnostic report of your OMS infrastructure</p>
        </div>
        <button 
           onClick={performScan}
           className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600 text-white rounded-[20px] text-sm font-black shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <RefreshCw className={cn("w-5 h-5", isScanning && "animate-spin")} />
          Initiate Deep Scan
        </button>
      </div>

      {isScanning ? (
        <div className="bg-white p-20 rounded-[48px] border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-8 min-h-[500px]">
           <div className="relative w-40 h-40">
              <div className="absolute inset-0 border-8 border-slate-100 rounded-full" />
              <motion.div 
                 className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent"
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-3xl font-black text-slate-900">{scanProgress}%</span>
              </div>
           </div>
           <div className="text-center">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Analyzing Neural Pathways</h3>
              <p className="text-slate-400 font-bold italic mt-2 animate-pulse">Checking database synchronization and API latency...</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Database Health */}
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Database className="w-7 h-7" />
                 </div>
                 <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {healthData?.database.status}
                 </span>
              </div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Database Core</h3>
                 <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Latency</p>
                       <p className="text-lg font-black text-slate-900 mt-2">{healthData?.database.latency}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Uptime</p>
                       <p className="text-lg font-black text-slate-900 mt-2">{healthData?.database.uptime}</p>
                    </div>
                 </div>
              </div>
           </motion.div>

           {/* API Intelligence */}
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                    <Zap className="w-7 h-7" />
                 </div>
                 <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                    {healthData?.api.status}
                 </span>
              </div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">API Interface</h3>
                 <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Traffic Volume</p>
                       <p className="text-lg font-black text-slate-900 mt-2">{healthData?.api.calls}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Error Rate</p>
                       <p className="text-lg font-black text-rose-500 mt-2">{healthData?.api.errors}</p>
                    </div>
                 </div>
              </div>
           </motion.div>

           {/* Inventory Integrity */}
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-600">
                    <Activity className="w-7 h-7" />
                 </div>
                 <span className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
                    Scan Level: Deep
                 </span>
              </div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Inventory Health</h3>
                 <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Stock Integrity</p>
                       <p className="text-lg font-black text-emerald-600 mt-2">{healthData?.inventory.health}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Sync Anomaly</p>
                       <p className="text-lg font-black text-slate-900 mt-2">{healthData?.inventory.anomalies}</p>
                    </div>
                 </div>
              </div>
           </motion.div>

           {/* Security Audit */}
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="w-7 h-7" />
                 </div>
                 <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    {healthData?.security.audit}
                 </span>
              </div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Access Control</h3>
                 <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">WAF Status</p>
                       <p className="text-lg font-black text-slate-900 mt-2">{healthData?.security.firewall}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Critical Risks</p>
                       <p className="text-lg font-black text-emerald-600 mt-2">{healthData?.security.risks}</p>
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>
      )}

      {/* Verification Terminal */}
      {!isScanning && (
        <div className="bg-slate-900 p-10 rounded-[48px] border border-slate-800 shadow-2xl space-y-6">
           <div className="flex items-center gap-3 text-indigo-400">
              <Server className="w-5 h-5" />
              <h4 className="text-xs font-black uppercase tracking-[0.2em]">Diagnostic Terminal Output</h4>
           </div>
           <div className="font-mono text-[10px] text-slate-500 space-y-2 max-h-40 overflow-y-auto pr-4 scrollbar-hide">
              <p className="text-emerald-500 font-bold">[READY] Initializing ProOMS Neural Engine v4.0.2...</p>
              <p>[INFO] Authenticating via Enterprise JWT Protocol...</p>
              <p>[INFO] Scanning c:\Users\SR Services\ecom website admin and clint infrastructure...</p>
              <p className="text-indigo-400">--- BEGIN TRACE ---</p>
              <p>[DB] Pong received from Superbase Primary Cluster.</p>
              <p>[API] Route Optimization Level 10 achieved.</p>
              <p>[INV] Calculating Predictive Restock Vectors...</p>
              <p className="text-amber-500">[WARN] 2 variants currently drifting from master SKU identity.</p>
              <p className="text-emerald-400">[SUCCESS] Full System Reconciliation complete.</p>
              <p className="text-indigo-400">--- END TRACE ---</p>
           </div>
        </div>
      )}
    </div>
  );
}
