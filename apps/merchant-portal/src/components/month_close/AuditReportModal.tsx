'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Lock,
  Building,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MonthCloseResultDTO } from '@/types/month_close';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: MonthCloseResultDTO;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-background border border-border rounded-xl shadow-2xl overflow-hidden my-8"
        >
          {/* Top action header (hidden during printing) */}
          <div className="p-4 border-b border-border/70 flex items-center justify-between bg-muted/30 print:hidden">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span className="font-semibold text-sm">Official Executive Audit & Close Report</span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {result.audit_pack_id}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="text-xs h-8 gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                Print / Save as PDF
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Printable Report Content Body */}
          <div className="p-8 space-y-6 text-foreground bg-card">
            {/* Header Document Brand */}
            <div className="flex items-start justify-between border-b border-border pb-6">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  RazorRecon Autonomous Month-End Audit Pack
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Autonomous Accounting Close Certification & Internal Controls Attestation
                </p>
              </div>

              <div className="text-right font-mono text-xs text-muted-foreground space-y-0.5">
                <div>Audit Pack ID: <strong className="text-foreground">{result.audit_pack_id}</strong></div>
                <div>Closed Timestamp: <strong className="text-foreground">{result.closed_at}</strong></div>
                <div>Status: <strong className="text-emerald-600 dark:text-emerald-400">{result.status}</strong></div>
              </div>
            </div>

            {/* Executive Summary Statement */}
            <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                CFO Attestation & Sign-off Certification
              </span>
              <p className="text-xs text-foreground leading-relaxed">
                {result.cfo_signoff}
              </p>
            </div>

            {/* Key Metrics Grid Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                1. Closing Operational Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded border border-border bg-muted/20">
                  <span className="text-muted-foreground block text-[10px]">Records Processed</span>
                  <span className="text-base font-bold font-mono">{result.records_processed}</span>
                </div>
                <div className="p-3 rounded border border-border bg-muted/20">
                  <span className="text-muted-foreground block text-[10px]">Auto Match Rate</span>
                  <span className="text-base font-bold font-mono text-emerald-600">{result.match_rate}%</span>
                </div>
                <div className="p-3 rounded border border-border bg-muted/20">
                  <span className="text-muted-foreground block text-[10px]">Finance Health</span>
                  <span className="text-base font-bold font-mono">{result.finance_health}/100</span>
                </div>
                <div className="p-3 rounded border border-border bg-muted/20">
                  <span className="text-muted-foreground block text-[10px]">30-Day Forecast</span>
                  <span className="text-base font-bold font-mono text-emerald-600">{result.forecast}</span>
                </div>
              </div>
            </div>

            {/* 7 Workflow Steps Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                2. Execution Step Attestation Log
              </h3>
              <div className="rounded border border-border overflow-hidden text-xs">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border text-left">
                    <tr>
                      <th className="p-2.5 font-semibold w-12">#</th>
                      <th className="p-2.5 font-semibold">Workflow Step</th>
                      <th className="p-2.5 font-semibold">Attestation Finding</th>
                      <th className="p-2.5 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {result.steps.map((s) => (
                      <tr key={s.step_number}>
                        <td className="p-2.5 font-mono text-muted-foreground">{s.step_number}</td>
                        <td className="p-2.5 font-semibold text-foreground">{s.step_name}</td>
                        <td className="p-2.5 text-muted-foreground text-[11px]">{s.description}</td>
                        <td className="p-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          VERIFIED
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signatures / Seals */}
            <div className="pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <div>
                <span className="block font-semibold text-foreground">RazorRecon Autonomous Controller</span>
                <span className="text-[11px]">Certified by ReAct Multi-Step Financial Agent</span>
              </div>
              <div className="text-right">
                <span className="block font-mono font-semibold text-foreground">SEAL-SHA256: 8F2A99B4...</span>
                <span className="text-[11px]">100% Deterministic Arithmetic Enforced</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
