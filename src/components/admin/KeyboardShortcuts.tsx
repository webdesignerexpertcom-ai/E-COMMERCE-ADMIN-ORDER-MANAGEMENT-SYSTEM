'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Plus, 
  Home, 
  ShoppingBag, 
  Package, 
  Users,
  Settings,
  HelpCircle,
  Command as CommandIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const commands = [
  { name: 'Go to Dashboard', shortcut: 'G D', icon: Home, href: '/admin' },
  { name: 'Manage Orders', shortcut: 'G O', icon: ShoppingBag, href: '/admin/orders' },
  { name: 'View Catalog', shortcut: 'G C', icon: Package, href: '/admin/catalog' },
  { name: 'Check Inventory', shortcut: 'G I', icon: Package, href: '/admin/inventory' },
  { name: 'Search Customers', shortcut: 'G U', icon: Users, href: '/admin/customers' },
  { name: 'System Settings', shortcut: 'G S', icon: Settings, href: '/admin/settings' },
  { name: 'Create New Product', shortcut: 'N P', icon: Plus, href: '/admin/catalog/new' },
  { name: 'Create New Order', shortcut: 'N O', icon: Plus, href: '/admin/orders/new' },
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [keys, setKeys] = useState<string[]>([]);
  const [lastAction, setLastAction] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }

      if (e.key === 'Escape') setIsOpen(false);

      // Simple sequential shortcut tracking
      if (!isOpen && !['INPUT', 'TEXTAREA'].includes((e.target as any).tagName)) {
        const newKeys = [...keys, e.key.toUpperCase()].slice(-2);
        setKeys(newKeys);
        
        const sequence = newKeys.join(' ');
        const cmd = commands.find(c => c.shortcut === sequence);
        
        if (cmd) {
          router.push(cmd.href);
          setLastAction(`Navigated to ${cmd.name}`);
          setKeys([]);
          setTimeout(() => setLastAction(null), 2000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keys, isOpen, router]);

  return (
    <>
      <AnimatePresence>
        {lastAction && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 font-bold text-sm tracking-tight"
          >
            <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
               <CommandIcon className="w-3.5 h-3.5" />
            </div>
            {lastAction}
          </motion.div>
        )}

        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                <Search className="w-5 h-5 text-slate-400" />
                <input 
                  autoFocus
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent border-none outline-none text-base font-medium text-slate-900 placeholder:text-slate-400"
                />
                <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1 bg-white border border-slate-200 rounded-md shadow-sm">ESC</button>
              </div>
              <div className="p-2 max-h-[400px] overflow-y-auto">
                <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Common Commands</p>
                {commands.map((cmd) => (
                  <button 
                    key={cmd.name}
                    onClick={() => {
                      router.push(cmd.href);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                        <cmd.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{cmd.name}</span>
                    </div>
                    <div className="flex gap-1">
                      {cmd.shortcut.split(' ').map(key => (
                        <span key={key} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-black text-slate-500 uppercase tracking-tighter shadow-sm group-hover:border-slate-300 transition-colors">
                          {key}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center gap-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-2"><HelpCircle className="w-3.5 h-3.5" /> Shortcuts Help</div>
                <div className="flex items-center gap-1.5"><CommandIcon className="w-3" /> + K to Open</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
