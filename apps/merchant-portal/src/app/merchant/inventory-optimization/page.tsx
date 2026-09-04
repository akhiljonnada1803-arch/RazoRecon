'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { InventoryOptimizationResponse, RestockQueueItem } from '@/types/growth';
import { 
  Boxes, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  ArrowRight, 
  Clock, 
  Zap, 
  Package, 
  Truck, 
  Sparkles,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function InventoryOptimizationPage() {
  const [createdPOs, setCreatedPOs] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery<InventoryOptimizationResponse>({
    queryKey: ['growth', 'inventory-optimization'],
    queryFn: () => apiClient.get('/growth/inventory-optimization'),
  });

  const handleCreatePO = (item: RestockQueueItem) => {
    setCreatedPOs(prev => ({ ...prev, [item.product_id]: true }));
    setToastMsg(`✅ Purchase Order generated for ${item.recommended_restock_units} units of ${item.product_name}!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const overview = data?.overview;
  const restockQueue = data?.restock_queue || [];
  const fastMovers = data?.fast_movers || [];
  const slowMovers = data?.slow_movers || [];
  const overstocked = data?.overstocked || [];

  return (
    <div className="space-y-8 pb-20">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0A2540] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Boxes className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Working Capital & Stockout Intelligence
              </Badge>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-mono">
                Predictive Restock Active
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Inventory Optimization & Replenishment Queue
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Predicting stockout horizons based on sales velocity and supplier lead times while identifying trapped capital in slow-moving warehouse lots.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-2xl border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white text-xs gap-1.5 h-10 shrink-0"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin text-emerald-400")} />
            <span>Refresh Telemetry</span>
          </Button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Imminent Stockouts</span>
            <div className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 font-mono">
            {overview?.understocked_count || 0} <span className="text-sm font-sans font-medium text-slate-400">SKUs</span>
          </div>
          <span className="text-[11px] text-rose-700 font-medium block">Will deplete in &le; 7 days</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Fast Movers</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {overview?.fast_movers_count || 0} <span className="text-sm font-sans font-medium text-slate-400">High Velocity</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">&ge; 3.0 units daily sell-through</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Overstocked Lots</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {overview?.overstocked_count || 0} <span className="text-sm font-sans font-medium text-slate-400">Lots</span>
          </div>
          <span className="text-[11px] text-amber-700 font-medium block">&gt; 50 units with low velocity</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase font-mono">Trapped Working Capital</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#0B72E7] font-mono">
            {formatCurrency(overview?.tied_up_overstock_capital_inr || 0)}
          </div>
          <span className="text-[11px] text-slate-500 block">Candidate for AI markdowns</span>
        </div>
      </div>

      {/* Critical Restock Queue */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <span>Critical Replenishment & Reorder Queue</span>
            </h2>
            <p className="text-xs text-slate-500">Auto-calculated reorder volumes factoring in daily burn rate and supplier lead times</p>
          </div>
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 font-mono text-xs">
            {restockQueue.length} Active Shortages
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {restockQueue.map((item) => (
            <div
              key={item.product_id}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 hover:bg-slate-100/60 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-rose-100 text-rose-800 text-[10px] font-bold font-mono">
                    Stockout in {item.days_to_stockout} Days
                  </Badge>
                  <span className="text-[10px] font-mono text-slate-500">
                    Lead Time: {item.supplier_lead_time_days} days
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm">{item.product_name}</h3>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-white p-3 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Current Stock:</span>
                    <span className="font-extrabold text-rose-600">{item.current_stock} Units</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Daily Velocity:</span>
                    <span className="font-extrabold text-slate-800">{item.daily_velocity} units/day</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Recommended Reorder:</span>
                    <span className="font-extrabold text-emerald-600">+{item.recommended_restock_units} Units</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Estimated Cost:</span>
                    <span className="font-extrabold text-slate-900">{formatCurrency(item.estimated_reorder_cost_inr)}</span>
                  </div>
                </div>
              </div>

              <div>
                {createdPOs[item.product_id] ? (
                  <div className="w-full py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                    <Check className="h-4 w-4" />
                    <span>Purchase Order Sent to Supplier</span>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleCreatePO(item)}
                    className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Generate PO for {item.recommended_restock_units} Units</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fast Movers vs Slow Movers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fast Movers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>Fast Moving Inventory</span>
              </h3>
              <p className="text-xs text-slate-500">High velocity SKUs requiring regular replenishment</p>
            </div>
          </div>

          <div className="space-y-3">
            {fastMovers.map((p) => (
              <div key={p.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{p.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{p.category} • {p.stock} in stock</span>
                </div>
                <div className="text-right font-mono">
                  <span className="font-extrabold text-sm text-emerald-600 block">{p.inventory_velocity} u/day</span>
                  <span className="text-[10px] text-slate-500 font-sans">{p.conversion_rate}% Conv</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slow Movers & Overstocked */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-amber-500" />
                <span>Slow Movers & Overstocked Candidates</span>
              </h3>
              <p className="text-xs text-slate-500">Capital-locking SKUs eligible for dynamic markdowns</p>
            </div>
            <Link href="/merchant/demand-intelligence">
              <Button size="sm" variant="outline" className="text-xs rounded-xl gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Optimize Discounts</span>
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {overstocked.map((p) => (
              <div key={p.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{p.name}</h4>
                  <span className="text-[10px] text-amber-600 font-mono font-semibold">
                    {p.stock} units holding {formatCurrency(p.cost_price * p.stock)}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="font-extrabold text-xs text-slate-600 block">{p.inventory_velocity} u/day</span>
                  <span className="text-[10px] text-amber-600 font-sans font-bold">Declining</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
