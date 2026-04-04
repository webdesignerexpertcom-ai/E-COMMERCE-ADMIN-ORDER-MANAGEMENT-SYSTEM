'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Layers, 
  ArrowRight, 
  ChevronDown, 
  Box, 
  Tag, 
  RefreshCcw,
  Zap,
  Info,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type Variant = {
  id: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
  attributes: Record<string, string>;
};

export function VariantEditor() {
  const [attributes, setAttributes] = useState<{ name: string; values: string[] }[]>([
    { name: 'Color', values: ['Midnight Blue', 'Emerald Green'] },
    { name: 'Size', values: ['M', 'L'] },
  ]);

  const [variants, setVariants] = useState<Variant[]>([
    { id: '1', name: 'Midnight Blue / M', sku: 'PRD-BLU-M', price: '24.00', stock: 10, attributes: { Color: 'Midnight Blue', Size: 'M' } },
    { id: '2', name: 'Midnight Blue / L', sku: 'PRD-BLU-L', price: '24.00', stock: 15, attributes: { Color: 'Midnight Blue', Size: 'L' } },
    { id: '3', name: 'Emerald Green / M', sku: 'PRD-GRN-M', price: '26.00', stock: 5, attributes: { Color: 'Emerald Green', Size: 'M' } },
    { id: '4', name: 'Emerald Green / L', sku: 'PRD-GRN-L', price: '26.00', stock: 8, attributes: { Color: 'Emerald Green', Size: 'L' } },
  ]);

  const updateAttributeName = (index: number, newName: string) => {
    const fresh = [...attributes];
    fresh[index].name = newName;
    setAttributes(fresh);
  };

  const updateVariant = (id: string, field: keyof Variant, value: string | number) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const addAttribute = () => {
    setAttributes([...attributes, { name: '', values: [] }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-12">
      {/* Step 1: Attribute Definition */}
      <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Layers className="w-5 h-5 font-black" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Variant Attributes</h3>
              <p className="text-sm text-slate-500 font-medium">Define options like Size, Color, or Material</p>
            </div>
          </div>
          <button 
            onClick={addAttribute}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-black hover:bg-indigo-100 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Attribute
          </button>
        </div>

        <div className="space-y-6">
          {attributes.map((attr, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className="flex flex-col md:flex-row gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 group transition-all"
            >
              <div className="flex-1 max-w-[250px]">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Attribute Name</label>
                <input 
                  type="text" 
                  value={attr.name}
                  onChange={(e) => updateAttributeName(idx, e.target.value)}
                  placeholder="e.g. Color"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Values</label>
                <div className="flex flex-wrap gap-2">
                  {attr.values.map((val, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 flex items-center gap-2 shadow-sm group-hover:border-slate-300 transition-colors">
                      {val}
                      <button className="text-slate-400 hover:text-rose-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  <button className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-black flex items-center gap-1 hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-indigo-600/10">
                    <Plus className="w-3.5 h-3.5" />
                    New Value
                  </button>
                </div>
              </div>
              <button 
                onClick={() => removeAttribute(idx)}
                className="mt-6 md:mt-0 p-3 self-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Step 2: Variant Matrix */}
      <section className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <RefreshCcw className="w-5 h-5 font-black" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Variant Matrix</h3>
              <p className="text-sm text-slate-400 font-medium whitespace-nowrap">Generated {variants.length} unique SKUs</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700">
               <Zap className="w-4 h-4 text-amber-500" />
               Auto-Gen SKUs
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
               Bulk Edit
             </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="p-5 pl-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Variant Name</th>
                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">SKU Identifier</th>
                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Retail Price</th>
                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Initial Stock</th>
                <th className="p-5 pr-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Enabled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
               {variants.map((v) => (
                <tr key={v.id} className="hover:bg-indigo-500/5 transition-colors group">
                  <td className="p-5 pl-8 text-sm font-black text-slate-300 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       {v.name}
                       <Info className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                  </td>
                  <td className="p-5">
                    <input 
                      type="text" 
                      value={v.sku}
                      onChange={(e) => updateVariant(v.id, 'sku', e.target.value)}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:border-indigo-500 outline-none transition-all w-[180px]"
                    />
                  </td>
                  <td className="p-5">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
                      <input 
                        type="text" 
                        value={v.price}
                        onChange={(e) => updateVariant(v.id, 'price', e.target.value)}
                        className="bg-slate-800/50 border border-slate-700 rounded-lg pl-6 pr-3 py-1.5 text-xs font-bold text-white focus:border-indigo-500 outline-none transition-all w-[100px]"
                      />
                    </div>
                  </td>
                   <td className="p-5">
                    <input 
                      type="number" 
                      value={v.stock}
                      onChange={(e) => updateVariant(v.id, 'stock', parseInt(e.target.value) || 0)}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:border-indigo-500 outline-none transition-all w-[80px]"
                    />
                  </td>
                  <td className="p-5 pr-8 text-right">
                     <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 bg-black/20 flex flex-col items-center justify-center border-t border-slate-800">
           <div className="flex items-center gap-2 text-slate-500 mb-4 italic text-center">
             <ArrowRight className="w-4 h-4 flex-shrink-0" />
             <p className="text-xs font-medium">Changes here will be saved when you update the core product listing.</p>
           </div>
           <button className="flex items-center gap-2 px-12 py-3.5 bg-white text-slate-900 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all hover:scale-[1.03] active:scale-95 shadow-2xl shadow-white/10">
              Update All Variants
           </button>
        </div>
      </section>
    </div>
  );
}
