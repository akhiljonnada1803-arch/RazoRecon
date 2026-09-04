'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  SlidersHorizontal,
  ArrowUpDown,
  ShieldAlert
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { VendorRiskScoreDTO } from '@/types/vendor_risk';
import { formatCurrency } from '@/lib/utils';

interface VendorDirectoryListProps {
  vendors: VendorRiskScoreDTO[];
  onSelectVendor: (vendor: VendorRiskScoreDTO) => void;
}

export const VendorDirectoryList: React.FC<VendorDirectoryListProps> = ({
  vendors,
  onSelectVendor,
}) => {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [sortBy, setSortBy] = useState<'risk' | 'exceptions' | 'name'>('risk');

  const filtered = vendors
    .filter((v) => {
      const matchesSearch =
        v.vendor.toLowerCase().includes(search.toLowerCase()) ||
        v.vendor_id.toLowerCase().includes(search.toLowerCase()) ||
        v.main_risk.toLowerCase().includes(search.toLowerCase());

      if (levelFilter === 'HIGH') return matchesSearch && v.risk_level === 'HIGH';
      if (levelFilter === 'MEDIUM') return matchesSearch && v.risk_level === 'MEDIUM';
      if (levelFilter === 'LOW') return matchesSearch && v.risk_level === 'LOW';
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'risk') return b.risk_score - a.risk_score;
      if (sortBy === 'exceptions') return b.total_exceptions - a.total_exceptions;
      return a.vendor.localeCompare(b.vendor);
    });

  return (
    <div className="space-y-4">
      {/* Header & Controls Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-bold text-[#072654] tracking-tight">
            Vendor Directory
          </h2>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Click any counterparty to view the forensic dossier, pattern memory, and resolution history
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by vendor, ID, or risk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 text-xs w-56 sm:w-64 border-slate-200 bg-white rounded-xl shadow-2xs"
            />
          </div>

          {/* Risk Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-3 py-1 rounded-lg text-[11px] transition-all ${
                  levelFilter === lvl
                    ? 'bg-white text-[#072654] shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-9 text-xs border border-slate-200 bg-white text-slate-700 rounded-xl px-2.5 shadow-2xs font-medium focus:outline-hidden"
          >
            <option value="risk">Sort: Highest Risk</option>
            <option value="exceptions">Sort: Most Exceptions</option>
            <option value="name">Sort: Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Stripe-like Modern Rows List */}
      <div className="space-y-2.5">
        {filtered.map((v) => {
          const isHigh = v.risk_level === 'HIGH';
          const isMed = v.risk_level === 'MEDIUM';

          return (
            <div
              key={v.vendor_id}
              onClick={() => onSelectVendor(v)}
              className="group bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md hover:border-blue-300 hover:translate-y-[-1px] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Col 1: Vendor Name & ID */}
              <div className="flex items-center gap-3.5 min-w-[240px]">
                <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 group-hover:bg-blue-50 group-hover:text-[#0B72E7] group-hover:border-blue-200 transition-colors shrink-0">
                  {v.vendor.slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <span className="text-[14px] font-bold text-[#072654] group-hover:text-[#0B72E7] transition-colors block">
                    {v.vendor}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    {v.vendor_id}
                  </span>
                </div>
              </div>

              {/* Col 2: Risk Score & Level Badge */}
              <div className="flex items-center gap-3 sm:w-36">
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-lg font-bold font-mono ${isHigh ? 'text-rose-600' : isMed ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {v.risk_score}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">/ 100</span>
                  </div>
                  <span className={`text-[10px] font-bold font-mono uppercase ${isHigh ? 'text-rose-600' : isMed ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {v.risk_level} RISK
                  </span>
                </div>
              </div>

              {/* Col 3: Main Risk Category */}
              <div className="space-y-0.5 sm:w-44">
                <span className="text-xs font-semibold text-slate-800 block">
                  {v.main_risk}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {v.duplicate_payment_count > 0 
                    ? `${v.duplicate_payment_count} Duplicates` 
                    : `${v.settlement_delay_count} Delay Cycles`}
                </span>
              </div>

              {/* Col 4: Exceptions & Transactions Volume */}
              <div className="space-y-0.5 sm:w-36">
                <span className={`text-xs font-mono font-bold block ${v.total_exceptions > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                  {v.total_exceptions} Exceptions
                </span>
                <span className="text-[11px] text-slate-400 block">
                  in {v.total_transactions} txns
                </span>
              </div>

              {/* Col 5: Average Transaction Value */}
              <div className="space-y-0.5 sm:w-32">
                <span className="text-xs font-mono font-semibold text-slate-800 block">
                  {formatCurrency(v.avg_transaction_value)}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Mean per invoice
                </span>
              </div>

              {/* Col 6: Action Button */}
              <div className="flex items-center justify-end">
                <div className="h-8 px-3 rounded-xl bg-slate-50 border border-slate-200/80 group-hover:bg-[#0B72E7] group-hover:text-white group-hover:border-blue-600 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs">
                  <span>View Dossier</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            No counterparties found matching "{search}".
          </div>
        )}
      </div>
    </div>
  );
};
