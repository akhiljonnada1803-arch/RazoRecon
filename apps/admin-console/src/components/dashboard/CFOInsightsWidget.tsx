'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, ArrowRight, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CFOInsightDTO } from '@/types/dashboard';

interface CFOInsightsWidgetProps {
  insights: CFOInsightDTO[];
}

export const CFOInsightsWidget: React.FC<CFOInsightsWidgetProps> = ({ insights }) => {
  return (
    <Card className="border border-border/70 bg-card/70 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">CFO Executive Intelligence</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI synthesis over ledger aggregates & audit policies
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
          ReAct Synthesis
        </Badge>
      </CardHeader>
      <CardContent className="p-4 space-y-3.5">
        {insights.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            className="rounded-lg border border-border/60 bg-muted/30 p-3.5 space-y-2 transition-all hover:bg-muted/50"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                {item.type === 'opportunity' ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                ) : item.type === 'risk' ? (
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                ) : (
                  <Lightbulb className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                )}
                {item.title}
              </span>
              <Badge
                variant={
                  item.impact === 'high'
                    ? 'destructive'
                    : item.impact === 'medium'
                    ? 'warning'
                    : 'secondary'
                }
                className="text-[9px] px-1.5 py-0 h-4 uppercase tracking-wider"
              >
                {item.impact} Impact
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.summary}
            </p>

            <div className="pt-1.5 border-t border-border/40 flex items-center gap-1.5 text-[11px] text-primary font-medium">
              <ArrowRight className="h-3 w-3 shrink-0" />
              <span>Recommended Action: {item.action}</span>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};
