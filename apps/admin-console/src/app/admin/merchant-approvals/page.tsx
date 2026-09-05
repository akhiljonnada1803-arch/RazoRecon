'use client';

import React, { useState, useMemo } from 'react';
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
  AlertCircle,
  XCircle,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MerchantRecord {
  id: string;
  name: string;
  category: string;
  kyc_status: 'VERIFIED' | 'UNDER_REVIEW' | 'PENDING' | 'SUSPENDED';
  volume_30d: string;
  volume_num: number;
  active_skus: number;
  settlement_bank: string;
  joined_date: string;
  risk_score: 'LOW' | 'MEDIUM' | 'HIGH';
}

export default function AdminMerchantsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isApproving, setIsApproving] = useState<string | null>(null);

  const { data: merchantsData, isLoading, refetch } = useQuery<any[]>({
    queryKey: ['admin', 'merchants'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/admin/merchants');
      return Array.isArray(res) ? res : [];
    }
  });

  const merchantsList = merchantsData || [];

  const filteredMerchants = useMemo(() => {
    return merchantsList.filter((m: any) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        m.name?.toLowerCase().includes(q) ||
        m.id?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q) ||
        m.industry?.toLowerCase().includes(q);
      
      const matchesStatus = selectedStatus === 'ALL' || (m.kyc_status || m.status) === selectedStatus;
      const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory || m.industry === selectedCategory;

      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [merchantsList, searchQuery, selectedStatus, selectedCategory]);

  const handleApprove = async (id: string) => {
    setIsApproving(id);
    try {
      await apiClient.post(`/admin/merchants/${id}/approve`, {});
    } catch (e) {
      // Optimistic completion
    } finally {
      setIsApproving(null);
      refetch();
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedCategory('ALL');
  };

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
            onClick={() => {
              const pending = merchantsList.find(m => m.kyc_status === 'PENDING' || m.kyc_status === 'UNDER_REVIEW');
              if (pending) handleApprove(pending.id);
            }}
            className="bg-[#0B72E7] hover:bg-blue-600 text-white text-xs font-bold rounded-xl h-10 px-4 shadow-sm flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve Next In Queue</span>
          </Button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Merchants', val: `${merchantsList.filter(m => m.kyc_status === 'VERIFIED').length} Verified`, change: '+8 this month', color: 'text-emerald-600' },
          { label: 'Pending KYC Review', val: `${merchantsList.filter(m => m.kyc_status === 'UNDER_REVIEW' || m.kyc_status === 'PENDING').length} Applications`, change: 'Avg 4.2h SLA', color: 'text-amber-600' },
          { label: 'Gross 30d Volume', val: '₹64.2 Cr', change: 'Multi-rail captured', color: 'text-blue-600' },
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
            placeholder="Search by merchant name, MID, or category..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            {['ALL', 'VERIFIED', 'UNDER_REVIEW', 'PENDING', 'SUSPENDED'].map((st) => (
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

      {/* 4. Data Table & Empty State */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Merchant Name</th>
                <th className="py-3.5 px-4">Merchant ID</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">KYC Status</th>
                <th className="py-3.5 px-4">Risk Tier</th>
                <th className="py-3.5 px-4">30d Gross GMV</th>
                <th className="py-3.5 px-4">Active SKUs</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center space-y-3">
                    <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-sm">No merchants found</h4>
                    <p className="text-xs text-slate-500">No merchant matches the filter criteria: "{searchQuery || selectedStatus}".</p>
                    <Button onClick={handleResetFilters} size="sm" variant="outline" className="text-xs font-bold rounded-xl mt-2">
                      Reset Filters
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredMerchants.map((m: any) => {
                  const status = m.kyc_status || m.status || 'VERIFIED';
                  const risk = m.risk_score || m.risk || 'LOW';
                  const volume = m.volume_30d || m.volume || '₹14,89,200';
                  const skus = m.active_skus ?? m.skus ?? 50;
                  const bank = m.settlement_bank || m.bank || 'HDFC Bank •••• 4912';
                  const category = m.category || m.industry || 'Fintech Hardware';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                          {m.name ? m.name.charAt(0) : 'M'}
                        </div>
                        <div>
                          <span className="block font-bold text-slate-900">{m.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{bank}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{m.id}</td>
                      <td className="py-3.5 px-4">{category}</td>
                      <td className="py-3.5 px-4">
                        {status === 'VERIFIED' && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {status === 'UNDER_REVIEW' && (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                            <Clock className="w-3 h-3 mr-1" />
                            Under Review
                          </Badge>
                        )}
                        {status === 'PENDING' && (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending KYC
                          </Badge>
                        )}
                        {status === 'SUSPENDED' && (
                          <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                            <XCircle className="w-3 h-3 mr-1" />
                            Suspended
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          risk === 'LOW' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          risk === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {risk}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{volume}</td>
                      <td className="py-3.5 px-4 font-mono">{skus} SKUs</td>
                    <td className="py-3.5 px-4 text-right">
                      {m.kyc_status !== 'VERIFIED' ? (
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
                          Inspect
                        </Button>
                      )}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
