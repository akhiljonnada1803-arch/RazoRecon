'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MetricCard } from '@/components/common/MetricCard';
import { InjectedAnomaliesCard } from '@/components/demo/InjectedAnomaliesCard';
import { QuickNavigationMatrix } from '@/components/demo/QuickNavigationMatrix';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  RefreshCw, 
  FileText, 
  Layers, 
  GitCompare, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Database,
  ArrowRight
} from 'lucide-react';
import { OneClickDemoFlowCard } from '@/components/demo/OneClickDemoFlowCard';
import { DemoGenerationResultDTO } from '@/types/demo';

export default function DemoPage() {
  const queryClient = useQueryClient();
  const [generationResult, setGenerationResult] = useState<DemoGenerationResultDTO | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMutation = useMutation({
    mutationFn: () =>
      apiClient.post<DemoGenerationResultDTO>('/demo/generate', {
        scale_invoices: 100,
        scale_settlements: 100,
        scale_transactions: 100,
      }),
    onSuccess: (data: DemoGenerationResultDTO) => {
      setGenerationResult(data);
      // Invalidate all app queries so all pages immediately reflect the fresh 100-record dataset
      queryClient.invalidateQueries();
      setIsGenerating(false);
    },
    onError: () => {
      setIsGenerating(false);
    },
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Visual brief transition for smooth feel
    await new Promise((r) => setTimeout(r, 350));
    generateMutation.mutate();
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Sparkles className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Instant Demo Mode & Synthetic Scenario Generator
            </h1>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-mono">
              Judges Showcase
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Single-click synthesis of 100 Invoices, 100 Settlements & 100 Bank Transactions with injected real-world financial failure modes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            disabled={isGenerating || generateMutation.isPending}
            onClick={handleGenerate}
            className="text-xs h-9 gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold shadow-md active:scale-95 transition-transform"
          >
            {isGenerating || generateMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 fill-white" />
            )}
            Generate Demo Scenario (1-Click)
          </Button>
        </div>
      </div>

      {/* One-Click Demo Flow: Connect Demo Razorpay Account */}
      <section>
        <OneClickDemoFlowCard />
      </section>

      {/* Hero Notification Banner */}
      <Card className="border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent shadow-sm">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                Instant Verification Suite for Hackathon Judges
              </span>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl leading-relaxed">
                Click <strong>"Generate Demo Scenario"</strong> to populate all 100 Invoices, 100 Settlements, and 100 Transactions. The entire platform will immediately reflect the live dataset across Reconciliation, Forecasting, Fraud Sentinel, and Autonomous Close.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <Badge variant="success" className="py-1 px-3 text-xs font-mono flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Dataset Active: Ready
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Dataset Scale Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Invoices Generated"
          value={generationResult?.invoices_generated || 100}
          subtitle="Shopify, Amazon & SaaS vendors"
          icon={<FileText className="h-4 w-4" />}
          trend="positive"
        />
        <MetricCard
          title="Channel Settlements"
          value={generationResult?.settlements_generated || 100}
          subtitle="Gross-to-net payouts with fee netting"
          icon={<GitCompare className="h-4 w-4" />}
          trend="positive"
        />
        <MetricCard
          title="Bank Transactions"
          value={generationResult?.transactions_generated || 100}
          subtitle="Operating feed debits & deposits"
          icon={<Layers className="h-4 w-4" />}
          trend="positive"
        />
      </div>

      {/* 1. Injected Real-World Anomaly Matrix */}
      <section className="space-y-3">
        <InjectedAnomaliesCard
          anomalies={
            generationResult?.anomalies_injected || [
              {
                category: 'Tax Mismatch',
                count: 2,
                description: 'GST deduction calculation differs by ₹50 from processor fee statement.',
                impact: 'Input Tax Credit reconciliation risk on GSTR-2B.',
                target_entities: ['Shopify Direct Batch #3', 'Shopify Direct Batch #14'],
              },
              {
                category: 'Duplicate Payment',
                count: 4,
                description: 'Identical debit amounts posted within 24h to same vendor descriptor.',
                impact: 'Excess cash outflow & vendor double billing risk.',
                target_entities: ['AMAZON WEB SERVICES AWS', 'FACEBK *7H2K9 AD CHARGE'],
              },
              {
                category: 'Missing Invoice',
                count: 6,
                description: 'Direct wire transfers with no matching purchase order or tax bill.',
                impact: 'Unvouched business expense; audit documentation failure.',
                target_entities: ['DIRECT WIRE TRF BENEFICIARY_1 - 6'],
              },
              {
                category: 'Settlement Delay',
                count: 10,
                description: 'Weekend clearing lag and bank float (+3 to +5 days settlement transit).',
                impact: 'Inter-period clearing float across T+10 window.',
                target_entities: ['Stripe Transfers & Amazon ACH Clearance'],
              },
            ]
          }
        />
      </section>

      {/* 2. Quick Navigation Matrix for Judges */}
      <section className="space-y-3">
        <QuickNavigationMatrix />
      </section>
    </div>
  );
}
