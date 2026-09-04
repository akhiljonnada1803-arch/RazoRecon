'use client';

import React from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutList, 
  LayoutGrid, 
  X,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CatalogFilterBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  stockStatus: string;
  onSelectStockStatus: (status: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: 'table' | 'grid';
  onToggleViewMode: (mode: 'table' | 'grid') => void;
  totalResults: number;
}

export function CatalogFilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
  stockStatus,
  onSelectStockStatus,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onToggleViewMode,
  totalResults,
}: CatalogFilterBarProps) {
  const stockStatuses = [
    { label: 'All Status', value: 'all' },
    { label: 'In Stock', value: 'In Stock' },
    { label: 'Low Stock (<15)', value: 'Low Stock' },
    { label: 'Out of Stock', value: 'Out of Stock' },
  ];

  const sortOptions = [
    { label: 'Recently Added', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Stock: Low to High', value: 'stock_asc' },
    { label: 'Stock: High to Low', value: 'stock_desc' },
    { label: 'Product Name (A-Z)', value: 'name' },
  ];

  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3.5">
      {/* Search and Main Filters Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by product name, SKU, brand, or feature keyword..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-9 h-10 text-xs sm:text-sm bg-slate-50 border-slate-200 rounded-2xl focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Stock Status Pill Filter */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200 overflow-x-auto">
          {stockStatuses.map((s) => (
            <button
              key={s.value}
              onClick={() => onSelectStockStatus(s.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                stockStatus === s.value
                  ? 'bg-[#072654] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown & View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="h-10 pl-3 pr-8 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl outline-hidden focus:border-[#0B72E7] cursor-pointer appearance-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="absolute right-3 top-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => onToggleViewMode('table')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-[#0B72E7] shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => onToggleViewMode('grid')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-[#0B72E7] shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Horizontal Scroll Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none border-t border-slate-100">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
          <Filter className="h-3 w-3" />
          Categories:
        </span>
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-[#0B72E7] text-white shadow-xs'
              : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          All Categories ({totalResults})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#0B72E7] text-white shadow-xs'
                : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
