'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  CampaignOptimizerOverview,
  OptimizedCampaign,
  CampaignOpportunity,
  CampaignImprovement
} from '@/types/campaign-optimizer';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  Megaphone,
  Sparkles,
  TrendingUp,
  Target,
  Percent,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Sliders,
  Package,
  Layers,
  BarChart3,
  Lightbulb,
  Plus,
  RefreshCw,
  Send,
  MessageSquare,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function CampaignOptimizationDashboard() {
  const queryClient = useQueryClient();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('camp_fy_refresh_2026');
  const [activeTab, setActiveTab] = useState<'campaigns' | 'historical' | 'improvements'>('campaigns');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [applySuccessId, setApplySuccessId] = useState<string | null>(null);

  // New campaign modal state
  const [targetSegment, setTargetSegment] = useState<string>('seg_enterprise');
  const [campaignObjective, setCampaignObjective] = useState<string>('Enterprise High-Volume Hardware Upgrade & FinOps Modernization');
  const [targetProductsInput, setTargetProductsInput] = useState<string>('Razorpay Android Smart POS, Barcode Scanner 2D');
  const [suggestedDiscount, setSuggestedDiscount] = useState<number>(15);
  const [durationDays, setDurationDays] = useState<number>(14);

  // Fetch overview data
  const { data: overview, isLoading, refetch } = useQuery<CampaignOptimizerOverview>({
    queryKey: ['campaign-optimizer', 'overview'],
    queryFn: () => apiClient.get('/campaigns/optimizer/overview'),
  });

  // Apply improvement mutation
  const applyImprovementMutation = useMutation({
    mutationFn: (recId: string) =>
      apiClient.post(`/campaigns/optimizer/improvements/${recId}/apply`, {}),
    onSuccess: (_, recId) => {
      setApplySuccessId(recId);
      setTimeout(() => setApplySuccessId(null), 3000);
      queryClient.invalidateQueries({ queryKey: ['campaign-optimizer', 'overview'] });
    },
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: (payload: any) =>
      apiClient.post('/campaigns/optimizer/generate', payload),
    onSuccess: () => {
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['campaign-optimizer', 'overview'] });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const products = targetProductsInput.split(',').map((p) => p.trim()).filter(Boolean);
    createCampaignMutation.mutate({
      target_segment_id: targetSegment,
      campaign_objective: campaignObjective,
      target_products: products.length > 0 ? products : ['Razorpay Android Smart POS'],
      suggested_discount_pct: suggestedDiscount,
      min_order_value: 5000,
      duration_days: durationDays,
      channels: ['WhatsApp Business', 'Email Direct'],
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Analyzing historical sales & optimizing campaigns...</p>
      </div>
    );
  }

  const campaigns = overview?.campaigns || [];
  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];
  const opportunities = overview?.identified_opportunities || [];
  const improvements = overview?.active_improvements || [];
  const historicalTrends = overview?.historical_sales_trends || [];
  const channelMetrics = overview?.channel_attribution_summary || [];

  // Trajectory chart data from selected campaign
  const trajectoryData = selectedCampaign?.trajectory || [];

  // ROI vs Revenue comparison chart data
  const comparisonData = campaigns.map((c) => ({
    name: c.name.length > 20 ? c.name.substring(0, 18) + '...' : c.name,
    predicted_roi: c.predicted_roi,
    revenue_lift_lakhs: Number((c.estimated_revenue_increase / 100000).toFixed(2)),
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
                <Megaphone className="w-3.5 h-3.5 mr-1" />
                Autonomous Campaign Optimization Agent
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Elasticity & ROI Engine Active
              </Badge>
              <Badge className="bg-blue-400/20 text-blue-100 border-blue-300/30 text-xs font-mono">
                Continuous Telemetry
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Campaign Optimization & Orchestration
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Continuously analyzes historical sales patterns, discovers unmet revenue opportunities,
              optimizes discount percentages, estimates ROI, and proactively executes improvements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl text-xs font-semibold backdrop-blur-md"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh Telemetry
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="sm"
              className="bg-white text-[#072654] hover:bg-blue-50 font-bold rounded-xl text-xs shadow-md border-0"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Generate AI Campaign
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Projected Revenue Lift */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Projected Revenue Lift</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ₹{((overview?.total_projected_revenue_increase || 0) / 100000).toFixed(2)}L
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Across {overview?.total_campaigns} campaigns
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Campaigns</span>
            <Megaphone className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {overview?.active_campaigns} <span className="text-xs font-normal text-slate-400">/ {overview?.total_campaigns}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Real-time automated pacing
          </div>
        </div>

        {/* Average Predicted ROI */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Predicted ROI</span>
            <Percent className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600 font-mono">
            {overview?.avg_predicted_roi}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Min 260% &bull; Max 410% ROI
          </div>
        </div>

        {/* Average Confidence Score */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Confidence</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {Math.round((overview?.avg_confidence_score || 0) * 100)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Bayesian elasticity model
          </div>
        </div>

        {/* Top Channel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Performing Channel</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-base font-black text-slate-900 leading-tight">
            WhatsApp Business
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">
            6.8x ROAS (19.4% CTR)
          </div>
        </div>
      </div>

      {/* 3. Proactive Campaign Improvement Recommendations */}
      <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 rounded-3xl border border-blue-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Proactive AI Campaign Improvements
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] font-mono">
                  {improvements.filter((i) => i.status === 'PENDING').length} Pending
                </Badge>
              </h2>
              <p className="text-xs text-slate-500">
                The agent continuously analyzes ongoing campaigns and suggests high-impact adjustments.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {improvements.map((imp) => {
            const isApplied = imp.status === 'APPLIED' || applySuccessId === imp.id;
            return (
              <div
                key={imp.id}
                className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                  isApplied
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-white border-slate-200/80 hover:border-blue-300 shadow-xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      className={`text-[9px] font-bold ${
                        isApplied
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {imp.recommendation_type.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-[11px] font-mono font-bold text-emerald-600">
                      {Math.round(imp.confidence_score * 100)}% Conf
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">
                      {imp.campaign_name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 italic leading-relaxed">
                      &quot;{imp.insight}&quot;
                    </p>
                  </div>

                  <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/60 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Actionable Improvement
                    </span>
                    <p className="font-semibold text-slate-800 text-[11px] leading-relaxed">
                      {imp.recommended_improvement}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Projected Gain:</span>
                      <strong className="text-emerald-600 font-mono font-bold">
                        {imp.expected_additional_lift}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  {isApplied ? (
                    <Button
                      disabled
                      size="sm"
                      className="w-full bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-default"
                    >
                      <Check className="w-3.5 h-3.5" /> Optimization Applied
                    </Button>
                  ) : (
                    <Button
                      onClick={() => applyImprovementMutation.mutate(imp.id)}
                      disabled={applyImprovementMutation.isPending}
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" /> Apply Optimization (1-Click)
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Visual Performance Charts (Recharts) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Campaign Performance & Forecasting Visualizations
            </h2>
            <p className="text-xs text-slate-500">
              Comparing baseline revenue against projected campaign uplift and channel conversion rates.
            </p>
          </div>

          {/* Campaign Selector for Trajectory */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Active Campaign:</span>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.predicted_roi_display})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Revenue Trajectory & Lift */}
          <div className="bg-slate-50/60 rounded-2xl border border-slate-200/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                14-Day Revenue Trajectory & Incremental Lift (₹)
              </span>
              <Badge variant="outline" className="text-[10px] font-mono bg-white">
                {selectedCampaign?.name}
              </Badge>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCampaign" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B72E7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0B72E7" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date_label" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="#64748b"
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                    labelStyle={{ fontWeight: 'bold' }}
                    contentStyle={{ borderRadius: '12px', borderColor: '#cbd5e1' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey="baseline_revenue"
                    name="Baseline Revenue"
                    stroke="#94a3b8"
                    fillOpacity={1}
                    fill="url(#colorBase)"
                  />
                  <Area
                    type="monotone"
                    dataKey="campaign_revenue"
                    name="Optimized Campaign Revenue"
                    stroke="#0B72E7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCampaign)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Predicted ROI vs Estimated Revenue Lift */}
          <div className="bg-slate-50/60 rounded-2xl border border-slate-200/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Predicted ROI (%) vs Revenue Lift (₹ Lakhs)
              </span>
              <Badge variant="outline" className="text-[10px] font-mono bg-white">
                Multi-Campaign Portfolio
              </Badge>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#64748b" />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#0B72E7"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => `₹${val}L`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#10b981"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) =>
                      name === 'Revenue Lift (₹ Lakhs)'
                        ? [`₹${value} Lakhs`, name]
                        : [`${value}%`, name]
                    }
                    contentStyle={{ borderRadius: '12px', borderColor: '#cbd5e1' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue_lift_lakhs"
                    name="Revenue Lift (₹ Lakhs)"
                    fill="#0B72E7"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="predicted_roi"
                    name="Predicted ROI (%)"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Channel Performance Bar Strip */}
        <div className="border-t border-slate-100 pt-4">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
            Multi-Channel Attribution & Conversion Benchmark
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {channelMetrics.map((ch, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-slate-800">{ch.channel}</strong>
                  <Badge className="text-[9px] bg-blue-100 text-blue-800 border-blue-200">
                    {ch.roas}x ROAS
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Open Rate</span>
                    <span className="font-mono font-semibold">{ch.open_rate_pct}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CTR / Conv</span>
                    <span className="font-mono font-semibold text-emerald-600">
                      {ch.click_through_rate_pct}% / {ch.conversion_rate_pct}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Historical Sales Opportunities Identified by Agent */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Opportunities Identified from Historical Sales
            </h2>
            <p className="text-xs text-slate-500">
              The agent analyzed transaction frequency, inventory aging, and seasonal demand to discover these high-lift opportunities.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-slate-50/70 rounded-2xl border border-slate-200/70 p-4 flex flex-col justify-between space-y-3 hover:border-indigo-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] bg-white font-mono text-slate-700">
                    {opp.category}
                  </Badge>
                  <span className="text-[11px] font-bold text-emerald-600 font-mono">
                    {Math.round(opp.confidence_score * 100)}% Conf
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{opp.title}</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">{opp.rationale}</p>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Target SKUs:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                      {opp.target_skus.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Suggested Discount:</span>
                    <strong className="text-indigo-600 font-mono">
                      {opp.recommended_discount_pct}% OFF
                    </strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Revenue Potential:</span>
                    <strong className="text-emerald-600 font-mono">
                      ₹{(opp.estimated_revenue_potential / 100000).toFixed(2)} Lakhs
                    </strong>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  setTargetSegment(opp.target_segment);
                  setCampaignObjective(opp.title);
                  setTargetProductsInput(opp.target_skus.join(', '));
                  setSuggestedDiscount(opp.recommended_discount_pct);
                  setIsCreateModalOpen(true);
                }}
                variant="outline"
                size="sm"
                className="w-full rounded-xl text-xs font-semibold text-indigo-700 border-indigo-200 hover:bg-indigo-50"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Auto-Launch Campaign
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Active & Scheduled Optimized Campaigns Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              AI Optimized Campaigns ({campaigns.length})
            </h2>
            <p className="text-xs text-slate-500">
              Each campaign provides target products, strategic objective, predicted ROI, estimated revenue increase, and confidence score.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {campaigns.map((cmp) => (
            <div
              key={cmp.id}
              className={`bg-white rounded-3xl border p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${
                cmp.id === selectedCampaignId ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200/80'
              }`}
            >
              <div className="space-y-3">
                {/* Header Strip */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-[9px] font-bold ${
                        cmp.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {cmp.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-mono bg-slate-50 text-slate-700">
                      Code: {cmp.discount_code}
                    </Badge>
                  </div>

                  {/* Confidence Score Pill */}
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 text-xs font-bold font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {Math.round(cmp.confidence_score * 100)}% Confidence
                  </div>
                </div>

                {/* Title & Objective */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{cmp.name}</h3>
                  <div className="mt-1 bg-blue-50/50 rounded-xl p-2.5 border border-blue-100">
                    <span className="text-[10px] uppercase font-bold text-blue-800 block mb-0.5">
                      Campaign Objective
                    </span>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed">
                      {cmp.campaign_objective}
                    </p>
                  </div>
                </div>

                {/* Target Products Badges (Required Dimension) */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Target Products ({cmp.target_products.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cmp.target_products.map((prod, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-slate-50 text-slate-800 border-slate-200 text-xs font-semibold py-1 px-2.5 rounded-lg flex items-center gap-1"
                      >
                        <Package className="w-3 h-3 text-blue-600" />
                        {prod}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Mandatory Metric Grid (Predicted ROI & Estimated Revenue Increase) */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/80">
                    <span className="text-emerald-800 text-[10px] block font-semibold">Predicted ROI</span>
                    <span className="font-bold text-emerald-700 font-mono text-sm">
                      {cmp.predicted_roi_display}
                    </span>
                  </div>

                  <div className="bg-blue-50/80 p-2.5 rounded-xl border border-blue-200/80">
                    <span className="text-blue-800 text-[10px] block font-semibold">Est. Revenue Increase</span>
                    <span className="font-bold text-[#0B72E7] font-mono text-xs">
                      {cmp.estimated_revenue_increase_display}
                    </span>
                  </div>

                  <div className="bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-200/80">
                    <span className="text-indigo-800 text-[10px] block font-semibold">Suggested Discount</span>
                    <span className="font-bold text-indigo-700 font-mono text-sm">
                      {cmp.suggested_discount_pct}% OFF
                    </span>
                  </div>
                </div>

                {/* AI Creative Copy Snippet */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
                    <MessageSquare className="w-3 h-3 text-blue-600" />
                    <span>Subject: {cmp.ai_copy_subject}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                    &quot;{cmp.ai_copy_body}&quot;
                  </p>
                </div>

                {/* Distribution Channels */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Channels:</span>
                    {cmp.channels.map((ch, idx) => (
                      <Badge key={idx} variant="outline" className="text-[10px] text-slate-600 bg-white">
                        {ch}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Duration: <strong>{cmp.duration_days} Days</strong>
                  </span>
                </div>
              </div>

              {/* Select & View Trajectory Button */}
              <Button
                onClick={() => setSelectedCampaignId(cmp.id)}
                variant={cmp.id === selectedCampaignId ? 'default' : 'outline'}
                size="sm"
                className={`w-full rounded-xl text-xs font-semibold ${
                  cmp.id === selectedCampaignId
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cmp.id === selectedCampaignId ? 'Viewing Trajectory Chart' : 'Inspect Pacing Trajectory'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Modal: AI Campaign Generator */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">AI Campaign Generator</h3>
                  <p className="text-xs text-slate-500">Autonomous Elasticity & ROI Optimization</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Campaign Strategic Objective
                </label>
                <input
                  type="text"
                  value={campaignObjective}
                  onChange={(e) => setCampaignObjective(e.target.value)}
                  required
                  placeholder="e.g. Boost FY26 Year-End Android POS Terminals"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Target Products (Comma-separated SKUs)
                </label>
                <input
                  type="text"
                  value={targetProductsInput}
                  onChange={(e) => setTargetProductsInput(e.target.value)}
                  required
                  placeholder="Razorpay Android Smart POS, Barcode Scanner 2D"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Target Customer Segment
                  </label>
                  <select
                    value={targetSegment}
                    onChange={(e) => setTargetSegment(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="seg_enterprise">High-Volume Enterprise</option>
                    <option value="seg_d2c_growth">Fast-Growing D2C Retailers</option>
                    <option value="seg_at_risk">At-Risk Inactive Merchants</option>
                    <option value="seg_festive">Seasonal Festive Sellers</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min={7}
                    max={60}
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Elasticity Discount Slider */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Suggested Discount Percentage</span>
                  <span className="font-bold text-blue-600 font-mono text-sm">{suggestedDiscount}% OFF</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={35}
                  step={1}
                  value={suggestedDiscount}
                  onChange={(e) => setSuggestedDiscount(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>5% (Margin Safe)</span>
                  <span>15% (Optimal Elasticity)</span>
                  <span>35% (Aggressive Clearance)</span>
                </div>

                <div className="border-t border-slate-200/60 pt-2 flex justify-between text-xs">
                  <span className="text-slate-500">Live Projected ROI:</span>
                  <strong className="text-emerald-600 font-mono">
                    ~{Math.round(240 + suggestedDiscount * 7.5)}% ROI
                  </strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCampaignMutation.isPending}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1"
                >
                  {createCampaignMutation.isPending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  Synthesize & Launch Campaign
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
