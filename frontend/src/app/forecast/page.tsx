'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ForecastCards } from '@/components/forecast/ForecastCards';
import { ForecastChart } from '@/components/forecast/ForecastChart';
import { RiskIndicatorsWidget } from '@/components/forecast/RiskIndicatorsWidget';
import { ForecastInsightsWidget } from '@/components/forecast/ForecastInsightsWidget';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, 
  RefreshCw, 
  Sparkles, 
  CalendarRange, 
  ArrowUpRight,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { CashForecastResponseDTO } from '@/types/forecast';
import { formatCurrency } from '@/lib/utils';
import { ZeroDataEmptyState } from '@/components/common/ZeroDataEmptyState';

export default function ForecastPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<CashForecastResponseDTO>({
    queryKey: ['cash-forecast'],
    queryFn: () => apiClient.get('/forecast'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-muted-foreground text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-medium">Synthesizing Moving Average Cash Flow & Settlement Timing Projections...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-sm text-destructive">
        Failed to load cash forecasting module. Ensure the FastAPI backend is running on port 8000.
      </div>
    );
  }

  if (!data || !data.daily_timeline || data.daily_timeline.length === 0 || data.current_cash_balance === 0) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 border-b border-border/50 pb-5">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Cash Flow Forecasting & Liquidity Intelligence
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Predictive treasury modeling derived from historical payments and settlement velocity.
            </p>
          </div>
        </div>

        <ZeroDataEmptyState
          moduleName="Cash Flow Forecasting"
          description="No transaction history available. Generate demo data or import historical accounting records to begin multi-horizon cash flow modeling."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Cash Flow Forecasting & Liquidity Intelligence
            </h1>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
              7D · 30D · 90D Multi-Horizon
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Predictive treasury modeling derived from historical payments, gross-to-net settlements, and accounting invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs h-8 gap-1.5 bg-card/60 backdrop-blur-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-primary' : ''}`} />
            Re-Simulate Forecast
          </Button>
        </div>
      </div>

      {/* Dynamic Executive Narrative Callout */}
      <Card className="border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent shadow-sm">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                Executive Forecast Takeaway
              </span>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                "{data.executive_summary}"
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4 border-l border-emerald-500/20 pl-4 shrink-0 text-right">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Current Balance</span>
              <span className="text-base font-extrabold font-mono text-foreground">
                {formatCurrency(data.current_cash_balance)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 1. Multi-Horizon Forecast Cards (7D, 30D, 90D) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <CalendarRange className="h-3.5 w-3.5 text-primary" />
            Multi-Horizon Liquidity Projections
          </h2>
          <span className="text-[11px] text-muted-foreground font-mono">
            Model: Moving Average + Trend Drift
          </span>
        </div>
        <ForecastCards
          f7d={data.forecast_7d}
          f30d={data.forecast_30d}
          f90d={data.forecast_90d}
          currentBalance={data.current_cash_balance}
        />
      </section>

      {/* 2. Interactive Cash Trajectory & Confidence Cone Chart */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-primary" />
          Predictive Cash Position & Confidence Interval
        </h2>
        <ForecastChart
          timeline={data.daily_timeline}
          currentBalance={data.current_cash_balance}
        />
      </section>

      {/* 3. Stress Risk Indicators & Treasury Insights */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Liquidity Risk Surveillance & Working Capital Optimization
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskIndicatorsWidget risks={data.risk_indicators} />
          <ForecastInsightsWidget insights={data.insights} />
        </div>
      </section>
    </div>
  );
}
