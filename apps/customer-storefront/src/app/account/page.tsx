'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
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
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function CustomerProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const [saved, setSaved] = useState(false);
  const [maxSpendLimit, setMaxSpendLimit] = useState('50000');
  const [autoApprove, setAutoApprove] = useState(true);

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0B72E7] flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Sign in to view your account</h3>
        <p className="text-xs text-slate-500">
          Manage your saved addresses, corporate procurement preferences, and payment methods.
        </p>
        <a href="/login" className="inline-block w-full">
          <Button className="w-full bg-[#0B72E7] text-white font-bold rounded-xl text-xs h-10">
            Sign In to Customer Account
          </Button>
        </a>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Customer Experience</span>
            <span>•</span>
            <span className="text-[#0B72E7]">Account & Settings</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654]">
            Customer Profile & AI Preferences
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your corporate identity, delivery locations, and autonomous AI buyer purchasing permissions.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            <span>Preferences Updated</span>
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
        </div>

        {/* Right 1 Col: Autonomous AI Agent Buying Permissions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#072654] pb-3 border-b border-slate-100 flex items-center gap-2">
              <Bot className="h-4 w-4 text-[#0B72E7]" />
              <span>Autonomous AI Buyer Rules</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Autonomous Max Spend Limit</label>
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
                  The AI Agent can initiate 1-click Razorpay payment links for purchases up to this threshold.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="font-semibold text-slate-700 block">AI Automated Re-ordering</label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-medium">Auto-suggest hardware refill</span>
                  <input
                    type="checkbox"
                    checked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                    className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <Button
                onClick={handleSave}
                className="w-full h-9 rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold shadow-xs"
              >
                Save Preferences
              </Button>
            </div>
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
