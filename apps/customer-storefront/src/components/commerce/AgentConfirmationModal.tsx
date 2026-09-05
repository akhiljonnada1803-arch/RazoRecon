'use client';

import React from 'react';
import Link from 'next/link';

interface ConfirmationData {
  product: {
    id: string;
    name: string;
    category?: string;
    sku?: string;
    image_url?: string;
  };
  quantity: number;
  unit_price: number;
  subtotal: number;
  gst_amount: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  mandate_type?: string;
  status: string;
  order_id: string;
  timestamp: string;
  approval_type?: string;
  autopay_rule_used?: string;
  invoice_url?: string;
  tracking_url?: string;
}

interface AgentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ConfirmationData | null;
}

export function AgentConfirmationModal({ isOpen, onClose, data }: AgentConfirmationModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-100">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white font-bold text-lg"
        >
          ✕
        </button>

        {/* Header Badge & Title */}
        <div className="flex items-center space-x-2.5 mb-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50 animate-ping" />
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
            Agent Purchase Confirmed
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          AI AutoPay Purchase Receipt
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Charged to your connected Razorpay mandate within approved guardrails.
        </p>

        {/* Product Details Card */}
        <div className="mt-6 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center space-x-4">
          {data.product.image_url ? (
            <img
              src={data.product.image_url}
              alt={data.product.name}
              className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0">
              🤖
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-indigo-400 uppercase font-mono">
              {data.product.category || 'FinTech Hardware'}
            </span>
            <h4 className="text-sm font-bold text-white truncate">{data.product.name}</h4>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
              <span>Qty: <strong className="text-slate-200">{data.quantity}</strong></span>
              <span>Unit: <strong className="text-slate-200">₹{data.unit_price.toLocaleString('en-IN')}</strong></span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown Table */}
        <div className="mt-5 bg-slate-800/40 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal (Base Price)</span>
            <span className="text-slate-200 font-mono">₹{data.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>GST Tax (18% ITC Eligible)</span>
            <span className="text-slate-200 font-mono">₹{data.gst_amount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Delivery & Express Dispatch</span>
            <span className="text-emerald-400 font-bold">FREE (₹0.00)</span>
          </div>
          <div className="pt-2 border-t border-slate-700/80 flex justify-between items-center text-sm">
            <span className="font-extrabold text-white">Total Charged</span>
            <span className="text-lg font-black text-emerald-400 font-mono">₹{data.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Payment Method & AutoPay Status */}
        <div className="mt-4 p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Payment Method Charged</span>
            <div className="text-xs font-bold text-white mt-0.5 flex items-center space-x-1.5">
              <span className="text-indigo-400">⚡</span>
              <span>{data.payment_method}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Status</span>
            <div className="text-xs font-black text-emerald-400 mt-0.5">
              ✓ {data.status}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href={`/orders/${data.order_id}`}
            onClick={onClose}
            className="w-full sm:flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl text-center shadow-lg shadow-indigo-600/30 transition"
          >
            View Order #{data.order_id} →
          </Link>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
