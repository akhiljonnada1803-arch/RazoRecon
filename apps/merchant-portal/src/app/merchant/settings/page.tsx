'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Building, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  Bell, 
  Key, 
  Sliders,
  CheckCircle2,
  Mail,
  Phone,
  Truck,
  DollarSign,
  Store,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function MerchantSettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    storeName: user?.company || 'Acme Direct Store',
    legalEntity: 'Acme Retail & Logistics Private Limited',
    gstin: '27AAACA9982L1Z5',
    pan: 'AAACA9982L',
    supportEmail: user?.email || 'support@acmedirect.com',
    supportPhone: '+91 80 4567 8900',
    originPincode: '560034',
    defaultCourier: 'Delhivery Express',
    settlementAccount: 'HDFC Bank - •••• 8842',
    autoReconcile: true
  });

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
            <span>Store Operations</span>
            <span>•</span>
            <span className="text-[#0B72E7]">Configuration</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654]">
            Store & Business Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your store profile, GST statutory information, settlement bank account, and logistics routing.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Store Settings Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Business Information & Tax */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Profile */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#072654] pb-3 border-b border-slate-100 flex items-center gap-2">
              <Store className="h-4 w-4 text-[#0B72E7]" />
              <span>Store & Legal Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Display Store Name</label>
                <Input
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  className="h-9 text-xs rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Registered Legal Entity</label>
                <Input
                  value={form.legalEntity}
                  onChange={(e) => setForm({ ...form, legalEntity: e.target.value })}
                  className="h-9 text-xs rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Support Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={form.supportEmail}
                    onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                    className="pl-9 h-9 text-xs rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Support Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={form.supportPhone}
                    onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                    className="pl-9 h-9 text-xs rounded-xl border-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Tax & GST */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#072654] pb-3 border-b border-slate-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#0B72E7]" />
              <span>Statutory Tax & GST Invoicing</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">GSTIN Number</label>
                <Input
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                  className="h-9 text-xs font-mono rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Company PAN</label>
                <Input
                  value={form.pan}
                  onChange={(e) => setForm({ ...form, pan: e.target.value })}
                  className="h-9 text-xs font-mono rounded-xl border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Fulfillment Hubs */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#072654] pb-3 border-b border-slate-100 flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#0B72E7]" />
              <span>Primary Fulfillment Dispatch Hub</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Origin Pincode</label>
                <Input
                  value={form.originPincode}
                  onChange={(e) => setForm({ ...form, originPincode: e.target.value })}
                  className="h-9 text-xs font-mono rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Preferred Logistics Carrier</label>
                <select
                  value={form.defaultCourier}
                  onChange={(e) => setForm({ ...form, defaultCourier: e.target.value })}
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs bg-white focus:outline-none"
                >
                  <option value="Delhivery Express">Delhivery Express</option>
                  <option value="Blue Dart Express">Blue Dart Express</option>
                  <option value="Shiprocket Air">Shiprocket Air</option>
                  <option value="Ekart Logistics">Ekart Logistics</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Settlement & Bank Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#072654] pb-3 border-b border-slate-100 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#0B72E7]" />
              <span>Razorpay Settlements</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Settlement Bank Account</span>
                <div className="flex items-center justify-between font-bold text-slate-800 text-xs">
                  <span>{form.settlementAccount}</span>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Verified</Badge>
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">IFSC: HDFC0000240</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-1">
                <span className="text-xs font-bold text-[#072654] block">T+1 Daily Auto-Settlement</span>
                <p className="text-[11px] text-slate-600">
                  Gross checkout revenue is automatically credited to your bank account every business day at 11:00 AM IST.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-10 rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold shadow-xs"
              >
                Save Store Settings
              </Button>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Active Merchant Compliance</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Your merchant credentials are fully verified for automated Razorpay UPI and Card payment captures.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
