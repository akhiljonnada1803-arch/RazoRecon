'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Megaphone, 
  Users, 
  Percent, 
  DollarSign, 
  Send, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomerSegment, CampaignGenerateRequest } from '@/types/campaign';

interface AICampaignGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  segments: CustomerSegment[];
  initialSegmentId?: string;
  onGenerate: (payload: CampaignGenerateRequest) => Promise<any>;
}

export function AICampaignGeneratorModal({
  isOpen,
  onClose,
  segments,
  initialSegmentId,
  onGenerate
}: AICampaignGeneratorModalProps) {
  const [goal, setGoal] = useState<'revenue_surge' | 'winback' | 'new_launch' | 'inventory_clearance'>('revenue_surge');
  const [segmentId, setSegmentId] = useState<string>(initialSegmentId || segments[0]?.id || 'seg_enterprise');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat_inr'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minOrderValue, setMinOrderValue] = useState<number>(5000);
  const [durationDays, setDurationDays] = useState<number>(14);
  const [channels, setChannels] = useState<string[]>(['WhatsApp Business', 'Email']);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleChannel = (ch: string) => {
    if (channels.includes(ch)) {
      if (channels.length > 1) setChannels(channels.filter(c => c !== ch));
    } else {
      setChannels([...channels, ch]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate({
        goal,
        target_segment_id: segmentId,
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_value: Number(minOrderValue),
        duration_days: Number(durationDays),
        channels
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center border border-blue-100 shadow-2xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#072654]">AI Campaign Generator</h2>
              <p className="text-xs text-slate-500">Autonomous goal-driven copywriting, discount optimization, and channel rollout.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* 1. Campaign Goal */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">1. Select Strategic Goal</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'revenue_surge', label: 'Revenue Surge', desc: 'Maximize AOV & volume' },
                { id: 'winback', label: 'Merchant Winback', desc: 'Reactivate dormant accounts' },
                { id: 'new_launch', label: 'Hardware Launch', desc: 'Early bird 5G POS fleet' },
                { id: 'inventory_clearance', label: 'Clearance Blitz', desc: 'Move surplus accessories' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    goal === g.id
                      ? 'border-[#0B72E7] bg-blue-50/60 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className={`font-bold block ${goal === g.id ? 'text-[#0B72E7]' : 'text-slate-800'}`}>
                    {g.label}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{g.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Target Segment */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">2. Target Customer Segment</label>
            <select
              value={segmentId}
              onChange={(e) => setSegmentId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#0B72E7]/20 focus:border-[#0B72E7]"
            >
              {segments.map((seg) => (
                <option key={seg.id} value={seg.id}>
                  {seg.name} ({seg.merchant_count} merchants • AOV ₹{seg.avg_order_value.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Discount Setup */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat_inr">Flat Amount (₹)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                {discountType === 'percentage' ? 'Discount %' : 'Flat Discount ₹'}
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Min Spend (₹)</label>
              <input
                type="number"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-semibold"
              />
            </div>
          </div>

          {/* 4. Multi-Channel Rollout */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">4. Distribution Channels</label>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'WhatsApp Business', icon: MessageSquare },
                { name: 'Email', icon: Mail },
                { name: 'SMS Alert', icon: Smartphone },
                { name: 'In-App Push', icon: Megaphone }
              ].map((ch) => {
                const Icon = ch.icon;
                const isSelected = channels.includes(ch.name);
                return (
                  <button
                    key={ch.name}
                    type="button"
                    onClick={() => toggleChannel(ch.name)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-[#0B72E7] text-[#0B72E7] shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{ch.name}</span>
                    {isSelected && <CheckCircle2 className="h-3 w-3 text-[#0B72E7] ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <Button variant="ghost" onClick={onClose} className="text-xs h-9 text-slate-500">
            Cancel
          </Button>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-[#0B72E7] hover:bg-blue-600 text-white font-bold text-xs gap-1.5 h-9 shadow-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating Campaign...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Generate & Activate Campaign
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
