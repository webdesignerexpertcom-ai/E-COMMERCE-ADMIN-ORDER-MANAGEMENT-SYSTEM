'use client';

import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  MoreVertical, 
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  Tag,
  Box,
  LayoutGrid,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { omsFetch } from '@/lib/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initialProducts: any[] = [];

export default function CatalogPage() {
  const [view, setView] = useState<'table' | 'grid'>('table');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = () => {
    omsFetch('/api/products', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedProducts = data.data.map((p: any) => {
              const id = p._id || p.id;
              return {
                id: id,
                name: p.name,
                sku: p.sku || `SKU-${String(id).slice(-4)}`,
                category: p.category || 'Organics',
                price: `₹${p.price?.toLocaleString('en-IN') || '0.00'}`,
                stock: p.stock_quantity || 0,
                variants: p.variants?.length || 0,
                status: p.status === 'active' ? 'Active' : (p.stock_quantity > 0 ? 'Active' : 'Out of Stock'),
                isDemo: ['1','2','3','4'].includes(id)
              };
            });
            setProducts(mappedProducts);
        } else if (data.success && data.data.length === 0) {
           setProducts([]);
        }
      })
      .finally(() => setIsLoading(false));
  };

  React.useEffect(() => {
    fetchProducts();

    // REAL-TIME SYNC
    const channel = supabase
      .channel('admin:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        console.log('Admin Real-time update:', payload);
        fetchProducts(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const triggerToast = (msg: string) => {
     setToastMessage(msg);
     setIsToastOpen(true);
     setTimeout(() => setIsToastOpen(false), 3000);
  };

  const deleteProduct = async (id: string, name: string) => {
     if(!confirm(`Are you sure you want to completely remove ${name} from the catalog?`)) return;
     
     try {
        const res = await omsFetch(`/api/products?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        if(data.success) {
           triggerToast(`Asset ${name} destroyed.`);
           setProducts(prev => prev.filter(p => p.id !== id));
        } else {
           const errMsg = typeof data.error === 'string' ? data.error : (data.error?.message || JSON.stringify(data.error));
           alert("Delete failed: " + errMsg);
        }
     } catch (err) {
        console.error("Delete error:", err);
        alert("Network error during deletion.");
     }
  };

  const filteredProducts = products.filter(p => 
     p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 relative pb-20">
       <AnimatePresence>
        {isToastOpen && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 border border-white/10 text-white px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-4"
          >
             <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Check className="w-5 h-5 font-black text-white" />
             </div>
             <div>
                <p className="text-sm font-black uppercase tracking-widest leading-none">Catalog Command</p>
                <p className="text-xs font-bold opacity-80 mt-1 italic font-bold">{toastMessage}</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">Product Catalog</h1>
          <p className="text-slate-500 font-medium italic opacity-80 mt-1 font-bold">Manage your items, variants, and listing statuses.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1">
             <button 
              onClick={() => { setView('table'); triggerToast('Switched to Details Matrix'); }}
              className={cn(
                "p-2.5 rounded-xl transition-all font-black",
                view === 'table' ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              )}
              title="Details Matrix"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button 
              onClick={() => { setView('grid'); triggerToast('Switched to Asset Grid'); }}
              className={cn(
                "p-2.5 rounded-xl transition-all font-black",
                view === 'grid' ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              )}
              title="Asset Grid"
            >
               <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Link href="/admin/catalog/new">
            <button className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[24px] text-sm font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Plus className="w-5 h-5 font-black" />
              Add New Product
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20">
          <div className="relative group max-w-lg w-full">
            <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by Name, SKU, or Description..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[28px] text-sm font-black focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all outline-none shadow-sm"
            />
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => triggerToast("Advanced filter module initializing...")}
               className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-[24px] text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
             >
              <Filter className="w-4 h-4 text-slate-400 font-bold" />
              Filter
            </button>
            <button 
               onClick={() => triggerToast("Category map generating...")}
               className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-[24px] text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
             >
              <Tag className="w-4 h-4 text-slate-400 font-bold" />
              Categories
            </button>
          </div>
        </div>

        {isLoading ? (
           <div className="p-20 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 animate-pulse">Syncing Catalog Assets...</p>
           </div>
        ) : filteredProducts.length === 0 ? (
           <div className="p-20 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-slate-50 border-2 border-slate-100 border-dashed rounded-[32px] flex items-center justify-center mb-6">
                 <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-xl font-black text-slate-900 tracking-tight">No products match your query.</p>
              <p className="text-sm font-bold text-slate-400 mt-2">Adjust your search parameters or list a new asset.</p>
           </div>
        ) : (
           <div className="overflow-x-auto w-full">
             <table className="w-full text-left border-collapse min-w-[1000px] lg:min-w-full">
               <thead>
                 <tr className="border-b border-slate-100 bg-slate-50/50">
                   <th className="p-8 pl-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Info</th>
                   <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                   <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sku / Stock</th>
                   <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Retail Price</th>
                   <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                   <th className="p-8 pr-12 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {filteredProducts.map((product) => (
                   <tr key={product.id} className="hover:bg-slate-50/80 transition-all group">
                     <td className="p-8 pl-12">
                       <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-400 shadow-sm border-2 border-slate-100 group-hover:scale-105 group-hover:border-indigo-100 transition-all">
                           <Box className="w-8 h-8 opacity-50" />
                         </div>
                         <div className="flex flex-col">
                           <span className="text-md font-black text-slate-900 leading-tight group-hover:text-indigo-600 cursor-pointer transition-colors line-clamp-1 uppercase tracking-tight">{product.name}</span>
                           <div className="flex items-center gap-3 mt-2">
                             {product.variants > 0 && (
                               <span className="text-[10px] font-black text-indigo-600 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-1 uppercase tracking-widest">
                                 {product.variants} Variants
                               </span>
                             )}
                              <span className="text-[10px] font-black text-slate-400 italic uppercase">ID: {product.id}</span>
                              {product.isDemo && (
                                <span className="text-[10px] font-black text-white px-3 py-1 bg-slate-900 rounded-lg uppercase tracking-widest ml-2">
                                  Demo Asset
                                </span>
                              )}
                           </div>
                         </div>
                       </div>
                     </td>
                     <td className="p-8">
                       <span className="text-sm font-black text-slate-600 uppercase tracking-tight">{product.category}</span>
                     </td>
                     <td className="p-8">
                       <div className="flex flex-col">
                         <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{product.sku}</span>
                         <div className="flex items-center gap-2 mt-1.5">
                           <div className={cn(
                             "w-2 h-2 rounded-full",
                             product.stock > 20 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : product.stock > 0 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                           )} />
                           <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest opacity-80">
                             {product.stock === 0 ? 'Out of Stock' : `${product.stock} Units`}
                           </span>
                         </div>
                       </div>
                     </td>
                     <td className="p-8">
                       <span className="text-md font-black text-slate-900 tracking-tight leading-none opacity-80">{product.price}</span>
                     </td>
                     <td className="p-8">
                       <span className={cn(
                         "inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 shadow-sm",
                         product.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                         product.status === 'Low Stock' ? "bg-amber-50 text-amber-600 border-amber-100" :
                         "bg-rose-50 text-rose-600 border-rose-100"
                       )}>
                         {product.status}
                       </span>
                     </td>
                     <td className="p-8 pr-12 text-right">
                       <div className="flex items-center justify-end gap-3 transition-all">
                         <button 
                           onClick={() => triggerToast(`Viewing details for ${product.name}`)}
                           className="p-3.5 text-slate-400 hover:text-indigo-600 bg-white rounded-2xl transition-all border border-slate-100 shadow-sm hover:border-indigo-100"
                           title="Inspect Asset"
                         >
                           <Eye className="w-5 h-5" />
                         </button>
                         <Link href={`/admin/catalog/edit?id=${product.id}`}>
                            <button 
                              disabled={product.isDemo}
                              className={cn(
                                "p-3.5 bg-white rounded-2xl transition-all border border-slate-100 shadow-sm",
                                product.isDemo ? "opacity-30 cursor-not-allowed" : "text-slate-400 hover:text-amber-500 hover:border-amber-100"
                              )}
                              title={product.isDemo ? "Demo Asset Cannot Be Modified" : "Modify Matrix"}
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                         </Link>
                         <button 
                           disabled={product.isDemo}
                           onClick={() => deleteProduct(product.id, product.name)}
                           className={cn(
                             "p-3.5 bg-white rounded-2xl transition-all border border-slate-100 shadow-sm",
                             product.isDemo ? "opacity-30 cursor-not-allowed" : "text-slate-400 hover:text-rose-500 hover:border-rose-100"
                           )}
                           title={product.isDemo ? "Demo Asset Cannot Be Destroyed" : "Destroy Asset"}
                         >
                           <Trash2 className="w-5 h-5" />
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
      </div>
    </div>
  );
}
