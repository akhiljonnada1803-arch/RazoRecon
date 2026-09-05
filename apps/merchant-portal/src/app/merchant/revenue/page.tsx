'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Zap,
  CreditCard,
  ArrowUpRight,
  Bot,
  Calendar,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
  Percent,
  CheckCircle2,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ComposedChart,
  Line
} from 'recharts';

import { apiClient } from '@/lib/api-client';

const CHANNEL_COLORS = ['#10b981', '#0B72E7', '#8b5cf6', '#f59e0b'];
const CATEGORY_COLORS = ['#0B72E7', '#10b981', '#f59e0b', '#ec4899'];

export default function RevenueDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hourlyViewMode, setHourlyViewMode] = useState<'revenue' | 'orders'>('revenue');

  useEffect(() => {
    apiClient.get<any>('/merchant/growth/revenue-dashboard')
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load revenue dashboard', err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Loading AI Revenue Growth Dashboard...</span>
        </div>
      </div>
    );
  }

  const kpis = data.kpis || {};
  const hourly = data.hourly_velocity_today || [];
  const monthly = data.monthly_trend || [];
  const channels = data.payment_channel_breakdown || [];
  const categories = data.category_revenue_breakdown || [];

  // Formatted hourly data for ComposedChart
  const formattedHourly = hourly.map((h: any) => ({
    hour: h.hour.replace(':00', '').replace(':59', ''),
    revenue_inr: h.revenue_inr,
    human_orders: Math.max(0, h.orders - h.ai_orders),
    ai_orders: h.ai_orders,
    total_orders: h.orders,
  }));

  // Formatted monthly data in Lakhs for AreaChart
  const formattedMonthly = monthly.map((m: any) => ({
    month: m.month,
    human_lakhs: Number((m.human_rev / 100000).toFixed(2)),
    ai_lakhs: Number((m.ai_rev / 100000).toFixed(2)),
    total_lakhs: Number((m.total / 100000).toFixed(2)),
  }));

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0C3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-blue-400/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                Live Revenue Operations
              </Badge>
              <Badge className="bg-white/10 text-blue-200 border-white/20 text-xs font-mono">
                AutoPay Sync Live
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Merchant Revenue & Growth Dashboard
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-2xl">
              Comprehensive telemetry tracking daily GMV velocity, monthly target achievement, Average Order Value expansion, and AI-driven autonomous commerce revenue.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right min-w-[240px]">
            <span className="text-[11px] font-semibold text-blue-200 block uppercase tracking-wider">
              AI Commerce Revenue Share
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-300">
              {kpis.ai_commerce_revenue_pct}%
            </div>
            <span className="text-[10px] text-blue-200 font-mono">
              ₹{kpis.ai_commerce_gmv_mtd_inr?.toLocaleString('en-IN')} MTD via AI Agents
            </span>
          </div>
        </div>
      </div>

      {/* 2. 6 REQUIRED REVENUE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Revenue Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Revenue Today</span>
          <div className="text-xl font-black text-slate-900 font-mono">
            ₹{kpis.revenue_today_inr?.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> +{kpis.revenue_today_growth_pct}% vs yest.
          </span>
        </div>

        {/* Metric 2: Revenue This Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Revenue This Month</span>
          <div className="text-xl font-black text-[#0B72E7] font-mono">
            ₹{(kpis.revenue_mtd_inr / 100000).toFixed(2)} L
          </div>
          <span className="text-[11px] text-slate-500 font-semibold block">
            {kpis.target_achievement_pct}% of monthly goal
          </span>
        </div>

        {/* Metric 3: Orders Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Orders Today</span>
          <div className="text-xl font-black text-slate-900 font-mono">
            {kpis.orders_today} Orders
          </div>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> +{kpis.orders_today_growth_pct}% velocity
          </span>
        </div>

        {/* Metric 4: Average Order Value (AOV) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Order Value</span>
          <div className="text-xl font-black text-purple-600 font-mono">
            ₹{kpis.average_order_value_aov_inr?.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-bold text-purple-600 flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" /> +{kpis.aov_growth_pct}% AOV Lift
          </span>
        </div>

        {/* Metric 5: Growth % */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">YoY Growth %</span>
          <div className="text-xl font-black text-emerald-600 font-mono">
            +{kpis.yoy_annual_growth_pct}%
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            Annualized trajectory
          </span>
        </div>

        {/* Metric 6: AI Commerce Revenue % */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">AI Commerce %</span>
          <div className="text-xl font-black text-emerald-700 font-mono flex items-center gap-1">
            <Bot className="w-4 h-4 text-emerald-600" />
            {kpis.ai_commerce_revenue_pct}%
          </div>
          <span className="text-[11px] text-emerald-700 font-bold block">
            Track 01 Core Milestone
          </span>
        </div>
      </div>

      {/* 3. VISUALIZATIONS SECTION A: HOURLY VELOCITY GRAPH & PAYMENT CHANNELS DONUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Today's Hourly Velocity & AI Order Trigger Interactive Graph */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#0B72E7]" />
                Today&apos;s Hourly Velocity & AI Order Trigger
              </h3>
              <p className="text-xs text-slate-500">
                Gross revenue distribution and AI automated checkout triggers throughout the day.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setHourlyViewMode('revenue')}
                  className={`text-xs px-3 py-1 font-bold rounded-lg transition-all ${
                    hourlyViewMode === 'revenue'
                      ? 'bg-white text-[#0B72E7] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Revenue Graph (₹)
                </button>
                <button
                  onClick={() => setHourlyViewMode('orders')}
                  className={`text-xs px-3 py-1 font-bold rounded-lg transition-all ${
                    hourlyViewMode === 'orders'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  AI Orders Split
                </button>
              </div>
              <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-xs font-mono">
                Live Intraday
              </Badge>
            </div>
          </div>

          {/* Chart Display */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {hourlyViewMode === 'revenue' ? (
                <AreaChart data={formattedHourly} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hourlyRevGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B72E7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0B72E7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="#64748b"
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Gross Revenue']}
                    contentStyle={{ borderRadius: '12px', borderColor: '#cbd5e1' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue_inr"
                    name="Hourly Revenue"
                    stroke="#0B72E7"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#hourlyRevGradient)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={formattedHourly} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} Orders`, name]}
                    contentStyle={{ borderRadius: '12px', borderColor: '#cbd5e1' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="human_orders"
                    name="Human Orders"
                    fill="#94a3b8"
                    stackId="a"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="ai_orders"
                    name="AI Autonomous Orders"
                    fill="#10b981"
                    stackId="a"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Quick Hourly Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 border-t border-slate-100 text-xs font-mono">
            {hourly.map((h: any, i: number) => (
              <div key={i} className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                <span className="text-[10px] text-slate-400 block">{h.hour.split(' - ')[0]}</span>
                <span className="font-bold text-slate-800 text-xs block">₹{(h.revenue_inr / 1000).toFixed(0)}k</span>
                <span className="text-[10px] text-emerald-600 font-bold block">{h.ai_orders} AI</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right (1 col): Payment Channels Breakdown Donut / Pie Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-emerald-600" />
                Payment Channels Share
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono bg-slate-50">
                4 Rails
              </Badge>
            </div>
            <p className="text-xs text-slate-500">Razorpay AutoPay vs alternative checkout routes.</p>
          </div>

          {/* Recharts Pie / Donut Chart */}
          {channels.length === 0 ? (
            <div className="h-56 w-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-2xl">
              <CreditCard className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-500">No payment channel activity yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Transactions processed through Razorpay checkout will appear here.</p>
            </div>
          ) : (
            <>
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val}%`, name]}
                      contentStyle={{ borderRadius: '12px', borderColor: '#cbd5e1' }}
                    />
                    <Pie
                      data={channels}
                      dataKey="share_pct"
                      nameKey="channel"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {channels.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Interactive Legend with values */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                {channels.map((ch: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-md shrink-0"
                        style={{ backgroundColor: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }}
                      />
                      <span className="font-semibold text-slate-700 truncate max-w-[140px]">{ch.channel}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-500 text-[11px]">₹{(ch.amount_inr / 100000).toFixed(1)}L</span>
                      <span className="font-bold text-slate-900">{ch.share_pct}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 font-medium">
                💡 <strong>UPI AutoPay Mandates</strong> drive highest volume with near-instant settlement.
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. VISUALIZATIONS SECTION B: MULTI-MONTH RUNRATE GRAPH & CATEGORY REVENUE PIE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Multi-Month Revenue Runrate & AI GMV Lift (Stacked Area Graph) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Multi-Month Revenue Growth Runrate & AI Share (₹ Lakhs)
              </h3>
              <p className="text-xs text-slate-500">
                Tracking monthly gross merchandise volume with AI autonomous commerce expansion.
              </p>
            </div>
            <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-mono">
              5-Month Runrate
            </Badge>
          </div>

          {formattedMonthly.length === 0 ? (
            <div className="h-72 w-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-2xl">
              <BarChart3 className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No historical revenue data recorded</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">Monthly GMV and AI autonomous commerce trends will populate as orders are processed.</p>
            </div>
          ) : (
            <>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formattedMonthly} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="aiRevGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="humanRevGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0B72E7" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#0B72E7" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#64748b" />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="#64748b"
                      tickFormatter={(val) => `₹${val}L`}
                    />
                    <Tooltip
                      formatter={(val: any, name: any) => [`₹${val} Lakhs`, name]}
                      contentStyle={{ borderRadius: '12px', borderColor: '#cbd5e1' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area
                      type="monotone"
                      dataKey="human_lakhs"
                      name="Traditional Commerce Revenue"
                      stroke="#0B72E7"
                      strokeWidth={2}
                      stackId="1"
                      fill="url(#humanRevGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="ai_lakhs"
                      name="AI Agent Autonomous Revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      stackId="1"
                      fill="url(#aiRevGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Latest Month Total</span>
                  <strong className="text-sm font-mono text-slate-900 font-black">
                    ₹{formattedMonthly[formattedMonthly.length - 1]?.total_lakhs || 0} Lakhs
                  </strong>
                </div>
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                  <span className="text-emerald-800 block text-[10px] uppercase font-bold">AI Commerce Lift</span>
                  <strong className="text-sm font-mono text-emerald-700 font-black">
                    +{kpis.ai_commerce_revenue_pct || 0}% Share
                  </strong>
                </div>
                <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-100">
                  <span className="text-purple-800 block text-[10px] uppercase font-bold">MTD Target Pace</span>
                  <strong className="text-sm font-mono text-purple-700 font-black">
                    {kpis.target_achievement_pct || 0}% Achieved
                  </strong>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right (1 col): Product Category Revenue Distribution Pie Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#0B72E7]" />
                Category Revenue Share
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono bg-slate-50">
                Product Mix
              </Badge>
            </div>
            <p className="text-xs text-slate-500">Gross revenue split across product categories.</p>
          </div>

          {/* Pie Chart */}
          {categories.length === 0 ? (
            <div className="h-56 w-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-2xl">
              <Layers className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-500">No product categories sales yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Category share will be calculated dynamically once products receive orders.</p>
            </div>
          ) : (
            <>
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val}%`, name]}
                      contentStyle={{ borderRadius: '12px', borderColor: '#cbd5e1' }}
                    />
                    <Pie
                      data={categories}
                      dataKey="share_pct"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={3}
                    >
                      {categories.map((_: any, index: number) => (
                        <Cell key={`cat-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category List */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                {categories.map((cat: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-md shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                      />
                      <span className="font-semibold text-slate-700 truncate max-w-[130px]">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-500 text-[11px]">₹{(cat.amount_inr / 100000).toFixed(1)}L</span>
                      <span className="font-bold text-slate-900">{cat.share_pct}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-900 font-medium">
                🚀 Top category: <strong>{categories[0]?.category}</strong> generating <strong>{categories[0]?.share_pct}%</strong> of volume.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
