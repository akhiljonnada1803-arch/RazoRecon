'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { GrowthOverview } from '@/types/growth';
import { 
  TrendingUp, 
  Sparkles, 
  Layers, 
  Megaphone, 
  Percent, 
  ArrowUpRight, 
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function GrowthOverviewPage() {
  const { data: overview, isLoading } = useQuery<GrowthOverview>({
    queryKey: ['growth', 'overview'],
    queryFn: () => apiClient.get('/growth/overview'),
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                Revenue Growth Engine
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <Zap className="w-3.5 h-3.5 mr-1" />
                Basket Affinity Models
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Autonomous Merchant Revenue Growth & Upsell AI
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Maximize average order value (AOV) through real-time basket affinity mining, price elasticity simulations, and multi-channel marketing campaigns.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/growth/upsell">
              <Button size="sm" className="bg-white hover:bg-blue-50 text-[#072654] font-bold rounded-xl text-xs shadow-md">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#0B72E7]" />
                Explore Upsell Rules
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 High-Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Average Baseline Cart</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            ₹{overview ? overview.current_cart_value_avg.toLocaleString('en-IN') : '42,500'}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Organic checkout average</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Predicted AI Cart Value</span>
          <div className="text-2xl font-extrabold text-[#0B72E7] font-mono">
            ₹{overview ? overview.predicted_cart_value_avg.toLocaleString('en-IN') : '54,800'}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+{overview?.expected_uplift_pct || 28.9}% Expected Uplift</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Margin Expansion Rate</span>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono">
            +{overview?.margin_expansion_pct || 14.2}%
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">High-margin accessory cross-sell</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Monthly Projected Lift</span>
          <div className="text-2xl font-extrabold text-purple-600 font-mono">
            ₹{overview ? overview.monthly_projected_growth_inr.toLocaleString('en-IN') : '8,45,000'}
          </div>
          <span className="text-[11px] text-purple-600 font-semibold">AI Automated Conversion</span>
        </div>
      </div>

      {/* Main Grid: Left Top Recommendations, Right Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Basket Affinity Rules - 7 cols */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top Performing Cross-Sell Affinities</h3>
              <p className="text-xs text-slate-500 mt-0.5">Empirically validated co-purchase pairings</p>
            </div>
            <Link href="/growth/upsell">
              <Button variant="ghost" size="sm" className="text-xs text-[#0B72E7] font-semibold h-7 px-2">
                All Rules <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {(overview?.recent_growth_recommendations || []).map((r, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{r.base_product}</span>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-mono">
                    {r.conversion_rate} Conv Rate
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 text-slate-600">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3 h-3 text-[#0B72E7]" />
                    Add-on: <strong className="text-slate-800">{r.recommended_addon}</strong> (+₹{r.addon_price})
                  </span>
                  <span className="text-emerald-600 font-mono font-bold text-[11px]">
                    {r.margin_contribution} Margin
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Modules Quick Launch - 5 cols */}
        <div className="lg:col-span-5 space-y-4">
          <Link href="/growth/upsell" className="block">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <Badge variant="outline" className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px]">
                  Configurator
                </Badge>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Upsell & Cross-Sell Engine</h3>
              <p className="text-xs text-slate-500">Configure trigger products, complementary items, and calculate cart value uplift.</p>
            </div>
          </Link>

          <Link href="/growth/campaigns" className="block">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Megaphone className="w-4 h-4" />
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                  AI Generator
                </Badge>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Campaign Orchestrator</h3>
              <p className="text-xs text-slate-500">Simulate discount elasticity, projected GMV lift, and multi-channel merchant outreach.</p>
            </div>
          </Link>

          <Link href="/growth/segments" className="block">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                  RFM Clusters
                </Badge>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Customer Segmentation</h3>
              <p className="text-xs text-slate-500">Segment merchant buyers by purchase frequency, AOV, churn risk, and catalog affinities.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
