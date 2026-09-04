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
  ExternalLink
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const FEATURE_CARDS = [
  {
    id: 'demo-mode',
    title: 'Demo Mode (1-Click)',
    badge: 'Judges Showcase',
    badgeVariant: 'outline' as const,
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    description: 'Instantly generate 100 Invoices, 100 Settlements, and 100 Transactions with injected tax mismatches, duplicate debits, and reserve withholding failure modes.',
    icon: Zap,
    href: '/demo',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/50',
    accentGrad: 'from-amber-500/20 to-orange-500/5',
    capabilities: [
      '100 Invoices + 100 Settlements + 100 Txns',
      'Injected GST differences & duplicate payments',
      'Instant cross-platform state hydration',
    ],
    cta: 'Generate Demo Scenario',
  },
  {
    id: 'month-close',
    title: 'Month-End Close Agent',
    badge: 'Autonomous',
    badgeVariant: 'outline' as const,
    badgeClass: 'bg-primary/10 text-primary border-primary/30',
    description: 'Self-driving 7-step month-end closing pipeline. Orchestrates reconciliation, controls health scoring, fraud sentinel scan, P&L aggregation, and downloadable signed audit packs.',
    icon: Lock,
    href: '/month-close',
    color: 'text-primary bg-primary/10 border-primary/20 hover:border-primary/50',
    accentGrad: 'from-primary/20 to-indigo-500/5',
    capabilities: [
      '7-Step autonomous self-driving execution',
      'Live progress bar with execution duration logs',
      'Downloadable & printable PDF audit certificate',
    ],
    cta: 'Open Month-End Close',
  },
  {
    id: 'cfo-copilot',
    title: 'CFO AI Copilot',
    badge: 'Streaming ReAct',
    badgeVariant: 'outline' as const,
    badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    description: 'Conversational executive intelligence interface with Server-Sent Events (SSE) streaming, policy rule grounding from the 148-passage KB, and collapsible tool execution traces.',
    icon: Sparkles,
    href: '/copilot',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50',
    accentGrad: 'from-emerald-500/20 to-teal-500/5',
    capabilities: [
      'ChatGPT-style streaming response generation',
      'Live tool audit trail (exact Python args & results)',
      '148-passage accounting policy rule citations',
    ],
    cta: 'Chat with Copilot',
  },
  {
    id: 'fraud-detection',
    title: 'Fraud Detection Center',
    badge: 'Risk Sentinel',
    badgeVariant: 'outline' as const,
    badgeClass: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
    description: 'Continuous surveillance engine detecting duplicate debit memos, >3x velocity spikes against category baselines, unregistered vendor wires, and repeated settlement holds.',
    icon: Radio,
    href: '/fraud',
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20 hover:border-rose-500/50',
    accentGrad: 'from-rose-500/20 to-red-500/5',
    capabilities: [
      'Automated duplicate invoice & debit detection',
      'Statistical z-score outlier monitoring (>3x average)',
      'Single-click debit block & wire freeze actions',
    ],
    cta: 'Inspect Fraud Sentinel',
  },
  {
    id: 'cash-forecasting',
    title: 'Cash Forecasting Module',
    badge: '7D · 30D · 90D',
    badgeVariant: 'outline' as const,
    badgeClass: 'bg-violet-500/10 text-violet-600 border-violet-500/30',
    description: 'Multi-horizon moving average cash trajectory modeling with upper & lower 95% confidence intervals, runway estimation, and executive CFO takeaway synthesis.',
    icon: TrendingUp,
    href: '/forecast',
    color: 'text-violet-500 bg-violet-500/10 border-violet-500/20 hover:border-violet-500/50',
    accentGrad: 'from-violet-500/20 to-purple-500/5',
    capabilities: [
      'Multi-horizon expected inflows vs outflows',
      '45-day interactive confidence cone chart',
      'Stress risk indicators (payroll & reserve lags)',
    ],
    cta: 'View Cash Projections',
  },
  {
    id: 'exception-intelligence',
    title: 'Exception Intelligence Agent',
    badge: 'Forensic Diagnosis',
    badgeVariant: 'outline' as const,
    badgeClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    description: 'Deep investigative engine that examines every mismatch, generating verified root cause, business impact, recommended operator action, confidence meter, and audit evidence.',
    icon: ShieldAlert,
    href: '/exceptions',
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50',
    accentGrad: 'from-blue-500/20 to-cyan-500/5',
    capabilities: [
      'Supported: Tax Mismatch, Reserve Hold, Duplicate Debit',
      'Slide-out forensic audit drawer with evidence logs',
      'One-click "Apply Recommended Action & Resolve"',
    ],
    cta: 'Diagnose Exceptions',
  },
];

export const FeatureCapabilityGrid: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/50 pb-3">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Core Platform Capabilities & Interactive Modules
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select any module to inspect real-time deterministic calculations or launch the demo dataset
          </p>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          6 Active Modules
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURE_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
            >
              <Card
                className={`relative h-full flex flex-col justify-between overflow-hidden border border-border/70 bg-card/70 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-lg ${card.color}`}
              >
                {/* Ambient top gradient */}
                <div
                  className={`absolute top-0 right-0 -mt-6 -mr-6 h-28 w-28 rounded-full bg-gradient-to-br ${card.accentGrad} opacity-60 blur-2xl pointer-events-none`}
                />

                <CardHeader className="pb-3 border-b border-border/40">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg border ${card.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-sm font-bold tracking-tight">
                        {card.title}
                      </CardTitle>
                    </div>

                    <Badge
                      variant={card.badgeVariant}
                      className={`text-[10px] px-2 py-0 h-4 font-mono font-semibold ${card.badgeClass}`}
                    >
                      {card.badge}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {card.description}
                  </p>
                </CardHeader>

                <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Key Capabilities
                    </span>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {card.capabilities.map((cap, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-border/40">
                    <Link href={card.href} className="block w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between text-xs h-8 bg-background/70 hover:bg-muted font-semibold group"
                      >
                        <span>{card.cta}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-primary transform group-hover:translate-x-1 transition-transform" />
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
