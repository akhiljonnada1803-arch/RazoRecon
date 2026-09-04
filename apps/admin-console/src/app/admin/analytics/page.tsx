'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MetricCard } from '@/components/common/MetricCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  TrendingUp, 
  Users, 
  Store, 
  Sparkles, 
  Package, 
  Truck, 
  ShoppingBag, 
  Bot, 
  Layers, 
  RefreshCw,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  VendorRiskDashboardDTO, 
  MerchantAnalyticsDTO, 
  BuyerAnalyticsDTO 
} from '@/types/vendor_risk';
import { formatCurrency } from '@/lib/utils';

export default function MerchantBuyerIntelligencePage() {
  const [activeTab, setActiveTab] = useState<'MERCHANT' | 'BUYER'>('MERCHANT');
  const [buyerSearchTerm, setBuyerSearchTerm] = useState('');

  const { data, isLoading, isFetching, refetch } = useQuery<VendorRiskDashboardDTO>({
    queryKey: ['vendor-risk-dashboard'],
    queryFn: () => apiClient.get('/vendor-risk'),
  });

  const merchantIntel: MerchantAnalyticsDTO | undefined = data?.merchant_intelligence;
  const buyerIntel: BuyerAnalyticsDTO | undefined = data?.buyer_intelligence;

  const filteredBuyers = (buyerIntel?.top_buyers || []).filter((b) =>
    b.name.toLowerCase().includes(buyerSearchTerm.toLowerCase()) ||
    b.email.toLowerCase().includes(buyerSearchTerm.toLowerCase()) ||
    b.preferred_category.toLowerCase().includes(buyerSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
                Merchant & Buyer Intelligence
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <Activity className="w-3.5 h-3.5 mr-1" />
                AI Behavioral Telemetry
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Enterprise Commerce & Behavioral Intelligence
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Granular store operations analytics, fulfillment SLA benchmarks, SKU GMV velocity, buyer lifetime value (LTV), churn risk prediction, and agent shopping patterns.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl font-medium text-xs gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>{isFetching ? 'Refreshing...' : 'Refresh Telemetry'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Suite Mode Switcher */}
      <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs max-w-md">
        <button
          onClick={() => setActiveTab('MERCHANT')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'MERCHANT'
              ? 'bg-[#072654] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Merchant Store Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('BUYER')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'BUYER'
              ? 'bg-[#0B72E7] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Buyer LTV & Churn Analytics</span>
        </button>
      </div>

      {/* TAB 1: MERCHANT STORE ANALYTICS */}
      {activeTab === 'MERCHANT' && (
        <div className="space-y-6">
          {/* Merchant KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Annualized Revenue Runrate"
              value={formatCurrency(merchantIntel?.revenue_runrate_inr || 6727368)}
              subtitle={`+${merchantIntel?.gmv_growth_pct || 28.9}% GMV growth YoY`}
              trend={{ value: merchantIntel?.gmv_growth_pct || 28.9, isPositive: true }}
              icon={TrendingUp}
            />
            <MetricCard
              title="Fulfillment SLA Score"
              value={`${merchantIntel?.fulfillment_score || 98.4}%`}
              subtitle="T+2 delivery commitment met"
              trend={{ value: 98.4, isPositive: true }}
              icon={Truck}
            />
            <MetricCard
              title="Inventory Health Index"
              value={`${merchantIntel?.inventory_health_pct || 94.2}%`}
              subtitle={`${merchantIntel?.in_stock_skus_count || 44} In Stock • ${merchantIntel?.low_stock_skus_count || 6} Low Stock`}
              trend={{ value: 94.2, isPositive: true }}
              icon={Package}
            />
            <MetricCard
              title="Autonomous Agent Conversion"
              value={`${merchantIntel?.conversion_metrics.agent_conversion_pct || 82.1}%`}
              subtitle="Cart-to-purchase completion"
              trend={{ value: 14.6, isPositive: true }}
              icon={Bot}
            />
          </div>

          {/* Conversion Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Storefront Cart-to-Checkout
              </span>
              <div className="text-2xl font-bold text-[#072654]">
                {merchantIntel?.conversion_metrics.cart_to_checkout_pct || 68.4}%
              </div>
              <p className="text-xs text-slate-500">Benchmark: 62% in D2C tech</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                AI Agent Order Velocity
              </span>
              <div className="text-2xl font-bold text-[#0B72E7]">
                {merchantIntel?.conversion_metrics.agent_conversion_pct || 82.1}%
              </div>
              <p className="text-xs text-slate-500">+19.7% higher than manual web</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Repeat Buyer Rate (90d)
              </span>
              <div className="text-2xl font-bold text-purple-700">
                {merchantIntel?.conversion_metrics.repeat_buyer_rate_pct || 41.5}%
              </div>
              <p className="text-xs text-slate-500">Strong cohort loyalty</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Abandonment Recovery
              </span>
              <div className="text-2xl font-bold text-emerald-600">
                {merchantIntel?.conversion_metrics.abandonment_recovery_pct || 34.2}%
              </div>
              <p className="text-xs text-slate-500">Via smart WhatsApp triggers</p>
            </div>
          </div>

          {/* Top Performing SKUs Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#0B72E7]" />
                <h3 className="font-bold text-slate-900 text-sm">Top Performing Products & GMV Velocity</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Ranked by 30d GMV</span>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <TableRow>
                    <TableHead className="py-3 px-4">Product SKU & Title</TableHead>
                    <TableHead className="py-3 px-4">Category</TableHead>
                    <TableHead className="py-3 px-4">Units Sold</TableHead>
                    <TableHead className="py-3 px-4">Total GMV</TableHead>
                    <TableHead className="py-3 px-4">Inventory Health</TableHead>
                    <TableHead className="py-3 px-4 text-right">Conversion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs divide-y divide-slate-100">
                  {(merchantIntel?.top_products || []).map((p) => (
                    <TableRow key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div>{p.title}</div>
                        <span className="text-[10px] font-mono text-slate-400">{p.id}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{p.category}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.sales_count} units</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0B72E7]">{formatCurrency(p.gmv_inr)}</td>
                      <td className="py-3.5 px-4">
                        <Badge
                          className={`text-[10px] font-semibold ${
                            p.stock_status.includes('Low')
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {p.stock_status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                        {p.conversion_rate_pct}%
                      </td>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUYER LTV & CHURN ANALYTICS */}
      {activeTab === 'BUYER' && (
        <div className="space-y-6">
          {/* Buyer KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Active Buyer Base"
              value={`${buyerIntel?.total_buyers_count || 323} Buyers`}
              subtitle="Registered across all touchpoints"
              trend={{ value: 22.4, isPositive: true }}
              icon={Users}
            />
            <MetricCard
              title="Average Buyer LTV"
              value={formatCurrency(buyerIntel?.avg_ltv_inr || 20827)}
              subtitle="Across multi-order history"
              trend={{ value: 18.0, isPositive: true }}
              icon={TrendingUp}
            />
            <MetricCard
              title="Repeat Purchase Rate"
              value={`${buyerIntel?.repeat_purchase_rate_pct || 41.5}%`}
              subtitle="2+ completed purchases"
              trend={{ value: 41.5, isPositive: true }}
              icon={ShoppingBag}
            />
            <MetricCard
              title="AI Recommendation Lift"
              value={`${buyerIntel?.ai_recommendations_influence_pct || 62.4}%`}
              subtitle="Orders influenced by AI recs"
              trend={{ value: 31.8, isPositive: true }}
              icon={Sparkles}
            />
          </div>

          {/* Buying Patterns by Acquisition Channel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#0B72E7]" />
                  <h3 className="font-bold text-slate-900 text-sm">Buying Patterns by Channel</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Agent vs Manual</span>
              </div>

              <div className="space-y-3">
                {(buyerIntel?.buying_patterns || []).map((bp, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{bp.channel}</span>
                      <span className="font-mono font-bold text-[#0B72E7]">{bp.share_pct}% ({bp.orders_count} orders)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0B72E7] h-full rounded-full"
                        style={{ width: `${bp.share_pct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Avg Order Value: {formatCurrency(bp.avg_order_value_inr)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Churn Risk Prediction Matrix */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-slate-900 text-sm">Buyer Churn Risk Breakdown</h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono bg-blue-50 text-[#0B72E7] border-blue-200">
                    Predictive AI Model
                  </Badge>
                </div>

                <div className="space-y-4 mt-5">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">Low Churn Risk (Loyal)</span>
                      <p className="text-[11px] text-emerald-700">Purchased in last 30d with repeat pattern</p>
                    </div>
                    <span className="text-xl font-extrabold font-mono text-emerald-800">206 (64%)</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-950 block">Medium Risk (Cooldown)</span>
                      <p className="text-[11px] text-amber-700">Inactive for 30-60 days; target with discount</p>
                    </div>
                    <span className="text-xl font-extrabold font-mono text-amber-800">78 (24%)</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-rose-950 block">High Risk (At-Risk)</span>
                      <p className="text-[11px] text-rose-700">No activity &gt; 60 days; trigger AI win-back offer</p>
                    </div>
                    <span className="text-xl font-extrabold font-mono text-rose-800">39 (12%)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Model Confidence: <strong className="text-slate-800">96.8%</strong></span>
                <span className="text-[#0B72E7] font-semibold flex items-center gap-1 cursor-pointer hover:underline">
                  Launch Win-back Campaign <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Top Buyers Cohort Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0B72E7]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  High-Value Buyer Cohorts & Next-Best Recommendations
                </h3>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search buyer name, email, category..."
                  value={buyerSearchTerm}
                  onChange={(e) => setBuyerSearchTerm(e.target.value)}
                  className="pl-9 bg-slate-50 border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <TableRow>
                    <TableHead className="py-3 px-4">Buyer Name & Email</TableHead>
                    <TableHead className="py-3 px-4">Lifetime Value (LTV)</TableHead>
                    <TableHead className="py-3 px-4">Orders & AOV</TableHead>
                    <TableHead className="py-3 px-4">Last Order Date</TableHead>
                    <TableHead className="py-3 px-4">Churn Risk</TableHead>
                    <TableHead className="py-3 px-4">AI Recommended Next Product</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs divide-y divide-slate-100">
                  {filteredBuyers.map((b) => (
                    <TableRow key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-1.5 font-bold">
                          {b.name}
                          {b.agent_buyer_user && (
                            <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[9px] font-mono px-1.5 py-0">
                              <Bot className="w-2.5 h-2.5 mr-0.5" />
                              AI Shopper
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{b.email}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {formatCurrency(b.ltv_inr)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{b.orders_count} Orders</div>
                        <span className="text-[10px] text-slate-500 font-mono">AOV: {formatCurrency(b.avg_order_value_inr)}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {b.last_order_date}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          className={`text-[10px] font-semibold ${
                            b.churn_risk === 'Low'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : b.churn_risk === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {b.churn_risk} Risk
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-[#0B72E7] font-semibold">
                          <Sparkles className="w-3 h-3 shrink-0" />
                          <span>{b.recommended_product}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Prefers: {b.preferred_category}</span>
                      </td>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
