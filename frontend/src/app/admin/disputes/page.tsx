'use client';

import React from 'react';
import { 
  RotateCcw, 
  ShieldCheck, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  CreditCard,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminDisputesPage() {
  const disputes = [
    {
      id: 'dsp_884291',
      order_id: 'RZP-ORD-20260904-8842',
      customer: 'Kavita Sundaram',
      merchant: 'Acme Direct Corp',
      amount: '₹14,999',
      reason: 'Product damaged in transit (Blue Dart)',
      status: 'RESOLVED_REFUNDED',
      raised_at: '2 hours ago',
    },
    {
      id: 'dsp_884292',
      order_id: 'RZP-ORD-20260904-9912',
      customer: 'Rohan Mehra',
      merchant: 'Omni Retail Technologies',
      amount: '₹4,999',
      reason: 'Duplicate charge reversal requested',
      status: 'AUTO_REFUNDED',
      raised_at: '5 hours ago',
    },
    {
      id: 'dsp_884293',
      order_id: 'RZP-ORD-20260904-1044',
      customer: 'Deepak Varma',
      merchant: 'CloudFin Solutions Ltd',
      amount: '₹22,100',
      reason: 'License key delivery delayed',
      status: 'UNDER_ARBITRATION',
      raised_at: '1 day ago',
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-[#071328] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs font-mono">
              CHARGEBACK ARBITRATION
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-mono">
              0.02% DISPUTE RATE (LOW RISK)
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Disputes & Chargeback Resolution
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Automated chargeback evidence submission, buyer dispute mediation, and instant refund reconciliation across card networks and UPI rails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-[#0B72E7] hover:bg-blue-600 text-white text-xs font-bold rounded-xl h-10 px-4 shadow-sm">
            Batch Resolve Evidence
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Open Disputes', val: '1 Pending', change: '99.4% win rate', color: 'text-emerald-600' },
          { label: 'Disputed Volume', val: '₹22,100', change: '0.012% of GMV', color: 'text-blue-600' },
          { label: 'Auto-Resolved', val: '94.2%', change: 'Via webhook signatures', color: 'text-purple-600' },
          { label: 'Avg Resolution Time', val: '1.4 Hours', change: 'SLA < 24 Hours', color: 'text-amber-600' },
        ].map((m, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">{m.label}</span>
            <span className="text-xl font-black text-slate-900 block">{m.val}</span>
            <span className={`text-[11px] font-semibold ${m.color} block`}>{m.change}</span>
          </div>
        ))}
      </div>

      {/* Disputes Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <h3 className="font-bold text-slate-900 text-sm">Dispute Queue</h3>
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search dispute ID, order ID, customer..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Dispute ID</th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Merchant</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {disputes.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{d.id}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{d.order_id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{d.customer}</td>
                  <td className="py-3.5 px-4">{d.merchant}</td>
                  <td className="py-3.5 px-4 font-black text-slate-900">{d.amount}</td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{d.reason}</td>
                  <td className="py-3.5 px-4">
                    {d.status.includes('RESOLVED') || d.status.includes('AUTO') ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        {d.status}
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                        {d.status}
                      </Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2.5 text-blue-600 font-bold hover:bg-blue-50">
                      Mediate
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
