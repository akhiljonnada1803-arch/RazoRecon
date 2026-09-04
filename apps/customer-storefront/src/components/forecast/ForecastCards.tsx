'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Zap,
  Wallet
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HorizonForecastDTO } from '@/types/forecast';
import { formatCurrency } from '@/lib/utils';

interface ForecastCardsProps {
  f7d: HorizonForecastDTO;
  f30d: HorizonForecastDTO;
  f90d: HorizonForecastDTO;
  currentBalance: number;
}

export const ForecastCards: React.FC<ForecastCardsProps> = ({
  f7d,
  f30d,
  f90d,
  currentBalance,
}) => {
  const horizons = [
    {
      data: f7d,
      icon: Clock,
      badge: `${f7d.confidence_score}% Confidence`,
      badgeVariant: 'success' as const,
      accentColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      glow: 'hover:border-emerald-500/40',
      description: 'Immediate liquidity buffer & clearing settlement pace',
    },
    {
      data: f30d,
      icon: Calendar,
      badge: `${f30d.confidence_score}% Confidence`,
      badgeVariant: 'default' as const,
      accentColor: 'text-blue-500 bg-blue-500/10 border-primary/20',
      glow: 'hover:border-blue-500/40 border-primary/30',
      highlight: true,
      description: 'Primary working capital cycle & monthly payroll coverage',
    },
    {
      data: f90d,
      icon: Zap,
      badge: `${f90d.confidence_score}% Confidence`,
      badgeVariant: 'secondary' as const,
      accentColor: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
      glow: 'hover:border-violet-500/40',
      description: 'Strategic quarterly runway & capital expansion trajectory',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {horizons.map((h, idx) => {
        const Icon = h.icon;
        const netPositive = h.data.net_cash_flow >= 0;
        return (
          <motion.div
            key={h.data.horizon_days}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
          >
            <Card
              className={`relative overflow-hidden bg-card/70 backdrop-blur-md shadow-sm transition-all duration-300 ${
                h.glow
              } ${h.highlight ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border/70'}`}
            >
              {h.highlight && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl-md uppercase tracking-wider">
                  Primary Cycle
                </div>
              )}

              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${h.accentColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-bold tracking-tight">
                      {h.data.horizon_label}
                    </CardTitle>
                  </div>
                  <Badge variant={h.badgeVariant} className="text-[10px] px-2 py-0 h-4 font-mono">
                    {h.badge}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-tight">
                  {h.description}
                </p>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {/* Projected Closing Cash */}
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Projected Closing Cash
                  </span>
                  <div className="flex items-baseline justify-between gap-2 mt-0.5">
                    <span className="text-2xl font-extrabold font-mono tracking-tight text-foreground">
                      {formatCurrency(h.data.projected_closing_balance)}
                    </span>
                    <span
                      className={`text-xs font-semibold flex items-center gap-0.5 ${
                        netPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                      }`}
                    >
                      {netPositive ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      )}
                      {formatCurrency(h.data.net_cash_flow)}
                    </span>
                  </div>
                </div>

                {/* Inflows vs Outflows Matrix */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-border/40">
                  <div className="rounded-md bg-muted/40 p-2.5 border border-border/50">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                      Expected Inflows
                    </span>
                    <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
                      {formatCurrency(h.data.expected_inflow)}
                    </span>
                  </div>

                  <div className="rounded-md bg-muted/40 p-2.5 border border-border/50">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <ArrowDownRight className="h-3 w-3 text-rose-500" />
                      Expected Outflows
                    </span>
                    <span className="text-sm font-bold font-mono text-rose-600 dark:text-rose-400 block mt-0.5">
                      {formatCurrency(h.data.expected_outflow)}
                    </span>
                  </div>
                </div>

                {/* Daily velocity & Runway */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>Runway: <strong className="text-foreground">{h.data.runway_days} Days</strong></span>
                  <span>Daily Net: <strong className="text-foreground">{formatCurrency(h.data.net_cash_flow / h.data.horizon_days)}/day</strong></span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
