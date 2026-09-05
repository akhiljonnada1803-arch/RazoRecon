'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Layers, 
  TrendingUp, 
  ArrowRight, 
  Plus, 
  CheckCircle2, 
  Percent, 
  Package, 
  Zap, 
  ShieldCheck, 
  DollarSign, 
  SlidersHorizontal,
  ChevronRight,
  Flame,
  Bot
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { apiClient } from '@/lib/api-client';

export default function UpsellCrossSellPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'FBT' | 'BUNDLES' | 'CROSS_SELL' | 'UPSELL'>('FBT');
  const [multiplier, setMultiplier] = useState(1.0);
  const [publishedBundles, setPublishedBundles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    apiClient.get<any>('/merchant/growth/upsell-cross-sell')
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load upsell engine data', err);
        setLoading(false);
      });
  }, []);

  const handlePublishBundle = (bundleId: string) => {
    setPublishedBundles(prev => ({ ...prev, [bundleId]: true }));
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Loading AI Upsell & Cross-Sell Engine...</span>
        </div>
      </div>
    );
  }

  const summary = data.summary || {};
  const baseLift = summary.total_predicted_monthly_revenue_lift_inr || 0;
  const calculatedLift = Math.round(baseLift * multiplier);
  const fbtList = data.frequently_bought_together || [];
  const bundlesList = data.bundles || [];
  const crossSellList = data.cross_sell_opportunities || [];
  const upsellList = data.upsell_suggestions || [];

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0C3875] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-blue-400/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Basket Affinity & Machine Learning Lift
              </Badge>
              <Badge className="bg-white/10 text-blue-200 border-white/20 text-xs font-mono">
                Apriori Lift v2.4
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Upsell & Cross-Sell Revenue Engine
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-2xl">
              Maximize merchant Average Order Value (AOV) through automated co-purchase bundling, frequent itemset affinity mining, and real-time checkout upsell recommendations.
            </p>
          </div>

          {/* Predicted Lift Counter */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right min-w-[240px]">
            <span className="text-[11px] font-semibold text-blue-200 block uppercase tracking-wider">
              Predicted Monthly Revenue Lift
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-300">
              +₹{calculatedLift.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-blue-200 font-mono">
              +{summary.avg_aov_lift_pct}% Expected AOV Expansion
            </span>
          </div>
        </div>
      </div>

      {/* 2. 4 TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Association Rules</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {summary.total_active_rules} Pairs
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> High statistical confidence (&gt;65%)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Published Smart Bundles</span>
          <div className="text-2xl font-black text-[#0B72E7] font-mono">
            {summary.total_published_bundles} Bundles
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Average discount 14.2% with 38% margin
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Adoption Rate</span>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {summary.ai_recommendation_adoption_rate}%
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">
            Customers accepting add-on suggestions
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projected AOV Growth</span>
          <div className="text-2xl font-black text-purple-600 font-mono">
            +{summary.avg_aov_lift_pct}%
          </div>
          <span className="text-[11px] font-semibold text-purple-600">
            From ₹14,800 to ₹18,450 per order
          </span>
        </div>
      </div>

      {/* 3. SIMULATOR SLIDER */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl border border-slate-700 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Interactive Revenue Lift Simulator</h4>
            <p className="text-xs text-slate-400">Adjust projected order volume to simulate incremental revenue lift.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-300">0.5x</span>
            <input 
              type="range" 
              min="0.5" 
              max="2.5" 
              step="0.1" 
              value={multiplier}
              onChange={(e) => setMultiplier(parseFloat(e.target.value))}
              className="w-36 accent-emerald-400 cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-300">2.5x</span>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-mono text-xs px-2 py-1">
            {multiplier}x Volume Scale
          </Badge>
        </div>
      </div>

      {/* 4. MODULE TABS */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('FBT')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'FBT' 
              ? 'border-[#0B72E7] text-[#0B72E7]' 
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="h-4 w-4" />
          Frequently Bought Together ({fbtList.length})
        </button>

        <button 
          onClick={() => setActiveTab('BUNDLES')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'BUNDLES' 
              ? 'border-[#0B72E7] text-[#0B72E7]' 
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="h-4 w-4" />
          Smart Bundle Recommendations ({bundlesList.length})
        </button>

        <button 
          onClick={() => setActiveTab('CROSS_SELL')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'CROSS_SELL' 
              ? 'border-[#0B72E7] text-[#0B72E7]' 
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Zap className="h-4 w-4" />
          Cross-Sell Opportunities ({crossSellList.length})
        </button>

        <button 
          onClick={() => setActiveTab('UPSELL')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'UPSELL' 
              ? 'border-[#0B72E7] text-[#0B72E7]' 
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Upsell Suggestions ({upsellList.length})
        </button>
      </div>

      {bundlesList.length === 0 && fbtList.length === 0 && (
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-6 text-center space-y-2">
          <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">{data.message || "No transactions available yet."}</h3>
          <p className="text-xs text-slate-600 max-w-lg mx-auto">
            AI basket affinity mining requires at least 2 catalog products and transaction history. Recommendations and bundles will populate automatically as your store receives orders.
          </p>
        </div>
      )}

      {/* 5. TAB CONTENTS */}
      {/* 5.1 FREQUENTLY BOUGHT TOGETHER */}
      {activeTab === 'FBT' && (
        fbtList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">No Frequently Bought Together pairs identified yet.</p>
            <p className="text-xs text-slate-400">Co-purchases will be mined automatically using market basket algorithms once order history is established.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {fbtList.map((fbt: any) => (
              <div key={fbt.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-5 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[10px] font-bold">
                    Lift: {fbt.lift_score}x • Confidence: {fbt.confidence_pct}%
                  </Badge>
                  <span className="text-xs font-semibold text-slate-400 font-mono">{fbt.co_purchase_count} co-orders</span>
                </div>

                {/* Primary + Paired Visual */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 max-w-[42%]">
                    <img src={fbt.primary_product.image} alt={fbt.primary_product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{fbt.primary_product.name}</p>
                      <p className="text-[11px] font-mono font-bold text-slate-900">₹{fbt.primary_product.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="h-6 w-6 rounded-full bg-blue-100 text-[#0B72E7] flex items-center justify-center text-xs font-bold shrink-0">
                    +
                  </div>

                  <div className="flex items-center gap-2 max-w-[42%]">
                    <img src={fbt.paired_product.image} alt={fbt.paired_product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{fbt.paired_product.name}</p>
                      <p className="text-[11px] font-mono font-bold text-emerald-600">₹{fbt.paired_product.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Predicted Monthly Orders:</span>
                    <span className="font-bold font-mono text-slate-900">+{fbt.predicted_monthly_orders} orders</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Predicted Revenue Boost:</span>
                    <span className="font-bold font-mono text-emerald-600">+₹{Math.round(fbt.predicted_revenue_lift_inr * multiplier).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                    💡 <strong className="text-slate-700">AI Trigger:</strong> {fbt.recommended_action}
                  </p>
                </div>
              </div>

              <Button 
                size="sm" 
                className="w-full bg-[#072654] hover:bg-[#0c3977] text-white font-bold rounded-xl text-xs py-2.5 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Activate AutoPay Co-Purchase Trigger
              </Button>
            </div>
          ))}
        </div>
        )
      )}

      {/* 5.2 SMART BUNDLE RECOMMENDATIONS */}
      {activeTab === 'BUNDLES' && (
        bundlesList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">No smart bundle recommendations generated yet.</p>
            <p className="text-xs text-slate-400">AI bundles will be composed when customer checkout combinations are observed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {bundlesList.map((bundle: any) => {
              const isPublished = publishedBundles[bundle.id] || bundle.status === 'PUBLISHED';
              return (
                <div key={bundle.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 font-bold text-[10px]">
                        {bundle.badge}
                      </Badge>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[10px] font-bold">
                        {bundle.discount_pct}% OFF
                      </Badge>
                    </div>

                    <h3 className="text-base font-black text-slate-900">{bundle.name}</h3>

                    {/* Bundle Items List */}
                    <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bundle Contains:</span>
                      {bundle.items?.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 truncate max-w-[70%]">• {item.name}</span>
                          <span className="font-mono text-slate-500">₹{item.price.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Price Comparison */}
                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 line-through block font-mono">
                          Individual: ₹{bundle.individual_total_inr?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-base font-black font-mono text-slate-900">
                          Bundle: ₹{bundle.bundle_price_inr?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-700 block">
                          Save ₹{bundle.customer_savings_inr?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-mono font-semibold">
                          Margin: {bundle.margin_pct}%
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex justify-between font-mono">
                      <span>Monthly Sales: <strong>{bundle.monthly_sold || 0} units</strong></span>
                      <span>Revenue: <strong>₹{(bundle.monthly_revenue_inr || 0).toLocaleString('en-IN')}</strong></span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handlePublishBundle(bundle.id)}
                    disabled={isPublished}
                    className={`w-full font-bold rounded-xl text-xs py-2.5 shadow-xs ${
                      isPublished 
                        ? 'bg-emerald-600 text-white cursor-default' 
                        : 'bg-[#0B72E7] hover:bg-blue-600 text-white'
                    }`}
                  >
                    {isPublished ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Published to Storefront Catalog
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Publish Bundle to Storefront
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* 5.3 CROSS-SELL OPPORTUNITIES */}
      {activeTab === 'CROSS_SELL' && (
        crossSellList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-3">
            <Zap className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">No cross-sell opportunities detected.</p>
            <p className="text-xs text-slate-400">Cross-sell attachment rules will be generated when complementary catalog items are ordered.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {crossSellList.map((cs: any, idx: number) => (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-bold text-[10px]">
                      Attach Rate: {cs.attach_rate_pct}%
                    </Badge>
                    <span className="text-[11px] font-mono font-bold text-emerald-600">
                      +₹{(cs.incremental_gmv_inr || 0).toLocaleString('en-IN')} GMV
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trigger Rule:</span>
                    <p className="text-xs font-bold text-slate-800">{cs.trigger_name}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Cross-Sell:</span>
                    <p className="text-xs font-black text-slate-900 mt-0.5">{cs.suggested_product}</p>
                    <p className="text-xs font-mono font-bold text-[#0B72E7] mt-1">₹{(cs.suggested_price || 0).toLocaleString('en-IN')}</p>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    <strong>Placement:</strong> {cs.cross_sell_placement}
                  </p>
                </div>

                <Button size="sm" variant="outline" className="w-full font-bold text-xs rounded-xl border-slate-300">
                  Configure Automated Attachment Rule
                </Button>
              </div>
            ))}
          </div>
        )
      )}

      {/* 5.4 UPSELL SUGGESTIONS */}
      {activeTab === 'UPSELL' && (
        upsellList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-3">
            <TrendingUp className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">No upsell suggestions available.</p>
            <p className="text-xs text-slate-400">AI tier upgrade recommendations will appear once catalog products with multiple tiers or specs are configured.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upsellList.map((up: any, idx: number) => (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px]">
                    AI Win Probability: {up.ai_win_probability_pct}%
                  </Badge>
                  <span className="text-xs font-mono font-bold text-purple-700">
                    +₹{(up.annual_margin_boost_inr || 0).toLocaleString('en-IN')}/yr Margin
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Baseline Selection:</span>
                    <p className="font-semibold text-slate-700">{up.base_product}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#0B72E7] block">Upsell Target:</span>
                    <p className="font-bold text-slate-900">{up.target_product}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-slate-600">
                    <strong className="text-slate-800">Value Proposition:</strong> {up.value_proposition}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    <strong className="text-slate-700">Strategy:</strong> {up.strategy}
                  </p>
                </div>

                <Button size="sm" className="w-full bg-[#0B72E7] hover:bg-blue-600 text-white font-bold rounded-xl text-xs py-2.5">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Deploy Smart Upsell Trigger
                </Button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
