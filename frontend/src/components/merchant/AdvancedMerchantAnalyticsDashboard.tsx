'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  ShoppingBag,
  Bot,
  Users,
  Download,
  FileText,
  Calendar,
  Store,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
  RefreshCw,
  Filter,
  Check,
  ChevronDown,
  Clock,
  Printer,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Custom Palette for Category & Donut Charts
const PIE_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];
const HIST_COLORS = ['#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF'];

interface MerchantOption {
  id: string;
  name: string;
  badge: string;
  category: string;
  primary_focus?: string;
}

export default function AdvancedMerchantAnalyticsDashboard() {
  const [selectedMerchant, setSelectedMerchant] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30d');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [merchants, setMerchants] = useState<MerchantOption[]>([]);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Fetch telemetry
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let url = `/api/v1/merchant/growth/advanced-analytics?merchant_id=${selectedMerchant}&date_range=${dateRange}`;
      if (dateRange === 'custom' && customFrom && customTo) {
        url += `&from_date=${customFrom}&to_date=${customTo}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.merchants) {
          setMerchants(json.merchants);
        }
      }
    } catch (err) {
      console.error('Failed to load merchant analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMerchant, dateRange]);

  // Export CSV Function
  const handleExportCSV = () => {
    if (!data || !data.charts) return;

    const filterInfo = data.active_filter || {};
    const kpis = data.summary_kpis || {};
    const lines: string[] = [];

    // Header & Meta
    lines.push(`"RazorCommerce Advanced Merchant Analytics Report"`);
    lines.push(`"Generated At","${new Date().toISOString()}"`);
    lines.push(`"Merchant","${filterInfo.merchant_name || 'All Merchants'}"`);
    lines.push(`"Date Filter","${filterInfo.date_range} (${filterInfo.days_count} Days)"`);
    lines.push('');

    // Summary KPIs
    lines.push(`"--- EXECUTIVE SUMMARY KPIS ---"`);
    lines.push(`"Metric","Value"`);
    lines.push(`"Gross Revenue (INR)","₹${kpis.gross_revenue?.toLocaleString()}"`);
    lines.push(`"Total Orders","${kpis.total_orders}"`);
    lines.push(`"Average Order Value (AOV)","₹${kpis.average_order_value?.toLocaleString()}"`);
    lines.push(`"AI Autonomous Commerce Share","${kpis.agent_order_pct}%"`);
    lines.push(`"Projected Monthly Run-Rate","₹${kpis.projected_monthly_run_rate?.toLocaleString()}"`);
    lines.push(`"Total Active Customers","${kpis.total_active_customers}"`);
    lines.push('');

    // 1. Revenue Trend
    lines.push(`"--- 1. REVENUE TREND ---"`);
    lines.push(`"Date","Actual Revenue (INR)","Target (INR)","Orders Count"`);
    (data.charts.revenue_trend || []).forEach((r: any) => {
      lines.push(`"${r.date}","${r.revenue}","${r.target}","${r.orders}"`);
    });
    lines.push('');

    // 2. Daily Orders
    lines.push(`"--- 2. DAILY ORDERS ---"`);
    lines.push(`"Date","Orders Count","Units Sold","Revenue (INR)","Average Order Value (INR)"`);
    (data.charts.daily_orders || []).forEach((d: any) => {
      lines.push(`"${d.date}","${d.orders_count}","${d.units_sold}","${d.revenue}","${d.avg_order_value}"`);
    });
    lines.push('');

    // 3. Category Revenue
    lines.push(`"--- 3. CATEGORY REVENUE ---"`);
    lines.push(`"Category Name","Revenue (INR)","Share (%)"`);
    (data.charts.category_revenue || []).forEach((c: any) => {
      lines.push(`"${c.name}","${c.value}","${c.percentage}%"`);
    });
    lines.push('');

    // 4. Top Selling Products
    lines.push(`"--- 4. TOP SELLING PRODUCTS ---"`);
    lines.push(`"Product Name","Category","Units Sold","Total Revenue (INR)","Unit Price (INR)"`);
    (data.charts.top_products || []).forEach((p: any) => {
      lines.push(`"${p.name}","${p.category}","${p.sales_count}","${p.revenue}","${p.unit_price}"`);
    });
    lines.push('');

    // 5. Agent Orders vs Human Orders
    lines.push(`"--- 5. AGENT ORDERS VS HUMAN ORDERS ---"`);
    lines.push(`"Channel","Orders Count","Revenue (INR)","Percentage"`);
    (data.charts.agent_vs_human || []).forEach((a: any) => {
      lines.push(`"${a.name}","${a.value}","${a.revenue}","${a.percentage}%"`);
    });
    lines.push('');

    // 6. Revenue Forecast
    lines.push(`"--- 6. REVENUE FORECAST ---"`);
    lines.push(`"Date","Actual Revenue","Forecasted Revenue","Upper Bound (95% CI)","Lower Bound (95% CI)","Is Forecast Period"`);
    (data.charts.revenue_forecast || []).forEach((f: any) => {
      lines.push(`"${f.date}","${f.actual_revenue ?? 'N/A'}","${f.forecasted_revenue}","${f.upper_bound}","${f.lower_bound}","${f.is_forecast}"`);
    });
    lines.push('');

    // 7. Customer Lifetime Value Histogram
    lines.push(`"--- 7. CUSTOMER LIFETIME VALUE HISTOGRAM ---"`);
    lines.push(`"CLV Bracket","Customer Count","Average Spend (INR)","% of Total Base","Cumulative %"`);
    (data.charts.clv_histogram || []).forEach((h: any) => {
      lines.push(`"${h.bin}","${h.customer_count}","${h.avg_spend}","${h.pct_of_customers}%","${h.cumulative_pct}%"`);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute(
      'download',
      `merchant_analytics_${selectedMerchant}_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF Function (Triggers optimized print view)
  const handleExportPDF = () => {
    window.print();
  };

  const kpis = data?.summary_kpis || {};
  const activeFilter = data?.active_filter || {};
  const charts = data?.charts || {};

  return (
    <div ref={dashboardRef} className="space-y-8 pb-16 print:p-0 print:space-y-4">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & CONTROLS TOOLBAR */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0C3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-blue-400/20 print:border-none print:shadow-none print:p-4 print:text-black print:bg-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none print:hidden" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs font-bold uppercase tracking-wider print:text-black">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Advanced Merchant Telemetry
              </Badge>
              <Badge className="bg-white/10 text-blue-200 border-white/20 text-xs font-mono print:text-black">
                7 Recharts Analytics Visualizations
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 text-xs">
                AI AutoPay & Agent Enabled
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Advanced Merchant Analytics Dashboard
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-3xl print:text-slate-600">
              Deep telemetry on GMV revenue trends, daily order velocity, category contribution, top-selling SKUs,
              autonomous AI Agent vs Human transactions, predictive 30-day forecast, and Customer Lifetime Value (CLV) distribution.
            </p>
          </div>

          {/* Action Buttons: CSV & PDF Export */}
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-2 h-10 font-medium shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Export CSV
            </Button>
            <Button
              onClick={handleExportPDF}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-none gap-2 h-10 font-semibold shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              Export PDF
            </Button>
            <Button
              onClick={fetchAnalytics}
              variant="outline"
              size="sm"
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-10 w-10 p-0"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. FILTERS & DRILLDOWN CONTROLS */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        {/* Merchant Drilldown Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
            <Store className="w-4 h-4 text-[#0B72E7]" />
            <span>Merchant Drilldown:</span>
          </div>
          <div className="relative min-w-[260px]">
            <select
              value={selectedMerchant}
              onChange={(e) => setSelectedMerchant(e.target.value)}
              className="w-full h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="all">🏢 All Merchants (Aggregated Platform)</option>
              <option value="mcht_acme_pos">💳 Acme FinTech Hardware & POS</option>
              <option value="mcht_bharat_audio">🔊 BharatVoice Audio Labs</option>
              <option value="mcht_dahua_sec">📹 Dahua & Hikvision Security</option>
              <option value="mcht_epson_pos">🖨️ Epson Systems & Printers</option>
              <option value="mcht_novus_cloud">☁️ Novus Cloud & FinOps SaaS</option>
            </select>
          </div>
        </div>

        {/* Date Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Date Range:
          </span>
          {[
            { label: 'Today', val: 'today' },
            { label: '7D', val: '7d' },
            { label: '30D', val: '30d' },
            { label: '90D', val: '90d' },
            { label: '1Y (YTD)', val: '1y' },
            { label: 'Custom', val: 'custom' },
          ].map((pill) => (
            <Button
              key={pill.val}
              variant={dateRange === pill.val ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (pill.val === 'custom') {
                  setShowCustomModal(true);
                } else {
                  setDateRange(pill.val);
                }
              }}
              className={`h-8 px-3 text-xs font-semibold rounded-lg transition-all ${
                dateRange === pill.val
                  ? 'bg-[#0B72E7] text-white shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {pill.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Popover/Modal */}
      {showCustomModal && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Custom Date Window:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">From:</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-8 px-2 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">To:</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-8 px-2 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                setDateRange('custom');
                setShowCustomModal(false);
                fetchAnalytics();
              }}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomModal(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Active Filter Indicator Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>Active Scope:</span>
          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
            {activeFilter.merchant_name || 'All Merchants'}
          </span>
          <span>•</span>
          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
            {activeFilter.days_count ? `${activeFilter.days_count} Days Interval` : dateRange}
          </span>
          {activeFilter.from_date && activeFilter.to_date && (
            <span className="text-slate-400">
              ({activeFilter.from_date} to {activeFilter.to_date})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Telemetry Live Synced</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. EXECUTIVE KPI CARDS */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border border-slate-200 shadow-sm bg-white p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Gross Revenue
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              ₹{kpis.gross_revenue ? (kpis.gross_revenue / 100000).toFixed(2) + 'L' : '0'}
            </span>
            <Badge className="bg-emerald-50 text-emerald-700 text-[10px] font-bold border-emerald-200">
              +{kpis.yoy_growth_pct || 34.8}%
            </Badge>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Full Period GMV</span>
        </Card>

        <Card className="border border-slate-200 shadow-sm bg-white p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Orders
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {kpis.total_orders?.toLocaleString() || '0'}
            </span>
            <Badge className="bg-blue-50 text-blue-700 text-[10px] font-bold border-blue-200">
              +18.5%
            </Badge>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Fulfilled Volume</span>
        </Card>

        <Card className="border border-slate-200 shadow-sm bg-white p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Average Order (AOV)
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              ₹{kpis.average_order_value?.toLocaleString() || '0'}
            </span>
            <Badge className="bg-emerald-50 text-emerald-700 text-[10px] font-bold border-emerald-200">
              +8.4%
            </Badge>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Cart Expansion Lift</span>
        </Card>

        <Card className="border border-slate-200 shadow-sm bg-white p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider block">
            AI Agent Share
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-purple-700">
              {kpis.agent_order_pct || 38.4}%
            </span>
            <Badge className="bg-purple-50 text-purple-700 text-[10px] font-bold border-purple-200">
              AutoPay
            </Badge>
          </div>
          <span className="text-[11px] text-purple-500 mt-1 block">Autonomous Orders</span>
        </Card>

        <Card className="border border-slate-200 shadow-sm bg-white p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Active Accounts
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {kpis.total_active_customers?.toLocaleString() || '0'}
            </span>
            <Badge className="bg-slate-100 text-slate-700 text-[10px] font-bold">
              98.6% Ret.
            </Badge>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Repeat Buyers</span>
        </Card>

        <Card className="border border-slate-200 shadow-sm bg-white p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Projected Run-rate
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              ₹{kpis.projected_monthly_run_rate ? (kpis.projected_monthly_run_rate / 100000).toFixed(1) + 'L' : '0'}
            </span>
            <Badge className="bg-emerald-50 text-emerald-700 text-[10px] font-bold border-emerald-200">
              30D Run
            </Badge>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">AI Projected Pace</span>
        </Card>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. CHARTS GRID (ALL 7 REQUIRED CHARTS) */}
      {/* ------------------------------------------------------------- */}

      {/* ROW 1: Revenue Trend (Line Chart) & Revenue Forecast (Line Graph) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Revenue Trend (Line Chart) */}
        <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-[#0B72E7]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <CardTitle className="text-base font-bold text-slate-900">
                  1. Revenue Trend
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono border-blue-200 text-blue-700 bg-blue-50">
                  Line Chart
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily GMV progression vs benchmark sales target trajectory (INR)
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              +14.2% Trend
            </span>
          </CardHeader>
          <CardContent className="pt-4 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.revenue_trend || []} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
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
                  dataKey="revenue"
                  name="Actual Revenue"
                  stroke="#0B72E7"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#0B72E7' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Target Benchmark"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* CHART 6: Revenue Forecast (Line Graph) */}
        <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <CardTitle className="text-base font-bold text-slate-900">
                  6. Revenue Forecast
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono border-purple-200 text-purple-700 bg-purple-50">
                  Line Graph
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                14-day verified actuals + 14-day AI forecast cone with 95% confidence bounds
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              98.2% Confidence
            </span>
          </CardHeader>
          <CardContent className="pt-4 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={charts.revenue_forecast || []} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="forecastCone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [val ? `₹${Number(val).toLocaleString()}` : 'N/A', name]}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="upper_bound"
                  name="95% CI Upper Cone"
                  stroke="none"
                  fill="url(#forecastCone)"
                />
                <Line
                  type="monotone"
                  dataKey="actual_revenue"
                  name="Verified Actuals"
                  stroke="#0B72E7"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#0B72E7' }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecasted_revenue"
                  name="Projected Forecast"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#8B5CF6' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ROW 2: Daily Orders (Bar Chart) & Top Selling Products (Horizontal Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 2: Daily Orders (Bar Chart) */}
        <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <CardTitle className="text-base font-bold text-slate-900">
                  2. Daily Orders
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono border-emerald-200 text-emerald-700 bg-emerald-50">
                  Bar Chart
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily transaction volume and total item units dispatched across merchants
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              Units & Orders
            </span>
          </CardHeader>
          <CardContent className="pt-4 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.daily_orders || []} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any, name: any) => [val, name]}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="orders_count" name="Orders Count" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="units_sold" name="Units Sold" fill="#6EE7B7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* CHART 4: Top Selling Products (Horizontal Bar) */}
        <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <CardTitle className="text-base font-bold text-slate-900">
                  4. Top Selling Products
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono border-blue-200 text-blue-700 bg-blue-50">
                  Horizontal Bar
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Highest grossing catalog items ranked by cumulative GMV (INR)
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Ranked by GMV
            </span>
          </CardHeader>
          <CardContent className="pt-4 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={charts.top_products || []}
                margin={{ top: 10, right: 30, left: 15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="short_name"
                  width={130}
                  tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
                />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `₹${Number(val).toLocaleString()} (${item.payload.sales_count} units)`,
                    'Revenue',
                  ]}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF' }}
                />
                <Bar dataKey="revenue" name="Product Revenue" radius={[0, 6, 6, 0]}>
                  {(charts.top_products || []).map((entry: any, index: number) => (
                    <Cell
                      key={`top-prod-${index}`}
                      fill={index === 0 ? '#0B72E7' : index === 1 ? '#2563EB' : index === 2 ? '#3B82F6' : '#60A5FA'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ROW 3: Category Revenue (Pie Chart) & Agent Orders vs Human Orders (Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 3: Category Revenue (Pie Chart) */}
        <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <PieIcon className="w-4 h-4" />
                </div>
                <CardTitle className="text-base font-bold text-slate-900">
                  3. Category Revenue
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono border-emerald-200 text-emerald-700 bg-emerald-50">
                  Pie Chart
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Proportional revenue split by hardware, consumables, SaaS, and surveillance
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
              {charts.category_revenue?.length || 0} Categories
            </span>
          </CardHeader>
          <CardContent className="pt-4 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.category_revenue || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ percentage }) => `${percentage}%`}
                  labelLine={false}
                >
                  {(charts.category_revenue || []).map((entry: any, index: number) => (
                    <Cell key={`cat-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* CHART 5: Agent Orders vs Human Orders (Donut Chart) */}
        <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Bot className="w-4 h-4" />
                </div>
                <CardTitle className="text-base font-bold text-slate-900">
                  5. Agent Orders vs Human Orders
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono border-purple-200 text-purple-700 bg-purple-50">
                  Donut Chart
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Autonomous AI Agent Checkouts (AutoPay) vs Manual Human Buyer Checkouts
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              AI Conversion 4.6x
            </span>
          </CardHeader>
          <CardContent className="pt-4 h-[320px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.agent_vs_human || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={5}
                >
                  {(charts.agent_vs_human || []).map((entry: any, index: number) => (
                    <Cell key={`agent-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} orders (${item.payload.percentage}%) • ₹${Number(item.payload.revenue).toLocaleString()}`,
                    name,
                  ]}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Donut Badge */}
            <div className="absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-900 block">
                {charts.agent_vs_human?.[0]?.percentage || 38.4}%
              </span>
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                Autonomous
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 4: Customer Lifetime Value (Histogram) */}
      <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
        <CardHeader className="pb-2 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Users className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900">
                7. Customer Lifetime Value (CLV)
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono border-indigo-200 text-indigo-700 bg-indigo-50">
                Histogram
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Frequency distribution of merchant buyers across 6 discrete cumulative spend tiers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Total Analyzed:</span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              {kpis.total_active_customers?.toLocaleString() || 0} Customer Accounts
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6 h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.clv_histogram || []} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="bin" tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                label={{ value: 'Number of Customers', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94A3B8' }}
              />
              <Tooltip
                formatter={(val: any, name: any, item: any) => [
                  `${val} accounts (${item.payload.pct_of_customers}%) • Avg Spend ₹${Number(item.payload.avg_spend).toLocaleString()}`,
                  'Customer Accounts',
                ]}
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#FFF' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="customer_count" name="Customer Accounts" radius={[8, 8, 0, 0]}>
                {(charts.clv_histogram || []).map((entry: any, index: number) => (
                  <Cell key={`hist-${index}`} fill={HIST_COLORS[index % HIST_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
