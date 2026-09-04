'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  TrendingUp, 
  Percent, 
  DollarSign, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  ShoppingBag, 
  Layers, 
  CheckCircle2, 
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CustomerSegment, 
  CampaignSimulationResponse 
} from '@/types/campaign';

interface DiscountSimulatorCardProps {
  segments: CustomerSegment[];
  onSimulate: (params: {
    target_segment_id: string;
    discount_type: 'percentage' | 'flat_inr';
    discount_value: number;
    min_order_value: number;
    duration_days: number;
  }) => Promise<CampaignSimulationResponse>;
  onLaunchCampaign: (params: {
    segment_id: string;
    discount_type: 'percentage' | 'flat_inr';
    discount_value: number;
    min_order_value: number;
    duration_days: number;
  }) => void;
}

export function DiscountSimulatorCard({
  segments,
  onSimulate,
  onLaunchCampaign
}: DiscountSimulatorCardProps) {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(segments[0]?.id || 'seg_d2c_growth');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat_inr'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minOrderValue, setMinOrderValue] = useState<number>(5000);
  const [durationDays, setDurationDays] = useState<number>(14);
  const [simulationResult, setSimulationResult] = useState<CampaignSimulationResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const selectedSegment = segments.find(s => s.id === selectedSegmentId) || segments[0];

  const runSimulation = async () => {
    setIsCalculating(true);
    try {
      const res = await onSimulate({
        target_segment_id: selectedSegmentId,
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_value: Number(minOrderValue),
        duration_days: durationDays
      });
      setSimulationResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [selectedSegmentId, discountType, discountValue, minOrderValue, durationDays]);

  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center border border-blue-100 shadow-2xs">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#072654]">Interactive Price Elasticity & Discount Simulator</h2>
              <Badge className="bg-blue-100 text-[#0B72E7] border-blue-200 text-[10px] font-mono">
                Microeconomic Model
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Simulate price elasticity, conversion rate lift, volume expansion, and net profit payoff in real time.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setDiscountValue(15);
            setMinOrderValue(5000);
            setDurationDays(14);
          }}
          className="text-xs gap-1 h-8 text-slate-600"
        >
          <RotateCcw className="h-3 w-3" />
          Reset Defaults
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {/* Left Form: Parameter Controls (5 cols) */}
        <div className="lg:col-span-5 p-6 space-y-6 bg-slate-50/40">
          {/* 1. Target Segment Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Target Customer Segment</span>
              <span className="text-[11px] font-normal text-slate-400 font-mono">
                {selectedSegment?.merchant_count.toLocaleString()} merchants
              </span>
            </label>
            <select
              value={selectedSegmentId}
              onChange={(e) => setSelectedSegmentId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B72E7]/20 focus:border-[#0B72E7]"
            >
              {segments.map((seg) => (
                <option key={seg.id} value={seg.id}>
                  {seg.name} ({seg.merchant_count} merchants • AOV ₹{seg.avg_order_value.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
            {selectedSegment && (
              <p className="text-[11px] text-slate-500 italic">
                {selectedSegment.description} (Recommended: {selectedSegment.recommended_discount_range})
              </p>
            )}
          </div>

          {/* 2. Discount Type Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Discount Mechanic</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setDiscountType('percentage');
                  if (discountValue > 40) setDiscountValue(15);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  discountType === 'percentage'
                    ? 'bg-[#0B72E7] text-white border-[#0B72E7] shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Percent className="h-3.5 w-3.5" />
                Percentage Off (%)
              </button>

              <button
                type="button"
                onClick={() => {
                  setDiscountType('flat_inr');
                  setDiscountValue(2500);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  discountType === 'flat_inr'
                    ? 'bg-[#0B72E7] text-white border-[#0B72E7] shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <DollarSign className="h-3.5 w-3.5" />
                Flat Rebate (₹ INR)
              </button>
            </div>
          </div>

          {/* 3. Discount Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                {discountType === 'percentage' ? 'Discount Value' : 'Flat Rebate Amount'}
              </span>
              <span className="font-bold font-mono text-[#0B72E7] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-sm">
                {discountType === 'percentage' ? `${discountValue}% OFF` : `₹${discountValue.toLocaleString('en-IN')}`}
              </span>
            </div>

            {discountType === 'percentage' ? (
              <div className="space-y-1">
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full accent-[#0B72E7] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>5% (Conservative)</span>
                  <span>20% (Optimal)</span>
                  <span>40% (Aggressive)</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <input
                  type="range"
                  min="1000"
                  max="20000"
                  step="500"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full accent-[#0B72E7] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>₹1,000</span>
                  <span>₹10,000</span>
                  <span>₹20,000</span>
                </div>
              </div>
            )}
          </div>

          {/* 4. Minimum Spend & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700">Min Spend Threshold (₹)</label>
              <input
                type="number"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700">Duration (Days)</label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
              >
                <option value={7}>7 Days (Flash)</option>
                <option value={14}>14 Days (Standard)</option>
                <option value={21}>21 Days (Extended)</option>
                <option value={30}>30 Days (Monthly)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Side: Simulation Results & Forecast (7 cols) */}
        <div className="lg:col-span-7 p-6 space-y-6 flex flex-col justify-between">
          {simulationResult && (
            <div className="space-y-5">
              {/* Top Result Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-emerald-50/80 border border-blue-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Expected Net Revenue Lift
                  </span>
                  <div className="text-2xl font-bold text-emerald-600 font-mono flex items-center gap-1.5 mt-0.5">
                    <span>+{formatINR(simulationResult.net_revenue_lift)}</span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      +{simulationResult.expected_revenue_lift_pct}%
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Campaign ROI
                  </span>
                  <div className="text-2xl font-bold text-[#072654] font-mono mt-0.5">
                    {simulationResult.roi_percentage}%
                  </div>
                </div>
              </div>

              {/* Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Elasticity Lift</span>
                  <span className="text-base font-bold text-[#0B72E7] font-mono">
                    +{simulationResult.conversion_rate_lift_pct}%
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {simulationResult.price_elasticity_factor}x factor
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Projected Orders</span>
                  <span className="text-base font-bold text-purple-600 font-mono">
                    {simulationResult.projected_orders}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    +{simulationResult.incremental_orders} incr.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Gross Revenue</span>
                  <span className="text-base font-bold text-slate-800 font-mono">
                    {formatINR(simulationResult.gross_campaign_revenue)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {durationDays}d window
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Margin Impact</span>
                  <span className={`text-base font-bold font-mono ${simulationResult.net_margin_impact_pct < 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {simulationResult.net_margin_impact_pct > 0 ? '+' : ''}{simulationResult.net_margin_impact_pct}%
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {simulationResult.projected_margin_pct}% post-disc
                  </span>
                </div>
              </div>

              {/* AI Strategy Verdict */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <Zap className="h-4 w-4 text-[#0B72E7] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800">AI Economic Verdict</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {simulationResult.ai_strategy_verdict}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Launch Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-blue-500" />
              <span>Simulated parameters will be saved as an active automated campaign.</span>
            </div>

            <Button
              onClick={() => onLaunchCampaign({
                segment_id: selectedSegmentId,
                discount_type: discountType,
                discount_value: discountValue,
                min_order_value: minOrderValue,
                duration_days: durationDays
              })}
              className="bg-[#0B72E7] hover:bg-blue-600 text-white font-bold text-xs gap-1.5 h-9 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Launch Simulated Campaign
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
