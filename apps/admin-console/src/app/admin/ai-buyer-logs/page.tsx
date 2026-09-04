'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AiBuyerLogItem } from '@/types/admin';
import { 
  Activity, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Bot, 
  Cpu, 
  Terminal, 
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function AdminAiBuyerLogsPage() {
  const [search, setSearch] = useState('');

  const { data: logs = [], isLoading, refetch } = useQuery<AiBuyerLogItem[]>({
    queryKey: ['admin', 'ai-buyer-logs'],
    queryFn: () => apiClient.get('/admin/ai-buyer-logs?limit=50'),
  });

  const filteredLogs = logs.filter(l => {
    const term = search.toLowerCase();
    return l.id.toLowerCase().includes(term) ||
           l.agent_name.toLowerCase().includes(term) ||
           l.query.toLowerCase().includes(term) ||
           l.endpoint.toLowerCase().includes(term);
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Developer Console</span>
            <span>•</span>
            <span className="text-[#0B72E7]">Observability</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654] flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-[#0B72E7]" />
            AI Buyer Request Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry and query traces executed by autonomous procurement agents, bots, and LLMs.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="rounded-xl text-xs font-semibold gap-1.5 border-slate-200"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          <span>Refresh Traces</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search traces by agent ID, query text, or endpoint..."
            className="pl-9 h-9 text-xs rounded-xl border-slate-200"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No matching request logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Trace ID & Time</th>
                  <th className="py-3.5 px-6 font-semibold">AI Agent Name</th>
                  <th className="py-3.5 px-6 font-semibold">Query Intent / Action</th>
                  <th className="py-3.5 px-6 font-semibold">Endpoint Route</th>
                  <th className="py-3.5 px-6 font-semibold">Latency & Tokens</th>
                  <th className="py-3.5 px-6 font-semibold text-right">HTTP Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900 block text-xs">{log.id}</span>
                      <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </td>

                    <td className="py-4 px-6 font-sans">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-[#0B72E7] shrink-0" />
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">{log.agent_name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{log.agent_id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-sans text-slate-700 max-w-xs truncate">
                      "{log.query}"
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px] font-bold">
                          {log.method}
                        </Badge>
                        <span className="text-[11px] text-slate-800">{log.endpoint}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs">
                      <span className="text-slate-900 font-bold">{log.latency_ms} ms</span>
                      <span className="text-slate-400 block text-[10px]">{log.tokens_used} tokens</span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Badge className={log.status?.includes('200') || log.status?.includes('201') ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]' : 'bg-rose-50 text-rose-700 border-rose-200 text-[10px]'}>
                        {log.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
