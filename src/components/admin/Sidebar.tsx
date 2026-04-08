'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Database,
  History,
  Box,
  AlertTriangle,
  Activity,
  Zap,
  Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
  { name: 'Catalog', icon: Package, href: '/admin/catalog' },
  { name: 'Inventory Hub', icon: Box, href: '/admin/inventory' },
  { name: 'Warehouse Events', icon: Zap, href: '/admin/warehouse' },
  { name: 'Automation', icon: Cpu, href: '/admin/automation' },
  { name: 'Stock Alerts', icon: AlertTriangle, href: '/admin/alerts' },
  { name: 'Customers', icon: Users, href: '/admin/customers' },
  { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
  { name: 'Health Scan', icon: Activity, href: '/admin/health' },
  { name: 'Audit Logs', icon: History, href: '/admin/audit' },
  { name: 'Settings', icon: Settings, href: '/admin/settings' },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">ProOMS</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Enterprise Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                onClick={() => onClose?.()}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer text-sm font-medium",
                  isActive 
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-indigo-400" : "group-hover:text-slate-100"
                )} />
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <button 
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('oms_auth');
            }
            window.location.href = '/admin/login';
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-400/5 transition-all duration-200 text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Exit Admin</span>
        </button>
      </div>
    </div>
  );
}
