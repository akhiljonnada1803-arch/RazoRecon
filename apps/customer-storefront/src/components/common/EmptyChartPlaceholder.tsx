'use client';

import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

interface EmptyChartPlaceholderProps {
  height?: string;
  message?: string;
}

export const EmptyChartPlaceholder: React.FC<EmptyChartPlaceholderProps> = ({
  height = 'h-[240px]',
  message = 'Data will appear once transactions are processed.',
}) => {
  return (
    <div className={`w-full ${height} rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center space-y-2.5`}>
      <div className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 shadow-2xs">
        <TrendingUp className="h-5 w-5" />
      </div>
      <p className="text-xs text-slate-500 font-medium max-w-xs">
        {message}
      </p>
      <span className="text-[10px] font-mono text-slate-400">
        Waiting for ingestion feed
      </span>
    </div>
  );
};
