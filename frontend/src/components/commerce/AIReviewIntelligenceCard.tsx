'use client';

import React, { useEffect, useState } from 'react';
import { ReviewIntelligence } from '@/types/commerce';
import { apiClient } from '@/lib/api-client';
import { 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Info,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AIReviewIntelligenceCardProps {
  productId?: string;
  initialIntelligence?: ReviewIntelligence;
  compact?: boolean;
  className?: string;
}

export function AIReviewIntelligenceCard({
  productId,
  initialIntelligence,
  compact = false,
  className = '',
}: AIReviewIntelligenceCardProps) {
  const [intelligence, setIntelligence] = useState<ReviewIntelligence | null>(
    initialIntelligence || null
  );
  const [isLoading, setIsLoading] = useState(!initialIntelligence && !!productId);

  useEffect(() => {
    if (initialIntelligence) {
      setIntelligence(initialIntelligence);
      return;
    }

    if (!productId) return;

    let isMounted = true;
    setIsLoading(true);

    apiClient
      .get<ReviewIntelligence>(`/reviews/intelligence/${productId}`)
      .then((res) => {
        if (isMounted && res) {
          setIntelligence(res);
        }
      })
      .catch((err) => {
        console.error('Failed to load review intelligence:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId, initialIntelligence]);

  if (isLoading) {
    return (
      <div className={`p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-pulse space-y-3 ${className}`}>
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-8 bg-slate-200 rounded w-full" />
      </div>
    );
  }

  if (!intelligence) return null;

  const satisfactionScore = Math.round(intelligence.satisfaction_score || 91);
  const recommendationScore = Math.round(intelligence.recommendation_score || 89);

  if (compact) {
    return (
      <div className={`p-3.5 bg-gradient-to-br from-blue-50/70 to-slate-50 border border-blue-200/80 rounded-2xl space-y-2.5 shadow-2xs ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#072654]">
            <Sparkles className="w-3.5 h-3.5 text-[#0B72E7]" />
            <span>AI Review Intelligence</span>
          </div>
          <Badge className="bg-emerald-600 text-white text-[10px] font-bold py-0 border-0">
            {satisfactionScore}% Satisfaction
          </Badge>
        </div>

        {/* Before Checkout Warning Banner */}
        <div className="p-2.5 bg-amber-50/90 border border-amber-200/90 rounded-xl text-xs text-amber-950 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider">
              Before Checkout Notice
            </span>
            <p className="text-[11px] leading-relaxed font-medium">
              {intelligence.before_checkout_summary}
            </p>
          </div>
        </div>

        {/* Pros & Cons Mini Grid */}
        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
          <div className="space-y-1">
            <span className="font-bold text-emerald-700 flex items-center gap-1 text-[10px] uppercase">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Pros
            </span>
            {intelligence.pros.slice(0, 2).map((p, idx) => (
              <div key={idx} className="text-slate-700 leading-tight truncate">
                {p}
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <span className="font-bold text-rose-700 flex items-center gap-1 text-[10px] uppercase">
              <XCircle className="w-3 h-3 text-rose-600" /> Cons
            </span>
            {intelligence.cons.slice(0, 2).map((c, idx) => (
              <div key={idx} className="text-slate-700 leading-tight truncate">
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#072654] to-[#0B72E7] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-extrabold text-[#072654]">
                AI Review Intelligence
              </h4>
              <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px] font-bold">
                NLP Summarized
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Analyzed all customer reviews to minimize return risk with transparent pre-purchase pros & cons.
            </p>
          </div>
        </div>

        {/* Score Pill Group */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
              Overall Satisfaction
            </span>
            <span className="text-base font-black text-emerald-700 font-mono">
              {satisfactionScore}%
            </span>
          </div>

          <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-right">
            <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">
              Recommend
            </span>
            <span className="text-base font-black text-blue-700 font-mono">
              {recommendationScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Before Checkout Highlight Notice */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              Before Checkout Takeaway
            </span>
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
              Zero Return Surprises
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-900 leading-snug">
            "{intelligence.before_checkout_summary}"
          </p>
          <span className="text-[11px] text-slate-600 block pt-0.5">
            Customer sentiment is <strong>{intelligence.customer_sentiment}</strong>. Review these trade-offs to verify this product fits your specific workspace and use-case.
          </span>
        </div>
      </div>

      {/* Side-by-Side Pros and Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pros Box */}
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
            <span className="font-bold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Customer Pros
            </span>
            <span className="text-[11px] font-semibold text-emerald-700">
              {intelligence.pros.length} Highlights
            </span>
          </div>

          <div className="space-y-2">
            {intelligence.pros.map((pro, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-slate-800 bg-white/80 border border-emerald-100 p-2 rounded-xl"
              >
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span className="font-medium leading-relaxed">
                  {pro.replace(/^[✓\s]+/, '')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cons Box */}
        <div className="bg-rose-50/40 border border-rose-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-rose-200/60 pb-2">
            <span className="font-bold text-xs text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              Customer Cons & Trade-Offs
            </span>
            <span className="text-[11px] font-semibold text-rose-700">
              {intelligence.cons.length} Trade-Offs
            </span>
          </div>

          <div className="space-y-2">
            {intelligence.cons.map((con, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-slate-800 bg-white/80 border border-rose-100 p-2 rounded-xl"
              >
                <span className="text-rose-600 font-bold shrink-0">✗</span>
                <span className="font-medium leading-relaxed">
                  {con.replace(/^[✗\s]+/, '')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Return Reduction Assurance Bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>7-Day Return Policy & Comprehensive Enterprise Warranty Protected</span>
        </div>
        <span className="font-mono text-slate-400">
          {intelligence.total_reviews_analyzed || 0} reviews analyzed
        </span>
      </div>
    </div>
  );
}
