'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Copy, 
  FileWarning, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InjectedAnomalyDTO } from '@/types/demo';

interface InjectedAnomaliesCardProps {
  anomalies: InjectedAnomalyDTO[];
}

export const InjectedAnomaliesCard: React.FC<InjectedAnomaliesCardProps> = ({ anomalies }) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'Tax Mismatch':
        return AlertTriangle;
      case 'Duplicate Payment':
        return Copy;
      case 'Missing Invoice':
        return FileWarning;
      case 'Settlement Delay':
        return Clock;
      default:
        return Zap;
    }
  };

  const getColor = (category: string) => {
    switch (category) {
      case 'Tax Mismatch':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Duplicate Payment':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'Missing Invoice':
        return 'text-violet-500 bg-violet-500/10 border-violet-500/20';
      case 'Settlement Delay':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  return (
    <Card className="border border-border/70 bg-card/70 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Active Injected Financial Failure Modes</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Targeted real-world messiness synthesized for evaluation & stress testing
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-amber-500/5 text-amber-600 border-amber-500/20">
          Synthetic Ground Truth
        </Badge>
      </CardHeader>

      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {anomalies.map((a, idx) => {
          const Icon = getIcon(a.category);
          const colorClass = getColor(a.category);

          return (
            <motion.div
              key={a.category}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.07 }}
              className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2.5 hover:bg-muted/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {a.category}
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0">
                  {a.count} Injected
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {a.description}
              </p>

              <div className="pt-2 border-t border-border/40 text-[11px] space-y-1">
                <div className="text-muted-foreground">
                  <strong className="text-foreground/80">Business Impact:</strong> {a.impact}
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {a.target_entities.map((e, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-background/80 border border-border text-[10px] font-mono text-foreground/80"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
};
