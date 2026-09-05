'use client';

import React from 'react';
import { CampaignOptimizationDashboard } from '@/components/campaigns/CampaignOptimizationDashboard';

export default function GrowthCampaignsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
      <CampaignOptimizationDashboard />
    </div>
  );
}
