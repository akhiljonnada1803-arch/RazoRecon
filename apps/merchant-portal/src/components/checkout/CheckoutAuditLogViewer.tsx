'use client';

import React, { useState } from 'react';
import { AuditLog } from '@/types/checkout';
import { 
  ShieldCheck, 
  Bot, 
  User, 
  Cpu, 
  Clock, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CheckoutAuditLogViewerProps {
  logs: AuditLog[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function CheckoutAuditLogViewer({
  logs,
  isLoading,
  onRefresh,
}: CheckoutAuditLogViewerProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const getActorBadge = (actor: string) => {
    switch (actor.toLowerCase()) {
      case 'agent':
        return (
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold border gap-1">
            <Bot className="h-3 w-3 text-indigo-600" />
            AI Agent
          </Badge>
        );
      case 'user':
        return (
          <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px] font-bold border gap-1">
            <User className="h-3 w-3 text-[#0B72E7]" />
            User
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-semibold border gap-1">
            <Cpu className="h-3 w-3 text-slate-500" />
            System
          </Badge>
        );
    }
  };

  const getEventBadge = (eventType: string) => {
    if (eventType.includes('PAYMENT') || eventType.includes('RECONCILED')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (eventType.includes('COUPON') || eventType.includes('DISCOUNT')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
    if (eventType.includes('ORDER')) {
      return 'bg-blue-50 text-[#0B72E7] border-blue-200';
    }
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <ShieldCheck className="h-4 w-4 text-[#0B72E7]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#072654]">
              Checkout Audit Logs ({logs.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Immutable forensic event ledger of all cart actions & API triggers
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Refresh audit logs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">
          No audit logs recorded yet.
        </div>
      ) : (
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
          {logs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const hasMetadata = Object.keys(log.metadata || {}).length > 0;

            return (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-100/50 transition-colors space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getActorBadge(log.actor)}
                    <Badge
                      variant="outline"
                      className={`font-mono text-[9px] px-1.5 py-0 ${getEventBadge(log.event_type)}`}
                    >
                      {log.event_type}
                    </Badge>
                    <span className="font-mono text-[10px] text-slate-400">
                      {log.entity_id}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <div className="text-slate-700 font-medium text-xs">
                  {log.description}
                </div>

                {hasMetadata && (
                  <div>
                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="text-[10px] text-[#0B72E7] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <span>{isExpanded ? 'Hide Payload Metadata' : 'View Payload Metadata'}</span>
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    {isExpanded && (
                      <pre className="mt-1.5 p-2.5 rounded-xl bg-slate-900 text-slate-100 text-[10px] font-mono overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
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
