'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Bot, 
  Users, 
  Zap, 
  CheckCircle2, 
  TrendingUp, 
  CreditCard, 
  ShieldCheck, 
  ArrowUpRight, 
  Clock, 
  Package, 
  Flame, 
  DollarSign 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AgentAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/merchant/growth/agent-analytics')
      .then(res => res.json())
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load agent analytics', err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Loading Agent Analytics Telemetry...</span>
        </div>
      </div>
    );
  }

  const overview = data.overview || {};
  const splitHistory = data.revenue_split_history || [];
  const topProducts = data.top_ai_purchased_products || [];
  const autopay = data.autopay_performance || {};

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0A3A60] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-700">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
                <Bot className="w-3.5 h-3.5 mr-1" />
                Razorpay Track 01 • Agentic Commerce Telemetry
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs font-mono">
                Live AI Orders
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Agent Commerce Analytics
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Comparative intelligence between autonomous AI Shopping Assistant checkout flows and traditional human web browsing sessions.
            </p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 text-right min-w-[220px]">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              AI Conversion Multiplier
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              {overview.conversion_multiplier}x
            </div>
            <span className="text-[10px] text-emerald-400/90 font-mono">
              {overview.agent_conversion_rate_pct}% AI vs {overview.human_conversion_rate_pct}% Human
            </span>
          </div>
        </div>
      </div>

      {/* 2. 4 TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>AI Orders Share</span>
            <Bot className="h-4 w-4 text-[#0B72E7]" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {overview.ai_orders_count} <span className="text-sm font-normal text-slate-400">/ {overview.total_orders}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-emerald-600 font-bold">{overview.ai_order_share_pct}% Autonomous Share</span>
            <span className="text-slate-400 font-mono">{overview.human_orders_count} Human</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>AI Revenue Driven</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            ₹{(overview.ai_revenue_inr / 100000).toFixed(2)} L
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-emerald-600 font-bold">{overview.ai_revenue_share_pct}% of Gross GMV</span>
            <span className="text-slate-400 font-mono">₹{(overview.human_revenue_inr / 100000).toFixed(2)}L Human</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>AutoPay Success Rate</span>
            <Zap className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {overview.autopay_success_rate_pct}%
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            Zero checkout friction • 340ms mandate charge
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>AI Decision Latency</span>
            <Clock className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 font-mono">
            {overview.avg_ai_decision_seconds}s
          </div>
          <span className="text-[11px] text-slate-400 font-mono block">
            vs {overview.avg_human_browse_minutes} min human browsing
          </span>
        </div>
      </div>

      {/* 3. REVENUE COMPARISON VISUAL & AUTOPAY METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 7-Day Revenue Velocity (Human vs AI) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">7-Day Revenue Split (Human vs. AI Agent)</h3>
              <p className="text-xs text-slate-500">Daily gross revenue comparison across checkout channels.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#0B72E7]" />
                <span className="text-slate-600">Human Web</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600">AI AutoPay Agent</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="space-y-3 pt-2">
            {splitHistory.map((item: any, i: number) => {
              const maxVal = 3000000.0;
              const humanWidth = Math.min(100, (item.human_rev / maxVal) * 100);
              const aiWidth = Math.min(100, (item.ai_rev / maxVal) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="font-semibold text-slate-600">{item.date}</span>
                    <span className="text-emerald-700 font-bold">{item.ai_share}% AI Share</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      style={{ width: `${humanWidth}%` }} 
                      className="bg-[#0B72E7] h-full transition-all" 
                      title={`Human: ₹${item.human_rev.toLocaleString('en-IN')}`}
                    />
                    <div 
                      style={{ width: `${aiWidth}%` }} 
                      className="bg-emerald-500 h-full transition-all" 
                      title={`AI: ₹${item.ai_rev.toLocaleString('en-IN')}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: AutoPay Mandate Performance */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Razorpay AutoPay Mandate Hub</h3>
            <p className="text-xs text-slate-500">Mandate authorization & token performance.</p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Registered Mandates</span>
              <span className="text-2xl font-black font-mono text-emerald-900">{autopay.total_mandates_registered} Mandates</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>UPI AutoPay Share:</span>
                <span className="font-mono font-bold text-slate-900">{autopay.upi_autopay_pct}%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Credit/Debit Mandates:</span>
                <span className="font-mono font-bold text-slate-900">{autopay.card_mandate_pct}%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>NetBanking e-Mandates:</span>
                <span className="font-mono font-bold text-slate-900">{autopay.emandate_pct}%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Dunning Recovery Rate:</span>
                <span className="font-mono font-bold text-emerald-600">{autopay.dunning_recovery_pct}%</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-900">
            🛡️ <strong>Zero Manual Checkout Abandonment:</strong> AI shoppers with registered AutoPay mandates experience instant background execution.
          </div>
        </div>
      </div>

      {/* 4. TOP AI PURCHASED PRODUCTS LEADERBOARD */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Top Products Purchased by AI Agents</h3>
            <p className="text-xs text-slate-500">Autonomous replenishment and agent recommendation leaders.</p>
          </div>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-xs">
            Autonomous Replenishment Sync
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Product / SKU</th>
                <th className="pb-3">Category</th>
                <th className="pb-3 text-right">AI Orders</th>
                <th className="pb-3 text-right">AI Gross GMV</th>
                <th className="pb-3">Autonomous Frequency</th>
                <th className="pb-3">Primary AI Intent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {topProducts.map((p: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 pr-4">
                    <span className="font-bold text-slate-900 block">{p.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{p.sku}</span>
                  </td>
                  <td className="py-3.5">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {p.category}
                    </Badge>
                  </td>
                  <td className="py-3.5 text-right font-mono font-bold text-slate-900">
                    {p.ai_orders_count}
                  </td>
                  <td className="py-3.5 text-right font-mono font-bold text-emerald-600">
                    ₹{p.ai_gmv_inr.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 text-slate-600">
                    {p.auto_replenish_freq}
                  </td>
                  <td className="py-3.5">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">
                      {p.primary_ai_intent}
                    </span>
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
