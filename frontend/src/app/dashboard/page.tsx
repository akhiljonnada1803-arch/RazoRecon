'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { RazorpayHeaderSummary } from '@/components/razorpay/RazorpayHeaderSummary';
import { MonthEndCloseCard } from '@/components/razorpay/MonthEndCloseCard';
import { ReconciliationSummaryWidget } from '@/components/razorpay/ReconciliationSummaryWidget';
import { ExceptionResolutionTable } from '@/components/razorpay/ExceptionResolutionTable';
import { CashForecastSummaryWidget } from '@/components/razorpay/CashForecastSummaryWidget';
import { OperationalActivityTimeline } from '@/components/razorpay/OperationalActivityTimeline';
import { OneClickDemoFlowCard } from '@/components/demo/OneClickDemoFlowCard';
import { AIAgentPanel } from '@/components/common/AIAgentPanel';
import { ZeroDataEmptyState } from '@/components/common/ZeroDataEmptyState';

export default function FinanceOperationsDashboardPage() {
  const { data: dashboardData, isLoading } = useQuery<{ has_data?: boolean; cash_trend?: any[] }>({
    queryKey: ['dashboard', 'executive'],
    queryFn: () => apiClient.get('/dashboard/executive'),
  });

  const hasData = dashboardData?.has_data !== false && (dashboardData?.cash_trend && dashboardData.cash_trend.length > 0);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* 1. Header & Summary Strip */}
      <section>
        <RazorpayHeaderSummary />
      </section>

      {/* 2. Zero Data Clean State Handler */}
      {!hasData ? (
        <section className="space-y-6">
          <ZeroDataEmptyState
            moduleName="Finance Operations Dashboard"
            description="Import data or generate a demo scenario to begin continuous reconciliation, exception detection, and cash flow forecasting."
          />
        </section>
      ) : (
        <>
          {/* 2. Non-Human System Role: Autonomous AI Finance Agent Telemetry */}
          <section>
            <AIAgentPanel />
          </section>

          {/* 3. One-Click Demo Flow: Connect Demo Razorpay Account */}
          <section>
            <OneClickDemoFlowCard />
          </section>

          {/* 4. Month-End Close Checklist & Multi-Channel Reconciliation Status */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthEndCloseCard />
            <ReconciliationSummaryWidget />
          </section>

          {/* 5. Actionable Exception Resolution Table */}
          <section>
            <ExceptionResolutionTable />
          </section>

          {/* 6. Cash Flow & Treasury Forecasting Projections */}
          <section>
            <CashForecastSummaryWidget />
          </section>

          {/* 7. Operational Activity Timeline */}
          <section>
            <OperationalActivityTimeline />
          </section>
        </>
      )}
    </div>
  );
}
