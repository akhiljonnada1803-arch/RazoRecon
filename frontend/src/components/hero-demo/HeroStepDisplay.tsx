'use client';

import React from 'react';
import { HeroStepData, HeroScenario } from '@/types/hero_demo';
import { 
  Upload, 
  BrainCircuit, 
  MessageSquare, 
  Sparkles, 
  ShoppingCart, 
  CreditCard, 
  CheckCircle2, 
  TrendingUp, 
  Database, 
  Compass,
  Star,
  QrCode,
  Copy,
  Tag,
  ShieldCheck,
  Check,
  ArrowRight,
  Receipt,
  FileCheck,
  Zap,
  Bot
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HeroStepDisplayProps {
  currentStepData?: HeroStepData;
  scenario: HeroScenario;
  onJumpToCheckout?: () => void;
}

export function HeroStepDisplay({
  currentStepData,
  scenario,
  onJumpToCheckout,
}: HeroStepDisplayProps) {
  if (!currentStepData) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-500 text-sm">
        Initializing AI Commerce demo flow...
      </div>
    );
  }

  const stepNum = currentStepData.step_number;
  const d = currentStepData.data;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 relative overflow-hidden">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#0B72E7] to-[#072654] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
            {stepNum}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#072654]">
                {currentStepData.title}
              </h2>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                Phase #{stepNum} Active
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              {currentStepData.subtitle}
            </p>
          </div>
        </div>

        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs px-3 py-1 font-semibold self-start sm:self-auto">
          Actor: <strong className="ml-1 text-[#072654]">{currentStepData.actor}</strong>
        </Badge>
      </div>

      {/* ---------------------------------------------------- */}
      {/* STEP 1: Upload Catalog Visual */}
      {/* ---------------------------------------------------- */}
      {stepNum === 1 && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border-2 border-dashed border-[#0B72E7]/40 bg-blue-50/40 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 text-[#0B72E7] flex items-center justify-center mx-auto">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#072654]">
                {d.file_name || 'razorrecon_catalog_2026.json'}
              </h4>
              <p className="text-xs text-slate-500">
                Enterprise Product Catalog Ingested & Normalized into SQLite
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <Badge className="bg-blue-100 text-[#0B72E7] text-xs font-bold border-0">
                {d.total_skus || 50} Enterprise SKUs
              </Badge>
              <Badge className="bg-indigo-100 text-indigo-700 text-xs font-bold border-0">
                {d.categories_count || 7} Verticals
              </Badge>
              <Badge className="bg-emerald-100 text-emerald-700 text-xs font-bold border-0">
                ₹14.51 Cr Valuation
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 2: AI Embeddings Visual */}
      {/* ---------------------------------------------------- */}
      {stepNum === 2 && (
        <div className="space-y-4">
          <div className="p-5 bg-gradient-to-br from-[#072654] to-[#0a356e] text-white rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-200 flex items-center gap-1.5">
                <BrainCircuit className="h-4 w-4 text-blue-300 animate-pulse" />
                Vector Embeddings & Semantic Tax Indexing (Dimension: 768)
              </span>
              <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                100% Tax Mapped
              </Badge>
            </div>
            <p className="text-xs text-blue-100/90 leading-relaxed">
              Every hardware item, license, and accessory has been transformed into semantic vector embeddings with direct mapping to Indian HSN/SAC codes (8470, 9983) and active Offer Engine rules.
            </p>
            <div className="p-3 bg-white/10 rounded-xl font-mono text-[11px] text-blue-200 flex items-center justify-between">
              <span>Vector Hash: [0.042, -0.128, 0.315, 0.089, -0.054...]</span>
              <span className="text-emerald-300 font-bold">Latency: 12ms</span>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 3: Customer Inquiry Prompt */}
      {/* ---------------------------------------------------- */}
      {stepNum === 3 && (
        <div className="space-y-4">
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[#0B72E7] text-white flex items-center justify-center font-bold text-xs">
                  {scenario.customer_name.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">
                    {scenario.customer_name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {scenario.customer_email} • {scenario.business_type}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-bold text-[#072654]">
                Budget: ₹{scenario.budget_inr.toLocaleString('en-IN')}
              </Badge>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed italic">
              "{scenario.initial_prompt}"
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 4: Agent Recommendations */}
      {/* ---------------------------------------------------- */}
      {stepNum === 4 && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(d.recommendations || []).map((rec: any, idx: number) => (
              <div
                key={rec.id || idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#0B72E7] transition-all space-y-2.5"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={rec.image_url}
                    alt={rec.name}
                    className="h-14 w-14 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-slate-900 line-clamp-1">
                        {rec.name}
                      </span>
                      <Badge className="bg-emerald-50 text-emerald-700 text-[9px] px-1 py-0 font-bold shrink-0">
                        {rec.match_score_pct || 98}% Match
                      </Badge>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {rec.sku} • {rec.category}
                    </span>
                    <div className="font-extrabold text-xs text-[#072654] mt-0.5">
                      ₹{rec.price?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(rec.key_features || []).map((f: string, fIdx: number) => (
                    <span key={fIdx} className="text-[9px] bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 5: Cart Assembly */}
      {/* ---------------------------------------------------- */}
      {stepNum === 5 && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-xs text-slate-900">
                Cart Items ({(d.cart_items || []).length} SKUs • {d.total_units || 6} Total Units)
              </span>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold">
                Coupon: {d.coupon_code || 'RAZOR2026'} (10% Off)
              </Badge>
            </div>

            <div className="space-y-2">
              {(d.cart_items || []).map((it: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0B72E7]">{it.quantity}x</span>
                    <span className="font-semibold text-slate-800">{it.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₹{it.subtotal?.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Subtotal: ₹{d.subtotal?.toLocaleString('en-IN')} | Tax (18% GST): +₹{d.tax_amount?.toLocaleString('en-IN')} | Discount: -₹{d.discount_amount?.toLocaleString('en-IN')}</span>
              <span className="text-sm font-extrabold text-[#072654]">
                Final: ₹{d.final_amount?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 6: Razorpay Order Creation */}
      {/* ---------------------------------------------------- */}
      {stepNum === 6 && (
        <div className="space-y-4">
          <div className="p-5 bg-gradient-to-br from-[#072654] to-[#0a356e] text-white rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-300" />
                <span className="font-bold text-xs text-white">
                  Razorpay Order Provisioned ({d.order_id})
                </span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] font-bold">
                Test Sandbox Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="space-y-1">
                <span className="text-[10px] text-blue-200 uppercase font-bold block">
                  Total Payable Amount
                </span>
                <span className="text-2xl font-extrabold text-white block">
                  ₹{d.order_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-blue-200/80 block">
                  Payment Link: <span className="font-mono text-white underline">{d.payment_link}</span>
                </span>
              </div>

              <div className="bg-white p-2 rounded-xl text-center text-slate-900 w-fit sm:ml-auto">
                <QrCode className="h-20 w-20 text-slate-900 mx-auto" />
                <span className="text-[9px] font-mono text-slate-500 block">UPI: razorpay.test@icici</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 7: Payment Captured & Reconciled */}
      {/* ---------------------------------------------------- */}
      {stepNum === 7 && (
        <div className="space-y-4">
          <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="font-bold text-sm text-emerald-900">
                  Payment Captured & 3-Way Reconciled
                </span>
              </div>
              <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                0 Discrepancies
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
              <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                <span className="text-[10px] text-slate-500 block">Gross Amount</span>
                <span className="font-bold text-slate-900">₹{d.gross_amount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                <span className="text-[10px] text-slate-500 block">2% MDR + 18% GST</span>
                <span className="font-bold text-rose-600">-₹{(d.gateway_fee + d.gst_on_fee)?.toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                <span className="text-[10px] text-slate-500 block">Net Bank Deposit</span>
                <span className="font-bold text-emerald-700">₹{d.net_deposit?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 8: Upsell Recommendations */}
      {/* ---------------------------------------------------- */}
      {stepNum === 8 && (
        <div className="space-y-4">
          <div className="p-5 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                <span className="font-bold text-sm text-indigo-900">
                  Revenue Growth Upsell Opportunity
                </span>
              </div>
              <Badge className="bg-indigo-600 text-white text-[10px] font-bold">
                +{d.projected_revenue_lift_pct || 28.5}% Projected Lift
              </Badge>
            </div>

            {d.upsell_product && (
              <div className="bg-white p-3.5 rounded-xl border border-indigo-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={d.upsell_product.image_url}
                    alt={d.upsell_product.name}
                    className="h-12 w-12 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">{d.upsell_product.name}</span>
                    <span className="text-[10px] text-slate-500">{d.upsell_product.category} • Basket Affinity Confidence: {d.basket_affinity_confidence}%</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-[#072654] block">₹{d.upsell_product.price?.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-emerald-600 font-bold">+{d.margin_expansion_pct}% Margin</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 9: Stored in Memory Engine */}
      {/* ---------------------------------------------------- */}
      {stepNum === 9 && (
        <div className="space-y-4">
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-[#0B72E7]" />
                <span className="font-bold text-sm text-[#072654]">
                  Behavioral Memory Dossier Updated
                </span>
              </div>
              <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px] font-bold">
                {d.profile?.tier || 'Platinum Tier'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Total Lifetime Spend</span>
                <span className="font-bold text-slate-900">₹{d.profile?.total_spend_inr?.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Average Order Value</span>
                <span className="font-bold text-slate-900">₹{d.profile?.aov_inr?.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Risk Profile</span>
                <span className="font-bold text-emerald-600">0 Disputes</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Loyalty Points</span>
                <span className="font-bold text-[#0B72E7]">{d.profile?.loyalty_points || 1850} pts</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 10: Personalized Future Recommendations */}
      {/* ---------------------------------------------------- */}
      {stepNum === 10 && (
        <div className="space-y-4">
          <div className="p-5 bg-gradient-to-br from-blue-900 to-[#072654] text-white rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-blue-300" />
                <span className="font-bold text-sm text-white">
                  Next-Purchase Procurement Proposals (10% VIP Loyalty Applied)
                </span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] font-bold">
                1-Click Reorder Ready
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {(d.recommendations || []).map((rec: any, idx: number) => (
                <div key={idx} className="bg-white/10 p-3 rounded-xl border border-white/10 text-xs space-y-1.5">
                  <span className="font-bold text-white block line-clamp-1">{rec.name}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-extrabold text-blue-200 text-sm">₹{rec.price?.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-slate-300 line-through">₹{rec.original_price?.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 block font-semibold">✓ 10% VIP Loyalty Rebate</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
