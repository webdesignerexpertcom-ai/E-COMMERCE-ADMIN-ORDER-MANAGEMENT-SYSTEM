'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  ChevronLeft, 
  Save, 
  X, 
  Plus, 
  Image as ImageIcon, 
  Tag, 
  Layers, 
  Database,
  Trash2,
  CheckCircle2,
  Zap,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { VariantEditor } from '@/components/admin/VariantEditor';
import confetti from 'canvas-confetti';

export default function NewProductListing() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // AI Synthesis State
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiGeneration = () => {
    if(!aiPrompt) return;
    setIsGenerating(true);
    
    // Real Free AI Generation via Pollinations.ai API
    const randomSeed = Math.floor(Math.random() * 1000000);
    const generatedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiPrompt)}?width=800&height=800&nologo=true&seed=${randomSeed}`;
    
    // Preload image before revealing to user for a premium seamless feel
    const img = new Image();
    img.src = generatedUrl;
    img.onload = () => {
       setPreviewImage(generatedUrl);
       setIsGenerating(false);
       setIsAiMode(false);
       setAiPrompt('');
    };
    img.onerror = () => {
       alert("Neural Network overload or blocked prompt. Try another description.");
       setIsGenerating(false);
    };
  };
  
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: 'Apparel',
    price: '',
    sku: '',
    quantity: '0',
    status: 'draft'
  });

  const [variants, setVariants] = useState<any[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
         const reader = new FileReader();
         reader.onloadend = () => {
             setPreviewImage(reader.result as string);
         };
         reader.readAsDataURL(file);
     }
  };

  const triggerSuccess = () => {
    setIsSuccessOpen(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#f59e0b']
    });
    setTimeout(() => {
        setIsSuccessOpen(false);
        router.push('/admin/catalog');
    }, 2500);
  };

  const handlePublish = async () => {
    if (!productData.name || !productData.price) {
        alert("Please provide at least a name and price for your product.");
        return;
    }
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: productData.name,
          description: productData.description || 'Verified organic product.',
          price: parseFloat(productData.price),
          category: productData.category,
          stock: parseInt(productData.quantity) || 0,
          sku: productData.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
          image: previewImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
          status: productData.status
        })
      });
      
      const data = await res.json();
      if(data.success) {
        triggerSuccess();
      } else {
        alert("Action Failed: " + (data.error || "Unknown server error"));
      }
    } catch(err: any) {
      console.error("API call failed", err);
      alert("Network error or server unreachable. Check your backend status.");
    }

  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20 relative">
      {/* Success Notification */}
      <AnimatePresence>
        {isSuccessOpen && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-white px-10 py-5 rounded-[40px] shadow-2xl flex items-center gap-4 border-2 border-white/20"
          >
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 font-black" />
             </div>
             <div>
                <p className="text-md font-black uppercase tracking-widest leading-none">Product Published</p>
                <p className="text-xs font-bold opacity-80 mt-1 italic font-bold">SKU {productData.sku || 'N/A'} is now live in the storefront.</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <ChevronLeft className="w-6 h-6 text-slate-400" />
          </button>
          <div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">Create New Listing</h1>
             <p className="text-slate-500 font-medium italic opacity-80 font-bold">New Entry Deck • Admin OMS Integration</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => router.push('/admin/catalog')}
             className="px-8 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm active:scale-95 flex items-center gap-2"
           >
             <Trash2 className="w-4 h-4" /> Discard
           </button>
           <button 
             onClick={handlePublish}
             className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/10 active:scale-95 flex items-center gap-3"
           >
             Publish Product <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* General Information Card */}
          <section className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-10">
             <div className="flex items-center gap-4 border-b border-slate-50 pb-6 mb-2">
                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                   <Tag className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">General Presence</h3>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block pl-1">Product Display Name</label>
                   <input 
                      type="text" 
                      placeholder="e.g. Signature Blue Linen Shirt"
                      value={productData.name}
                      onChange={(e) => setProductData({...productData, name: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block pl-1">Story & Description</label>
                   <textarea 
                      rows={5}
                      placeholder="Crafted from premium long-fiber linen..."
                      value={productData.description}
                      onChange={(e) => setProductData({...productData, description: e.target.value})}
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[32px] text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none resize-none"
                   />
                </div>
             </div>
          </section>

          {/* Pricing and Inventory Card */}
          <section className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-10">
             <div className="flex items-center gap-4 border-b border-slate-50 pb-6 mb-2">
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                   <Database className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Pricing & Inventory Hub</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-2">
                   <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block pl-1">Sales Price ($)</label>
                   <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                         type="number" 
                         placeholder="24.99"
                         value={productData.price}
                         onChange={(e) => setProductData({...productData, price: e.target.value})}
                         className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none"
                      />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block pl-1">Primary SKU</label>
                   <input 
                      type="text" 
                      placeholder="SHIRT-LIN-001"
                      value={productData.sku}
                      onChange={(e) => setProductData({...productData, sku: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none uppercase"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block pl-1 font-black text-indigo-600">Initial Quantity</label>
                   <input 
                      type="number" 
                      placeholder="100"
                      value={productData.quantity}
                      onChange={(e) => setProductData({...productData, quantity: e.target.value})}
                      className="w-full px-6 py-4 bg-indigo-50/30 border border-indigo-100 rounded-[24px] text-sm font-black text-indigo-600 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                   />
                </div>
             </div>
          </section>

          {/* Variants Deck */}
          <section className="bg-slate-50/50 p-1 rounded-[56px] border border-slate-100 shadow-inner">
             <div className="bg-white p-10 rounded-[50px] border border-slate-200 shadow-sm space-y-10">
                <div className="flex items-center justify-between border-b border-slate-50 pb-6 mb-2">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-8">Product Matrix Generator</h3>
                  </div>
                </div>
                <VariantEditor />
             </div>
          </section>
        </div>

        <div className="space-y-10">
           <section className="bg-slate-900 p-10 rounded-[48px] border border-slate-800 shadow-2xl space-y-8 flex flex-col items-center text-center relative overflow-hidden">
             {previewImage && <img src={previewImage} alt="Master Asset" className="absolute inset-0 w-full h-full object-cover opacity-30 select-none pointer-events-none" />}
             
             <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center text-white shadow-2xl shadow-indigo-600/10 relative z-10 overflow-hidden border border-white/10">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-10 h-10 opacity-40" />
                )}
             </div>
             
             <div className="relative z-10 w-full">
                <h4 className="text-xl font-black text-white mb-2 leading-tight">Master Image Library</h4>
                <p className="text-slate-400 text-sm font-medium italic opacity-80 px-4">Upload high-resolution shots for your storefront display.</p>
             </div>
             
             <div className="relative z-10 w-full space-y-3">
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*" 
                 onChange={handleImageUpload} 
               />
               
               <AnimatePresence>
                  {isAiMode && (
                     <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-4 overflow-hidden">
                        <div className="p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[28px] shadow-lg mb-3">
                           <div className="bg-slate-900 rounded-[24px] p-2 flex items-center pr-4">
                              <input 
                                 type="text" 
                                 placeholder="Describe the asset for AI..."
                                 value={aiPrompt}
                                 onChange={(e) => setAiPrompt(e.target.value)}
                                 className="w-full bg-transparent text-[11px] text-white px-3 font-medium outline-none placeholder:text-slate-500"
                                 autoFocus
                              />
                              <button 
                                 onClick={handleAiGeneration}
                                 disabled={isGenerating}
                                 className="ml-2 w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-[8px] font-black"
                              >
                                 {isGenerating ? "..." : "GO"}
                              </button>
                           </div>
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>

               {isGenerating && (
                 <div className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 uppercase tracking-widest text-center animate-pulse mb-3">
                    Synthesizing Assets via Neural Network...
                 </div>
               )}

               <div className="flex items-center gap-3 w-full">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isGenerating}
                    className={cn(
                      "flex-1 py-4 border rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all",
                      previewImage 
                        ? "bg-slate-800 text-white border-slate-700" 
                        : "bg-white/10 hover:bg-white text-white hover:text-slate-900 border-white/10"
                    )}
                  >
                     Select Master Assets
                  </button>
                  <button 
                    onClick={() => setIsAiMode(!isAiMode)}
                    disabled={isGenerating}
                    className="w-16 py-4 flex items-center justify-center bg-transparent border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 rounded-[24px] transition-all shadow-[0_0_20px_rgba(99,102,241,0.1)] hover:shadow-indigo-500/30 group"
                    title="Generate with Built-in AI"
                  >
                    <Zap className="w-5 h-5 group-hover:fill-indigo-400 transition-all font-bold" />
                  </button>
               </div>
             </div>
           </section>

          <section className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
             <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight uppercase tracking-tighter">Product Intelligence</h4>
             <div className="space-y-4">
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all group">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 opacity-70">Category Segment</p>
                   <select 
                      value={productData.category}
                      onChange={(e) => setProductData({...productData, category: e.target.value})}
                      className="w-full bg-transparent text-sm font-black text-slate-900 outline-none cursor-pointer"
                   >
                      <option value="Apparel">Lifestyle Apparel</option>
                      <option value="Home">Home Wellness</option>
                      <option value="Kitchen">Kitchen & Dining</option>
                   </select>
                </div>
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 opacity-70">Visibility Status</p>
                   <select 
                      value={productData.status}
                      onChange={(e) => setProductData({...productData, status: e.target.value})}
                      className="w-full bg-transparent text-sm font-black text-slate-900 outline-none cursor-pointer"
                   >
                      <option value="active">Live in Store</option>
                      <option value="draft">Draft Protocol</option>
                      <option value="hidden">Admin Only</option>
                   </select>
                </div>

             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
