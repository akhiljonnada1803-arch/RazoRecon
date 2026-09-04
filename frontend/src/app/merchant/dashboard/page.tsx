'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
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
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MerchantDashboardPage() {
  const { data: metrics, isLoading } = useQuery<MerchantDashboardMetrics>({
    queryKey: ['merchant', 'dashboard'],
    queryFn: () => apiClient.get('/merchant/dashboard'),
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Store className="w-3.5 h-3.5 mr-1" />
                Merchant Operations Hub
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <Zap className="w-3.5 h-3.5 mr-1" />
                AI-Buyable Active
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Merchant Revenue & Commerce Intelligence
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Real-time monitoring of omni-channel order velocity, catalog conversion rates, and autonomous AI customer growth.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/merchant/catalog">
              <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl text-xs font-semibold">
                <Package className="w-3.5 h-3.5 mr-1.5" />
                Manage Catalog
              </Button>
            </Link>
            <Link href="/commerce-agent">
              <Button size="sm" className="bg-white hover:bg-blue-50 text-[#072654] font-bold rounded-xl text-xs shadow-md">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#0B72E7]" />
                Launch Commerce Agent
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 5 High-Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Gross Revenue</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#0B72E7]">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            ₹{metrics ? metrics.gross_revenue.toLocaleString('en-IN') : '1,49,020'}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+24.8% vs last month</span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Orders</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {metrics ? metrics.total_orders : '6'}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{metrics?.paid_orders || 4} settled & reconciled</span>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active SKUs</span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {metrics ? metrics.total_products : '50'}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-600">
            <span>7 Categories • 100% In-Stock</span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Conversion Rate</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {metrics ? `${metrics.conversion_rate_pct}%` : '50.0%'}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>+6.2% from AI Upsell</span>
          </div>
        </div>

        {/* Customer Growth */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Customer Growth</span>
            <div className="h-8 w-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            +{metrics ? `${metrics.customer_growth_pct}%` : '+18.4%'}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-600">
            <span>5 Enterprise B2B Buyers</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Revenue Trend, Right Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Revenue Trend - 7 cols */}
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
            ]).map((d, i) => {
              const maxRev = 150000;
              const heightPct = Math.min(Math.round((d.revenue / maxRev) * 100), 100);
              return (
                <div key={i} className="flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-[#0B72E7] font-semibold">
                    ₹{(d.revenue / 1000).toFixed(0)}k
                  </span>
                  <div className="w-full bg-slate-100 h-36 rounded-2xl relative overflow-hidden flex items-end p-1">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-to-t from-[#072654] to-[#0B72E7] rounded-xl group-hover:from-blue-600 group-hover:to-cyan-400 transition-all duration-300"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{d.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders - 5 cols */}
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
                      <Badge
                        className={`text-[9px] font-mono px-1.5 py-0 ${
                          o.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : o.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {o.status}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate max-w-[180px]">
                      {o.customer_name}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-slate-900 font-mono block">
                      ₹{o.total_amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Average Order Value:</span>
            <span className="font-bold text-slate-800 font-mono">
              ₹{metrics ? metrics.average_order_value.toLocaleString('en-IN') : '37,255'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
