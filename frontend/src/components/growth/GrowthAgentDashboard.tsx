'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Package,
  Layers,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Tag,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

interface GrowthRecommendation {
  id: string;
  category: string;
  category_label: string;
  title: string;
  insight: string;
  reason: string;
  recommended_action: string;
  expected_revenue_impact: string;
  expected_revenue_lift_inr: number;
  confidence_score: number;
  target_product_id?: string;
  target_product_name?: string;
  target_product_image?: string;
  tags: string[];
  status: 'PENDING' | 'APPLIED' | 'DISMISSED';
  action_type: string;
}

interface GrowthDashboardProps {
  onOpenChatWithQuery?: (query: string) => void;
}

export function GrowthAgentDashboard({ onOpenChatWithQuery }: GrowthDashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    apiClient.get<any>('/merchant/growth-agent/overview')
      .then((res) => setData(res))
      .catch((err) => console.error('Failed to load growth overview', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (recId: string) => {
    setApplyingId(recId);
    try {
      await apiClient.post(`/merchant/growth-agent/apply/${recId}?applied_by=Merchant Admin`);
      loadData();
    } catch (e) {
      console.error('Failed to apply strategy', e);
    } finally {
      setApplyingId(null);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
        Analyzing Sales Velocity, Inventory Depletion, and Customer Behavior...
      </div>
    );
  }

  const filteredRecs: GrowthRecommendation[] =
    activeFilter === 'ALL'
      ? data.recommendations
      : data.recommendations.filter((r: GrowthRecommendation) => r.category === activeFilter);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#0B72E7] rounded-2xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#072654]">
                Autonomous Merchant Growth Intelligence
              </h2>
              <Badge variant="outline" className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px] font-bold">
                Live AI Advisor
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Continuously evaluating sales velocity, inventory aging, basket associations, and campaign lift.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="rounded-xl text-xs font-bold border-slate-200 gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Signals</span>
          </Button>
          {onOpenChatWithQuery && (
            <Button
              size="sm"
              onClick={() => onOpenChatWithQuery('How can I boost my AOV before month close?')}
              className="rounded-xl text-xs font-bold bg-[#0B72E7] text-white hover:bg-[#095ec2] gap-1.5 shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask Growth Agent</span>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Projected Monthly Lift',
            val: `+₹${(data.total_projected_lift_inr / 100000).toFixed(2)}L`,
            sub: 'Across 5 Identified Levers',
            icon: TrendingUp,
            color: 'text-emerald-600'
          },
          {
            label: 'Declining SKUs Detected',
            val: data.declining_skus_count,
            sub: 'Requires Clearance / Bundling',
            icon: TrendingDown,
            color: 'text-rose-600'
          },
          {
            label: 'Open Growth Opportunities',
            val: data.open_opportunities_count,
            sub: 'Demand Surges & Cross-Sells',
            icon: Zap,
            color: 'text-purple-600'
          },
          {
            label: 'AI Recommendation Confidence',
            val: `${(data.avg_confidence_score * 100).toFixed(1)}%`,
            sub: 'Historical Lift Verification',
            icon: ShieldCheck,
            color: 'text-blue-600'
          }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-black font-mono text-slate-900">{kpi.val}</p>
              <span className="text-[10px] font-medium text-emerald-700 block">{kpi.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Projected Lift Waterfall Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#072654] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Projected Revenue Lift Trajectory (Monthly Waterfall)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Cumulative monthly gross expansion by executing agent-recommended strategies.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            Target: ₹33.23L / mo
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.revenue_growth_waterfall} margin={{ top: 15, right: 15, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="factor" tick={{ fontSize: 10, fill: '#64748B' }} />
              <YAxis
                tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                tick={{ fontSize: 10, fill: '#64748B' }}
              />
              <Tooltip
                formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Projected Amount']}
                contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E2E8F0' }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {data.revenue_growth_waterfall.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.type === 'baseline'
                        ? '#64748B'
                        : entry.type === 'target'
                        ? '#0B72E7'
                        : '#10B981'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'All Growth Levers' },
          { id: 'DECLINING_PRODUCT', label: 'Declining Products' },
          { id: 'REVENUE_OPPORTUNITY', label: 'Revenue Opportunities' },
          { id: 'DISCOUNT_RECOMMENDATION', label: 'Discounts' },
          { id: 'BUNDLE_RECOMMENDATION', label: 'Bundles' },
          { id: 'UPSELL_CROSS_SELL', label: 'Cross-Sell / Upsell' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-[#072654] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Structured Recommendation Cards */}
      <div className="space-y-4">
        {filteredRecs.map((rec) => (
          <div
            key={rec.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5 hover:border-blue-200 transition-all"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={`text-[10px] font-extrabold uppercase ${
                    rec.category === 'DECLINING_PRODUCT'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : rec.category === 'REVENUE_OPPORTUNITY'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : rec.category === 'BUNDLE_RECOMMENDATION'
                      ? 'bg-blue-50 text-[#0B72E7] border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {rec.category_label}
                </Badge>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {rec.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
                  Confidence: {Math.round(rec.confidence_score * 100)}%
                </span>
                {rec.status === 'APPLIED' && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                    STRATEGY ACTIVE
                  </Badge>
                )}
              </div>
            </div>

            {/* The 5 Mandatory Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* 1. Insight */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  1. Diagnosis & Insight:
                </span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {rec.insight}
                </p>
              </div>

              {/* 2. Reason */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  2. Reasoning Behind Recommendation:
                </span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {rec.reason}
                </p>
              </div>

              {/* 3. Recommended Action */}
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-1">
                <span className="text-[11px] font-bold text-[#0B72E7] uppercase tracking-wider block">
                  3. Recommended Action:
                </span>
                <p className="text-slate-900 font-bold leading-relaxed">
                  {rec.recommended_action}
                </p>
              </div>

              {/* 4. Expected Revenue Impact */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 space-y-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    4. Expected Revenue Impact:
                  </span>
                  <p className="text-emerald-950 font-black text-sm leading-relaxed mt-0.5">
                    {rec.expected_revenue_impact}
                  </p>
                </div>
                <span className="text-[10px] text-emerald-700 font-mono font-bold">
                  Estimated Lift: +₹{rec.expected_revenue_lift_inr.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Footer Action & Tags */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 flex-wrap">
                {rec.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                    #{t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {onOpenChatWithQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenChatWithQuery(`Tell me more about ${rec.title}`)}
                    className="rounded-xl text-xs font-bold border-slate-200 h-9"
                  >
                    Discuss with Agent
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={() => handleApply(rec.id)}
                  disabled={rec.status === 'APPLIED' || applyingId === rec.id}
                  className={`rounded-xl text-xs font-bold h-9 gap-1.5 px-4 ${
                    rec.status === 'APPLIED'
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-[#0B72E7] hover:bg-[#095ec2] text-white shadow-xs'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {rec.status === 'APPLIED'
                      ? 'Applied'
                      : applyingId === rec.id
                      ? 'Applying...'
                      : 'Apply Strategy (1-Click)'}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recently Applied Actions Ledger */}
      {data.recent_applied_actions && data.recent_applied_actions.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#072654]">Recently Executed Growth Actions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-bold">Strategy Title</th>
                  <th className="pb-3 font-bold">Category</th>
                  <th className="pb-3 font-bold">Executed At</th>
                  <th className="pb-3 font-bold">Executed By</th>
                  <th className="pb-3 font-bold">Recorded Lift</th>
                  <th className="pb-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recent_applied_actions.map((act: any) => (
                  <tr key={act.id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-bold text-slate-800">{act.title}</td>
                    <td className="py-3">
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {act.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{act.applied_at}</td>
                    <td className="py-3 text-slate-700">{act.applied_by}</td>
                    <td className="py-3 font-mono font-bold text-emerald-600">
                      +₹{act.revenue_lift_recorded_inr.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                        ACTIVE
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
