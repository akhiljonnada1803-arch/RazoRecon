'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { WorkflowTimeline } from '@/components/month_close/WorkflowTimeline';
import { MonthCloseSummaryCard } from '@/components/month_close/MonthCloseSummaryCard';
import { AuditReportModal } from '@/components/month_close/AuditReportModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Lock, 
  RefreshCw, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar,
  Layers,
  ArrowRight,
  Zap
} from 'lucide-react';
import { MonthCloseResultDTO } from '@/types/month_close';
export default function MonthClosePage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [simulatedStep, setSimulatedStep] = useState<number>(7);
  const [isRunningSim, setIsRunningSim] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<MonthCloseResultDTO>({
    queryKey: ['month-close-status'],
    queryFn: () => apiClient.get('/month-close/status'),
  });

  const closeBooksMutation = useMutation({
    mutationFn: () => apiClient.post('/month-close/execute', { period: 'March 2026' }),
    onSuccess: (newData) => {
      queryClient.setQueryData(['month-close-status'], newData);
      queryClient.invalidateQueries({ queryKey: ['executive-dashboard'] });
      setIsRunningSim(false);
      setSimulatedStep(7);
    },
  });

  const handleCloseBooks = async () => {
    setIsRunningSim(true);
    setSimulatedStep(1);

    // Simulate animated step-by-step progress visually
    for (let i = 1; i <= 6; i++) {
      setSimulatedStep(i);
      await new Promise((r) => setTimeout(r, 450));
    }
    setSimulatedStep(7);

    closeBooksMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-muted-foreground text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-medium">Loading Month-End Close Sentinel & Audit Pack status...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-sm text-destructive">
        Failed to load Month-End Close Agent. Ensure the FastAPI backend is running on port 8000.
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Autonomous Month-End Close Agent
            </h1>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
              7-Step Self-Driving Workflow
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            One-click autonomous reconciliation, control health computation, fraud scanning, forecasting, P&L aggregation & signed CFO audit pack.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-xs h-9 gap-1.5 bg-card/60 backdrop-blur-sm"
          >
            <FileText className="h-4 w-4 text-primary" />
            Download / View Audit Pack
          </Button>

          <Button
            size="sm"
            disabled={isRunningSim || closeBooksMutation.isPending}
            onClick={handleCloseBooks}
            className="text-xs h-9 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md active:scale-95 transition-transform"
          >
            {isRunningSim || closeBooksMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            Close Books (Autonomous Run)
          </Button>
        </div>
      </div>

      {/* Live Execution Progress Bar */}
      {(isRunningSim || closeBooksMutation.isPending) && (
        <Card className="border border-primary/40 bg-primary/5 p-4 shadow-sm space-y-2 animate-pulse">
          <div className="flex items-center justify-between text-xs font-semibold text-primary">
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Executing Step {simulatedStep} of 7: {data.steps[simulatedStep - 1]?.step_name}
            </span>
            <span>{Math.round((simulatedStep / 7) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(simulatedStep / 7) * 100}%` }}
            />
          </div>
        </Card>
      )}

      {/* 1. Core Output Summary Matrix (The 7 Output KPIs) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Certified Month-End Closing Ledger Metrics
          </h2>
          <Badge variant="success" className="text-xs font-mono">
            Status: {data.status} ({data.closed_at})
          </Badge>
        </div>
        <MonthCloseSummaryCard result={data} />
      </section>

      {/* 2. 7-Step Autonomous Timeline View */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Step-by-Step Accounting Execution Pipeline
          </h2>
          <span className="text-[11px] text-muted-foreground font-mono">
            Audit Pack: {data.audit_pack_id}
          </span>
        </div>
        <WorkflowTimeline
          steps={data.steps}
          currentStepIndex={simulatedStep}
          isRunning={isRunningSim || closeBooksMutation.isPending}
        />
      </section>

      {/* Audit Report Modal (PDF Printable View) */}
      <AuditReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={data}
      />
    </div>
  );
}
