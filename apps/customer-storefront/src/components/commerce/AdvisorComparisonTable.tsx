'use client';

import React from 'react';
import { ComparisonData } from '@/types/commerce';
import { GitCompare, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AdvisorComparisonTableProps {
  data: ComparisonData;
}

export function AdvisorComparisonTable({ data }: AdvisorComparisonTableProps) {
  if (!data || !data.products || data.products.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl space-y-4 overflow-hidden">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            <GitCompare className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-extrabold text-white tracking-tight">
            Side-by-Side Feature Comparison
          </h4>
        </div>
        <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px] font-bold w-fit">
          <Sparkles className="w-3 h-3 mr-1 text-amber-300" />
          Multi-Factor Analysis
        </Badge>
      </div>

      {/* Responsive Comparison Table */}
      <div className="overflow-x-auto -mx-1 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[540px]">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-2.5 px-3 bg-slate-950/40 rounded-l-xl w-1/4">Key Feature</th>
              {data.products.map((p, idx) => (
                <th key={p.id || idx} className="py-2.5 px-3 bg-slate-950/40 text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="truncate max-w-[140px]" title={p.name}>{p.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {data.attributes && data.attributes.map((attr, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-slate-300 bg-slate-950/20 text-[11px]">
                  {attr.attribute}
                </td>
                {data.products.map((p) => {
                  const val = attr.values[p.name] || attr.values[p.id] || 'Standard';
                  const isPrice = attr.attribute.toLowerCase().includes('price');
                  const isRating = attr.attribute.toLowerCase().includes('rating');

                  return (
                    <td key={p.id} className="py-2.5 px-3 text-slate-300 text-[11px]">
                      {isPrice ? (
                        <div>
                          <span className="font-extrabold text-emerald-400 font-mono text-xs block">
                            {val}
                          </span>
                          <span className="text-[9px] text-emerald-300/80 font-sans block">
                            (GST Included)
                          </span>
                        </div>
                      ) : isRating ? (
                        <span className="font-bold text-amber-300">
                          ★ {val}
                        </span>
                      ) : (
                        <span>{val}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Verdict Footer */}
      {data.verdict && (
        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-[11px] text-slate-300 flex items-start gap-2 leading-relaxed">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Advisor Verdict: </strong>
            <span>{data.verdict}</span>
          </div>
        </div>
      )}
    </div>
  );
}
