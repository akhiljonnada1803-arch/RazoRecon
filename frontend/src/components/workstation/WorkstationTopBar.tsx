'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Layers, 
  Clock, 
  FileSpreadsheet,
  Zap,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const WorkstationTopBar: React.FC = () => {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top row: Current Period & Next Best Action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
              Accounting Workspace
            </span>
            <span className="text-muted-foreground/40">•</span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/60">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Period: March 2026 (Open)</span>
            </div>
            <Badge variant="outline" className="text-[11px] bg-amber-500/10 text-amber-500 border-amber-500/30">
              Action Required
            </Badge>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Financial Operations Workstation
          </h1>
        </div>

        {/* Primary Operational Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/demo">
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 border-border/80 bg-background hover:bg-muted font-medium">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>Load Demo Data</span>
            </Button>
          </Link>

          <Link href="/review">
            <Button size="sm" className="h-9 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Review 6 Pending Exceptions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>

          <Link href="/month-close">
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold">
              <Lock className="h-3.5 w-3.5" />
              <span>Close Books</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Recommended Next Action Banner */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-1 rounded bg-amber-500/15 text-amber-600 shrink-0 mt-0.5 sm:mt-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <strong className="text-foreground font-semibold">Recommended Next Action: </strong>
            <span className="text-muted-foreground">
              6 transactions require operator category review, and 4 Amazon rolling reserve deposits have ₹1,780.73 withheld for return settlement.
            </span>
          </div>
        </div>

        <Link href="/review" className="shrink-0">
          <Button variant="ghost" size="sm" className="h-7 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 px-2.5 font-semibold">
            Resolve Queue →
          </Button>
        </Link>
      </div>
    </div>
  );
};
