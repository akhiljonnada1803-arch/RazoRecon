'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AdminIntegration } from '@/types/admin';
import { 
  Sliders, 
  CreditCard, 
  CheckCircle2, 
  Activity, 
  Layers, 
  Zap, 
  Key, 
  RefreshCw 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminIntegrationsPage() {
  const { data: integrations, isLoading } = useQuery<AdminIntegration[]>({
    queryKey: ['admin', 'integrations'],
    queryFn: () => apiClient.get('/admin/integrations'),
  });

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Sliders className="w-3.5 h-3.5 mr-1" />
                Payment Gateway & ERP Connectors
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <Zap className="w-3.5 h-3.5 mr-1" />
                Live Webhooks Active
              </Badge>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight">
              Gateway, Webhook & ERP Connectors
            </h1>
            <p className="text-blue-100 text-xs mt-1 max-w-xl">
              Configure Razorpay Sandbox API keys, automated webhook subscriptions, and real-time General Ledger ERP synchronization.
            </p>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(integrations || []).map((int) => (
          <div
            key={int.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{int.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono block">{int.type}</span>
                  </div>
                </div>

                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[9px]">
                  {int.status}
                </Badge>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Environment:</span>
                  <span className="font-bold text-slate-800">{int.environment}</span>
                </div>
                {int.key_id && (
                  <div className="flex justify-between text-slate-600">
                    <span>API Key:</span>
                    <span className="text-slate-800 truncate max-w-[160px]">{int.key_id}</span>
                  </div>
                )}
                {int.webhook_url && (
                  <div className="flex justify-between text-slate-600">
                    <span>Webhook:</span>
                    <span className="text-[#0B72E7] truncate max-w-[160px]">{int.webhook_url}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Heartbeat:</span>
                  <span className="text-emerald-600 font-semibold">{int.last_ping}</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 border-slate-200 mt-2"
            >
              Test Connection
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
