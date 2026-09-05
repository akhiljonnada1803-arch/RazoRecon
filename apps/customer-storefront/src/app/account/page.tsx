'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Mail,
  Truck,
  RotateCcw,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Clock,
  Heart,
  ExternalLink,
  Package,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  is_default: number;
}

export default function CustomerAccountDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [saved, setSaved] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [dashboardWidgets, setDashboardWidgets] = useState<any>(null);

  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    landmark: '',
    is_default: false
  });

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/account');
    }
  }, [isLoading, isAuthenticated, router]);

  const loadData = async () => {
    try {
      const [addrRes, widgetRes] = await Promise.all([
        apiClient.get<Address[]>('/customer/addresses'),
        apiClient.get<any>('/customer/dashboard-widgets')
      ]);
      if (Array.isArray(addrRes)) setAddresses(addrRes);
      if (widgetRes) setDashboardWidgets(widgetRes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.full_name || !addressForm.address_line1 || !addressForm.pincode) {
      alert('Please fill all required fields');
      return;
    }
    try {
      const newAddr = await apiClient.post<Address>('/customer/addresses', addressForm);
      setAddresses(prev => [newAddr, ...prev]);
      setIsAddingAddress(false);
      setAddressForm({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560103',
        landmark: '',
        is_default: false
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await apiClient.delete(`/customer/addresses/${id}`);
      setAddresses(prev => prev.filter(a => a.id !== id));
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await apiClient.post(`/customer/addresses/${id}/default`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0B72E7] flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Sign in to view your account</h3>
        <p className="text-xs text-slate-500">
          Manage your saved addresses, track in-transit dispatches, and review return requests.
        </p>
        <Link href="/login?redirect=/account" className="inline-block w-full">
          <Button className="w-full bg-[#0B72E7] text-white font-bold rounded-xl text-xs h-10">
            Sign In to Customer Account
          </Button>
        </Link>
      </div>
    );
  }

  const recentOrders = dashboardWidgets?.recent_orders || [];
  const inTransitOrders = dashboardWidgets?.in_transit_orders || [];
  const activeReturns = dashboardWidgets?.active_returns || [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Customer Experience</span>
            <span>•</span>
            <span className="text-[#0B72E7] font-bold">Account Hub</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654]">
            My Account & Purchase Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your saved delivery address book, live shipment tracking, active returns, and wishlist.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/orders">
            <Button className="h-10 px-4 rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold shadow-xs flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>View All Orders</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Total Orders</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {dashboardWidgets?.total_orders || recentOrders.length || 0}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">100% Razorpay Settled</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Orders In Transit</span>
          <div className="text-2xl font-extrabold text-[#0B72E7] font-mono">
            {inTransitOrders.length}
          </div>
          <span className="text-[11px] text-slate-500">Live GPS tracking active</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Active Returns</span>
          <div className="text-2xl font-extrabold text-pink-600 font-mono">
            {activeReturns.length}
          </div>
          <span className="text-[11px] text-pink-700 font-semibold">Doorstep pickup scheduled</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Saved Addresses</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {addresses.length}
          </div>
          <span className="text-[11px] text-slate-500">1 Default Shipping Pin</span>
        </div>
      </div>

      {/* Main Grid: Left Widgets & Right Address Book */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: In Transit & Recent Orders */}
        <div className="lg:col-span-7 space-y-6">

          {/* AI Commerce AutoPay Agent Hub Card */}
          <div className="bg-gradient-to-r from-slate-900 via-[#072654] to-indigo-950 text-white p-6 rounded-3xl border border-indigo-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400 fill-amber-400" />
                <h3 className="font-bold text-sm">AI Commerce AutoPay & Spending Budget</h3>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/40">
                AutoPay: ACTIVE
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Monthly Budget</span>
                <p className="text-base font-bold font-mono text-white">₹25,000</p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Used</span>
                <p className="text-base font-bold font-mono text-amber-300">₹8,500</p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Remaining</span>
                <p className="text-base font-bold font-mono text-emerald-400">₹16,500</p>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-300">Protected by 6 safety guardrails &amp; 1-click reversible refunds.</span>
              <Link href="/customer/autopay">
                <Button size="sm" className="h-8 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl gap-1.5 shadow-sm">
                  <span>Manage AutoPay &amp; Limits</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* 1. In Transit Orders Widget */}
          {inTransitOrders.length > 0 && (
            <div className="bg-gradient-to-r from-[#072654] via-slate-900 to-[#0B72E7] text-white p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-bold text-sm">Dispatches In Transit</h3>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-200 font-mono text-[10px]">Active Carrier Dispatch</Badge>
              </div>

              <div className="space-y-3">
                {inTransitOrders.map((ord: any) => (
                  <div key={ord.id} className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">{ord.order_number || ord.id}</span>
                        <Badge className="bg-blue-400/20 text-blue-200 text-[9px] font-mono">{ord.order_status}</Badge>
                      </div>
                      <p className="text-blue-100 text-[11px] mt-1">
                        Carrier: {ord.delivery_partner || 'Delhivery Express'} • AWB: {ord.awb_number || 'AWB-DLHV-9941'}
                      </p>
                      <p className="text-emerald-300 font-semibold text-[11px] mt-0.5">
                        Expected: {ord.estimated_delivery || 'Tomorrow, by 8:00 PM'}
                      </p>
                    </div>

                    <Link href={`/orders/${ord.id}/tracking`}>
                      <Button size="sm" className="bg-white hover:bg-blue-50 text-[#072654] font-bold rounded-xl text-xs shadow-xs gap-1.5 shrink-0">
                        <Truck className="h-3.5 w-3.5 text-[#0B72E7]" />
                        <span>Track Live</span>
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Recent Orders Widget */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-[#072654] flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[#0B72E7]" />
                <span>Recent Purchases</span>
              </h3>
              <Link href="/orders" className="text-xs font-semibold text-[#0B72E7] hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              {recentOrders.slice(0, 4).map((ord: any) => (
                <div key={ord.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{ord.order_number || ord.id}</span>
                      <Badge className="bg-slate-200 text-slate-700 font-mono text-[9px]">{ord.order_status}</Badge>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {ord.items?.[0]?.name || 'Razorpay POS Hardware'} • ₹{Number(ord.total_amount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/orders/${ord.id}`}>
                      <Button variant="outline" size="sm" className="rounded-xl text-xs h-8">
                        Details
                      </Button>
                    </Link>
                    <Link href={`/orders/${ord.id}/tracking`}>
                      <Button size="sm" className="bg-[#0B72E7] hover:bg-[#095ec2] text-white rounded-xl text-xs h-8">
                        Track
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Returns & Refunds Widget */}
          {activeReturns.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-[#072654] flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-pink-600" />
                  <span>Active Returns & Refunds</span>
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                {activeReturns.map((ret: any) => (
                  <div key={ret.id} className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-pink-950 block">Return #{ret.id}</span>
                      <span className="text-slate-600 text-[11px] block">{ret.reason}</span>
                      <span className="text-[11px] font-mono text-emerald-700 font-semibold block mt-0.5">
                        Refund: ₹{Number(ret.refund_amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <Badge className="bg-pink-600 text-white font-mono text-[10px]">
                      {ret.return_status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Wishlist Widget */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-[#072654] flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Saved Wishlist & Procurement Items</span>
              </h3>
              <Link href="/wishlist" className="text-xs font-semibold text-[#0B72E7] hover:underline">
                Manage
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { name: 'Razorpay Smart POS Pro Terminal V3', price: 14999, sku: 'HW-POS-001' },
                { name: '4G Voice Soundbox Speaker Box', price: 2499, sku: 'HW-SND-001' }
              ].map((it, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs truncate max-w-[160px]">{it.name}</span>
                    <span className="font-mono text-[11px] text-slate-500">₹{it.price.toLocaleString('en-IN')}</span>
                  </div>
                  <Link href="/checkout">
                    <Button size="sm" className="h-7 px-2.5 rounded-xl bg-[#0B72E7] text-white text-[10px] font-semibold">
                      Buy Now
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Saved Addresses Manager */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-[#072654] flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#0B72E7]" />
                <span>Saved Addresses</span>
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                className="h-8 rounded-xl text-xs text-[#0B72E7] border-blue-200 gap-1 font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </Button>
            </div>

            {/* Add Address Form */}
            {isAddingAddress && (
              <form onSubmit={handleSaveAddress} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3 text-xs">
                <span className="font-bold text-slate-900 block uppercase font-mono text-[10px]">New Address</span>
                <Input
                  required
                  placeholder="Full Name *"
                  value={addressForm.full_name}
                  onChange={e => setAddressForm({ ...addressForm, full_name: e.target.value })}
                  className="h-8 text-xs bg-white rounded-xl"
                />
                <Input
                  required
                  placeholder="Phone Number *"
                  value={addressForm.phone}
                  onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="h-8 text-xs bg-white rounded-xl"
                />
                <Input
                  required
                  placeholder="Address Line 1 *"
                  value={addressForm.address_line1}
                  onChange={e => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                  className="h-8 text-xs bg-white rounded-xl"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    required
                    placeholder="City *"
                    value={addressForm.city}
                    onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="h-8 text-xs bg-white rounded-xl"
                  />
                  <Input
                    required
                    placeholder="Pincode *"
                    value={addressForm.pincode}
                    onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="h-8 text-xs bg-white rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingAddress(false)} className="h-7 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="h-7 bg-[#0B72E7] text-white rounded-xl text-xs">
                    Save
                  </Button>
                </div>
              </form>
            )}

            {/* Addresses List */}
            <div className="space-y-3 text-xs">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    addr.is_default === 1
                      ? 'border-[#0B72E7] bg-blue-50/30'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{addr.full_name}</span>
                    <div className="flex items-center gap-1">
                      {addr.is_default === 1 ? (
                        <Badge className="bg-[#0B72E7] text-white font-mono text-[9px]">Default</Badge>
                      ) : (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-[10px] text-slate-500 hover:text-[#0B72E7] underline font-mono"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {addr.address_line1}, {addr.address_line2 ? `${addr.address_line2}, ` : ''}
                    {addr.city}, {addr.state} - <span className="font-mono font-bold">{addr.pincode}</span>
                  </p>

                  <div className="text-[10px] text-slate-400 font-mono">
                    Phone: {addr.phone}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
