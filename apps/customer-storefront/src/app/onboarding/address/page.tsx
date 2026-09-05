'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Building, 
  Navigation,
  Phone,
  User,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function OnboardingAddressForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '';
  const { user, isAuthenticated, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const returnUrl = redirectParam 
        ? `/onboarding/address?redirect=${encodeURIComponent(redirectParam)}`
        : '/onboarding/address';
      router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
    } else if (user) {
      if (!fullName && user.name) {
        setFullName(user.name);
      }
    }
  }, [isAuthenticated, isLoading, user, router, redirectParam, fullName]);

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('razorcommerce_token') || localStorage.getItem('razorrecon_token'))
      : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!addressLine1.trim()) {
      setErrorMsg('Please enter your street address.');
      return;
    }
    if (!city.trim()) {
      setErrorMsg('Please enter your city.');
      return;
    }
    if (!pincode.trim() || pincode.trim().length < 6) {
      setErrorMsg('Please enter a valid 6-digit PIN code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/customer/onboarding/address', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim() || '+91 98765 43210',
          address_line1: addressLine1.trim(),
          address_line2: addressLine2.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          landmark: landmark.trim() || undefined,
          is_default: true
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to save delivery address');
      }

      const nextParam = redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : '';
      router.push(`/onboarding/payment${nextParam}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred while saving your address.');
      setIsSubmitting(false);
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
            <span className="text-[#0B72E7] font-bold">Step 1 of 2</span>
          </div>
          
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-4">
            <div className="bg-[#0B72E7] h-full rounded-full transition-all duration-500" style={{ width: '50%' }}></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#0B72E7] text-white flex items-center justify-center text-xs font-bold ring-4 ring-blue-50">
                1
              </div>
              <span className="text-sm font-semibold text-slate-900">Delivery Address</span>
            </div>
            <div className="h-0.5 flex-1 bg-slate-200 mx-3"></div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center text-xs font-medium">
                2
              </div>
              <span className="text-sm font-medium text-slate-400">Payment Setup</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#0B72E7] text-xs font-medium mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>Step 1: Set Delivery Address</span>
            </div>
            <h1 className="text-2xl font-bold text-[#072654]">Where should we deliver your orders?</h1>
            <p className="text-sm text-slate-600 mt-1">
              Add your primary shipping address for fast 1-click checkout and seamless order deliveries.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Recipient Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B72E7] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B72E7] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Flat, House No., Building, Street *
              </label>
              <input
                type="text"
                required
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="e.g. Flat 402, Prestige Tower, 100 Feet Road"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B72E7] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Area, Sector, Colony (Optional)
              </label>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="e.g. Koramangala 4th Block"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B72E7] focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B72E7] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  State *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B72E7] focus:border-transparent transition-all"
                >
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 560034"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B72E7] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Landmark (Optional)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Sony World Signal"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B72E7] focus:border-transparent transition-all"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Default delivery address for all verified merchant orders</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0B72E7] hover:bg-[#095ec0] text-white font-medium text-sm rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Address...</span>
                  </>
                ) : (
                  <>
                    <span>Save & Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Micro-features banner */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <div className="text-xs font-semibold text-slate-800">Pin-point Geocoding</div>
            <div className="text-[11px] text-slate-500">Accurate delivery routing</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[#0B72E7] mx-auto mb-1.5" />
            <div className="text-xs font-semibold text-slate-800">100% Privacy Secure</div>
            <div className="text-[11px] text-slate-500">End-to-end encrypted</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
            <div className="text-xs font-semibold text-slate-800">Instant Checkout</div>
            <div className="text-[11px] text-slate-500">Auto-fills during purchase</div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function OnboardingAddressPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0B72E7]"></div>
      </div>
    }>
      <OnboardingAddressForm />
    </Suspense>
  );
}
