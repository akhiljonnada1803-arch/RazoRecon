'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Tag, 
  Check,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { RazorpayMultiCheckoutModal } from '@/components/commerce/RazorpayMultiCheckoutModal';

export default function CustomerCartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);

  // Demo Cart items
  const [items, setItems] = useState([
    {
      id: 'prod_13bd8715df',
      name: 'Razorpay Smart POS Terminal V3 Pro',
      price: 14999,
      quantity: 1,
      image_url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=500&auto=format&fit=crop&q=60',
      category: 'Fintech Hardware',
    },
    {
      id: 'prod_4g_soundbox',
      name: 'Razorpay 4G Soundbox with Dynamic QR Display',
      price: 2499,
      quantity: 2,
      image_url: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&auto=format&fit=crop&q=60',
      category: 'Soundboxes',
    }
  ]);

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const gst_included = Math.round(subtotal - subtotal / 1.18);
  const total = subtotal - discount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon.toUpperCase() === 'RAZOR2026') {
      setCouponApplied(true);
    }
  };

  const handleProceedCheckout = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }

    try {
      const res: any = await apiClient.post('/commerce/checkout', {
        cart: {
          items: items.map(i => ({
            product_id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image_url: i.image_url,
          })),
          subtotal,
          items_total: subtotal,
          gst_included,
          total,
          discount,
          delivery_fee: 0,
          platform_fee: 0,
          coupon_applied: couponApplied ? 'RAZOR2026' : null,
        }
      });
      setCheckoutResult(res);
      setIsCheckoutOpen(true);
    } catch (e) {
      console.error('Checkout error:', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-[#0B72E7] flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">Shopping Cart</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#072654] tracking-tight">
          Your Shopping Cart ({items.reduce((a, b) => a + b.quantity, 0)} items)
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0B72E7] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Your cart is currently empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore our verified catalog of POS hardware, Soundboxes, and enterprise software.
          </p>
          <Link href="/products">
            <Button className="bg-[#0B72E7] text-white rounded-xl text-xs font-bold px-6">
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div 
                key={item.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0 p-2">
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {item.name}
                    </h4>
                    <div className="text-xs font-bold text-[#0B72E7] flex items-center gap-2">
                      <span>₹{item.price.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Inclusive of GST</span>
                    </div>
                  </div>
                </div>

                {/* Quantity & Delete */}
                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="px-2.5 py-1 text-slate-500 hover:bg-slate-200 text-xs font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-800 font-mono">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-2.5 py-1 text-slate-500 hover:bg-slate-200 text-xs font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5 sticky top-24">
            <h3 className="font-extrabold text-base text-[#072654] border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            {/* Coupon input */}
            <form onSubmit={handleApplyCoupon} className="space-y-1.5">
              <div className="flex gap-2">
                <Input
                  placeholder="Promo Code (RAZOR2026)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="h-9 text-xs font-mono uppercase rounded-xl"
                />
                <Button type="submit" variant="outline" className="h-9 text-xs font-bold rounded-xl px-3">
                  Apply
                </Button>
              </div>
              {couponApplied && (
                <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>10% Instant Discount Applied!</span>
                </div>
              )}
            </form>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Total (GST-inclusive)</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-emerald-600 font-mono">FREE</span>
              </div>

              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span className="font-bold text-emerald-600 font-mono">FREE</span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-[#072654]">Final Payable Amount</span>
                <span className="text-xl font-black text-[#0B72E7] font-mono">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 text-[10px] text-emerald-800 font-medium flex items-center gap-1.5 border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Includes ₹{gst_included.toLocaleString('en-IN')} GST • No surprise tax at checkout</span>
              </div>
            </div>

            <Button 
              onClick={handleProceedCheckout}
              className="w-full h-11 bg-[#0B72E7] hover:bg-blue-600 text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center gap-2"
            >
              <span>Proceed to Razorpay Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Razorpay Multi Checkout Modal */}
      <RazorpayMultiCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        result={checkoutResult}
      />
    </div>
  );
}
