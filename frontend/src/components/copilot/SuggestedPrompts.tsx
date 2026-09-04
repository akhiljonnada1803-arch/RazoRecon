'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  GitCompare, 
  ShieldAlert, 
  TrendingUp, 
  FileWarning, 
  ShieldCheck, 
  Sparkles,
  Building2,
  Clock,
  SearchCheck,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

const PROMPT_CARDS = [
  {
    icon: ShieldAlert,
    prompt: 'Which vendors are highest risk?',
    subtitle: 'Score-based counterparty ranking (ABC Logistics & Alpha Tech)',
    color: 'text-rose-600 bg-rose-50 hover:border-rose-300',
  },
  {
    icon: FileWarning,
    prompt: 'Which vendor generates the most exceptions?',
    subtitle: 'Historical exception volume & recurring patterns',
    color: 'text-amber-600 bg-amber-50 hover:border-amber-300',
  },
  {
    icon: TrendingUp,
    prompt: 'Show vendors with increasing risk.',
    subtitle: 'Track risk trajectories & +14% month-over-month increases',
    color: 'text-blue-600 bg-blue-50 hover:border-blue-300',
  },
  {
    icon: Clock,
    prompt: 'Which vendor has recurring settlement issues?',
    subtitle: 'Analyze carrier freight timing lags & Amazon rolling reserves',
    color: 'text-purple-600 bg-purple-50 hover:border-purple-300',
  },
  {
    icon: SearchCheck,
    prompt: 'Which vendor should be audited?',
    subtitle: 'Prioritized audit targets with SAC code & invoice playbooks',
    color: 'text-indigo-600 bg-indigo-50 hover:border-indigo-300',
  },
  {
    icon: Sparkles,
    prompt: 'What will my cash position be next month?',
    subtitle: 'Predictive 30-day forecast (+14.8% growth projection)',
    color: 'text-emerald-600 bg-emerald-50 hover:border-emerald-300',
  },
];

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  onSelectPrompt,
  disabled,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 my-3">
      {PROMPT_CARDS.map((p, idx) => {
        const Icon = p.icon;
        return (
          <motion.button
            key={p.prompt}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.04 }}
            disabled={disabled}
            onClick={() => onSelectPrompt(p.prompt)}
            className={`text-left p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 transition-all flex flex-col justify-between space-y-1.5 shadow-xs group disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg border ${p.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#0B72E7] transition-colors leading-tight">
                {p.prompt}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug pl-0.5">
              {p.subtitle}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
};
