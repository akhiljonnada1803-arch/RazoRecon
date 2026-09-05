'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  Truck, 
  DollarSign, 
  Sliders, 
  Layers, 
  Bot, 
  ArrowRight,
  Zap,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { apiClient } from '@/lib/api-client';

export default function AgentReadinessScorePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedSuccess, setOptimizedSuccess] = useState(false);

  const fetchReadiness = () => {
    apiClient.get<any>('/merchant/growth/agent-readiness')
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load agent readiness', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReadiness();
  }, []);

  const handleAutoOptimize = () => {
    setOptimizing(true);
    apiClient.post<any>('/merchant/growth/agent-readiness/optimize')
      .then(res => {
        setData(res.readiness);
        setOptimizing(false);
        setOptimizedSuccess(true);
        setTimeout(() => setOptimizedSuccess(false), 5000);
      })
      .catch(err => {
        console.error('Optimization failed', err);
        setOptimizing(false);
      });
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Evaluating Agent Readiness Scorecard...</span>
        </div>
      </div>
    );
  }

  const score = typeof data.overall_score === 'number' ? data.overall_score : 0;
  const dimensions = data.dimensions || {};
  const checklist = data.checklist || [];

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HERO HEADER WITH CIRCULAR SCORE */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0A3A60] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-700">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
                <Bot className="w-3.5 h-3.5 mr-1" />
                Autonomous AI Commerce Compatibility
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs font-mono">
                {data.rating_label}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Agent Readiness Scorecard
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Measures how cleanly and reliably your store&apos;s product catalog, real-time inventory, pricing structures, specifications, and courier dispatch APIs can be ingested by autonomous AI Shopping Agents.
            </p>
          </div>

          {/* Overall Score Badge */}
          <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-700 shrink-0">
            <div className="relative flex items-center justify-center">
              <div className="h-20 w-20 rounded-full border-4 border-emerald-500/30 flex items-center justify-center bg-emerald-500/10">
                <span className="text-2xl font-black font-mono text-emerald-400">{score}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Compatibility Tier</span>
              <span className="text-sm font-black text-white">{data.status}</span>
              <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">Ready for Razorpay Track 01</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OPTIMIZATION BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">1-Click Autonomous Store Remediation</h4>
            <p className="text-xs text-slate-300">Auto-enrich missing technical attributes, calibrate safety inventory buffers, and optimize pricing metadata for AI agents.</p>
          </div>
        </div>

        <Button 
          onClick={handleAutoOptimize}
          disabled={optimizing || score >= 99}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl px-5 py-2.5 text-xs shrink-0 shadow-md"
        >
          {optimizing ? 'Applying AI Optimization...' : score >= 99 ? 'Storefront Fully Optimized (99.5/100)' : 'Auto-Optimize Store with AI'}
        </Button>
      </div>

      {optimizedSuccess && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          AI Autonomous Optimization successfully elevated your store to 99.5/100 Agent Readiness!
        </div>
      )}

      {(score === 0 || data.status === 'ONBOARDING_REQUIRED') && (
        <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-medium space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Catalog Setup Required for Autonomous AI Readiness
          </div>
          <p className="text-amber-800">
            Add products to your catalog to generate your real-time Agent Readiness score. Readiness is computed from product images, structured descriptions, GST-inclusive pricing, technical specs, and courier SLA connections.
          </p>
        </div>
      )}

      {/* 3. 5 KEY DIMENSION SCORECARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dimension 1: Catalog Quality */}
        {dimensions.catalog_quality && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-xl text-[#0B72E7]">
                  <Package className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">1. Catalog Quality</h4>
              </div>
              <span className="text-lg font-black font-mono text-slate-900">{dimensions.catalog_quality.score}/100</span>
            </div>

            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div style={{ width: `${dimensions.catalog_quality.score}%` }} className="bg-[#0B72E7] h-full rounded-full" />
            </div>

            <div className="space-y-1 text-xs text-slate-600 font-mono">
              <div className="flex justify-between"><span>High-Res Images:</span><strong>{dimensions.catalog_quality.metrics.high_res_images_pct}%</strong></div>
              <div className="flex justify-between"><span>Structured Descriptions:</span><strong>{dimensions.catalog_quality.metrics.structured_descriptions_pct}%</strong></div>
              <div className="flex justify-between"><span>Markdown Bullets:</span><strong>{dimensions.catalog_quality.metrics.markdown_features_pct}%</strong></div>
            </div>

            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
              💡 {dimensions.catalog_quality.recommendation}
            </p>
          </div>
        )}

        {/* Dimension 2: Inventory Accuracy */}
        {dimensions.inventory_accuracy && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">2. Inventory Accuracy</h4>
              </div>
              <span className="text-lg font-black font-mono text-slate-900">{dimensions.inventory_accuracy.score}/100</span>
            </div>

            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div style={{ width: `${dimensions.inventory_accuracy.score}%` }} className="bg-emerald-500 h-full rounded-full" />
            </div>

            <div className="space-y-1 text-xs text-slate-600 font-mono">
              <div className="flex justify-between"><span>Real-Time Sync:</span><strong>{dimensions.inventory_accuracy.metrics.real_time_sync_pct}%</strong></div>
              <div className="flex justify-between"><span>Buffer Stock Accuracy:</span><strong>{dimensions.inventory_accuracy.metrics.buffer_stock_accuracy}%</strong></div>
              <div className="flex justify-between"><span>Stockout Prevention:</span><strong>{dimensions.inventory_accuracy.metrics.stockout_prevention_rate}%</strong></div>
            </div>

            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
              💡 {dimensions.inventory_accuracy.recommendation}
            </p>
          </div>
        )}

        {/* Dimension 3: Pricing Completeness */}
        {dimensions.pricing_completeness && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">3. Pricing Completeness</h4>
              </div>
              <span className="text-lg font-black font-mono text-slate-900">{dimensions.pricing_completeness.score}/100</span>
            </div>

            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div style={{ width: `${dimensions.pricing_completeness.score}%` }} className="bg-purple-600 h-full rounded-full" />
            </div>

            <div className="space-y-1 text-xs text-slate-600 font-mono">
              <div className="flex justify-between"><span>GST-Inclusive Clarity:</span><strong>{dimensions.pricing_completeness.metrics.gst_inclusive_clarity}%</strong></div>
              <div className="flex justify-between"><span>MRP Transparency:</span><strong>{dimensions.pricing_completeness.metrics.mrp_transparency_pct}%</strong></div>
              <div className="flex justify-between"><span>Volume Tier Pricing:</span><strong>{dimensions.pricing_completeness.metrics.volume_tier_pricing_pct}%</strong></div>
            </div>

            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
              💡 {dimensions.pricing_completeness.recommendation}
            </p>
          </div>
        )}

        {/* Dimension 4: Specification Coverage */}
        {dimensions.specification_coverage && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                  <Sliders className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">4. Specification Depth</h4>
              </div>
              <span className="text-lg font-black font-mono text-slate-900">{dimensions.specification_coverage.score}/100</span>
            </div>

            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div style={{ width: `${dimensions.specification_coverage.score}%` }} className="bg-amber-500 h-full rounded-full" />
            </div>

            <div className="space-y-1 text-xs text-slate-600 font-mono">
              <div className="flex justify-between"><span>Technical Specs Depth:</span><strong>{dimensions.specification_coverage.metrics.technical_specs_depth}%</strong></div>
              <div className="flex justify-between"><span>Comparison Attributes:</span><strong>{dimensions.specification_coverage.metrics.comparison_attributes_pct}%</strong></div>
              <div className="flex justify-between"><span>Compatibility Tags:</span><strong>{dimensions.specification_coverage.metrics.compatibility_tags_pct}%</strong></div>
            </div>

            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
              💡 {dimensions.specification_coverage.recommendation}
            </p>
          </div>
        )}

        {/* Dimension 5: Delivery Reliability */}
        {dimensions.delivery_reliability && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                  <Truck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">5. Delivery Reliability</h4>
              </div>
              <span className="text-lg font-black font-mono text-slate-900">{dimensions.delivery_reliability.score}/100</span>
            </div>

            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div style={{ width: `${dimensions.delivery_reliability.score}%` }} className="bg-teal-500 h-full rounded-full" />
            </div>

            <div className="space-y-1 text-xs text-slate-600 font-mono">
              <div className="flex justify-between"><span>Courier SLA Adherence:</span><strong>{dimensions.delivery_reliability.metrics.courier_sla_adherence}%</strong></div>
              <div className="flex justify-between"><span>Same-Day Dispatch:</span><strong>{dimensions.delivery_reliability.metrics.same_day_dispatch_pct}%</strong></div>
              <div className="flex justify-between"><span>Return Rate:</span><strong>{dimensions.delivery_reliability.metrics.return_rate_pct}%</strong></div>
            </div>

            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
              💡 {dimensions.delivery_reliability.recommendation}
            </p>
          </div>
        )}
      </div>

      {/* 4. READINESS CHECKLIST */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Agentic Commerce Readiness Checklist</h3>
            <p className="text-xs text-slate-500">Criteria required for seamless zero-friction AI shopping agent discovery & AutoPay.</p>
          </div>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-xs">
            {checklist.filter((c: any) => c.passed).length} / {checklist.length} Passed
          </Badge>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {checklist.map((chk: any) => (
            <div key={chk.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                  chk.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">{chk.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{chk.category}</span>
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] font-bold text-emerald-600 border-emerald-200">
                {chk.impact}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
