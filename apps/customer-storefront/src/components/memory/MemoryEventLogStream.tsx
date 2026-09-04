'use client';

import React from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  BrainCircuit
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MemoryEventLogDTO } from '@/types/memory';

interface MemoryEventLogStreamProps {
  events: MemoryEventLogDTO[];
}

export const MemoryEventLogStream: React.FC<MemoryEventLogStreamProps> = ({ events }) => {
  return (
    <Card className="border border-slate-200 bg-white shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-purple-50 text-purple-600">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-[#072654]">
              Memory & Risk Recalculation Event Logs
            </CardTitle>
            <p className="text-xs text-slate-500">
              Audit stream generated on every exception detection, memory ingestion & risk adjustment
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-[10px] font-mono bg-purple-50 text-purple-700 border-purple-200">
          Continuous Log Stream
        </Badge>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-2.5 px-4">TIMESTAMP & ID</th>
              <th className="py-2.5 px-3">VENDOR</th>
              <th className="py-2.5 px-3">TRIGGER EVENT</th>
              <th className="py-2.5 px-3">PREVIOUS RISK</th>
              <th className="py-2.5 px-3">DELTA</th>
              <th className="py-2.5 px-3">UPDATED RISK</th>
              <th className="py-2.5 px-4">STRUCTURED LOG MESSAGE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {events.map((evt) => {
              const isPositive = evt.delta > 0;
              return (
                <tr key={evt.event_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-800 block">{evt.event_id}</span>
                    <span className="text-[10px] text-slate-400">{evt.timestamp}</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">{evt.vendor}</span>
                    <code className="text-[10px] text-slate-400 font-mono">{evt.vendor_id}</code>
                  </td>

                  <td className="py-3 px-3">
                    <Badge variant="outline" className="text-[10px] font-semibold py-0 h-4.5 bg-slate-50 text-slate-700 border-slate-200">
                      {evt.trigger_event}
                    </Badge>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-600 font-semibold">
                    {evt.previous_risk} / 100
                  </td>

                  <td className="py-3 px-3">
                    <span className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded border ${
                      isPositive 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {isPositive ? `+${evt.delta}` : evt.delta}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                      <span>{evt.updated_risk}</span>
                      {isPositive ? (
                        <TrendingUp className="h-3.5 w-3.5 text-rose-500" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <code className="text-[11px] font-mono text-slate-800 bg-slate-100 p-1.5 rounded block border border-slate-200/80 max-w-lg truncate" title={evt.log_message}>
                      {evt.log_message}
                    </code>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {events.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No memory recalculation events logged yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
