'use client';

import React from 'react';
import { 
  Search, 
  MessageSquareQuote, 
  ShoppingCart, 
  CreditCard, 
  CheckCircle2, 
  BookOpenCheck,
  Check,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { A2ASimulationStep } from '@/types/agent_commerce';

interface A2ATimelineProps {
  steps: A2ASimulationStep[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
}

const STEP_ICONS = [
  Search,
  MessageSquareQuote,
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  BookOpenCheck
];

export function A2ATimeline({
  steps,
  currentStepIndex,
  onSelectStep
}: A2ATimelineProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#072654]">Agent-to-Agent Workflow Timeline</h2>
            <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px] font-mono">
              6-Phase Autonomous Pipeline
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500">
            Click on any phase to inspect the cryptographic state, autonomous dialogue, and ledger vouchers.
          </p>
        </div>

        <div className="text-xs font-mono font-bold text-slate-400">
          Step {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}
        </div>
      </div>

      {/* Horizontal Step Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 pt-1">
        {steps.map((step, idx) => {
          const Icon = STEP_ICONS[idx] || Check;
          const isCompleted = idx < currentStepIndex || step.status === 'completed';
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex && step.status !== 'completed';

          return (
            <button
              key={step.step_id}
              onClick={() => onSelectStep(idx)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isCurrent
                  ? 'border-[#0B72E7] bg-blue-50/70 shadow-2xs ring-2 ring-[#0B72E7]/20'
                  : isCompleted
                  ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/80'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 opacity-70'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                    isCurrent
                      ? 'bg-[#0B72E7] text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>

                  <span className={`text-[10px] font-mono font-bold ${
                    isCurrent ? 'text-[#0B72E7]' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    0{step.step_number}
                  </span>
                </div>

                <div>
                  <h4 className={`text-xs font-bold leading-tight ${
                    isCurrent ? 'text-[#072654]' : isCompleted ? 'text-slate-800' : 'text-slate-500'
                  }`}>
                    {step.title.split('. ')[1] || step.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                    {step.duration_ms}ms
                  </span>
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-200/60">
                {isCompleted ? (
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.2 rounded inline-flex items-center gap-1">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    Completed
                  </span>
                ) : isCurrent ? (
                  <span className="text-[9px] font-bold text-[#0B72E7] bg-blue-100 px-1.5 py-0.2 rounded inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0B72E7] animate-ping" />
                    Active Phase
                  </span>
                ) : (
                  <span className="text-[9px] font-medium text-slate-400">
                    Pending
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
