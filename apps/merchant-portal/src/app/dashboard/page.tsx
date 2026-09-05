'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { MerchantDashboardMetrics } from '@/types/merchant';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Percent, 
  Users, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Store,
  CreditCard,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  GitCompare,
  FileText,
  BrainCircuit,
  Megaphone,
  Layers,
  BarChart3,
  RefreshCw,
  Sliders,
  ShieldAlert,
  Server,
  Flame
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MerchantDashboardPage() {
  const { user, hasPermission } = useAuth();
  const [adminSimulatedRole, setAdminSimulatedRole] = useState<string | null>(null);

  const activeRole = adminSimulatedRole || user?.role || 'Merchant Owner';

  const { data: metrics, isLoading } = useQuery<MerchantDashboardMetrics>({
    queryKey: ['merchant', 'dashboard'],
    queryFn: () => apiClient.get('/merchant/dashboard'),
  });

  const { data: growthData } = useQuery<any>({
    queryKey: ['growth', 'insights-widget'],
    queryFn: () => apiClient.get('/growth/insights-widget'),
  });

  const isPlatformAdmin = user?.role === 'Platform Admin' || user?.role_id === 'role_platform_admin';
  const isMerchantOwner = activeRole.includes('Merchant Owner') || activeRole.includes('merchant_owner') || user?.role_id === 'role_merchant_owner';
  const isOpsManager = activeRole.includes('Operations');
  const isRevenueManager = activeRole.includes('Revenue');
  const isFinanceController = activeRole.includes('Controller');
  const isCFO = activeRole.includes('CFO') || activeRole.includes('Chief Financial Officer');
  const isAuditor = activeRole.includes('Auditor');

  return (
    <div className="space-y-6 pb-16">
      {/* Platform Admin Role Preview Selector Bar */}
      {isPlatformAdmin && (
        <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-mono text-xs font-bold">👑 ADMIN ROLE VIEW SWITCHER:</span>
            <span className="text-xs text-slate-300 hidden md:inline">Preview the dashboard as any organization persona:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              'Platform Admin',
              'Merchant Owner',
              'Operations Manager',
              'Revenue Manager',
              'Finance Controller',
              'CFO',
              'Auditor',
            ].map((r) => (
              <button
                key={r}
                onClick={() => setAdminSimulatedRole(r === 'Platform Admin' ? null : r)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl transition-all ${
                  (adminSimulatedRole === r || (!adminSimulatedRole && r === 'Platform Admin'))
                    ? 'bg-[#0B72E7] text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {r.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 1. MERCHANT OWNER DASHBOARD */}
      {(isMerchantOwner || (!isOpsManager && !isRevenueManager && !isFinanceController && !isCFO && !isAuditor && !isPlatformAdmin) || (isPlatformAdmin && !adminSimulatedRole)) && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    <Store className="w-3.5 h-3.5 mr-1" />
                    Merchant Owner Hub
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                    <Zap className="w-3.5 h-3.5 mr-1" />
                    AI-Buyable Active
                  </Badge>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Merchant Revenue & Autonomous Commerce
                </h1>
                <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
                  Monitoring omni-channel order velocity, catalog conversion rates, and autonomous AI recommendations.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Link href="/merchant/catalog">
                  <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl text-xs font-semibold">
                    <Package className="w-3.5 h-3.5 mr-1.5" />
                    Manage Catalog
                  </Button>
                </Link>
                <Link href="/merchant/agent-api">
                  <Button size="sm" className="bg-white hover:bg-blue-50 text-[#072654] font-bold rounded-xl text-xs shadow-md">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#0B72E7]" />
                    Agent API Center
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* 5 High-Level KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Gross Revenue</span>
                <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#0B72E7]">
                  <CreditCard className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                ₹{metrics ? metrics.gross_revenue.toLocaleString('en-IN') : '0'}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{metrics && metrics.total_orders === 0 ? 'Fresh Storefront' : '+24.8% vs last month'}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Orders</span>
                <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ShoppingBag className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {metrics ? metrics.total_orders : '0'}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{metrics?.paid_orders || 0} settled & reconciled</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Active SKUs</span>
                <div className="h-8 w-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Package className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {metrics ? metrics.total_products : '0'}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-600">
                <span>{metrics && metrics.total_products === 0 ? 'No products published yet' : 'In-Stock & Buyable'}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Conversion Rate</span>
                <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Percent className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {metrics ? `${metrics.conversion_rate_pct}%` : '0.0%'}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>{metrics && metrics.total_orders === 0 ? 'Awaiting 1st order' : '+6.2% from AI Upsell'}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Customer Base</span>
                <div className="h-8 w-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {metrics ? metrics.total_customers : '0'}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-600">
                <span>{metrics && metrics.total_customers === 0 ? 'Zero customers registered' : 'Active buyers'}</span>
              </div>
            </div>
          </div>

          {/* New Merchant Zero-State Onboarding Section */}
          {metrics && metrics.total_orders === 0 && metrics.gross_revenue === 0 && (
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white border-2 border-blue-200/80 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#0B72E7] text-white border-0 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Quick Setup Guide
                    </Badge>
                    <span className="text-xs text-slate-500 font-medium">5 Steps to Launch Your Store</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Welcome to RazorCommerce! Let&apos;s get your store live.
                  </h2>
                  <p className="text-slate-600 text-sm max-w-2xl">
                    Your merchant account is strictly isolated and active. Complete these 5 steps to start accepting customer orders and activate AI autonomous commerce.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-blue-100 shadow-xs">
                  <span className="text-xs font-bold text-slate-700">Setup Progress:</span>
                  <span className="text-xs font-mono font-extrabold text-[#0B72E7] bg-blue-50 px-2 py-0.5 rounded-lg">
                    {metrics.total_products > 0 ? '40%' : '20%'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {/* 1. Add First Product */}
                <Link href="/merchant/catalog" className="group">
                  <div className="bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-[#0B72E7] p-4 rounded-2xl transition-all shadow-xs hover:shadow-md h-full flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="h-9 w-9 rounded-xl bg-blue-100 text-[#0B72E7] flex items-center justify-center font-bold text-sm">
                        1
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#0B72E7] transition-colors">
                        Add First Product
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Create or upload your first product SKU with price, stock, and GST rate.
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-[#0B72E7] pt-2 border-t border-slate-100">
                      <span>Add Product</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>

                {/* 2. Complete Store Profile */}
                <Link href="/merchant/settings" className="group">
                  <div className="bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-500 p-4 rounded-2xl transition-all shadow-xs hover:shadow-md h-full flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                        2
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
                        Complete Store Profile
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Set business name, GSTIN, PAN, and primary dispatch warehouse location.
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-emerald-600 pt-2 border-t border-slate-100">
                      <span>Configure Store</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>

                {/* 3. Connect Razorpay Account */}
                <Link href="/merchant/payments" className="group">
                  <div className="bg-white hover:bg-purple-50/50 border border-slate-200 hover:border-purple-500 p-4 rounded-2xl transition-all shadow-xs hover:shadow-md h-full flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                        3
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors">
                        Connect Razorpay
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Link Razorpay Key ID and Secret for 1-click checkout and T+1 automated settlement.
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-purple-600 pt-2 border-t border-slate-100">
                      <span>Link Gateway</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>

                {/* 4. Publish Catalog */}
                <Link href="/merchant/catalog" className="group">
                  <div className="bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-500 p-4 rounded-2xl transition-all shadow-xs hover:shadow-md h-full flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                        4
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                        Publish Catalog
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Make SKUs live for customer storefront discovery and instant buyable links.
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-amber-600 pt-2 border-t border-slate-100">
                      <span>Publish SKUs</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>

                {/* 5. Enable AI Commerce */}
                <Link href="/merchant/agent-api" className="group">
                  <div className="bg-white hover:bg-rose-50/50 border border-slate-200 hover:border-rose-500 p-4 rounded-2xl transition-all shadow-xs hover:shadow-md h-full flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                        5
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-rose-600 transition-colors">
                        Enable AI Commerce
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Expose agent discovery endpoints, review intelligence, and AutoPay reorders.
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-rose-600 pt-2 border-t border-slate-100">
                      <span>Activate AI</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* AI Growth Engine Proactive Alerts Widget */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-emerald-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200 font-mono">
                  AI Merchant Growth Engine • Demand Intelligence Signals
                </h3>
              </div>
              <Link href="/merchant/demand-intelligence" className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                <span>Open Intelligence Hub</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {(growthData?.insights || [
                {
                  id: "ins_01",
                  title: "Demand Surge in POS Core",
                  description: "Demand for POS devices increased 34% this week across tier-1 merchant hubs.",
                  badge: "+34% Demand",
                  color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
                  action_route: "/merchant/demand-intelligence"
                },
                {
                  id: "ins_02",
                  title: "Barcode Scanner Stockout Risk",
                  description: "Barcode Scanner inventory (8 units) may run out in 6 days. Restock 50 units recommended.",
                  badge: "6 Days Left",
                  color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                  action_route: "/merchant/inventory-optimization"
                },
                {
                  id: "ins_03",
                  title: "Thermal Printer Discount Opportunity",
                  description: "Thermal Printer demand dropped 18%. AI recommends 10% discount for +22% conversions.",
                  badge: "+22% Lift",
                  color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                  action_route: "/merchant/demand-intelligence"
                },
                {
                  id: "ins_04",
                  title: "Autonomous Campaign Lift",
                  description: "AI predicts ₹2.3L additional gross revenue through 3 targeted campaign optimizations.",
                  badge: "₹2.3L Projected",
                  color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                  action_route: "/merchant/campaigns"
                }
              ]).map((ins: any) => (
                <Link
                  key={ins.id}
                  href={ins.action_route}
                  className="bg-slate-800/80 hover:bg-slate-800 p-3.5 rounded-2xl border border-slate-700/80 transition-all group space-y-2 block"
                >
                  <div className="flex items-center justify-between">
                    <Badge className={`text-[9px] font-bold font-mono border ${ins.color}`}>
                      {ins.badge}
                    </Badge>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <h4 className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {ins.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {ins.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Revenue Velocity & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">7-Day Revenue Velocity & AI Impact</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Daily gross checkout volume settled through Razorpay</p>
                </div>
                <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 font-mono text-[10px]">
                  Live Velocity
                </Badge>
              </div>

              <div className="grid grid-cols-7 gap-2 pt-4">
                {(metrics?.revenue_trend || [
                  { date: 'Mon', revenue: 45000, orders: 3 },
                  { date: 'Tue', revenue: 62000, orders: 5 },
                  { date: 'Wed', revenue: 58000, orders: 4 },
                  { date: 'Thu', revenue: 89000, orders: 7 },
                  { date: 'Fri', revenue: 115000, orders: 9 },
                  { date: 'Sat', revenue: 142000, orders: 12 },
                  { date: 'Sun', revenue: 98000, orders: 8 },
                ]).map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-[#0B72E7] font-semibold">
                      ₹{(d.revenue / 1000).toFixed(0)}k
                    </span>
                    <div className="w-full bg-slate-100 h-36 rounded-2xl relative overflow-hidden flex items-end p-1">
                      <div
                        style={{ height: `${Math.min(Math.round((d.revenue / 150000) * 100), 100)}%` }}
                        className="w-full bg-gradient-to-t from-[#072654] to-[#0B72E7] rounded-xl group-hover:from-blue-600 group-hover:to-cyan-400 transition-all duration-300"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-600">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Recent Merchant Orders</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Real-time payment and reconciliation status</p>
                  </div>
                  <Link href="/merchant/orders">
                    <Button variant="ghost" size="sm" className="text-xs text-[#0B72E7] font-semibold h-7 px-2">
                      View All <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2.5 mt-3">
                  {(metrics?.recent_orders || []).slice(0, 4).map((o, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 transition-all flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{o.order_number}</span>
                          <Badge className="text-[9px] font-mono px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">
                            {o.status}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[180px]">{o.customer_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 font-mono block">₹{o.total_amount.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Average Order Value:</span>
                <span className="font-bold text-slate-800 font-mono">₹{metrics ? metrics.average_order_value.toLocaleString('en-IN') : '37,255'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. OPERATIONS MANAGER DASHBOARD */}
      {isOpsManager && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-600 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase">
                <Package className="w-3.5 h-3.5 mr-1" />
                Operations & Fulfillment Control
              </Badge>
              <Badge className="bg-emerald-400/20 text-emerald-200 text-xs font-mono">Inventory Active</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Inventory Health & Order Fulfillment Queue</h1>
            <p className="text-indigo-100 text-xs sm:text-sm mt-1">Live tracking of warehouse stock, low-stock thresholds, and shipping logistics.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">Total SKUs in Catalog</span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">50 Active SKUs</div>
              <div className="text-[11px] text-emerald-600 font-semibold">100% Synced to AI Search Engine</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">Warehouse Stock Units</span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">2,840 Units</div>
              <div className="text-[11px] text-indigo-600 font-semibold">Spread across 4 Regional Hubs</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">Pending Fulfillment</span>
              <div className="text-2xl font-extrabold text-amber-600 font-mono">2 Orders Queued</div>
              <div className="text-[11px] text-amber-700 font-semibold">SLA: 100% within 4 hours</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">Low Stock Alerts</span>
              <div className="text-2xl font-extrabold text-emerald-600 font-mono">0 Critical SKUs</div>
              <div className="text-[11px] text-emerald-700 font-semibold">Automated Replenishment Active</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Inventory Distribution by Category</h3>
              <Link href="/merchant/catalog">
                <Button size="sm" className="text-xs bg-[#0B72E7] text-white rounded-xl">Update Inventory</Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { cat: 'Laptops & Workstations', units: '380 units', status: 'Optimal' },
                { cat: 'POS & Terminals', units: '520 units', status: 'Optimal' },
                { cat: 'Peripherals & Displays', units: '890 units', status: 'High Demand' },
                { cat: 'FinOps & SaaS Subscriptions', units: 'Unlimited', status: 'Digital Instant' },
              ].map((c, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <span className="text-xs font-bold text-slate-800 block">{c.cat}</span>
                  <span className="text-base font-extrabold text-indigo-900 font-mono block mt-1">{c.units}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. REVENUE MANAGER DASHBOARD */}
      {isRevenueManager && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-600 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                Revenue Growth Command Center
              </Badge>
              <Badge className="bg-white/20 text-emerald-200 text-xs font-mono">+28.9% Expected Uplift</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Basket Affinity, Upsell Rules & AI Campaigns</h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">Autonomous revenue acceleration through dynamic cross-sells and customer RFM targeting.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">AI Revenue Uplift</span>
              <div className="text-2xl font-extrabold text-emerald-600 font-mono">+28.9%</div>
              <div className="text-[11px] text-emerald-700 font-semibold">+₹34,500 Generated This Week</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">Average Basket Value</span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">₹42,500</div>
              <div className="text-[11px] text-emerald-600 font-semibold">+18.5% with Cross-Sell Rules</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">Active AI Campaigns</span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">3 Campaigns</div>
              <div className="text-[11px] text-blue-600 font-semibold">Festive Hardware & Cloud FinOps</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">Target Customer Segments</span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">4 Clusters</div>
              <div className="text-[11px] text-purple-600 font-semibold">High-Value, At-Risk & Scaleups</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Active Basket Affinity Rules
              </h3>
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1">
                  <span className="font-bold text-emerald-950">Rule #1: Dev Workstations $\to$ Peripherals & Extended Warranty</span>
                  <p className="text-emerald-800 text-[11px]">88% confidence score • +₹9,500 cart lift</p>
                </div>
                <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-200 text-xs space-y-1">
                  <span className="font-bold text-teal-950">Rule #2: Smart POS Terminals $\to$ Thermal Paper Fleet & Cloud Sync</span>
                  <p className="text-teal-800 text-[11px]">92% confidence score • +₹3,200 cart lift</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#0B72E7]" />
                Top Performing AI Campaign
              </h3>
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#072654]">Q3 D2C Scaleup Equipment Surge</span>
                  <Badge className="bg-blue-600 text-white font-mono text-[9px]">LIVE</Badge>
                </div>
                <p className="text-slate-600 text-[11px]">Targeting 48 High-Velocity Merchant accounts with 10% instant bundle discount on POS fleets.</p>
                <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between font-mono text-[11px]">
                  <span>Projected Orders: <strong>140</strong></span>
                  <span className="text-emerald-700 font-bold">Lift: +32.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. FINANCE CONTROLLER DASHBOARD */}
      {isFinanceController && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#072654] via-blue-900 to-cyan-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase">
                <GitCompare className="w-3.5 h-3.5 mr-1" />
                Finance Controller Workstation
              </Badge>
              <Badge className="bg-emerald-400/20 text-emerald-200 text-xs font-mono">98.4% Match Rate</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Continuous 3-Way Reconciliation & Close Queue</h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1">Deterministic penny netting across Razorpay Gateways, Bank Feeds, and ERP General Ledgers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">3-Way Match Rate</span>
              <div className="text-2xl font-extrabold text-emerald-600 font-mono">98.4%</div>
              <div className="text-[11px] text-emerald-700 font-semibold">620 / 630 Transactions Reconciled</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">Open Exceptions Queue</span>
              <div className="text-2xl font-extrabold text-amber-600 font-mono">10 Items</div>
              <div className="text-[11px] text-amber-700 font-semibold">₹14,200 Timing Discrepancy</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">Unsettled Razorpay Balances</span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">₹48,920</div>
              <div className="text-[11px] text-blue-600 font-semibold">T+1 Settlement Due at 10:00 AM</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">Month-End Close Status</span>
              <div className="text-2xl font-extrabold text-purple-600 font-mono">Period Open</div>
              <div className="text-[11px] text-purple-700 font-semibold">96% Close Checklist Ready</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">3-Way Multi-Channel Ingestion Pipelines</h3>
              <Link href="/finance/reconciliation">
                <Button size="sm" className="text-xs bg-[#0B72E7] text-white rounded-xl">Run Reconciliation Engine</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-900 block">Razorpay Gateway Feed</span>
                <span className="text-[11px] text-slate-500 font-mono">acc_razor_acme_881 • Live Webhook</span>
                <span className="text-[10px] text-emerald-600 font-bold block">CONNECTED & SYNCED</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-900 block">HDFC Nodal Bank Account</span>
                <span className="text-[11px] text-slate-500 font-mono">Statement 50200049182 • Real-Time</span>
                <span className="text-[10px] text-emerald-600 font-bold block">CONNECTED & SYNCED</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-900 block">Tally Prime & SAP ERP</span>
                <span className="text-[11px] text-slate-500 font-mono">GL 2040 (Accounts Receivable)</span>
                <span className="text-[10px] text-emerald-600 font-bold block">JOURNAL POSTING OK</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. CFO DASHBOARD */}
      {isCFO && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase">
                <BrainCircuit className="w-3.5 h-3.5 mr-1" />
                CFO Executive Intelligence
              </Badge>
              <Badge className="bg-rose-500/20 text-rose-200 text-xs font-mono">Runway: 18.4 Months</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Executive Cash Flow, Runway & AI Copilot</h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">Strategic financial health, predictive liquidity simulations, and counterparty risk assessment.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">Cash & Liquid Reserves</span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">₹4.82 Cr</div>
              <div className="text-[11px] text-emerald-600 font-semibold">+₹38.5 Lakhs Operating Cash Flow</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">Monthly Burn Rate</span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">₹26.2 Lakhs</div>
              <div className="text-[11px] text-emerald-600 font-semibold">-4.1% Operating Efficiency</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">Working Capital Runway</span>
              <div className="text-2xl font-extrabold text-emerald-600 font-mono">18.4 Months</div>
              <div className="text-[11px] text-emerald-700 font-semibold">Zero Dilution Runway Safe</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">Counterparty Risk Rating</span>
              <div className="text-2xl font-extrabold text-blue-600 font-mono">Low (Score 12)</div>
              <div className="text-[11px] text-blue-700 font-semibold">50 Vendor Profiles Scored</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-600" />
                CFO Strategic Copilot Executive Briefing
              </h3>
              <Link href="/finance/copilot">
                <Button size="sm" className="text-xs bg-[#0B72E7] text-white rounded-xl">Ask Copilot</Button>
              </Link>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs space-y-2 text-slate-800">
              <p className="font-semibold text-purple-950">
                &ldquo;Merchant cash velocity increased by 24.8% following autonomous catalog upsell activation. Working capital is primed for Q4 expansion with ₹1.2 Cr buffer.&rdquo;
              </p>
              <div className="flex items-center gap-4 text-[11px] text-purple-700 font-mono pt-1">
                <span>Confidence: 96.2%</span>
                <span>Audit Readiness: 100%</span>
                <span>Tax Liability: ₹18.4k GST Ready</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. AUDITOR DASHBOARD */}
      {isAuditor && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Auditor & Compliance Workstation
              </Badge>
              <Badge className="bg-purple-400/20 text-purple-200 text-xs font-mono">SOC2 & GST Compliant</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Forensic Audit Trails & Regulatory Compliance SLA</h1>
            <p className="text-purple-100 text-xs sm:text-sm mt-1">Immutable chronological event logs, risk forensics, and financial verification traces.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">Total Forensic Audit Logs</span>
              <div className="text-2xl font-extrabold text-purple-900 font-mono">1,420 Events</div>
              <div className="text-[11px] text-purple-700 font-semibold">100% Immutable SHA-256</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">Compliance SLA Adherence</span>
              <div className="text-2xl font-extrabold text-emerald-600 font-mono">99.8%</div>
              <div className="text-[11px] text-emerald-700 font-semibold">SOC2 Type II SLA Met</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">High Risk Triggers</span>
              <div className="text-2xl font-extrabold text-emerald-600 font-mono">0 Flagged</div>
              <div className="text-[11px] text-emerald-700 font-semibold">Zero Fraud Anomalies</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500">GST E-Invoice Reconciliation</span>
              <div className="text-2xl font-extrabold text-blue-600 font-mono">100% Match</div>
              <div className="text-[11px] text-blue-700 font-semibold">GSTR-1 & 3B Invoices Verified</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Recent Forensic Event Stream</h3>
              <Link href="/audit/logs">
                <Button size="sm" className="text-xs bg-[#0B72E7] text-white rounded-xl">View Audit Logs</Button>
              </Link>
            </div>
            <div className="space-y-2 pt-1 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">PAYMENT_CAPTURED & ORDER_RECONCILED</span>
                  <span className="text-slate-500 text-[11px]">Razorpay Payment `pay_test_9481` matched with Invoice `INV-2026-081`</span>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 font-mono text-[9px]">PASSED</Badge>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">CATALOG_PRICE_UPDATE_VERIFIED</span>
                  <span className="text-slate-500 text-[11px]">Published SKU `PROD-50` with ₹42,500 active offer rate</span>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 font-mono text-[9px]">PASSED</Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
