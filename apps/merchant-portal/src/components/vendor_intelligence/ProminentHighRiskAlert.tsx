'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  ArrowRight, 
  Lock, 
  ExternalLink, 
  AlertTriangle,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HighRiskAlertDTO } from '@/types/vendor_risk';
import { formatCurrency } from '@/lib/utils';

interface ProminentHighRiskAlertProps {
  alerts: HighRiskAlertDTO[];
  onInspectVendor?: (vendorId: string) => void;
}

export const ProminentHighRiskAlert: React.FC<ProminentHighRiskAlertProps> = ({
  alerts,
  onInspectVendor,
}) => {
  if (alerts.length === 0) return null;

  const primaryAlert = alerts[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-rose-200/90 bg-linear-to-r from-rose-50/70 via-white to-white p-5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Counterparty Badge & Core Metrics */}
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 rounded-2xl bg-rose-100/80 text-rose-700 shrink-0 border border-rose-200 shadow-2xs mt-0.5">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 font-mono">
                CRITICAL COUNTERPARTY ALERT
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">ID: {primaryAlert.vendor_id}</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h3 className="text-xl font-bold text-[#072654]">
                {primaryAlert.vendor}
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold font-mono text-[11px] border border-rose-200">
                  Risk Score: {primaryAlert.risk_score} / 100
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-medium">
                  Exposure: <strong className="text-slate-900 font-mono font-bold">{formatCurrency(primaryAlert.exposure_amount || 204000)}</strong>
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-medium">
                  Primary Risk: <strong className="text-slate-900">{primaryAlert.main_risk}</strong>
                </span>
              </div>
            </div>

            <p className="text-[13px] text-slate-600 leading-relaxed max-w-3xl">
              <strong className="text-rose-900 font-semibold">Recommended Action:</strong> {primaryAlert.recommended_action || "Hold automated approvals until carrier delivery SLA and GST composite tax rate verified."}
            </p>
          </div>
        </div>

        {/* Right Side: CTA Button */}
        <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0">
          <Link href="/review">
            <Button
              className="h-9 px-4 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs gap-1.5 active:scale-98 transition-all"
            >
              <span>Inspect Exceptions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
