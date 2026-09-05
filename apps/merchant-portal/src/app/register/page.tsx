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
  const { register } = useAuth();

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

    // Front-end pre-flight validations
    if (!businessName.trim()) {
      setErrorMsg('Business name is required (EMPTY_BUSINESS_NAME)');
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMsg('Valid business email is required (INVALID_EMAIL_FORMAT)');
      setIsSubmitting(false);
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters (WEAK_PASSWORD)');
      setIsSubmitting(false);
      return;
    }

    if (gstin && gstin.trim()) {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(gstin.trim().toUpperCase())) {
        setErrorMsg('Invalid GSTIN format. Example: 29AAAAA0000A1Z5 (INVALID_GSTIN)');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await register({
        business_name: businessName.trim(),
        email: email.trim().toLowerCase(),
        password,
        gstin: gstin.trim() ? gstin.trim().toUpperCase() : undefined
      });
      // AuthContext.register automatically logs in and redirects to /dashboard
    } catch (err: any) {
      console.error('Merchant registration failed:', err);
      const rawError = err.message || 'Registration failed. Please check your details.';
      if (rawError.includes('EMAIL_ALREADY_EXISTS')) {
        setErrorMsg('This business email is already registered (EMAIL_ALREADY_EXISTS). Please log in.');
      } else if (rawError.includes('INVALID_GSTIN')) {
        setErrorMsg('Invalid GSTIN format (INVALID_GSTIN).');
      } else if (rawError.includes('WEAK_PASSWORD')) {
        setErrorMsg('Password must be at least 6 characters (WEAK_PASSWORD).');
      } else if (rawError.includes('INVALID_EMAIL_FORMAT')) {
        setErrorMsg('Invalid email format (INVALID_EMAIL_FORMAT).');
      } else if (rawError.includes('EMPTY_BUSINESS_NAME')) {
        setErrorMsg('Business name cannot be empty (EMPTY_BUSINESS_NAME).');
      } else {
        setErrorMsg(rawError);
      }
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
