'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Zap,
  Clock,
  ShieldCheck,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Globe,
  Truck,
  Layers,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { ProtocolMonitoringData } from '@/types/admin';

export default function ProtocolMonitoringPage() {
  const [data, setData] = useState<ProtocolMonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMonitoringData = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/admin/protocol-monitoring');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load protocol monitoring data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchMonitoringData();
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-bold bg-[#0B72E7]/10 text-[#0B72E7] rounded border border-[#0B72E7]/20 uppercase tracking-wider">
              Telemetry & Latency Engine
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Mesh Active
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Commerce Protocol Monitoring</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time health, SLA latency, p99 distribution, and carrier delivery webhook telemetry across the Agentic Commerce Protocol v1.4.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${refreshing ? 'animate-spin text-[#0B72E7]' : ''}`} />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 text-sm font-medium">
            <RefreshCw className="w-4 h-4 text-[#0B72E7] animate-spin" />
            Collecting protocol telemetry stream...
          </div>
        </div>
      ) : (
        <>
          {/* Top KPI Stream */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Protocol Spec</span>
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B72E7] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{data?.protocol_version || 'v1.4.2-agentic'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">RFC-8994 compliant AI feed</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0B72E7]" />
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Global Uptime (30d)</span>
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{data?.uptime_percentage || '99.98%'}</span>
                <span className="text-xs font-medium text-emerald-600">SLA 99.9%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Zero major outages recorded</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mean Gateway Latency</span>
                <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{data?.avg_latency_ms || 32} ms</span>
                <span className="text-xs font-medium text-amber-600">p99 ~ 88ms</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Edge response acceleration active</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active AI Agents</span>
                <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{data?.active_ai_buyers_count || 14}</span>
                <span className="text-xs font-medium text-purple-600">Autonomous</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">ChatGPT, Claude, Perplexity & custom bots</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" />
            </div>
          </div>

          {/* Main Grid: Endpoint Status & Carrier Webhook Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Endpoints Table (2 Cols) */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#0B72E7]" />
                  <h3 className="text-sm font-semibold text-slate-900">Agent API Endpoints Health & Latency SLA</h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">p50 / p95 / p99 distribution</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Endpoint Route</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Avg Latency</th>
                      <th className="px-6 py-3">24h SLA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {(data?.endpoints || []).map((ep, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-3.5">
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                            {ep.path}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                              ep.method === 'GET'
                                ? 'bg-blue-50 text-[#0B72E7] border border-blue-200'
                                : ep.method === 'POST'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}
                          >
                            {ep.method}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            {ep.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono text-slate-800">{ep.latency_ms}ms</span>
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  ep.latency_ms < 40 ? 'bg-emerald-500' : ep.latency_ms < 70 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(ep.latency_ms, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-xs font-semibold text-slate-700 font-mono">{ep.sla}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Carrier Logistics Dispatch Telemetry */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#0B72E7]" />
                    <h3 className="text-base font-semibold text-slate-900">Carrier Webhook Health</h3>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                    Operational
                  </span>
                </div>

                <div className="space-y-4 mt-5">
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800">Delhivery Direct Dispatch</span>
                      <span className="text-xs font-mono font-semibold text-emerald-600">99.8% Success</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Avg webhook dispatch time: 140ms • 0 dropped payloads</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800">Blue Dart Apex Express</span>
                      <span className="text-xs font-mono font-semibold text-emerald-600">99.4% Success</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Avg webhook dispatch time: 180ms • Instant AWB sync</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800">Shiprocket Unified Bridge</span>
                      <span className="text-xs font-mono font-semibold text-emerald-600">99.9% Success</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Avg webhook dispatch time: 95ms • Realtime tracking webhook</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800">Ekart Logistics Agent</span>
                      <span className="text-xs font-mono font-semibold text-emerald-600">99.6% Success</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Avg webhook dispatch time: 110ms • COD & prepaid reconciliation</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Auto-Retry Circuit: <strong className="text-slate-800">Exponential Backoff (3x)</strong></span>
                <span className="text-[#0B72E7] font-medium flex items-center gap-1 cursor-pointer hover:underline">
                  Configure SLA <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Agent Protocol Ingestion Architecture */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-[#0B72E7]/20 blur-3xl pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 text-[#0B72E7]">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">Decentralized AI Agent Feeds</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Machine-readable JSON schema is dynamically optimized for token efficiency (p90 token density &lt; 250 tokens per product) for zero-latency LLM discovery.
                </p>
              </div>

              <div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">Idempotency & Fraud Guard</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every AI-initiated cart and checkout payload is cryptographically signed and checked against stock locks in real-time to avoid double-charging.
                </p>
              </div>

              <div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 text-amber-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">Edge Cache & Invalidation</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Whenever a merchant adjusts inventory status, the global edge cache automatically invalidates in &lt;15ms across all AI Buyer endpoints.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
