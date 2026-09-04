'use client';

import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldCheck, 
  SearchCheck, 
  ArrowRight,
  Clock,
  Building2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const AIInsightsGrid: React.FC = () => {
  const insights = [
    {
      title: 'Top Rising Risk Vendor',
      vendor: 'ABC Logistics',
      score: '82 / 100',
      tag: '+14% MoM',
      tagColor: 'text-rose-700 bg-rose-50 border-rose-200',
      description: 'Carrier invoice timing lag spikes have accelerated risk from 72 to 82 over the last 30 days.',
      icon: TrendingUp,
      iconColor: 'text-rose-600 bg-rose-50',
    },
    {
      title: 'Most Frequent Exception Pattern',
      vendor: 'Settlement Delays',
      score: '24 Incidents',
      tag: '65% of Excs',
      tagColor: 'text-amber-700 bg-amber-50 border-amber-200',
      description: 'Disparate batch EDI manifests account for the majority of manual operator interventions.',
      icon: Clock,
      iconColor: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'Most Improved Vendor',
      vendor: 'Shopify DTC Payments',
      score: '99.8% Match',
      tag: '0.2% Variance',
      tagColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      description: 'Direct gross-to-net netting auto-resolves with sub-₹50 GST rounding tolerances.',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Recommended Audit Candidate',
      vendor: 'Alpha Tech Consulting LLC',
      score: '92 / 100',
      tag: 'Priority 1',
      tagColor: 'text-purple-700 bg-purple-50 border-purple-200',
      description: 'Unregistered beneficiary wire transfers require procurement master agreement & GSTIN audit.',
      icon: SearchCheck,
      iconColor: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-[#072654] tracking-tight">
            AI Financial Operations Insights
          </h2>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Prescriptive intelligence synthesized across historical behavioral patterns & reconciliation feeds
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#0B72E7] font-semibold">
          <Sparkles className="h-4 w-4" />
          <span>Real-Time Synthesized</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <Card 
              key={item.title}
              className="border border-slate-200/90 bg-white rounded-2xl p-4 shadow-xs hover:shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl border border-slate-100 ${item.iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${item.tagColor}`}>
                    {item.tag}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                    {item.title}
                  </span>
                  <h4 className="text-[15px] font-bold text-[#072654] mt-0.5 leading-tight">
                    {item.vendor}
                  </h4>
                  <span className="text-xs font-mono font-bold text-[#0B72E7] block mt-0.5">
                    {item.score}
                  </span>
                </div>

                <p className="text-[12px] text-slate-600 leading-relaxed pt-1">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Actionable Insight</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
