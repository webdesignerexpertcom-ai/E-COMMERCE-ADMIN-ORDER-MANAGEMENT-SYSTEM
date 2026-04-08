'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, ShieldCheck, Truck, CreditCard, 
  MapPin, Phone, Mail, User, CheckCircle2,
  Lock, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { omsFetch } from '@/lib/api';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
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
      setCart(JSON.parse(savedCart));
    } else {
      // If no cart, redirect back to landing after a delay or show message
    }
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const shipping = total > 999 ? 0 : 99;
  const grandTotal = total + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!formData.email || !formData.phone || !formData.fullName || !formData.address) {
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
          itemsCount: cart.length,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes
        })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.removeItem('naturepure_cart');
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
          <button onClick={() => router.push('/')} className="w-full py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">Back to Store</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Global Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg" />
            <span className="font-black text-xl tracking-tighter">Nature<span className="text-emerald-600">Pure.</span></span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-500" /> Secure Checkout
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
                <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-black">1</div>
                <h2 className="text-3xl font-black tracking-tight">Contact Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-4">Email Address</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="email" name="email" value={formData.email} onChange={handleInputChange}
                      placeholder="alex@example.com"
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[24px] font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-inner"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-4">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                      placeholder="+91 00000 00000"
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[24px] font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2: Shipping */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-black">2</div>
                <h2 className="text-3xl font-black tracking-tight">Shipping Details</h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-4">Full Recipient Name</label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                      placeholder="Alex Johnson"
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[24px] font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-inner"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-4">Full Delivery Address</label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 absolute left-5 top-8 text-slate-300" />
                    <textarea 
                      name="address" value={formData.address} onChange={handleInputChange}
                      placeholder="House No, Street, Landmark..."
                      className="w-full pl-14 pr-6 py-6 bg-slate-50 border border-slate-100 rounded-[32px] font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-inner min-h-[120px]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-4">City / Area</label>
                    <input 
                      type="text" name="city" value={formData.city} onChange={handleInputChange}
                      placeholder="Nellore"
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[24px] font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-4">Pincode</label>
                    <input 
                      type="text" name="pincode" value={formData.pincode} onChange={handleInputChange}
                      placeholder="524001"
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[24px] font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Step 3: Payment */}
            <section className="space-y-8 pb-12">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-black">3</div>
                <h2 className="text-3xl font-black tracking-tight">Payment Method</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'upi', label: 'UPI / PhonePe / GPay', icon: CreditCard },
                  { id: 'cod', label: 'Cash on Delivery', icon: Truck },
                ].map(method => (
                  <button 
                    key={method.id} onClick={() => setFormData({...formData, paymentMethod: method.id})}
                    className={cn("p-6 rounded-[32px] border-2 flex items-center gap-4 transition-all text-left", formData.paymentMethod === method.id ? "bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-500/5" : "bg-white border-slate-100 hover:border-slate-200")}
                  >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", formData.paymentMethod === method.id ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-400")}>
                      <method.icon className="w-6 h-6" />
                    </div>
                    <span className="font-black text-sm tracking-tight">{method.label}</span>
                  </button>
                ))}
              </div>
              <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm"><ShieldCheck className="w-5 h-5" /></div>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">Your transaction is encrypted with military-grade 256-bit AES protection. NaturePure never stores your full card details.</p>
              </div>
            </section>

          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-8">
              <div className="bg-slate-900 text-white rounded-[56px] p-10 shadow-4xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <h3 className="text-2xl font-black tracking-tight mb-8 relative z-10">Order Summary</h3>
                
                <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-6 relative z-10 pr-2">
                  {cart.length === 0 ? (
                    <p className="text-slate-400 font-bold italic">Your basket is waiting to be filled.</p>
                  ) : (
                    cart.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center group">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl overflow-hidden border border-white/5 flex-shrink-0">
                          <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate">{item.name}</h4>
                          <p className="text-emerald-400 font-black text-lg">₹{item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-10 pt-10 border-t border-white/10 space-y-4 relative z-10">
                  <div className="flex justify-between text-slate-400 font-bold text-sm">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-bold text-sm">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between items-center text-white pt-4">
                    <span className="font-black text-xl tracking-tight">Total Amount</span>
                    <span className="text-4xl font-black tracking-tighter">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  disabled={isLoading || cart.length === 0}
                  className="w-full mt-10 py-6 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 rounded-[28px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                >
                  {isLoading ? 'Processing...' : (
                    <>
                      Complete Purchase <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              <div className="px-10 flex flex-col items-center gap-4">
                <div className="flex items-center gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-opacity">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo.png" alt="UPI" className="h-4" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-3" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 text-center leading-relaxed">Taxes calculated at checkout. By placing this order, you agree to NaturePure&apos;s Terms of Service.</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
