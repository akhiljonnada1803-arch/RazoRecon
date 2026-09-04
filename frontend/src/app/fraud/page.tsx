'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { FraudSummaryCards } from '@/components/fraud/FraudSummaryCards';
import { FraudTimeline } from '@/components/fraud/FraudTimeline';
import { FraudTable } from '@/components/fraud/FraudTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  ShieldAlert, 
  RefreshCw, 
  Lock, 
  Zap, 
  FileWarning, 
  CheckCircle,
  Radio
} from 'lucide-react';
import { FraudCenterResponseDTO } from '@/types/fraud';
export default function FraudCenterPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch, isFetching } = useQuery<FraudCenterResponseDTO>({
    queryKey: ['fraud-dashboard'],
    queryFn: () => apiClient.get('/fraud'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (payload: { alert_id: string; new_status: string }) =>
      apiClient.post('/fraud/update-status', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraud-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['executive-dashboard'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-muted-foreground text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-medium">Fraud Intelligence Engine scanning feeds for duplicate debits & velocity spikes...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-sm text-destructive">
        Failed to load Fraud Detection Center. Ensure the FastAPI backend is running on port 8000.
      </div>
    );
  }

  const { summary, alerts, timeline } = data;

  const handleUpdateStatus = (alertId: string, newStatus: string) => {
    updateStatusMutation.mutate({
      alert_id: alertId,
      new_status: newStatus,
    });
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Fraud Detection & Risk Surveillance Center
            </h1>
            <Badge variant="destructive" className="text-xs font-mono uppercase tracking-wider flex items-center gap-1">
              <Radio className="h-3 w-3 animate-pulse" />
              Live Sentinel Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Automated detection across Duplicate Payments, &gt;3x Amount Spikes, Unregistered Vendor Wires & Repeated Settlement Discrepancies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs h-8 gap-1.5 bg-card/60 backdrop-blur-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-rose-500' : ''}`} />
            Re-Scan Feeds
          </Button>
        </div>
      </div>

      {/* 1. Summary KPI Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-rose-500" />
            Surveillance Overview & Loss Prevention
          </h2>
          <span className="text-[11px] text-muted-foreground font-mono">
            Scanning 100% of Bank Feeds & Gateways
          </span>
        </div>
        <FraudSummaryCards summary={summary} />
      </section>

      {/* 2. Fraud Table (Main Interventions) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileWarning className="h-3.5 w-3.5 text-rose-500" />
            Detected Anomaly & Fraud Intervention Registry
          </h2>
          <Badge variant="outline" className="text-[10px] bg-rose-500/5 text-rose-600 border-rose-500/20">
            {alerts.length} Flagged Batches
          </Badge>
        </div>
        <FraudTable
          alerts={alerts}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={updateStatusMutation.isPending}
        />
      </section>

      {/* 3. Fraud Incident Chronology Timeline */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-rose-500" />
            Chronological Anomaly Event Stream
          </h2>
        </div>
        <FraudTimeline events={timeline} />
      </section>
    </div>
  );
}
