'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Store, 
  Mail, 
  Lock, 
  Building, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Globe 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MerchantRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gstin, setGstin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const success = await login(email || 'owner@acme.com', password || 'demo123');
    if (success) {
      router.push('/');
    } else {
      setErrorMsg('Could not create merchant account. Please use demo login credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <span className="font-black text-xl text-[#072654]">
              Razor<span className="text-emerald-600">Merchant</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-[#072654] pt-2">Register Merchant Account</h1>
          <p className="text-xs text-slate-500">
            Publish your catalog to autonomous AI buyer agents and automate 7-stage multi-courier dispatch with instant Razorpay settlements.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Business / Legal Entity Name</label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Acme Retail & Fintech Ltd"
                className="pl-9 h-10 text-xs rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Business Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@acme.com"
                className="pl-9 h-10 text-xs rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">GSTIN Number (Optional)</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="29AAAAA0000A1Z5"
                className="pl-9 h-10 text-xs rounded-xl border-slate-200 uppercase font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 h-10 text-xs rounded-xl border-slate-200"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md mt-2"
          >
            <span>{isSubmitting ? 'Creating Merchant Workspace...' : 'Complete Merchant Registration'}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have a merchant account?{' '}
          <Link href="/login" className="text-emerald-600 font-bold hover:underline">
            Sign In to Seller Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
