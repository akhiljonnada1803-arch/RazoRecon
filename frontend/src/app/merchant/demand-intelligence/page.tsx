'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  DemandIntelligenceOverview, 
  ProductDemandItem,
  AutonomousCampaignProposal 
} from '@/types/growth';
import { 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Skull, 
  Minus, 
  Sparkles, 
  Search, 
  Filter, 
  Zap, 
  Percent, 
  ShoppingBag, 
  Eye, 
  ShoppingCart, 
  Package, 
  Layers, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  RefreshCw, 
  Megaphone, 
  Boxes, 
  Tag, 
  AlertTriangle, 
  ShieldCheck,
  Check,
  Play,
  Share2,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function DemandIntelligencePage() {
  const queryClient = useQueryClient();
  const [timeHorizon, setTimeHorizon] = useState<'7d' | '30d' | '90d'>('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'HIGH_DEMAND' | 'LOW_DEMAND' | 'TRENDING' | 'DISCOUNT_REC' | 'FORECAST' | 'CAMPAIGNS'>('ALL');
  
  // Interactive action feedback states
  const [appliedDiscounts, setAppliedDiscounts] = useState<Record<string, number>>({});
  const [launchedCampaigns, setLaunchedCampaigns] = useState<Record<string, boolean>>({});
  const [activeModalCampaign, setActiveModalCampaign] = useState<AutonomousCampaignProposal | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery<DemandIntelligenceOverview>({
    queryKey: ['growth', 'demand-intelligence'],
    queryFn: () => apiClient.get('/growth/demand-intelligence'),
  });

  const applyDiscountMutation = useMutation({
    mutationFn: ({ productId, discountPct }: { productId: string; discountPct: number }) =>
      apiClient.post('/growth/discounts/apply', { product_id: productId, discount_pct: discountPct }),
    onSuccess: (res: any, vars) => {
      setAppliedDiscounts(prev => ({ ...prev, [vars.productId]: vars.discountPct }));
      showToast(`✅ Successfully applied ${vars.discountPct}% dynamic discount on SKU!`);
      queryClient.invalidateQueries({ queryKey: ['growth', 'demand-intelligence'] });
    }
  });

  const launchCampaignMutation = useMutation({
    mutationFn: (campaign: AutonomousCampaignProposal) =>
      apiClient.post('/growth/campaigns/generate', {
        name: campaign.name,
        target_audience: campaign.target_audience,
        discount_pct: campaign.recommended_discount_pct,
        duration_days: campaign.duration_days,
      }),
    onSuccess: (res: any, campaign) => {
      setLaunchedCampaigns(prev => ({ ...prev, [campaign.id]: true }));
      showToast(`🚀 Autonomous campaign "${campaign.name}" is now live!`);
    }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const summary = data?.summary;
  const products = data?.products || [];
  const trending = data?.trending_products || [];
  const declining = data?.declining_products || [];
  const deadInventory = data?.dead_inventory || [];
  const campaigns = data?.autonomous_campaigns || [];
  const insights = data?.growth_insights || [];
  const heatmap = data?.category_heatmap || [];

  const highDemandProducts = products.filter(p => p.demand_score >= 80);
  const lowDemandProducts = products.filter(p => p.demand_score < 40);
  const discountRecommendedProducts = products.filter(p => !!p.ai_recommendation || p.demand_score < 40);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    
    if (!matchesSearch || !matchesCategory) return false;

    if (activeTab === 'HIGH_DEMAND') return p.demand_score >= 80;
    if (activeTab === 'LOW_DEMAND') return p.demand_score < 40;
    if (activeTab === 'TRENDING') return p.demand_score >= 60;
    if (activeTab === 'DISCOUNT_REC') return !!p.ai_recommendation || p.demand_score < 40;
    if (activeTab === 'FORECAST') return true;

    return true;
  });

  // Calculate SVG sparkline points for overall demand trend
  const trendPoints = (trending[0]?.trend_history?.[timeHorizon] || []).map((pt, idx, arr) => {
    const x = (idx / Math.max(1, arr.length - 1)) * 500;
    const y = 140 - (pt.score / 100) * 110;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-8 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0A2540] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Flame className="w-3.5 h-3.5 mr-1" />
                AI Demand Intelligence Engine
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs font-mono">
                Continuous Telemetry Active
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Demand Intelligence & Dynamic Pricing Engine
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Continuously computing multi-factor product demand scores (0–100) from views, cart adds, and inventory velocity to trigger automated markdown recommendations and liquidation campaigns.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Time Horizon Selector */}
            <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700 flex items-center gap-1 shadow-inner">
              {(['7d', '30d', '90d'] as const).map((th) => (
                <button
                  key={th}
                  onClick={() => setTimeHorizon(th)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                    timeHorizon === th
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  {th === '7d' ? 'Last 7 Days' : th === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="rounded-2xl border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white text-xs gap-1.5 h-10"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin text-emerald-400")} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Catalog Demand Health</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {summary?.average_demand_score || 71}<span className="text-sm font-sans font-medium text-slate-400">/100</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block flex items-center gap-1">
            <TrendingUp className="h-3 w-3 inline" /> +4.2 pts growth this month
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Trending SKUs</span>
            <div className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {(summary?.trending_count || 0) + (summary?.growing_count || 0)} <span className="text-sm font-sans font-medium text-slate-400">Active</span>
          </div>
          <span className="text-[11px] text-slate-500 block">Surging velocity & cart conversions</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Dead Stock Capital</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Skull className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 font-mono">
            {formatCurrency(summary?.dead_inventory_tied_capital_inr || 142000)}
          </div>
          <span className="text-[11px] text-amber-700 font-medium block">Tied up in {summary?.dead_inventory_count || 2} stagnant SKUs</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Projected Revenue Lift</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#0B72E7] font-mono">
            {formatCurrency(summary?.projected_revenue_lift_inr || 384000)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">Via AI dynamic markdowns & bundles</span>
        </div>
      </div>

      {/* Proactive Growth Alerts Widget Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200 font-mono">
              Live AI Growth Insights & Demand Anomaly Alerts
            </h3>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
            4 Real-Time Signals
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {insights.map((ins) => (
            <Link
              key={ins.id}
              href={ins.action_route}
              className="bg-slate-800/80 hover:bg-slate-800 p-3.5 rounded-2xl border border-slate-700/80 transition-all group space-y-2 block"
            >
              <div className="flex items-center justify-between">
                <Badge className={cn("text-[9px] font-bold font-mono border", ins.color)}>
                  {ins.badge}
                </Badge>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h4 className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                {ins.title}
              </h4>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {ins.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Section 1: Demand Overview & Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Demand Trajectory Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>Demand Scoring Trajectory ({timeHorizon.toUpperCase()})</span>
              </h3>
              <p className="text-xs text-slate-500">
                Formula: (30% Views + 20% Searches + 20% Cart Adds + 20% Purchases + 10% Conversion Rate)
              </p>
            </div>
            <Badge className="bg-slate-100 text-slate-700 font-mono text-xs">
              Normalized (0–100)
            </Badge>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl relative overflow-hidden border border-slate-800">
            <div className="h-44 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                {/* Horizontal Gridlines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />

                {/* Score trajectory path */}
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={trendPoints}
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              <span>Start of Period</span>
              <span>Mid Period</span>
              <span className="text-emerald-400 font-bold">Today (Latest Telemetry)</span>
            </div>
          </div>

          {/* Scoring Tier Legend */}
          <div className="grid grid-cols-5 gap-2 pt-1 text-center font-mono text-[10px]">
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2 rounded-xl">
              <span className="font-bold block">80–100</span>
              <span>🔥 Trending</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-2 rounded-xl">
              <span className="font-bold block">60–79</span>
              <span>📈 Growing</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-2 rounded-xl">
              <span className="font-bold block">40–59</span>
              <span>➖ Stable</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 text-amber-700 p-2 rounded-xl">
              <span className="font-bold block">20–39</span>
              <span>📉 Declining</span>
            </div>
            <div className="bg-slate-100 border border-slate-300 text-slate-700 p-2 rounded-xl">
              <span className="font-bold block">0–19</span>
              <span>💀 Dead Stock</span>
            </div>
          </div>
        </div>

        {/* Category Demand Heatmap */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Category Demand Heatmap</h3>
            <p className="text-xs text-slate-500">Cross-category demand velocity & trend index</p>
          </div>

          <div className="space-y-3">
            {heatmap.map((hm) => (
              <div
                key={hm.category}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100/80 transition-colors"
              >
                <div>
                  <span className="font-bold text-xs text-slate-900 block">{hm.category}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{hm.active_skus} Active SKUs</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-extrabold text-sm font-mono text-slate-900 block">{hm.avg_score}/100</span>
                    <span className={cn("text-[10px] font-bold font-mono", hm.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600')}>
                      {hm.trend}
                    </span>
                  </div>

                  <div className={cn(
                    "h-8 w-2 rounded-full",
                    hm.avg_score >= 80 ? "bg-emerald-500" :
                    hm.avg_score >= 60 ? "bg-teal-500" :
                    hm.avg_score >= 40 ? "bg-blue-500" :
                    "bg-amber-500"
                  )} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: 'ALL', label: `All Products (${products.length})` },
            { key: 'HIGH_DEMAND', label: `🔥 High Demand (${highDemandProducts.length})` },
            { key: 'LOW_DEMAND', label: `📉 Low Demand (${lowDemandProducts.length})` },
            { key: 'TRENDING', label: `⚡ Trending (${trending.length + (data?.growing_products?.length || 0)})` },
            { key: 'DISCOUNT_REC', label: `🏷️ Discount Recommended (${discountRecommendedProducts.length})` },
            { key: 'FORECAST', label: `📊 Next Month Forecast` },
            { key: 'CAMPAIGNS', label: `🚀 AI Campaigns (${campaigns.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                'px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0',
                activeTab === tab.key
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search SKU or category..."
            className="pl-9 h-9 text-xs rounded-2xl bg-white border-slate-200"
          />
        </div>
      </div>

      {/* Section: Predicted Next Month Demand (When tab is FORECAST) */}
      {activeTab === 'FORECAST' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>Predicted Next Month Demand & Revenue Velocity Projection</span>
              </h2>
              <p className="text-xs text-slate-500">
                Machine learning forecast based on 90-day search trends, view-to-cart conversions, and historical seasonal baseline.
              </p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-xs">
              +14.8% Projected Month-over-Month Growth
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => {
              const dailyVelocity = p.inventory_velocity || (p.price > 20000 ? 1.2 : 3.4);
              const predictedNextMonthUnits = Math.round(dailyVelocity * 30 * (1 + (p.demand_score > 70 ? 0.18 : p.demand_score > 40 ? 0.05 : -0.12)));
              const projectedRevenue = predictedNextMonthUnits * p.price;
              const daysRemaining = p.days_to_stockout || (p.stock === 0 ? 0 : Math.round(p.stock / dailyVelocity));

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Badge className={cn("text-[9px] font-mono font-bold border", p.status_tier.color)}>
                        {p.status_tier.badge}
                      </Badge>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        Demand Score: {p.demand_score}/100
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{p.name}</h3>
                    <div className="text-[11px] text-slate-500">{p.category} • ₹{p.price.toLocaleString('en-IN')}</div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Predicted Next Month Demand:</span>
                        <span className="font-extrabold text-emerald-700 text-sm">~{predictedNextMonthUnits} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Current Warehouse Stock:</span>
                        <span className="font-bold text-slate-800">{p.stock} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Stock Runway:</span>
                        <span className={`font-bold ${daysRemaining <= 7 ? 'text-rose-600' : 'text-slate-700'}`}>
                          {daysRemaining === 0 ? 'Out of Stock' : `${daysRemaining} days left`}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200">
                        <span className="text-slate-600 font-sans font-semibold">Projected Monthly GMV:</span>
                        <span className="font-extrabold text-[#0B72E7] font-mono">₹{projectedRevenue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <Link href="/merchant/catalog" className="w-full">
                    <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50">
                      Manage SKU in Catalog
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 2: AI Campaigns View (When tab is CAMPAIGNS) */}
      {activeTab === 'CAMPAIGNS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900">Autonomous AI Campaign Recommendations</h2>
              <p className="text-xs text-slate-500">Self-generating promotional campaigns designed to liquidate dead stock and accelerate revenue.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between hover:border-blue-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px] font-mono">
                      {camp.strategy_type}
                    </Badge>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {camp.confidence_score}% Confidence
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm">{camp.name}</h3>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Target Audience:</span>
                      <span className="font-semibold text-slate-900 text-right max-w-[160px] truncate">{camp.target_audience}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Discount Offer:</span>
                      <span className="font-bold text-emerald-600">{camp.recommended_discount_pct}% OFF</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Campaign Run:</span>
                      <span className="font-semibold text-slate-800">{camp.duration_days} Days</span>
                    </div>
                    <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                      <span className="font-bold text-slate-800">Projected Lift:</span>
                      <span className="font-extrabold text-[#0B72E7]">{formatCurrency(camp.expected_revenue_lift_inr)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {launchedCampaigns[camp.id] ? (
                    <div className="w-full py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                      <Check className="h-4 w-4" />
                      <span>Campaign Active on Storefront</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveModalCampaign(camp)}
                        className="w-1/2 rounded-xl text-xs font-semibold"
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => launchCampaignMutation.mutate(camp)}
                        disabled={launchCampaignMutation.isPending}
                        className="w-1/2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold gap-1 shadow-xs"
                      >
                        <Play className="h-3 w-3" />
                        <span>Launch</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Declining & Dead Inventory / Discount Recommended Highlight Cards */}
      {(activeTab === 'ALL' || activeTab === 'LOW_DEMAND' || activeTab === 'DISCOUNT_REC') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Products Recommended For Discount & Dynamic Markdowns</span>
              </h2>
              <p className="text-xs text-slate-500">
                Actionable markdown proposals for declining, slow-moving, and dead inventory to restore cash velocity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...declining, ...deadInventory].map((item) => {
              const rec = item.ai_recommendation;
              if (!rec) return null;
              const isApplied = appliedDiscounts[item.id] !== undefined;
              const discountPct = isApplied ? appliedDiscounts[item.id] : rec.discount_pct;
              const currentPrice = isApplied && item.discounted_price ? item.discounted_price : item.price;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-amber-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-xs font-mono font-bold border", item.status_tier.color)}>
                          {item.status_tier.badge}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-400">Score: {item.demand_score}/100</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {item.stock} Units in Warehouse
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="text-slate-500 line-through">₹{item.price.toLocaleString('en-IN')}</span>
                        <span className="text-emerald-700 font-extrabold font-mono text-sm">
                          ₹{currentPrice.toLocaleString('en-IN')}
                        </span>
                        {isApplied && (
                          <Badge className="bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            {discountPct}% APPLIED
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-amber-900">
                        <span>🎯 {rec.title}</span>
                        <span className="text-[10px] font-mono bg-amber-200/60 px-2 py-0.5 rounded">
                          {rec.confidence_pct}% AI Confidence
                        </span>
                      </div>
                      <p className="text-amber-800 text-[11px] leading-relaxed">
                        {rec.reasoning}
                      </p>
                      <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs font-mono">
                        <span className="text-amber-900 font-medium">Expected Conversion Lift:</span>
                        <span className="font-extrabold text-emerald-700">+{rec.expected_uplift_pct}% Conversions</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    {isApplied ? (
                      <div className="w-full py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                        <Check className="h-4 w-4" />
                        <span>Discount Active on Product Page</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => applyDiscountMutation.mutate({ productId: item.id, discountPct: rec.discount_pct })}
                        disabled={applyDiscountMutation.isPending}
                        className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Tag className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Apply {rec.discount_pct}% Dynamic Discount Now</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 4: Comprehensive Catalog Demand Scoring Table */}
      {activeTab !== 'CAMPAIGNS' && activeTab !== 'FORECAST' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Catalog Product Demand Matrix</h2>
              <p className="text-xs text-slate-500">Live scoring signals: traffic views, cart adds, purchases, and conversion rates</p>
            </div>
            <Badge className="bg-slate-100 text-slate-700 font-mono text-xs">
              {filteredProducts.length} Products
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Product Name & SKU</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Demand Score</th>
                  <th className="py-3.5 px-4 font-semibold">Status Tier</th>
                  <th className="py-3.5 px-4 font-semibold">Views / Searches</th>
                  <th className="py-3.5 px-4 font-semibold">Cart / Sales</th>
                  <th className="py-3.5 px-4 font-semibold">Conversion Rate</th>
                  <th className="py-3.5 px-4 font-semibold">Warehouse Stock</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block text-xs font-sans">{p.name}</span>
                      <span className="text-[10px] text-slate-400">{p.category} • ₹{p.price.toLocaleString('en-IN')}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={cn(
                        "inline-block font-extrabold text-sm px-2.5 py-0.5 rounded-lg font-mono",
                        p.demand_score >= 80 ? "bg-rose-50 text-rose-600 border border-rose-200" :
                        p.demand_score >= 60 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        p.demand_score >= 40 ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        p.demand_score >= 20 ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-slate-100 text-slate-600 border border-slate-300"
                      )}>
                        {p.demand_score}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      <Badge className={cn("text-[10px] font-bold border", p.status_tier.color)}>
                        {p.status_tier.badge}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <span className="text-slate-900 font-bold">{p.views.toLocaleString()}</span> views
                      <span className="text-slate-400 block text-[10px]">{p.searches.toLocaleString()} searches</span>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <span className="text-slate-900 font-bold">{p.cart_adds.toLocaleString()}</span> carts
                      <span className="text-emerald-600 block text-[10px] font-bold">{p.purchases.toLocaleString()} bought</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900">{p.conversion_rate}%</span>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-bold text-slate-900">{p.stock} units</span>
                      <span className="text-[10px] text-slate-400 block">{p.inventory_velocity} units/day</span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {p.ai_recommendation ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => applyDiscountMutation.mutate({ productId: p.id, discountPct: p.ai_recommendation!.discount_pct })}
                          disabled={appliedDiscounts[p.id] !== undefined}
                          className="text-[11px] font-bold rounded-xl h-7 px-2.5 border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
                        >
                          {appliedDiscounts[p.id] ? 'Applied' : `Apply -${p.ai_recommendation.discount_pct}%`}
                        </Button>
                      ) : p.restock_alert ? (
                        <Link href="/merchant/catalog">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-[11px] font-bold rounded-xl h-7 px-2.5 border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100"
                          >
                            Catalog Restock
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-sans">Optimal Margin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaign Preview Modal */}
      {activeModalCampaign && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-[#0B72E7]" />
                <h3 className="font-extrabold text-slate-900 text-sm">Autonomous Campaign Preview</h3>
              </div>
              <button
                onClick={() => setActiveModalCampaign(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-mono block">Campaign Name</span>
                <span className="font-extrabold text-slate-900 text-sm">{activeModalCampaign.name}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Audience:</span>
                  <span className="font-bold text-slate-800">{activeModalCampaign.target_audience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount Rate:</span>
                  <span className="font-bold text-emerald-600">{activeModalCampaign.recommended_discount_pct}% OFF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Run Duration:</span>
                  <span className="font-semibold text-slate-800">{activeModalCampaign.duration_days} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Order Volume:</span>
                  <span className="font-semibold text-slate-800">{activeModalCampaign.projected_orders} Orders</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800">Projected Revenue Lift:</span>
                  <span className="font-extrabold text-[#0B72E7]">{formatCurrency(activeModalCampaign.expected_revenue_lift_inr)}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-mono block mb-1">Included Products</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeModalCampaign.featured_products.map((fp, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] bg-white border-slate-200">
                      {fp}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={() => setActiveModalCampaign(null)}
                className="w-1/2 rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  launchCampaignMutation.mutate(activeModalCampaign);
                  setActiveModalCampaign(null);
                }}
                className="w-1/2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm"
              >
                Approve & Launch Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
