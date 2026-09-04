'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  FileCheck,
  CreditCard,
  Building2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TIMELINE_EVENTS = [
  {
    id: 'tl-1',
    time: 'Today, 14:22 IST',
    title: 'Shopify Settlement Batch Reconciled',
    desc: 'Auto-matched ₹14,250.00 payout batch SH-PO-0018 to bank credit BT0001 with zero variance.',
    actor: 'Reconciliation Engine',
    status: 'Success',
    statusClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    amount: '₹14,250.00',
  },
  {
    id: 'tl-2',
    time: 'Today, 14:20 IST',
    title: 'AWS Cloud Debit Duplicate Held',
    desc: 'Intercepted duplicate debit memo BT0002. Payout placed on payment hold pending credit memo.',
    actor: 'Fraud Sentinel',
    status: 'Action Taken',
    statusClass: 'text-rose-700 bg-rose-50 border-rose-200',
    amount: '₹12,500.00',
  },
  {
    id: 'tl-3',
    time: 'Today, 14:15 IST',
    title: 'GAAP Policy Rule Applied',
    desc: 'Categorized DTC marketing expense to kb-0055 (Performance Marketing Policy) with 97% confidence.',
    actor: 'Policy RAG Agent',
    status: 'Auto-Posted',
    statusClass: 'text-blue-700 bg-blue-50 border-blue-200',
    amount: '₹18,400.00',
  },
  {
    id: 'tl-4',
    time: 'Today, 14:02 IST',
    title: 'March 2026 Close Workflow Initiated',
    desc: 'Operator triggered pre-close reconciliation verification across 229 transaction rows.',
    actor: 'Finance Operator',
    status: 'In Progress',
    statusClass: 'text-amber-700 bg-amber-50 border-amber-200',
    amount: '229 Records',
  },
];

export const OperationalActivityTimeline: React.FC = () => {
  return (
    <Card className="border border-slate-200 bg-white shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 text-[#0B72E7]">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-[#072654]">
              Operational Activity Timeline
            </CardTitle>
            <p className="text-xs text-slate-500">
              Audit log of automated postings, reconciliation matches & operator actions
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          Live Stream Active
        </span>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 text-xs">
          {TIMELINE_EVENTS.map((evt) => (
            <div
              key={evt.id}
              className="p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-[10px] font-mono text-slate-400 pt-0.5 shrink-0">
                  {evt.time}
                </span>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{evt.title}</span>
                    <Badge variant="outline" className={`text-[9px] font-semibold py-0 h-4 ${evt.statusClass}`}>
                      {evt.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {evt.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0">
                <span className="font-mono font-bold text-slate-800 text-xs">
                  {evt.amount}
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {evt.actor}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
