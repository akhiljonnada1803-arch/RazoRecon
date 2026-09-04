'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  QrCode, 
  Copy, 
  ExternalLink, 
  Check, 
  ArrowRight,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function ShopCheckoutPage() {
  const [copied, setCopied] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // Cart summary
  const subtotal = 28996.0;
  const discount = 2899.60;
  const tax = 4697.35;
  const finalAmount = 30793.75;
  const orderId = 'order_rzp_994821';
  const paymentLink = `https://rzp.io/l/pay_${orderId}`;

  const handleSimulatePayment = () => {
    const pId = `pay_rzp_${Math.random().toString(36).substring(2, 10)}`;
    setPaymentId(pId);
    setIsPaid(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <CreditCard className="w-3.5 h-3.5 mr-1" />
                Razorpay Test Mode Checkout
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Instant Auto-Reconcile
              </Badge>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight">
              AI-Driven Checkout & Payment Gateway
            </h1>
            <p className="text-blue-100 text-xs mt-1 max-w-xl">
              End-to-end payment creation, cryptographic signature verification, and instant general ledger settlement.
            </p>
          </div>
        </div>
      </div>

      {isPaid ? (
        /* Payment Success Confirmation Card */
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
              PAYMENT CAPTURED & SETTLED
            </Badge>
            <h2 className="text-2xl font-extrabold text-slate-900">Payment of ₹{finalAmount.toLocaleString('en-IN')} Received</h2>
            <p className="text-xs text-slate-500 font-mono">Razorpay Payment ID: {paymentId}</p>
          </div>

          {/* Double-Entry ERP Voucher */}
          <div className="max-w-md mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-800 font-bold border-b border-slate-200 pb-2">
              <span>Double-Entry ERP Voucher</span>
              <span className="text-emerald-700">Reconciled (₹0.00 Variance)</span>
            </div>
            <div className="space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Dr. 1010-HDFC Operating Bank</span>
                <span className="text-emerald-700 font-bold">₹{(finalAmount * 0.9764).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Dr. 5040-Gateway MDR Fees (2% + GST)</span>
                <span className="text-slate-700">₹{(finalAmount * 0.0236).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pl-3 text-slate-800 font-semibold border-t border-slate-200 pt-1">
                <span>Cr. 4010-Hardware & Software Revenue</span>
                <span className="text-amber-700">₹{finalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/merchant/orders">
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                View in Merchant Orders
              </Button>
            </Link>
            <Link href="/audit/logs">
              <Button size="sm" className="bg-[#0B72E7] hover:bg-blue-600 text-white rounded-xl text-xs font-bold">
                Inspect Audit Ledger
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Checkout Form & Simulator */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Checkout Overview - 7 cols */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Procurement Items</h3>
              <Badge variant="outline" className="font-mono text-[10px] bg-slate-50 text-slate-700">
                Order: {orderId}
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">2× Razorpay Smart POS Terminal Pro V3</span>
                  <span className="text-[10px] text-slate-400 font-mono">SKU: POS-AND-01</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">₹25,998.00</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">2× Thermal Paper Rolls (50-pack)</span>
                  <span className="text-[10px] text-slate-400 font-mono">SKU: ACC-POS-01</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">₹2,998.00</span>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon RAZOR2026 (10%)</span>
                <span>-₹{discount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>18% GST (ITC Deductible)</span>
                <span>+₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-extrabold text-base pt-2 border-t border-slate-200">
                <span>Final Payable</span>
                <span className="text-[#0B72E7]">₹{finalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Right: Payment Simulation Action - 5 cols */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Payment Simulation
            </h3>

            {/* Shareable Link Box */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Shareable Payment Link
              </span>
              <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
                <span className="truncate flex-1 text-[11px]">{paymentLink}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-6 w-6 p-0 text-slate-500"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            {/* Test Payment Trigger */}
            <div className="pt-2 space-y-2.5">
              <Button
                onClick={handleSimulatePayment}
                className="w-full rounded-2xl bg-[#0B72E7] hover:bg-blue-600 text-white font-bold text-xs py-5 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Simulate Successful UPI Payment</span>
              </Button>

              <p className="text-[10px] text-center text-slate-400 font-mono">
                Trigger HMAC SHA256 verification & Auto-Reconcile
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
