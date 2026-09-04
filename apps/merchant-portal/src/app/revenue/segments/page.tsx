'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CustomerSegment } from '@/types/growth';
import { 
  Layers, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function GrowthSegmentsPage() {
  const { data: segments, isLoading } = useQuery<CustomerSegment[]>({
    queryKey: ['growth', 'segments'],
    queryFn: () => apiClient.get('/growth/segments'),
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
                <Layers className="w-3.5 h-3.5 mr-1" />
                RFM Customer Segmentation
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <Users className="w-3.5 h-3.5 mr-1" />
                Cluster Intelligence
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Behavioral Merchant Clusters & GMV Cohorts
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Segment buyers according to recency, frequency, monetary value (RFM), and catalog category preferences.
            </p>
          </div>
        </div>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(segments || []).map((seg) => (
          <div
            key={seg.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">{seg.name}</h3>
                <Badge variant="outline" className="font-mono text-[10px] bg-blue-50 text-[#0B72E7] border-blue-200">
                  {seg.reach_merchants} Merchants
                </Badge>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                  <span className="text-slate-400 text-[10px] block font-semibold">Average Order</span>
                  <span className="font-bold text-slate-900 font-mono text-xs">
                    ₹{seg.average_order_value.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                  <span className="text-slate-400 text-[10px] block font-semibold">Monthly GMV</span>
                  <span className="font-bold text-[#0B72E7] font-mono text-xs">
                    ₹{(seg.monthly_gmv / 100000).toFixed(1)}L
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                  <span className="text-slate-400 text-[10px] block font-semibold">Churn Risk</span>
                  <span className={`font-bold font-mono text-xs ${seg.churn_risk_pct > 20 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {seg.churn_risk_pct}%
                  </span>
                </div>
              </div>

              {/* Affinity */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Product Affinity
                </span>
                <p className="text-slate-700 font-medium">{seg.affinity}</p>
              </div>

              {/* Recommended Action */}
              <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0B72E7] uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  Recommended AI Playbook
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {seg.recommended_action}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Launch Targeted Campaign
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
