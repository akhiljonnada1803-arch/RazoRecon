'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  SkipForward,
  Lock,
  Zap,
  Info
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function OnboardingPaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '';
  const { user, isAuthenticated, isLoading } = useAuth();

  const [paymentType, setPaymentType] = useState<'UPI_AUTOPAY' | 'CARD' | 'NETBANKING'>('UPI_AUTOPAY');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [upiVpa, setUpiVpa] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [maxAmount, setMaxAmount] = useState('25000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const returnUrl = redirectParam 
        ? `/onboarding/payment?redirect=${encodeURIComponent(redirectParam)}`
        : '/onboarding/payment';
      router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
    } else if (user) {
      if (!cardHolder && user.name) {
        setCardHolder(user.name);
      }
      if (!upiVpa && user.email) {
        const username = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        setUpiVpa(`${username}@okhdfcbank`);
      }
    }
  }, [isAuthenticated, isLoading, user, router, redirectParam, cardHolder, upiVpa]);

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('razorcommerce_token') || localStorage.getItem('razorrecon_token'))
      : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const handleFinish = (targetPath?: string) => {
    const destination = redirectParam && redirectParam.startsWith('/') ? redirectParam : (targetPath || '/');
    router.push(destination);
  };

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let accountOrVpa = '';
    if (paymentType === 'UPI_AUTOPAY') {
      if (!upiVpa.trim() || !upiVpa.includes('@')) {
        setErrorMsg('Please enter a valid UPI ID (e.g. yourname@okhdfcbank).');
        return;
      }
      accountOrVpa = upiVpa.trim();
    } else if (paymentType === 'CARD') {
      if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 12) {
        setErrorMsg('Please enter a valid card number.');
        return;
      }
      accountOrVpa = `card_ending_${cardNumber.slice(-4)}`;
    } else {
      accountOrVpa = `netbanking_${bankName.toLowerCase().replace(/\s+/g, '_')}`;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/customer/onboarding/payment', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type: paymentType,
          bank_name: bankName,
          account_or_vpa: accountOrVpa,
          max_amount: parseFloat(maxAmount) || 25000.0,
          skipped: false
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to authorize payment method');
      }

      handleFinish(data.next_step);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setErrorMsg(null);
    setIsSkipping(true);

    try {
      const res = await fetch('/api/v1/customer/onboarding/payment', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ skipped: true })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to skip payment setup');
      }

      handleFinish(data.next_step);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not skip payment setup.');
      setIsSkipping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0B72E7]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Onboarding Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            <span>Customer Onboarding</span>
            <span className="text-[#0B72E7] font-bold">Step 2 of 2</span>
          </div>
          
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-4">
            <div className="bg-[#0B72E7] h-full rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-semibold">Delivery Address</span>
            </div>
            <div className="h-0.5 flex-1 bg-emerald-500 mx-3"></div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#0B72E7] text-white flex items-center justify-center text-xs font-bold ring-4 ring-blue-50">
                2
              </div>
              <span className="text-sm font-semibold text-slate-900">Payment Method</span>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#0B72E7] text-xs font-medium mb-3">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Step 2: Connect Payment Method (Optional)</span>
            </div>
            <h1 className="text-2xl font-bold text-[#072654]">Add a preferred payment method</h1>
            <p className="text-sm text-slate-600 mt-1">
              Connect UPI or Card for instant 1-click checkouts. You can also skip this step and pay manually at checkout.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Payment Type Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setPaymentType('UPI_AUTOPAY')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                paymentType === 'UPI_AUTOPAY'
                  ? 'bg-white text-[#0B72E7] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>UPI AutoPay</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentType('CARD')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                paymentType === 'CARD'
                  ? 'bg-white text-[#0B72E7] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Credit / Debit</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentType('NETBANKING')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                paymentType === 'NETBANKING'
                  ? 'bg-white text-[#0B72E7] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>NetBanking</span>
            </button>
          </div>

          <form onSubmit={handleAuthorize} className="space-y-4">
            {/* UPI Option */}
            {paymentType === 'UPI_AUTOPAY' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    UPI Virtual Payment Address (VPA) *
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value)}
                      placeholder="e.g. rahul@okhdfcbank"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B72E7] focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Compatible with Google Pay, PhonePe, Paytm, and BHIM UPI apps.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Sponsoring Bank
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B72E7] focus:border-transparent transition-all"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              </div>
            )}

            {/* CARD Option */}
            {paymentType === 'CARD' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Card Number *
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4111 2222 3333 4444"
                      maxLength={19}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B72E7] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Rahul Sharma"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B72E7] focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Issuing Bank
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B72E7] focus:border-transparent transition-all"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India">State Bank of India</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* NETBANKING Option */}
            {paymentType === 'NETBANKING' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Bank for e-Mandate *
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B72E7] focus:border-transparent transition-all"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                  </select>
                </div>
              </div>
            )}

            {/* Max authorization limit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Maximum Transaction Cap (₹)
              </label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B72E7] focus:border-transparent transition-all"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                RBI mandated cap for automated recurring payments. Can be adjusted anytime.
              </p>
            </div>

            {/* Security notice */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2.5 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-[#0B72E7] flex-shrink-0 mt-0.5" />
              <span>
                Razorpay secures all mandate authorizations with RBI-compliant e-Mandate tokens. No unauthorized charges can ever be debited without your explicit policy settings.
              </span>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSkip}
                disabled={isSkipping || isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-slate-600 hover:text-slate-900 font-medium text-sm rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                {isSkipping ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
                ) : (
                  <SkipForward className="w-4 h-4 text-slate-400" />
                )}
                <span>Skip for now, I'll pay at checkout</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isSkipping}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0B72E7] hover:bg-[#095ec0] text-white font-medium text-sm rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <>
                    <span>Authorize & Finish Onboarding</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default function OnboardingPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0B72E7]"></div>
      </div>
    }>
      <OnboardingPaymentForm />
    </Suspense>
  );
}
