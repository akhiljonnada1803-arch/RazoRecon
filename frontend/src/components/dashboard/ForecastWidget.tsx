'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CalendarRange, ArrowUpRight, ArrowDownRight, Compass, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ForecastSummaryDTO } from '@/types/dashboard';
import { formatCurrency } from '@/lib/utils';

interface ForecastWidgetProps {
  forecast: ForecastSummaryDTO;
}

export const ForecastWidget: React.FC<ForecastWidgetProps> = ({ forecast }) => {
  return (
    <Card className="border border-border/70 bg-card/70 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <CalendarRange className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">{forecast.period_days}-Day Cash & Runway Forecast</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Projected inflows, net burn & runway projection
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
          {forecast.confidence_interval_pct}% Confidence
        </Badge>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/40 p-3 border border-border/50">
            <span className="text-[11px] font-medium text-muted-foreground block flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              Projected Inflow
            </span>
            <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
              {formatCurrency(forecast.projected_inflow)}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 block">+15% expected growth</span>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 border border-border/50">
            <span className="text-[11px] font-medium text-muted-foreground block flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-rose-500" />
              Projected Outflows
            </span>
            <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 block">
              {formatCurrency(forecast.projected_outflow)}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 block">COGS + OpEx load</span>
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3.5 border border-primary/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-primary" />
              Estimated Operating Runway
            </span>
            <span className="text-sm font-bold text-primary font-mono">
              {forecast.runway_months} Months
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (forecast.runway_months / 18) * 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Burn: {formatCurrency(forecast.projected_net_burn)}/quarter</span>
            <span>Target: &gt; 12 Mo</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
