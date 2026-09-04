'use client';

import React from 'react';
import { HeroStepData } from '@/types/hero_demo';
import { 
  Upload, 
  BrainCircuit, 
  MessageSquare, 
  Sparkles, 
  ShoppingCart, 
  CreditCard, 
  CheckCircle2, 
  TrendingUp, 
  Database, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeroTimelineStepperProps {
  currentStep: number;
  steps: HeroStepData[];
  onSelectStep: (stepNumber: number) => void;
}

const STEP_ICONS = [
  Upload,          // 1. Upload
  BrainCircuit,    // 2. AI Understands
  MessageSquare,   // 3. Customer Asks
  Sparkles,        // 4. Agent Recommends
  ShoppingCart,    // 5. Agent Creates Cart
  CreditCard,      // 6. Razorpay Checkout
  CheckCircle2,    // 7. Payment Success & Reconciled
  TrendingUp,      // 8. Upsell Recommendations
  Database,        // 9. Stored in Memory
  Compass          // 10. Future Personalized
];

const STEP_SHORT_TITLES = [
  '1. Upload Catalog',
  '2. AI Embeddings',
  '3. Customer Ask',
  '4. Recommendations',
  '5. Cart Assembly',
  '6. Razorpay Order',
  '7. Reconciled Pay',
  '8. Revenue Upsell',
  '9. Memory Dossier',
  '10. Future Quote'
];

export function HeroTimelineStepper({
  currentStep,
  steps,
  onSelectStep,
}: HeroTimelineStepperProps) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Autonomous AI Commerce Workflow
            </span>
            <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px] font-bold">
              10-Phase Pipeline
            </Badge>
          </div>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Phase {currentStep} of 10: <span className="text-[#0B72E7]">{STEP_SHORT_TITLES[currentStep - 1]}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-28 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              style={{ width: `${(currentStep / 10) * 100}%` }}
              className="bg-gradient-to-r from-[#0B72E7] to-emerald-500 h-full rounded-full transition-all duration-500"
            />
          </div>
          <span className="text-xs font-mono font-bold text-slate-700">
            {Math.round((currentStep / 10) * 100)}%
          </span>
        </div>
      </div>

      {/* 10-Step Horizontal Timeline Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((stepNum) => {
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const Icon = STEP_ICONS[stepNum - 1];
          const shortTitle = STEP_SHORT_TITLES[stepNum - 1];

          return (
            <button
              key={stepNum}
              onClick={() => onSelectStep(stepNum)}
              className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-20 group ${
                isCurrent
                  ? 'bg-blue-50 border-[#0B72E7] shadow-sm ring-2 ring-[#0B72E7]/20'
                  : isCompleted
                  ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                  : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105 ${
                    isCurrent
                      ? 'bg-[#0B72E7] text-white shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    isCurrent
                      ? 'text-[#0B72E7]'
                      : isCompleted
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  #{stepNum}
                </span>
              </div>

              <span
                className={`text-[10px] font-bold leading-tight block line-clamp-2 ${
                  isCurrent
                    ? 'text-[#072654]'
                    : isCompleted
                    ? 'text-slate-800'
                    : 'text-slate-500'
                }`}
              >
                {shortTitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
