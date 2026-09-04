'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  CircleDot, 
  ArrowRight, 
  Database, 
  Layers, 
  GitCompare, 
  AlertCircle, 
  Lock 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PIPELINE_STAGES = [
  {
    step: 1,
    name: 'Feed Ingestion',
    status: 'completed',
    statusLabel: 'Completed',
    detail: '4 feeds active (229 rows)',
    icon: Database,
    href: '/dashboard',
  },
  {
    step: 2,
    name: 'RAG Categorization',
    status: 'completed',
    statusLabel: '94% Auto-Posted',
    detail: '148 policy rules applied',
    icon: Layers,
    href: '/categorization',
  },
  {
    step: 3,
    name: 'Netting & Reconciliation',
    status: 'completed',
    statusLabel: '89.2% Matched',
    detail: 'Zero penny arithmetic error',
    icon: GitCompare,
    href: '/reconciliation',
  },
  {
    step: 4,
    name: 'Exception Queue',
    status: 'active',
    statusLabel: 'In Progress',
    detail: '6 items pending review',
    icon: AlertCircle,
    href: '/review',
  },
  {
    step: 5,
    name: 'Month-End Close',
    status: 'pending',
    statusLabel: 'Ready to Close',
    detail: 'Awaiting operator sign-off',
    icon: Lock,
    href: '/month-close',
  },
];

export const PipelineStageTracker: React.FC = () => {
  return (
    <Card className="border border-border/80 bg-card shadow-sm">
      <CardHeader className="p-4 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Current Processing Pipeline
          </CardTitle>
          <span className="text-xs text-foreground font-semibold">
            Stage 4 of 5: Exception Review & Operator Verification
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono bg-blue-500/10 text-blue-600 border-blue-500/20">
          Workflow Active
        </Badge>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PIPELINE_STAGES.map((st) => {
            const Icon = st.icon;
            const isCompleted = st.status === 'completed';
            const isActive = st.status === 'active';

            return (
              <Link key={st.step} href={st.href} className="group">
                <div
                  className={`h-full rounded-lg border p-3 flex flex-col justify-between space-y-2 transition-all ${
                    isActive
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : isCompleted
                      ? 'border-border/80 bg-muted/30 hover:bg-muted/60'
                      : 'border-border/40 bg-muted/10 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">
                      Stage 0{st.step}
                    </span>

                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Done</span>
                      </span>
                    )}
                    {isActive && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-primary animate-pulse">
                        <CircleDot className="h-3.5 w-3.5" />
                        <span>Active</span>
                      </span>
                    )}
                    {st.status === 'pending' && (
                      <span className="text-[10px] font-medium text-muted-foreground">
                        Next
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {st.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {st.detail}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px]">
                    <span className={`font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {st.statusLabel}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
