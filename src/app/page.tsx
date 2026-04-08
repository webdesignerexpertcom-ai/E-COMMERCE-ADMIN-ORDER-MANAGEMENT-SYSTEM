'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Search, 
  Leaf, 
  Truck, 
  Shield, 
  Menu, 
  X, 
  Star, 
  MessageCircle, 
  Trash2, 
  Plus,
  Award,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function ProEcoStorefront() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  
  const [products, setProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map((p: any) => ({
          ...p,
          id: p._id || p.id
        }));
        setProducts(mapped);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const savedCart = localStorage.getItem('naturepure_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart([]);
      }
    }
    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (cart.length > 0 || localStorage.getItem('naturepure_cart')) {
      localStorage.setItem('naturepure_cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && (item.size === product.size || (!item.size && !product.size)));
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && (item.size === product.size || (!item.size && !product.size)))
          ? { ...item, quantity: (item.quantity || 1) + (product.quantity || 1) } 
          : item
        );
      }
      return [...prev, { ...product }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, size: string | undefined, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && (item.size === size || (!item.size && !size))) {
        const newQty = (item.quantity || 1) + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string, size: string | undefined) => {
    setCart(prev => prev.filter(item => !(item.id === id && (item.size === size || (!item.size && !size)))));
  };

  const handleVariantSelect = (productId: string, size: string) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: size }));
  };

  const updateProductQty = (productId: string, delta: number) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleWhatsAppCheckout = () => {
    const orderDetails = cart.map(item => `- ${item.name} (${item.size || 'Standard'}) x${item.quantity}`).join('%0A');
    const message = `I'd like to order:%0A${orderDetails}%0A%0ATotal: ₹${cartTotal.toFixed(2)}`;
    window.open(`https://wa.me/919492456488?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FDFCF6] selection:bg-[#FFD700] selection:text-[#4A2617]">
      
      {/* HEADER: Tukaram Style */}
      <header className="sticky top-0 z-50 bg-[#FFD700] px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-6">
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-[#4A2617]">
             <Menu className="w-7 h-7" />
           </button>
           <div className="bg-white border-2 border-[#4A2617] px-6 py-2 rounded-xl shadow-lg transform -rotate-1 hover:rotate-0 transition-transform cursor-pointer" onClick={() => router.push('/')}>
              <span className="block text-[10px] font-black text-[#4A2617] uppercase tracking-tighter leading-none">THE</span>
              <span className="block text-2xl font-black text-[#4A2617] tracking-tighter leading-tight">NATUREPURE</span>
              <span className="block text-[8px] font-bold text-[#4A2617] text-center opacity-70 tracking-[0.3em] mt-1 uppercase">Organic Foods</span>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <button onClick={() => setIsCartOpen(true)} className="relative p-3 text-[#4A2617] hover:scale-110 transition-transform">
              <ShoppingBag className="w-7 h-7" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 right-1 w-6 h-6 bg-[#4A2617] text-[#FFD700] text-[11px] font-black flex items-center justify-center rounded-full shadow-md border-2 border-[#FFD700]">
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
           </button>
           <div className="hidden md:flex flex-col gap-1.5 cursor-pointer p-2" onClick={() => setIsMobileMenuOpen(true)}>
              <div className="w-8 h-0.5 bg-[#4A2617]" />
              <div className="w-5 h-0.5 bg-[#4A2617] ml-auto" />
           </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
           <>
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-[#4A2617]/40 backdrop-blur-md z-[130]" />
             <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed top-0 left-0 h-full w-[300px] bg-[#FFD700] z-[140] shadow-2xl p-8 flex flex-col">
                <div className="flex items-center justify-between mb-12">
                   <div className="bg-white border-2 border-[#4A2617] px-4 py-1.5 rounded-lg shadow-sm">
                      <span className="block text-[8px] font-black text-[#4A2617] uppercase tracking-tighter leading-none">THE</span>
                      <span className="block text-lg font-black text-[#4A2617] tracking-tighter leading-tight text-center">NATUREPURE</span>
                   </div>
                   <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[#4A2617]"><X className="w-6 h-6" /></button>
                </div>
                <div className="flex-1 flex flex-col gap-8">
                   {['Collections', 'Fresh Harvest', 'About Us', 'Contact'].map(link => (
                      <a key={link} href="#" className="text-2xl font-black text-[#4A2617] italic hover:translate-x-2 transition-transform uppercase tracking-tighter" onClick={() => setIsMobileMenuOpen(false)}>{link}</a>
                   ))}
                </div>
                <div className="pt-8 border-t border-[#4A2617]/10">
                   <p className="text-[10px] font-black uppercase text-[#4A2617]/50 tracking-widest">Support Line</p>
                   <p className="text-sm font-black text-[#4A2617] mt-1">+91 94924 56488</p>
                </div>
             </motion.div>
           </>
        )}
      </AnimatePresence>

      {/* CART SIDEBAR */}
      <AnimatePresence>
        {isCartOpen && (
           <>
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-[#4A2617]/20 backdrop-blur-sm z-[110]" />
             <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 h-full w-[400px] max-w-full bg-white z-[120] shadow-2xl flex flex-col">
                <div className="p-8 bg-[#FFD700] text-[#4A2617] flex items-center justify-between">
                   <div>
                      <h3 className="text-2xl font-black italic tracking-tight">Order Summary</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{totalItems} Items Checked Out</p>
                   </div>
                   <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-black/5 rounded-full"><X className="w-6 h-6" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                   {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                         <ShoppingBag className="w-16 h-16 mb-4 text-[#4A2617]" />
                         <p className="font-black uppercase tracking-widest text-xs text-[#4A2617]">Your basket is empty</p>
                      </div>
                   ) : (
                      cart.map((item, i) => (
                        <div key={`${item.id}-${item.size}`} className="flex gap-4 p-4 border border-slate-100 rounded-2xl items-center group shadow-sm hover:border-[#FFD700]/30 transition-all">
                           <img src={item.image} className="w-16 h-16 object-cover rounded-xl border border-slate-100" alt={item.name} />
                           <div className="flex-1 min-w-0">
                              <h4 className="font-black text-[#4A2617] text-sm uppercase leading-tight truncate">{item.name}</h4>
                              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">{item.size || 'Standard'}</p>
                              <div className="flex items-center gap-3 mt-3">
                                 <div className="flex items-center bg-slate-50 rounded-full px-2 py-1 border border-slate-100">
                                    <button onClick={() => updateQuantity(item.id, item.size, -1)} className="w-6 h-6 flex items-center justify-center font-black text-[#4A2617] hover:bg-[#FFD700] rounded-full transition-colors">-</button>
                                    <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.size, 1)} className="w-6 h-6 flex items-center justify-center font-black text-[#4A2617] hover:bg-[#FFD700] rounded-full transition-colors">+</button>
                                 </div>
                                 <p className="font-black text-[#4A2617] text-sm">₹{(Number(item.price) * item.quantity).toFixed(2)}</p>
                              </div>
                           </div>
                           <button onClick={() => removeFromCart(item.id, item.size)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))
                   )}
                </div>
                <div className="p-8 border-t border-slate-100 space-y-4 bg-slate-50/50">
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Grand Total</span>
                      <span className="text-2xl font-black text-[#4A2617] tracking-tighter">₹{cartTotal.toFixed(2)}</span>
                   </div>
                   <button onClick={() => router.push('/checkout')} disabled={cart.length === 0} className="w-full py-5 bg-[#4A2617] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:bg-slate-200 disabled:cursor-not-allowed">Proceed to Checkout</button>
                   <button onClick={handleWhatsAppCheckout} disabled={cart.length === 0} className="w-full py-4 border-2 border-[#25D366] text-[#25D366] rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#25D366] hover:text-white transition-all text-xs disabled:border-slate-200 disabled:text-slate-300"><MessageCircle className="w-4 h-4" /> WhatsApp Order</button>
                </div>
             </motion.div>
           </>
        )}
      </AnimatePresence>

      <main className="py-12">
        {isLoadingProducts ? (
           <div className="min-h-[600px] flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#4A2617]">Harvesting Freshness...</p>
           </div>
        ) : (
           <div className="space-y-24">
              {products.map((product, idx) => {
                 const isEven = idx % 2 === 0;
                 const variants = product.variants || [
                    { size: '250g', price: product.price },
                    { size: '500g', price: Math.floor(product.price * 1.8) },
                    { size: '1kg', price: Math.floor(product.price * 3.5) }
                 ];
                 const benefits = product.benefits || ['Rich in Nutrients', 'Traditional Recipe', 'Natural Preservatives'];
                 const selectedSize = selectedVariants[product.id] || variants[0].size;
                 const currentPrice = variants.find((v: any) => v.size === selectedSize)?.price || product.price;
                 const quantity = productQuantities[product.id] || 1;

                 return (
                    <section key={product.id} className="max-w-6xl mx-auto px-6">
                       <div className={cn("flex flex-col md:flex-row gap-16 items-start", !isEven && "md:flex-row-reverse")}>
                          {/* PRODUCT IMAGE */}
                          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full md:w-5/12 aspect-[4/5] rounded-[60px] overflow-hidden shadow-2xl border-8 border-white group relative">
                             <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={product.name} />
                             <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white">
                                <span className="text-[10px] font-black text-[#4A2617] uppercase tracking-widest">Pure Organic</span>
                             </div>
                          </motion.div>

                          {/* PRODUCT CONTENT */}
                          <div className="w-full md:w-7/12 space-y-8">
                             <div>
                                <h2 className="text-4xl font-serif italic text-[#4A2617] font-black leading-tight">
                                   {product.telugu_name || 'ప్రకృతి స్వచ్ఛత'}
                                </h2>
                                <h3 className="text-5xl font-black text-[#4A2617] tracking-tighter mt-2 leading-none uppercase">
                                   {product.name}
                                </h3>
                                <p className="text-slate-500 font-medium text-lg mt-8 leading-relaxed max-w-xl">
                                   {product.description || 'Authentic organic product sourced from the heart of local farms. Pure, untouched, and traditionally processed with maximum hygiene.'}
                                </p>
                             </div>

                             {/* BENEFITS GRID */}
                             <div className="space-y-5">
                                <h4 className="text-[#4A2617] text-xs font-black uppercase tracking-widest opacity-60 italic">Key Benefits:</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
                                   {benefits.map((benefit: string, bidx: number) => (
                                      <div key={bidx} className="flex items-center gap-3">
                                         <div className="w-2 h-2 bg-[#FFD700] rounded-full shadow-sm" />
                                         <span className="text-sm font-black text-[#4A2617] uppercase tracking-tight">{benefit}</span>
                                      </div>
                                   ))}
                                </div>
                             </div>

                             {/* SIZE PICKER */}
                             <div className="space-y-5">
                                <h4 className="text-[#4A2617] text-xs font-black uppercase tracking-widest opacity-60 italic">Select Size:</h4>
                                <div className="flex flex-wrap gap-4">
                                   {variants.map((v: any) => (
                                      <button 
                                        key={v.size} 
                                        onClick={() => handleVariantSelect(product.id, v.size)}
                                        className={cn(
                                          "flex flex-col items-center justify-center p-6 rounded-[32px] border-2 transition-all min-w-[130px] relative overflow-hidden group/size",
                                          selectedSize === v.size 
                                            ? "bg-[#FFFCEC] border-[#FFD700] ring-8 ring-[#FFD700]/5 shadow-xl scale-105" 
                                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                                        )}
                                      >
                                         <span className="text-sm font-black text-[#4A2617] uppercase tracking-tighter">{v.size}</span>
                                         <span className="text-[11px] font-extrabold mt-1.5 opacity-60">₹{v.price}</span>
                                         {selectedSize === v.size && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#FFD700] rounded-full" />}
                                      </button>
                                   ))}
                                </div>
                             </div>

                             {/* QUANTITY & ACTIONS */}
                             <div className="flex flex-col sm:flex-row items-stretch gap-6 pt-6">
                                <div className="flex items-center justify-between p-2.5 bg-[#F6FBF3] border border-[#E4F0DE] rounded-full min-w-[220px]">
                                   <button 
                                      onClick={() => updateProductQty(product.id, -1)}
                                      className="w-14 h-14 bg-white text-[#4A2617] rounded-full shadow-sm flex items-center justify-center text-3xl font-black hover:bg-emerald-50 transition-all active:scale-90 border border-slate-100"
                                   >
                                      -
                                   </button>
                                   <div className="flex flex-col items-center">
                                      <span className="text-3xl font-black text-[#4A2617] font-serif leading-none">{quantity}</span>
                                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#4A2617]/40 mt-1">QTY</span>
                                   </div>
                                   <button 
                                      onClick={() => updateProductQty(product.id, 1)}
                                      className="w-14 h-14 bg-white text-[#4A2617] rounded-full shadow-sm flex items-center justify-center text-3xl font-black hover:bg-emerald-50 transition-all active:scale-90 border border-slate-100"
                                   >
                                      +
                                   </button>
                                </div>

                                <button 
                                  onClick={() => addToCart({ ...product, price: currentPrice, size: selectedSize, quantity })}
                                  className="flex-1 py-5 bg-[#4A2617] text-white rounded-[40px] text-lg font-black uppercase tracking-widest shadow-2xl shadow-orange-950/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group/btn"
                                >
                                   <Plus className="w-6 h-6 group-hover/btn:rotate-90 transition-transform" /> Add to Cart
                                </button>
                             </div>
                          </div>
                       </div>
                    </section>
                 );
              })}
           </div>
        )}
      </main>

      <footer className="bg-[#4A2617] text-white py-24 rounded-t-[100px] mt-24">
         <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-20">
            <div className="space-y-10">
               <div className="bg-white border-2 border-[#FFD700] px-10 py-5 rounded-3xl rotate-[-2deg] inline-block shadow-2xl">
                  <span className="block text-[14px] font-black text-[#4A2617] uppercase tracking-tighter leading-none">THE</span>
                  <span className="block text-4xl font-black text-[#4A2617] tracking-tighter leading-tight">NATUREPURE</span>
                  <span className="block text-[10px] font-bold text-[#4A2617] text-center opacity-70 tracking-[0.5em] mt-2 italic uppercase">Est. 2026</span>
               </div>
               <p className="text-orange-50 font-medium text-xl leading-relaxed max-w-md opacity-90 italic">"Delivering the sacred purity of ancient Indian farming directly to your home. 100% Organic. 0% Compromise."</p>
               <div className="flex gap-8">
                  {['Instagram', 'WhatsApp', 'YouTube'].map(s => (
                    <a key={s} href="#" className="text-xs font-black uppercase tracking-[0.3em] hover:text-[#FFD700] transition-colors border-b border-transparent hover:border-[#FFD700] pb-1 font-sans">{s}</a>
                  ))}
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-12">
               <div className="space-y-8">
                  <h4 className="text-[#FFD700] text-xs font-black uppercase tracking-[0.2em] italic">Quick Links</h4>
                  <div className="flex flex-col gap-5 text-sm font-bold opacity-70">
                     <a href="#" className="hover:opacity-100 hover:text-[#FFD700] transition-all">Collections</a>
                     <a href="#" className="hover:opacity-100 hover:text-[#FFD700] transition-all">Our Story</a>
                     <a href="#" className="hover:opacity-100 hover:text-[#FFD700] transition-all">Store Locator</a>
                     <a href="#" className="hover:opacity-100 hover:text-[#FFD700] transition-all">Lab Tests</a>
                  </div>
               </div>
               <div className="space-y-8">
                  <h4 className="text-[#FFD700] text-xs font-black uppercase tracking-[0.2em] italic">Headquarters</h4>
                  <div className="flex flex-col gap-5 text-sm font-bold opacity-70">
                     <p>Nellore, Andhra Pradesh</p>
                     <p className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-emerald-400" /> +91 94924 56488</p>
                     <p className="truncate">support@naturepure.ooo</p>
                  </div>
               </div>
            </div>
         </div>
         <div className="max-w-6xl mx-auto px-6 mt-20 pt-10 border-t border-white/5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">&copy; 2026 The NaturePure Organic. All Crafted with Integrity.</p>
         </div>
      </footer>
    </div>
  );
}
