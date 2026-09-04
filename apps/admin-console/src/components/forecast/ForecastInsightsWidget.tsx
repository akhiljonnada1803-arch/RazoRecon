'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Lightbulb, ArrowRight, ShieldCheck, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ForecastInsightDTO } from '@/types/forecast';
import { formatCurrency } from '@/lib/utils';

interface ForecastInsightsWidgetProps {
  insights: ForecastInsightDTO[];
}

export const ForecastInsightsWidget: React.FC<ForecastInsightsWidgetProps> = ({ insights }) => {
  return (
    <Card className="border border-border/70 bg-card/70 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Treasury & Working Capital Insights</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Forecast-driven optimization opportunities & capital efficiency
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
          AI Treasury Agent
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {insights.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            className="rounded-lg border border-border/60 bg-muted/30 p-3.5 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                {item.title}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(item.impact_amount)}
                </span>
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                  {item.category}
                </Badge>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.detail}
            </p>

            <div className="pt-1.5 border-t border-border/40 flex items-center gap-1.5 text-[11px] text-primary font-medium">
              <ArrowRight className="h-3 w-3 shrink-0" />
              <span>Recommended Action: {item.actionable_step}</span>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};
