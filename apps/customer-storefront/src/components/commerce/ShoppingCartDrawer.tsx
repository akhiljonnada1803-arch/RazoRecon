'use client';

import React, { useState } from 'react';
import { CartState, CartItem } from '@/types/commerce';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CreditCard, 
  Tag, 
  ArrowRight, 
  ShieldCheck, 
  Zap,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ShoppingCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartState;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onApplyCoupon: (code: string) => void;
  onCheckout: () => void;
  isCheckingOut?: boolean;
}

export function ShoppingCartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onApplyCoupon,
  onCheckout,
  isCheckingOut = false,
}: ShoppingCartDrawerProps) {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const code = couponInput.trim().toUpperCase();
    if (['RAZOR2026', 'RECON10', 'WELCOME20', 'FINTECH2026'].includes(code)) {
      onApplyCoupon(code);
      setCouponInput('');
      setCouponError('');
    } else {
      setCouponError('Invalid code. Try "RAZOR2026" for 10% off.');
    }
  };

  const totalItemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#072654] text-white">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-[#0B72E7]">
                <ShoppingBag className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                  Shopping Cart
                  <Badge className="bg-[#0B72E7] text-white text-[10px] px-1.5 py-0 border-0">
                    {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                  </Badge>
                </h3>
                <span className="text-[11px] text-blue-200/80">
                  Instant Razorpay Checkout & Invoicing
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 text-slate-400 space-y-3">
                <div className="h-16 w-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 text-sm">Your cart is empty</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Search or ask the Commerce Agent for payment terminals, software licenses, or accessories.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div
                    key={item.product_id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex gap-3 items-center"
                  >
                    <div className="h-16 w-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-slate-900 line-clamp-1">
                        {item.name}
                      </h5>
                      <div className="text-xs font-bold text-[#0B72E7] mt-0.5">
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden h-7">
                          <button
                            onClick={() => onUpdateQuantity(item.product_id, -1)}
                            className="px-2 h-full text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product_id, 1)}
                            className="px-2 h-full text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.product_id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer / Summary & Checkout */}
          {cart.items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50/70 space-y-4">
              {/* Promo Coupon Form */}
              <form onSubmit={handleApply} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      placeholder="Promo Code (e.g. RAZOR2026)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="h-9 pl-8 text-xs bg-white uppercase font-mono rounded-xl border-slate-200"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-xs font-bold border-slate-200 bg-white hover:bg-slate-100 rounded-xl"
                  >
                    Apply
                  </Button>
                </div>
                {cart.coupon_applied && (
                  <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Coupon '{cart.coupon_applied}' active (10% discount applied)
                  </div>
                )}
                {couponError && (
                  <div className="text-[11px] text-rose-600 font-medium">
                    {couponError}
                  </div>
                )}
              </form>

              {/* Cost Breakdown */}
              <div className="space-y-2 text-xs border-t border-slate-200 pt-3 text-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Items Total (GST Inclusive)</span>
                  <span className="font-bold text-slate-900">
                    ₹{(cart.items_total || cart.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Delivery Fee</span>
                  <span className="font-semibold text-emerald-600 font-mono">
                    {(cart.delivery_fee ?? cart.shipping) === 0 ? 'FREE' : `₹${(cart.delivery_fee ?? cart.shipping).toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Platform Fee</span>
                  <span className="font-semibold text-emerald-600 font-mono">
                    {(cart.platform_fee ?? 0) === 0 ? 'FREE' : `₹${(cart.platform_fee ?? 0).toFixed(2)}`}
                  </span>
                </div>

                {cart.discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-semibold">
                    <span>Discounts</span>
                    <span>-₹{cart.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm font-extrabold text-[#072654] border-t border-slate-200 pt-2.5">
                  <span>Final Payable Amount</span>
                  <span className="text-[#0B72E7] text-base font-extrabold font-mono">
                    ₹{cart.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[10px] text-emerald-800 font-medium flex items-center gap-1.5 mt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Includes ₹{(cart.gst_included || cart.tax_gst).toLocaleString('en-IN', { minimumFractionDigits: 2 })} GST • No surprise tax added at checkout
                  </span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <Button
                onClick={onCheckout}
                disabled={isCheckingOut}
                className="w-full h-11 bg-[#0B72E7] hover:bg-[#095bc0] text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Proceeding to Checkout...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 fill-white" />
                    <span>Proceed to Multi-Step Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>256-bit SSL encrypted • Razorpay Payment Gateway</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
