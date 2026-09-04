'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const AGENT_ACTIVITY_EVENTS = [
  {
    id: 'act-1',
    timestamp: '2 mins ago',
    module: 'Month-End Close',
    title: 'Autonomous Close Workflow Completed',
    detail: 'All 7 execution steps verified with 100% policy citation coverage. Audit Pack AP-2026 sealed.',
    impact: 'Certified Closed',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: Lock,
    href: '/month-close',
  },
  {
    id: 'act-2',
    timestamp: '8 mins ago',
    module: 'Fraud Sentinel',
    title: 'Duplicate AWS Infrastructure Debit Intercepted',
    detail: 'Duplicate charge of ₹12,500.00 detected within 3h of primary billing. Automatic bank recall initiated.',
    impact: '₹12,500 Saved',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    icon: ShieldAlert,
    href: '/fraud',
  },
  {
    id: 'act-3',
    timestamp: '14 mins ago',
    module: 'Reconciliation',
    title: 'Multi-Channel Settlement Batch Netting',
    detail: 'Matched Shopify, Stripe & Amazon deposits against gross payouts with zero penny arithmetic error.',
    impact: '89.2% Auto-Match',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: ShieldCheck,
    href: '/reconciliation',
  },
  {
    id: 'act-4',
    timestamp: '22 mins ago',
    module: 'Cash Forecast',
    title: '90-Day Liquidity Extrapolation Updated',
    detail: 'Paced direct channel acceleration; 30-day closing cash projected to improve by +14.8%.',
    impact: '+14.8% Projected',
    badgeClass: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    icon: TrendingUp,
    href: '/forecast',
  },
];

export const AIActivityFeed: React.FC = () => {
  return (
    <Card className="border border-[#1E293B] bg-[#111827]/70 backdrop-blur-xl shadow-xl">
      <CardHeader className="p-6 pb-4 border-b border-[#1E293B] flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-white tracking-tight">
              Live AI Sentinel Activity Feed
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time audit log of autonomous decisions, fraud interceptions & policy citations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono text-slate-400">Stream Connected</span>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-3">
        {AGENT_ACTIVITY_EVENTS.map((evt, idx) => {
          const Icon = evt.icon;
          return (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#1E293B] bg-[#0B1020]/60 hover:bg-[#0B1020] hover:border-[#334155] transition-all"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#111827] border border-[#1E293B] text-slate-300 shrink-0 mt-0.5 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {evt.title}
                    </span>
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 font-mono font-semibold ${evt.badgeClass}`}>
                      {evt.module}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {evt.detail}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1E293B]">
                <span className="text-xs font-bold font-mono text-emerald-400">
                  {evt.impact}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>{evt.timestamp}</span>
                  <Link href={evt.href} className="text-blue-400 hover:text-blue-300 font-sans flex items-center gap-0.5">
                    <span>Inspect</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
};
