'use client';

import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  History, 
  Clock, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskTrendPointDTO } from '@/types/vendor_risk';
import { MemoryEventLogDTO } from '@/types/memory';

interface RiskEvolutionTimelineProps {
  trend: RiskTrendPointDTO[];
  events: MemoryEventLogDTO[];
}

export const RiskEvolutionTimeline: React.FC<RiskEvolutionTimelineProps> = ({ trend, events }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Multi-Period Risk Evolution Chart */}
      <Card className="border border-slate-200 bg-white shadow-xs">
        <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-[#0B72E7]">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-[#072654]">
                Risk Evolution Trajectory
              </CardTitle>
              <p className="text-xs text-slate-500">
                Quarterly risk progression and high-risk counterparty counts
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono text-slate-500">
            Multi-Period Analysis
          </Badge>
        </CardHeader>

        <CardContent className="p-4 pt-6">
          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    name === 'avg_risk_score' ? `${value} / 100` : value,
                    name === 'avg_risk_score' ? 'Avg Risk Score' : 'High Risk Vendors'
                  ]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="avg_risk_score" name="Average Risk Score" stroke="#0B72E7" strokeWidth={2.5} dot={{ r: 4, fill: '#0B72E7' }} />
                <Line type="monotone" dataKey="high_risk_count" name="High Risk Outliers" stroke="#EF4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: '#EF4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs px-2">
            <span className="text-slate-500">Latest Portfolio Mean:</span>
            <span className="font-mono font-bold text-slate-900">
              {trend.length > 0 ? trend[trend.length - 1].avg_risk_score : 0} / 100
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Real-Time Memory Recalculation Audit Stream */}
      <Card className="border border-slate-200 bg-white shadow-xs flex flex-col">
        <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-50 text-purple-600">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-[#072654]">
                Memory & Risk Adjustment Audit Stream
              </CardTitle>
              <p className="text-xs text-slate-500">
                Live chronological ledger of counterparty score updates
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono bg-purple-50 text-purple-700 border-purple-200">
            Active Stream
          </Badge>
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-y-auto max-h-[300px] divide-y divide-slate-100 text-xs">
          {events.slice(0, 6).map((evt) => {
            const isPos = evt.delta > 0;
            return (
              <div key={evt.event_id} className="p-3 px-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{evt.vendor}</span>
                    <Badge variant="outline" className="text-[9px] font-mono py-0 h-4 bg-slate-50 text-slate-600">
                      {evt.trigger_event}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono bg-slate-50 p-1.5 rounded border border-slate-200/60 truncate max-w-sm">
                    {evt.log_message}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 font-mono font-bold">
                    <span className="text-slate-500">{evt.previous_risk}</span>
                    <span className="text-slate-300">➔</span>
                    <span className={isPos ? 'text-rose-600' : 'text-emerald-600'}>{evt.updated_risk}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${isPos ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {isPos ? `+${evt.delta}` : evt.delta} pts
                  </span>
                </div>
              </div>
            );
          })}

          {events.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No audit events recorded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
