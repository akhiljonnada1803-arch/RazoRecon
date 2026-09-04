'use client';

import React from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  CheckCircle2 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GrowthStrategyHeroProps {
  strategyRationale: string;
  healthScore: number;
}

export function GrowthStrategyHero({
  strategyRationale,
  healthScore,
}: GrowthStrategyHeroProps) {
  return (
    <div className="bg-gradient-to-br from-[#072654] via-[#0B3B7A] to-[#0B72E7] text-white p-6 sm:p-7 rounded-3xl shadow-md space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">
                Autonomous Revenue Growth Playbook
              </h2>
              <Badge className="bg-emerald-500 text-white text-[10px] font-bold border-0">
                ACTIVE SENTINEL
              </Badge>
            </div>
            <p className="text-xs text-blue-100/80">
              Continuous AOV expansion, probability-weighted upsells & basket affinity optimization
            </p>
          </div>
        </div>

        {/* Growth Health Score Gauge */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs px-4 py-2 rounded-2xl border border-white/15">
          <div>
            <span className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider block">
              Basket Health
            </span>
            <div className="text-xl font-extrabold text-white">
              {healthScore} <span className="text-xs font-normal text-blue-200">/ 100</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-full border-3 border-emerald-400 border-t-transparent flex items-center justify-center text-emerald-300 font-bold text-xs">
            {healthScore}%
          </div>
        </div>
      </div>

      {/* Rationale Text */}
      <div className="p-4 bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl text-xs sm:text-sm text-blue-50 leading-relaxed font-normal">
        <div className="flex items-center gap-1.5 font-bold text-emerald-300 mb-1 text-xs uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Growth Strategy Recommendation</span>
        </div>
        {strategyRationale}
      </div>
    </div>
  );
}
