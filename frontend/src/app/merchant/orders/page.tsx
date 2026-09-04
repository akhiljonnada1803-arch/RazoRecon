'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MerchantOrder } from '@/types/merchant';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RotateCcw, 
  CreditCard, 
  ArrowRight,
  ShieldCheck,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MerchantOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<MerchantOrder | null>(null);

  const { data: orders, isLoading } = useQuery<MerchantOrder[]>({
    queryKey: ['merchant', 'orders', statusFilter],
    queryFn: () => apiClient.get(`/merchant/orders?status=${statusFilter}`),
  });

  const filteredOrders = (orders || []).filter((o) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(term) ||
      o.customer_name.toLowerCase().includes(term) ||
      o.customer_email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                Merchant Orders & Fulfillment
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Auto-Reconciled
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Omni-Channel Orders & Razorpay Settlements
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Track lifecycle transitions across Pending, Paid, Cancelled, and Refunded orders with automated double-entry ledger sync.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {['ALL', 'PENDING', 'PAID', 'CANCELLED', 'REFUNDED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-[#0B72E7] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by order # or buyer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-slate-200 text-xs bg-slate-50/50"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Line Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Payment & Recon</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block font-mono text-xs">{o.order_number}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block text-xs">{o.customer_name}</span>
                    <span className="text-[10px] text-slate-400 truncate block max-w-[150px]">{o.customer_email}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-700 block font-medium">
                      {o.items.length} SKU{o.items.length > 1 ? 's' : ''} ({o.items.map((i) => i.name).join(', ').slice(0, 30)}...)
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 font-mono text-xs block">
                      ₹{o.total_amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      GST: ₹{o.tax.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      className={`text-[10px] font-bold px-2 py-0.5 ${
                        o.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : o.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : o.status === 'REFUNDED'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {o.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      {o.payment_id ? (
                        <Badge variant="outline" className="text-[9px] font-mono bg-slate-50 text-slate-600 border-slate-200">
                          {o.payment_method?.toUpperCase()}
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-slate-400">Unpaid</span>
                      )}
                      {o.reconciled === 1 && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-mono">
                          Reconciled
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOrder(o)}
                      className="text-xs text-[#0B72E7] font-semibold h-7 px-2.5 rounded-lg hover:bg-blue-50"
                    >
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Order Details</span>
                <h3 className="text-sm font-bold text-slate-900 font-mono">{selectedOrder.order_number}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="h-7 w-7 p-0 rounded-lg"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Buyer Profile</span>
                <div className="font-bold text-slate-800">{selectedOrder.customer_name}</div>
                <div className="text-slate-500 font-mono text-[11px]">{selectedOrder.customer_email}</div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Line Items</span>
                <div className="space-y-1.5">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 block text-xs">{it.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Qty: {it.quantity} × ₹{it.price.toLocaleString('en-IN')}</span>
                      </div>
                      <span className="font-bold text-slate-900 font-mono">₹{it.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>18% GST</span>
                  <span>+₹{selectedOrder.tax.toLocaleString('en-IN')}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-₹{selectedOrder.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-bold pt-1.5 border-t border-slate-200 text-sm">
                  <span>Total Amount</span>
                  <span className="text-[#0B72E7]">₹{selectedOrder.total_amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
