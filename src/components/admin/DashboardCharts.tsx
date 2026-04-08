/* eslint-disable */
'use client';

import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend
} from 'recharts';
import Link from 'next/link';

const data = [
  { name: 'Mon', revenue: 4000, orders: 24 },
  { name: 'Tue', revenue: 3000, orders: 18 },
  { name: 'Wed', revenue: 2000, orders: 28 },
  { name: 'Thu', revenue: 5780, orders: 39 },
  { name: 'Fri', revenue: 4890, orders: 48 },
  { name: 'Sat', revenue: 6390, orders: 58 },
  { name: 'Sun', revenue: 8490, orders: 63 },
];

const topProducts = [
  { name: 'Pure Coffee Beans', sales: 450, growth: '+12%' },
  { name: 'Organic Matcha Kit', sales: 380, growth: '+18%' },
  { name: 'Glass Tumbler XL', sales: 320, growth: '-2%' },
  { name: 'Ceramic Pour Over', sales: 290, growth: '+24%' },
  { name: 'Handmade Love Apron', sales: 210, growth: '+3%' },
];

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Revenue vs. Orders</h3>
            <p className="text-sm text-slate-500">Weekly performance overview</p>
          </div>
          <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
          </select>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: '#fff',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#4f46e5" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-lg mb-6">Top Performers</h3>
        <div className="space-y-4">
          {topProducts.map((product, i) => (
            <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-tight">{product.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{product.sales} sales this week</p>
                </div>
              </div>
              <div className={cn(
                "text-xs font-bold px-2 py-1 rounded-md",
                product.growth.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {product.growth}
              </div>
            </div>
          ))}
        </div>
        <Link href="/admin/catalog" className="block mt-8">
          <button className="w-full py-3 bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors">
            View All Products
          </button>
        </Link>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

