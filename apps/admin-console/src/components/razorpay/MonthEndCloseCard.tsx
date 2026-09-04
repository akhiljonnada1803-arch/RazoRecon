'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Lock, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const CLOSE_STEPS = [
  { step: 1, name: 'Reconcile Bank Feeds & Gateways', status: 'completed' },
  { step: 2, name: 'Calculate Finance Health Score', status: 'completed' },
  { step: 3, name: 'Run Fraud Sentinel Scan', status: 'completed' },
  { step: 4, name: 'Resolve Exception Queue (6 Pending)', status: 'active' },
  { step: 5, name: 'Generate Cash Forecast & P&L', status: 'pending' },
  { step: 6, name: 'Compile Audit Pack & Sign-Off', status: 'pending' },
];

export const MonthEndCloseCard: React.FC = () => {
  return (
    <Card className="border border-slate-200 bg-white shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 text-[#0B72E7]">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-[#072654]">
              Month-End Close Checklist
            </CardTitle>
            <p className="text-xs text-slate-500">
              March 2026 Accounting Period Closing Pipeline
            </p>
          </div>
        </div>

        <Link href="/month-close">
          <Button size="sm" className="h-8 text-xs bg-[#0B72E7] hover:bg-blue-600 text-white font-semibold rounded-md shadow-xs">
            <span>Execute Close Books</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Close Progress: 50%</span>
            <span className="text-slate-500 font-mono">3 of 6 Completed</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-[#0B72E7] rounded-full transition-all duration-500 w-1/2" />
          </div>
        </div>

        {/* Steps List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
          {CLOSE_STEPS.map((st) => (
            <div
              key={st.step}
              className={`p-2.5 rounded-lg border flex items-center justify-between ${
                st.status === 'completed'
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                  : st.status === 'active'
                  ? 'bg-amber-50/80 border-amber-300 text-amber-900 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2">
                {st.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                {st.status === 'active' && <Clock className="h-4 w-4 text-amber-600 shrink-0 animate-pulse" />}
                {st.status === 'pending' && <span className="h-2 w-2 rounded-full bg-slate-300 shrink-0 ml-1" />}
                <span className="text-[11px] leading-tight">{st.name}</span>
              </div>
              <span className="text-[10px] font-mono font-bold">
                {st.status === 'completed' ? 'Done' : st.status === 'active' ? 'Active' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
