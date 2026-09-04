'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Inbox, 
  Zap, 
  CreditCard, 
  Sparkles, 
  ArrowRight, 
  RotateCcw,
  Layers,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ZeroDataEmptyStateProps {
  moduleName?: string;
  description?: string;
}

export const ZeroDataEmptyState: React.FC<ZeroDataEmptyStateProps> = ({
  moduleName = 'Workstation Module',
  description = 'Import data or generate a demo scenario to begin continuous reconciliation and risk intelligence.',
}) => {
  const queryClient = useQueryClient();

  const generateDemoMutation = useMutation({
    mutationFn: () => apiClient.post('/demo/connect-razorpay', {}),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const connectRazorpayMutation = useMutation({
    mutationFn: () => apiClient.post('/reconciliation/run-razorpay', {}),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const isPending = generateDemoMutation.isPending || connectRazorpayMutation.isPending;

  return (
    <Card className="border border-slate-200/90 bg-white rounded-3xl p-8 sm:p-12 shadow-xs text-center max-w-2xl mx-auto my-8 space-y-6">
      <div className="flex flex-col items-center space-y-3">
        <div className="h-16 w-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0B72E7] shadow-sm">
          <Database className="h-8 w-8" />
        </div>
        <Badge variant="outline" className="text-xs font-mono font-semibold bg-slate-50 text-slate-600 border-slate-200">
          ZERO DATA AVAILABLE
        </Badge>
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-2xl font-black text-[#072654] tracking-tight">
          No records available in {moduleName}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      {/* 2 Primary CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          onClick={() => generateDemoMutation.mutate()}
          disabled={isPending}
          className="w-full sm:w-auto h-11 px-5 text-xs font-bold bg-[#0B72E7] hover:bg-blue-600 text-white rounded-xl shadow-xs gap-2 active:scale-98 transition-all"
        >
          <Zap className={`h-4 w-4 ${generateDemoMutation.isPending ? 'animate-spin' : 'fill-white'}`} />
          <span>{generateDemoMutation.isPending ? 'Generating 500 Txns...' : 'Generate Demo Data'}</span>
        </Button>

        <Button
          onClick={() => connectRazorpayMutation.mutate()}
          disabled={isPending}
          variant="outline"
          className="w-full sm:w-auto h-11 px-5 text-xs font-bold border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-xl shadow-2xs gap-2"
        >
          <CreditCard className="h-4 w-4 text-slate-500" />
          <span>Connect Razorpay Feed</span>
        </Button>
      </div>

      <p className="text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-100">
        Data will appear dynamically once transactions are ingested and processed.
      </p>
    </Card>
  );
};
