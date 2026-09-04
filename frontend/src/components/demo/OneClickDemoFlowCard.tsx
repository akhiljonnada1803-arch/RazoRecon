'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Zap, 
  CreditCard, 
  CheckCircle2, 
  ShieldAlert, 
  Radio, 
  TrendingUp, 
  BrainCircuit, 
  Sparkles,
  ArrowRight,
  Workflow,
  DollarSign,
  Building2,
  FileCheck2,
  Activity
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OneClickDemoFlowResultDTO } from '@/types/demo';
import { formatCurrency } from '@/lib/utils';

interface OneClickDemoFlowCardProps {
  onSuccess?: () => void;
  className?: string;
}

export const OneClickDemoFlowCard: React.FC<OneClickDemoFlowCardProps> = ({ onSuccess, className }) => {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<OneClickDemoFlowResultDTO | null>(null);

  const demoMutation = useMutation({
    mutationFn: () => apiClient.post<OneClickDemoFlowResultDTO>('/demo/connect-razorpay', {}),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
      queryClient.invalidateQueries({ queryKey: ['memory-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-risk-dashboard'] });
      if (onSuccess) onSuccess();
    },
  });

  return (
    <Card className={`border border-blue-200 bg-linear-to-b from-blue-50/50 via-white to-white shadow-xs ${className}`}>
      <CardHeader className="p-5 pb-4 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono bg-blue-100/60 text-[#0B72E7] border-blue-300 font-bold">
              ONE-CLICK FINTECH DEMO
            </Badge>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">Autonomous Closed-Loop Pipeline</span>
          </div>
          <CardTitle className="text-lg font-bold text-[#072654]">
            Connect Demo Razorpay Account
          </CardTitle>
          <p className="text-xs text-slate-600">
            Automatically ingest 500 Razorpay transactions, execute deterministic reconciliation, update Vendor Memory, compute Risk Scores, and synthesize CFO liquidity outlook.
          </p>
        </div>

        <Button
          size="lg"
          onClick={() => demoMutation.mutate()}
          disabled={demoMutation.isPending}
          className="h-10 text-xs bg-[#0B72E7] hover:bg-blue-600 text-white font-bold px-4 gap-2 shadow-xs shrink-0"
        >
          <Zap className={`h-4 w-4 ${demoMutation.isPending ? 'animate-spin' : 'fill-white'}`} />
          <span>{demoMutation.isPending ? 'Connecting & Reconciling...' : 'Connect Demo Razorpay Account'}</span>
        </Button>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* State Machine Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { step: '1', title: 'Load 500 Txns', icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
            { step: '2', title: 'Reconcile', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
            { step: '3', title: '30 Exceptions', icon: ShieldAlert, color: 'text-amber-600 bg-amber-50' },
            { step: '4', title: 'Update Memory', icon: BrainCircuit, color: 'text-purple-600 bg-purple-50' },
            { step: '5', title: 'Score 22 Vendors', icon: Activity, color: 'text-rose-600 bg-rose-50' },
            { step: '6', title: 'CFO Summary', icon: Sparkles, color: 'text-indigo-600 bg-indigo-50' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="p-2.5 rounded-lg border border-slate-200 bg-white flex flex-col justify-between space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className={`p-1 rounded-md ${s.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">0{s.step}</span>
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">{s.title}</span>
              </div>
            );
          })}
        </div>

        {/* Live Output Section */}
        {result && (
          <div className="space-y-4 pt-2 border-t border-slate-200">
            {/* 1. Payments Imported & Match Rate KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-medium text-slate-500 block">Payments Imported</span>
                <span className="text-xl font-bold font-mono text-[#072654] mt-0.5 block">{result.payments_imported} Txns</span>
                <span className="text-[10px] text-slate-500">₹2.84M gross volume</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-medium text-slate-500 block">Match Rate</span>
                <span className="text-xl font-bold font-mono text-emerald-600 mt-0.5 block">{result.match_rate}%</span>
                <span className="text-[10px] text-slate-500">{result.matched} auto-reconciled</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-medium text-slate-500 block">Exceptions Flagged</span>
                <span className="text-xl font-bold font-mono text-amber-600 mt-0.5 block">{result.exceptions_count} Items</span>
                <span className="text-[10px] text-slate-500">Delays, taxes & duplicates</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-medium text-slate-500 block">Vendor Risk Profiles</span>
                <span className="text-xl font-bold font-mono text-[#0B72E7] mt-0.5 block">{result.risk_profiles_updated} Vendors</span>
                <span className="text-[10px] text-slate-500">Memory engine synced</span>
              </div>
            </div>

            {/* 2. Top Risk Vendors & Fraud Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top Risk Vendors */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-600" />
                    <h4 className="text-xs font-bold text-slate-900">Top Risk Counterparties</h4>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono bg-rose-50 text-rose-700 border-rose-200">
                    4-Factor Model
                  </Badge>
                </div>

                <div className="space-y-2">
                  {result.top_risk_vendors.map((v) => (
                    <div key={v.vendor_id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{v.vendor}</span>
                        <span className="text-[11px] text-slate-500">Main Risk: <strong>{v.main_risk}</strong> ({v.total_exceptions} excs)</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-bold text-sm block ${v.risk_score >= 70 ? 'text-rose-600' : 'text-amber-600'}`}>
                          {v.risk_score} / 100
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{formatCurrency(v.exposure_amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fraud Alerts */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-rose-600" />
                    <h4 className="text-xs font-bold text-slate-900">Active Fraud & Duplicate Interceptions</h4>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border-emerald-200">
                    ₹31.0K Preserved
                  </Badge>
                </div>

                <div className="space-y-2">
                  {result.fraud_alerts.map((f) => (
                    <div key={f.alert_id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{f.entity}</span>
                        <span className="font-mono font-bold text-rose-600">{formatCurrency(f.amount)}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{f.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Cash Forecast & CFO Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-900">30-Day Liquidity & Cash Forecast</h4>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  +{result.cash_forecast.net_improvement_pct}% Growth
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded bg-white border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block">Current Balance</span>
                  <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{formatCurrency(result.cash_forecast.current_balance)}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block">Projected 30-Day Closing</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm mt-0.5 block">{formatCurrency(result.cash_forecast.projected_30d_closing)}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block">Operating Runway</span>
                  <span className="font-mono font-bold text-[#0B72E7] text-sm mt-0.5 block">{result.cash_forecast.runway_days} Days</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  CFO Executive Brief
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {result.cfo_summary}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
