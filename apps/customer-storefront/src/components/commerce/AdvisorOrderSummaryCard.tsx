'use client';

import React from 'react';
import { AdvisorOrderSummary, Product, DeliveryAddress } from '@/types/commerce';
import { ShieldCheck, Truck, Zap, CheckCircle2, AlertTriangle, ArrowRight, CreditCard, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdvisorOrderSummaryCardProps {
  summary: AdvisorOrderSummary;
  onConfirmAutoPay: () => void;
  onManualCheckout?: () => void;
  onChangeAddress?: () => void;
}

export function AdvisorOrderSummaryCard({
  summary,
  onConfirmAutoPay,
  onManualCheckout,
  onChangeAddress
}: AdvisorOrderSummaryCardProps) {
  if (!summary) return null;

  const {
    product_name,
    product_image,
    brand,
    quantity,
    unit_price,
    base_subtotal,
    gst_amount,
    delivery_fee,
    total_amount,
    delivery_address,
    expected_delivery,
    within_limit,
    within_budget,
    payment_method
  } = summary;

  const canAutoPay = within_limit && within_budget;

  return (
    <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 text-slate-100 shadow-2xl space-y-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">Step 8 & 9: Order Summary & AutoPay Verification</h4>
            <p className="text-[11px] text-slate-400">Pre-flight tax and mandate safety verification</p>
          </div>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
          ⚡ AutoPay Ready
        </Badge>
      </div>

      {/* Product Summary Row */}
      <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center gap-3.5">
        <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden p-1 shrink-0 flex items-center justify-center">
          <img
            src={product_image}
            alt={product_name}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{brand}</span>
          <h5 className="text-xs sm:text-sm font-extrabold text-white truncate">{product_name}</h5>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
            <span>Qty: <strong className="text-slate-200">{quantity}</strong></span>
            <span>Unit: <strong className="text-slate-200">₹{unit_price.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>
      </div>

      {/* Financial GST Breakdown */}
      <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-2xl space-y-2 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Base Price (Net Subtotal)</span>
          <span className="text-slate-200 font-mono">₹{base_subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span className="flex items-center gap-1">
            <span>GST Tax (18% ITC Eligible)</span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded">ITC Eligible</span>
          </span>
          <span className="text-slate-200 font-mono">₹{gst_amount.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Express Logistics & Insurance</span>
          <span className="text-emerald-400 font-bold">FREE (₹0.00)</span>
        </div>
        <div className="pt-2 border-t border-slate-700/80 flex justify-between items-center text-sm">
          <span className="font-extrabold text-white">Total Order Amount</span>
          <span className="text-lg font-black text-emerald-400 font-mono">₹{total_amount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Delivery Destination & ETA */}
      {delivery_address && (
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Delivery Address</span>
            <div className="text-slate-200 font-medium leading-tight">
              <strong>{delivery_address.label}</strong> — {delivery_address.address_line}, {delivery_address.city} ({delivery_address.pincode})
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-0.5">
              <Truck className="w-3 h-3" />
              <span>{expected_delivery}</span>
            </div>
          </div>
          {onChangeAddress && (
            <button
              onClick={onChangeAddress}
              className="text-[11px] font-bold text-blue-400 hover:text-blue-300 underline ml-2 shrink-0"
            >
              Change
            </button>
          )}
        </div>
      )}

      {/* AutoPay Pre-Flight Safety Checks */}
      <div className="p-3.5 bg-slate-950/80 border border-emerald-500/20 rounded-2xl space-y-2 text-xs">
        <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">
          AutoPay Pre-Flight Validation Checks
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Mandate: <strong>{payment_method}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            {within_limit ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            <span>Single Limit: <strong>{within_limit ? 'Within Cap' : 'Exceeds Cap'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 sm:col-span-2">
            {within_budget ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            <span>Monthly Budget: <strong>{within_budget ? 'Sufficient Balance' : 'Exceeds Monthly Budget'}</strong></span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-2">
        {canAutoPay ? (
          <Button
            onClick={onConfirmAutoPay}
            className="w-full h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-bounce" />
            <span>⚡ Buy via AutoPay (₹{total_amount.toLocaleString('en-IN')})</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={onManualCheckout}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <CreditCard className="w-4 h-4" />
            <span>Proceed to Manual Checkout (₹{total_amount.toLocaleString('en-IN')})</span>
          </Button>
        )}
      </div>
    </div>
  );
}
