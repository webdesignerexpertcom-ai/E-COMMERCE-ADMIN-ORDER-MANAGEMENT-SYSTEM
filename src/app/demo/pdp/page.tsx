'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Truck, 
  Heart, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowLeft,
  ShieldCheck,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function ProductDetailPage() {
  const [selectedSize, setSelectedSize] = useState('250g');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const sizes = [
    { label: '250g', price: 100 },
    { label: '500g', price: 200 },
    { label: '1kg', price: 400 },
  ];

  const benefits = [
    'Rich in Vitamin C',
    'Aids Digestion',
    'Traditional Recipe',
    'Preservative Free'
  ];

  const currentPrice = sizes.find(s => s.label === selectedSize)?.price || 100;

  const handleAddToCart = () => {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans pb-32">
      {/* MOBILE HEADER */}
      <nav className="sticky top-0 z-50 bg-[#FDFBF7]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <button className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:scale-105 transition-transform">
          <ArrowLeft className="w-5 h-5 text-slate-900" />
        </button>
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Product Detail</span>
        <button 
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={cn(
            "p-3 rounded-2xl shadow-sm border transition-all hover:scale-105",
            isWishlisted ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-white border-slate-100 text-slate-400"
          )}
        >
          <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
        </button>
      </nav>

      {/* HERO IMAGE */}
      <section className="px-6 pt-2 pb-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative aspect-square rounded-[64px] overflow-hidden shadow-2xl shadow-amber-900/10 border-8 border-white group"
        >
          <img 
            src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1480&auto=format&fit=crop" 
            alt="Chintakaya Pachadi" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          />
          <div className="absolute top-8 left-8 flex flex-col gap-3">
            <span className="bg-[#4F7942] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl shadow-lg">100% Organic</span>
            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-white flex items-center gap-2">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-black text-slate-900">4.5 Rating</span>
            </div>
          </div>
          <div className="absolute bottom-8 right-8 bg-[#FFD700] text-[#4A2617] p-4 rounded-3xl shadow-xl border-4 border-white flex flex-col items-center rotate-3">
             <span className="text-[10px] font-black opacity-60 uppercase leading-none">Best</span>
             <span className="text-sm font-black uppercase leading-none mt-1">Value</span>
          </div>
        </motion.div>
      </section>

      {/* CONTENT */}
      <main className="px-8 space-y-10">
        {/* TITLE SECTION */}
        <motion.div {...fadeIn}>
          <h1 className="text-4xl font-serif italic font-black text-[#4A2617] leading-tight">
            చింతకాయ పచ్చడి
          </h1>
          <h2 className="text-3xl font-black text-[#4A2617] tracking-tight mt-1 opacity-90">
            (Chintakaya Pachadi)
          </h2>
          <p className="text-slate-500 font-medium text-lg mt-6 leading-relaxed">
            Tangy traditional raw tamarind pickle made with hand-picked organic green tamarind and premium roasted spices. A timeless heritage recipe.
          </p>
        </motion.div>

        {/* BENEFITS */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
          <h3 className="text-[#4A2617] text-xs font-black uppercase tracking-[0.2em] mb-5 opacity-60 italic">Key Benefits:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-4 group">
                   <div className="w-3 h-3 bg-[#FFD700] rounded-full shadow-sm group-hover:scale-125 transition-transform" />
                   <span className="text-sm font-black text-[#4A2617] uppercase tracking-tighter">{b}</span>
                </div>
             ))}
          </div>
        </motion.div>

        {/* SIZE SELECTION */}
        <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
           <h3 className="text-[#4A2617] text-xs font-black uppercase tracking-[0.2em] mb-5 opacity-60 italic">Select Size:</h3>
           <div className="grid grid-cols-3 gap-4">
              {sizes.map((s) => (
                 <button 
                  key={s.label}
                  onClick={() => setSelectedSize(s.label)}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-6 rounded-[32px] border-2 transition-all duration-300",
                    selectedSize === s.label 
                      ? "bg-[#FFFCEC] border-[#FFD700] ring-8 ring-[#FFD700]/5 shadow-xl scale-105" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                 >
                    <span className="text-sm font-black text-[#4A2617] uppercase">{s.label}</span>
                    <span className="text-[11px] font-extrabold mt-1.5 opacity-60 tracking-wider">₹{s.price}</span>
                    {selectedSize === s.label && (
                      <motion.div layoutId="sizing" className="absolute inset-0 border-2 border-[#FFD700] rounded-[32px] pointer-events-none" />
                    )}
                 </button>
              ))}
           </div>
        </motion.div>

        {/* STOCK & DELIVERY INFO */}
        <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="grid grid-cols-2 gap-4 pt-4">
           <div className="flex items-center gap-4 bg-emerald-50/50 p-5 rounded-[28px] border border-emerald-100">
              <Package className="w-6 h-6 text-emerald-600" />
              <div>
                 <p className="text-[8px] font-black uppercase text-emerald-600 tracking-widest leading-none">Status</p>
                 <p className="text-xs font-black text-slate-900 mt-1 uppercase">In Stock</p>
              </div>
           </div>
           <div className="flex items-center gap-4 bg-blue-50/50 p-5 rounded-[28px] border border-blue-100">
              <Truck className="w-6 h-6 text-blue-600" />
              <div>
                 <p className="text-[8px] font-black uppercase text-blue-600 tracking-widest leading-none">Speed</p>
                 <p className="text-xs font-black text-slate-900 mt-1 uppercase">2 Day Link</p>
              </div>
           </div>
        </motion.div>

        {/* QUANTITY */}
        <motion.div {...fadeIn} transition={{ delay: 0.4 }} className="space-y-5">
           <h3 className="text-[#4A2617] text-xs font-black uppercase tracking-[0.2em] opacity-60 italic">Quantity:</h3>
           <div className="flex items-center justify-between p-2.5 bg-[#F6FBF3] border border-[#E4F0DE] rounded-full max-w-[240px]">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-14 h-14 bg-white text-[#4A2617] rounded-full shadow-sm flex items-center justify-center text-2xl font-black hover:bg-emerald-50 transition-all active:scale-90 border border-slate-100"
              >
                <Minus className="w-6 h-6" />
              </button>
              <div className="flex flex-col items-center">
                 <span className="text-3xl font-black text-[#4A2617] font-serif leading-none">{quantity}</span>
                 <span className="text-[8px] font-black uppercase tracking-[0.15em] text-[#4A2617]/40 mt-1">UNITS</span>
              </div>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-14 h-14 bg-white text-[#4A2617] rounded-full shadow-sm flex items-center justify-center text-2xl font-black hover:bg-emerald-50 transition-all active:scale-90 border border-slate-100"
              >
                <Plus className="w-6 h-6" />
              </button>
           </div>
        </motion.div>
      </main>

      {/* STICKY BOTTOM BAR */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-white/80 backdrop-blur-2xl border-t border-slate-100 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]"
      >
        <div className="max-w-xl mx-auto flex items-center gap-6">
           <div className="hidden sm:block">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Price</p>
              <p className="text-2xl font-black text-[#4A2617] tracking-tighter">₹{currentPrice * quantity}</p>
           </div>
           
           <button 
             onClick={handleAddToCart}
             className={cn(
               "flex-1 py-5 rounded-[40px] text-lg font-black uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-4 group",
               isAdded 
                ? "bg-emerald-600 text-white shadow-emerald-500/20" 
                : "bg-[#4A2617] text-white shadow-orange-950/30 hover:scale-[1.02] active:scale-[0.98]"
             )}
           >
              {isAdded ? (
                <>
                  <CheckCircle2 className="w-6 h-6 animate-bounce" /> Item Added
                </>
              ) : (
                <>
                  <ShoppingBag className="w-6 h-6 group-hover:rotate-12 transition-transform" /> Add to Cart (₹{currentPrice * quantity})
                </>
              )}
           </button>
        </div>
      </motion.div>

      {/* SECURED LOGO */}
      <div className="flex flex-col items-center justify-center pt-20 pb-12 opacity-30">
        <ShieldCheck className="w-12 h-12 text-[#4A2617] mb-3" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4A2617]">NaturePure Encryption Active</p>
      </div>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {isAdded && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 bg-slate-900 text-white rounded-[32px] shadow-2xl flex items-center gap-4 whitespace-nowrap"
          >
             <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
             </div>
             <p className="text-sm font-black uppercase tracking-widest">Cart Updated Successfully</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
