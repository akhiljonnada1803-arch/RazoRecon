'use client';

import React, { useState } from 'react';
import { CheckoutOrderResponse } from '@/types/checkout';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  Smartphone,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: CheckoutOrderResponse | null;
  onSimulatePaymentSuccess: (orderId: string, paymentMethod: string) => Promise<void>;
  isVerifying: boolean;
}

export function RazorpayCheckoutModal({
  isOpen,
  onClose,
  order,
  onSimulatePaymentSuccess,
  isVerifying,
}: RazorpayCheckoutModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  if (!isOpen || !order) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(order.payment_link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePay = () => {
    onSimulatePaymentSuccess(order.order_id, selectedMethod);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Razorpay Brand Header */}
        <div className="px-6 py-4 bg-[#072654] text-white flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#0B72E7] flex items-center justify-center text-white font-extrabold shadow-xs">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  Razorpay Standard Checkout
                </h3>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-[9px] px-1.5 py-0 font-bold">
                  Test Sandbox
                </Badge>
              </div>
              <p className="text-[11px] text-blue-200/80">
                Order ID: <span className="font-mono">{order.order_id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Amount Strip */}
          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Payable Amount
              </span>
              <span className="text-xl font-extrabold text-[#072654]">
                ₹{order.final_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-600 block">
                {order.items_count} items
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">
                Includes 18% GST (ITC)
              </span>
            </div>
          </div>

          {/* Shareable Payment Link */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 block">
              Shareable Payment Link & Direct Checkout URL
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={order.payment_link}
                className="flex-1 h-8 px-3 text-xs font-mono bg-white border border-slate-200 rounded-xl text-slate-700 select-all"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="h-8 px-3 text-xs bg-white rounded-xl gap-1.5 shrink-0"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 block">
              Choose Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedMethod === 'upi'
                    ? 'bg-blue-50 border-[#0B72E7] text-[#072654] font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="h-4 w-4 mx-auto mb-1 text-[#0B72E7]" />
                <span className="text-xs block">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedMethod === 'card'
                    ? 'bg-blue-50 border-[#0B72E7] text-[#072654] font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="h-4 w-4 mx-auto mb-1 text-[#0B72E7]" />
                <span className="text-xs block">Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('netbanking')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedMethod === 'netbanking'
                    ? 'bg-blue-50 border-[#0B72E7] text-[#072654] font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="h-4 w-4 mx-auto mb-1 text-[#0B72E7]" />
                <span className="text-xs block">NetBanking</span>
              </button>
            </div>

            {/* UPI QR Display */}
            {selectedMethod === 'upi' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
                <div className="h-32 w-32 bg-white border border-slate-300 p-2 rounded-xl mx-auto flex items-center justify-center shadow-xs">
                  <QrCode className="h-24 w-24 text-slate-800" />
                </div>
                <span className="text-[11px] text-slate-500 block font-mono">
                  UPI ID: razorpay.test@icici
                </span>
                <p className="text-[10px] text-slate-400">
                  Scan with GPay, PhonePe, Paytm, or click below for instant test verification
                </p>
              </div>
            )}

            {/* Card Mock */}
            {selectedMethod === 'card' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="font-bold text-slate-700">Test Corporate Visa / Mastercard</div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-600">
                  4111 •••• •••• 1111 (Exp: 12/28, CVV: 123)
                </div>
              </div>
            )}

            {/* NetBanking Mock */}
            {selectedMethod === 'netbanking' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <label className="font-bold text-slate-700">Select Corporate Bank</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl"
                >
                  <option>HDFC Bank Corporate</option>
                  <option>ICICI Bank Corporate</option>
                  <option>State Bank of India</option>
                  <option>Axis Bank Commercial</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 text-xs rounded-xl"
          >
            Cancel
          </Button>

          <Button
            onClick={handlePay}
            disabled={isVerifying}
            className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2 shadow-xs text-xs"
          >
            {isVerifying ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying HMAC & Reconciling...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Simulate Successful Payment (₹{order.final_amount.toLocaleString('en-IN')})</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
