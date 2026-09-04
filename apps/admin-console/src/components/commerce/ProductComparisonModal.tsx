'use client';

import React from 'react';
import { ComparisonData, Product } from '@/types/commerce';
import { X, Check, GitCompare, ShoppingBag, Star, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ComparisonData | null;
  onAddToCart: (product: Product) => void;
}

export function ProductComparisonModal({
  isOpen,
  onClose,
  data,
  onAddToCart,
}: ProductComparisonModalProps) {
  if (!isOpen || !data || !data.products || data.products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#072654] text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-[#0B72E7]">
              <GitCompare className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-white">
                Product Comparison Matrix
              </h3>
              <p className="text-xs text-blue-200/80">
                Side-by-side technical and commercial evaluation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* AI Verdict Banner */}
          {data.verdict && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3">
              <div className="p-1.5 bg-[#0B72E7] text-white rounded-lg shrink-0 mt-0.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-[#072654] block mb-0.5 uppercase tracking-wider">
                  AI Commerce Advisor Verdict
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {data.verdict}
                </p>
              </div>
            </div>
          )}

          {/* Comparison Grid Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-bold text-slate-600 w-1/4">Feature / Metric</th>
                  {data.products.map((prod) => (
                    <th key={prod.id} className="p-4 font-bold text-[#072654] w-3/8 border-l border-slate-200">
                      <div className="flex flex-col gap-2">
                        <div className="h-24 w-full bg-slate-100 rounded-xl overflow-hidden relative">
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="font-bold text-sm text-slate-900 line-clamp-1">{prod.name}</div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-extrabold text-[#0B72E7] block">
                              ₹{prod.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-medium">
                              Incl. of GST
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 font-semibold">
                            <Star className="h-3 w-3 fill-amber-400" />
                            <span>{prod.rating}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onAddToCart(prod)}
                          className="h-7 text-xs bg-[#0B72E7] hover:bg-[#095bc0] text-white rounded-lg mt-1 gap-1"
                        >
                          <ShoppingBag className="h-3 w-3" />
                          Add to Cart
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.attributes || []).map((attr, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-3.5 font-semibold text-slate-700 bg-slate-50/30">
                      {attr.attribute}
                    </td>
                    {data.products.map((prod) => (
                      <td key={prod.id} className="p-3.5 text-slate-600 border-l border-slate-200">
                        {attr.values[prod.name] || attr.values[prod.id] || 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            All prices include 18% GST and eligible for input tax credit.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl border-slate-300"
          >
            Close Comparison
          </Button>
        </div>
      </div>
    </div>
  );
}
