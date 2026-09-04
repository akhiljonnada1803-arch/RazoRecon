'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Megaphone, 
  Sliders, 
  Users, 
  TrendingUp, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  Mail,
  MessageSquare,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CampaignHeader } from '@/components/campaigns/CampaignHeader';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { DiscountSimulatorCard } from '@/components/campaigns/DiscountSimulatorCard';
import { CustomerSegmentGrid } from '@/components/campaigns/CustomerSegmentGrid';
import { AICampaignGeneratorModal } from '@/components/campaigns/AICampaignGeneratorModal';
import { CampaignForecastChart } from '@/components/campaigns/CampaignForecastChart';
import { 
  Campaign, 
  CustomerSegment, 
  CampaignListResponse,
  CampaignGenerateRequest,
  CampaignSimulationRequest,
  CampaignSimulationResponse 
} from '@/types/campaign';

export default function CampaignsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'simulator' | 'segments'>('campaigns');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(false);
  const [generatorInitialSegment, setGeneratorInitialSegment] = useState<string | undefined>(undefined);
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState<Campaign | null>(null);

  // 1. Fetch campaigns overview & segments
  const { data: overview, isLoading, error } = useQuery<CampaignListResponse>({
    queryKey: ['campaigns', 'overview'],
    queryFn: () => apiClient.get('/campaigns'),
  });

  // 2. Mutations
  const generateCampaignMutation = useMutation({
    mutationFn: (payload: CampaignGenerateRequest) => apiClient.post('/campaigns/generate', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'overview'] });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiClient.patch(`/campaigns/${id}/status?status=${status}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'overview'] });
    }
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/campaigns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'overview'] });
    }
  });

  // Simulator helper function
  const handleSimulate = async (params: {
    target_segment_id: string;
    discount_type: 'percentage' | 'flat_inr';
    discount_value: number;
    min_order_value: number;
    duration_days: number;
  }): Promise<CampaignSimulationResponse> => {
    return await apiClient.post('/campaigns/simulate', params);
  };

  const handleLaunchFromSimulator = async (params: {
    segment_id: string;
    discount_type: 'percentage' | 'flat_inr';
    discount_value: number;
    min_order_value: number;
    duration_days: number;
  }) => {
    await generateCampaignMutation.mutateAsync({
      goal: 'revenue_surge',
      target_segment_id: params.segment_id,
      discount_type: params.discount_type,
      discount_value: params.discount_value,
      min_order_value: params.min_order_value,
      duration_days: params.duration_days,
      channels: ['WhatsApp Business', 'Email']
    });
    setActiveTab('campaigns');
  };

  const handleGenerateForSegment = (segmentId: string) => {
    setGeneratorInitialSegment(segmentId);
    setIsGeneratorOpen(true);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    toggleStatusMutation.mutate({ id, status: newStatus });
  };

  const handleDeleteCampaign = (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      deleteCampaignMutation.mutate(id);
    }
  };

  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
      {/* 1. Header with KPIs */}
      <CampaignHeader
        overview={overview}
        onOpenGenerator={() => {
          setGeneratorInitialSegment(undefined);
          setIsGeneratorOpen(true);
        }}
        onOpenSimulator={() => setActiveTab('simulator')}
      />

      {/* 2. Workstation Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          {[
            { id: 'campaigns', label: 'All Campaigns', icon: Megaphone, count: overview?.total_campaigns },
            { id: 'simulator', label: 'Discount Elasticity Simulator', icon: Sliders },
            { id: 'segments', label: 'Customer Segments', icon: Users, count: overview?.segments?.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                  isActive
                    ? 'border-[#0B72E7] text-[#0B72E7] bg-white rounded-t-xl shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-blue-100 text-[#0B72E7]' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Tab Contents */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs font-mono">
          Loading Campaign Orchestrator data...
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              {/* Campaign Table displaying: Campaign Name, Target Segment, Expected Revenue Lift, Projected Orders */}
              <CampaignTable
                campaigns={overview?.campaigns || []}
                onToggleStatus={handleToggleStatus}
                onDeleteCampaign={handleDeleteCampaign}
                onSelectCampaign={(camp) => setSelectedCampaignDetail(camp)}
              />

              {/* Revenue Forecaster */}
              {overview?.campaigns && overview.campaigns.length > 0 && (
                <CampaignForecastChart campaigns={overview.campaigns} />
              )}
            </div>
          )}

          {activeTab === 'simulator' && overview?.segments && (
            <div className="space-y-6">
              <DiscountSimulatorCard
                segments={overview.segments}
                onSimulate={handleSimulate}
                onLaunchCampaign={handleLaunchFromSimulator}
              />
            </div>
          )}

          {activeTab === 'segments' && overview?.segments && (
            <div className="space-y-6">
              <CustomerSegmentGrid
                segments={overview.segments}
                onGenerateForSegment={handleGenerateForSegment}
              />
            </div>
          )}
        </div>
      )}

      {/* 4. AI Campaign Generator Modal */}
      {overview?.segments && (
        <AICampaignGeneratorModal
          isOpen={isGeneratorOpen}
          onClose={() => setIsGeneratorOpen(false)}
          segments={overview.segments}
          initialSegmentId={generatorInitialSegment}
          onGenerate={async (payload) => {
            await generateCampaignMutation.mutateAsync(payload);
          }}
        />
      )}

      {/* 5. Campaign Detail View Modal */}
      {selectedCampaignDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#0B72E7]" />
                <h3 className="text-sm font-bold text-[#072654]">{selectedCampaignDetail.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCampaignDetail(null)}
                className="h-7 w-7 rounded-lg hover:bg-slate-200/60 text-slate-400 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Target Segment</span>
                  <span className="font-bold text-slate-800">{selectedCampaignDetail.target_segment}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80">
                  <span className="text-[10px] text-emerald-700 uppercase font-mono block">Expected Lift</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    +{formatINR(selectedCampaignDetail.expected_revenue_lift)} (+{selectedCampaignDetail.expected_revenue_lift_pct}%)
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                <span className="text-[10px] font-bold text-blue-900 uppercase font-mono block">AI Generated Subject</span>
                <p className="text-xs font-semibold text-blue-950">{selectedCampaignDetail.ai_copy_subject}</p>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">AI Message Body</span>
                <p className="text-xs text-slate-700 leading-relaxed">{selectedCampaignDetail.ai_copy_body}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                <span>Projected Orders: <strong className="text-slate-800 font-mono">{selectedCampaignDetail.projected_orders}</strong></span>
                <span>ROI: <strong className="text-[#0B72E7] font-mono">{selectedCampaignDetail.roi_percentage}%</strong></span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <Button
                size="sm"
                onClick={() => setSelectedCampaignDetail(null)}
                className="bg-[#0B72E7] text-white text-xs font-bold"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
