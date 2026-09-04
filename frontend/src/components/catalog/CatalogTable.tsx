'use client';

import React from 'react';
import { CatalogProduct } from '@/types/catalog';
import { 
  Edit3, 
  Trash2, 
  Sliders, 
  ExternalLink, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  PackageCheck,
  Percent
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CatalogTableProps {
  products: CatalogProduct[];
  onEditProduct: (product: CatalogProduct) => void;
  onDeleteProduct: (product: CatalogProduct) => void;
  onAdjustStock: (product: CatalogProduct) => void;
  onViewProduct: (product: CatalogProduct) => void;
}

export function CatalogTable({
  products,
  onEditProduct,
  onDeleteProduct,
  onAdjustStock,
  onViewProduct,
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
              <th className="p-4 pl-6">Product & SKU</th>
              <th className="p-4">Category & Brand</th>
              <th className="p-4 text-right">Selling Price</th>
              <th className="p-4 text-right">Cost Price</th>
              <th className="p-4 text-center">Stock Level</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">GST Rate</th>
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
                  {/* Product & SKU */}
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <div 
                          onClick={() => onViewProduct(prod)}
                          className="font-bold text-slate-900 text-xs hover:text-[#0B72E7] cursor-pointer line-clamp-1 transition-colors"
                        >
                          {prod.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="font-mono text-[9px] px-1 py-0 bg-slate-50 text-slate-600 border-slate-200">
                            {prod.sku}
                          </Badge>
                          <div className="flex items-center gap-0.5 text-amber-500 font-semibold text-[10px]">
                            <Star className="h-2.5 w-2.5 fill-amber-400" />
                            <span>{prod.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category & Brand */}
                  <td className="p-4">
                    <div className="font-semibold text-slate-800 text-xs">{prod.category}</div>
                    <div className="text-[11px] text-slate-500">{prod.brand}</div>
                  </td>

                  {/* Selling Price */}
                  <td className="p-4 text-right">
                    <div className="font-extrabold text-sm text-[#072654]">
                      ₹{prod.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    {prod.original_price && prod.original_price > prod.price && (
                      <div className="text-[10px] text-slate-400 line-through">
                        ₹{prod.original_price.toLocaleString('en-IN')}
                      </div>
                    )}
                  </td>

                  {/* Cost Price & Margin */}
                  <td className="p-4 text-right">
                    <div className="font-medium text-slate-600 text-xs">
                      ₹{prod.cost_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      +{marginPct}% Margin
                    </div>
                  </td>

                  {/* Stock Level Progress */}
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="font-bold text-xs text-slate-800">
                        {prod.stock_quantity} units
                      </span>
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

                  {/* Status Badge */}
                  <td className="p-4 text-center">
                    {isOutOfStock ? (
                      <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold border gap-1">
                        <XCircle className="h-3 w-3 text-rose-500" />
                        Out of Stock
                      </Badge>
                    ) : isLowStock ? (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold border gap-1">
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold border gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        In Stock
                      </Badge>
                    )}
                  </td>

                  {/* GST Tax Rate */}
                  <td className="p-4 text-center">
                    <span className="font-mono text-xs font-semibold text-slate-700">
                      {prod.gst_rate_pct}% GST
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">
                      HSN {prod.hsn_sac_code}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1">
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
