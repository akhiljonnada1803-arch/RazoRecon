'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Zap,
  RefreshCw,
  Sparkles,
  Layers,
  CreditCard,
  Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export function ReturnRiskDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Live Simulator state
  const [selectedProduct, setSelectedProduct] = useState<string>('prod_rzp_pos_v3_pro');
  const [selectedPayment, setSelectedPayment] = useState<string>('cod');
  const [hasInstallation, setHasInstallation] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);

  const loadData = () => {
    setLoading(true);
    apiClient.get<any>('/commerce/return-risk/analytics')
      .then((res) => setAnalytics(res))
      .catch((err) => console.error('Failed to load return risk analytics', err))
      .finally(() => setLoading(false));
  };

  const runSimulation = () => {
    setSimLoading(true);
    const payload = {
      product_id: selectedProduct,
      price: 18999.0,
      payment_method: selectedPayment,
      has_installation_service: hasInstallation
    };
    apiClient.post<any>('/commerce/return-risk/evaluate', payload)
      .then((res) => setSimResult(res))
      .catch((err) => console.error('Failed to evaluate return risk', err))
      .finally(() => setSimLoading(false));
  };

  useEffect(() => {
    loadData();
    runSimulation();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
        Loading AI Return Risk Scoring Models & Prevention Analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#072654]">
                AI Return & RTO Risk Prevention Engine
              </h2>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                1.35% Return Rate
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Predicts customer return probability, prevents doorstep delivery refusal, and automates installation / AutoPay mitigations.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          className="rounded-xl text-xs font-bold border-slate-200 gap-1.5 self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Return Rate', val: `${analytics.overall_return_rate_pct}%`, sub: 'vs 8.2% Industry Benchmark', icon: TrendingDown, color: 'text-emerald-600' },
          { label: 'RTO Loss Avoidance', val: `${analytics.rto_reduction_achieved_pct}%`, sub: 'Doorstep Refusal Reduction', icon: ShieldCheck, color: 'text-blue-600' },
          { label: 'Revenue Protected', val: `₹${(analytics.total_saved_revenue_inr / 100000).toFixed(2)}L`, sub: 'Prevented return shipping costs', icon: Zap, color: 'text-purple-600' },
          { label: 'AI Interventions Triggered', val: analytics.interventions_triggered_count, sub: 'AutoPay & Installation attachments', icon: Sparkles, color: 'text-amber-600' }
        ].map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{k.label}</span>
                <Icon className={`w-4 h-4 ${k.color}`} />
              </div>
              <p className="text-2xl font-black font-mono text-slate-900">{k.val}</p>
              <span className="text-[10px] font-medium text-emerald-700 block">{k.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Return Rate Comparison */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#072654]">
              Return Rate vs Industry Benchmark by Category (%)
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Razorpay AI vs Baseline</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.category_breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#64748B' }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val}%`, name === 'return_rate_pct' ? 'RazorCommerce' : 'Industry Average']}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E2E8F0' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="return_rate_pct" name="RazorCommerce" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="industry_benchmark_pct" name="Industry Benchmark" fill="#94A3B8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Tier Breakdown Donut Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#072654]">
              Order Volume Distribution by Return Risk Tier
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Active Orders</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.tier_distribution}
                  dataKey="order_share_pct"
                  nameKey="tier"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {analytics.tier_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Order Share']}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E2E8F0' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Return Risk Simulator */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#072654] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Interactive Pre-Purchase Return Risk Simulator</span>
            </h3>
            <p className="text-xs text-slate-500">
              Test how payment method and installation services reduce customer return and RTO probability in real-time.
            </p>
          </div>

          <Button
            size="sm"
            onClick={runSimulation}
            disabled={simLoading}
            className="h-8 rounded-xl text-xs font-bold bg-[#0B72E7] text-white hover:bg-[#095ec2] gap-1 self-start sm:self-center"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Re-evaluate Risk</span>
          </Button>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Product Target:</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full h-8 px-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
            >
              <option value="prod_rzp_pos_v3_pro">Razorpay POS V3 Pro Smart Terminal</option>
              <option value="prod_rzp_soundbox_v2">Razorpay Audio Soundbox 4G</option>
              <option value="prod_printer_epson">Epson TM-T82X Receipt Printer</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Payment Method Rail:</label>
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="w-full h-8 px-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
            >
              <option value="cod">Cash on Delivery (COD) — High RTO</option>
              <option value="razorpay_autopay">Razorpay UPI AutoPay — 0% Refusal</option>
              <option value="razorpay_card">Prepaid Corporate Card / NetBanking</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer h-8 px-3 bg-white border border-slate-200 rounded-xl">
              <input
                type="checkbox"
                checked={hasInstallation}
                onChange={(e) => setHasInstallation(e.target.checked)}
                className="rounded text-[#0B72E7]"
              />
              <span className="text-xs font-bold text-slate-700">Attach Certified Installation Service</span>
            </label>
          </div>
        </div>

        {/* Evaluation Output */}
        {simResult && (
          <div className="bg-gradient-to-r from-slate-50 via-blue-50/40 to-emerald-50/50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Predicted Return Probability:
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-3xl font-black font-mono text-slate-900">
                    {simResult.return_probability_pct}%
                  </span>
                  <Badge
                    variant="outline"
                    className={`font-extrabold text-xs uppercase ${
                      simResult.return_risk_tier === 'LOW'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : simResult.return_risk_tier === 'MEDIUM'
                        ? 'bg-blue-50 text-[#0B72E7] border-blue-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {simResult.return_risk_tier} RISK
                  </Badge>
                </div>
              </div>

              <div className="text-xs text-slate-600 max-w-md bg-white/80 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800">AI Advisor Verdict: </span>
                <span>{simResult.ai_advisor_verdict}</span>
              </div>
            </div>

            {/* Explainable Factor Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-200/60">
              <span className="text-[11px] font-bold text-slate-600 block">Explainable Risk Factors:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {simResult.explainability_factors.map((f: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      f.is_favorable
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50/50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{f.name}</span>
                      <span className="font-mono">
                        {f.impact_pts > 0 ? `+${f.impact_pts}%` : `${f.impact_pts}%`}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Prevented Returns Log */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-[#072654]">Recent Prevented Returns & Automated Interventions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-bold">Order ID</th>
                <th className="pb-3 font-bold">Product</th>
                <th className="pb-3 font-bold">Initial Risk</th>
                <th className="pb-3 font-bold">AI Mitigation Applied</th>
                <th className="pb-3 font-bold">Final Risk</th>
                <th className="pb-3 font-bold">Saved Value</th>
                <th className="pb-3 font-bold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.recent_prevented_returns.map((log: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3 font-mono font-bold text-slate-700">{log.order_id}</td>
                  <td className="py-3 font-bold text-slate-900">{log.product_name}</td>
                  <td className="py-3 font-mono font-bold text-rose-600">{log.initial_risk_pct}%</td>
                  <td className="py-3 text-emerald-700 font-semibold">{log.mitigation_applied}</td>
                  <td className="py-3 font-mono font-bold text-emerald-600">{log.final_risk_pct}%</td>
                  <td className="py-3 font-mono font-bold text-slate-900">₹{log.saved_value_inr.toLocaleString()}</td>
                  <td className="py-3 text-slate-400 font-mono text-[11px]">{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
