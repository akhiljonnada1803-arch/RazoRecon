'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  Activity, 
  FileWarning,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FraudTimelineEventDTO } from '@/types/fraud';
import { formatCurrency } from '@/lib/utils';

interface FraudTimelineProps {
  events: FraudTimelineEventDTO[];
}

export const FraudTimeline: React.FC<FraudTimelineProps> = ({ events }) => {
  return (
    <Card className="border border-border/70 bg-card/70 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-500">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Incident Chronology & Anomaly Stream</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time audit log of intercepted risks, duplicate debits & settlement freezes
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-rose-500/5 text-rose-600 border-rose-500/20">
          Live Event Bus
        </Badge>
      </CardHeader>

      <CardContent className="p-5">
        <div className="relative border-l-2 border-border/60 ml-3.5 space-y-6">
          {events.map((evt, idx) => {
            const isCritical = evt.risk_level === 'Critical';
            const isHigh = evt.risk_level === 'High';

            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className="relative pl-6 group"
              >
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[17px] top-0.5 h-7 w-7 rounded-full flex items-center justify-center border-2 border-card ${
                    isCritical
                      ? 'bg-rose-500 text-white ring-4 ring-rose-500/20'
                      : isHigh
                      ? 'bg-amber-500 text-white ring-4 ring-amber-500/20'
                      : 'bg-blue-500 text-white ring-4 ring-blue-500/20'
                  }`}
                >
                  {isCritical ? (
                    <ShieldAlert className="h-3.5 w-3.5" />
                  ) : isHigh ? (
                    <AlertOctagon className="h-3.5 w-3.5" />
                  ) : (
                    <Activity className="h-3.5 w-3.5" />
                  )}
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5 space-y-2 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {evt.event_title}
                      </span>
                      <Badge
                        variant={
                          isCritical ? 'destructive' : isHigh ? 'warning' : 'secondary'
                        }
                        className="text-[9px] px-1.5 py-0 h-4 uppercase font-bold"
                      >
                        {evt.risk_level}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                      <span>{evt.timestamp}</span>
                      <span className="text-foreground font-bold font-mono">
                        {formatCurrency(evt.monetary_impact)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="pt-1.5 border-t border-border/40 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Response Action: {evt.action_taken}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
