'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Search, 
  ArrowRight, 
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InvestigatedExceptionDTO } from '@/types/exceptions';
import { formatCurrency } from '@/lib/utils';

interface ExceptionDetailsDrawerProps {
  exception: InvestigatedExceptionDTO | null;
  onClose: () => void;
  onResolve: (exceptionId: string, action: string) => void;
  isResolving?: boolean;
}

export const ExceptionDetailsDrawer: React.FC<ExceptionDetailsDrawerProps> = ({
  exception,
  onClose,
  onResolve,
  isResolving,
}) => {
  if (!exception) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Drawer panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-xl bg-card border-l border-border shadow-2xl h-full flex flex-col justify-between z-10 overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-border/70 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-primary/10 text-primary">
                  <Search className="h-4 w-4" />
                </span>
                <span className="font-mono text-xs font-semibold text-muted-foreground uppercase">
                  {exception.exception_id}
                </span>
                <Badge
                  variant={
                    exception.severity === 'Critical'
                      ? 'destructive'
                      : exception.severity === 'High'
                      ? 'warning'
                      : exception.severity === 'Medium'
                      ? 'secondary'
                      : 'outline'
                  }
                  className="text-[10px] px-2 py-0.5 font-bold uppercase"
                >
                  {exception.severity} Severity
                </Badge>
              </div>

              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {exception.type}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                <span>Txn: <strong className="text-foreground font-mono">{exception.txn_id}</strong></span>
                {exception.payout_id && (
                  <span>Payout: <strong className="text-foreground font-mono">{exception.payout_id}</strong></span>
                )}
                <span>Channel: <strong className="text-foreground">{exception.channel || 'Direct'}</strong></span>
                <span>Amount: <strong className="text-foreground font-mono">{formatCurrency(exception.amount)}</strong></span>
              </div>
            </div>
          </div>

          {/* Investigation Content Body */}
          <div className="p-6 space-y-6 flex-1">
            {/* AI Confidence & Status Bar */}
            <div className="rounded-lg border border-border/70 bg-muted/40 p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  AI Investigation Confidence
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-foreground font-mono">
                    {exception.confidence}%
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    (Deterministic Rule Verified)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Status
                </span>
                <Badge
                  variant={exception.status === 'Resolved' ? 'success' : 'warning'}
                  className="mt-1 text-xs"
                >
                  {exception.status}
                </Badge>
              </div>
            </div>

            {/* 1. Root Cause */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                1. Root Cause Analysis
              </h3>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3.5 text-xs leading-relaxed text-foreground">
                {exception.root_cause}
              </div>
            </div>

            {/* 2. Business Impact */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                2. Business & Financial Impact
              </h3>
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3.5 text-xs leading-relaxed text-foreground">
                {exception.impact}
                {exception.discrepancy_amount ? (
                  <div className="mt-1.5 font-semibold text-rose-600 dark:text-rose-400 font-mono">
                    Monetary Exposure: {formatCurrency(exception.discrepancy_amount)}
                  </div>
                ) : null}
              </div>
            </div>

            {/* 3. Recommended Action */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                3. Recommended Operator Action
              </h3>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3.5 text-xs leading-relaxed text-foreground">
                {exception.action}
              </div>
            </div>

            {/* 4. Forensic Evidence & Audit Trail */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-blue-500" />
                4. Forensic Audit Evidence
              </h3>
              <ul className="space-y-1.5 rounded-lg border border-border bg-muted/20 p-3 font-mono text-[11px] text-muted-foreground">
                {exception.evidence.map((ev, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-border/70 bg-muted/20 flex items-center justify-between gap-3">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Dismiss
            </Button>

            {exception.status !== 'Resolved' ? (
              <Button
                size="sm"
                disabled={isResolving}
                onClick={() => onResolve(exception.exception_id, exception.action)}
                className="text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Apply Recommended Action & Resolve
              </Button>
            ) : (
              <Badge variant="success" className="py-1 px-3 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Resolved by Financial Operator
              </Badge>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
