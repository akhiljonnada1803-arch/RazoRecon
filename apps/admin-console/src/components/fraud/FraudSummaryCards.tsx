'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Activity, 
  SearchCheck,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FraudSummaryMetricsDTO } from '@/types/fraud';
import { formatCurrency } from '@/lib/utils';

interface FraudSummaryCardsProps {
  summary: FraudSummaryMetricsDTO;
}

export const FraudSummaryCards: React.FC<FraudSummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      id: 'scanned',
      title: 'Monitored Transactions',
      value: summary.total_transactions_scanned,
      subtitle: 'Continuous ML & Rule Surveillance',
      badge: '100% Realtime',
      badgeVariant: 'outline' as const,
      icon: SearchCheck,
      color: 'from-blue-500/20 to-cyan-500/10 text-blue-500',
      borderGlow: 'hover:border-blue-500/40',
    },
    {
      id: 'critical-high',
      title: 'Critical & High Alerts',
      value: summary.critical_alerts_count + summary.high_alerts_count,
      subtitle: `${summary.critical_alerts_count} Critical, ${summary.high_alerts_count} High priority`,
      badge: summary.critical_alerts_count > 0 ? 'Urgent Action' : 'Stable',
      badgeVariant: summary.critical_alerts_count > 0 ? ('destructive' as const) : ('warning' as const),
      icon: ShieldAlert,
      color: 'from-rose-500/20 to-red-500/10 text-rose-500',
      borderGlow: 'hover:border-rose-500/40',
    },
    {
      id: 'exposure',
      title: 'Capital at Risk',
      value: formatCurrency(summary.total_exposure_at_risk),
      subtitle: 'Active un-cleared anomaly value',
      badge: 'Protected',
      badgeVariant: 'secondary' as const,
      icon: AlertTriangle,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-500',
      borderGlow: 'hover:border-amber-500/40',
    },
    {
      id: 'prevented',
      title: 'Losses Prevented',
      value: formatCurrency(summary.prevented_loss_amount),
      subtitle: 'Blocked duplicate & rogue debits',
      badge: '+₹12,500 Saved',
      badgeVariant: 'success' as const,
      icon: Lock,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-500',
      borderGlow: 'hover:border-emerald-500/40',
    },
    {
      id: 'anomaly-rate',
      title: 'Anomaly Capture Rate',
      value: `${summary.anomaly_detection_rate_pct}%`,
      subtitle: 'Zero false-positive noise',
      badge: 'Rule Enforced',
      badgeVariant: 'default' as const,
      icon: Activity,
      color: 'from-violet-500/20 to-purple-500/10 text-violet-500',
      borderGlow: 'hover:border-violet-500/40',
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
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Active
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
