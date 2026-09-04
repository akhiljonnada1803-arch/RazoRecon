'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Terminal, 
  ChevronDown, 
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkflowStepResultDTO } from '@/types/month_close';

interface WorkflowTimelineProps {
  steps: WorkflowStepResultDTO[];
  currentStepIndex?: number;
  isRunning?: boolean;
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  steps,
  currentStepIndex = 7,
  isRunning = false,
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const toggleExpand = (stepNum: number) => {
    setExpandedStep(expandedStep === stepNum ? null : stepNum);
  };

  return (
    <Card className="border border-border/70 bg-card/70 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Autonomous Month-End Close Timeline</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              7-step sequential accounting execution & verification pipeline
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-emerald-500/5 text-emerald-600 border-emerald-500/20 font-mono">
          {isRunning ? 'Execution in Progress...' : '7 / 7 Steps Certified'}
        </Badge>
      </CardHeader>

      <CardContent className="p-5">
        <div className="relative border-l-2 border-border/70 ml-4 space-y-6">
          {steps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = isRunning && currentStepIndex === step.step_number;
            const isPending = !isCompleted && !isInProgress;
            const isExpanded = expandedStep === step.step_number;

            return (
              <motion.div
                key={step.step_number}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
                className="relative pl-6 group"
              >
                {/* Node icon */}
                <div
                  className={`absolute -left-[17px] top-0.5 h-7 w-7 rounded-full flex items-center justify-center border-2 border-card transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                      : isInProgress
                      ? 'bg-primary text-white ring-4 ring-primary/20 animate-pulse'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isInProgress ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="text-[11px] font-bold">{step.step_number}</span>
                  )}
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5 space-y-2 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        Step {step.step_number}: {step.step_name}
                      </span>
                      <Badge
                        variant={
                          isCompleted
                            ? 'success'
                            : isInProgress
                            ? 'default'
                            : 'secondary'
                        }
                        className="text-[9px] px-1.5 py-0 h-4 uppercase font-bold"
                      >
                        {isCompleted ? 'Completed' : isInProgress ? 'Running' : 'Pending'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                      <span>{step.duration_ms} ms</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(step.step_number)}
                        className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                        Logs
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>

                  {/* Collapsible log trace */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 pt-2 border-t border-border/50 space-y-1.5 font-mono text-[11px] bg-background/80 p-2.5 rounded border border-border/40"
                    >
                      {step.log_messages.map((log, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-300">
                          <span className="text-primary font-bold">›</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
