'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Product, ProductListResponse } from '@/types/commerce';
import { 
  Store, 
  Search, 
  ShoppingCart, 
  Sparkles, 
  Star, 
  ArrowRight, 
  Filter, 
  ShieldCheck, 
  Tag, 
  Bot,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function StorefrontPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [cartCount, setCartCount] = useState<number>(0);

  const { data: catalogData, isLoading } = useQuery<ProductListResponse>({
    queryKey: ['shop', 'products', selectedCategory, search],
    queryFn: () => {
      const categoryParam = selectedCategory !== 'ALL' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      return apiClient.get(`/products?limit=50${categoryParam}${searchParam}`);
    },
  });

  const products = catalogData?.items || [];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Store className="w-3.5 h-3.5 mr-1" />
                RazorCommerce Live Storefront
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <Zap className="w-3.5 h-3.5 mr-1" />
                Autonomous AI Checkout
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Enterprise Fintech & Retail Hardware Store
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Browse POS smart terminals, 4G soundboxes, FinOps software licenses, and developer trading desks with instant Razorpay checkout.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/shop/cart">
              <Button size="sm" className="bg-white hover:bg-blue-50 text-[#072654] font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-[#0B72E7]" />
                <span>View Cart</span>
              </Button>
            </Link>
            <Link href="/commerce-agent">
              <Button size="sm" className="bg-[#0B72E7] hover:bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" />
                <span>Chat with Shopping AI</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search products by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl border-slate-200 text-xs bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {[
              'ALL',
              'Payment Terminals',
              'Soundboxes',
              'FinOps Software',
              'Workstations',
              'Security',
              'Storage',
              'Retail Peripherals'
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#0B72E7] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Product Thumbnail */}
              <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {p.active_offer && (
                  <div className="absolute top-2.5 left-2.5">
                    <Badge className="bg-emerald-600 text-white font-bold text-[9px] shadow-sm">
                      {p.active_offer}
                    </Badge>
                  </div>
                )}
                <div className="absolute bottom-2.5 right-2.5">
                  <Badge variant="outline" className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-mono border-slate-200">
                    ★ 4.9
                  </Badge>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  {p.category}
                </span>
                <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-tight">
                  {p.name}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>

            {/* Price & Action */}
            <div className="p-4 pt-0 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Price (excl. 18% GST)</span>
                  <span className="font-extrabold text-slate-900 font-mono text-base">
                    ₹{p.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 font-semibold">
                  In Stock ({p.stock})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link href={`/shop/product/${p.id}`}>
                  <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-semibold text-slate-700">
                    Details
                  </Button>
                </Link>
                <Link href="/shop/checkout">
                  <Button size="sm" className="w-full rounded-xl bg-[#0B72E7] hover:bg-blue-600 text-white font-bold text-xs shadow-xs">
                    Buy Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
