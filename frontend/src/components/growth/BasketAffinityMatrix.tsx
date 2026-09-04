'use client';

import React from 'react';
import { AffinityRule } from '@/types/growth';
import { 
  GitMerge, 
  Layers, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BasketAffinityMatrixProps {
  rules: AffinityRule[];
}

export function BasketAffinityMatrix({ rules }: BasketAffinityMatrixProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <GitMerge className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#072654]">
              Market Basket Affinity Rules (Lift Analysis)
            </h3>
            <p className="text-xs text-slate-500">
              Co-occurrence patterns mined from 500+ historical merchant purchase batches
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border-indigo-200">
          Association Engine
        </Badge>
      </div>

      {/* Rules Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-2xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <th className="p-3.5 pl-5">Primary Item (Antecedent)</th>
              <th className="p-3.5">Complement Item (Consequent)</th>
              <th className="p-3.5 text-center">Support</th>
              <th className="p-3.5 text-center">Confidence</th>
              <th className="p-3.5 text-center">Lift Ratio</th>
              <th className="p-3.5 pr-5 text-right">Co-Purchases</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rules.map((r) => (
              <tr key={r.rule_id} className="hover:bg-slate-50/70 transition-colors">
                <td className="p-3.5 pl-5 font-semibold text-slate-800">
                  {r.antecedent_product_name}
                </td>
                <td className="p-3.5">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-[#0B72E7] shrink-0" />
                    <span className="font-bold text-slate-900">{r.consequent_product_name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block ml-5">
                    {r.synergy_type} • ₹{r.consequent_price.toLocaleString('en-IN')}
                  </span>
                </td>
                <td className="p-3.5 text-center font-mono text-slate-600">
                  {r.support_pct}%
                </td>
                <td className="p-3.5 text-center font-mono font-semibold text-slate-800">
                  {r.confidence_pct}%
                </td>
                <td className="p-3.5 text-center">
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold font-mono text-[10px] border">
                    {r.lift_score.toFixed(2)}x Lift
                  </Badge>
                </td>
                <td className="p-3.5 pr-5 text-right font-mono font-bold text-indigo-700">
                  {r.historical_co_purchases} txns
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
