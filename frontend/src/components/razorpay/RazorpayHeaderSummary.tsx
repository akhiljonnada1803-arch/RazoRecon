'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Calendar, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  Lock,
  CreditCard,
  Layers,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface ExecutiveDashboardData {
  has_data?: boolean;
  kpis: {
    health_score: number;
    health_status: string;
    cash_position: number;
    match_rate: number;
    open_exceptions: number;
    open_exceptions_value: number;
  };
  cash_trend: any[];
}

export const RazorpayHeaderSummary: React.FC = () => {
  const { data } = useQuery<ExecutiveDashboardData>({
    queryKey: ['dashboard', 'executive'],
    queryFn: () => apiClient.get('/dashboard/executive'),
  });

  const hasData = data?.has_data !== false && (data?.cash_trend && data.cash_trend.length > 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      {/* Top row: Title, Period & Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
              MONTHLY ACCOUNTING
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1 font-mono">
              <Calendar className="h-3.5 w-3.5 text-[#0B72E7]" />
              March 2026 Period
            </span>
            <Badge 
              variant="outline" 
              className={`text-[10px] font-mono ${
                hasData 
                  ? 'bg-amber-50 text-amber-700 border-amber-300 font-semibold' 
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              {hasData ? `${data?.kpis.open_exceptions || 0} Exceptions Active` : 'No Data Loaded'}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654] mt-1">
            Finance Operations Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/demo">
            <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold gap-1.5 shadow-2xs">
              <Zap className="h-3.5 w-3.5 text-[#0B72E7]" />
              <span>Generate Demo Data</span>
            </Button>
          </Link>

          <Link href="/review">
            <Button size="sm" className="h-9 text-xs rounded-xl bg-[#0B72E7] hover:bg-blue-600 text-white font-semibold gap-1.5 shadow-xs">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Connect Razorpay</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-medium text-slate-500 block">Net Operating Cash</span>
          <span className="text-lg font-bold font-mono text-[#072654] mt-0.5 block">
            {hasData ? formatCurrency(data?.kpis.cash_position || 0) : 'No data available'}
          </span>
          <span className="text-[10px] text-slate-500">
            {hasData ? 'Across verified bank accounts' : 'Awaiting account connection'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-medium text-slate-500 block">Reconciliation Rate</span>
          <span className="text-lg font-bold font-mono mt-0.5 block text-slate-900">
            {hasData ? `${data?.kpis.match_rate || 0}% Auto-Matched` : 'No data available'}
          </span>
          <span className="text-[10px] text-slate-500">
            {hasData ? 'Deterministic penny reconciliation' : 'Awaiting transaction feeds'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-medium text-slate-500 block">Unresolved Exceptions</span>
          <span className="text-lg font-bold font-mono mt-0.5 block text-slate-900">
            {hasData ? `${data?.kpis.open_exceptions || 0} Line Items` : 'No data available'}
          </span>
          <span className="text-[10px] text-slate-500">
            {hasData ? `${formatCurrency(data?.kpis.open_exceptions_value || 0)} held in review` : '0 active discrepancies'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-medium text-slate-500 block">Month-End Status</span>
          <span className="text-lg font-bold text-slate-900 mt-0.5 block">
            {hasData ? 'Stage 4 of 7' : 'No data available'}
          </span>
          <span className="text-[10px] text-slate-500">
            {hasData ? 'Ready for final review' : 'Not started'}
          </span>
        </div>
      </div>
    </div>
  );
};
