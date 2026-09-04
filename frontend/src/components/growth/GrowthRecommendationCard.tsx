'use client';

import React from 'react';
import { RecommendationCard } from '@/types/growth';
import { 
  ArrowUpRight, 
  Plus, 
  Sparkles, 
  Check, 
  Percent, 
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface GrowthRecommendationCardProps {
  recommendation: RecommendationCard;
  onApplyRecommendation: (rec: RecommendationCard) => void;
}

export function GrowthRecommendationCard({
  recommendation,
  onApplyRecommendation,
}: GrowthRecommendationCardProps) {
  const isUpsell = recommendation.type === 'upsell';

  return (
    <div className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
      isUpsell 
        ? 'bg-gradient-to-b from-white to-blue-50/30 border-blue-200 shadow-xs hover:shadow-md' 
        : 'bg-gradient-to-b from-white to-emerald-50/20 border-emerald-200 shadow-xs hover:shadow-md'
    }`}>
      {/* Header Tag & Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Badge className={`text-[10px] font-bold border-0 ${
            isUpsell ? 'bg-[#0B72E7] text-white' : 'bg-emerald-600 text-white'
          }`}>
            {recommendation.badge_label}
          </Badge>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {recommendation.target_category}
          </span>
        </div>

        {/* AI Confidence Pill */}
        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-slate-200 text-[10px] font-bold text-slate-700 shadow-2xs">
          <Sparkles className="h-3 w-3 text-[#0B72E7]" />
          <span>{recommendation.confidence_score_pct}% AI Score</span>
        </div>
      </div>

      {/* Product Image & Info */}
      <div className="flex gap-3.5 items-start">
        <div className="h-20 w-20 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
          <img
            src={recommendation.target_image_url}
            alt={recommendation.target_product_name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
            {recommendation.target_product_name}
          </h4>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
            By {recommendation.target_brand}
          </span>

          {/* Pricing Delta */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-base font-extrabold text-[#072654]">
              ₹{recommendation.target_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-emerald-600">
              +{recommendation.margin_delta_pct}% Margin Lift
            </span>
          </div>
        </div>
      </div>

      {/* Strategy Rationale */}
      <div className="p-3 bg-white/90 border border-slate-100 rounded-2xl space-y-1.5 shadow-2xs">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
          <Zap className="h-3 w-3 text-amber-500" />
          <span>Agent Rationale</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {recommendation.strategy_rationale}
        </p>
      </div>

      {/* Key Advantages Bullet List */}
      {recommendation.key_advantages && recommendation.key_advantages.length > 0 && (
        <div className="space-y-1">
          {recommendation.key_advantages.slice(0, 2).map((adv, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
              <Check className="h-3 w-3 text-emerald-600 shrink-0" />
              <span className="line-clamp-1">{adv}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action CTA Button */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="text-[11px] text-slate-500">
          Expected AOV Lift: <strong className="text-slate-800 font-bold">+₹{recommendation.expected_uplift_inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
        </div>

        <Button
          onClick={() => onApplyRecommendation(recommendation)}
          size="sm"
          className={`h-9 px-3.5 text-xs font-bold rounded-xl text-white shadow-xs gap-1.5 ${
            isUpsell ? 'bg-[#0B72E7] hover:bg-[#095bc0]' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{isUpsell ? 'Upgrade Item' : 'Add to Cart'}</span>
        </Button>
      </div>
    </div>
  );
}
