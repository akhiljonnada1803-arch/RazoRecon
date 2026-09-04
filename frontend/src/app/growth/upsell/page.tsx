'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { UpsellRule } from '@/types/growth';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  ShoppingBag, 
  Layers, 
  Plus, 
  Percent, 
  Laptop, 
  Mouse, 
  ShieldCheck, 
  Briefcase 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function UpsellEnginePage() {
  const { data: rules, isLoading } = useQuery<UpsellRule[]>({
    queryKey: ['growth', 'upsell'],
    queryFn: () => apiClient.get('/growth/upsell'),
  });

  const [selectedRuleId, setSelectedRuleId] = useState<string>('rule_laptop');

  const activeRule = (rules || []).find((r) => r.id === selectedRuleId) || (rules ? rules[0] : undefined);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Intelligent Upsell & Cross-Sell Engine
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                Real-Time Basket Optimization
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Predictive Basket Expansion & Add-On Modeling
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
              When a buyer adds a core SKU, the AI engine dynamically formulates complementary accessories and warranty tiers to maximize average order value.
            </p>
          </div>
        </div>
      </div>

      {/* Rule Switcher Tabs */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-2 overflow-x-auto custom-scrollbar">
        {(rules || []).map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRuleId(r.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              selectedRuleId === r.id
                ? 'bg-[#0B72E7] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{r.trigger_product}</span>
            <Badge
              variant="outline"
              className={selectedRuleId === r.id ? 'bg-white/20 text-white border-white/30 text-[9px]' : 'bg-white text-slate-600 text-[9px]'}
            >
              +{r.expected_uplift_pct}% Uplift
            </Badge>
          </button>
        ))}
      </div>

      {activeRule && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Stage: Trigger & Addons - 7 cols */}
          <div className="lg:col-span-7 space-y-4">
            {/* Trigger Base Product */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px] font-bold">
                  Primary Trigger Product
                </Badge>
                <span className="text-xs font-mono text-slate-400">Category: {activeRule.trigger_category}</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{activeRule.trigger_product}</h3>
                  <span className="text-xs text-slate-500">Customer added this item to procurement cart</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block">Base Price</span>
                  <span className="font-extrabold text-slate-900 font-mono text-base">
                    ₹{activeRule.trigger_price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Suggested Add-Ons */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0B72E7]" />
                <h3 className="text-sm font-bold text-slate-900">AI-Formulated Cross-Sell & Upgrade Add-Ons</h3>
              </div>

              {activeRule.recommendations.map((addon, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-2 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[9px] font-bold">
                        {addon.type}
                      </Badge>
                      <span className="font-bold text-slate-900">{addon.name}</span>
                    </div>
                    <span className="font-extrabold text-[#0B72E7] font-mono">
                      +₹{addon.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600">{addon.benefit}</p>

                  <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-100 text-slate-500">
                    <span>Affinity Score: {addon.affinity_score}%</span>
                    <span className="text-emerald-600 font-semibold">Instant Cart Inclusion</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Value Uplift Comparison Box - 5 cols */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Real-Time Basket Impact Metrics
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Current Cart Value</span>
                  <span className="font-bold text-slate-700 font-mono text-sm">
                    ₹{activeRule.current_cart_value.toLocaleString('en-IN')}
                  </span>
                </div>
                <Badge variant="outline" className="bg-white text-slate-600 text-[10px]">
                  Baseline
                </Badge>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-600 font-semibold block uppercase tracking-wider">Predicted Cart Value</span>
                  <span className="font-extrabold text-[#0B72E7] font-mono text-base">
                    ₹{activeRule.predicted_cart_value.toLocaleString('en-IN')}
                  </span>
                </div>
                <Badge className="bg-[#0B72E7] text-white text-[10px] font-mono font-bold">
                  +{activeRule.expected_uplift_pct}% Lift
                </Badge>
              </div>

              {/* Summary Breakdown */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Value Delta</span>
                  <span className="text-emerald-600 font-bold">+₹{(activeRule.predicted_cart_value - activeRule.current_cart_value).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Gross Margin Expansion</span>
                  <span className="text-emerald-600 font-bold">+16.4%</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Purchase Probability</span>
                  <span className="text-slate-800 font-bold">88.4%</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                Live ReAct Rule Active
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                Autonomous Commerce Agent automatically injects these add-on cards in chat dialogues and checkout sidebars.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
