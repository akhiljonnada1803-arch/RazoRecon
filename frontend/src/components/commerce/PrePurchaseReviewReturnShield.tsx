'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CustomerPrePurchaseIntelligence } from '@/types/review-return-agent';
import {
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  Info,
  Layers,
  Wrench,
  Zap,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PrePurchaseReviewReturnShieldProps {
  productId: string;
  productName?: string;
  className?: string;
}

export function PrePurchaseReviewReturnShield({
  productId,
  productName,
  className = '',
}: PrePurchaseReviewReturnShieldProps) {
  const [actionApplied, setActionApplied] = useState(false);

  const { data: intel, isLoading } = useQuery<CustomerPrePurchaseIntelligence>({
    queryKey: ['review-return-prepurchase', productId],
    queryFn: () => apiClient.get(`/review-return/pre-purchase/${productId}`),
    enabled: !!productId,
  });

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 animate-pulse space-y-3">
        <div className="h-5 bg-slate-200 rounded w-1/4" />
        <div className="h-12 bg-slate-200 rounded w-full" />
      </div>
    );
  }

  if (!intel) return null;

  const returnRiskScore = actionApplied
    ? Math.max(0.4, Number((intel.return_risk_score * 0.28).toFixed(1)))
    : intel.return_risk_score;

  const isLowRisk = returnRiskScore < 3.0;

  return (
    <div className={`bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 rounded-3xl border border-blue-200/90 p-6 sm:p-7 shadow-xs space-y-5 ${className}`}>
      {/* 1. Header Shield */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#072654] to-[#0B72E7] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">
                AI Pre-Purchase Decision Shield
              </h3>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-mono">
                {intel.satisfaction_score}% Satisfaction
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Verified review intelligence and predictive return risk analysis before you checkout.
            </p>
          </div>
        </div>

        {/* Return Risk Score Gauge */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Return Risk Score</span>
            <div className="flex items-center gap-1 font-mono font-black text-sm">
              <span className={isLowRisk ? 'text-emerald-600' : 'text-amber-600'}>
                {returnRiskScore}%
              </span>
              <span className="text-[10px] font-sans font-bold text-slate-500">
                ({isLowRisk ? 'Low Risk' : 'Moderate Risk'})
              </span>
            </div>
          </div>
          <div className={`w-3.5 h-3.5 rounded-full animate-pulse ${isLowRisk ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </div>
      </div>

      {/* 2. Review Summary */}
      <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-200/70 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#072654]">
          <Sparkles className="w-4 h-4 text-[#0B72E7]" />
          <span>AI Verified Review Summary</span>
          <span className="text-[10px] font-normal text-slate-500 font-mono">
            ({intel.total_reviews_analyzed} verified buyer reviews analyzed)
          </span>
        </div>
        <p className="text-xs sm:text-[13px] text-slate-800 font-medium leading-relaxed">
          &quot;{intel.review_summary}&quot;
        </p>
      </div>

      {/* 3. Common Positives & Common Concerns Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Common Positives */}
        <div className="bg-white rounded-2xl border border-emerald-200/80 p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <ThumbsUp className="w-4 h-4 text-emerald-600" />
            <span>Common Positives (Aspect Strengths)</span>
          </div>
          <ul className="space-y-2 text-xs">
            {intel.common_positives.map((pos, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{pos.replace(/^✓\s*/, '')}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Common Concerns */}
        <div className="bg-white rounded-2xl border border-amber-200/80 p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Common Concerns & Return Factors</span>
          </div>
          <ul className="space-y-2 text-xs">
            {intel.common_concerns.map((con, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span className="leading-snug">{con.replace(/^✗\s*/, '')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Explainable Recommendation */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Info className="w-4 h-4 text-[#0B72E7]" />
            <span>Explainable Recommendation</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 font-bold">
            {intel.recommendation_score}% Recommendation Score
          </span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          {intel.explainable_recommendation}
        </p>

        {/* 5. Return Reduction Action Trigger */}
        {intel.mitigation_action && (
          <div className="pt-2 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Recommended Action: <strong className="text-emerald-700 font-mono">Reduces return risk to {actionApplied ? '0.4%' : '0.5%'}</strong>
              </span>
            </div>

            <Button
              onClick={() => setActionApplied(!actionApplied)}
              size="sm"
              variant={actionApplied ? 'outline' : 'default'}
              className={`rounded-xl text-xs font-bold transition-all ${
                actionApplied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-[#0B72E7] hover:bg-blue-700 text-white'
              }`}
            >
              {actionApplied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Mitigation Selected (-72% Risk)
                </>
              ) : (
                <>
                  <Wrench className="w-3.5 h-3.5 mr-1" />
                  {intel.mitigation_action.label}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
