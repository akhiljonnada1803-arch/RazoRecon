'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Product } from '@/types/commerce';
import { 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  ShoppingCart, 
  Star, 
  Truck, 
  RotateCcw, 
  CheckCircle2, 
  Tag,
  Zap,
  Building2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['shop', 'product', productId],
    queryFn: () => apiClient.get(`/products/${productId}`),
  });

  if (isLoading || !product) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Loading product specifications...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/shop" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B72E7] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Storefront</span>
        </Link>
        <span className="text-xs font-mono text-slate-400">SKU: {product.sku}</span>
      </div>

      {/* Main Product Stage */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: Product Image */}
        <div className="space-y-3">
          <div className="h-80 w-full rounded-2xl bg-slate-100 overflow-hidden border border-slate-200/80 relative">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.active_offer && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-emerald-600 text-white font-bold text-xs shadow-md">
                  {product.active_offer}
                </Badge>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs text-slate-600 font-mono">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-[#0B72E7]" />
              Express 24h Dispatch
            </span>
            <span className="flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
              30-Day Return Window
            </span>
          </div>
        </div>

        {/* Right: Info & Pricing */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Badge variant="outline" className="bg-blue-50 text-[#0B72E7] border-blue-200 text-xs font-semibold">
              {product.category}
            </Badge>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center text-amber-500 text-xs">
                {'★'.repeat(5)}
              </div>
              <span className="text-xs font-bold text-slate-800">4.9</span>
              <span className="text-xs text-slate-400 font-mono">(142 verified merchant reviews)</span>
            </div>
          </div>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-mono">Commercial Price</span>
                <div className="text-2xl font-extrabold text-[#0B72E7] font-mono">
                  ₹{product.price.toLocaleString('en-IN')}
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                In Stock ({product.stock ?? 50} units)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              +18% Input Tax Credit (ITC) Eligible GST: ₹{(product.price * 0.18).toLocaleString('en-IN')}
            </p>
          </div>

          {/* Key Features */}
          {((product.key_features || product.features || []).length > 0) && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Technical Specifications
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {(product.key_features || product.features || []).map((feat: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Fit Recommendation Box */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B72E7] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              AI Fit Assessment
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Recommended for retail multi-store operations seeking high throughput payment processing and real-time reconciliation.
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link href="/shop/cart">
              <Button variant="outline" className="w-full rounded-xl text-xs font-bold border-slate-200 text-slate-800">
                <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                Add to Cart
              </Button>
            </Link>
            <Link href="/shop/checkout">
              <Button className="w-full rounded-xl bg-[#0B72E7] hover:bg-blue-600 text-white font-bold text-xs shadow-md">
                <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
