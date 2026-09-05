'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Search,
  Sparkles,
  Zap,
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export function LogisticsIntelligenceDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pincodeQuery, setPincodeQuery] = useState<string>('560100');
  const [routingResult, setRoutingResult] = useState<any>(null);
  const [routingLoading, setRoutingLoading] = useState<boolean>(false);

  const loadData = () => {
    setLoading(true);
    apiClient.get<any>('/logistics/overview')
      .then((res) => setData(res))
      .catch((err) => console.error('Failed to load logistics overview', err))
      .finally(() => setLoading(false));
  };

  const testRouting = (pin: string) => {
    if (!pin || pin.length < 3) return;
    setRoutingLoading(true);
    apiClient.get<any>(`/logistics/recommend-carrier/${pin}`)
      .then((res) => setRoutingResult(res))
      .catch((err) => console.error('Failed to route pincode', err))
      .finally(() => setRoutingLoading(false));
  };

  useEffect(() => {
    loadData();
    testRouting('560100');
  }, []);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
        Loading Logistics Fleet Telemetry & Multi-Carrier SLAs...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#0B72E7] rounded-2xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#072654]">
                Multi-Carrier Logistics Intelligence OS
              </h2>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                98.4% Fleet SLA
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Autonomous carrier routing, predictive delay prevention, and T+1 delivery telemetry across 5 integrated fleets.
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
          <span>Refresh Fleet Telemetry</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Monthly Shipments', val: data.total_shipments_month.toLocaleString(), sub: '+18.4% MoM Velocity', icon: Truck, color: 'text-blue-600' },
          { label: 'On-Time SLA Adherence', val: `${data.on_time_delivery_rate}%`, sub: 'Across 19,000+ Pin codes', icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Average Transit Duration', val: `${data.avg_transit_hours}h`, sub: 'Dispatch to Doorstep Handover', icon: Clock, color: 'text-purple-600' },
          { label: 'RTO Loss Avoidance', val: `₹${(data.total_rto_saved_inr / 100000).toFixed(2)}L`, sub: 'Saved via AI Address Verification', icon: ShieldCheck, color: 'text-amber-600' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-black font-mono text-slate-900">{kpi.val}</p>
              <span className="text-[10px] font-medium text-emerald-700 block">{kpi.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carrier SLA Comparison Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#072654] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0B72E7]" />
              <span>Carrier Fleet On-Time Delivery Rate (%)</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Pan-India Target: 98%</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.carrier_performance} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="code" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis domain={[94, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'On-Time SLA']}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E2E8F0' }}
                />
                <Bar dataKey="on_time_pct" fill="#0B72E7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7-Day SLA Trend Line Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#072654] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>7-Day SLA Velocity Trajectory</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Daily Tracking</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.daily_sla_trends} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis domain={[95, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'SLA Adherence']}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E2E8F0' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="bluedart" stroke="#8B5CF6" strokeWidth={2} name="BlueDart" dot={false} />
                <Line type="monotone" dataKey="delhivery" stroke="#0B72E7" strokeWidth={2} name="Delhivery" dot={false} />
                <Line type="monotone" dataKey="ekart" stroke="#10B981" strokeWidth={2} name="Ekart" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Autonomous Pincode Carrier Routing Simulator */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#072654] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Autonomous Pincode Carrier Routing Simulator</span>
            </h3>
            <p className="text-xs text-slate-500">
              Evaluates regional hub load, carrier mesh connectivity, and historical RTO to select optimal courier.
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              value={pincodeQuery}
              onChange={(e) => setPincodeQuery(e.target.value)}
              placeholder="Enter 6-digit Pincode"
              className="w-40 h-8 text-xs font-mono font-bold rounded-xl"
            />
            <Button
              size="sm"
              onClick={() => testRouting(pincodeQuery)}
              disabled={routingLoading}
              className="h-8 rounded-xl text-xs font-bold bg-[#0B72E7] text-white hover:bg-[#095ec2] gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Route</span>
            </Button>
          </div>
        </div>

        {routingResult && (
          <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 p-5 rounded-2xl border border-blue-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white text-[#0B72E7] font-extrabold text-[10px]">
                  Recommended Courier
                </Badge>
                <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {routingResult.recommended_carrier}
                </span>
                <span className="text-xs text-slate-500">
                  ({routingResult.city}, {routingResult.state} • {routingResult.zone} Zone)
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono font-bold">
                <span className="text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-xl">
                  {routingResult.on_time_probability_pct}% On-Time Prob
                </span>
                <span className="text-purple-700 bg-purple-100/60 px-2.5 py-1 rounded-xl">
                  {routingResult.estimated_delivery_days} Day Delivery
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-600 block">AI Routing Reasons:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {routingResult.recommendation_reasons.map((r: string, i: number) => (
                  <div key={i} className="text-[11px] bg-white/90 p-2.5 rounded-xl border border-blue-100 text-slate-700 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hub Backlog & Fleet Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-[#072654]">Integrated Courier Fleet Benchmark</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-bold">Carrier Fleet</th>
                <th className="pb-3 font-bold">Fleet Type</th>
                <th className="pb-3 font-bold">On-Time SLA</th>
                <th className="pb-3 font-bold">Avg Transit</th>
                <th className="pb-3 font-bold">RTO Rate</th>
                <th className="pb-3 font-bold">Cost/kg</th>
                <th className="pb-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.carrier_performance.map((c: any) => (
                <tr key={c.code} className="hover:bg-slate-50/60">
                  <td className="py-3 font-bold text-slate-800 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-400" />
                    <span>{c.name}</span>
                  </td>
                  <td className="py-3 text-slate-600">{c.fleet_type}</td>
                  <td className="py-3 font-bold font-mono text-emerald-600">{c.on_time_pct}%</td>
                  <td className="py-3 font-mono text-slate-700">{c.avg_delivery_days} days</td>
                  <td className="py-3 font-mono text-slate-700">{c.rto_rate_pct}%</td>
                  <td className="py-3 font-mono font-bold text-slate-900">₹{c.cost_per_kg}</td>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                      ACTIVE
                    </Badge>
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
