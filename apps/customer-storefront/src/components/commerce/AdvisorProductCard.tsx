'use client';

import React from 'react';
import { Product } from '@/types/commerce';
import { Star, ShieldCheck, Check, AlertCircle, ArrowRight, Truck, Cpu, Zap, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdvisorProductCardProps {
  product: Product;
  rankIndex: number;
  isRecommended?: boolean;
  onSelect: (product: Product) => void;
}

export function AdvisorProductCard({
  product,
  rankIndex,
  isRecommended = false,
  onSelect,
}: AdvisorProductCardProps) {
  const rankLabels = ['🥇 #1 Best Match', '🥈 #2 Value Alternative', '🥉 #3 Alternative Option'];
  const rankBadges = [
    'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black',
    'bg-blue-600 text-white font-bold',
    'bg-slate-700 text-slate-200 font-medium'
  ];

  return (
    <div className={`relative flex flex-col justify-between bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-lg ${
      isRecommended 
        ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' 
        : 'border-slate-200 hover:border-blue-300'
    }`}>
      {/* Top Header Rank Banner */}
      <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between">
        <span className={`text-[11px] px-2.5 py-0.5 rounded-full shadow-xs ${rankBadges[rankIndex] || rankBadges[1]}`}>
          {rankLabels[rankIndex] || `Option #${rankIndex + 1}`}
        </span>
        <span className="text-[11px] text-slate-300 font-mono flex items-center gap-1">
          <Award className="w-3 h-3 text-amber-400" />
          {product.merchant_trust_score || 98.5}% Trust Score
        </span>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Image & Price Header */}
          <div className="flex gap-3.5 items-start">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden p-1.5 shrink-0 flex items-center justify-center">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {product.brand || product.category}
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-2 mt-0.5" title={product.name}>
                {product.name}
              </h4>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-base font-black text-[#072654] font-mono">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <div className="flex items-center gap-0.5 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Inclusive of GST</span>
              </span>
            </div>
          </div>

          {/* Delivery ETA & Stock */}
          <div className="flex flex-wrap items-center justify-between text-[11px] bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-slate-600">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{product.delivery_eta || 'Tomorrow via Delhivery'}</span>
            </span>
            <span className="font-medium text-slate-500">
              {product.stock_status || 'In Stock'}
            </span>
          </div>

          {/* Key Features & Specs */}
          {product.specs && product.specs.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Specifications</span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {product.specs.slice(0, 4).map((spec, i) => (
                  <div key={i} className="bg-slate-50/80 px-2 py-1 rounded-lg border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">{spec.key}</span>
                    <span className="font-semibold text-slate-800 text-[11px] truncate block">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pros (Green Checkmarks) */}
          {product.pros && product.pros.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
                <Check className="w-3 h-3" /> Pros & Advantages
              </span>
              <ul className="space-y-1">
                {product.pros.map((pro, i) => (
                  <li key={i} className="text-[11px] text-slate-700 flex items-start gap-1.5 leading-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cons (Subtle Amber Warning) */}
          {product.cons && product.cons.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Considerations
              </span>
              <ul className="space-y-1">
                {product.cons.map((con, i) => (
                  <li key={i} className="text-[11px] text-slate-500 flex items-start gap-1.5 leading-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Step 6 Customer Selection CTA */}
        <div className="pt-3 border-t border-slate-100">
          <Button
            onClick={() => onSelect(product)}
            className={`w-full h-10 rounded-xl font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
              isRecommended
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-indigo-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <span>👉 Select {product.name.split(' ')[0]} {product.name.split(' ')[1] || ''}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
