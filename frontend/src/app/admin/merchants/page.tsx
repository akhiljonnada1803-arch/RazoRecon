'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Search, 
  Filter, 
  MoreVertical,
  ExternalLink,
  Store,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminMerchantsPage() {
  const merchants = [
    {
      id: 'mch_acme_8842',
      name: 'Acme Direct Corp',
      category: 'Fintech Hardware & POS',
      kyc_status: 'VERIFIED',
      volume_30d: '₹14,89,200',
      active_skus: 50,
      settlement_bank: 'HDFC Bank •••• 4912',
      joined_date: '12 Jan 2026',
    },
    {
      id: 'mch_retail_9921',
      name: 'Omni Retail Technologies',
      category: 'Soundboxes & IoT Peripherals',
      kyc_status: 'VERIFIED',
      volume_30d: '₹8,45,000',
      active_skus: 34,
      settlement_bank: 'ICICI Bank •••• 8821',
      joined_date: '02 Feb 2026',
    },
    {
      id: 'mch_finops_1044',
      name: 'CloudFin Solutions Ltd',
      category: 'Enterprise ERP & Software',
      kyc_status: 'UNDER_REVIEW',
      volume_30d: '₹22,10,500',
      active_skus: 18,
      settlement_bank: 'State Bank of India •••• 1044',
      joined_date: '28 Feb 2026',
    },
    {
      id: 'mch_zenith_3319',
      name: 'Zenith Logistics Gear',
      category: 'Workstations & Peripherals',
      kyc_status: 'VERIFIED',
      volume_30d: '₹5,12,000',
      active_skus: 12,
      settlement_bank: 'Axis Bank •••• 3319',
      joined_date: '01 Mar 2026',
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-[#071328] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs font-mono">
              MERCHANT GOVERNANCE
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-mono">
              KYC ENGINE ACTIVE
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Merchant Approvals & Directory
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Review merchant onboarding applications, inspect KYC verification documents, manage Razorpay settlement routes, and configure catalog limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-[#0B72E7] hover:bg-blue-600 text-white text-xs font-bold rounded-xl h-10 px-4 shadow-sm">
            Approve Merchant
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Merchants', val: '42 Verified', change: '+8 this month', color: 'text-emerald-600' },
          { label: 'Pending KYC Review', val: '3 Applications', change: 'Avg 4.2h SLA', color: 'text-amber-600' },
          { label: 'Gross 30d Volume', val: '₹1.84 Cr', change: 'Multi-rail captured', color: 'text-blue-600' },
          { label: 'Compliance Score', val: '99.8%', change: 'PCI-DSS Level 1', color: 'text-purple-600' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">{s.label}</span>
            <span className="text-xl font-black text-slate-900 block">{s.val}</span>
            <span className={`text-[11px] font-semibold ${s.color} block`}>{s.change}</span>
          </div>
        ))}
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <h3 className="font-bold text-slate-900 text-sm">Registered Merchants</h3>
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search merchant name, MID, category..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Merchant Name</th>
                <th className="py-3 px-4">Merchant ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">KYC Status</th>
                <th className="py-3 px-4">30d Gross GMV</th>
                <th className="py-3 px-4">Active SKUs</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {merchants.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {m.name.charAt(0)}
                    </div>
                    <span>{m.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{m.id}</td>
                  <td className="py-3.5 px-4">{m.category}</td>
                  <td className="py-3.5 px-4">
                    {m.kyc_status === 'VERIFIED' ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                        <Clock className="w-3 h-3 mr-1" />
                        Under Review
                      </Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{m.volume_30d}</td>
                  <td className="py-3.5 px-4 font-mono">{m.active_skus} SKUs</td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2.5 text-blue-600 font-bold hover:bg-blue-50">
                      Inspect
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
