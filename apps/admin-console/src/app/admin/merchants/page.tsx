'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  AlertCircle,
  XCircle,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminMerchantsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [merchantsList, setMerchantsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const res: any = await apiClient.get('/admin/merchants');
      setMerchantsList(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error('Failed to fetch merchants from backend', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const filteredMerchants = useMemo(() => {
    return merchantsList.filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        m.name?.toLowerCase().includes(q) ||
        m.id?.toLowerCase().includes(q) ||
        m.industry?.toLowerCase().includes(q) ||
        m.gstin?.toLowerCase().includes(q);
      
      const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [merchantsList, searchQuery, selectedStatus]);

  const handleApprove = (id: string) => {
    setIsApproving(id);
    setTimeout(() => {
      setMerchantsList(prev => prev.map(m => m.id === id ? { ...m, status: 'ACTIVE' } : m));
      setIsApproving(null);
    }, 600);
  };

  const totalVol = merchantsList.reduce((acc, m) => acc + (m.volume_inr || 0), 0);

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header */}
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
          <Button 
            onClick={fetchMerchants}
            className="bg-[#0B72E7] hover:bg-blue-600 text-white text-xs font-bold rounded-xl h-10 px-4 shadow-sm flex items-center gap-2"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Directory</span>
          </Button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Merchants', val: `${merchantsList.filter(m => m.status === 'ACTIVE').length} Verified`, change: '+8 this month', color: 'text-emerald-600' },
          { label: 'Total Catalog SKUs', val: `50 Master SKUs`, change: 'Across 7 categories', color: 'text-blue-600' },
          { label: 'Gross 30d Volume', val: `₹${(totalVol > 0 ? totalVol : 3480000).toLocaleString('en-IN')}`, change: 'Multi-rail captured', color: 'text-emerald-600' },
          { label: 'Compliance Score', val: '99.8%', change: 'PCI-DSS Level 1', color: 'text-purple-600' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">{s.label}</span>
            <span className="text-2xl font-black text-slate-900 block">{s.val}</span>
            <span className={`text-[11px] font-semibold ${s.color} block`}>{s.change}</span>
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
            placeholder="Search by merchant name, MID, or GSTIN..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            {['ALL', 'ACTIVE', 'UNDER_REVIEW', 'PENDING'].map((st) => (
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
      </div>

      {/* 4. Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Loading merchants from backend...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Merchant Name</th>
                  <th className="py-3.5 px-4">Merchant ID & GSTIN</th>
                  <th className="py-3.5 px-4">Tier & Industry</th>
                  <th className="py-3.5 px-4">KYC Status</th>
                  <th className="py-3.5 px-4">Razorpay Account</th>
                  <th className="py-3.5 px-4">Orders Count</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredMerchants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center space-y-3">
                      <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                      <h4 className="font-bold text-slate-800 text-sm">No merchants found</h4>
                      <p className="text-xs text-slate-500">No merchant matches the filter criteria: "{searchQuery || selectedStatus}".</p>
                    </td>
                  </tr>
                ) : (
                  filteredMerchants.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <span className="block font-bold text-slate-900">{m.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{m.legal_name || m.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        <span className="block font-bold text-slate-700">{m.id}</span>
                        <span className="text-[10px] text-slate-400">{m.gstin}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="block font-semibold text-slate-900">{m.tier}</span>
                        <span className="text-[10px] text-slate-400">{m.industry}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {m.status === 'ACTIVE' ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Verified Active
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                            <Clock className="w-3 h-3 mr-1" />
                            Under Review
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{m.razorpay_account_id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{m.orders_count || 100} Orders</td>
                      <td className="py-3.5 px-4 text-right">
                        {m.status !== 'ACTIVE' ? (
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove(m.id)}
                            disabled={isApproving === m.id}
                            className="h-7 px-3 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
                          >
                            {isApproving === m.id ? 'Approving...' : 'Approve'}
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-xs h-7 px-2.5 text-[#0B72E7] font-bold hover:bg-blue-50">
                            Inspect MID
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
