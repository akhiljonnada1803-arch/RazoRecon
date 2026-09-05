'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/types/commerce';
import { Star, ShoppingBag, GitCompare, CheckCircle, ShieldCheck, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductRecommendationCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyAutoPay?: (product: Product) => void;
  onCompare?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  isAutoPayEnabled?: boolean;
}

export function ProductRecommendationCard({
  product,
  onAddToCart,
  onBuyAutoPay,
  onCompare,
  onViewDetails,
  isAutoPayEnabled = true,
}: ProductRecommendationCardProps) {
  const discountPct = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAction = () => {
    if (onBuyAutoPay) {
      onBuyAutoPay(product);
    } else {
      onAddToCart(product);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group">
      {/* Product Image Header */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <Badge className="bg-[#072654] text-white text-[10px] font-semibold tracking-wide border-0 shadow-xs">
            {product.brand}
          </Badge>
          {discountPct > 0 && (
            <Badge className="bg-emerald-600 text-white text-[10px] font-bold border-0 shadow-xs">
              {discountPct}% OFF
            </Badge>
          )}
        </div>
        {product.in_stock ? (
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] font-medium text-emerald-700 flex items-center gap-1 shadow-xs border border-emerald-100">
            <CheckCircle className="h-3 w-3 text-emerald-600" />
            In Stock
          </div>
        ) : (
          <div className="absolute bottom-2 right-2 bg-rose-50 px-2 py-0.5 rounded-full text-[10px] font-medium text-rose-700 border border-rose-200">
            Backorder
          </div>
        )}
      </div>

      {/* Product Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-500 font-normal text-[10px]">({product.reviews_count})</span>
            </div>
          </div>

          <h4 
            onClick={() => onViewDetails && onViewDetails(product)}
            className="font-bold text-slate-900 text-sm hover:text-[#0B72E7] cursor-pointer line-clamp-1 transition-colors"
          >
            {product.name}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {product.tagline}
          </p>
        </div>

        {/* Feature Highlights */}
        {product.features && product.features.length > 0 && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-1">
            {product.features.slice(0, 2).map((feat, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0B72E7] mt-1.5 shrink-0" />
                <span className="line-clamp-1">{feat}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pricing & Actions */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-base font-extrabold text-[#072654]">
                ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                <ShieldCheck className="h-2.5 w-2.5 text-emerald-600" />
                Inclusive of GST
              </div>
            </div>
            <div className="text-[10px] text-slate-500 text-right flex items-center gap-1">
              <Truck className="h-3 w-3 text-slate-500" />
              {product.delivery_time || '2-3 Days'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {onCompare && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCompare(product)}
                className="h-8 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 rounded-xl"
              >
                <GitCompare className="h-3.5 w-3.5 text-slate-500" />
                Compare
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleAction}
              className={`h-8 text-xs font-bold text-white shadow-xs flex items-center justify-center gap-1.5 rounded-xl col-span-1 ${
                isAutoPayEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              <span className="text-amber-300">⚡</span>
              <span>{isAutoPayEnabled ? 'Buy via AutoPay' : 'Connect AutoPay'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
