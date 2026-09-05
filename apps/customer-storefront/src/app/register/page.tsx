'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  ShoppingBag,
  Building,
  CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '/';
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      setIsSubmitting(false);
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      setIsSubmitting(false);
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      setIsSubmitting(false);
      return;
    }

    const res = await register(name.trim(), email.trim(), password, company.trim() || undefined);
    if (res.success) {
      router.push(redirectParam);
    } else {
      setErrorMsg(res.error || 'Could not register account. Please try again or use the demo login.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0B72E7] to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>
            <span className="font-black text-xl text-[#072654]">
              Razor<span className="text-[#0B72E7]">Commerce</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-[#072654] pt-2">Create Customer Account</h1>
          <p className="text-xs text-slate-500">
            Join the AI Commerce marketplace for instant Razorpay checkout, saved orders, and AI personalized recommendations.
          </p>
        </div>

        {redirectParam && redirectParam !== '/' && (
          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#0B72E7] shrink-0" />
            <span>
              Create an account to complete your action on <strong>{redirectParam}</strong>.
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="pl-9 h-10 text-xs rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className="pl-9 h-10 text-xs rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Organization / Company (Optional)</label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Enterprises"
                className="pl-9 h-10 text-xs rounded-xl border-slate-200"
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
            className="w-full h-11 bg-[#0B72E7] hover:bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md mt-2 cursor-pointer"
          >
            <span>{isSubmitting ? 'Creating Account...' : 'Create Account & Start Shopping'}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link 
            href={`/login${redirectParam !== '/' ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
            className="text-[#0B72E7] font-bold hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-400 text-xs">Loading registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
