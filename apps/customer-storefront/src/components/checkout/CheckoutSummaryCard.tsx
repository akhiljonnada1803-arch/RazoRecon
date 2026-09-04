'use client';

import React, { useState } from 'react';
import { CartSummary } from '@/types/checkout';
import { 
  CreditCard, 
  Link as LinkIcon, 
  Tag, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  ReceiptText,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface CheckoutSummaryCardProps {
  summary?: CartSummary;
  onApplyCoupon: (code: string) => void;
  onProceedToCheckout: () => void;
  onGeneratePaymentLink: () => void;
  isCheckingOut: boolean;
  orderCreated: boolean;
}

export function CheckoutSummaryCard({
  summary,
  onApplyCoupon,
  onProceedToCheckout,
  onGeneratePaymentLink,
  isCheckingOut,
  orderCreated,
}: CheckoutSummaryCardProps) {
  const [couponInput, setCouponInput] = useState(summary?.discount_code || '');

  const subtotal = summary?.subtotal || 0;
  const taxes = summary?.tax_amount || 0;
  const discounts = summary?.discount_amount || 0;
  const finalAmount = summary?.final_amount || 0;
  const discountCode = summary?.discount_code;
  const itemsCount = summary?.items_count || 0;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      onApplyCoupon(couponInput.trim().toUpperCase());
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ReceiptText className="h-4 w-4 text-[#0B72E7]" />
          <h3 className="font-bold text-sm text-[#072654]">
            Checkout Summary
          </h3>
        </div>
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
          GST 18% Input Credit
        </Badge>
      </div>

      {/* 4 Required Metrics Breakdown */}
      <div className="space-y-3 text-xs">
        {/* 1. Order Amount (Subtotal) */}
        <div className="flex items-center justify-between">
          <span className="text-slate-600 font-medium">Order Amount (Subtotal):</span>
          <span className="font-bold text-slate-900">
            ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* 2. Taxes (GST) */}
        <div className="flex items-center justify-between">
          <span className="text-slate-600 font-medium flex items-center gap-1">
            <span>Taxes (18% GST):</span>
            <span className="text-[10px] text-slate-400" title="100% eligible for Input Tax Credit">(ITC Eligible)</span>
          </span>
          <span className="font-bold text-slate-700">
            +₹{taxes.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* 3. Discounts (Coupon / Offers) */}
        <div className="flex items-center justify-between text-emerald-600">
          <span className="font-medium flex items-center gap-1">
            <Tag className="h-3 w-3" />
            <span>Discounts {discountCode ? `(${discountCode})` : ''}:</span>
          </span>
          <span className="font-bold">
            {discounts > 0 ? `-₹${discounts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'}
          </span>
        </div>

        {/* 4. Final Amount */}
        <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Final Amount:
            </span>
            <span className="text-[10px] text-slate-400">
              Includes all statutory GST & fees
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-extrabold text-[#072654]">
              ₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-500 block font-mono">INR</span>
          </div>
        </div>
      </div>

      {/* Coupon Application Box */}
      <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-indigo-600" />
          Apply Promo Code
        </label>
        <form onSubmit={handleApply} className="flex gap-1.5">
          <Input
            placeholder="e.g. RAZOR2026"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            className="h-8 text-xs font-mono uppercase bg-white rounded-xl"
          />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs font-bold text-[#0B72E7] bg-blue-50 border-blue-200 hover:bg-blue-100 rounded-xl"
          >
            Apply
          </Button>
        </form>
        {discountCode && (
          <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold pt-0.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>Active: {discountCode} ({summary?.discount_pct}% Off applied)</span>
          </div>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="space-y-2.5 pt-1">
        <Button
          onClick={onProceedToCheckout}
          disabled={itemsCount === 0 || isCheckingOut}
          className="w-full h-11 bg-[#0B72E7] hover:bg-[#095bc0] text-white font-bold rounded-2xl shadow-md shadow-blue-500/20 text-xs gap-2 transition-all"
        >
          {isCheckingOut ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Creating Razorpay Order...</span>
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              <span>Proceed to Razorpay Checkout</span>
              <ArrowRight className="h-3.5 w-3.5 ml-auto" />
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={onGeneratePaymentLink}
          disabled={itemsCount === 0 || isCheckingOut}
          className="w-full h-10 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-2xl border-slate-200 text-xs gap-1.5"
        >
          <LinkIcon className="h-3.5 w-3.5 text-[#0B72E7]" />
          <span>Generate Shareable Payment Link</span>
        </Button>
      </div>

      {/* Trust Badge */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <span>Secured with Razorpay Sandbox Test Mode</span>
      </div>
    </div>
  );
}
