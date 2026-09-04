'use client';

import React from 'react';
import { 
  Megaphone, 
  TrendingUp, 
  ShoppingBag, 
  Percent, 
  Sparkles, 
  Play, 
  Plus,
  Sliders
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CampaignListResponse } from '@/types/campaign';

interface CampaignHeaderProps {
  overview?: CampaignListResponse;
  onOpenGenerator: () => void;
  onOpenSimulator: () => void;
}

export function CampaignHeader({
  overview,
  onOpenGenerator,
  onOpenSimulator
}: CampaignHeaderProps) {
  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const activeCount = overview?.active_campaigns || 0;
  const totalLift = overview?.aggregate_expected_revenue_lift || 0;
  const totalOrders = overview?.total_projected_orders || 0;
  const avgLiftPct = overview?.avg_expected_lift_pct || 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#072654] via-[#0B3A7A] to-[#0B72E7] p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-blue-200 border border-white/10 shadow-inner">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Campaign Orchestrator</h1>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] font-mono">
                  Autonomous Growth
                </Badge>
              </div>
              <p className="text-xs text-blue-100/80">
                AI campaign generation, price elasticity discount simulation, RFM customer segmentation, and revenue forecasting.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Button
            onClick={onOpenSimulator}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-semibold gap-1.5 h-9"
          >
            <Sliders className="h-3.5 w-3.5 text-blue-200" />
            Discount Simulator
          </Button>

          <Button
            onClick={onOpenGenerator}
            className="bg-white text-[#072654] hover:bg-blue-50 font-bold text-xs gap-1.5 h-9 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#0B72E7]" />
            Generate AI Campaign
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Campaigns */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Campaigns</span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-[#0B72E7]">
              <Megaphone className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">{activeCount}</div>
            <span className="text-[11px] text-slate-500 font-medium">
              out of {overview?.total_campaigns || 0} total campaigns
            </span>
          </div>
        </div>

        {/* Card 2: Expected Revenue Lift */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Expected Revenue Lift</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600 font-mono">
              +{formatINR(totalLift)}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
              +{avgLiftPct}% avg conversion uplift
            </span>
          </div>
        </div>

        {/* Card 3: Projected Orders */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:border-purple-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Projected Orders</span>
            <div className="h-7 w-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {totalOrders.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              across 5 customer segments
            </span>
          </div>
        </div>

        {/* Card 4: Avg Expected Lift */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Avg Expected Lift %</span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-[#0B72E7]">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0B72E7] font-mono">
              +{avgLiftPct}%
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              elasticity-modeled incremental AOV
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
