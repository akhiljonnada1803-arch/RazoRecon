'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Lock, 
  Sparkles, 
  Radio, 
  TrendingUp, 
  Layers, 
  GitCompare, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const WORKSTATION_MODULES = [
  {
    title: 'Autonomous Month-End Close',
    desc: '7-step sequential close workflow with signed PDF audit packs.',
    href: '/month-close',
    icon: Lock,
    badge: 'Ready to Close',
  },
  {
    title: 'CFO AI Copilot',
    desc: 'Streaming natural language intelligence with live Python tool execution traces.',
    href: '/copilot',
    icon: Sparkles,
    badge: '148 GAAP Policies',
  },
  {
    title: 'Fraud Detection Sentinel',
    desc: 'Real-time intercept of duplicate debits and >3x category volume spikes.',
    href: '/fraud',
    icon: Radio,
    badge: 'Continuous Scan',
  },
  {
    title: 'Cash Flow Forecasting',
    desc: 'Predictive 7D, 30D, and 90D moving average liquidity projections.',
    href: '/forecast',
    icon: TrendingUp,
    badge: '90D Horizons',
  },
  {
    title: 'Categorization Ledger',
    desc: 'RAG-grounded transaction categorization with confidence meters.',
    href: '/categorization',
    icon: Layers,
    badge: '94% Auto-Posted',
  },
  {
    title: 'Deterministic Reconciliation',
    desc: 'Penny-exact deposit-to-payout netting and reserve tracking.',
    href: '/reconciliation',
    icon: GitCompare,
    badge: 'Zero Math Error',
  },
];

export const WorkstationQuickLaunch: React.FC = () => {
  return (
    <Card className="border border-border/80 bg-card shadow-sm">
      <CardHeader className="p-4 pb-3 border-b border-border/60">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Specialized Finance Operations Modules
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {WORKSTATION_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.title} href={mod.href} className="group">
                <div className="h-full rounded-lg border border-border/70 p-3.5 bg-muted/20 hover:bg-muted/50 hover:border-primary/40 transition-all flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {mod.badge}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors mt-2">
                      {mod.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {mod.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-primary font-medium">
                    <span>Open Module</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
