'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Building2, 
  Search, 
  ArrowUpDown, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VendorRiskScoreDTO } from '@/types/vendor_risk';
import { formatCurrency } from '@/lib/utils';

interface VendorRiskTableProps {
  vendors: VendorRiskScoreDTO[];
}

export const VendorRiskTable: React.FC<VendorRiskTableProps> = ({ vendors }) => {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const filtered = vendors.filter((v) => {
    const matchesSearch = 
      v.vendor.toLowerCase().includes(search.toLowerCase()) ||
      v.vendor_id.toLowerCase().includes(search.toLowerCase()) ||
      v.main_risk.toLowerCase().includes(search.toLowerCase());

    if (levelFilter !== 'ALL') return matchesSearch && v.risk_level === levelFilter;
    return matchesSearch;
  });

  return (
    <Card className="border border-slate-200 bg-white shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <CardTitle className="text-sm font-bold text-[#072654]">
            Vendor Risk Intelligence Directory
          </CardTitle>
          <p className="text-xs text-slate-500">
            Multi-factor scoring: 40% Exception Freq • 30% Settlement Delays • 20% Tax Mismatches • 10% Duplicate Payments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs w-48 border-slate-200"
          />

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-2 py-1 rounded-md text-[11px] transition-all ${
                  levelFilter === lvl
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-2.5 px-4">VENDOR</th>
              <th className="py-2.5 px-3">RISK SCORE</th>
              <th className="py-2.5 px-3">RISK LEVEL</th>
              <th className="py-2.5 px-3">MAIN RISK</th>
              <th className="py-2.5 px-3">EXCEPTION COUNT</th>
              <th className="py-2.5 px-3">AVG TXN VALUE</th>
              <th className="py-2.5 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.map((v) => {
              const isHigh = v.risk_level === 'HIGH';
              const isMed = v.risk_level === 'MEDIUM';

              return (
                <tr key={v.vendor_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px] shrink-0">
                        {v.vendor.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{v.vendor}</span>
                        <code className="text-[10px] text-slate-400 font-mono">{v.vendor_id}</code>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{v.risk_score}</span>
                      <span className="text-[10px] text-slate-400">/ 100</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold font-mono py-0 h-4.5 ${
                        isHigh
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isMed
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {v.risk_level}
                    </Badge>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800 block">{v.main_risk}</span>
                    <span className="text-[10px] text-slate-400">
                      {v.duplicate_payment_count > 0 ? `${v.duplicate_payment_count} Duplicates` : `${v.settlement_delay_count} Delays`}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`font-mono font-bold text-xs ${v.total_exceptions > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {v.total_exceptions} Exceptions
                    </span>
                    <span className="text-[10px] text-slate-400 block">in {v.total_transactions} txns</span>
                  </td>

                  <td className="py-3 px-3 font-mono font-medium text-slate-800">
                    {formatCurrency(v.avg_transaction_value)}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Link href="/memory">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2.5 rounded border-slate-300 hover:bg-slate-100 hover:text-slate-900 font-semibold"
                      >
                        Memory Profile
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No vendors found matching criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
