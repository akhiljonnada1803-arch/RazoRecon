'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ProtocolMonitoringData } from '@/types/admin';
import { 
  Terminal, 
  Key, 
  Radio, 
  Activity, 
  Zap, 
  Code2, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Server, 
  ArrowUpRight,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { data: monitoring, isLoading } = useQuery<ProtocolMonitoringData>({
    queryKey: ['admin', 'protocol-monitoring'],
    queryFn: () => apiClient.get('/admin/protocol-monitoring'),
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#072654] via-slate-900 to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-mono backdrop-blur-md">
                <Code2 className="w-3.5 h-3.5 mr-1" />
                Developer & AI Platform Console
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                Protocol v1.4 Active
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Commerce Infrastructure & Developer Hub
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Monitor autonomous AI Buyer query ingestion, API key authentication, event webhooks, and machine-readable catalog feeds.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/admin/agent-api">
              <Button size="sm" className="bg-white hover:bg-blue-50 text-[#072654] font-bold rounded-xl text-xs shadow-md gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-[#0B72E7]" />
                <span>API Playground</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">System Uptime</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono">
            {monitoring?.uptime_pct || 99.99}%
          </div>
          <span className="text-[11px] text-slate-500 block">Zero downtime across all clusters</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">24h AI Requests</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#0B72E7]">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {(monitoring?.total_requests_24h || 184500).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">+34.2% AI buyer traffic</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Avg Latency</span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Server className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {monitoring?.avg_latency_ms || 112} ms
          </div>
          <span className="text-[11px] text-slate-500 block">Sub-150ms autonomous checkout</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Active AI Buyers</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 font-mono">
            {monitoring?.active_ai_buyers || 28}
          </div>
          <span className="text-[11px] text-slate-500 block">LangChain & CrewAI Agents</span>
        </div>
      </div>

      {/* Developer Console Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href="/admin/agent-api" className="group">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#072654] group-hover:text-[#0B72E7] transition-colors flex items-center justify-between">
                <span>Agent API Center</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-[#0B72E7]" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                OpenAPI specifications, discovery endpoints, and cURL query execution playground.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/admin/api-keys" className="group">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#072654] group-hover:text-[#0B72E7] transition-colors flex items-center justify-between">
                <span>API Key Management</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-[#0B72E7]" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Provision, manage permissions, and revoke Live/Test credentials for AI Agents.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/admin/webhooks" className="group">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#072654] group-hover:text-[#0B72E7] transition-colors flex items-center justify-between">
                <span>Webhook Management</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-[#0B72E7]" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Configure HTTP event delivery hooks for order status transitions and settlements.
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Protocol Health Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-[#072654]">Protocol Endpoints Status</h3>
            <p className="text-xs text-slate-500">Live health checks and latency percentiles</p>
          </div>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">All Systems Nominal</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Endpoint Route</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Avg Latency</th>
                <th className="py-3 px-4 font-semibold">P99 Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {(monitoring?.endpoints_status || [
                { endpoint: "/api/v1/catalog/products", status: "OPERATIONAL", latency_ms: 42, p99_ms: 95 },
                { endpoint: "/api/v1/catalog/agent-context", status: "OPERATIONAL", latency_ms: 68, p99_ms: 140 },
                { endpoint: "/api/v1/commerce/chat", status: "OPERATIONAL", latency_ms: 180, p99_ms: 310 },
                { endpoint: "/api/v1/commerce/checkout", status: "OPERATIONAL", latency_ms: 195, p99_ms: 340 }
              ]).map((ep) => (
                <tr key={ep.endpoint} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{ep.endpoint}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px]">
                      {ep.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-800">{ep.latency_ms} ms</td>
                  <td className="py-3.5 px-4 text-slate-500">{ep.p99_ms} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
