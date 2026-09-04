'use client';

import React from 'react';
import { 
  X, 
  ShieldAlert, 
  BrainCircuit, 
  History, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  CreditCard,
  Building2,
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VendorRiskScoreDTO } from '@/types/vendor_risk';
import { VendorBehavioralProfileDTO } from '@/types/memory';
import { formatCurrency } from '@/lib/utils';

interface VendorIntelligenceDrawerProps {
  vendor: VendorRiskScoreDTO | null;
  profile?: VendorBehavioralProfileDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VendorIntelligenceDrawer: React.FC<VendorIntelligenceDrawerProps> = ({
  vendor,
  profile,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !vendor) return null;

  const isHigh = vendor.risk_level === 'HIGH';
  const isMed = vendor.risk_level === 'MEDIUM';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl z-10 flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                COUNTERPARTY FORENSIC DOSSIER
              </span>
              <span className="text-slate-300">•</span>
              <Badge
                variant="outline"
                className={`text-[10px] font-bold font-mono py-0 h-4.5 ${
                  isHigh
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : isMed
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {vendor.risk_level} RISK
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-[#072654]">{vendor.vendor}</h2>
            <code className="text-xs text-slate-500 font-mono">{vendor.vendor_id}</code>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-700">
          {/* 1. Risk Score & Level Hero Banner */}
          <div className="p-4 rounded-xl border border-slate-200 bg-linear-to-r from-slate-50 to-white flex items-center justify-between shadow-2xs">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500 block">Behavioral Risk Rating</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold font-mono ${isHigh ? 'text-rose-600' : isMed ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {vendor.risk_score}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
              <span className="text-[11px] text-slate-500">
                Main Risk: <strong className="text-slate-900">{vendor.main_risk}</strong>
              </span>
            </div>

            <div className="text-right space-y-1">
              <span className="text-[11px] font-medium text-slate-500 block">Historical Trend</span>
              <div className="flex items-center gap-1 font-bold text-xs">
                {profile?.trend === 'Increasing' ? (
                  <span className="text-rose-600 flex items-center gap-1 font-mono">
                    <TrendingUp className="h-4 w-4" /> Increasing (Worsening)
                  </span>
                ) : profile?.trend === 'Decreasing' ? (
                  <span className="text-emerald-600 flex items-center gap-1 font-mono">
                    <TrendingDown className="h-4 w-4" /> Decreasing (Improving)
                  </span>
                ) : (
                  <span className="text-slate-600 flex items-center gap-1 font-mono">
                    <Minus className="h-4 w-4" /> Stable
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 block">Updated after every batch</span>
            </div>
          </div>

          {/* 2. Core Operational Telemetry Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
              Operational Ingestion Stats
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block">Total Transactions</span>
                <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">{vendor.total_transactions}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block">Total Exceptions</span>
                <span className={`text-base font-bold font-mono mt-0.5 block ${vendor.total_exceptions > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {vendor.total_exceptions}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block">Avg Txn Value</span>
                <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">{formatCurrency(vendor.avg_transaction_value)}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block">Failure Rate</span>
                <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                  {((vendor.total_exceptions / Math.max(1, vendor.total_transactions)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* 3. Pattern Memory & 4-Factor Risk Model */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Pattern Memory Breakdown
              </h4>
              <span className="text-[10px] font-mono text-[#0B72E7] font-semibold">4-Factor Formula</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 text-[11px]">40% Exception Freq</span>
                  <Badge variant="outline" className="text-[10px] font-mono py-0 h-4 bg-slate-50">{vendor.total_exceptions} Excs</Badge>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, (vendor.total_exceptions / Math.max(1, vendor.total_transactions)) * 300)}%` }} />
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 text-[11px]">30% Settlement Delays</span>
                  <Badge variant="outline" className="text-[10px] font-mono py-0 h-4 bg-slate-50">{vendor.settlement_delay_count} Delays</Badge>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, vendor.settlement_delay_count * 10)}%` }} />
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 text-[11px]">20% Tax Mismatches</span>
                  <Badge variant="outline" className="text-[10px] font-mono py-0 h-4 bg-slate-50">{vendor.tax_mismatch_count} GST</Badge>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full" style={{ width: `${Math.min(100, vendor.tax_mismatch_count * 20)}%` }} />
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 text-[11px]">10% Duplicate Debits</span>
                  <Badge variant="outline" className="text-[10px] font-mono py-0 h-4 bg-slate-50">{vendor.duplicate_payment_count} Dups</Badge>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full" style={{ width: `${Math.min(100, vendor.duplicate_payment_count * 50)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Resolution History & Stored Playbooks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Historical Exceptions & Verified Resolutions
              </h4>
              <span className="text-[10px] font-mono text-slate-500">
                {profile?.recent_exceptions.length || 0} Recorded
              </span>
            </div>

            <div className="space-y-2.5">
              {profile?.recent_exceptions && profile.recent_exceptions.length > 0 ? (
                profile.recent_exceptions.map((exc) => (
                  <div key={exc.exception_id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] font-bold font-mono bg-white text-slate-800 border-slate-200">
                          {exc.exception_type}
                        </Badge>
                        <span className="font-mono text-[10px] text-slate-400">{exc.exception_id}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{exc.timestamp}</span>
                    </div>

                    <p className="text-[11px] text-slate-700">
                      <strong className="text-slate-900 font-semibold">Root Cause:</strong> {exc.root_cause}
                    </p>

                    <div className="p-2 rounded bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-900 leading-snug">
                      <strong className="font-semibold text-emerald-950">Applied Resolution:</strong> {exc.resolution}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
                  No historical exceptions on record for this counterparty.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs border-slate-300">
            Close Dossier
          </Button>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className={`h-8 text-xs font-semibold ${
                isHigh
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-[#0B72E7] hover:bg-blue-600 text-white'
              }`}
            >
              {isHigh ? 'Hold AP Batch Approvals' : 'Verify Vendor Status'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
