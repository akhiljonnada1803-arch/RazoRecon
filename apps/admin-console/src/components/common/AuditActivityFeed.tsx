'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  ShieldCheck, 
  Clock, 
  User, 
  Activity, 
  Search, 
  RefreshCw, 
  ArrowRight, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Database,
  Terminal,
  FileSpreadsheet
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  role: string;
  entity_type: string;
  entity_id: string;
  action: string;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
  created_at?: string;
  updated_at?: string;
}

function formatTimestamp(isoStr?: string | null) {
  if (!isoStr) return 'Recent';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {
    return isoStr;
  }
}

export function AuditActivityFeed({ limit = 20, title = "Enterprise System Audit Stream", showFilters = true }: { limit?: number; title?: string; showFilters?: boolean }) {
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, refetch, isFetching, dataUpdatedAt } = useQuery<{ items: AuditLog[]; total: number }>({
    queryKey: ['admin-audit-activity-feed', limit],
    queryFn: async () => {
      const res = await apiClient.get<any>(`/audit/logs?limit=${limit}`);
      return res?.items ? res : { items: Array.isArray(res) ? res : [], total: Array.isArray(res) ? res.length : 0 };
    },
    refetchInterval: 12000,
  });

  const logs: AuditLog[] = data?.items || [];

  const filteredLogs = logs.filter((log) => {
    if (roleFilter !== 'ALL' && log.role !== roleFilter) return false;
    if (entityFilter !== 'ALL' && log.entity_type !== entityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchAction = log.action?.toLowerCase().includes(q);
      const matchUser = log.user_name?.toLowerCase().includes(q) || log.user_id?.toLowerCase().includes(q);
      const matchEntity = log.entity_type?.toLowerCase().includes(q) || log.entity_id?.toLowerCase().includes(q);
      return matchAction || matchUser || matchEntity;
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('CREATED') || action.includes('APPROVED') || action.includes('ACCEPTED') || action.includes('SUCCESS') || action.includes('DELIVERED')) {
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[10px]">{action}</Badge>;
    }
    if (action.includes('UPDATED') || action.includes('MODIFIED') || action.includes('CHANGED') || action.includes('SHIPPED') || action.includes('PACKED')) {
      return <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 font-mono text-[10px]">{action}</Badge>;
    }
    if (action.includes('DISCOUNT') || action.includes('FORECAST') || action.includes('CALCULATED')) {
      return <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-mono text-[10px]">{action}</Badge>;
    }
    if (action.includes('CANCELLED') || action.includes('REJECTED') || action.includes('SUSPENDED') || action.includes('REVOKED')) {
      return <Badge className="bg-rose-50 text-rose-700 border-rose-200 font-mono text-[10px]">{action}</Badge>;
    }
    return <Badge className="bg-slate-100 text-slate-700 border-slate-200 font-mono text-[10px]">{action}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    if (role === 'AI Agent') {
      return <Badge className="bg-purple-100 text-purple-800 border-purple-300 font-mono text-[10px]">🤖 AI Agent</Badge>;
    }
    if (role === 'Platform Admin' || role === 'Super Admin') {
      return <Badge className="bg-slate-900 text-amber-300 font-mono text-[10px]">👑 Super Admin</Badge>;
    }
    if (role === 'Merchant Owner') {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-mono text-[10px]">🏪 Merchant</Badge>;
    }
    if (role === 'CFO' || role === 'Finance Controller') {
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-mono text-[10px]">💼 Finance</Badge>;
    }
    if (role === 'Customer') {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-mono text-[10px]">👤 Customer</Badge>;
    }
    return <Badge variant="outline" className="text-[10px] font-mono">{role}</Badge>;
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#072654] flex items-center gap-2">
              <span>{title}</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h3>
            <p className="text-xs text-slate-500">ISO 8601 UTC chronological audit trail across all agents, merchants, and entities</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-[11px] font-mono text-slate-400">
            Last Updated: <strong className="text-slate-700">{dataUpdatedAt ? formatTimestamp(new Date(dataUpdatedAt).toISOString()) : 'Live'}</strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 px-2 text-slate-500 hover:text-[#0B72E7] rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#0B72E7]' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      {showFilters && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search by action, actor, or entity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs rounded-xl border-slate-200"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 text-[11px] font-mono">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              >
                <option value="ALL">All Roles</option>
                <option value="Super Admin">Super Admin / Platform Admin</option>
                <option value="AI Agent">AI Agent</option>
                <option value="Merchant Owner">Merchant Owner</option>
                <option value="CFO">CFO / Controller</option>
                <option value="Customer">Customer</option>
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 text-[11px] font-mono">Entity:</span>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              >
                <option value="ALL">All Entities</option>
                <option value="order">Order</option>
                <option value="product">Product / SKU</option>
                <option value="pricing">Pricing</option>
                <option value="campaign">Campaign</option>
                <option value="merchant">Merchant</option>
                <option value="api_key">API Key</option>
                <option value="webhook">Webhook</option>
                <option value="payment">Payment</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Logs List */}
      {isLoading ? (
        <div className="space-y-2.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-100/70 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs space-y-2">
          <Database className="w-8 h-8 mx-auto text-slate-300" />
          <p>No audit events match the selected criteria.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.map((log) => {
            const isExpanded = expandedId === log.id;
            const hasDiff = log.old_value !== undefined || log.new_value !== undefined;

            return (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 transition-all text-xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getActionBadge(log.action)}
                    <span className="font-bold text-slate-800 font-mono">{log.entity_type}</span>
                    <span className="text-slate-400 font-mono text-[11px]">#{log.entity_id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getRoleBadge(log.role)}
                    <span className="text-slate-600 font-medium text-[11px]">{log.user_name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({log.user_id})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-slate-600 font-semibold">{formatTimestamp(log.timestamp)}</span>
                    <span className="text-slate-400 font-mono text-[10px] hidden sm:inline">[{log.timestamp}]</span>
                  </div>

                  {hasDiff && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      className="text-[#0B72E7] hover:underline flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <span>{isExpanded ? 'Hide Diff' : 'Inspect Audit Diff'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {/* Diff Viewer Drawer */}
                {isExpanded && hasDiff && (
                  <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                    <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                      <span className="text-rose-700 font-bold block mb-1 uppercase text-[10px]">Previous Value:</span>
                      <pre className="text-slate-700 whitespace-pre-wrap break-all text-[10px]">
                        {JSON.stringify(log.old_value, null, 2) || 'null'}
                      </pre>
                    </div>

                    <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                      <span className="text-emerald-700 font-bold block mb-1 uppercase text-[10px]">New Value:</span>
                      <pre className="text-slate-700 whitespace-pre-wrap break-all text-[10px]">
                        {JSON.stringify(log.new_value, null, 2) || 'null'}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
