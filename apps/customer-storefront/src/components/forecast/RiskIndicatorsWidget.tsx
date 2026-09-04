'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LiquidityRiskIndicatorDTO } from '@/types/forecast';

interface RiskIndicatorsWidgetProps {
  risks: LiquidityRiskIndicatorDTO[];
}

export const RiskIndicatorsWidget: React.FC<RiskIndicatorsWidgetProps> = ({ risks }) => {
  return (
    <Card className="border border-border/70 bg-card/70 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Liquidity & Runway Stress Indicators</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Settlement lag, payroll draw concentration & reserve buffers
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
          Stress Tested
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {risks.map((r, idx) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            className="rounded-lg border border-border/60 bg-muted/30 p-3.5 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <AlertTriangle
                  className={`h-3.5 w-3.5 shrink-0 ${
                    r.severity === 'Critical'
                      ? 'text-rose-500'
                      : r.severity === 'High'
                      ? 'text-rose-400'
                      : r.severity === 'Medium'
                      ? 'text-amber-500'
                      : 'text-blue-500'
                  }`}
                />
                {r.risk_title}
              </span>
              <Badge
                variant={
                  r.severity === 'Critical' || r.severity === 'High'
                    ? 'destructive'
                    : r.severity === 'Medium'
                    ? 'warning'
                    : 'secondary'
                }
                className="text-[9px] px-1.5 py-0 h-4 uppercase font-bold"
              >
                {r.severity} Priority
              </Badge>
            </div>

            <div className="text-[11px] text-muted-foreground grid grid-cols-2 gap-2 bg-muted/50 p-2 rounded">
              <div>
                <span className="font-semibold text-foreground/80 block">Threshold:</span>
                <span>{r.threshold_metric}</span>
              </div>
              <div>
                <span className="font-semibold text-foreground/80 block">Current Status:</span>
                <span className="font-mono text-primary font-semibold">{r.current_status}</span>
              </div>
            </div>

            <div className="pt-1 text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground/80 font-semibold">Impact: </strong>
              {r.impact}
            </div>

            <div className="pt-1.5 border-t border-border/40 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle className="h-3 w-3 shrink-0" />
              <span>Mitigation: {r.recommendation}</span>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};
