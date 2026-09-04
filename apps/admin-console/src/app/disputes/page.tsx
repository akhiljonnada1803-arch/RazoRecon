'use client';

import React, { useState, useMemo } from 'react';
import { 
  RotateCcw, 
  ShieldCheck, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  CreditCard, 
  FileText,
  Filter,
  Check,
  XCircle,
  FileCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DisputeItem {
  id: string;
  order_id: string;
  customer: string;
  merchant: string;
  amount: string;
  amount_num: number;
  reason: string;
  status: 'RESOLVED_REFUNDED' | 'AUTO_REFUNDED' | 'UNDER_ARBITRATION' | 'EVIDENCE_SUBMITTED';
  raised_at: string;
  evidence_deadline: string;
}

const INITIAL_DISPUTES: DisputeItem[] = [
  {
    id: 'dsp_884291',
    order_id: 'RZP-ORD-20260904-8842',
    customer: 'Kavita Sundaram',
    merchant: 'Acme Direct Corp',
    amount: '₹14,999',
    amount_num: 14999,
    reason: 'Product damaged in transit (Blue Dart delivery)',
    status: 'RESOLVED_REFUNDED',
    raised_at: '2 hours ago',
    evidence_deadline: 'Resolved'
  },
  {
    id: 'dsp_884292',
    order_id: 'RZP-ORD-20260904-9912',
    customer: 'Rohan Mehra',
    merchant: 'Omni Retail Technologies',
    amount: '₹4,999',
    amount_num: 4999,
    reason: 'Duplicate charge reversal requested by cardholder',
    status: 'AUTO_REFUNDED',
    raised_at: '5 hours ago',
    evidence_deadline: 'Resolved'
  },
  {
    id: 'dsp_884293',
    order_id: 'RZP-ORD-20260904-1044',
    customer: 'Deepak Varma',
    merchant: 'CloudFin Solutions Ltd',
    amount: '₹22,100',
    amount_num: 22100,
    reason: 'License key delivery delayed beyond SLA',
    status: 'UNDER_ARBITRATION',
    raised_at: '1 day ago',
    evidence_deadline: 'In 18 hours'
  },
  {
    id: 'dsp_884294',
    order_id: 'RZP-ORD-20260904-3319',
    customer: 'Sanjay Deshmukh',
    merchant: 'Zenith Logistics Gear',
    amount: '₹5,120',
    amount_num: 5120,
    reason: 'Unrecognized transaction claimed via Visa card',
    status: 'EVIDENCE_SUBMITTED',
    raised_at: '2 days ago',
    evidence_deadline: 'Under Visa Review'
  }
];

export default function AdminDisputesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [disputesList, setDisputesList] = useState<DisputeItem[]>(INITIAL_DISPUTES);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const filteredDisputes = useMemo(() => {
    return disputesList.filter((d) => {
      const matchesSearch =
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.reason.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'ALL' || d.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [disputesList, searchQuery, selectedStatus]);

  const handleResolve = (id: string) => {
    setResolvingId(id);
    setTimeout(() => {
      setDisputesList(prev => prev.map(d => d.id === id ? { ...d, status: 'RESOLVED_REFUNDED', evidence_deadline: 'Resolved' } : d));
      setResolvingId(null);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header */}
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
          <Button 
            onClick={() => {
              const pending = disputesList.find(d => d.status === 'UNDER_ARBITRATION');
              if (pending) handleResolve(pending.id);
            }}
            className="bg-[#0B72E7] hover:bg-blue-600 text-white text-xs font-bold rounded-xl h-10 px-4 shadow-sm flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Resolve Open Chargeback</span>
          </Button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Open Disputes', val: `${disputesList.filter(d => d.status === 'UNDER_ARBITRATION' || d.status === 'EVIDENCE_SUBMITTED').length} Pending`, change: '99.4% win rate', color: 'text-emerald-600' },
          { label: 'Disputed Volume', val: `₹${disputesList.filter(d => d.status !== 'RESOLVED_REFUNDED' && d.status !== 'AUTO_REFUNDED').reduce((a,b)=>a+b.amount_num,0).toLocaleString('en-IN')}`, change: '0.012% of GMV', color: 'text-blue-600' },
          { label: 'Auto-Resolved', val: '94.2%', change: 'Via webhook signatures', color: 'text-purple-600' },
          { label: 'Avg Resolution Time', val: '1.4 Hours', change: 'SLA < 24 Hours', color: 'text-amber-600' },
        ].map((m, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">{m.label}</span>
            <span className="text-2xl font-black text-slate-900 block">{m.val}</span>
            <span className={`text-[11px] font-semibold ${m.color} block`}>{m.change}</span>
          </div>
        ))}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by dispute ID, order ID, customer, or merchant..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          {['ALL', 'UNDER_ARBITRATION', 'EVIDENCE_SUBMITTED', 'RESOLVED_REFUNDED', 'AUTO_REFUNDED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                selectedStatus === st
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Disputes Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Dispute ID</th>
                <th className="py-3.5 px-4">Order Ref</th>
                <th className="py-3.5 px-4">Customer & Merchant</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredDisputes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center space-y-3">
                    <RotateCcw className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-sm">No disputes found</h4>
                    <p className="text-xs text-slate-500">No disputes matching "{searchQuery}" in state "{selectedStatus}".</p>
                    <Button onClick={() => { setSearchQuery(''); setSelectedStatus('ALL'); }} size="sm" variant="outline" className="text-xs font-bold rounded-xl mt-2">
                      Reset Filters
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredDisputes.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{d.id}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{d.order_id}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{d.customer}</span>
                      <span className="text-[10px] text-slate-400 block">{d.merchant}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{d.amount}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{d.reason}</td>
                    <td className="py-3.5 px-4">
                      {d.status === 'RESOLVED_REFUNDED' && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Refunded
                        </Badge>
                      )}
                      {d.status === 'AUTO_REFUNDED' && (
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Auto Reversal
                        </Badge>
                      )}
                      {d.status === 'UNDER_ARBITRATION' && (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                          <Clock className="w-3 h-3 mr-1" />
                          Arbitration
                        </Badge>
                      )}
                      {d.status === 'EVIDENCE_SUBMITTED' && (
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                          <FileCheck className="w-3 h-3 mr-1" />
                          Evidence Sent
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{d.evidence_deadline}</td>
                    <td className="py-3.5 px-4 text-right">
                      {d.status === 'UNDER_ARBITRATION' ? (
                        <Button
                          size="sm"
                          onClick={() => handleResolve(d.id)}
                          disabled={resolvingId === d.id}
                          className="h-7 px-3 text-[11px] font-bold bg-[#0B72E7] hover:bg-blue-600 text-white rounded-lg shadow-xs"
                        >
                          {resolvingId === d.id ? 'Resolving...' : 'Resolve'}
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-xs h-7 px-2.5 text-slate-600 hover:bg-slate-100">
                          Inspect
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
