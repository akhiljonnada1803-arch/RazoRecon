'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Workflow, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Database, 
  GitCompare, 
  AlertCircle, 
  BrainCircuit, 
  ShieldAlert,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RecordExceptionRequestDTO, VendorBehavioralProfileDTO } from '@/types/memory';

const PIPELINE_STEPS = [
  { step: 1, name: 'Transactions Ingestion', icon: Database, color: 'text-blue-500 bg-blue-50 border-blue-200' },
  { step: 2, name: 'Reconciliation Netting', icon: GitCompare, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
  { step: 3, name: 'Exception Detection', icon: AlertCircle, color: 'text-amber-500 bg-amber-50 border-amber-200' },
  { step: 4, name: 'Memory Update', icon: BrainCircuit, color: 'text-purple-500 bg-purple-50 border-purple-200' },
  { step: 5, name: 'Vendor Risk Recalculation', icon: ShieldAlert, color: 'text-rose-500 bg-rose-50 border-rose-200' },
];

export const MemoryRiskWorkflowTracker: React.FC = () => {
  const queryClient = useQueryClient();
  const [lastUpdatedVendor, setLastUpdatedVendor] = useState<string | null>(null);

  const simulateMutation = useMutation({
    mutationFn: (payload: RecordExceptionRequestDTO) =>
      apiClient.post<VendorBehavioralProfileDTO>('/memory/record-exception', payload),
    onSuccess: (data) => {
      setLastUpdatedVendor(data.vendor);
      queryClient.invalidateQueries({ queryKey: ['memory-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-risk-dashboard'] });
    },
  });

  const handleSimulate = () => {
    simulateMutation.mutate({
      vendor_id: 'VEND-ABC-LOGISTICS',
      vendor_name: 'ABC Logistics',
      exception_type: 'Tax Mismatch',
      transaction_amount: 4820.00,
      root_cause: '18% GST vs 12% freight composite supply variance detected on March freight manifest.',
      resolution: 'Reclassified under SAC 9965; adjusted input tax credit ledger.'
    });
  };

  return (
    <Card className="border border-slate-200 bg-white shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 text-[#0B72E7]">
            <Workflow className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-[#072654]">
              Integrated Memory & Risk Recalculation Pipeline
            </CardTitle>
            <p className="text-xs text-slate-500">
              Transactions ➔ Reconciliation ➔ Exception Detection ➔ Memory Update ➔ Vendor Risk Recalculation
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleSimulate}
          disabled={simulateMutation.isPending}
          className="h-8 text-xs bg-[#0B72E7] hover:bg-blue-600 text-white font-semibold gap-1.5 shadow-xs"
        >
          <Zap className={`h-3.5 w-3.5 ${simulateMutation.isPending ? 'animate-spin' : 'fill-white'}`} />
          <span>{simulateMutation.isPending ? 'Recalculating...' : 'Simulate ABC Logistics Exception (+1)'}</span>
        </Button>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Pipeline 5-Step Visualizer */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {PIPELINE_STEPS.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={st.step}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-md border ${st.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">0{st.step}</span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">{st.name}</h4>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Active Sync</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live notification message after simulation */}
        {lastUpdatedVendor && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Live Workflow Executed:</strong> Memory updated and risk recalculated for <strong>{lastUpdatedVendor}</strong>. Event log recorded below.
              </span>
            </span>
            <Badge variant="outline" className="text-[10px] bg-white text-emerald-700 border-emerald-300 font-mono">
              Audit Stream Synced
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
