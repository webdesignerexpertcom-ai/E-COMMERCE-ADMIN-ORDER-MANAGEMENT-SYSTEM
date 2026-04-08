'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Zap, 
  Play, 
  Settings, 
  Shield, 
  AlertCircle, 
  CheckCircle2,
  Database,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { omsFetch } from '@/lib/api';

interface AutomationRule {
  id: string;
  name: string;
  logic: string;
  status: 'active' | 'paused';
  lastRun: string;
  affectedItems: number;
}

export default function AutomationSystem() {
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([
    { 
      id: 'RULE-001', 
      name: 'Inventory Autopilot', 
      logic: 'IF (Stock + Incoming) < ReorderPoint AND Status != "Pending" THEN CreateRestock()', 
      status: 'active',
      lastRun: '12 mins ago',
      affectedItems: 4
    },
    { 
      id: 'RULE-002', 
      name: 'Neural Price Anchor', 
      logic: 'IF Competitor < Self - 5% THEN NotifyPricing()', 
      status: 'paused',
      lastRun: '2 days ago',
      affectedItems: 0
    }
  ]);

  const executeAutopilot = async () => {
    setIsRunning(true);
    setLog(["[INIT] Booting Inventory Autopilot v2.4...", "[SCAN] Fetching global SKU matrix..."]);
    
    try {
      const res = await omsFetch('/api/products', { cache: 'no-store' });
      const result = await res.json();
      
      if (result.success && result.data) {
        setLog(prev => [...prev, "[LOGIC] Evaluating: (Current + Incoming) < ReorderPoint AND Status != 'Pending'"]);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const candidates = result.data.filter((p: any) => {
          const currentStock = typeof p.stock_quantity !== 'undefined' ? p.stock_quantity : (p.stock || 0);
          const incomingStock = p.incoming_stock || 0; // Fallback to 0 if not tracked
          const reorderPoint = p.low_stock_threshold || 10;
          const restockStatus = p.restock_status || 'none';
          
          return (currentStock + incomingStock) < reorderPoint && restockStatus !== 'Pending';
        });

        if (candidates.length === 0) {
            setLog(prev => [...prev, "[DETECT] Found 0 candidates. System Optimal.", "[FINISH] Automation cycle finished."]);
            setIsRunning(false);
            return;
        }

        setLog(prev => [...prev, `[DETECT] Found ${candidates.length} candidates for automated restock.`]);
        setLog(prev => [...prev, "[ACTION] Creating Restock Orders and updating status to 'Pending'..."]);

        let successCount = 0;
        for (const candidate of candidates) {
            // Push the requested 'Pending' status to the backend via our PUT endpoint
            const updateRes = await omsFetch('/api/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: candidate._id || candidate.id, 
                    restock_status: 'Pending'
                })
            });
            const updateData = await updateRes.json();
            if (updateData.success || updateRes.ok) {
                successCount++;
                setLog(prev => [...prev, `[SYS] Activated Restock -> ${candidate.sku || candidate.name}`]);
            }
        }

        setLog(prev => [...prev, `[SUCCESS] Protocol complete. ${successCount} SKUs updated to 'Pending'.`, "[FINISH] Automation cycle finished."]);
        setRules(prev => prev.map(r => r.id === 'RULE-001' ? { ...r, lastRun: 'Just now', affectedItems: successCount } : r));
      } else {
        setLog(prev => [...prev, "[ERROR] Signal failure on global SKU matrix."]);
      }
    } catch (err) {
      console.error(err);
      setLog(prev => [...prev, "[ERROR] Critical Failure: Exception thrown during execution."]);
    }
    
    setIsRunning(false);
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">Automation Engine</h1>
          <p className="text-slate-500 font-medium italic mt-1 font-bold opacity-80 underline decoration-indigo-200 underline-offset-4">Neural Autopilot & Self-Healing Inventory Rules</p>
        </div>
        <button 
           onClick={executeAutopilot}
           disabled={isRunning}
           className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-[24px] text-sm font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {isRunning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          Run Manual Cycle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
           <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 pl-2">Active Protocols</h3>
           {rules.map((rule) => (
              <motion.div 
                key={rule.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative group hover:border-indigo-500/30 transition-all"
              >
                 <div className="absolute top-8 right-8">
                    <span className={cn(
                       "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                       rule.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                    )}>
                       {rule.status}
                    </span>
                 </div>
                 <div className="flex gap-6">
                    <div className={cn(
                       "w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg",
                       rule.status === 'active' ? "bg-indigo-600 text-white shadow-indigo-600/20" : "bg-slate-100 text-slate-400"
                    )}>
                       <Cpu className="w-8 h-8" />
                    </div>
                    <div className="space-y-4">
                       <div>
                          <h4 className="text-2xl font-black text-slate-900 tracking-tight">{rule.name}</h4>
                          <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest opacity-80 mt-1">{rule.id}</p>
                       </div>
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-mono text-xs text-slate-600 leading-relaxed italic">
                          {rule.logic}
                       </div>
                       <div className="flex items-center gap-6 mt-4">
                          <div className="flex items-center gap-2">
                             <Clock className="w-4 h-4 text-slate-400" />
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Run: {rule.lastRun}</span>
                          </div>
                          <div className="flex items-center gap-2 text-indigo-600 font-black italic">
                             <Zap className="w-4 h-4" />
                             <span className="text-[10px] uppercase tracking-widest">{rule.affectedItems} Items Optimized</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
           ))}
        </div>

        <div className="space-y-8">
           <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 pl-2">System Execution Logs</h3>
           <div className="bg-slate-900 p-10 rounded-[48px] border border-slate-800 shadow-2xl min-h-[500px] flex flex-col">
              <div className="flex items-center gap-3 text-emerald-400 mb-6 font-black uppercase tracking-widest text-[10px]">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 Aut autopilot Terminal Output
              </div>
              <div className="flex-1 font-mono text-[11px] text-slate-400 space-y-3 overflow-y-auto max-h-[400px] pr-4 scrollbar-hide">
                 {log.map((line, i) => (
                    <motion.p 
                       key={i} 
                       initial={{ opacity: 0, x: 10 }} 
                       animate={{ opacity: 1, x: 0 }}
                       className={cn(
                          line.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' : 
                          line.includes('[DETECT]') ? 'text-amber-400 font-bold' : 
                          line.includes('[INIT]') ? 'text-indigo-400 font-black' : ''
                       )}
                    >
                       {line}
                    </motion.p>
                 ))}
                 {isRunning && (
                    <motion.div 
                       animate={{ opacity: [0, 1] }} 
                       transition={{ repeat: Infinity, duration: 0.8 }}
                       className="w-2 h-4 bg-indigo-500 inline-block align-middle ml-1" 
                    />
                 )}
              </div>
              <div className="mt-8 pt-8 border-t border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-3 text-slate-500">
                    <Shield className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">Safe-Execution Guard Active</span>
                 </div>
                 <Settings className="w-4 h-4 text-slate-600 hover:text-white transition-colors cursor-pointer" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
