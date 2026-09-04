'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { DailyForecastPointDTO } from '@/types/forecast';
import { TrendingUp, Activity, Layers } from 'lucide-react';

interface ForecastChartProps {
  timeline: DailyForecastPointDTO[];
  currentBalance: number;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  timeline,
  currentBalance,
}) => {
  const [viewFilter, setViewFilter] = useState<'ALL' | '14D' | '30D'>('ALL');

  const filteredData =
    viewFilter === '14D'
      ? timeline.slice(-20)
      : viewFilter === '30D'
      ? timeline.slice(-35)
      : timeline;

  return (
    <Card className="border border-border/70 bg-card/70 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-2 border-b border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-semibold">
              Cash Flow Forecast Trajectory & Confidence Cone (INR)
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            15-day verified actuals + 30-day moving average trajectory with $\pm 95\%$ confidence bounds
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant={viewFilter === '14D' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewFilter('14D')}
            className="text-xs h-7 px-2.5"
          >
            14 Days
          </Button>
          <Button
            variant={viewFilter === '30D' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewFilter('30D')}
            className="text-xs h-7 px-2.5"
          >
            30 Days
          </Button>
          <Button
            variant={viewFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewFilter('ALL')}
            className="text-xs h-7 px-2.5"
          >
            Full Horizon (45D)
          </Button>
        </div>
      </CardHeader>

      <CardContent className="h-[380px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredData} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />

            <Tooltip
              formatter={(value: any, name: any) => [
                value !== null && value !== undefined
                  ? `₹${Number(value).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : '—',
                name,
              ]}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '11px',
              }}
            />

            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />

            {/* Upper Bound Confidence Band */}
            <Line
              type="monotone"
              dataKey="upper_bound"
              name="Upper 95% Bound"
              stroke="#6ee7b7"
              strokeDasharray="2 2"
              strokeWidth={1}
              dot={false}
            />

            {/* Lower Bound Confidence Band */}
            <Line
              type="monotone"
              dataKey="lower_bound"
              name="Lower 95% Bound"
              stroke="#fca5a5"
              strokeDasharray="2 2"
              strokeWidth={1}
              dot={false}
            />

            {/* Historical Actuals Area */}
            <Area
              type="monotone"
              dataKey="actual_cash"
              name="Historical Actual Cash"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#actualGrad)"
            />

            {/* Projected Forecast Area */}
            <Area
              type="monotone"
              dataKey="projected_cash"
              name="Projected Forecast Cash"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#projGrad)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
