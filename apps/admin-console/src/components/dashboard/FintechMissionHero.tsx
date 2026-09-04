'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Activity, 
  Terminal,
  Cpu,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const FintechMissionHero: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1E293B] bg-[#111827]/70 backdrop-blur-xl p-8 sm:p-10 shadow-2xl">
      {/* Subtle background glow accents */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6 max-w-4xl">
        {/* Top telemetry tags */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>Autonomous FinOps OS</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>Zero Arithmetic Drift Verified</span>
          </div>
        </div>

        {/* Large Bold Headline */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            The Autonomous Operating System for High-Velocity Finance.
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl font-normal leading-relaxed">
            Eliminate manual spreadsheets and reconciliation drift. RazorRecon pairs pure Python deterministic math engines with 148 GAAP policy agents to close your books continuously.
          </p>
        </div>

        {/* Primary Interactive Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-3">
          <Link href="/demo">
            <Button className="h-11 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25 active:scale-95 transition-all gap-2">
              <Zap className="h-4 w-4 fill-white" />
              <span>Launch 1-Click Demo Suite</span>
            </Button>
          </Link>

          <Link href="/month-close">
            <Button variant="outline" className="h-11 px-5 rounded-xl text-sm font-semibold border-[#334155] bg-[#1E293B]/60 text-slate-200 hover:text-white hover:bg-[#334155] gap-2 transition-all">
              <Lock className="h-4 w-4 text-emerald-400" />
              <span>Autonomous Month-End Close</span>
            </Button>
          </Link>

          <Link href="/copilot">
            <Button variant="ghost" className="h-11 px-4 text-sm font-semibold text-slate-400 hover:text-white gap-1.5">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span>CFO AI Copilot</span>
              <ArrowRight className="h-3.5 w-3.5 ml-0.5 text-slate-500" />
            </Button>
          </Link>
        </div>

        {/* System Architecture Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#1E293B]/80 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono">
            <Cpu className="h-4 w-4 text-blue-400 shrink-0" />
            <span>Deterministic Netting Engine</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-mono">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>148 Policy RAG Rules</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-mono">
            <Activity className="h-4 w-4 text-violet-400 shrink-0" />
            <span>Realtime Risk Sentinel</span>
          </div>
        </div>
      </div>
    </div>
  );
};
