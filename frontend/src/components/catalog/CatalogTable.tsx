'use client';

import React from 'react';
import { CatalogProduct } from '@/types/catalog';
import { 
  Edit3, 
  Trash2, 
  Sliders, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  PackageCheck,
  Tag,
  Percent,
  Sparkles,
  Layers,
  Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CatalogTableProps {
  products: CatalogProduct[];
  onEditProduct: (product: CatalogProduct) => void;
  onDeleteProduct: (product: CatalogProduct) => void;
  onAdjustStock: (product: CatalogProduct) => void;
  onViewProduct: (product: CatalogProduct) => void;
  onManageVolumeTiers?: (product: CatalogProduct) => void;
}

export function CatalogTable({
  products,
  onEditProduct,
  onDeleteProduct,
  onAdjustStock,
  onViewProduct,
  onManageVolumeTiers,
}: CatalogTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
        <div className="h-14 w-14 rounded-full bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
          <PackageCheck className="h-7 w-7" />
        </div>
        <h4 className="font-bold text-slate-800 text-base">No Products Found</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No catalog items match the current search query or category filters. Try adjusting your search term.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              {/* 1. Product Column */}
              <th className="p-4 pl-6">Product</th>
              
              {/* 2. Price Column */}
              <th className="p-4 text-right">Price</th>
              
              {/* 3. Stock Column */}
              <th className="p-4 text-center">Stock</th>
              
              {/* 4. Category Column */}
              <th className="p-4">Category</th>
              
              {/* 5. Offer Column */}
              <th className="p-4">Offer</th>

              {/* Actions */}
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((prod) => {
              const marginPct = Math.round(((prod.price - prod.cost_price) / prod.price) * 100);
              const isLowStock = prod.stock_status === 'Low Stock';
              const isOutOfStock = prod.stock_status === 'Out of Stock';

              return (
                <tr 
                  key={prod.id} 
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  {/* 1. Product (Image, Name, SKU, Tagline, Rating) */}
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 max-w-sm">
                        <div 
                          onClick={() => onViewProduct(prod)}
                          className="font-bold text-slate-900 text-xs hover:text-[#0B72E7] cursor-pointer line-clamp-1 transition-colors"
                        >
                          {prod.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="font-mono text-[9px] px-1.5 py-0 bg-slate-50 text-slate-600 border-slate-200">
                            {prod.sku}
                          </Badge>
                          <div className="flex items-center gap-0.5 text-amber-500 font-semibold text-[10px]">
                            <Star className="h-2.5 w-2.5 fill-amber-400" />
                            <span>{prod.rating}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            HSN {prod.hsn_sac_code}
                          </span>
                        </div>
                        {prod.tagline && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {prod.tagline}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 2. Price */}
                  <td className="p-4 text-right">
                    <div className="font-extrabold text-sm text-[#072654]">
                      ₹{prod.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    {prod.original_price && prod.original_price > prod.price && (
                      <div className="text-[10px] text-slate-400 line-through">
                        MRP ₹{prod.original_price.toLocaleString('en-IN')}
                      </div>
                    )}
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      +{marginPct}% Margin ({prod.gst_rate_pct}% GST)
                    </div>

                    {/* Volume Tier Pricing Indicator */}
                    {onManageVolumeTiers && (
                      <div className="mt-1 flex justify-end">
                        {prod.price_tiers && prod.price_tiers.length > 0 ? (
                          <button
                            onClick={() => onManageVolumeTiers(prod)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded-md transition-colors shadow-2xs"
                            title="Manage volume tier pricing"
                          >
                            <Layers className="h-2.5 w-2.5 text-[#0B72E7]" />
                            <span>{prod.price_tiers.length} Tiers (Up to {Math.max(...prod.price_tiers.map(t => t.discount_pct))}% Off)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onManageVolumeTiers(prod)}
                            className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-[#0B72E7] transition-colors"
                            title="Add volume discount tier"
                          >
                            <Plus className="h-2.5 w-2.5" />
                            <span>Add Volume Tiers</span>
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  {/* 3. Stock */}
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-800">
                          {prod.stock_quantity} units
                        </span>
                        {isOutOfStock ? (
                          <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[9px] px-1 py-0 font-bold border">
                            Out
                          </Badge>
                        ) : isLowStock ? (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] px-1 py-0 font-bold border">
                            Low
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] px-1 py-0 font-semibold border">
                            In
                          </Badge>
                        )}
                      </div>
                      <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            isOutOfStock 
                              ? 'bg-rose-500 w-0' 
                              : isLowStock 
                              ? 'bg-amber-500 w-1/4' 
                              : 'bg-emerald-500 w-3/4'
                          }`}
                        />
                      </div>
                    </div>
                  </td>

                  {/* 4. Category */}
                  <td className="p-4">
                    <div className="font-bold text-slate-800 text-xs">{prod.category}</div>
                    <div className="text-[11px] text-slate-500">{prod.brand}</div>
                  </td>

                  {/* 5. Offer */}
                  <td className="p-4">
                    {prod.offer_text ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold border gap-1">
                            <Sparkles className="h-3 w-3 text-indigo-600" />
                            {prod.offer_badge || 'ACTIVE OFFER'}
                          </Badge>
                          {prod.offer_discount_pct && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded-md border border-emerald-200">
                              {prod.offer_discount_pct}% Off
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-slate-700 line-clamp-1">
                          {prod.offer_text}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Standard Pricing
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onManageVolumeTiers && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onManageVolumeTiers(prod)}
                          className="h-7 w-7 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Manage Volume Tier Pricing"
                        >
                          <Layers className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onAdjustStock(prod)}
                        className="h-7 w-7 text-slate-500 hover:text-[#0B72E7] hover:bg-blue-50 rounded-lg"
                        title="Adjust Stock Level"
                      >
                        <Sliders className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditProduct(prod)}
                        className="h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                        title="Edit Product"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteProduct(prod)}
                        className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete Product"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
