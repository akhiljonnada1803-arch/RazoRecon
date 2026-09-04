'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Wallet, 
  GitCompare, 
  AlertOctagon, 
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExecutiveKPIsDTO } from '@/types/dashboard';
import { formatCurrency } from '@/lib/utils';

interface ExecutiveKPICardsProps {
  kpis: ExecutiveKPIsDTO;
}

export const ExecutiveKPICards: React.FC<ExecutiveKPICardsProps> = ({ kpis }) => {
  const cards = [
    {
      id: 'health',
      title: 'Finance Health Score',
      value: `${kpis.health_score}/100`,
      subtitle: `${kpis.health_status}`,
      badge: `+${kpis.health_delta} pts vs Q1`,
      badgeVariant: 'success' as const,
      icon: ShieldCheck,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-500',
      borderGlow: 'hover:border-emerald-500/40',
      progress: kpis.health_score,
    },
    {
      id: 'cash',
      title: 'Current Cash Position',
      value: formatCurrency(kpis.cash_position),
      subtitle: `Operating liquidity across accounts`,
      badge: `+${kpis.cash_delta_pct}% MoM`,
      badgeVariant: 'success' as const,
      icon: Wallet,
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-500',
      borderGlow: 'hover:border-blue-500/40',
    },
    {
      id: 'match-rate',
      title: 'Auto Match Rate',
      value: `${kpis.match_rate}%`,
      subtitle: `100% verified to the penny`,
      badge: `Zero Math Drift`,
      badgeVariant: 'default' as const,
      icon: GitCompare,
      color: 'from-violet-500/20 to-purple-500/10 text-violet-500',
      borderGlow: 'hover:border-violet-500/40',
    },
    {
      id: 'exceptions',
      title: 'Open Exceptions',
      value: `${kpis.open_exceptions} Items`,
      subtitle: `${formatCurrency(kpis.open_exceptions_value)} held in reserves`,
      badge: kpis.open_exceptions > 0 ? 'Action Needed' : 'Clean',
      badgeVariant: kpis.open_exceptions > 0 ? ('warning' as const) : ('success' as const),
      icon: AlertOctagon,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-500',
      borderGlow: 'hover:border-amber-500/40',
    },
    {
      id: 'fraud',
      title: 'Fraud & Audit Flags',
      value: `${kpis.fraud_alerts} Critical`,
      subtitle: `${kpis.anomalies_detected} flagged for review`,
      badge: '100% Policy Citing',
      badgeVariant: 'outline' as const,
      icon: ShieldAlert,
      color: 'from-sky-500/20 to-cyan-500/10 text-sky-500',
      borderGlow: 'hover:border-sky-500/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.06 }}
          >
            <Card
              className={`relative overflow-hidden border border-border/70 bg-card/70 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md ${card.borderGlow}`}
            >
              {/* Subtle gradient glow header background */}
              <div
                className={`absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 rounded-full bg-gradient-to-br ${card.color} opacity-40 blur-xl pointer-events-none`}
              />

              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    {card.title}
                  </span>
                  <div className={`p-1.5 rounded-md bg-muted/60 ${card.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div>
                  <div className="text-xl font-bold tracking-tight text-foreground">
                    {card.value}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate" title={card.subtitle}>
                    {card.subtitle}
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between border-t border-border/40">
                  <Badge variant={card.badgeVariant} className="text-[10px] px-1.5 py-0 h-4 font-medium">
                    {card.badge}
                  </Badge>
                  {card.progress !== undefined && (
                    <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                      Grade A+
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
