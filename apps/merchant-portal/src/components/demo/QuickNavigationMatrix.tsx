'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  GitCompare, 
  TrendingUp, 
  Radio, 
  ShieldCheck, 
  Lock,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const QuickNavigationMatrix: React.FC = () => {
  const links = [
    {
      href: '/reconciliation',
      title: '1. Reconciliation Engine',
      description: 'See 100 settlements matched to deposits with gross-vs-net arithmetic & penny discrepancy tracking.',
      icon: GitCompare,
      badge: 'Deterministic',
      color: 'text-violet-500 bg-violet-500/10 hover:border-violet-500/40',
    },
    {
      href: '/forecast',
      title: '2. Cash Forecasting',
      description: 'Inspect 7D, 30D, and 90D cash trajectories modeled from synthetic invoices and settlement velocity.',
      icon: TrendingUp,
      badge: 'Moving Average',
      color: 'text-emerald-500 bg-emerald-500/10 hover:border-emerald-500/40',
    },
    {
      href: '/fraud',
      title: '3. Fraud Detection Center',
      description: 'Observe real-time interception of injected duplicate debits, >3x velocity spikes & rogue vendor wires.',
      icon: Radio,
      badge: 'Active Sentinel',
      color: 'text-rose-500 bg-rose-500/10 hover:border-rose-500/40',
    },
    {
      href: '/dashboard',
      title: '4. Executive Health Dashboard',
      description: 'Review the 95/100 Finance Health score, liquidity waterfalls, and AI-synthesized CFO takeaways.',
      icon: ShieldCheck,
      badge: 'Grade A+',
      color: 'text-blue-500 bg-blue-500/10 hover:border-blue-500/40',
    },
    {
      href: '/month-close',
      title: '5. Autonomous Month-End Close',
      description: 'Run the self-driving 7-step month-end close agent and export the signed audit certificate.',
      icon: Lock,
      badge: 'Autonomous',
      color: 'text-primary bg-primary/10 hover:border-primary/40',
    },
  ];

  return (
    <Card className="border border-border/70 bg-card/70 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Judge Navigation Matrix</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Instantly inspect each core capability on the generated 100-record dataset
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
          5 Core Modules
        </Badge>
      </CardHeader>

      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link, idx) => {
          const Icon = link.icon;
          return (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Link
                href={link.href}
                className={`block h-full p-4 rounded-xl border border-border/70 bg-muted/30 hover:bg-muted/50 transition-all duration-200 shadow-sm hover:shadow-md space-y-3 group ${link.color}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-background/80 shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {link.title}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                    {link.badge}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {link.description}
                </p>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-semibold text-primary">
                  <span>Open Module</span>
                  <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
};
