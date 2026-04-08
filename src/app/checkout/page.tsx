'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ShieldCheck, Truck, CreditCard, 
  MapPin, Phone, Mail, User, CheckCircle2,
  Lock, ArrowRight, Minus, Plus, Trash2, Tag,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { omsFetch } from '@/lib/api';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  stock?: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    fullName: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'upi',
    notes: ''
  });

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('naturepure_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        setCart([]);
      }
    }
  }, []);

  // Update cart to localStorage
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('naturepure_cart', JSON.stringify(cart));
    }
  }, [cart]);

  const updateQuantity = (id: string, size: string | undefined, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.size === size) {
        const newQty = item.quantity + delta;
        if (newQty > 0) {
           // Optionally check stock here: if (item.stock && newQty > item.stock) return item;
           return { ...item, quantity: newQty };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (id: string, size: string | undefined) => {
    setCart(prev => {
      const newCart = prev.filter(item => !(item.id === id && item.size === size));
      if (newCart.length === 0) {
        localStorage.removeItem('naturepure_cart');
      }
      return newCart;
    });
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'WELCOME10') {
      const sub = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setDiscount(sub * 0.1); // 10% off
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid or expired promo code');
      setPromoApplied(false);
      setDiscount(0);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - discount + shipping);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!formData.email || !formData.phone || !formData.fullName || !formData.address || !formData.city || !formData.pincode) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await omsFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerName: formData.fullName,
          customerPhone: formData.phone,
          customerEmail: formData.email,
          shippingAddress: {
            street: formData.address,
            city: formData.city,
            pincode: formData.pincode
          },
          totalAmount: grandTotal,
          itemsCount: cart.reduce((acc, item) => acc + item.quantity, 0),
          paymentMethod: formData.paymentMethod,
          notes: formData.notes
        })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.removeItem('naturepure_cart');
        setCart([]);
        setStep(4); // Success step
      } else {
        alert("Order failed: " + data.error);
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[48px] p-12 max-w-lg w-full text-center shadow-2xl border border-emerald-100">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Order Confirmed!</h1>
          <p className="text-slate-500 font-medium mb-10">Thank you for choosing NaturePure. Your order is being processed and you will receive a WhatsApp confirmation shortly.</p>
          <button onClick={() => router.push('/')} className="w-full py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95">Back to Store</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF6] selection:bg-[#FFD700] selection:text-[#4A2617]">
      {/* Global Header */}
      <header className="sticky top-0 z-50 bg-[#FFD700] border-b border-[#4A2617]/10 h-20 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[#4A2617] hover:opacity-70 font-black text-sm uppercase tracking-widest transition-colors">
             <ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Back</span>
          </button>
          <div className="bg-white border-2 border-[#4A2617] px-6 py-1.5 rounded-xl shadow-md cursor-pointer transform -rotate-1 hover:rotate-0 transition-transform flex flex-col items-center" onClick={() => router.push('/')}>
            <span className="block text-[8px] font-black text-[#4A2617] uppercase tracking-tighter leading-none">THE</span>
            <span className="block text-xl font-black text-[#4A2617] tracking-tighter leading-tight">NATUREPURE</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#4A2617]">
            <Lock className="w-3.5 h-3.5 text-emerald-600" /> <span className="hidden sm:inline">Secure Checkout</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* LEFT: FORM FIELDS */}
          <div className="lg:col-span-7 space-y-16">
            
            {/* Step 1: Contact */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#4A2617] text-[#FFD700] rounded-full flex items-center justify-center font-black text-xl shadow-lg border-2 border-[#FFD700]/20">1</div>
                <h2 className="text-3xl font-black tracking-tight text-[#4A2617] uppercase">Contact Info</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4A2617]/50 pl-4">Email Address</label>
                  <div className="relative group">
                    <Mail className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FFD700] transition-colors" />
                    <input 
                      type="email" name="email" value={formData.email} onChange={handleInputChange}
                      placeholder="alex@example.com"
                      className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[24px] font-bold outline-none focus:border-[#FFD700] hover:border-slate-200 transition-all shadow-sm text-[#4A2617]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4A2617]/50 pl-4">Phone Number</label>
                  <div className="relative group">
                    <Phone className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FFD700] transition-colors" />
                    <input 
                      type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                      placeholder="+91 00000 00000"
                      className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[24px] font-bold outline-none focus:border-[#FFD700] hover:border-slate-200 transition-all shadow-sm text-[#4A2617]"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2: Shipping */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#4A2617] text-[#FFD700] rounded-full flex items-center justify-center font-black text-xl shadow-lg border-2 border-[#FFD700]/20">2</div>
                <h2 className="text-3xl font-black tracking-tight text-[#4A2617] uppercase">Shipping Details</h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4A2617]/50 pl-4">Full Name</label>
                  <div className="relative group">
                    <User className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FFD700] transition-colors" />
                    <input 
                      type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                      placeholder="Alex Johnson"
                      className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[24px] font-bold outline-none focus:border-[#FFD700] hover:border-slate-200 transition-all shadow-sm text-[#4A2617]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4A2617]/50 pl-4">Delivery Address</label>
                  <div className="relative group">
                    <MapPin className="w-5 h-5 absolute left-5 top-6 text-slate-300 group-focus-within:text-[#FFD700] transition-colors" />
                    <textarea 
                      name="address" value={formData.address} onChange={handleInputChange}
                      placeholder="House No, Street, Landmark..."
                      className="w-full pl-14 pr-6 py-6 bg-white border-2 border-slate-100 rounded-[32px] font-bold outline-none focus:border-[#FFD700] hover:border-slate-200 transition-all shadow-sm text-[#4A2617] min-h-[120px]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4A2617]/50 pl-4">City / Area</label>
                    <input 
                      type="text" name="city" value={formData.city} onChange={handleInputChange}
                      placeholder="Nellore"
                      className="w-full px-8 py-5 bg-white border-2 border-slate-100 rounded-[24px] font-bold outline-none focus:border-[#FFD700] hover:border-slate-200 transition-all shadow-sm text-[#4A2617]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4A2617]/50 pl-4">Pincode</label>
                    <input 
                      type="text" name="pincode" value={formData.pincode} onChange={handleInputChange}
                      placeholder="524001"
                      className="w-full px-8 py-5 bg-white border-2 border-slate-100 rounded-[24px] font-bold outline-none focus:border-[#FFD700] hover:border-slate-200 transition-all shadow-sm text-[#4A2617]"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Step 3: Payment */}
            <section className="space-y-8 pb-12 text-[#4A2617]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#4A2617] text-[#FFD700] rounded-full flex items-center justify-center font-black text-xl shadow-lg border-2 border-[#FFD700]/20">3</div>
                <h2 className="text-3xl font-black tracking-tight text-[#4A2617] uppercase">Payment Method</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'upi', label: 'UPI / Card', icon: CreditCard },
                  { id: 'cod', label: 'Cash on Delivery', icon: Truck },
                ].map(method => (
                  <button 
                    key={method.id} onClick={() => setFormData({...formData, paymentMethod: method.id})}
                    className={cn(
                      "p-6 rounded-[32px] border-2 flex items-center gap-4 transition-all text-left group", 
                      formData.paymentMethod === method.id 
                        ? "bg-[#FFFCEC] border-[#FFD700] shadow-xl shadow-[#FFD700]/10 scale-[1.02]" 
                        : "bg-white border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors", 
                      formData.paymentMethod === method.id ? "bg-[#FFD700] text-[#4A2617]" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                    )}>
                      <method.icon className="w-7 h-7" />
                    </div>
                    <span className="font-black text-[15px] tracking-tight uppercase">{method.label}</span>
                  </button>
                ))}
              </div>
              <div className="p-6 bg-[#EFFFF4] rounded-[32px] border border-[#25D366]/20 flex items-start gap-4">
                <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-sm shrink-0"><ShieldCheck className="w-5 h-5" /></div>
                <p className="text-xs font-bold text-emerald-900 leading-relaxed pt-1">Your transaction is encrypted with military-grade 256-bit AES protection. NaturePure never stores your full card details.</p>
              </div>
            </section>

          </div>

          {/* RIGHT: ORDER SUMMARY AND INTERACTIVE CART */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-8">
              <div className="bg-[#4A2617] text-white rounded-[48px] p-8 md:p-10 shadow-2xl relative overflow-hidden border-4 border-[#FFD700]/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
                
                <h3 className="text-3xl font-black tracking-tighter mb-8 relative z-10 text-[#FFD700] uppercase">Order Summary</h3>
                
                <div className="max-h-[350px] overflow-y-auto no-scrollbar space-y-5 relative z-10 pr-2">
                  {cart.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="text-white/50 font-bold italic">Your basket is waiting to be filled.</p>
                      <button onClick={() => router.push('/')} className="mt-4 px-6 py-2 bg-[#FFD700] text-[#4A2617] rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">Shop Now</button>
                    </div>
                  ) : (
                    cart.map((item, idx) => (
                      <div key={`${item.id}-${item.size}`} className="flex gap-4 items-center group bg-white/5 p-3 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="w-20 h-20 bg-white/10 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                          <h4 className="font-bold text-sm truncate uppercase tracking-tight leading-none mb-1">{item.name}</h4>
                          <p className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest">{item.size || 'Standard'}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="font-black text-lg">₹{item.price.toLocaleString('en-IN')}</span>
                            
                            {/* Quantity Adjuster */}
                            <div className="flex items-center bg-black/20 rounded-full px-1 border border-white/10">
                               <button onClick={() => updateQuantity(item.id, item.size, -1)} className="w-6 h-6 flex items-center justify-center font-black text-[#FFD700] hover:bg-white/10 rounded-full transition-colors"><Minus className="w-3 h-3" /></button>
                               <span className="w-6 text-center text-[10px] font-black">{item.quantity}</span>
                               <button onClick={() => updateQuantity(item.id, item.size, 1)} className="w-6 h-6 flex items-center justify-center font-black text-[#FFD700] hover:bg-white/10 rounded-full transition-colors"><Plus className="w-3 h-3" /></button>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id, item.size)} className="p-2 self-start text-white/20 hover:text-red-400 transition-colors tooltip" aria-label="Remove item">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Promo Code Section */}
                <div className="mt-8 relative z-10 space-y-4">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input 
                        type="text" 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Promo Code" 
                        className="w-full pl-10 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-sm font-bold uppercase tracking-wider text-white placeholder:text-white/30 outline-none focus:border-[#FFD700] transition-colors"
                      />
                    </div>
                    <button 
                      onClick={handleApplyPromo}
                      disabled={!promoCode}
                      className="px-6 bg-[#FFD700] text-[#4A2617] rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-red-400 text-[10px] font-black uppercase flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {promoError}</p>
                  )}
                  {promoApplied && (
                    <p className="text-emerald-400 text-[10px] font-black uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Promo Applied! 10% Discount active.</p>
                  )}
                </div>

                {/* Totals */}
                <div className="mt-6 pt-6 border-t border-white/10 space-y-3 relative z-10">
                  <div className="flex justify-between text-white/60 font-bold text-xs uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <AnimatePresence>
                    {discount > 0 && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex justify-between text-emerald-400 font-bold text-xs uppercase tracking-widest overflow-hidden">
                        <span>Discount (-)</span>
                        <span>₹{discount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="flex justify-between text-white/60 font-bold text-xs uppercase tracking-widest">
                    <span>Shipping</span>
                    <span className="text-white">{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#FFD700] pt-4 border-t border-white/10">
                    <span className="font-black text-xl tracking-tight uppercase">Total</span>
                    <span className="text-4xl font-black tracking-tighter">₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  disabled={isLoading || cart.length === 0}
                  className="w-full mt-8 py-5 bg-[#FFD700] hover:bg-white disabled:bg-white/10 disabled:text-white/30 text-[#4A2617] rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-[#4A2617] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Place Order <ArrowRight className="w-5 h-5 group-hover:translate-x-1 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              <div className="px-6 flex flex-col items-center gap-4">
                <div className="flex items-center gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-opacity justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo.png" alt="UPI" className="h-4" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-3.5" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#4A2617]/40 text-center leading-relaxed">Secured with 256-bit encryption. <br/> By placing this order, you agree to our Terms of Service.</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* MOBILE BOTTOM CHECKOUT BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-4 pb-safe flex items-center gap-4">
        <div className="flex-1 pl-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#4A2617]/50 mb-0.5">Grand Total</p>
            <p className="text-2xl font-black text-[#4A2617] leading-none">₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
        <button 
          onClick={() => {
            if (cart.length > 0) {
               window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
          }}
          disabled={cart.length === 0}
          className="flex-1 py-4 bg-[#4A2617] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all text-center disabled:opacity-50"
        >
           {cart.length === 0 ? 'Cart Empty' : 'Checkout'}
        </button>
      </div>
    </div>
  );
}
