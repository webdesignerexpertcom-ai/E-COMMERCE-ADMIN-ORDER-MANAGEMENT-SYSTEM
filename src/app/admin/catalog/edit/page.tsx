'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Image as ImageIcon, 
  Tag, 
  Layers, 
  Database,
  Trash2,
  CheckCircle2,
  Zap,
  DollarSign,
  X,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { VariantEditor } from '@/components/admin/VariantEditor';
import confetti from 'canvas-confetti';
import { omsFetch } from '@/lib/api';

export default function EditProductListing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: 'Apparel',
    price: '',
    sku: '',
    quantity: '0',
    status: 'active',
    metaTitle: '',
    metaDescription: '',
    discountPrice: '',
    tag: 'New',
    tagColor: 'bg-emerald-500',
    lowStockThreshold: '10',
    weight: ''
  });

  useEffect(() => {
    if (!productId) return;
    
    const fetchProduct = async () => {
      try {
        const res = await omsFetch(`/api/products?id=${productId}`);
        const data = await res.json();
        if (data.success && data.data) {
          const p = data.data;
          setProductData({
            name: p.name || '',
            description: p.description || '',
            category: p.category || 'Apparel',
            price: p.price?.toString() || '',
            sku: p.sku || `SKU-${String(p._id || p.id).slice(-4)}`,
            quantity: p.stock_quantity?.toString() || '0',
            status: p.status || 'active',
            metaTitle: p.meta_title || '',
            metaDescription: p.meta_description || '',
            discountPrice: p.old_price?.toString() || '',
            tag: p.tag || 'New',
            tagColor: p.tag_color || 'bg-emerald-500',
            lowStockThreshold: p.low_stock_threshold?.toString() || '10',
            weight: p.weight || ''
          });
          if (p.image) setPreviewImage(p.image);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handlePublish = async () => {
    try {
      const res = await omsFetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: productId,
          name: productData.name,
          description: productData.description,
          price: parseFloat(productData.price),
          oldPrice: productData.discountPrice ? parseFloat(productData.discountPrice) : null,
          category: productData.category,
          stock: parseInt(productData.quantity),
          sku: productData.sku,
          image: previewImage,
          status: productData.status,
          metaTitle: productData.metaTitle,
          metaDescription: productData.metaDescription,
          tag: productData.tag,
          tag_color: productData.tagColor,
          low_stock_threshold: parseInt(productData.lowStockThreshold),
          weight: productData.weight
        })
      });
      
      const data = await res.json();
      if(data.success) {
        setIsSuccessOpen(true);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          router.push('/admin/catalog');
        }, 2000);
      } else {
        const errMsg = typeof data.error === 'string' ? data.error : (data.error?.message || JSON.stringify(data.error));
        alert("General Presence Update Failed: " + errMsg);
      }
    } catch(err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("API call failed", errMsg);
      alert("Network Error: " + errMsg);
    }
  };

  if (loading) return (
     <div className="h-[80vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 animate-pulse">Fetching Matrix Data...</p>
     </div>
  );

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20 relative">
      <AnimatePresence>
        {isSuccessOpen && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-white px-10 py-5 rounded-[40px] shadow-2xl flex items-center gap-4 border-2 border-white/20"
          >
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 font-black" />
             </div>
             <div>
                <p className="text-md font-black uppercase tracking-widest leading-none">Matrix Updated</p>
                <p className="text-xs font-bold opacity-80 mt-1 italic font-bold">Changes are now live in the global storefront.</p>
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
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">Edit Identity</h1>
             <p className="text-indigo-600 font-black italic mt-1 uppercase tracking-widest text-[10px]">
                Modifying SKU: <span className="underline decoration-indigo-300 underline-offset-4">{productData.sku}</span>
             </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={handlePublish}
             className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/10 active:scale-95 flex items-center gap-3"
           >
             Save Changes <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
           </button>
        </div>
      </div>

      {/* Reuse the rest of the layout from NewProductListing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
           {/* Section Contents (Simplified for brevity but identical in style) */}
           <section className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-10">
             <div className="flex items-center gap-4 border-b border-slate-50 pb-6 mb-2">
                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                   <Tag className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">General Presence</h3>
             </div>
             <div className="space-y-6">
                <input 
                  type="text" 
                  value={productData.name}
                  onChange={(e) => setProductData({...productData, name: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none"
                  placeholder="Product Name"
                />
                <input 
                  type="text" 
                  value={productData.sku}
                  onChange={(e) => setProductData({...productData, sku: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-100 border border-slate-200 rounded-[24px] text-sm font-black text-slate-500 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                  placeholder="SKU Identity (Read-only reference suggested)"
                />
                <textarea 
                  rows={5}
                  value={productData.description}
                  onChange={(e) => setProductData({...productData, description: e.target.value})}
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[32px] text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none resize-none"
                />
             </div>
           </section>

           <section className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-10">
             <div className="flex items-center gap-4 border-b border-slate-50 pb-6 mb-2">
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                   <Database className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Pricing & Inventory</h3>
             </div>
             <div className="grid grid-cols-2 gap-8">
                <input 
                   type="number" 
                   value={productData.price}
                   onChange={(e) => setProductData({...productData, price: e.target.value})}
                   className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none"
                />
                <input 
                   type="number" 
                   value={productData.quantity}
                   onChange={(e) => setProductData({...productData, quantity: e.target.value})}
                   className="w-full px-6 py-4 bg-indigo-50/30 border border-indigo-100 rounded-[24px] text-sm font-black text-indigo-600 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                />
             </div>
           </section>
        </div>

        <div className="space-y-10">
           <section className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8 text-center flex flex-col items-center">
              <div className="w-40 h-40 bg-slate-50 rounded-[40px] flex items-center justify-center overflow-hidden border-2 border-slate-100 shadow-inner">
                 {previewImage ? <img src={previewImage} className="w-full h-full object-cover" /> : <ImageIcon className="w-10 h-10 opacity-30" />}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest"
              >
                 Upload New Asset
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                 const file = e.target.files?.[0];
                 if(file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setPreviewImage(reader.result as string);
                    reader.readAsDataURL(file);
                 }
              }} />
           </section>

           <section className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-6">
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Product Intelligence</h4>
              <div className="space-y-4">
                 <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 opacity-70">Detection Threshold</p>
                    <input 
                      type="number"
                      value={productData.lowStockThreshold}
                      onChange={(e) => setProductData({...productData, lowStockThreshold: e.target.value})}
                      className="w-full bg-transparent text-sm font-black text-slate-900 outline-none"
                    />
                 </div>
                 <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 opacity-70">Badging Tag</p>
                    <input 
                      type="text"
                      value={productData.tag}
                      onChange={(e) => setProductData({...productData, tag: e.target.value})}
                      className="w-full bg-transparent text-sm font-black text-slate-900 outline-none"
                    />
                 </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}
