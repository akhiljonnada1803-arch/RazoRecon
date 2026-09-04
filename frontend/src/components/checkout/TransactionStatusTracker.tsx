'use client';

import React from 'react';
import { TransactionStatus } from '@/types/checkout';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles,
  RefreshCw,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TransactionStatusTrackerProps {
  transactions: TransactionStatus[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function TransactionStatusTracker({
  transactions,
  isLoading,
  onRefresh,
}: TransactionStatusTrackerProps) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#072654]">
              Transaction & Settlement Status ({transactions.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Live ledger tracking & automated reconciliation state
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Refresh transactions"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">
          No checkout transactions initiated yet. Complete an order to observe real-time status.
        </div>
      ) : (
        <div className="space-y-2.5">
          {transactions.slice(0, 5).map((tx) => (
            <div
              key={tx.transaction_id}
              className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">
                    {tx.order_id}
                  </span>
                  {tx.status === 'captured' || tx.status === 'paid' ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold border gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Captured
                    </Badge>
                  ) : tx.status === 'created' ? (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold border gap-1">
                      <Clock className="h-3 w-3 text-amber-600" />
                      Pending Payment
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      {tx.status}
                    </Badge>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {tx.payment_id ? `Payment ID: ${tx.payment_id}` : `Tx ID: ${tx.transaction_id}`} • {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>

              <div className="flex items-center gap-4 sm:text-right">
                <div>
                  <span className="font-extrabold text-sm text-[#072654] block">
                    ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium capitalize">
                    via {tx.payment_method || 'UPI'}
                  </span>
                </div>
                {tx.reconciled && (
                  <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px] font-bold border shrink-0">
                    Reconciled (0 Variance)
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
