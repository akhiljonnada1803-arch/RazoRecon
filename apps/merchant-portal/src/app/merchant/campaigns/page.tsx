'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { GrowthCampaign } from '@/types/growth';
import { 
  Megaphone, 
  Sparkles, 
  TrendingUp, 
  Tag, 
  Send, 
  CheckCircle2, 
  Plus, 
  MessageSquare, 
  Mail, 
  Bell 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function GrowthCampaignsPage() {
  const { data: campaigns, isLoading } = useQuery<GrowthCampaign[]>({
    queryKey: ['growth', 'campaigns'],
    queryFn: () => apiClient.get('/growth/campaigns'),
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
                <Megaphone className="w-3.5 h-3.5 mr-1" />
                AI Campaign Generator & Orchestration
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Elasticity Modeling
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Automated Merchant Growth Campaigns
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Formulate micro-targeted promotional vouchers, forecast gross revenue lift, and automate multi-channel buyer notifications.
            </p>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(campaigns || []).map((cmp) => (
          <div
            key={cmp.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge
                  className={`text-[9px] font-bold ${
                    cmp.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {cmp.status}
                </Badge>
                <Badge variant="outline" className="font-mono text-[9px] bg-slate-50 text-slate-700">
                  Code: {cmp.discount_code}
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{cmp.name}</h3>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Target: <strong className="text-slate-700">{cmp.target_segment}</strong>
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 text-[10px] block font-semibold">Projected Revenue Lift</span>
                  <span className="font-bold text-[#0B72E7] font-mono text-sm">
                    ₹{(cmp.expected_revenue_lift_inr / 100000).toFixed(2)} Lakhs
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 text-[10px] block font-semibold">Orders / Conv Lift</span>
                  <span className="font-bold text-emerald-600 font-mono text-xs">
                    {cmp.projected_orders} ord (+{cmp.conversion_lift_pct}%)
                  </span>
                </div>
              </div>

              {/* Channels */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Distribution Channels
                </span>
                <div className="flex flex-wrap gap-1">
                  {cmp.channels.map((ch, idx) => (
                    <Badge key={idx} variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px]">
                      {ch}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 border-slate-200 mt-2"
            >
              Simulate Elasticity
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
