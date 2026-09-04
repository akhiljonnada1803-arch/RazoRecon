'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CommerceAuditEvent } from '@/types/audit';
import { 
  FileText, 
  Search, 
  Filter, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Code2, 
  Clock, 
  Sparkles,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AuditLogsPage() {
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: logs, isLoading } = useQuery<CommerceAuditEvent[]>({
    queryKey: ['audit', 'logs', selectedEventType],
    queryFn: () => apiClient.get(`/audit/logs?limit=100&event_type=${selectedEventType}`),
  });

  const filteredLogs = (logs || []).filter((l) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      l.summary.toLowerCase().includes(term) ||
      l.actor.toLowerCase().includes(term) ||
      l.event_type.toLowerCase().includes(term)
    );
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <FileText className="w-3.5 h-3.5 mr-1" />
                Immutable Audit Trail
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                100% Track 01 Attributed
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Commerce & Financial Event Audit Ledger
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Chronological forensic logging of every product view, basket update, checkout generation, signature verification, and general ledger journal voucher.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {[
            'ALL',
            'PRODUCT_VIEWED',
            'RECOMMENDATION_GENERATED',
            'ADDED_TO_CART',
            'CHECKOUT_STARTED',
            'PAYMENT_CREATED',
            'PAYMENT_SUCCESS',
            'ORDER_RECONCILED'
          ].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedEventType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedEventType === type
                  ? 'bg-[#0B72E7] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-slate-200 text-xs bg-slate-50/50"
          />
        </div>
      </div>

      {/* Audit Logs List */}
      <div className="space-y-3">
        {filteredLogs.map((log) => {
          const isExpanded = expandedId === log.id;

          return (
            <div
              key={log.id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
            >
              <div
                onClick={() => toggleExpand(log.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">{log.event_type}</span>
                      <Badge variant="outline" className="text-[9px] font-mono bg-slate-50 text-slate-600 border-slate-200">
                        {log.actor} ({log.actor_role})
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-xs mt-0.5">{log.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                      <Code2 className="w-3 h-3" /> Structured Payload & Forensic Metadata
                    </span>
                    <pre className="text-[10px] font-mono text-cyan-300 bg-[#072654] p-3 rounded-xl mt-1 overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
