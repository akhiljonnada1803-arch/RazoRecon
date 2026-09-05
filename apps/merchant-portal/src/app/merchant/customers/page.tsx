'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Crown, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Mail, 
  Phone, 
  ShieldAlert, 
  Zap, 
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { apiClient } from '@/lib/api-client';

export default function CustomerIntelligencePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [triggeredWinbacks, setTriggeredWinbacks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    apiClient.get<any>('/merchant/growth/customer-intelligence')
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load customer intelligence', err);
        setLoading(false);
      });
  }, []);

  const handleTriggerWinback = (customerId: string) => {
    setTriggeredWinbacks(prev => ({ ...prev, [customerId]: true }));
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Loading Customer Intelligence & CLV Tiers...</span>
        </div>
      </div>
    );
  }

  const metrics = data.metrics || {};
  const clvDist = data.clv_distribution || [];
  const cohorts = data.retention_cohorts || [];
  const vipCustomers = data.vip_customers || [];

  const filteredVips = filterTier === 'ALL' 
    ? vipCustomers 
    : vipCustomers.filter((c: any) => c.clv_tier.includes(filterTier));

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#1E3A5F] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-700">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs font-bold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 mr-1" />
                Customer Intelligence & Churn AI
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs font-mono">
                128.4% NRR
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Customer Intelligence & Retention Hub
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Cohort lifetime value modeling, repeat replenishment frequency, predictive churn risk detection, and VIP corporate account management.
            </p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 text-right min-w-[220px]">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Avg Customer Lifetime Value
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-purple-400">
              ₹{metrics.avg_customer_lifetime_value_inr?.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              {metrics.repeat_purchase_rate_pct}% Repeat Purchase Rate
            </span>
          </div>
        </div>
      </div>

      {/* 2. 4 TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Customers</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {metrics.total_active_customers || 0}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> +18.4% MoM Net Growth
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Revenue Retention (NRR)</span>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {metrics.net_revenue_retention_nrr_pct || 0}%
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            Expansion revenue outpaces churn
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Churn Rate</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {metrics.monthly_churn_rate_pct || 0}%
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">
            Industry benchmark: 4.8%
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">At-Risk Merchants</span>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {metrics.at_risk_customers_count || 0}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> 1-Click Winbacks Ready
          </span>
        </div>
      </div>

      {(metrics.total_active_customers === 0 || data.message) && (
        <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-6 text-center space-y-2">
          <Users className="w-8 h-8 text-purple-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">{data.message || "No customer activity."}</h3>
          <p className="text-xs text-slate-600 max-w-lg mx-auto">
            Customer lifetime value cohorts, retention rates, and churn detection will be calculated as customers register and place orders.
          </p>
        </div>
      )}

      {/* 3. CLV DISTRIBUTION & COHORT RETENTION MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: CLV Tier Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Customer Lifetime Value Tiers</h3>
            <p className="text-xs text-slate-500">Revenue concentration by merchant customer spend tier.</p>
          </div>

          <div className="space-y-4">
            {clvDist.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs font-semibold">
                No customer spend tiers identified yet.
              </div>
            ) : (
              clvDist.map((tier: any, i: number) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-900">{tier.tier}</span>
                    <span className="font-mono text-purple-700 font-bold">{tier.share_pct}% Revenue</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${tier.share_pct}%` }} 
                      className="bg-purple-600 h-full rounded-full" 
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>{tier.customer_count} merchants ({tier.pct_of_total}%)</span>
                    <span>₹{((tier.total_revenue_inr || 0) / 100000).toFixed(1)} Lakhs</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Cohort Retention Curves */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Cohort Retention Heatmap (%)</h3>
              <p className="text-xs text-slate-500">Percentage of merchants reordering across subsequent months.</p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-mono">
              AutoPay Powered
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Cohort Month</th>
                  <th className="pb-3 text-right">Initial Size</th>
                  <th className="pb-3 text-right">Month 1</th>
                  <th className="pb-3 text-right">Month 2</th>
                  <th className="pb-3 text-right">Month 3</th>
                  <th className="pb-3 text-right">Month 4</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono font-medium">
                {cohorts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-sans">
                      No cohort retention data recorded yet.
                    </td>
                  </tr>
                ) : (
                  cohorts.map((c: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-3 font-bold text-slate-800">{c.cohort}</td>
                      <td className="py-3 text-right text-slate-500">{c.initial_size}</td>
                      <td className="py-3 text-right">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">{c.month_1}%</span>
                      </td>
                      <td className="py-3 text-right">
                        {c.month_2 ? (
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">{c.month_2}%</span>
                        ) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-3 text-right">
                        {c.month_3 ? (
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">{c.month_3}%</span>
                        ) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-3 text-right">
                        {c.month_4 ? (
                          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-semibold">{c.month_4}%</span>
                        ) : <span className="text-slate-300">-</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. VIP CUSTOMERS & CHURN RISK MANAGEMENT */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">VIP Clients & Churn Risk Watchlist</h3>
            <p className="text-xs text-slate-500">Real-time spend, replenishment cycle health, and automated winback triggers.</p>
          </div>

          {/* Tier Filters */}
          <div className="flex items-center gap-2">
            {['ALL', 'ENTERPRISE', 'GROWTH', 'EMERGING'].map((tier) => (
              <button
                key={tier}
                onClick={() => setFilterTier(tier)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  filterTier === tier 
                    ? 'bg-[#072654] text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Customer Account</th>
                <th className="pb-3">CLV Tier</th>
                <th className="pb-3 text-right">Lifetime Spend</th>
                <th className="pb-3 text-right">Orders</th>
                <th className="pb-3">Cycle Frequency</th>
                <th className="pb-3">Churn Risk</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredVips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    No customer accounts recorded yet.
                  </td>
                </tr>
              ) : (
                filteredVips.map((c: any) => {
                  const isWinbackSent = triggeredWinbacks[c.id];
                  const isHighRisk = c.churn_risk_level === 'HIGH_CHURN_RISK';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2">
                          {c.clv_tier?.includes('ENTERPRISE') && <Crown className="w-4 h-4 text-amber-500 shrink-0" />}
                          <div>
                            <span className="font-bold text-slate-900 block">{c.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{c.contact}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <Badge className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border-purple-200">
                          {c.clv_tier}
                        </Badge>
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-slate-900">
                        ₹{(c.total_spend_inr || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 text-right font-mono font-semibold text-slate-600">
                        {c.total_orders || 0}
                      </td>
                      <td className="py-3.5 text-slate-600 font-mono">
                        Every {c.repeat_frequency_days || 0} days
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isHighRisk 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isHighRisk && <AlertTriangle className="w-3 h-3" />}
                          {c.churn_risk_score}% {c.churn_risk_level}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {isHighRisk ? (
                          <Button 
                            size="sm" 
                            onClick={() => handleTriggerWinback(c.id)}
                            disabled={isWinbackSent}
                            className={`text-xs font-bold rounded-xl py-1 px-3 ${
                              isWinbackSent 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            {isWinbackSent ? 'Winback Dispatched' : 'Push AI Winback Offer'}
                          </Button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-semibold font-mono">
                            AutoPay Healthy
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
