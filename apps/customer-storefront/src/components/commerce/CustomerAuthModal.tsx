'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  LogIn, 
  UserPlus, 
  X, 
  Sparkles, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPath?: string;
  pendingItemName?: string;
}

export function CustomerAuthModal({
  isOpen,
  onClose,
  redirectPath = '/cart',
  pendingItemName
}: CustomerAuthModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLoginClick = () => {
    onClose();
    router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  };

  const handleRegisterClick = () => {
    onClose();
    router.push(`/register?redirect=${encodeURIComponent(redirectPath)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-[#072654] via-[#0A3875] to-[#0B72E7] text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Lock className="w-3 h-3" />
                <span>Customer Gating</span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight leading-tight">
                Sign in to continue shopping
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {pendingItemName && (
            <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-100 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-[#0B72E7] shrink-0" />
              <p className="text-xs text-slate-700 font-medium line-clamp-1">
                Item staged: <strong className="text-[#072654]">{pendingItemName}</strong>
              </p>
            </div>
          )}

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Create an account or sign in to add products to your cart and complete purchases.
          </p>

          {/* Quick Value Props */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Free Express Delivery</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <CreditCard className="w-3.5 h-3.5 text-[#0B72E7] shrink-0" />
              <span>1-Click Razorpay UPI</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>GST Input Credit</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>AI Shopping Copilot</span>
            </div>
          </div>

          {/* Required Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <Button
              onClick={handleLoginClick}
              className="w-full h-11 text-xs font-bold bg-[#0B72E7] hover:bg-[#095ec2] text-white rounded-xl shadow-md gap-2 cursor-pointer transition-all active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              <span>Login to Account</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-70" />
            </Button>

            <Button
              onClick={handleRegisterClick}
              variant="outline"
              className="w-full h-11 text-xs font-bold border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-slate-500" />
              <span>Register New Customer Account</span>
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Continue Browsing
            </button>
          </div>
        </div>

        {/* Footer Security Guarantee */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            256-Bit Encrypted Marketplace
          </span>
          <span className="font-mono text-[10px]">Track 01 Auth Guard</span>
        </div>
      </div>
    </div>
  );
}
