'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Zap, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VendorIntelligenceHeaderProps {
  totalExceptions: number;
  onRunDemo?: () => void;
  isDemoRunning?: boolean;
}

export const VendorIntelligenceHeader: React.FC<VendorIntelligenceHeaderProps> = ({
  totalExceptions,
  onRunDemo,
  isDemoRunning,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 font-mono">
            COUNTERPARTY INTELLIGENCE
          </span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Continuous Surveillance
          </span>
        </div>
        <h1 className="text-[32px] font-extrabold tracking-tight text-[#072654] leading-tight">
          Vendor Intelligence Center
        </h1>
        <p className="text-[14px] text-slate-500 max-w-2xl leading-normal">
          Unified intelligence engine analyzing counterparty behavioral memory, 4-factor risk ratings, recurring failure modes, and automated mitigation playbooks.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Link href="/review">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold hover:bg-amber-100/70 transition-colors shadow-2xs">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span>{totalExceptions} Active Exceptions</span>
          </div>
        </Link>

        <Link href="/month-close">
          <Button
            variant="outline"
            className="h-10 text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl px-3.5 shadow-2xs gap-1.5"
          >
            <Lock className="h-3.5 w-3.5 text-slate-500" />
            <span>Close Books</span>
          </Button>
        </Link>

        {onRunDemo && (
          <Button
            onClick={onRunDemo}
            disabled={isDemoRunning}
            className="h-10 text-xs font-semibold bg-[#0B72E7] hover:bg-blue-600 text-white rounded-xl px-4 shadow-sm gap-2 active:scale-98 transition-all"
          >
            <Zap className={`h-4 w-4 ${isDemoRunning ? 'animate-spin' : 'fill-white'}`} />
            <span>{isDemoRunning ? 'Reconciling 500 Txns...' : 'Demo Data Run'}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
