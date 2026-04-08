'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, ShieldCheck, Search, Leaf, Truck, Shield, Menu, X, Star, MessageCircle, Trash2, Heart, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const categories = [
  { name: 'Pure Honey', items: '12 Items', icon: '🍯', border: 'border-[#FCD34D]', bg: 'bg-[#FFFBEB]', hover: 'hover:border-[#F59E0B] hover:shadow-[#FCD34D]/20' },
  { name: 'Cold-Pressed Oils', items: '8 Items', icon: '🌿', border: 'border-[#6EE7B7]', bg: 'bg-[#ECFDF5]', hover: 'hover:border-[#10B981] hover:shadow-[#6EE7B7]/20' },
  { name: 'Premium Dry Fruits', items: '24 Items', icon: '🌰', border: 'border-[#FDBA74]', bg: 'bg-[#FFF7ED]', hover: 'hover:border-[#F97316] hover:shadow-[#FDBA74]/20' },
  { name: 'Organic Seeds', items: '15 Items', icon: '🌱', border: 'border-[#D6D3D1]', bg: 'bg-[#FAFAFA]', hover: 'hover:border-[#78716C] hover:shadow-[#D6D3D1]/20' },
];

// The featuredProducts are now fetched dynamically from the database.

export default function ProEcoStorefront() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  
  const [products, setProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setIsDemoMode(data.isDemo || false);
        const mapped = data.data.map((p: any) => ({
          ...p,
          id: p._id || p.id
        }));
        setProducts(mapped.slice(0, 8));
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Load cart from localStorage
    const savedCart = localStorage.getItem('naturepure_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // REAL-TIME SYNC: Listen for database changes
    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        console.log('Real-time update received:', payload);
        fetchProducts(); // Refresh the list when anything changes
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('naturepure_cart', JSON.stringify(cart));
  }, [cart]);


  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = (item.quantity || 1) + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    const orderDetails = cart.map(item => `- ${item.name} (₹${item.price.toFixed(2)})`).join('%0A');
    const message = `Hello NaturePure! I would like to place an order:%0A%0A${orderDetails}%0A%0ATotal: ₹${cartTotal.toFixed(2)}%0A%0APlease let me know the next steps!`;
    window.open(`https://wa.me/919492456488?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden relative">
      
      {/* Background Graphic Noise (Premium Feel) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] mix-blend-multiply z-[100]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

      {/* Dynamic Glassmorphic Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
           <>
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               transition={{ duration: 0.4 }}
               onClick={() => setIsCartOpen(false)}
               className="fixed inset-0 bg-slate-900/10 backdrop-blur-md z-[110]"
             />
             <motion.div 
               initial={{ x: '100%', opacity: 0.5 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0.5 }} 
               transition={{ type: 'spring', damping: 28, stiffness: 200 }}
               className="fixed top-0 right-0 h-full w-[440px] max-w-[95vw] bg-white/80 backdrop-blur-3xl z-[120] shadow-[0_0_80px_rgba(0,0,0,0.1)] border-l border-white flex flex-col"
             >
               <div className="p-8 border-b border-slate-200/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner border border-emerald-100/50">
                        <ShoppingBag className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Order Summary</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{totalItems} Items Total</p>
                     </div>
                  </div>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95 group">
                     <X className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-4 px-6">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                       <ShoppingBag className="w-20 h-20 mx-auto mb-6 text-slate-200" />
                       <p className="font-bold text-slate-600 text-lg">Your basket is empty.</p>
                       <p className="font-medium text-slate-400 text-sm mt-2">Discover our organic collections.</p>
                    </div>
                  ) : (
                     cart.map((item, i) => (
                       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={item.id} className="flex gap-4 p-5 bg-white border border-slate-100 rounded-[28px] items-center relative group shadow-sm hover:shadow-md transition-all">
                          <div className="w-20 h-20 rounded-[18px] overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="font-bold text-slate-900 text-sm truncate uppercase tracking-tight">{item.name}</h4>
                             <p className="text-emerald-600 font-black text-lg mt-0.5">₹{(item.price * (item.quantity || 1)).toFixed(2)}</p>
                             
                             <div className="flex items-center gap-3 mt-3">
                                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-full p-1 shadow-inner">
                                   <button 
                                     onClick={() => updateQuantity(item.id, -1)}
                                     className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 transition-all font-black text-lg active:scale-95"
                                   >
                                     −
                                   </button>
                                   <span className="w-8 text-center text-xs font-black text-slate-900">{(item.quantity || 1)}</span>
                                   <button 
                                     onClick={() => updateQuantity(item.id, 1)}
                                     className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 transition-all font-black text-lg active:scale-95"
                                   >
                                     +
                                   </button>
                                </div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Qty</span>
                             </div>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all group-hover:opacity-100 opacity-0 active:scale-95">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </motion.div>
                     ))
                  )}
               </div>

               <div className="p-8 border-t border-white bg-white/50 backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between mb-2">
                     <span className="font-bold text-slate-500 uppercase tracking-widest text-xs">Total Amount</span>
                     <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                       onClick={handleWhatsAppCheckout}
                       disabled={cart.length === 0}
                       className="w-full py-5 bg-[#25D366] hover:bg-[#1DA851] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-[24px] font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
                    >
                       <MessageCircle className="w-5 h-5" /> 
                       WhatsApp Checkout
                    </button>
                    
                    <button 
                       onClick={() => {
                         if (cart.length === 0) return;
                         router.push('/checkout');
                       }}
                       disabled={cart.length === 0}
                       className="w-full py-5 bg-slate-900 border-2 border-slate-900 text-white hover:bg-white hover:text-slate-900 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-transparent text-white rounded-[24px] font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
                    >
                       <ShieldCheck className="w-5 h-5" /> 
                       Direct Checkout
                    </button>
                  </div>
                  <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-2 px-10">SSL Secured & Encrypted Processing Active</p>
               </div>
             </motion.div>
           </>
        )}
      </AnimatePresence>

      {/* Premium Navbar Banner */}
      <div className="bg-emerald-950 text-emerald-50 py-3 text-center text-[11px] font-black uppercase tracking-[0.2em] relative z-50">
         🌿 Free Zero-Carbon Shipping on Orders Over ₹999
      </div>

      {/* Main Navbar (Floating Glassmorphism) */}
      <div className="sticky top-6 w-full z-40 px-6 max-w-[1400px] mx-auto pointer-events-none">
        <nav className="pointer-events-auto bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[32px] px-6 h-20 flex items-center justify-between transition-all">
          
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center rounded-[14px] shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 fill-current" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-slate-800">Nature<span className="text-emerald-600">Pure.</span></span>
          </div>

          <div className="hidden lg:flex items-center gap-1 bg-slate-50/50 p-1.5 rounded-full border border-slate-100">
            {[
              { name: 'Home', href: '#home' },
              { name: 'Categories', href: '#categories' },
              { name: 'Products', href: '#products' },
              { name: 'Contact Us', href: '#contact' }
            ].map((link, idx) => (
               <a key={idx} href={link.href} className={cn("text-xs font-bold px-5 py-2.5 rounded-full transition-all tracking-wide", idx === 0 ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50')}>
                  {link.name}
               </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <div className="relative group/search">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-emerald-600 transition-colors" />
              <input type="text" placeholder="Search organic..." className="pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-full text-xs font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 w-52 transition-all placeholder:font-medium placeholder:text-slate-400" />
            </div>
            
            <button onClick={() => setIsCartOpen(true)} className="relative p-3.5 bg-white rounded-full border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-slate-600 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-95 group">
               <ShoppingBag className="w-4 h-4 group-hover:text-emerald-700" />
               <AnimatePresence>
                 {totalItems > 0 && (
                   <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-sm border-2 border-white">
                      {totalItems}
                   </motion.span>
                 )}
               </AnimatePresence>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-1" />
            <Link href="/admin/login">
              <button className="flex items-center gap-2 group/admin px-6 py-3 bg-slate-900 border-none rounded-full text-xs font-black text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Admin Login</span>
              </button>
            </Link>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 pointer-events-auto">
             {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>
      </div>

      {/* Ultra-Premium Hero Banner */}
      <section id="home" className="px-6 pt-12 pb-24 max-w-[1400px] mx-auto relative z-10 scroll-mt-32">
         <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="w-full bg-slate-900 text-white rounded-[64px] p-10 lg:p-24 relative overflow-hidden flex items-center shadow-2xl">
            {/* Immersive Organic Gradients */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/20 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3" />
            
            <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-16">
               <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 py-2 px-5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-xs font-black uppercase tracking-[0.15em] text-emerald-300 mb-8 shadow-inner">
                     <Award className="w-4 h-4" /> 100% Certified Organic
                  </div>
                  <h1 className="text-5xl lg:text-[5.5rem] font-black tracking-tighter leading-[1.05] mb-8">
                     Purity of <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500">Nature.</span><br />
                     Delivered to You.
                  </h1>
                  <p className="text-lg lg:text-xl text-slate-300 font-medium mb-10 max-w-xl leading-relaxed">
                     Experience uncompromised quality with our farm-fresh honey, cold-pressed artisanal oils, and handpicked organic seeds.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                     <button className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3">
                        Shop Collection <ArrowRight className="w-5 h-5" />
                     </button>
                     <button className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 backdrop-blur-sm text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center">
                        Our Farm Story
                     </button>
                  </div>
               </div>

               {/* Hero Visuals - Floating Quality Card */}
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, rotate: -5 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
                 className="hidden lg:flex w-[380px] bg-white/5 backdrop-blur-2xl border border-white/20 p-8 rounded-[48px] shadow-2xl flex-col gap-6 transform lg:-translate-y-6"
               >
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[20px] flex items-center justify-center shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Quality Assured</h3>
                    <p className="text-slate-300 text-sm font-medium leading-relaxed">Every product undergoes rigorous 15-point lab testing to ensure maximum purity and nutritional retention.</p>
                  </div>
                  <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                     <div className="flex -space-x-4">
                        {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700/50 overflow-hidden"><img src={`https://i.pravatar.cc/100?img=${i}`} alt="user" className="w-full h-full object-cover opacity-80"/></div>)}
                     </div>
                     <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full">10k+ Customers</p>
                  </div>
               </motion.div>
            </div>
         </motion.div>
      </section>

      {/* Pro Category Hub */}
      <section id="categories" className="py-24 px-6 max-w-[1400px] mx-auto scroll-mt-24">
         <div className="flex flex-col items-center text-center mb-16">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 mb-4 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">Curation</span>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">Explore Categories</h2>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, i) => (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} 
                 key={cat.name} 
                 className={cn("relative p-10 rounded-[48px] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 border-2 overflow-hidden group shadow-sm", cat.bg, cat.border, cat.hover)}
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-500" />
                  <span className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3 relative z-10">{cat.name}</h3>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-white shadow-sm px-4 py-2 rounded-full relative z-10">{cat.items}</span>
               </motion.div>
            ))}
         </div>
      </section>

      {/* PRO Featured Products Grid */}
      <section id="products" className="py-32 px-6 bg-white border-t border-slate-100 scroll-mt-10">
         <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
               <div>
                  <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-4">Trending Harvest</h2>
                  <p className="text-slate-500 font-medium text-lg max-w-lg">Hand-selected goods from this season's finest yields. Highly rated by our community.</p>
               </div>
               <button className="flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all pb-2 border-b-2 border-emerald-600/30 hover:border-emerald-600">
                  Explore Full Catalog <ArrowRight className="w-4 h-4" />
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
               {isLoadingProducts && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-4 flex items-center justify-center p-20">
                     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                  </div>
               )}
               {!isLoadingProducts && products.map((product, i) => (
                  <motion.div 
                     initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} 
                     key={product.id} 
                     onMouseEnter={() => setHoveredProduct(product.id)}
                     onMouseLeave={() => setHoveredProduct(null)}
                     className="group cursor-pointer"
                  >
                     <div className="relative w-full aspect-[4/5] rounded-[40px] overflow-hidden mb-6 shadow-sm group-hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)] transition-shadow duration-500 bg-slate-50 border border-slate-100">
                        {/* High-Res Image with Slow Zoom */}
                        <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover scale-[1.02] group-hover:scale-[1.08] transition-transform duration-700 ease-out" />
                        
                        {/* Premium Badges */}
                        <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
                           <span className={cn("px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl backdrop-blur-md", product.tagColor)}>
                              {product.tag}
                           </span>
                        </div>
                        
                        {/* Wishlist Heart */}
                        <div className="absolute top-5 right-5 z-20">
                           <button className="w-10 h-10 bg-white/80 backdrop-blur-md border border-white rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm transition-colors">
                              <Heart className="w-4 h-4" />
                           </button>
                        </div>

                        {/* Glassmorphic Quick Add Overlay */}
                        <div className={cn("absolute bottom-4 left-4 right-4 z-20 transition-all duration-300", hoveredProduct === product.id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
                           <button 
                             onClick={(e) => { e.stopPropagation(); addToCart(product); }} 
                             className="w-full py-4 bg-white/90 backdrop-blur-xl text-slate-900 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                           >
                             <ShoppingBag className="w-4 h-4" /> Add to Shopping Bag
                           </button>
                        </div>
                     </div>
                     
                     <div className="px-2">
                        <div className="flex items-center gap-1.5 text-amber-400 mb-3">
                           <Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" />
                           <span className="text-[11px] font-black text-slate-400 ml-1 tracking-widest">128 REVIEWS</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-1 group-hover:text-emerald-600 transition-colors">{product.name}</h3>
                        <p className="text-sm font-medium text-slate-500 mb-4 line-clamp-1">{product.desc}</p>
                        
                        <div className="flex items-center gap-3">
                           <p className="text-2xl font-black text-slate-900">₹{product.price.toFixed(2)}</p>
                           {product.oldPrice && <p className="text-sm font-bold text-slate-400 line-through">₹{product.oldPrice.toFixed(2)}</p>}
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Contact & Location Section */}
      <section id="contact" className="py-32 px-6 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800 scroll-mt-10">
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
         <div className="absolute -right-40 -top-40 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
            <div className="flex flex-col justify-center">
               <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 flex items-center gap-2">
                 <Shield className="w-4 h-4" /> Get in Touch
               </span>
               <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6">Visit Our Organic Hub in Nellore.</h2>
               <p className="text-slate-300 font-medium text-lg leading-relaxed mb-10 max-w-md">
                  We are hyper-local. Come visit our primary distribution center in Nellore, or drop us a message on WhatsApp for instant support.
               </p>
               
               <div className="space-y-6">
                  <div 
                     onClick={() => window.open('https://maps.app.goo.gl/2cqMPqKfvfV1FrJP7', '_blank')}
                     className="flex items-center gap-4 bg-white/5 p-5 rounded-[24px] border border-white/10 backdrop-blur-sm cursor-pointer hover:bg-emerald-900/40 hover:border-emerald-500/50 transition-all group shadow-sm"
                  >
                     <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-xl border border-emerald-500/30 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-emerald-400 transition-colors">Headquarters (Open in Maps)</p>
                        <p className="font-bold text-white">Nellore, Andhra Pradesh, India</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-white/5 p-5 rounded-[24px] border border-white/10 backdrop-blur-sm shadow-sm cursor-pointer hover:bg-emerald-900/40 hover:border-emerald-500/50 transition-all group" onClick={() => window.open('https://wa.me/919492456488', '_blank')}>
                     <div className="w-12 h-12 bg-[#25D366]/20 text-[#25D366] flex items-center justify-center rounded-xl border border-[#25D366]/30 group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-[#25D366] transition-colors">Direct Support HQ</p>
                        <p className="font-bold text-white">+91 9492456488</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Visual Abstract Map Container */}
            <div onClick={() => window.open('https://maps.app.goo.gl/2cqMPqKfvfV1FrJP7', '_blank')} className="w-full bg-slate-800 rounded-[48px] border border-white/10 p-4 aspect-square md:aspect-auto overflow-hidden relative shadow-2xl cursor-pointer group">
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-slate-700/50 rounded-[40px] border border-slate-600 flex items-center justify-center relative overflow-hidden group-hover:bg-emerald-900/30 transition-colors duration-500">
                     {/* Decorative Map Ring */}
                     <div className="absolute w-[150%] h-[150%] border-[40px] border-emerald-500/5 rounded-full group-hover:scale-110 transition-transform duration-700" />
                     <div className="absolute w-[100%] h-[100%] border-[2px] border-emerald-500/10 rounded-full group-hover:border-emerald-400/30 transition-colors duration-500" />
                     
                     <div className="relative z-10 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] mb-4 animate-bounce group-hover:shadow-[0_0_80px_rgba(16,185,129,0.8)] transition-shadow">
                           <Leaf className="w-8 h-8 text-emerald-600 fill-current" />
                        </div>
                        <h4 className="text-2xl font-black text-white">Nellore</h4>
                        <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs mt-2 group-hover:text-emerald-300">Click to Route Device</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Pro Footer */}
      <footer className="py-16 border-t border-slate-200 bg-[#FAFAFA]">
         <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-start lg:items-center justify-between gap-10">
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 text-white flex items-center justify-center rounded-xl shadow-lg shadow-emerald-600/20">
                    <Leaf className="w-5 h-5 fill-current" />
                  </div>
                  <span className="font-black text-2xl tracking-tighter text-slate-800">Nature<span className="text-emerald-600">Pure.</span></span>
               </div>
               <p className="text-sm font-medium text-slate-500 max-w-xs">
                  Redefining modern organic commerce with 100% natural goods harvested with love.
               </p>
            </div>
            
            <div className="flex items-center gap-8 text-sm font-bold text-slate-500">
               <Link href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link>
               <Link href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</Link>
               <Link href="#" className="hover:text-emerald-600 transition-colors">Shipping Returns</Link>
            </div>
            
            <p className="text-sm font-bold text-slate-400">
               &copy; 2026 NaturePure. All Rights Reserved.
            </p>
         </div>
      </footer>
    </div>
  );
}
