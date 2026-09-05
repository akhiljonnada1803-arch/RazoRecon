'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { EMIOption, EMIRecommendationResponse } from '@/types/commerce';
import { 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  ChevronRight, 
  Percent, 
  Zap, 
  TrendingDown, 
  Wallet,
  ArrowRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EMIRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  price: number;
  productName?: string;
  onSelectPlan?: (plan: EMIOption) => void;
}

type TabType = 'all' | 'no_cost' | 'standard' | 'bank';

export function EMIRecommendationModal({
  isOpen,
  onClose,
  price,
  productName,
  onSelectPlan,
}: EMIRecommendationModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedPlan, setSelectedPlan] = useState<EMIOption | null>(null);

  const { data: emiData, isLoading } = useQuery<EMIRecommendationResponse>({
    queryKey: ['emi-recommendations', price],
    queryFn: async () => {
      const res = await apiClient.post<EMIRecommendationResponse>('/commerce/emi/recommend', {
        price,
        user_id: 'usr_customer_demo',
      });
      return res;
    },
    enabled: isOpen && price > 0,
  });

  useEffect(() => {
    if (emiData?.recommended_plan) {
      setSelectedPlan(emiData.recommended_plan);
    }
  }, [emiData]);

  if (!isOpen) return null;

  const filteredOptions = (emiData?.all_options || []).filter((opt) => {
    if (activeTab === 'all') return true;
    return opt.emi_type === activeTab;
  });

  const handleConfirmPlan = () => {
    if (selectedPlan && onSelectPlan) {
      onSelectPlan(selectedPlan);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-[#072654] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-[#0B72E7] flex items-center justify-center border border-blue-400/30 shadow-xs">
              <CreditCard className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  AI Smart EMI Recommendations
                </h3>
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                  Live Amortization
                </Badge>
              </div>
              <p className="text-xs text-blue-200/80">
                {productName ? `${productName} • ` : ''}Principal Amount: <strong className="text-white font-mono">₹{price.toLocaleString('en-IN')}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#0B72E7] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Calculating reducing balance amortization & scoring affordability...</p>
            </div>
          ) : emiData ? (
            <>
              {/* AI Recommendation Highlight Card */}
              {emiData.recommended_plan && (
                <div className="bg-gradient-to-r from-emerald-50 via-blue-50/70 to-indigo-50/70 border-2 border-emerald-300 rounded-3xl p-5 shadow-xs space-y-3 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider">
                          AI Recommended Best Option
                          <Badge className="bg-emerald-600 text-white text-[9px] font-extrabold border-0">
                            OPTIMAL BURDEN
                          </Badge>
                        </span>
                        <div className="text-base font-extrabold text-[#072654]">
                          {emiData.recommended_plan.tenure} Months {emiData.recommended_plan.emi_type === 'no_cost' ? 'No Cost EMI' : 'Flexible EMI'}
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-2xl font-black text-[#0B72E7] font-mono block leading-none">
                        ₹{emiData.recommended_plan.emi_amount.toLocaleString('en-IN')}<span className="text-xs text-slate-500 font-normal font-sans">/mo</span>
                      </span>
                      <span className="text-[11px] text-emerald-700 font-semibold">
                        {emiData.recommended_plan.interest_rate === 0 ? '0% Interest • ₹0 Processing Fee' : `${emiData.recommended_plan.interest_rate}% p.a.`}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white/80 rounded-2xl border border-emerald-200/80 text-xs text-slate-700 leading-relaxed">
                    <Info className="w-3.5 h-3.5 text-emerald-600 inline mr-1 -mt-0.5" />
                    <strong>Why AI Chose This:</strong> {emiData.recommendation_reason}
                  </div>

                  {/* Cashflow Impact Metric Bar */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-center font-medium">
                    <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                      <span className="text-slate-500 text-[10px] block">Monthly Cashflow Impact</span>
                      <span className="font-extrabold text-slate-900 font-mono">
                        {emiData.recommended_plan.monthly_burden_pct}%
                      </span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                      <span className="text-slate-500 text-[10px] block">Total Cumulative Interest</span>
                      <span className="font-extrabold text-emerald-700 font-mono">
                        ₹{emiData.recommended_plan.total_interest.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                      <span className="text-slate-500 text-[10px] block">Total Amount Paid</span>
                      <span className="font-extrabold text-[#072654] font-mono">
                        ₹{emiData.recommended_plan.total_payable.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
                {[
                  { id: 'all', label: 'All Tenures' },
                  { id: 'no_cost', label: 'No Cost EMI (0%)' },
                  { id: 'standard', label: 'Standard EMI' },
                  { id: 'bank', label: 'Bank Credit Cards' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-white text-[#0B72E7] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Plans Grid (3, 6, 9, 12, 18, 24 Months) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Available EMI Tenures ({filteredOptions.length} Plans)</span>
                  <span className="text-slate-400 font-normal text-[11px]">Select a plan to lock installment schedule</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredOptions.map((opt, idx) => {
                    const isSelected = selectedPlan?.tenure === opt.tenure && selectedPlan?.emi_type === opt.emi_type && selectedPlan?.bank_name === opt.bank_name;
                    return (
                      <div
                        key={`${opt.emi_type}_${opt.tenure}_${opt.bank_name || idx}`}
                        onClick={() => setSelectedPlan(opt)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                          isSelected
                            ? 'bg-blue-50/70 border-[#0B72E7] ring-2 ring-[#0B72E7]/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/60'
                        }`}
                      >
                        {opt.is_recommended && (
                          <div className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> AI PICK
                          </div>
                        )}

                        <div>
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-extrabold text-xs text-[#072654]">
                              {opt.tenure_label}
                            </span>
                            <Badge
                              className={`text-[9px] font-bold border-0 ${
                                opt.emi_type === 'no_cost'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {opt.emi_type === 'no_cost' ? '0% No Cost' : `${opt.interest_rate}% p.a.`}
                            </Badge>
                          </div>

                          <div className="text-lg font-black text-[#072654] font-mono leading-snug">
                            ₹{opt.emi_amount.toLocaleString('en-IN')}<span className="text-[10px] text-slate-500 font-normal font-sans">/mo</span>
                          </div>

                          {opt.bank_name && opt.emi_type === 'bank' && (
                            <span className="text-[10px] text-blue-700 font-semibold block mt-0.5">
                              {opt.bank_name}
                            </span>
                          )}
                        </div>

                        {/* Breakdown line items */}
                        <div className="space-y-1 text-[10px] border-t border-slate-100 pt-2.5 mt-2 text-slate-600">
                          <div className="flex justify-between">
                            <span>Total Interest:</span>
                            <span className="font-semibold text-slate-900 font-mono">
                              ₹{opt.total_interest.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Processing Fee:</span>
                            <span className="font-semibold text-slate-900 font-mono">
                              {opt.processing_fee === 0 ? 'FREE' : `₹${opt.processing_fee}`}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-slate-100 pt-1 font-bold text-[#072654]">
                            <span>Total Payable:</span>
                            <span className="font-mono">₹{opt.total_payable.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Radio selection check */}
                        <div className="pt-2 flex items-center justify-end">
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-[#0B72E7] bg-[#0B72E7] text-white'
                                : 'border-slate-300 group-hover:border-slate-400'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Instant Razorpay verification with zero paper documentation</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl text-xs font-semibold h-9 px-4 border-slate-200 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmPlan}
              disabled={!selectedPlan}
              className="rounded-xl text-xs font-bold h-9 px-5 bg-[#0B72E7] hover:bg-[#095ec2] text-white gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Confirm & Choose {selectedPlan?.tenure_label || 'EMI Plan'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
