'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend 
} from 'recharts';
import { PnLSummaryDTO } from '@/types/ledger';

interface PnLChartsProps {
  summary: PnLSummaryDTO;
  channelRevenue: Record<string, number>;
}

const CHANNEL_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

export const PnLCharts: React.FC<PnLChartsProps> = ({ summary, channelRevenue }) => {
  const waterfallData = [
    { name: 'Revenue', amount: summary.revenue, type: 'positive' },
    { name: 'COGS', amount: Math.abs(summary.cogs), type: 'negative' },
    { name: 'Gross Profit', amount: summary.gross_profit, type: 'subtotal' },
    { name: 'OpEx', amount: Math.abs(summary.operating_expense), type: 'negative' },
    { name: 'Operating Income', amount: summary.operating_income, type: 'total' },
  ];

  const pieData = Object.entries(channelRevenue).map(([name, value]) => ({
    name,
    value: Math.abs(value),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
      {/* Waterfall / Bar Breakdown */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">P&L Waterfall Structure (INR)</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfallData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: any) => [`₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Amount']} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {waterfallData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.type === 'positive'
                        ? '#10b981'
                        : entry.type === 'negative'
                        ? '#ef4444'
                        : entry.type === 'subtotal'
                        ? '#3b82f6'
                        : '#6366f1'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Channel Distribution */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Revenue by Sales Channel (INR)</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }: any) =>
                  `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {pieData.map((_, index) => (
                  <Cell key={`pie-cell-${index}`} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [`₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
