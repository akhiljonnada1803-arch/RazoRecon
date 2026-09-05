'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api-client';
import { 
  User, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  Bell, 
  Key, 
  Sparkles, 
  Bot, 
  Sliders,
  CheckCircle2,
  Building,
  Phone,
  Mail,
  Zap,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch real AutoPay settings from backend
  const { data: autopaySettings, isLoading: settingsLoading } = useQuery<any>({
    queryKey: ['customer-autopay-settings'],
    queryFn: async () => {
      return apiClient.get('/customer/autopay/settings');
    },
  });

  // Fetch customer payment mandates
  const { data: mandatesData } = useQuery<any>({
    queryKey: ['customer-autopay-mandates'],
    queryFn: async () => {
      return apiClient.get('/customer/autopay/mandates');
    },
  });

  const mandates = Array.isArray(mandatesData) ? mandatesData : [];

  const [maxSpendLimit, setMaxSpendLimit] = useState('25000');
  const [monthlyBudget, setMonthlyBudget] = useState('50000');
  const [autoApprove, setAutoApprove] = useState(true);

  // Sync state when settings arrive
  useEffect(() => {
    if (autopaySettings) {
      if (autopaySettings.max_single_purchase_limit !== undefined && autopaySettings.max_single_purchase_limit !== null) {
        setMaxSpendLimit(String(autopaySettings.max_single_purchase_limit));
      }
      if (autopaySettings.monthly_budget !== undefined && autopaySettings.monthly_budget !== null) {
        setMonthlyBudget(String(autopaySettings.monthly_budget));
      }
      if (autopaySettings.autopay_enabled !== undefined) {
        setAutoApprove(Boolean(autopaySettings.autopay_enabled));
      }
    }
  }, [autopaySettings]);

  // Mutation to save AutoPay settings to backend
  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      const singleLimitNum = parseFloat(maxSpendLimit) || 25000;
      const budgetNum = parseFloat(monthlyBudget) || 50000;

      return apiClient.put('/customer/autopay/settings', {
        monthly_budget: budgetNum,
        max_single_purchase_limit: singleLimitNum,
        autopay_enabled: autoApprove ? 1 : 0,
        purchase_mode: autoApprove ? 'AUTO_BUY' : 'RECOMMENDATION_ONLY',
        allowed_categories: ['HARDWARE', 'SOFTWARE', 'ACCESSORIES', 'SUBSCRIPTIONS'],
        merchant_trust_level: 'VERIFIED_ONLY',
      });
    },
    onSuccess: () => {
      setSaved(true);
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['customer-autopay-settings'] });
      queryClient.invalidateQueries({ queryKey: ['customer-autopay-mandates'] });
      queryClient.invalidateQueries({ queryKey: ['autopay-dashboard'] });
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err?.message || 'Failed to update AutoPay settings');
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Customer Experience</span>
            <span>•</span>
            <span className="text-[#0B72E7] font-bold">Account & AutoPay Settings</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654]">
            Customer Profile & AutoPay Rules
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your corporate identity, delivery locations, and autonomous AI AutoPay purchasing permissions.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>AutoPay Preferences Updated & Persisted</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200">
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Profile Form & Addresses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Information */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#072654] pb-3 border-b border-slate-100 flex items-center gap-2">
              <User className="h-4 w-4 text-[#0B72E7]" />
              <span>Personal & Business Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    defaultValue={user?.name || 'Customer Account'}
                    className="pl-9 h-9 text-xs rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    defaultValue={user?.email || 'customer@acme.com'}
                    className="pl-9 h-9 text-xs rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    defaultValue="+91 98765 43210"
                    className="pl-9 h-9 text-xs rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    defaultValue={user?.company || 'Acme Enterprises Ltd'}
                    className="pl-9 h-9 text-xs rounded-xl border-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Addresses */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#072654] pb-3 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#0B72E7]" />
              <span>Saved Shipping Locations</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border-2 border-blue-500 bg-blue-50/30 space-y-2 relative">
                <Badge className="bg-[#0B72E7] text-white border-0 text-[10px] font-semibold">
                  Default (HQ)
                </Badge>
                <h4 className="font-bold text-xs text-slate-800">Bengaluru Tech Hub</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tech Park Hub, Koramangala 4th Block, Bengaluru, Karnataka - 560034
                </p>
                <span className="text-[11px] text-slate-400 font-mono block">Contact: +91 98765 43210</span>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <Badge variant="outline" className="text-[10px] text-slate-500">
                  Secondary Warehouse
                </Badge>
                <h4 className="font-bold text-xs text-slate-800">Mumbai Fulfillment Depot</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Plot 14, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra - 400093
                </p>
                <span className="text-[11px] text-slate-400 font-mono block">Contact: +91 98111 22334</span>
              </div>
            </div>
          </div>

          {/* Registered Payment Mandates */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#072654] pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#0B72E7]" />
                <span>Connected Razorpay Payment Mandates</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-mono border-0">
                AES-256 Encrypted
              </Badge>
            </h3>

            {mandates.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                No payment mandates connected. Connect a UPI or Card mandate to enable AutoPay.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mandates.map((m: any) => (
                  <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{m.bank_name || 'HDFC Bank'}</span>
                      <Badge className={`text-[9px] font-mono border-0 ${m.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {m.status}
                      </Badge>
                    </div>
                    <div className="text-[11px] font-mono text-slate-600">
                      {m.bank_or_vpa || m.account_or_vpa_masked || '••••'}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 font-mono">
                      <span>Max Tx Limit: ₹{(m.max_amount || 25000).toLocaleString('en-IN')}</span>
                      <span className="uppercase text-blue-600 font-bold">{m.type?.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Autonomous AI Agent Buying Permissions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#072654] pb-3 border-b border-slate-100 flex items-center gap-2">
              <Bot className="h-4 w-4 text-[#0B72E7]" />
              <span>Autonomous AI Buyer Rules</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Monthly Budget Allowance</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <Input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    className="pl-8 h-9 text-xs rounded-xl border-slate-200"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Total autonomous spend cap across all AI auto-purchases per month.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Max Single Purchase Limit</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <Input
                    type="number"
                    value={maxSpendLimit}
                    onChange={(e) => setMaxSpendLimit(e.target.value)}
                    className="pl-8 h-9 text-xs rounded-xl border-slate-200"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Any single item above this amount will block auto-buy and ask for approval.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="font-semibold text-slate-700 block">AI Autonomous AutoPay</label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-slate-800 font-bold block text-xs">Enable Razorpay AutoPay</span>
                    <span className="text-[10px] text-slate-500">Instant restock execution</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                    className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                className="w-full h-10 rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating AutoPay Rules...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Save AutoPay Preferences</span>
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Security & RBAC Badge */}
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Razorpay Verified Customer</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Your account is authorized for instant GST tax invoicing and prioritized courier dispatch with Delhivery & Blue Dart.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
