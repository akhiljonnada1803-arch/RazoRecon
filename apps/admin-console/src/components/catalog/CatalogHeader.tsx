'use client';

import React from 'react';
import { CatalogStats } from '@/types/catalog';
import { 
  Package, 
  Boxes, 
  Coins, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  Search,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CatalogHeaderProps {
  stats?: CatalogStats;
  onAddNewProduct: () => void;
  onOpenAISchema: () => void;
}

export function CatalogHeader({
  stats,
  onAddNewProduct,
  onOpenAISchema,
}: CatalogHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#0B72E7] to-[#072654] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#072654] tracking-tight">
                Product Catalog Management
              </h1>
              <Badge variant="outline" className="bg-blue-50 text-[#0B72E7] border-blue-200 text-xs font-semibold">
                Live Inventory
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Manage enterprise hardware, POS terminals, SaaS licenses, real-time stock levels & AI schemas
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={onOpenAISchema}
            className="h-10 px-3.5 text-xs font-semibold text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100 rounded-xl gap-1.5"
          >
            <Code className="h-4 w-4 text-[#0B72E7]" />
            <span>AI Schema API</span>
          </Button>
          <Button
            onClick={onAddNewProduct}
            className="h-10 px-4 bg-[#0B72E7] hover:bg-[#095bc0] text-white font-bold rounded-xl shadow-xs gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Total SKUs */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center shrink-0">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Products
              </span>
              <span className="text-lg font-extrabold text-[#072654]">
                {stats.total_products} SKUs
              </span>
            </div>
          </div>

          {/* Total Units */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Units
              </span>
              <span className="text-lg font-extrabold text-slate-900">
                {stats.total_inventory_units.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Total Valuation */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Catalog Valuation
              </span>
              <span className="text-lg font-extrabold text-[#072654]">
                ₹{(stats.total_valuation_inr / 100000).toFixed(2)}L
              </span>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Low Stock
              </span>
              <span className="text-lg font-extrabold text-amber-600">
                {stats.low_stock_count} SKUs
              </span>
            </div>
          </div>

          {/* In-Stock Rate */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3 col-span-2 lg:col-span-1">
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                In-Stock Rate
              </span>
              <span className="text-lg font-extrabold text-teal-700">
                {stats.in_stock_rate_pct}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
