'use client';

import React, { useState } from 'react';
import { HeroAuditLog, ReasoningTrace, HeroRiskCheck, HeroTransaction, HeroStepData } from '@/types/hero_demo';
import {
  ShieldAlert,
  Brain,
  FileSpreadsheet,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Code2,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Receipt,
  Terminal,
  Layers,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeroAuditReasoningPanelProps {
  steps: HeroStepData[];
  auditLogs: HeroAuditLog[];
  transactions: HeroTransaction[];
  activeStepNumber: number;
}

export const HeroAuditReasoningPanel: React.FC<HeroAuditReasoningPanelProps> = ({
  steps,
  auditLogs,
  transactions,
  activeStepNumber,
}) => {
  const [activeTab, setActiveTab] = useState<'reasoning' | 'audit' | 'risk' | 'transactions'>('reasoning');
  const [expandedTraceIdx, setExpandedTraceIdx] = useState<number | null>(null);

  const toggleTrace = (idx: number) => {
    setExpandedTraceIdx(expandedTraceIdx === idx ? null : idx);
  };

  const completedSteps = steps.filter((s) => s.step_number <= activeStepNumber);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-full min-h-[580px]">
      {/* Panel Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl">
          <button
            onClick={() => setActiveTab('reasoning')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reasoning'
                ? 'bg-white text-[#0B72E7] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Reasoning</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-blue-50 text-[#0B72E7] font-mono">
              {completedSteps.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'audit'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-100 text-slate-700 font-mono">
              {auditLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('risk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'risk'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Risk SLA</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-50 text-emerald-700 font-mono">
              {completedSteps.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'transactions'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>GL Ledger</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-50 text-amber-700 font-mono">
              {transactions.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-mono">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-4 overflow-y-auto max-h-[500px] space-y-3">
        {/* REASONING TRACE TAB */}
        {activeTab === 'reasoning' && (
          <div className="space-y-3">
            {completedSteps.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Brain className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#0B72E7]" />
                <p className="text-sm font-medium">No reasoning traces recorded yet</p>
                <p className="text-xs text-slate-500 mt-1">Execute steps to observe the AI Agent reasoning chain</p>
              </div>
            ) : (
              completedSteps.map((s, idx) => {
                const trace = s.reasoning;
                const isExpanded = expandedTraceIdx === idx || (expandedTraceIdx === null && idx === completedSteps.length - 1);
                return (
                  <div
                    key={idx}
                    className="border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-2xs hover:border-blue-300 transition-all"
                  >
                    <button
                      onClick={() => toggleTrace(idx)}
                      className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xs font-bold text-[#0B72E7]">
                          {s.step_number}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {trace.action_taken || s.title}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {trace.goal}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          Phase {s.step_number}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-2.5 text-xs bg-slate-50/40">
                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-[#0B72E7] uppercase">Agent Goal</span>
                          <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80 mt-1 font-mono text-[11px]">
                            {trace.goal}
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-purple-700 uppercase">Thought / ReAct Chain</span>
                          <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80 mt-1 text-[11px] leading-relaxed">
                            {trace.thought}
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-cyan-700 uppercase">Observation & Context</span>
                          <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80 mt-1 text-[11px] leading-relaxed">
                            {trace.observation}
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase">Decision Rationale</span>
                          <p className="text-emerald-900 bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl mt-1 text-[11px] leading-relaxed font-mono">
                            {trace.decision_rationale}
                          </p>
                        </div>

                        {trace.json_payload && Object.keys(trace.json_payload).length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                              <Code2 className="w-3 h-3" /> Structured Payload
                            </span>
                            <pre className="text-[10px] font-mono text-slate-800 bg-[#072654] text-cyan-300 p-3 rounded-xl mt-1 overflow-x-auto">
                              {JSON.stringify(trace.json_payload, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-2">
            {auditLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Activity className="w-10 h-10 mx-auto mb-3 opacity-30 text-blue-500" />
                <p className="text-sm font-medium">No audit events generated yet</p>
              </div>
            ) : (
              auditLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex items-start justify-between gap-3 text-xs shadow-2xs"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                        log.event_type.includes('COMPLIANCE') || log.event_type.includes('RECONCILED')
                          ? 'bg-emerald-500'
                          : log.event_type.includes('RISK')
                          ? 'bg-amber-500'
                          : 'bg-[#0B72E7]'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-800">{log.event_type}</span>
                        <span className="px-1.5 py-0.5 text-[9px] font-mono rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {log.actor}
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-blue-50 text-[#0B72E7] border border-blue-100">
                          Step {log.step_number}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">{log.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* RISK STATUS TAB */}
        {activeTab === 'risk' && (
          <div className="space-y-3">
            {completedSteps.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-30 text-emerald-500" />
                <p className="text-sm font-medium">No risk checkpoints evaluated yet</p>
              </div>
            ) : (
              completedSteps.map((s, idx) => {
                const risk = s.risk_check;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {risk.risk_level === 'LOW' ? (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> LOW RISK (Score: {risk.risk_score}/100)
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" /> {risk.risk_level} (Score: {risk.risk_score}/100)
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-700">Phase {s.step_number} Checkpoint</span>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400">
                        GST: {risk.gst_compliance_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <span className="text-slate-500 block text-[10px] font-semibold">Settlement Variance</span>
                        <span className="font-mono text-emerald-700 font-bold text-xs">
                          {risk.settlement_variance_inr === 0
                            ? '₹0.00 (Zero Discrepancy SLA)'
                            : `₹${risk.settlement_variance_inr.toLocaleString('en-IN')}`}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <span className="text-slate-500 block text-[10px] font-semibold">Pre-Approved Limit</span>
                        <span className="font-mono text-slate-800 font-bold text-xs">
                          ₹{risk.credit_limit_inr.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TRANSACTION HISTORY & GENERAL LEDGER TAB */}
        {activeTab === 'transactions' && (
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 opacity-30 text-amber-500" />
                <p className="text-sm font-medium">No financial transactions posted yet</p>
                <p className="text-xs text-slate-500 mt-1">Transactions post automatically at Step 7 & 8</p>
              </div>
            ) : (
              transactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 font-mono">{tx.transaction_id}</span>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-mono">
                          {tx.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Order: {tx.order_id} | Razorpay: {tx.payment_id || 'pay_demo'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 font-mono">
                        ₹{tx.gross_amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-mono font-semibold">
                        Net: ₹{tx.net_deposit.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Journal Voucher Breakdown */}
                  {tx.journal_vouchers && tx.journal_vouchers.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                      <div className="text-[10px] font-bold text-[#0B72E7] uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Double-Entry ERP Journal Voucher</span>
                        <span className="text-slate-500 font-mono">Auto-Reconciled</span>
                      </div>

                      <div className="space-y-1.5 text-[11px] font-mono">
                        {tx.journal_vouchers.map((entry, eIdx) => (
                          <div key={eIdx} className="flex justify-between items-center text-slate-700">
                            <span className={entry.type === 'CREDIT' ? 'pl-3 text-amber-800' : 'text-slate-800'}>
                              {entry.type === 'DEBIT' ? 'Dr.' : 'Cr.'} {entry.account}
                            </span>
                            <span className={entry.type === 'DEBIT' ? 'text-emerald-700 font-bold' : 'text-slate-700 font-bold'}>
                              ₹{entry.amount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>General Ledger Invariant: Balanced</span>
        </div>
        <div>Step {activeStepNumber}/10</div>
      </div>
    </div>
  );
};
