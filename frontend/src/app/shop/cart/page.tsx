'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  ArrowRight, 
  Sparkles, 
  Tag, 
  ShieldCheck, 
  ArrowLeft 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function CartPage() {
  // Demo cart items
  const [cartItems, setCartItems] = useState([
    {
      id: 'POS-AND-01',
      name: 'Razorpay Smart POS Terminal Pro V3',
      category: 'Payment Terminals',
      price: 12999.0,
      quantity: 2,
      image_url: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: 'ACC-POS-01',
      name: 'High-Grade BPA-Free Thermal Paper Rolls (50-pack)',
      category: 'Retail Peripherals',
      price: 1499.0,
      quantity: 2,
      image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60'
    }
  ]);

  const [couponCode, setCouponCode] = useState('RAZOR2026');
  const [appliedDiscountPct, setAppliedDiscountPct] = useState(10); // 10%

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(cartItems.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const discount = Math.round(subtotal * (appliedDiscountPct / 100));
  const tax = Math.round((subtotal - discount) * 0.18);
  const total = subtotal - discount + tax;

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Procurement Shopping Cart</h1>
            <p className="text-xs text-slate-500">{cartItems.length} unique items in active basket</p>
          </div>
        </div>

        <Link href="/shop">
          <Button variant="ghost" size="sm" className="text-xs text-slate-600 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Continue Shopping
          </Button>
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
          <ShoppingCart className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">Your shopping cart is empty</h3>
          <p className="text-xs text-slate-500">Explore our catalog or ask the AI Commerce Agent for recommendations.</p>
          <Link href="/shop">
            <Button size="sm" className="bg-[#0B72E7] text-white rounded-xl text-xs font-bold mt-2">
              Browse Catalog
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Cart Items List - 7 cols */}
          <div className="lg:col-span-7 space-y-3">
            {cartItems.map((it) => (
              <div
                key={it.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={it.image_url}
                    alt={it.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-100"
                  />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      {it.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{it.name}</h4>
                    <span className="font-bold text-[#0B72E7] font-mono text-xs block">
                      ₹{it.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      onClick={() => updateQuantity(it.id, -1)}
                      className="h-6 w-6 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 shadow-2xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-xs font-bold font-mono text-slate-900">
                      {it.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(it.id, 1)}
                      className="h-6 w-6 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 shadow-2xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(it.id)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Box - 5 cols */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            {/* Coupon Code Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Promo Code / Discount Voucher
              </label>
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter code..."
                  className="rounded-xl font-mono text-xs uppercase"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAppliedDiscountPct(10)}
                  className="rounded-xl text-xs font-bold text-[#0B72E7] border-blue-200 bg-blue-50"
                >
                  Apply
                </Button>
              </div>
              {appliedDiscountPct > 0 && (
                <span className="text-[10px] font-semibold text-emerald-600 block">
                  ✓ Code RAZOR2026 applied (10% instant savings)
                </span>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs font-mono pt-2 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount (10%)</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>18% GST (ITC Eligible)</span>
                <span>+₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-extrabold text-base pt-2 border-t border-slate-200">
                <span>Final Amount</span>
                <span className="text-[#0B72E7]">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Link href="/shop/checkout" className="block pt-2">
              <Button className="w-full rounded-2xl bg-[#0B72E7] hover:bg-blue-600 text-white font-bold text-xs py-5 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2">
                <span>Proceed to Razorpay Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
