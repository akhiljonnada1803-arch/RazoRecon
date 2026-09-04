'use client';

import React from 'react';
import { CatalogStats, CategoryBreakdown } from '@/types/catalog';
import { 
  Package, 
  Layers, 
  Boxes, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Bot, 
  Sparkles, 
  ArrowUpRight,
  TrendingUp,
  Tag,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CatalogSummarySectionsProps {
  stats?: CatalogStats;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenAISchema: () => void;
}

export function CatalogSummarySections({
  stats,
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenAISchema,
}: CatalogSummarySectionsProps) {
  const totalProducts = stats?.total_products ?? 50;
  const totalUnits = stats?.total_inventory_units ?? 3450;
  const valuationLakhs = stats ? (stats.total_valuation_inr / 100000).toFixed(2) : '84.50';
  const lowStock = stats?.low_stock_count ?? 6;
  const outOfStock = stats?.out_of_stock_count ?? 0;
  const inStockRate = stats?.in_stock_rate_pct ?? 98.2;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SECTION 1: Total Products */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#0B72E7]/40 transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#0B72E7]" />
                Section 1 • Total Products
              </span>
              <div className="h-8 w-8 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="h-4 w-4" />
              </div>
            </div>
            
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#072654]">
                {totalProducts}
              </span>
              <span className="text-xs font-semibold text-slate-500">Active SKUs</span>
            </div>
            
            <p className="text-xs text-slate-500 mt-1">
              Catalog portfolio across 7 core FinOps & hardware verticals.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Valuation:</span>
            <span className="font-extrabold text-[#0B72E7]">₹{valuationLakhs} Lakhs</span>
          </div>
        </div>

        {/* SECTION 2: Categories */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Section 2 • Categories
              </span>
              <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {categories.length > 0 ? categories.length : (stats?.categories_count || 7)}
              </span>
              <span className="text-xs font-semibold text-slate-500">Taxonomies</span>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              POS, Soundboxes, Software, Workstations & Security.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Active Filter:</span>
            <Badge variant="outline" className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border-indigo-200">
              {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
            </Badge>
          </div>
        </div>

        {/* SECTION 3: Inventory Status */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Section 3 • Inventory Status
              </span>
              <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Boxes className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {totalUnits.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold text-emerald-700 font-mono">
                {inStockRate}% Ready
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="h-3 w-3" /> In Stock
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                <AlertTriangle className="h-3 w-3" /> {lowStock} Low
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-500">
                {outOfStock} Out
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
              <div style={{ width: `${Math.max(10, inStockRate - 5)}%` }} className="bg-emerald-500 h-full" />
              <div style={{ width: `${Math.min(15, (lowStock / totalProducts) * 100)}%` }} className="bg-amber-400 h-full" />
            </div>
          </div>
        </div>

        {/* SECTION 4: AI Readable Catalog */}
        <div className="bg-gradient-to-br from-[#072654] to-[#0b3b7b] text-white rounded-3xl p-5 shadow-md shadow-blue-900/10 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-[#0B72E7]/20 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-300 animate-pulse" />
                Section 4 • AI Readable Catalog
              </span>
              <div className="h-8 w-8 rounded-xl bg-white/10 text-white flex items-center justify-center">
                <Bot className="h-4 w-4 text-blue-300" />
              </div>
            </div>

            <div className="mt-3">
              <span className="text-lg font-bold text-white block">
                Agent & LLM Schema
              </span>
              <p className="text-xs text-blue-100/80 mt-1 line-clamp-2">
                Token-optimized JSON embeddings for CFO Copilot & Agent-to-Agent Commerce.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] font-semibold">
              Live Embeddings Ready
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenAISchema}
              className="h-7 px-2.5 text-[11px] font-bold text-white bg-white/10 hover:bg-white/20 border-white/20 rounded-lg gap-1"
            >
              <Code className="h-3 w-3" />
              Inspect
            </Button>
          </div>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 pl-2 shrink-0 flex items-center gap-1">
          <Tag className="h-3.5 w-3.5 text-[#0B72E7]" /> Filter by Category:
        </span>
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-[#072654] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Categories ({totalProducts})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-[#0B72E7] text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
