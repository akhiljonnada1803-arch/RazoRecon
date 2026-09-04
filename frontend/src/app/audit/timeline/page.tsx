'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CommerceAuditEvent } from '@/types/audit';
import { 
  Clock, 
  CheckCircle2, 
  ShoppingBag, 
  CreditCard, 
  Sparkles, 
  GitCompare, 
  ShieldCheck, 
  Activity 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AuditTimelinePage() {
  const { data: timeline, isLoading } = useQuery<CommerceAuditEvent[]>({
    queryKey: ['audit', 'timeline'],
    queryFn: () => apiClient.get('/audit/timeline'),
  });

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Clock className="w-3.5 h-3.5 mr-1" />
                Visual Event Timeline
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Sequential Traceability
              </Badge>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight">
              End-to-End Commerce to Ledger Timeline
            </h1>
            <p className="text-blue-100 text-xs mt-1 max-w-xl">
              Inspect the step-by-step causal chain linking customer browsing, AI recommendations, Razorpay checkout, and general ledger settlement.
            </p>
          </div>
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="relative border-l-2 border-slate-200 ml-6 pl-6 space-y-6 pt-2">
        {(timeline || []).map((ev, idx) => (
          <div key={ev.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#0B72E7] group-hover:scale-125 transition-transform" />

            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-2 hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px] font-bold">
                    {ev.event_type}
                  </Badge>
                  <span className="text-xs font-bold text-slate-800">{ev.actor}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {ev.summary}
              </p>

              {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/60 text-[10px] font-mono text-slate-500">
                  {JSON.stringify(ev.metadata)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
