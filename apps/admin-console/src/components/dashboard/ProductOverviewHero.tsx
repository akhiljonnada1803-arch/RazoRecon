'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Database,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ProductOverviewHero: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-muted/40 p-6 md:p-8 shadow-sm backdrop-blur-md">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-2.5 py-0.5 font-medium flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Autonomous FinOps & Accounting Intelligence
          </Badge>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs px-2.5 py-0.5 font-mono">
            Zero Arithmetic Drift Enforced
          </Badge>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Next-Generation Financial Reconciliation & Autonomous Month-End Close
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
            A unified financial operations platform pairing <strong>deterministic Python math engines</strong> for penny-exact netting with <strong>RAG-grounded LLMs</strong> for policy compliance, fraud interception, and predictive cash forecasting.
          </p>
        </div>

        {/* Value pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/60">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground block font-semibold">Deterministic Accuracy</strong>
              <span className="text-muted-foreground text-[11px]">Exact gross-to-net calculations without LLM hallucinations.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/60">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground block font-semibold">148-Passage Policy RAG</strong>
              <span className="text-muted-foreground text-[11px]">Every accounting categorization cites authoritative GAAP standards.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/60">
            <Lock className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground block font-semibold">Autonomous Month-Close</strong>
              <span className="text-muted-foreground text-[11px]">Self-driving 7-step close pipeline with certified audit packs.</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link href="/demo">
            <Button className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold shadow-md active:scale-95 transition-transform h-10 px-5">
              <Zap className="h-4 w-4 fill-white" />
              Launch Demo Mode (1-Click)
            </Button>
          </Link>

          <Link href="/copilot">
            <Button variant="outline" className="gap-2 h-10 px-5 bg-card/60 backdrop-blur-sm border-border/80 hover:bg-muted font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              Talk to CFO Copilot
            </Button>
          </Link>

          <Link href="/month-close">
            <Button variant="ghost" className="gap-1.5 h-10 px-4 text-muted-foreground hover:text-foreground text-xs">
              <span>View Month-End Close</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
