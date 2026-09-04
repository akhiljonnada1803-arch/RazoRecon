'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Terminal, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToolExecutionDTO } from '@/types/agent';

interface ToolExecutionTraceProps {
  traces: ToolExecutionDTO[];
}

export const ToolExecutionTrace: React.FC<ToolExecutionTraceProps> = ({ traces }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  if (!traces || traces.length === 0) return null;

  return (
    <div className="my-3 rounded-lg border border-border/80 bg-muted/40 p-3 text-xs">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-2 py-1 h-7 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <span className="flex items-center gap-1.5">
          <Terminal className="h-3.5 w-3.5 text-blue-500" />
          <span>Deterministic Tool Trace ({traces.length} tool calls)</span>
        </span>
        <span className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px] h-4 font-normal">
            Audit Trail
          </Badge>
          {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </span>
      </Button>

      {isOpen && (
        <div className="mt-3 space-y-2.5 border-t border-border/60 pt-2.5">
          {traces.map((trace, idx) => (
            <div key={idx} className="rounded-md bg-background/90 p-2.5 border border-border/60 font-mono">
              <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {trace.tool}
                </span>
                <span className="text-[10px] text-muted-foreground">Step {idx + 1}</span>
              </div>
              <div className="text-[11px] text-muted-foreground mb-1">
                <span className="font-semibold text-foreground/80">Input Args: </span>
                <code>{JSON.stringify(trace.args)}</code>
              </div>
              <div className="text-[11px] bg-muted/60 p-2 rounded overflow-x-auto">
                <span className="font-semibold text-foreground/80 block mb-0.5">Result:</span>
                <pre className="text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-300">
                  {typeof trace.result === 'object'
                    ? JSON.stringify(trace.result, null, 2)
                    : String(trace.result)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
