'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Layers, 
  GitCompare, 
  Radio, 
  TrendingUp, 
  Lock, 
  ArrowRight,
  Workflow
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const WORKFLOW_STEPS = [
  {
    step: 1,
    title: 'Multi-Feed Ingestion',
    subtitle: 'Bank Feeds & Gateways',
    description: 'Ingests operating debits, Shopify DTC, Amazon Marketplace & Stripe settlement files.',
    icon: Database,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  },
  {
    step: 2,
    title: 'Policy RAG Grounding',
    subtitle: '148-Passage Knowledge Base',
    description: 'Classifies expenses with few-shot memory and exact GAAP policy citations.',
    icon: Layers,
    color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
  },
  {
    step: 3,
    title: 'Deterministic Netting',
    subtitle: 'Penny-Exact Reconciliation',
    description: 'Pure Python arithmetic matches deposits to gross payouts, netting fees and reserves.',
    icon: GitCompare,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    step: 4,
    title: 'Fraud & Risk Sentinel',
    subtitle: 'Continuous Anomaly Scan',
    description: 'Intercepts duplicate debits, >3x velocity spikes, and rogue wire requests in real time.',
    icon: Radio,
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  },
  {
    step: 5,
    title: 'Treasury Forecasting',
    subtitle: '7D · 30D · 90D Horizons',
    description: 'Extrapolates moving average runway projections and dynamic working capital buffers.',
    icon: TrendingUp,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  {
    step: 6,
    title: 'Autonomous Close',
    subtitle: 'Certified Audit Pack',
    description: 'Executes 7-step close pipeline, synthesizes CFO takeaways, and seals period books.',
    icon: Lock,
    color: 'text-primary bg-primary/10 border-primary/20',
  },
];

export const WorkflowPipelineVisualizer: React.FC = () => {
  return (
    <Card className="border border-border/70 bg-card/70 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <Workflow className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Autonomous FinOps Pipeline Architecture</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              End-to-end data lifecycle from raw multi-channel feeds to verified, sealed books
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20 font-mono">
          Continuous Engine
        </Badge>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 relative">
          {WORKFLOW_STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="relative rounded-xl border border-border/60 bg-muted/25 p-3.5 flex flex-col justify-between space-y-3 hover:bg-muted/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 rounded-lg border ${s.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold font-mono text-muted-foreground">
                      0{s.step}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-foreground">
                      {s.title}
                    </h3>
                    <span className="text-[10px] text-primary font-medium block">
                      {s.subtitle}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {s.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Verified Deterministic</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
