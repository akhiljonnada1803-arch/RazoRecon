'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MetricCard } from '@/components/common/MetricCard';
import { PnLCharts } from '@/components/ledger/PnLCharts';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Percent, Calendar } from 'lucide-react';
import { IncomeStatementResponseDTO } from '@/types/ledger';
import { formatCurrency } from '@/lib/utils';

export default function IncomeStatementPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const { data, isLoading, error } = useQuery<IncomeStatementResponseDTO>({
    queryKey: ['income-statement', selectedMonth],
    queryFn: () =>
      apiClient.get('/ledger/income-statement', {
        month: selectedMonth || undefined,
      }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground text-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Rolling up P&L from deterministic ledger...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-sm text-destructive">
        Failed to load income statement.
      </div>
    );
  }

  const { summary, sections, revenue_by_channel, available_months } = data;

  const grossMargin = summary.revenue !== 0 
    ? (summary.gross_profit / summary.revenue) * 100 
    : 0;

  const operatingMargin = summary.revenue !== 0 
    ? (summary.operating_income / summary.revenue) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Income Statement (P&L Rollup)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aggregated entirely by deterministic code. Model never computes or touches arithmetic totals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          >
            <option value="">All Available Months</option>
            {available_months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(summary.revenue)}
          subtitle="Net sales across all channels"
          trend="positive"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="Gross Profit"
          value={formatCurrency(summary.gross_profit)}
          subtitle={`Gross Margin: ${grossMargin.toFixed(1)}%`}
          trend={summary.gross_profit >= 0 ? "positive" : "negative"}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Operating Expenses"
          value={formatCurrency(summary.operating_expense)}
          subtitle="Marketing, payroll, SaaS & admin"
          trend="neutral"
          icon={<TrendingDown className="h-4 w-4" />}
        />
        <MetricCard
          title="Operating Income"
          value={formatCurrency(summary.operating_income)}
          subtitle={`Operating Margin: ${operatingMargin.toFixed(1)}%`}
          trend={summary.operating_income >= 0 ? "positive" : "negative"}
          icon={<Percent className="h-4 w-4" />}
        />
      </div>

      {/* Recharts Visualizations */}
      <PnLCharts summary={summary} channelRevenue={revenue_by_channel} />

      {/* Section Breakdown Table */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-semibold">
            Income Statement Sections Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>P&L Section</TableHead>
                <TableHead className="text-right">Total Outflow / Inflow</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((sec) => (
                <TableRow key={sec.section}>
                  <TableCell className="font-semibold text-sm">{sec.section}</TableCell>
                  <TableCell className="text-right font-mono text-sm font-medium">
                    <span className={sec.amount < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}>
                      {formatCurrency(sec.amount)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
