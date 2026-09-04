'use client';

import React from 'react';
import { 
  Users, 
  TrendingUp, 
  ShieldAlert, 
  ShoppingBag, 
  Sparkles, 
  Tag, 
  ArrowRight,
  Radio,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomerSegment } from '@/types/campaign';

interface CustomerSegmentGridProps {
  segments: CustomerSegment[];
  onGenerateForSegment: (segmentId: string) => void;
}

export function CustomerSegmentGrid({
  segments,
  onGenerateForSegment
}: CustomerSegmentGridProps) {
  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getChurnBadge = (churnRisk: number) => {
    if (churnRisk > 50) {
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-semibold">
          {churnRisk}% High Risk
        </Badge>
      );
    }
    if (churnRisk > 20) {
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-semibold">
          {churnRisk}% Moderate
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
        {churnRisk}% Stable
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#072654]">Customer Segmentation & Behavioral Clusters</h2>
          <p className="text-[11px] text-slate-500">
            RFM clustered merchant segments with tailored discount elasticity profiles and multi-channel outreach strategies.
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-mono font-semibold text-slate-500 bg-white">
          5 Behavioral Segments
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((seg) => (
          <div
            key={seg.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 flex flex-col justify-between hover:border-blue-200 transition-all hover:shadow-xs group"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0B72E7] transition-colors">
                    {seg.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">ID: {seg.id}</span>
                </div>
                {getChurnBadge(seg.churn_risk_pct)}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                {seg.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {seg.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Merchants</span>
                  <span className="font-bold text-slate-800 font-mono">{seg.merchant_count.toLocaleString()}</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg Order Value</span>
                  <span className="font-bold text-slate-800 font-mono">₹{seg.avg_order_value.toLocaleString('en-IN')}</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Segment GMV</span>
                  <span className="font-bold text-[#0B72E7] font-mono">{formatINR(seg.total_gmv)}</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Optimal Discount</span>
                  <span className="font-bold text-emerald-600 font-mono">{seg.recommended_discount_range}</span>
                </div>
              </div>
            </div>

            {/* Action Trigger */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400">
                Outreach: <strong className="text-slate-600">{seg.optimal_channel}</strong>
              </span>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onGenerateForSegment(seg.id)}
                className="text-xs font-bold text-[#0B72E7] hover:bg-blue-50 border-blue-200 gap-1 h-8"
              >
                <Sparkles className="h-3 w-3" />
                Launch Campaign
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
