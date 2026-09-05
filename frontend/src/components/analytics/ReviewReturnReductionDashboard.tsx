'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  MerchantReviewReturnOverview,
  SuggestedImprovement
} from '@/types/review-return-agent';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  AlertCircle,
  ThumbsUp,
  RefreshCw,
  CheckCircle2,
  Wrench,
  Package,
  Layers,
  Zap,
  ArrowDownRight,
  BarChart3,
  Percent,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ReviewReturnReductionDashboard() {
  const queryClient = useQueryClient();
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const { data: overview, isLoading, refetch } = useQuery<MerchantReviewReturnOverview>({
    queryKey: ['merchant-review-return', 'overview'],
    queryFn: () => apiClient.get('/review-return/merchant/overview'),
  });

  const mitigateMutation = useMutation({
    mutationFn: (improvementId: string) =>
      apiClient.post(`/review-return/merchant/mitigate/${improvementId}`, {}),
    onSuccess: (_, impId) => {
      setAppliedId(impId);
      setTimeout(() => setAppliedId(null), 3500);
      queryClient.invalidateQueries({ queryKey: ['merchant-review-return', 'overview'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Analyzing review sentiment and return trends...</p>
      </div>
    );
  }

  const complaintCategories = overview?.complaint_categories || [];
  const returnTrends = overview?.return_trends || [];
  const sentimentAspects = overview?.sentiment_aspects || [];
  const suggestedImprovements = overview?.suggested_improvements || [];
  const productSummaries = overview?.product_summaries || [];

  // Recharts complaint bar data
  const complaintChartData = complaintCategories.map((c) => ({
    category: c.category_name.length > 18 ? c.category_name.substring(0, 16) + '...' : c.category_name,
    complaints: c.complaint_count,
    return_correlation: c.return_rate_correlation_pct,
  }));

  // Recharts sentiment aspect data
  const sentimentChartData = sentimentAspects.map((a) => ({
    aspect: a.aspect.length > 16 ? a.aspect.substring(0, 14) + '...' : a.aspect,
    Positive: a.positive_pct,
    Neutral: a.neutral_pct,
    Negative: a.negative_pct,
  }));

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-300" />
                Review Intelligence & Return Reduction Agent
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <TrendingDown className="w-3.5 h-3.5 mr-1" />
                -75% Return Reduction Active
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Return Reduction & Review Intelligence Center
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Synthesizes customer sentiment, extracts recurring complaints, correlates return causes,
              and orchestrates autonomous mitigations to drive returns below 3.5%.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl text-xs font-semibold backdrop-blur-md"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Current Return Rate */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Return Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {overview?.overall_return_rate_pct}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3" /> Down from {overview?.baseline_return_rate_pct}% baseline
          </div>
        </div>

        {/* Predicted Return Reduction Impact */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Return Reduction Lift</span>
            <TrendingDown className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#0B72E7] font-mono">
            -{overview?.predicted_return_reduction_pct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Autonomous intervention impact
          </div>
        </div>

        {/* Product Sentiment Score */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Product Sentiment Score</span>
            <ThumbsUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600 font-mono">
            {overview?.overall_sentiment_score_pct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 482 verified reviews
          </div>
        </div>

        {/* Total Complaints Analyzed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Recurring Complaints</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {overview?.total_complaints_analyzed}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Grouped into 5 core friction clusters
          </div>
        </div>

        {/* Saved Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Saved Net Revenue</span>
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ₹{((overview?.total_saved_revenue_inr || 0) / 100000).toFixed(2)}L
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Prevented return logistics costs
          </div>
        </div>
      </div>

      {/* 3. Proactive Suggested Improvements with 1-Click Execution */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Suggested Improvements & Return Reduction Actions
            </h2>
            <p className="text-xs text-slate-500">
              The agent synthesized complaint clusters and generated verified mitigations with predicted return reduction impact.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {suggestedImprovements.map((imp) => {
            const isApplied = imp.status === 'APPLIED' || appliedId === imp.id;
            return (
              <div
                key={imp.id}
                className={`rounded-2xl border p-5 transition-all flex flex-col justify-between space-y-3 ${
                  isApplied
                    ? 'bg-emerald-50/60 border-emerald-300'
                    : 'bg-slate-50/60 border-slate-200/80 hover:border-blue-300 shadow-2xs'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge
                      className={`text-[9px] font-bold ${
                        isApplied
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}
                    >
                      {isApplied ? 'MITIGATION ACTIVE' : 'PROPOSED ACTION'}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-emerald-600">
                      {Math.round(imp.confidence_score * 100)}% Conf
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{imp.title}</h3>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Target: <strong className="text-slate-700">{imp.issue_addressed}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {imp.recommended_action}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Predicted Reduction
                      </span>
                      <strong className="text-xs font-mono font-bold text-emerald-600">
                        -{imp.predicted_return_reduction_pct}% Risk
                      </strong>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Saved Revenue
                      </span>
                      <strong className="text-xs font-mono font-bold text-[#0B72E7]">
                        +₹{(imp.expected_saved_revenue_inr / 1000).toFixed(0)}k
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {isApplied ? (
                    <Button
                      disabled
                      size="sm"
                      className="w-full bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-default"
                    >
                      <Check className="w-3.5 h-3.5" /> Mitigation Executed
                    </Button>
                  ) : (
                    <Button
                      onClick={() => mitigateMutation.mutate(imp.id)}
                      disabled={mitigateMutation.isPending}
                      size="sm"
                      className="w-full bg-[#0B72E7] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5" /> Execute Mitigation (1-Click)
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Visual Charts: Return Trends & Complaint Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Return Trends vs Target SLA */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                6-Month Return Rate Trendline (%)
              </h3>
              <p className="text-xs text-slate-500">
                Baseline historical return trajectory vs Agent-mitigated trajectory.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono bg-slate-50">
              Live Trajectory
            </Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={returnTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="period_label" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#64748b"
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [`${value}%`, name]}
                  contentStyle={{ borderRadius: '12px', borderColor: '#cbd5e1' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="baseline_return_rate_pct"
                  name="Baseline Return Rate"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="actual_return_rate_pct"
                  name="Mitigated Return Rate"
                  stroke="#10b981"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Recurring Complaint Categories Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Recurring Complaint Categories & Return Correlation
              </h3>
              <p className="text-xs text-slate-500">
                Volume of complaints and their statistical correlation with product returns.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono bg-slate-50">
              Root Causes
            </Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complaintChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} stroke="#64748b" />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#0B72E7"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#f59e0b"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  formatter={(value: any, name: any) =>
                    name === 'Complaints Count' ? [value, name] : [`${value}%`, name]
                  }
                  contentStyle={{ borderRadius: '12px', borderColor: '#cbd5e1' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  yAxisId="left"
                  dataKey="complaints"
                  name="Complaints Count"
                  fill="#0B72E7"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="return_correlation"
                  name="Return Correlation (%)"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Product Sentiment Aspect Scores */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Product Aspect Sentiment Analysis
          </h3>
          <p className="text-xs text-slate-500">
            Natural language review aspect breakdown isolating positive praise vs setup friction drivers.
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sentimentChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="aspect" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" tickFormatter={(val) => `${val}%`} />
              <Tooltip
                formatter={(value: any, name: any) => [`${value}%`, name]}
                contentStyle={{ borderRadius: '12px', borderColor: '#cbd5e1' }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Positive" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Neutral" fill="#94a3b8" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Negative" fill="#ef4444" stackId="a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. Product-Level Return Risk & Sentiment Drilldown Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Product Catalog Return Risk & Sentiment Drilldown
          </h3>
          <p className="text-xs text-slate-500">
            Individual SKU-level metrics tracking orders, return counts, return rates, and primary complaint driver.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-3">Product SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Orders</th>
                <th className="py-3 px-3">Returns</th>
                <th className="py-3 px-3">Return Rate</th>
                <th className="py-3 px-3">Sentiment Score</th>
                <th className="py-3 px-3">Top Complaint Driver</th>
                <th className="py-3 px-3">Risk Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productSummaries.map((p) => (
                <tr key={p.product_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-800">{p.product_name}</td>
                  <td className="py-3 px-3 text-slate-500">{p.category}</td>
                  <td className="py-3 px-3 font-mono">{p.total_orders.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 font-mono">{p.return_count}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{p.return_rate_pct}%</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                    {Math.round(p.sentiment_score * 100)}%
                  </td>
                  <td className="py-3 px-3 text-slate-600 italic truncate max-w-[200px]">
                    {p.top_complaint}
                  </td>
                  <td className="py-3 px-3">
                    <Badge
                      className={`text-[9px] font-bold ${
                        p.return_risk_tier === 'LOW'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {p.return_risk_tier}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
