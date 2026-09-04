'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Product } from '@/types/commerce';
import { 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Plus, 
  Minus, 
  RefreshCw, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Sliders, 
  Package,
  Boxes
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function MerchantInventoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');

  const { data: catalogData, isLoading } = useQuery<any>({
    queryKey: ['merchant', 'inventory'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/catalog/products?limit=100');
      return res?.items || res?.products || (Array.isArray(res) ? res : []);
    },
  });

  const products: Product[] = Array.isArray(catalogData) ? catalogData : [];

  const stockMutation = useMutation({
    mutationFn: ({ id, stock_quantity }: { id: string; stock_quantity: number }) => {
      return apiClient.put(`/catalog/products/${id}/stock?stock_quantity=${stock_quantity}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'catalog'] });
    }
  });

  const handleAdjustStock = (product: Product, delta: number) => {
    const currentStock = product.stock_quantity ?? product.stock ?? 0;
    const newStock = Math.max(0, currentStock + delta);
    stockMutation.mutate({ id: product.id, stock_quantity: newStock });
  };

  const totalUnits = products.reduce((sum, p) => sum + (p.stock_quantity ?? p.stock ?? 0), 0);
  const totalValuation = products.reduce((sum, p) => sum + ((p.stock_quantity ?? p.stock ?? 0) * p.price), 0);
  const lowStockCount = products.filter(p => {
    const s = p.stock_quantity ?? p.stock ?? 0;
    return s > 0 && s <= 15;
  }).length;
  const outOfStockCount = products.filter(p => !p.in_stock || (p.stock_quantity ?? p.stock ?? 0) === 0).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.category.toLowerCase().includes(search.toLowerCase()) ||
                          (p.sku || '').toLowerCase().includes(search.toLowerCase());

    const s = p.stock_quantity ?? p.stock ?? 0;
    if (filterLevel === 'LOW') return matchesSearch && s > 0 && s <= 15;
    if (filterLevel === 'OUT') return matchesSearch && (!p.in_stock || s === 0);
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Merchant Operations</span>
            <span>•</span>
            <span className="text-[#0B72E7]">Inventory Control</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654]">
            Stock Levels & Warehouse Valuation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor real-time SKU unit inventory, automated replenishment triggers, and total working capital.
          </p>
        </div>

        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['merchant', 'inventory'] })}
          variant="outline"
          size="sm"
          className="h-9 px-3 rounded-xl border-slate-200 text-xs font-semibold gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          <span>Refresh Stock</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase font-mono">Total Valuation</span>
            <DollarSign className="h-4 w-4 text-[#0B72E7]" />
          </div>
          <div className="text-xl font-bold text-[#072654]">₹{(totalValuation / 100000).toFixed(2)} Lakh</div>
          <span className="text-[10px] text-slate-500">{totalUnits} units on hand</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase font-mono">Healthy Stock</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700">{products.length - lowStockCount - outOfStockCount} SKUs</div>
          <span className="text-[10px] text-emerald-600 font-medium">Optimal turnover</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase font-mono">Low Stock Alert</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-700">{lowStockCount} SKUs</div>
          <span className="text-[10px] text-amber-600 font-medium">&lt; 15 units threshold</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase font-mono">Out of Stock</span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-700">{outOfStockCount} SKUs</div>
          <span className="text-[10px] text-rose-600 font-medium">Lost revenue risk</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search inventory by title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl border-slate-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterLevel('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterLevel === 'ALL'
                ? 'bg-[#0B72E7] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items ({products.length})
          </button>
          <button
            onClick={() => setFilterLevel('LOW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterLevel === 'LOW'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setFilterLevel('OUT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterLevel === 'OUT'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Boxes className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No matching inventory items</h3>
            <p className="text-xs text-slate-500">Try adjusting your filter options.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">SKU & Item</th>
                  <th className="py-3.5 px-6 font-semibold">Unit Price</th>
                  <th className="py-3.5 px-6 font-semibold">Current Stock</th>
                  <th className="py-3.5 px-6 font-semibold">Valuation</th>
                  <th className="py-3.5 px-6 font-semibold">Status Alert</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Quick Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map((p) => {
                  const stockCount = p.stock_quantity ?? p.stock ?? 0;
                  const isLow = stockCount > 0 && stockCount <= 15;
                  const isOut = !p.in_stock || stockCount === 0;
                  const itemValuation = stockCount * p.price;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image_url || 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=100'}
                            alt={p.name}
                            className="h-10 w-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block text-xs">{p.name}</span>
                            <span className="font-mono text-[10px] text-slate-400">SKU: {p.sku || p.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-mono font-semibold text-slate-800">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-6 font-mono font-bold text-sm text-slate-900">
                        {stockCount} units
                      </td>

                      <td className="py-4 px-6 font-mono text-slate-700">
                        ₹{itemValuation.toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-6">
                        {isOut ? (
                          <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                            Out of Stock
                          </Badge>
                        ) : isLow ? (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                            Low Stock (&lt;15)
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            Healthy
                          </Badge>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAdjustStock(p, -5)}
                            disabled={stockCount === 0 || stockMutation.isPending}
                            className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-600"
                            title="Deduct 5 units"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleAdjustStock(p, 10)}
                            disabled={stockMutation.isPending}
                            className="h-7 w-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0B72E7] flex items-center justify-center font-bold text-xs"
                            title="Add 10 units"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
