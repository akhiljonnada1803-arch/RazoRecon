'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Lock, 
  Sparkles, 
  Radio, 
  TrendingUp, 
  ShieldAlert, 
  ArrowRight,
  Layers,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const CAPABILITY_MODULES = [
  {
    id: 'demo',
    title: '1-Click Demo Suite',
    tag: 'Judges Showcase',
    tagClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    description: 'Instant multi-channel dataset generator. Synthesizes 100 Invoices, 100 Settlements & 100 Transactions with injected failure modes.',
    icon: Zap,
    href: '/demo',
    accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    glow: 'hover:border-amber-500/40',
    bullets: [
      '100 Invoices + 100 Settlements + 100 Txns',
      'Injected GST differences & duplicate charges',
      'Zero manual CSV uploads required',
    ],
    cta: 'Generate Demo Scenario',
  },
  {
    id: 'close',
    title: 'Month-End Close Agent',
    tag: 'Autonomous',
    tagClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: 'Self-driving 7-step accounting close workflow. Orchestrates deterministic reconciliation, control scoring & downloadable signed audit packs.',
    icon: Lock,
    href: '/month-close',
    accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    glow: 'hover:border-emerald-500/40',
    bullets: [
      'Sequential 7-step autonomous execution',
      'Execution duration telemetry logs',
      'Printable & signed PDF audit pack',
    ],
    cta: 'Run Autonomous Close',
  },
  {
    id: 'copilot',
    title: 'CFO AI Copilot',
    tag: 'Streaming ReAct',
    tagClass: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    description: 'Conversational executive intelligence interface with token streaming, live Python tool execution traces, and 148-passage GAAP citations.',
    icon: Sparkles,
    href: '/copilot',
    accent: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    glow: 'hover:border-violet-500/40',
    bullets: [
      'ChatGPT-style Server-Sent Events stream',
      'Live tool audit trail (args & outputs)',
      '148-passage accounting rule grounding',
    ],
    cta: 'Talk to CFO Copilot',
  },
  {
    id: 'fraud',
    title: 'Fraud Detection Sentinel',
    tag: 'Continuous Risk',
    tagClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    description: 'Real-time financial risk engine intercepting duplicate debits within 24h, >3x baseline volume spikes, and unvouched wire transfers.',
    icon: Radio,
    href: '/fraud',
    accent: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    glow: 'hover:border-rose-500/40',
    bullets: [
      'Duplicate debit & invoice interception',
      '>3x category average anomaly detection',
      'One-click payout freeze & block actions',
    ],
    cta: 'Open Fraud Sentinel',
  },
  {
    id: 'forecast',
    title: 'Cash Forecasting Module',
    tag: '90D Runway',
    tagClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    description: 'Predictive 7D, 30D, and 90D moving average cash trajectories with upper & lower 95% confidence intervals and runway modeling.',
    icon: TrendingUp,
    href: '/forecast',
    accent: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    glow: 'hover:border-blue-500/40',
    bullets: [
      'Expected inflows, outflows & net positions',
      '45-day interactive confidence cone graph',
      'Treasury working capital optimization tags',
    ],
    cta: 'View Cash Trajectory',
  },
  {
    id: 'exceptions',
    title: 'Exception Intelligence',
    tag: 'Forensic Diagnosis',
    tagClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    description: 'Forensic diagnosis for every reconciliation mismatch, providing root cause analysis, business impact, confidence score, and one-click resolution.',
    icon: ShieldAlert,
    href: '/exceptions',
    accent: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    glow: 'hover:border-cyan-500/40',
    bullets: [
      'Amazon rolling reserves & GST tax differences',
      'Slide-out forensic audit drawer with evidence',
      'One-click "Apply Recommended Action"',
    ],
    cta: 'Diagnose Exceptions',
  },
];

export const MissionControlFeatureGrid: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#1E293B] pb-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-400" />
            Mission Control Operating Modules
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Launch any autonomous financial engine or explore the deterministic ledger
          </p>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono border-slate-700 text-slate-400">
          6 Active Modules
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CAPABILITY_MODULES.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
            >
              <Card className={`relative h-full flex flex-col justify-between overflow-hidden border border-[#1E293B] bg-[#111827]/70 backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl ${m.glow}`}>
                <CardHeader className="p-5 pb-3 border-b border-[#1E293B]/70">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg border ${m.accent}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-sm font-bold text-white tracking-tight">
                        {m.title}
                      </CardTitle>
                    </div>

                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 font-mono font-semibold ${m.tagClass}`}>
                      {m.tag}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {m.description}
                  </p>
                </CardHeader>

                <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {m.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-3 border-t border-[#1E293B]/70">
                    <Link href={m.href} className="block w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between text-xs h-8.5 rounded-lg bg-[#0B1020]/80 border-[#1E293B] hover:border-[#334155] hover:bg-[#1E293B] text-slate-200 font-semibold group"
                      >
                        <span>{m.cta}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-blue-400 transform group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
