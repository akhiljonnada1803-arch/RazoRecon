'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface HistoryItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  category?: string;
  sku?: string;
  merchant_name: string;
  merchant_verified: number;
  amount: number;
  mandate_id?: string;
  payment_method: string;
  purchase_reason: string;
  approval_type: string;
  guardrails_validated?: Record<string, string>;
  budget_before: number;
  budget_after: number;
  status: string;
  refund_status: string;
  autopay_rule_used?: string;
  timestamp: string;
}

export default function AgentPurchaseHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any>(null);
  const [reversingId, setReversingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMsg({ title, desc, type });
    setTimeout(() => setToastMsg(null), 5000);
  };

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('razorcommerce_token') || localStorage.getItem('razorrecon_token'))
      : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/customer/autopay/history', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to load purchase history');
      const data = await res.json();
      setHistory(data.history || []);
      setKpis(data.kpis || null);
    } catch (err: any) {
      console.error(err);
      showToast('Error Loading History', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRefund = async (logId: string, orderId: string, amount: number) => {
    if (!confirm(`Reverse Order #${orderId}? ₹${amount.toLocaleString('en-IN')} will be immediately credited back to your monthly budget allowance.`)) {
      return;
    }
    setReversingId(logId);
    try {
      const res = await fetch(`/api/v1/customer/autopay/logs/${logId}/refund`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason: 'Customer 1-Click Reversal via AutoPay History' }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Refund failed');
      }
      const data = await res.json();
      showToast('Purchase Reversed & Refunded', data.message, 'success');
      loadHistory();
    } catch (err: any) {
      showToast('Reversal Failed', err.message, 'error');
    } finally {
      setReversingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-[#0B72E7] selection:text-white">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 max-w-md animate-bounce-in">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-start space-x-3 backdrop-blur-md ${
            toastMsg.type === 'success' ? 'bg-white border-emerald-300 text-emerald-900' :
            toastMsg.type === 'error' ? 'bg-white border-rose-300 text-rose-900' :
            'bg-white border-blue-300 text-blue-900'
          }`}>
            <div className={`mt-0.5 font-bold text-lg ${
              toastMsg.type === 'success' ? 'text-emerald-600' :
              toastMsg.type === 'error' ? 'text-rose-600' : 'text-[#0B72E7]'
            }`}>
              {toastMsg.type === 'success' ? '✓' : toastMsg.type === 'error' ? '✕' : 'ℹ'}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm tracking-wide text-slate-900">{toastMsg.title}</h4>
              <p className="text-xs mt-0.5 text-slate-600 leading-relaxed">{toastMsg.desc}</p>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-slate-900 transition">Storefront</Link>
          <span>/</span>
          <Link href="/customer/autopay" className="hover:text-slate-900 transition">AutoPay &amp; Budget</Link>
          <span>/</span>
          <span className="text-[#0B72E7] font-semibold">Agent Purchase History</span>
        </div>

        {/* Hero Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-3 py-1 bg-blue-50 text-[#0B72E7] border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider">
                Autonomous AI Orders
              </span>
              <span className="text-xs text-slate-500 font-mono">Track 01 Compliant Audit Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#072654] tracking-tight">
              Agent Purchase History
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Complete chronological audit trail of all purchases autonomously executed by the AI Commerce Agent on your behalf.
            </p>
          </div>

          <Link
            href="/customer/autopay"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition self-start md:self-auto shadow-xs"
          >
            ⚙️ Manage Spending Rules →
          </Link>
        </div>

        {/* Audit Trail Table */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#072654]">Autonomous Ledger Entries</h3>
              <p className="text-xs text-slate-500 mt-0.5">Every entry includes timestamp, product, amount, mandate, reason, and reversibility.</p>
            </div>
            <span className="text-xs font-mono text-[#0B72E7] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 font-semibold">
              {history.length} Record(s)
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
              Loading autonomous purchase audit trail...
            </div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No autonomous purchases recorded yet. Ask the AI Assistant or use &quot;Buy via AutoPay&quot; on any product card!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px] tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Timestamp</th>
                    <th className="py-3.5 px-4 font-bold">Product</th>
                    <th className="py-3.5 px-4 font-bold">Amount</th>
                    <th className="py-3.5 px-4 font-bold">Payment Method</th>
                    <th className="py-3.5 px-4 font-bold">Auto Approved</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition">
                      {/* 1. Timestamp */}
                      <td className="py-4 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {row.timestamp}
                      </td>

                      {/* 2. Product */}
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {row.product_name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                          <Link href={`/orders/${row.order_id}`} className="text-[#0B72E7] hover:underline font-mono">
                            Order #{row.order_id}
                          </Link>
                          <span>•</span>
                          <span>{row.merchant_name}</span>
                        </div>
                        {row.purchase_reason && (
                          <div className="text-[11px] text-slate-600 italic mt-1 max-w-md line-clamp-1">
                            &ldquo;{row.purchase_reason}&rdquo;
                          </div>
                        )}
                      </td>

                      {/* 3. Amount */}
                      <td className="py-4 px-4 font-mono font-extrabold text-slate-900 text-sm whitespace-nowrap">
                        ₹{row.amount.toLocaleString('en-IN')}
                      </td>

                      {/* 4. Payment Method */}
                      <td className="py-4 px-4 text-slate-700 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5 font-semibold">
                          <span className="text-[#0B72E7]">⚡</span>
                          <span>{row.payment_method}</span>
                        </div>
                      </td>

                      {/* 5. Auto Approved */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${
                          row.approval_type.includes('Autonomous') || row.approval_type === 'AUTO_BUY'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {row.approval_type || 'YES (Autonomous)'}
                        </span>
                      </td>

                      {/* 6. Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {row.refund_status === 'REFUNDED' ? (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-extrabold">
                            REFUNDED &amp; REVERSED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-extrabold">
                            ● {row.status}
                          </span>
                        )}
                      </td>

                      {/* 7. Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                        <Link
                          href={`/orders/${row.order_id}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition"
                        >
                          Invoice
                        </Link>
                        {row.refund_status !== 'REFUNDED' && (
                          <button
                            onClick={() => handleRefund(row.id, row.order_id, row.amount)}
                            disabled={reversingId === row.id}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition"
                          >
                            {reversingId === row.id ? 'Reversing...' : '↩ 1-Click Refund'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
