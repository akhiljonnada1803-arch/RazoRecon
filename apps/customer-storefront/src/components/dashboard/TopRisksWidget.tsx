'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TopRiskDTO } from '@/types/dashboard';
import { formatCurrency } from '@/lib/utils';

interface TopRisksWidgetProps {
  risks: TopRiskDTO[];
}

export const TopRisksWidget: React.FC<TopRisksWidgetProps> = ({ risks }) => {
  return (
    <Card className="border border-border/70 bg-card/70 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-500">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Financial Risk Exposure Matrix</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live settlement vulnerabilities & mitigation protocols
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-rose-500/5 text-rose-600 border-rose-500/20">
          Audited Real-time
        </Badge>
      </CardHeader>
      <CardContent className="p-4 space-y-3.5">
        {risks.map((r, idx) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            className="rounded-lg border border-border/60 bg-muted/30 p-3.5 space-y-2 transition-all hover:bg-muted/50"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`h-4 w-4 shrink-0 ${
                    r.severity === 'critical'
                      ? 'text-rose-500'
                      : r.severity === 'warning'
                      ? 'text-amber-500'
                      : 'text-blue-500'
                  }`}
                />
                <span className="text-xs font-semibold text-foreground">{r.risk_title}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-foreground">
                  {formatCurrency(r.monetary_exposure)}
                </span>
                <Badge
                  variant={
                    r.severity === 'critical'
                      ? 'destructive'
                      : r.severity === 'warning'
                      ? 'warning'
                      : 'secondary'
                  }
                  className="text-[9px] px-1.5 py-0 h-4 uppercase"
                >
                  {r.severity}
                </Badge>
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground flex items-center gap-2">
              <span className="font-semibold text-foreground/70">Integration:</span> {r.source}
            </div>

            <div className="pt-1.5 border-t border-border/40 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle className="h-3 w-3 shrink-0" />
              <span>Mitigation: {r.mitigation_strategy}</span>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};
