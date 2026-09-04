'use client';

import React from 'react';
import { 
  BookOpenCheck, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowDownRight, 
  Lock, 
  DollarSign, 
  Receipt,
  Sparkles 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { A2ALedgerEntry } from '@/types/agent_commerce';

interface A2ALedgerViewerProps {
  ledger: A2ALedgerEntry[];
  reconciliationStatus: string;
  paymentDetails: {
    order_id: string;
    payment_id: string;
    gross_amount: number;
    mdr_fee: number;
    mdr_tax: number;
    net_deposit: number;
    signature: string;
  };
}

export function A2ALedgerViewer({
  ledger,
  reconciliationStatus,
  paymentDetails
}: A2ALedgerViewerProps) {
  const formatINR = (val: number) => {
    return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const totalDebits = ledger.reduce((acc, row) => acc + row.debit, 0);
  const totalCredits = ledger.reduce((acc, row) => acc + row.credit, 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-4 p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200 shadow-2xs">
            <BookOpenCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#072654]">General Ledger Journal Voucher</h3>
              {isBalanced ? (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-mono">
                  BALANCED (0 VARIANCE)
                </Badge>
              ) : (
                <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px]">
                  UNBALANCED
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Autonomous FinOps posting of net bank payout, Razorpay 2% MDR fee expense, and gross sales revenue.
            </p>
          </div>
        </div>

        <Badge variant="outline" className="bg-slate-50 text-slate-700 font-mono text-xs border-slate-200 w-fit">
          Ref: {paymentDetails.order_id}
        </Badge>
      </div>

      {/* Double-Entry Table */}
      <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase font-mono">
            <tr>
              <th className="py-2.5 px-3">Account Code</th>
              <th className="py-2.5 px-3">Account Title</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3 text-right">Debit (₹)</th>
              <th className="py-2.5 px-3 text-right">Credit (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {ledger.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-3 font-bold text-[#0B72E7]">{row.account_code}</td>
                <td className="py-2.5 px-3 font-semibold text-slate-800 font-sans">{row.account_name}</td>
                <td className="py-2.5 px-3 text-slate-500 font-sans text-[11px]">{row.description}</td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                  {row.debit > 0 ? formatINR(row.debit) : '—'}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                  {row.credit > 0 ? formatINR(row.credit) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50/80 border-t-2 border-slate-200 font-mono font-bold text-xs">
            <tr>
              <td colSpan={3} className="py-2.5 px-3 text-right text-slate-600 uppercase">
                Total Balanced Journal Vouchers:
              </td>
              <td className="py-2.5 px-3 text-right text-emerald-700 bg-emerald-50/50">
                {formatINR(totalDebits)}
              </td>
              <td className="py-2.5 px-3 text-right text-emerald-700 bg-emerald-50/50">
                {formatINR(totalCredits)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Cryptographic Reconciliation Seal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Reconciliation Status</span>
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            {reconciliationStatus}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">HMAC SHA256 Signature</span>
          <span className="text-xs font-mono text-slate-700 block truncate" title={paymentDetails.signature}>
            {paymentDetails.signature.slice(0, 18)}...
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Payment Gateway Payout</span>
          <span className="text-xs font-bold text-slate-800 font-mono">
            Net {formatINR(paymentDetails.net_deposit)} (MDR: {formatINR(paymentDetails.mdr_fee)})
          </span>
        </div>
      </div>
    </div>
  );
}
