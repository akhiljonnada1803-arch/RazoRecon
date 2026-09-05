'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  CreditCard,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Building2,
  DollarSign,
  PieChart as PieIcon,
  RefreshCw,
  Plus,
  Send,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function RazorpayAnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<string>('30d');
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'visualizations' | 'settlements' | 'refunds'>('visualizations');

  // Trigger Settlement Modal State
  const [showSettleModal, setShowSettleModal] = useState<boolean>(false);
  const [settleAmount, setSettleAmount] = useState<string>('125000');
  const [settling, setSettling] = useState<boolean>(false);
  const [settleSuccessMsg, setSettleSuccessMsg] = useState<string | null>(null);

  // Issue Refund Modal State
  const [showRefundModal, setShowRefundModal] = useState<boolean>(false);
  const [refundPaymentId, setRefundPaymentId] = useState<string>('');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundReason, setRefundReason] = useState<string>('Customer cancellation');
  const [refundSpeed, setRefundSpeed] = useState<string>('instant');
  const [refunding, setRefunding] = useState<boolean>(false);
  const [refundSuccessMsg, setRefundSuccessMsg] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/razorpay/analytics/overview?timeframe=${timeframe}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load Razorpay Analytics overview', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [timeframe]);

  // Handle Trigger Settlement
  const handleTriggerSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettling(true);
    setSettleSuccessMsg(null);
    try {
      const res = await fetch('/api/v1/razorpay/analytics/settlements/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(settleAmount) || 125000.0,
          bank_account: 'HDFC Bank (Primary Payout) •••• 4892'
        })
      });
      if (res.ok) {
        const resJson = await res.json();
        setSettleSuccessMsg(`Settlement of ₹${resJson.amount.toLocaleString()} initiated! UTR: ${resJson.utr}`);
        setTimeout(() => {
          setShowSettleModal(false);
          setSettleSuccessMsg(null);
          fetchOverview();
        }, 1800);
      }
    } catch (err) {
      console.error('Settlement trigger failed', err);
    } finally {
      setSettling(false);
    }
  };

  // Handle Process Refund
  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundPaymentId || !refundAmount) return;
    setRefunding(true);
    setRefundSuccessMsg(null);
    try {
      const res = await fetch('/api/v1/razorpay/analytics/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: refundPaymentId,
          amount: parseFloat(refundAmount),
          reason: refundReason,
          speed: refundSpeed
        })
      });
      if (res.ok) {
        const resJson = await res.json();
        setRefundSuccessMsg(`Refund of ₹${resJson.amount.toLocaleString()} processed successfully via ${resJson.speed.toUpperCase()} routing!`);
        setTimeout(() => {
          setShowRefundModal(false);
          setRefundSuccessMsg(null);
          setRefundPaymentId('');
          setRefundAmount('');
          fetchOverview();
        }, 1800);
      }
    } catch (err) {
      console.error('Refund processing failed', err);
    } finally {
      setRefunding(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-[#0B72E7] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Loading Razorpay Analytics Telemetry...</span>
        </div>
      </div>
    );
  }

  const d = data || {};

  return (
    <div className="space-y-8 pb-16">
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO HEADER */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0C3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-blue-400/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Razorpay Live Gateway Integration
              </Badge>
              <Badge className="bg-white/10 text-blue-200 border-white/20 text-xs font-mono">
                Payments • Settlements • Refunds
              </Badge>
              <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/30 text-xs">
                MDR Netting & T+1 Telemetry
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Razorpay Analytics Module
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-3xl">
              Comprehensive telemetry across Payments API authorization velocity, Settlements API payout batches,
              MDR fee deductions, and Refund API lifecycle reconciliation.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setShowSettleModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs h-10 px-4 rounded-xl shadow-md gap-2"
            >
              <Zap className="w-4 h-4" />
              Trigger Settlement
            </Button>
            <Button
              onClick={() => setShowRefundModal(true)}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-semibold text-xs h-10 px-4 rounded-xl gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Process Refund
            </Button>
            <Button
              onClick={fetchOverview}
              variant="outline"
              size="sm"
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-10 w-10 p-0"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. TIMEFRAME CONTROLS & TAB NAVIGATION */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 'visualizations', label: 'Executive Analytics & Charts', icon: TrendingUp },
            { id: 'settlements', label: `Settlements Ledger (${d.recent_settlements?.length || 0})`, icon: Building2 },
            { id: 'refunds', label: `Refunds Ledger (${d.recent_refunds?.length || 0})`, icon: RotateCcw },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#0B72E7] text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Window:
          </span>
          {[
            { label: '7 Days', val: '7d' },
            { label: '30 Days', val: '30d' },
            { label: '90 Days', val: '90d' },
            { label: '1 Year', val: '1y' },
          ].map((pill) => (
            <Button
              key={pill.val}
              variant={timeframe === pill.val ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(pill.val)}
              className={`h-8 px-3 text-xs font-semibold rounded-lg ${
                timeframe === pill.val
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {pill.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. TREND CARDS (4 CORE FINANCIAL & GATEWAY KPI PILLARS) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Trend Card 1: Gross Revenue */}
        <Card className="border border-slate-200 shadow-sm bg-white p-5 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Gross Revenue
            </span>
            <Badge className="bg-emerald-50 text-emerald-700 text-[11px] font-bold border-emerald-200 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              +{d.growth_yoy_pct || 28.6}%
            </Badge>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{d.gross_revenue_inr ? (d.gross_revenue_inr / 100000).toFixed(2) + ' Lakhs' : '₹0'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Total Captured Volume</span>
            <span className="font-semibold text-slate-700">₹{d.gross_revenue_inr?.toLocaleString()}</span>
          </div>
        </Card>

        {/* Trend Card 2: Net Revenue */}
        <Card className="border border-slate-200 shadow-sm bg-white p-5 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Net Revenue
            </span>
            <Badge className="bg-blue-50 text-blue-700 text-[11px] font-bold border-blue-200 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              +16.2%
            </Badge>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-[#0B72E7]">
              ₹{d.net_revenue_inr ? (d.net_revenue_inr / 100000).toFixed(2) + ' Lakhs' : '₹0'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>After MDR & Refunds</span>
            <span className="font-semibold text-slate-700">{d.fee_efficiency_ratio_pct || 97.6}% Net</span>
          </div>
        </Card>

        {/* Trend Card 3: MDR Charges */}
        <Card className="border border-slate-200 shadow-sm bg-white p-5 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              MDR Charges & GST
            </span>
            <Badge className="bg-amber-50 text-amber-700 text-[11px] font-bold border-amber-200">
              Avg 2.36%
            </Badge>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{d.mdr_charges_inr ? (d.mdr_charges_inr + (d.gst_on_mdr_inr || 0)).toLocaleString() : '₹0'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>MDR ₹{d.mdr_charges_inr?.toLocaleString()}</span>
            <span>GST ₹{d.gst_on_mdr_inr?.toLocaleString()}</span>
          </div>
        </Card>

        {/* Trend Card 4: Total Payments & Success Rate */}
        <Card className="border border-slate-200 shadow-sm bg-white p-5 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Payments
            </span>
            <Badge className="bg-emerald-50 text-emerald-700 text-[11px] font-bold border-emerald-200">
              {d.success_rate_pct || 96.8}% Capture
            </Badge>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {d.total_payments?.toLocaleString() || '0'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-emerald-600 font-semibold">{d.successful_payments} Captured</span>
            <span className="text-rose-500 font-semibold">{d.failed_payments} Failed</span>
          </div>
        </Card>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. SETTLEMENT METRICS HIGHLIGHT BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0F172A] to-slate-800 text-white rounded-3xl p-6 shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Settlement API Operations & Clearing Telemetry</h2>
              <p className="text-xs text-slate-400">Automated T+1 bank transfer batches with direct NEFT/RTGS UTR verification</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/10 text-slate-300 border-white/20 text-xs">
              Primary Account: {d.primary_payout_bank}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-5">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Pending Settlement
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-amber-400 mt-1 block">
              ₹{d.pending_settlement_inr?.toLocaleString() || '0'}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {d.pending_batches_count || 0} batches awaiting clearance
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Completed Settlement
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1 block">
              ₹{d.completed_settlement_inr?.toLocaleString() || '0'}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {d.completed_batches_count || 0} batches credited to bank
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Settlement Time
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-blue-300 mt-1 block">
              {d.avg_settlement_time_hours || 18.5} Hours
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Well within T+1 SLA (24 hrs)
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Next Automated Payout
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-100 mt-1 block">
              {d.next_payout_time || 'Today, 06:00 PM IST'}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Daily automated NEFT batch
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. TAB VIEW: VISUALIZATIONS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'visualizations' && (
        <div className="space-y-8">
          {/* ROW 1: Revenue Velocity Trend (Line Chart) & Settlement Clearing Velocity (Line Chart) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart 1: Revenue Velocity */}
            <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col justify-between">
              <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-[#0B72E7]">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Revenue Velocity Trend
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono border-blue-200 text-blue-700 bg-blue-50">
                      Line Chart
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gross Transacted Volume vs Net Settlement Proceeds vs MDR Deductions (INR)
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  +14.8% GMV
                </span>
              </CardHeader>
              <CardContent className="pt-4 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={d.revenue_trend || []} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString()}`, name]}
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="gross_volume"
                      name="Gross Transacted"
                      stroke="#0B72E7"
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#0B72E7' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="net_revenue"
                      name="Net Bank Proceeds"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#10B981' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mdr_charges"
                      name="MDR Gateway Fee"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Line Chart 2: Settlement Turnaround Velocity */}
            <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col justify-between">
              <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                      <Clock className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Settlement Turnaround Velocity
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono border-indigo-200 text-indigo-700 bg-indigo-50">
                      Line Chart
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Average clearing speed (hours from authorization to bank UTR credit) vs 24h SLA
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                  Avg 18.5 Hrs
                </span>
              </CardHeader>
              <CardContent className="pt-4 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={d.settlement_velocity || []} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      tickFormatter={(val) => `${val}h`}
                    />
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val} hours`, name]}
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="settlement_hours"
                      name="Actual Clearing Time (hrs)"
                      stroke="#6366F1"
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#6366F1' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="benchmark_sla"
                      name="Standard SLA Target (24h)"
                      stroke="#EF4444"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* ROW 2: 3 Pie Charts (Payment Status, Payment Rails, MDR by Rail) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pie Chart 1: Payment Status */}
            <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col justify-between">
              <CardHeader className="pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <PieIcon className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Payment Status Breakdown
                  </CardTitle>
                </div>
                <p className="text-xs text-slate-400">Capture, failure, and refund ratio</p>
              </CardHeader>
              <CardContent className="pt-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={d.payment_status_distribution || []}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ percentage }) => `${percentage}%`}
                      labelLine={false}
                    >
                      {(d.payment_status_distribution || []).map((entry: any, index: number) => (
                        <Cell key={`status-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `${val} txns (${item.payload.percentage}%) • ₹${Number(item.payload.amount).toLocaleString()}`,
                        name
                      ]}
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart 2: Payment Rails */}
            <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col justify-between">
              <CardHeader className="pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Payment Rail Distribution
                  </CardTitle>
                </div>
                <p className="text-xs text-slate-400">UPI vs Cards vs NetBanking vs EMI</p>
              </CardHeader>
              <CardContent className="pt-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={d.payment_method_distribution || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {(d.payment_method_distribution || []).map((entry: any, index: number) => (
                        <Cell key={`method-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `₹${Number(val).toLocaleString()} (${item.payload.percentage}%)`,
                        name
                      ]}
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart 3: MDR Charges by Rail */}
            <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col justify-between">
              <CardHeader className="pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    MDR Cost Contribution
                  </CardTitle>
                </div>
                <p className="text-xs text-slate-400">Gateway fees by rail fee schedule</p>
              </CardHeader>
              <CardContent className="pt-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={d.mdr_cost_distribution || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ percentage }) => `${percentage}%`}
                      labelLine={false}
                    >
                      {(d.mdr_cost_distribution || []).map((entry: any, index: number) => (
                        <Cell key={`mdr-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString()}`, name]}
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. TAB VIEW: SETTLEMENTS LEDGER */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'settlements' && (
        <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0B72E7]" />
                <CardTitle className="text-lg font-bold text-slate-900">
                  Razorpay Settlements Ledger
                </CardTitle>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Historical and pending bank payout batches with verified UTR transaction IDs
              </p>
            </div>
            <Button
              onClick={() => setShowSettleModal(true)}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Trigger Payout
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-5">Batch ID</th>
                  <th className="py-3 px-4">Gross Amount</th>
                  <th className="py-3 px-4">MDR Fee + GST</th>
                  <th className="py-3 px-4">Net Payout</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Bank UTR</th>
                  <th className="py-3 px-4">Speed</th>
                  <th className="py-3 px-4">Settled At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(d.recent_settlements || []).map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-medium text-slate-900">
                      {s.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      ₹{s.amount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      -₹{(s.fee + s.tax)?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      ₹{s.net_amount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        className={`text-[10px] font-bold ${
                          s.status === 'settled'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {s.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {s.utr || <span className="text-amber-500">Queued for T+1</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-500">{s.settlement_time_hours} hrs</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {s.settled_at ? new Date(s.settled_at).toLocaleDateString() : 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. TAB VIEW: REFUNDS LEDGER */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'refunds' && (
        <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-500" />
                <CardTitle className="text-lg font-bold text-slate-900">
                  Razorpay Refunds Ledger
                </CardTitle>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Processed and pending refunds linked directly to captured payment IDs
              </p>
            </div>
            <Button
              onClick={() => setShowRefundModal(true)}
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white gap-2 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Process Refund
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-5">Refund ID</th>
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Routing Speed</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Processed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(d.recent_refunds || []).map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-medium text-slate-900">
                      {r.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {r.payment_id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-rose-600">
                      ₹{r.amount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        className={`text-[10px] font-bold ${
                          r.speed === 'instant'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.speed?.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-700">
                      {r.reason || 'General Return'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        {r.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {r.processed_at ? new Date(r.processed_at).toLocaleDateString() : 'Processing'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. MODAL: TRIGGER SETTLEMENT PAYOUT */}
      {/* ------------------------------------------------------------- */}
      {showSettleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Trigger Settlement Payout</h3>
                <p className="text-xs text-slate-500">Initiate immediate bank transfer batch via Settlements API</p>
              </div>
            </div>

            {settleSuccessMsg ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <p className="text-sm font-semibold text-slate-800">{settleSuccessMsg}</p>
                <span className="text-xs text-slate-400 block">Funds dispatched to HDFC Bank primary account</span>
              </div>
            ) : (
              <form onSubmit={handleTriggerSettlement} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Settlement Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    required
                    min={100}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Available in captured pool: ₹{d.pending_settlement_inr?.toLocaleString() || '1,42,000'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Destination Bank Account
                  </label>
                  <input
                    type="text"
                    disabled
                    value="HDFC Bank (Primary Payout) •••• 4892"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium cursor-not-allowed"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-500">
                  <div className="flex justify-between">
                    <span>MDR Deduction (2.0%):</span>
                    <span>-₹{(parseFloat(settleAmount || '0') * 0.02).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18% on MDR):</span>
                    <span>-₹{(parseFloat(settleAmount || '0') * 0.02 * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                    <span>Net Credited to Bank:</span>
                    <span className="text-emerald-600">
                      ₹{(parseFloat(settleAmount || '0') * 0.9764).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={settling}
                    className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                  >
                    {settling ? 'Dispatching Batch...' : 'Confirm Bank Payout'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSettleModal(false)}
                    className="h-11 rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 9. MODAL: PROCESS REFUND */}
      {/* ------------------------------------------------------------- */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Process Refund API Call</h3>
                <p className="text-xs text-slate-500">Reverse captured payment to customer source method</p>
              </div>
            </div>

            {refundSuccessMsg ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <p className="text-sm font-semibold text-slate-800">{refundSuccessMsg}</p>
                <span className="text-xs text-slate-400 block">Status updated to REFUNDED in Payment Gateway</span>
              </div>
            ) : (
              <form onSubmit={handleProcessRefund} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Razorpay Payment ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. pay_seed_001 or pay_rzp_..."
                    value={refundPaymentId}
                    onChange={(e) => setRefundPaymentId(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Refund Amount (INR)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2499.00"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    required
                    min={1}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Refund Routing Speed
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRefundSpeed('instant')}
                      className={`h-10 rounded-xl text-xs font-bold border transition-all ${
                        refundSpeed === 'instant'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      ⚡ Instant Refund
                    </button>
                    <button
                      type="button"
                      onClick={() => setRefundSpeed('normal')}
                      className={`h-10 rounded-xl text-xs font-bold border transition-all ${
                        refundSpeed === 'normal'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      🏦 Normal (5-7 Days)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Cancellation / Return Reason
                  </label>
                  <select
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800"
                  >
                    <option value="Customer return request">Customer Return Request</option>
                    <option value="Duplicate transaction">Duplicate Transaction</option>
                    <option value="Item damaged in transit">Item Damaged in Transit</option>
                    <option value="Out of stock cancellation">Out of Stock Cancellation</option>
                    <option value="Buyer remorse / accidental purchase">Accidental Purchase</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={refunding}
                    className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
                  >
                    {refunding ? 'Processing Refund...' : 'Execute Refund'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRefundModal(false)}
                    className="h-11 rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
