'use client';

import React from 'react';
import { CatalogProduct } from '@/types/catalog';
import { 
  Star, 
  Sliders, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Truck,
  Layers,
  Percent
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CatalogGridProps {
  products: CatalogProduct[];
  onEditProduct: (product: CatalogProduct) => void;
  onDeleteProduct: (product: CatalogProduct) => void;
  onAdjustStock: (product: CatalogProduct) => void;
  onViewProduct: (product: CatalogProduct) => void;
  onManageVolumeTiers?: (product: CatalogProduct) => void;
}

export function CatalogGrid({
  products,
  onEditProduct,
  onDeleteProduct,
  onAdjustStock,
  onViewProduct,
  onManageVolumeTiers,
}: CatalogGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((prod) => {
        const isLowStock = prod.stock_status === 'Low Stock';
        const isOutOfStock = prod.stock_status === 'Out of Stock';

        return (
          <div
            key={prod.id}
            className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            {/* Image & Badges */}
            <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
              <img
                src={prod.image_url}
                alt={prod.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                <Badge className="bg-[#072654] text-white text-[10px] font-semibold border-0">
                  {prod.brand}
                </Badge>
                <Badge variant="outline" className="bg-white/90 backdrop-blur-xs text-slate-700 text-[9px] font-mono border-slate-200">
                  {prod.sku}
                </Badge>
              </div>

              <div className="absolute bottom-2 right-2">
                {isOutOfStock ? (
                  <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold border">
                    Out of Stock
                  </Badge>
                ) : isLowStock ? (
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold border">
                    Low Stock ({prod.stock_quantity})
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold border">
                    {prod.stock_quantity} in stock
                  </Badge>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span className="font-semibold uppercase tracking-wider">{prod.category}</span>
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="h-3 w-3 fill-amber-400" />
                    <span>{prod.rating}</span>
                  </div>
                </div>

                <h4
                  onClick={() => onViewProduct(prod)}
                  className="font-bold text-slate-900 text-sm hover:text-[#0B72E7] cursor-pointer line-clamp-1 transition-colors"
                >
                  {prod.name}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {prod.tagline}
                </p>
              </div>

              {/* Price & Stock info */}
              <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
                <div>
                  <div className="text-base font-extrabold text-[#072654]">
                    ₹{prod.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Cost: ₹{prod.cost_price.toLocaleString('en-IN')} ({prod.gst_rate_pct}% GST)
                  </div>
                  {prod.price_tiers && prod.price_tiers.length > 0 && onManageVolumeTiers && (
                    <button
                      onClick={() => onManageVolumeTiers(prod)}
                      className="mt-1 flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded-md"
                    >
                      <Layers className="h-2.5 w-2.5 text-[#0B72E7]" />
                      <span>{prod.price_tiers.length} Volume Tiers</span>
                    </button>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-1">
                  {onManageVolumeTiers && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onManageVolumeTiers(prod)}
                      className="h-8 px-2 text-xs border-blue-200 text-[#0B72E7] hover:bg-blue-50 rounded-xl"
                      title="Manage Volume Tier Pricing"
                    >
                      <Layers className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAdjustStock(prod)}
                    className="h-8 px-2 text-xs border-slate-200 hover:bg-slate-50 rounded-xl"
                    title="Adjust Stock"
                  >
                    <Sliders className="h-3.5 w-3.5 text-slate-600" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditProduct(prod)}
                    className="h-8 px-2 text-xs border-slate-200 hover:bg-slate-50 rounded-xl"
                    title="Edit"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-slate-600" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteProduct(prod)}
                    className="h-8 px-2 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
