'use client';

import React from 'react';
import { GrowthAnalysisResponse } from '@/types/growth';
import { 
  ShoppingBag, 
  TrendingUp, 
  Zap, 
  Coins, 
  Percent, 
  ArrowUpRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GrowthMetricCardsProps {
  data?: GrowthAnalysisResponse;
}

export function GrowthMetricCards({ data }: GrowthMetricCardsProps) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Current Cart Value */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Current Cart Value
          </span>
          <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <ShoppingBag className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-[#072654]">
            ₹{data.current_cart_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <span>{data.total_active_items} item(s) in active merchant basket</span>
          </div>
        </div>
      </div>

      {/* 2. Predicted Cart Value */}
      <div className="bg-white p-5 rounded-3xl border border-blue-200 shadow-xs flex flex-col justify-between space-y-2 bg-gradient-to-br from-white to-blue-50/40">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#0B72E7] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Predicted Cart Value
          </span>
          <div className="h-8 w-8 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center">
            <Coins className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-[#0B72E7]">
            ₹{data.predicted_cart_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>+₹{data.expected_uplift_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Expected Growth</span>
          </div>
        </div>
      </div>

      {/* 3. Expected Uplift % */}
      <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-xs flex flex-col justify-between space-y-2 bg-gradient-to-br from-white to-emerald-50/30">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            Expected Uplift %
          </span>
          <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 flex items-baseline gap-1.5">
            <span>+{data.expected_uplift_pct}%</span>
            <Badge className="bg-emerald-600 text-white text-[10px] font-bold border-0">
              HIGH IMPACT
            </Badge>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Probability-weighted AOV expansion
          </div>
        </div>
      </div>

      {/* 4. Margin Expansion */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Gross Margin Expansion
          </span>
          <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Percent className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-1.5">
            <span>{data.projected_gross_margin_pct}%</span>
            <span className="text-xs font-bold text-indigo-600">
              (+{data.margin_expansion_pct}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Base Margin: {data.current_gross_margin_pct}%
          </div>
        </div>
      </div>
    </div>
  );
}
