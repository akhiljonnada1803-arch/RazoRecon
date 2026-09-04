'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  Cpu,
  UserCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AUDIT_EVENTS = [
  {
    id: 'log-1',
    time: '14:22:04 IST',
    actor: 'Reconciliation Engine',
    actorType: 'system',
    action: 'Matched Shopify Payout Batch SH-PO-0018',
    detail: 'Gross ₹14,250.00 matched against bank credit BT0001 with zero math discrepancy.',
    impact: 'Reconciled',
    impactType: 'success',
  },
  {
    id: 'log-2',
    time: '14:20:11 IST',
    actor: 'Fraud Sentinel',
    actorType: 'sentinel',
    action: 'Flagged Duplicate AWS Debit BT0002',
    detail: 'Detected matching transaction on same entity within 3 hours. Action: Recalled.',
    impact: '₹12,500.00 Held',
    impactType: 'warning',
  },
  {
    id: 'log-3',
    time: '14:15:30 IST',
    actor: 'Policy RAG Agent',
    actorType: 'ai',
    action: 'Cited kb-0001: Revenue Recognition Standard',
    detail: 'Categorized DTC gross payout to Shopify Sales with 98% confidence score.',
    impact: 'Auto-Posted',
    impactType: 'success',
  },
  {
    id: 'log-4',
    time: '14:02:18 IST',
    actor: 'Operator / CFO',
    actorType: 'user',
    action: 'Initiated March 2026 Month-End Pre-Close',
    detail: 'Triggered deterministic validation across all 229 ingested transaction rows.',
    impact: 'In Progress',
    impactType: 'neutral',
  },
];

export const OperationalAuditLog: React.FC = () => {
  return (
    <Card className="border border-border/80 bg-card shadow-sm">
      <CardHeader className="p-4 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Operations & Audit Trail Log
            </CardTitle>
            <p className="text-xs text-foreground font-semibold mt-0.5">
              Live Event Stream for Current Accounting Period
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-muted-foreground">
          Realtime Stream Active
        </span>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border/60 text-xs">
          {AUDIT_EVENTS.map((item) => (
            <div
              key={item.id}
              className="p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-[10px] font-mono text-muted-foreground pt-0.5 shrink-0">
                  {item.time}
                </span>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{item.action}</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-mono font-medium">
                      {item.actor}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end shrink-0">
                <span
                  className={`font-mono font-semibold text-[11px] ${
                    item.impactType === 'warning'
                      ? 'text-rose-500'
                      : item.impactType === 'success'
                      ? 'text-emerald-500'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
