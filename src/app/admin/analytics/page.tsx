'use client';

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { cn } from '@/lib/utils';

const inventoryHealthData = [
  { name: 'Monday', healthy: 85, low: 10, out: 5 },
  { name: 'Tuesday', healthy: 82, low: 12, out: 6 },
  { name: 'Wednesday', healthy: 78, low: 15, out: 7 },
  { name: 'Thursday', healthy: 80, low: 14, out: 6 },
  { name: 'Friday', healthy: 88, low: 8, out: 4 },
  { name: 'Saturday', healthy: 92, low: 5, out: 3 },
  { name: 'Sunday', healthy: 90, low: 7, out: 3 },
];

const stockoutLoss = [
  { category: 'Coffee', lost_revenue: 1200 },
  { category: 'Accessories', lost_revenue: 450 },
  { category: 'Apparel', lost_revenue: 890 },
  { category: 'Gifts', lost_revenue: 300 },
];

const velocityData = [
  { item: 'Expresso Beans', days_left: 12, velocity: 8.5 },
  { item: 'Ceramic Mug', days_left: 4, velocity: 12.2 },
  { item: 'Milk Frother', days_left: 0, velocity: 15.0 },
  { item: 'Linen Apron', days_left: 45, velocity: 2.1 },
];

export default function AnalyticsHealth() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <span className="p-1 bg-emerald-50 text-emerald-600 rounded border border-emerald-100"><ShieldCheck className="w-4 h-4" /></span>
             <h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Enterprise Analytics</h4>
           </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Stock Health Intelligence</h1>
          <p className="text-slate-500 font-medium">Predictive inventory modeling and revenue risk analysis.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
             <button className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Daily</button>
             <button className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-slate-900 text-white rounded-xl shadow-xl shadow-slate-900/10">Weekly</button>
             <button className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Monthly</button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Overall Health', value: '94.2%', trend: '+2.1%', sub: 'vs last week', icon: ShieldCheck, color: 'text-emerald-500' },
          { label: 'Potential Loss', value: '$2,840', trend: '-$120', sub: 'Detected Stockout Risk', icon: AlertTriangle, color: 'text-rose-500' },
          { label: 'Avg SKU velocity', value: '12.4', trend: '+0.8', sub: 'Units per day', icon: Zap, color: 'text-indigo-500' },
          { label: 'Restock Urgency', value: '18 Items', trend: 'High', sub: 'Action required', icon: Package, color: 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
             <div className="flex items-center justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-colors", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className={cn("text-xs font-black", stat.trend.includes('+') || stat.trend.includes('$') ? 'text-emerald-500' : 'text-rose-500')}>
                    {stat.trend}
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.sub}</p>
                </div>
             </div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
             <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-200 shadow-sm p-8">
           <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Stock Stability (7D)</h3>
                <p className="text-sm text-slate-500 font-medium">Monitoring SKU availability across collections.</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-600">Healthy</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-slate-600">Low</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-xs font-bold text-slate-600">Stockout</span>
                 </div>
              </div>
           </div>
           <div className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryHealthData} layout="vertical" barSize={32}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} width={80} />
                   <Tooltip 
                     cursor={{fill: '#f8fafc'}}
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                   />
                   <Bar dataKey="healthy" stackId="a" fill="#10b981" radius={[4, 0, 0, 4]} />
                   <Bar dataKey="low" stackId="a" fill="#f59e0b" />
                   <Bar dataKey="out" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-slate-900 rounded-[40px] border border-slate-800 shadow-2xl p-8 flex flex-col">
            <h3 className="text-xl font-black text-white tracking-tight mb-8 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
              Restock Risk Prediction
            </h3>
            <div className="flex-1 space-y-6">
              {velocityData.map((v, i) => (
                <div key={i} className="p-5 bg-slate-800/40 rounded-3xl border border-slate-800 hover:border-slate-600 transition-colors group cursor-pointer">
                   <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-black text-slate-300 group-hover:text-white transition-colors">{v.item}</p>
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter",
                        v.days_left <= 5 ? "bg-rose-500 text-white animate-pulse" : "bg-slate-700 text-slate-300"
                      )}>
                        {v.days_left} Days Left
                      </span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-1000", v.days_left <= 5 ? "bg-rose-500" : "bg-emerald-500")}
                        style={{ width: `${Math.min(100, (v.days_left / 30) * 100)}%` }}
                      />
                   </div>
                   <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Velocity: {v.velocity}/day</span>
                      <span className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-400 transition-colors">
                        Restock Queue <ArrowRight className="w-3 h-3" />
                      </span>
                   </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-4 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-slate-100 transition-all active:scale-95">
              Automate Supply Chain
            </button>
        </div>
      </div>
    </div>
  );
}
