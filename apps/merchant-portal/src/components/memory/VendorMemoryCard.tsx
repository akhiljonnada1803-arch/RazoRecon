'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle2, 
  History, 
  Clock, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VendorBehavioralProfileDTO } from '@/types/memory';
import { formatCurrency } from '@/lib/utils';

interface VendorMemoryCardProps {
  profile: VendorBehavioralProfileDTO;
}

export const VendorMemoryCard: React.FC<VendorMemoryCardProps> = ({ profile }) => {
  const [showTimeline, setShowTimeline] = useState(false);

  const isHighRisk = profile.risk_score >= 70;
  const isMediumRisk = profile.risk_score >= 40 && profile.risk_score < 70;

  const trendIcon = profile.trend === 'Increasing' ? (
    <TrendingUp className="h-3.5 w-3.5 text-rose-500" />
  ) : profile.trend === 'Decreasing' ? (
    <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
  ) : (
    <Minus className="h-3.5 w-3.5 text-blue-500" />
  );

  const trendClass = profile.trend === 'Increasing' 
    ? 'bg-rose-50 text-rose-700 border-rose-200' 
    : profile.trend === 'Decreasing' 
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
    : 'bg-blue-50 text-blue-700 border-blue-200';

  return (
    <Card className="border border-slate-200 bg-white shadow-xs hover:shadow-sm transition-all">
      <CardHeader className="p-4 pb-3 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
              <Building2 className="h-4.5 w-4.5 text-[#0B72E7]" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-[#072654] tracking-tight">
                {profile.vendor}
              </CardTitle>
              <code className="text-[10px] text-slate-400 font-mono">
                {profile.vendor_id}
              </code>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <Badge
              variant="outline"
              className={`text-[10px] font-bold font-mono py-0 h-4.5 ${
                isHighRisk
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : isMediumRisk
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              Risk: {profile.risk_score}/100
            </Badge>

            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border flex items-center gap-1 ${trendClass}`}>
              {trendIcon}
              <span>Trend: {profile.trend}</span>
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3.5">
        {/* Key Behavioral Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-medium text-slate-500 block">Total Transactions</span>
            <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{profile.transactions}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-medium text-slate-500 block">Total Exceptions</span>
            <span className={`font-mono font-bold text-sm mt-0.5 block ${profile.exceptions > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {profile.exceptions}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-medium text-slate-500 block">Common Issue</span>
            <span className="font-semibold text-slate-800 text-[11px] mt-0.5 block truncate" title={profile.top_issue}>
              {profile.top_issue}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-medium text-slate-500 block">Avg Txn Value</span>
            <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">
              {formatCurrency(profile.avg_transaction_value)}
            </span>
          </div>
        </div>

        {/* Pattern Counts */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          <span className="font-medium text-slate-500 mr-1">Pattern Memory:</span>
          {profile.settlement_delay_count > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
              {profile.settlement_delay_count} Settlement Delays
            </span>
          )}
          {profile.tax_mismatch_count > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
              {profile.tax_mismatch_count} Tax Mismatches
            </span>
          )}
          {profile.duplicate_payment_count > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
              {profile.duplicate_payment_count} Duplicate Charges
            </span>
          )}
          {profile.exceptions === 0 && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Clean Record</span>
            </span>
          )}
        </div>

        {/* Toggle Historical Timeline Button */}
        {profile.recent_exceptions.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTimeline(!showTimeline)}
              className="w-full justify-between h-7 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-2 font-medium"
            >
              <span className="flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-[#0B72E7]" />
                <span>Historical Resolution Timeline ({profile.recent_exceptions.length})</span>
              </span>
              {showTimeline ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>

            {/* Collapsible Timeline */}
            {showTimeline && (
              <div className="mt-2.5 space-y-2 pl-2 border-l-2 border-slate-200 text-xs">
                {profile.recent_exceptions.map((exc) => (
                  <div key={exc.exception_id} className="relative pl-3 space-y-0.5">
                    <div className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-[#0B72E7]" />
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">{exc.exception_type}</span>
                      <span className="text-[10px] font-mono text-slate-400">{exc.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      <strong className="text-slate-700 font-medium">Root Cause:</strong> {exc.root_cause}
                    </p>
                    <p className="text-[11px] text-emerald-700 bg-emerald-50/80 p-1.5 rounded border border-emerald-200 mt-1">
                      <strong className="font-semibold">Stored Resolution:</strong> {exc.resolution}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
