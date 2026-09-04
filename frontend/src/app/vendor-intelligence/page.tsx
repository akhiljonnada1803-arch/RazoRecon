'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { VendorRiskDashboardDTO, VendorRiskScoreDTO } from '@/types/vendor_risk';
import { VendorListResponseDTO, VendorBehavioralProfileDTO } from '@/types/memory';
import { OneClickDemoFlowResultDTO } from '@/types/demo';

import { VendorIntelligenceHeader } from '@/components/vendor_intelligence/VendorIntelligenceHeader';
import { VendorKPIGrid } from '@/components/vendor_intelligence/VendorKPIGrid';
import { ProminentHighRiskAlert } from '@/components/vendor_intelligence/ProminentHighRiskAlert';
import { PortfolioTrendChartCard } from '@/components/vendor_intelligence/PortfolioTrendChartCard';
import { VendorDirectoryList } from '@/components/vendor_intelligence/VendorDirectoryList';
import { VendorDossierSlidingDrawer } from '@/components/vendor_intelligence/VendorDossierSlidingDrawer';
import { AIInsightsGrid } from '@/components/vendor_intelligence/AIInsightsGrid';
import { ZeroDataEmptyState } from '@/components/common/ZeroDataEmptyState';

export default function VendorIntelligenceCenterPage() {
  const queryClient = useQueryClient();
  const [selectedVendor, setSelectedVendor] = useState<VendorRiskScoreDTO | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 1. Fetch Vendor Risk Dashboard Data
  const { 
    data: riskData, 
    isLoading: isRiskLoading, 
    error: riskError 
  } = useQuery<VendorRiskDashboardDTO>({
    queryKey: ['vendor-risk-dashboard'],
    queryFn: () => apiClient.get('/vendors/risk'),
  });

  // 2. Fetch Vendor Memory Data
  const { 
    data: memoryData, 
    isLoading: isMemoryLoading 
  } = useQuery<VendorListResponseDTO>({
    queryKey: ['memory-vendors'],
    queryFn: () => apiClient.get('/memory/vendors'),
  });

  // Demo flow mutation for Quick Demo Data Run
  const demoMutation = useMutation({
    mutationFn: () => apiClient.post<OneClickDemoFlowResultDTO>('/demo/connect-razorpay', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-risk-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['memory-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const isLoading = isRiskLoading || isMemoryLoading;

  const handleSelectVendor = (vendor: VendorRiskScoreDTO) => {
    setSelectedVendor(vendor);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-slate-500 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-[#0B72E7] border-t-transparent rounded-full animate-spin" />
          <span className="font-medium text-slate-600">Synthesizing Counterparty Risk Ratings & Behavioral Memory...</span>
        </div>
      </div>
    );
  }

  if (riskError || !riskData) {
    return (
      <div className="p-8 text-center text-sm text-destructive bg-rose-50 border border-rose-200 rounded-2xl max-w-lg mx-auto my-16 shadow-xs">
        Failed to load Vendor Intelligence Center. Ensure the backend is running.
      </div>
    );
  }

  // Calculate total exceptions across portfolio
  const totalExceptions = riskData.vendors.reduce((acc, v) => acc + v.total_exceptions, 0);

  // Match selected vendor's detailed memory profile
  const matchedProfile: VendorBehavioralProfileDTO | undefined = selectedVendor && memoryData
    ? memoryData.profiles.find((p) => p.vendor_id === selectedVendor.vendor_id || p.vendor === selectedVendor.vendor)
    : undefined;

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Top Section: Header with unified status and action buttons */}
      <section>
        <VendorIntelligenceHeader
          totalExceptions={totalExceptions}
          onRunDemo={() => demoMutation.mutate()}
          isDemoRunning={demoMutation.isPending}
        />
      </section>

      {/* Zero State check */}
      {riskData.vendors.length === 0 ? (
        <section>
          <ZeroDataEmptyState
            moduleName="Vendor Intelligence Center"
            description="No vendor records available. Generate demo data or import transactions to populate counterparty risk ratings, pattern memory, and resolution history."
          />
        </section>
      ) : (
        <>
          {/* Section 1: 6 Equal KPI Overview Cards */}
          <section>
            <VendorKPIGrid
              totalVendors={riskData.total_vendors}
              highRiskCount={riskData.high_risk_count}
              mediumRiskCount={riskData.medium_risk_count}
              lowRiskCount={riskData.low_risk_count}
              averageRiskScore={riskData.average_risk_score}
              totalExceptions={totalExceptions}
            />
          </section>

          {/* Section 2: Prominent High Risk Alert Card */}
          <section>
            <ProminentHighRiskAlert
              alerts={riskData.alerts}
              onInspectVendor={(vendorId) => {
                const v = riskData.vendors.find((item) => item.vendor_id === vendorId);
                if (v) handleSelectVendor(v);
              }}
            />
          </section>

          {/* Section 3: Portfolio Risk Trend Card */}
          <section>
            <PortfolioTrendChartCard trend={riskData.trend} />
          </section>

          {/* Section 4: Modern Stripe-Inspired Vendor Directory */}
          <section>
            <VendorDirectoryList
              vendors={riskData.vendors}
              onSelectVendor={handleSelectVendor}
            />
          </section>

          {/* Section 6: AI Insights */}
          <section>
            <AIInsightsGrid />
          </section>
        </>
      )}

      {/* Section 5: Slide-Over Vendor Dossier Drawer */}
      <VendorDossierSlidingDrawer
        vendor={selectedVendor}
        profile={matchedProfile}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
