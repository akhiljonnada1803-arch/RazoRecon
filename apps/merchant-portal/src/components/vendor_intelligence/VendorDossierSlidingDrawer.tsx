'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  BrainCircuit, 
  History, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  Lock, 
  CreditCard,
  Building2,
  FileCheck2,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VendorRiskScoreDTO } from '@/types/vendor_risk';
import { VendorBehavioralProfileDTO } from '@/types/memory';
import { formatCurrency } from '@/lib/utils';

interface VendorDossierSlidingDrawerProps {
  vendor: VendorRiskScoreDTO | null;
  profile?: VendorBehavioralProfileDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'memory' | 'exceptions' | 'resolutions';

export const VendorDossierSlidingDrawer: React.FC<VendorDossierSlidingDrawerProps> = ({
  vendor,
  profile,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!isOpen || !vendor) return null;

  const isHigh = vendor.risk_level === 'HIGH';
  const isMed = vendor.risk_level === 'MEDIUM';

  // Donut chart composition data
  const chartData = [
    { name: '40% Exception Freq', value: vendor.factors_breakdown?.exception_frequency_40pct || 12, color: '#3B82F6' },
    { name: '30% Settlement Delays', value: vendor.factors_breakdown?.settlement_delays_30pct || 8, color: '#F59E0B' },
    { name: '20% Tax Mismatches', value: vendor.factors_breakdown?.tax_mismatches_20pct || 4, color: '#8B5CF6' },
    { name: '10% Duplicate Debits', value: vendor.factors_breakdown?.duplicate_payments_10pct || 10, color: '#EF4444' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* 480px Right-Side Sliding Panel */}
      <div className="relative w-full max-w-[480px] bg-white h-full shadow-2xl z-10 flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  COUNTERPARTY DOSSIER
                </span>
                <span className="text-slate-300">•</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                  isHigh ? 'bg-rose-100 text-rose-800' : isMed ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {vendor.risk_level} RISK
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#072654]">{vendor.vendor}</h2>
              <code className="text-xs text-slate-400 font-mono block">{vendor.vendor_id}</code>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            {(['overview', 'memory', 'exceptions', 'resolutions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-white text-[#072654] shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'memory' ? 'Memory' : tab === 'exceptions' ? 'Exceptions' : tab === 'resolutions' ? 'Resolutions' : 'Overview'}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Score & Exposure Header Box */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-linear-to-r from-slate-50 to-white flex items-center justify-between shadow-2xs">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-medium text-slate-500 block">Risk Rating</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-[30px] font-extrabold font-mono leading-none ${isHigh ? 'text-rose-600' : isMed ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {vendor.risk_score}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/ 100</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Main Risk: <strong className="text-slate-900">{vendor.main_risk}</strong>
                  </span>
                </div>

                <div className="text-right space-y-0.5">
                  <span className="text-[11px] font-medium text-slate-500 block">Monetary Exposure</span>
                  <span className="text-lg font-bold font-mono text-[#072654] block">
                    {formatCurrency(vendor.avg_transaction_value * vendor.total_exceptions || 204000)}
                  </span>
                  <span className="text-[10px] text-slate-400">Total at risk</span>
                </div>
              </div>

              {/* 3 Core Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block">Transactions</span>
                  <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">{vendor.total_transactions}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block">Exceptions</span>
                  <span className={`text-base font-bold font-mono mt-0.5 block ${vendor.total_exceptions > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                    {vendor.total_exceptions}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block">Mean Inflows</span>
                  <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">{formatCurrency(vendor.avg_transaction_value)}</span>
                </div>
              </div>

              {/* Risk Composition Donut Chart */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#072654]">Risk Composition Model</h4>
                  <span className="text-[10px] font-mono text-slate-400">4-Factor Weighting</span>
                </div>

                <div className="h-[140px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [`${val} pts`, 'Weight']}
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    <span className="text-slate-600 truncate">40% Exception Freq ({vendor.total_exceptions})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-slate-600 truncate">30% Settlement Delays ({vendor.settlement_delay_count})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                    <span className="text-slate-600 truncate">20% Tax Mismatches ({vendor.tax_mismatch_count})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-slate-600 truncate">10% Duplicate Debits ({vendor.duplicate_payment_count})</span>
                  </div>
                </div>
              </div>

              {/* AI Recommendation Card */}
              <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/60 space-y-2">
                <div className="flex items-center gap-2 text-[#0B72E7]">
                  <Sparkles className="h-4 w-4" />
                  <h4 className="text-xs font-bold text-[#072654]">AI Recommendation</h4>
                </div>
                <p className="text-[12px] text-slate-700 leading-relaxed">
                  {isHigh 
                    ? "Vendor shows recurring settlement delay patterns and GST classification mismatches. Recommend manual verification before releasing automated batch approvals."
                    : "Counterparty operating within historical tolerance bounds. Standard automated reconciliation active."}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'memory' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#072654]">Pattern Memory State</h4>
              
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>Settlement Delays</span>
                    <span className="font-mono text-amber-600">{vendor.settlement_delay_count} Occurrences</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Carrier delivery SLA lags exceeding contracted T+5 terms.</p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>Tax Mismatches</span>
                    <span className="font-mono text-purple-600">{vendor.tax_mismatch_count} Occurrences</span>
                  </div>
                  <p className="text-[11px] text-slate-500">18% GST vs 12% freight composite supply variances.</p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>Duplicate Payments</span>
                    <span className="font-mono text-rose-600">{vendor.duplicate_payment_count} Intercepted</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Card auto-debit retries posted while direct ACH was clearing.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exceptions' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#072654]">Exception History</h4>
              {profile?.recent_exceptions && profile.recent_exceptions.length > 0 ? (
                profile.recent_exceptions.map((exc) => (
                  <div key={exc.exception_id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{exc.exception_type}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{exc.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600"><strong className="text-slate-800">Root Cause:</strong> {exc.root_cause}</p>
                  </div>
                ))
              ) : (
                <p className="p-6 text-center text-slate-400">Zero active exceptions on record.</p>
              )}
            </div>
          )}

          {activeTab === 'resolutions' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#072654]">Verified Resolution Log</h4>
              {profile?.recent_exceptions && profile.recent_exceptions.length > 0 ? (
                profile.recent_exceptions.map((exc) => (
                  <div key={exc.exception_id} className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                    <span className="font-bold text-emerald-950 text-xs">{exc.exception_type} Resolution</span>
                    <p className="text-[11px] text-emerald-900 leading-relaxed">{exc.resolution}</p>
                  </div>
                ))
              ) : (
                <p className="p-6 text-center text-slate-400">No previous resolution records.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose} className="h-9 text-xs rounded-xl border-slate-300">
            Close Dossier
          </Button>

          <Button
            size="sm"
            className={`h-9 text-xs font-semibold rounded-xl ${
              isHigh ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-[#0B72E7] hover:bg-blue-600 text-white'
            }`}
          >
            {isHigh ? 'Hold Batch Approvals' : 'Verify Compliance'}
          </Button>
        </div>
      </div>
    </div>
  );
};
