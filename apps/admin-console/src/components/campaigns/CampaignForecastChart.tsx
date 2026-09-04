'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  ShoppingBag, 
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Campaign, DailyForecastPoint } from '@/types/campaign';

interface CampaignForecastChartProps {
  campaigns: Campaign[];
}

export function CampaignForecastChart({ campaigns }: CampaignForecastChartProps) {
  const [selectedCampId, setSelectedCampId] = useState<string>(campaigns[0]?.id || '');
  const activeCampaign = campaigns.find(c => c.id === selectedCampId) || campaigns[0];

  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  if (!activeCampaign || !activeCampaign.forecast_days || activeCampaign.forecast_days.length === 0) {
    return null;
  }

  const chartData = activeCampaign.forecast_days.map(d => ({
    name: d.date_label,
    day: d.day,
    baseline: d.baseline_revenue,
    projected: d.projected_campaign_revenue,
    incremental: d.incremental_lift,
    orders: d.projected_orders
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
      {/* Header & Campaign Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#072654]">Campaign Revenue Trajectory & Payoff Forecast</h2>
            <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-mono">
              Time-Series Model
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500">
            Day-by-day projected revenue trajectory comparing baseline organic sales against campaign lift.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 shrink-0">Select Campaign:</label>
          <select
            value={selectedCampId}
            onChange={(e) => setSelectedCampId(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
          >
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} (+{formatINR(c.expected_revenue_lift)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Trajectory KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Expected Incremental Lift</span>
          <span className="text-base font-bold text-emerald-600 font-mono">
            +{formatINR(activeCampaign.expected_revenue_lift)}
          </span>
          <span className="text-[10px] text-emerald-700 block font-semibold">
            +{activeCampaign.expected_revenue_lift_pct}% above organic run-rate
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Projected Total Orders</span>
          <span className="text-base font-bold text-purple-600 font-mono">
            {activeCampaign.projected_orders.toLocaleString()} orders
          </span>
          <span className="text-[10px] text-slate-500 block">
            Target: {activeCampaign.target_segment}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Campaign Duration</span>
          <span className="text-base font-bold text-slate-800 font-mono">
            {activeCampaign.forecast_days.length} Days
          </span>
          <span className="text-[10px] text-slate-500 block font-mono">
            {activeCampaign.start_date} to {activeCampaign.end_date}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0B72E7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0B72E7" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: '#64748B' }} 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} 
              tick={{ fontSize: 10, fill: '#64748B' }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: any, name: string) => [
                `₹${Number(value).toLocaleString('en-IN')}`,
                name === 'projected' ? 'Projected Campaign Revenue' : 'Baseline Organic Revenue'
              ]}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: '#072654',
                color: '#fff',
                borderRadius: '8px',
                border: 'none',
                fontSize: '11px'
              }}
            />
            <Area
              type="monotone"
              dataKey="projected"
              stroke="#0B72E7"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProjected)"
              name="projected"
            />
            <Area
              type="monotone"
              dataKey="baseline"
              stroke="#94A3B8"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorBaseline)"
              name="baseline"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#0B72E7]" />
          <span>Projected Campaign Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-slate-300" />
          <span>Baseline Organic Revenue</span>
        </div>
      </div>
    </div>
  );
}
