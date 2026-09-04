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
  Workflow,
  Sparkles,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PIPELINE_NODES = [
  {
    id: 'ingest',
    stage: '01. Ingestion',
    title: 'Multi-Channel Feeds',
    desc: 'Operating bank feed, Shopify DTC, Amazon Marketplace & Stripe settlements.',
    icon: Database,
    accent: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    dot: 'bg-blue-400',
  },
  {
    id: 'rag',
    stage: '02. Categorization',
    title: '148 GAAP Policy RAG',
    desc: 'Few-shot semantic memory + deterministic chart-of-accounts classification.',
    icon: Layers,
    accent: 'border-violet-500/30 text-violet-400 bg-violet-500/10',
    dot: 'bg-violet-400',
  },
  {
    id: 'recon',
    stage: '03. Reconciliation',
    title: 'Deterministic Netting',
    desc: 'Exact gross-to-net matching, fee subtraction & Amazon reserve tracking.',
    icon: GitCompare,
    accent: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    dot: 'bg-emerald-400',
  },
  {
    id: 'fraud',
    stage: '04. Risk Sentinel',
    title: 'Fraud Surveillance',
    desc: 'Real-time intercept of duplicate debits, >3x velocity spikes & rogue wires.',
    icon: Radio,
    accent: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
    dot: 'bg-rose-400',
  },
  {
    id: 'forecast',
    stage: '05. Treasury',
    title: 'Cash Forecasting',
    desc: '7D, 30D, and 90D moving average cash trajectories with 95% confidence cones.',
    icon: TrendingUp,
    accent: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    dot: 'bg-amber-400',
  },
  {
    id: 'close',
    stage: '06. Certification',
    title: 'Autonomous Close',
    desc: '7-step self-driving close pipeline & verifiable signed PDF audit pack.',
    icon: Lock,
    accent: 'border-primary/40 text-primary bg-primary/10',
    dot: 'bg-primary',
  },
];

export const InteractiveWorkflowGraph: React.FC = () => {
  return (
    <Card className="border border-[#1E293B] bg-[#111827]/70 backdrop-blur-xl shadow-xl overflow-hidden">
      <CardHeader className="p-6 pb-4 border-b border-[#1E293B] flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Workflow className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-white tracking-tight">
              Autonomous Financial Data Pipeline
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic state machine connecting raw bank feeds to certified period close
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Continuous Execution</span>
        </Badge>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {PIPELINE_NODES.map((node, idx) => {
            const Icon = node.icon;
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group relative rounded-xl border border-[#1E293B] bg-[#0B1020]/60 p-4 flex flex-col justify-between space-y-3 hover:border-[#334155] hover:bg-[#0B1020] transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {node.stage}
                    </span>
                    <div className={`p-1.5 rounded-lg border ${node.accent}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">
                      {node.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      {node.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1E293B]/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${node.dot}`} />
                    <span>Active</span>
                  </span>
                  <span className="text-slate-400 group-hover:text-blue-400 transition-colors">
                    Step {idx + 1} →
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
