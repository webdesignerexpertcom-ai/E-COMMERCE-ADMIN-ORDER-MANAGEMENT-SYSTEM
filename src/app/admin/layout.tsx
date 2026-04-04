'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { Search, Bell, User } from 'lucide-react';
import { KeyboardShortcuts } from '@/components/admin/KeyboardShortcuts';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsChecking(false);
      return;
    }

    const authStatus = localStorage.getItem('oms_auth');
    if (!authStatus) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      setIsChecking(false);
    }
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isChecking || !isAuthenticated) {
    return (
       <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
       </div>
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      <KeyboardShortcuts />
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen overflow-x-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 group">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search anything... (Ctrl+K)"
                className="pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm w-[400px] outline-none font-medium placeholder:font-normal"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-black text-slate-400">CTRL</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-black text-slate-400">K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white rounded-lg shadow-sm border border-slate-200">Production</button>
              <button className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Staging</button>
            </div>
            
            <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>

            <button className="relative text-slate-500 hover:text-indigo-600 transition-all hover:scale-110 active:scale-95">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white ring-2 ring-rose-500/20"></span>
            </button>
            
            <div className="flex items-center gap-3 group cursor-pointer pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black leading-tight group-hover:text-indigo-600 transition-colors">Sarah Williams</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Enterprise Tier</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-0.5 shadow-lg shadow-indigo-600/20 transform group-hover:rotate-6 transition-all duration-300">
                <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-10 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
