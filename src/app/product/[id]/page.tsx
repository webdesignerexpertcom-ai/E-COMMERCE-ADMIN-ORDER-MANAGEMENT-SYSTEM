'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Heart,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  Leaf,
  Plus,
  Minus,
  Share2,
  CheckCircle2,
  Package,
  Clock,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Variant {
  size: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  telugu_name?: string;
  description?: string;
  price: number;
  image: string;
  category?: string;
  stock?: number;
  variants?: Variant[];
  benefits?: string[];
}

interface CartItem extends Product {
  quantity: number;
  size?: string;
}

// Toast component
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-[#4A2617] text-white px-6 py-4 rounded-2xl shadow-2xl border border-[#FFD700]/20"
    >
      <CheckCircle2 className="w-5 h-5 text-[#FFD700] shrink-0" />
      <span className="font-black text-sm uppercase tracking-widest">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// Star rating
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'w-4 h-4',
            star <= Math.floor(rating)
              ? 'fill-[#FFD700] text-[#FFD700]'
              : star - 0.5 <= rating
              ? 'fill-[#FFD700]/50 text-[#FFD700]'
              : 'fill-transparent text-slate-300'
          )}
        />
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toast, setToast] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Fetch product
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          const found = data.data.find(
            (p: { _id?: string; id?: string }) => (p._id || p.id) === productId
          );
          if (found) {
            const mapped: Product = {
              ...found,
              id: found._id || found.id,
            };
            setProduct(mapped);
            const defaultVariant = (mapped.variants?.[0]?.size) || '250g';
            setSelectedSize(defaultVariant);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();

    // Cart count from localStorage
    try {
      const saved = localStorage.getItem('naturepure_cart');
      if (saved) {
        const items: CartItem[] = JSON.parse(saved);
        setCartCount(items.reduce((s, i) => s + (i.quantity || 1), 0));
      }
    } catch {}
  }, [productId]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  const currentPrice = (() => {
    if (!product) return 0;
    const variants: Variant[] = product.variants || [
      { size: '250g', price: product.price },
      { size: '500g', price: Math.floor(product.price * 1.8) },
      { size: '1kg', price: Math.floor(product.price * 3.5) },
    ];
    return variants.find((v) => v.size === selectedSize)?.price ?? product.price;
  })();

  const variants: Variant[] = product
    ? product.variants || [
        { size: '250g', price: product.price },
        { size: '500g', price: Math.floor(product.price * 1.8) },
        { size: '1kg', price: Math.floor(product.price * 3.5) },
      ]
    : [];

  const benefits: string[] = product?.benefits || [
    'Rich in Vitamin C',
    'Aids Digestion',
    'Traditional Recipe',
    'No Preservatives',
    'Farm Fresh',
    'Lab Tested',
  ];

  const stockLevel = product?.stock ?? 42;
  const isLowStock = stockLevel > 0 && stockLevel <= 10;
  const isOutOfStock = stockLevel === 0;
  const rating = 4.5;
  const reviewCount = 128;

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    try {
      const saved = localStorage.getItem('naturepure_cart');
      const cart: CartItem[] = saved ? JSON.parse(saved) : [];
      const idx = cart.findIndex(
        (i) => i.id === product.id && i.size === selectedSize
      );
      if (idx > -1) {
        cart[idx].quantity = (cart[idx].quantity || 1) + quantity;
      } else {
        cart.push({ ...product, price: currentPrice, size: selectedSize, quantity });
      }
      localStorage.setItem('naturepure_cart', JSON.stringify(cart));
      setCartCount(cart.reduce((s, i) => s + (i.quantity || 1), 0));
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 600);
      showToast('Added to cart!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted((p) => !p);
    showToast(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist ❤️');
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: product?.name, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCF6] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#4A2617]">
          Loading...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDFCF6] flex flex-col items-center justify-center gap-6 p-8">
        <Package className="w-16 h-16 text-[#4A2617]/30" />
        <p className="font-black text-2xl text-[#4A2617] uppercase tracking-tight">
          Product not found
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-8 py-4 bg-[#4A2617] text-white rounded-2xl font-black uppercase tracking-widest text-sm"
        >
          Back to Store
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF6] selection:bg-[#FFD700] selection:text-[#4A2617]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#FFD700] px-5 py-4 flex items-center justify-between shadow-md">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#4A2617] font-black text-sm uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div
          className="bg-white border-2 border-[#4A2617] px-5 py-1.5 rounded-xl shadow-md cursor-pointer transform -rotate-1 hover:rotate-0 transition-transform"
          onClick={() => router.push('/')}
        >
          <span className="block text-[9px] font-black text-[#4A2617] uppercase tracking-tighter leading-none">
            THE
          </span>
          <span className="block text-lg font-black text-[#4A2617] tracking-tighter leading-tight">
            NATUREPURE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="p-2.5 text-[#4A2617] hover:bg-white/30 rounded-full transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push('/')}
            className="relative p-2.5 text-[#4A2617] hover:scale-110 transition-transform"
          >
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-[#4A2617] text-[#FFD700] text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#FFD700]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* LEFT: IMAGE */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl border-8 border-white group"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className="bg-white/95 backdrop-blur-sm text-[#4A2617] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-md border border-white">
                  Pure Organic
                </span>
                {isLowStock && (
                  <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-md animate-pulse">
                    Only {stockLevel} left!
                  </span>
                )}
              </div>

              {/* Wishlist overlay button */}
              <button
                onClick={handleWishlist}
                className={cn(
                  'absolute top-6 right-6 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90',
                  isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-500'
                )}
              >
                <Heart className={cn('w-6 h-6', isWishlisted && 'fill-white')} />
              </button>
            </motion.div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Leaf, label: '100% Natural' },
                { icon: Shield, label: 'Lab Tested' },
                { icon: Truck, label: 'Fast Delivery' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 bg-white rounded-3xl p-4 shadow-sm border border-slate-100"
                >
                  <div className="w-8 h-8 bg-[#FFFCEC] rounded-xl flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#4A2617]" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#4A2617] text-center leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-8 pb-32 lg:pb-0"
          >
            {/* Category */}
            {product.category && (
              <span className="inline-block bg-[#FFFCEC] border border-[#FFD700]/50 text-[#4A2617] text-[10px] font-black uppercase tracking-[0.25em] px-4 py-2 rounded-full">
                {product.category}
              </span>
            )}

            {/* Title */}
            <div>
              {product.telugu_name && (
                <p className="text-2xl font-serif italic text-[#4A2617]/70 mb-1 font-bold">
                  {product.telugu_name}
                </p>
              )}
              <h1 className="text-4xl sm:text-5xl font-black text-[#4A2617] tracking-tighter leading-none uppercase">
                {product.name}
              </h1>
            </div>

            {/* Rating + Delivery row */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <StarRating rating={rating} />
                <span className="text-sm font-black text-[#4A2617]">{rating}</span>
                <span className="text-xs font-bold text-slate-400">({reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">
                  Delivery in 2 days
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-500 font-medium text-base leading-relaxed">
              {product.description ||
                'Authentic organic product sourced from the heart of local farms. Pure, untouched, and traditionally processed with maximum hygiene.'}
            </p>

            {/* Benefits */}
            <div className="space-y-4">
              <h3 className="text-[#4A2617] text-[10px] font-black uppercase tracking-[0.25em] opacity-50 italic">
                Key Benefits:
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {benefits.map((b) => (
                  <div key={b} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#FFD700] rounded-full shadow-sm shrink-0" />
                    <span className="text-sm font-black text-[#4A2617] uppercase tracking-tight">
                      {b}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  isOutOfStock
                    ? 'bg-red-500'
                    : isLowStock
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-emerald-500'
                )}
              />
              <span
                className={cn(
                  'text-xs font-black uppercase tracking-widest',
                  isOutOfStock
                    ? 'text-red-500'
                    : isLowStock
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                )}
              >
                {isOutOfStock
                  ? 'Out of Stock'
                  : isLowStock
                  ? `Only ${stockLevel} units left — Hurry!`
                  : `In Stock (${stockLevel} units)`}
              </span>
            </div>

            {/* Size Selector */}
            <div className="space-y-4">
              <h3 className="text-[#4A2617] text-[10px] font-black uppercase tracking-[0.25em] opacity-50 italic">
                Select Size:
              </h3>
              <div className="flex flex-wrap gap-3">
                {variants.map((v) => (
                  <button
                    key={v.size}
                    onClick={() => setSelectedSize(v.size)}
                    className={cn(
                      'flex flex-col items-center justify-center px-6 py-4 rounded-[24px] border-2 transition-all min-w-[110px] relative',
                      selectedSize === v.size
                        ? 'bg-[#FFFCEC] border-[#FFD700] ring-4 ring-[#FFD700]/20 shadow-lg scale-105'
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                    )}
                  >
                    <span className="text-sm font-black text-[#4A2617] uppercase tracking-tight">
                      {v.size}
                    </span>
                    <span className="text-[11px] font-extrabold mt-1 text-[#4A2617] opacity-70">
                      ₹{v.price}
                    </span>
                    {selectedSize === v.size && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-[#FFD700] rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price + Quantity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Price */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#4A2617]/50 mb-1">
                  Total Price
                </p>
                <motion.p
                  key={currentPrice * quantity}
                  initial={{ scale: 0.9, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-black text-[#4A2617] tracking-tighter"
                >
                  ₹{(currentPrice * quantity).toLocaleString('en-IN')}
                </motion.p>
                {quantity > 1 && (
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    ₹{currentPrice} × {quantity}
                  </p>
                )}
              </div>

              {/* Quantity stepper */}
              <div className="flex items-center p-2 bg-[#F6FBF3] border border-[#E4F0DE] rounded-full">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-12 h-12 bg-white text-[#4A2617] rounded-full shadow-sm flex items-center justify-center hover:bg-red-50 transition-all active:scale-90 border border-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center px-5">
                  <span className="text-2xl font-black text-[#4A2617] font-serif leading-none">
                    {quantity}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#4A2617]/40 mt-0.5">
                    QTY
                  </span>
                </div>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={isOutOfStock}
                  className="w-12 h-12 bg-white text-[#4A2617] rounded-full shadow-sm flex items-center justify-center hover:bg-emerald-50 transition-all active:scale-90 border border-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart — Desktop */}
            <div className="hidden lg:flex gap-4">
              <button
                onClick={handleWishlist}
                className={cn(
                  'w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all active:scale-90 shrink-0',
                  isWishlisted
                    ? 'bg-red-50 border-red-300 text-red-500'
                    : 'bg-white border-slate-100 text-slate-400 hover:border-red-200 hover:text-red-400'
                )}
              >
                <Heart className={cn('w-6 h-6', isWishlisted && 'fill-red-500')} />
              </button>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={cn(
                  'flex-1 py-5 rounded-[40px] text-base font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]',
                  isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : addedAnimation
                    ? 'bg-emerald-500 text-white scale-[1.02]'
                    : 'bg-[#4A2617] text-white hover:scale-[1.02] shadow-orange-950/25'
                )}
              >
                {addedAnimation ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Added!
                  </>
                ) : isOutOfStock ? (
                  'Out of Stock'
                ) : (
                  <>
                    <Plus className="w-5 h-5" /> Add to Cart
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* STICKY BOTTOM BAR — Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden bg-white border-t border-slate-100 shadow-2xl">
        <div className="flex items-center gap-4 p-4 max-w-lg mx-auto">
          <div className="flex-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#4A2617]/50">
              Total
            </p>
            <motion.p
              key={currentPrice * quantity}
              initial={{ y: 4, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl font-black text-[#4A2617] tracking-tighter leading-tight"
            >
              ₹{(currentPrice * quantity).toLocaleString('en-IN')}
            </motion.p>
          </div>

          <button
            onClick={handleWishlist}
            className={cn(
              'w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all active:scale-90 shrink-0',
              isWishlisted
                ? 'bg-red-50 border-red-300 text-red-500'
                : 'bg-slate-50 border-slate-100 text-slate-400'
            )}
          >
            <Heart className={cn('w-5 h-5', isWishlisted && 'fill-red-500')} />
          </button>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={cn(
              'flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 flex items-center justify-center gap-2',
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : addedAnimation
                ? 'bg-emerald-500 text-white'
                : 'bg-[#4A2617] text-white shadow-lg shadow-orange-950/20'
            )}
          >
            {addedAnimation ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Added!
              </>
            ) : isOutOfStock ? (
              'Out of Stock'
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {/* TOAST */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast('')} />}
      </AnimatePresence>
    </div>
  );
}
