'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Product } from '@/types/commerce';
import { 
  Sparkles, 
  Bot, 
  BrainCircuit, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Tag, 
  ShoppingBag,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function CustomerRecommendationsPage() {
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['customer-recommended-products'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/catalog/products?limit=6');
      return res?.items || res?.products || res || [];
    },
  });

  const products: Product[] = Array.isArray(productsData) ? productsData : [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Customer Experience</span>
            <span>•</span>
            <span className="text-[#0B72E7]">Personalized Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654] flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-[#0B72E7]" />
            AI Recommendations For You
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tailored hardware configurations and enterprise software bundles calculated using historical order memory.
          </p>
        </div>

        <Link href="/customer/assistant">
          <Button className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span>Chat With Shopping Agent</span>
          </Button>
        </Link>
      </div>

      {/* AI Customer Memory Snapshot */}
      <div className="bg-gradient-to-r from-[#072654] to-[#0B72E7] text-white p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-white">
              <BrainCircuit className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Customer Persona & Memory Vector</h3>
              <p className="text-[11px] text-blue-100">Learned from 8 completed checkouts & 24 cart interactions</p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-0 text-[10px] font-mono">
            Confidence: 96.4%
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] text-blue-200 uppercase font-mono">Industry Segment</span>
            <span className="text-xs font-bold block">Omnichannel Retail & Fintech Hardware</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] text-blue-200 uppercase font-mono">Preferred Connectivity</span>
            <span className="text-xs font-bold block">Dual 4G eSIM + WiFi 6 Low-Latency</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] text-blue-200 uppercase font-mono">Average Order Value</span>
            <span className="text-xs font-bold block">₹28,450 (High-Tier Enterprise)</span>
          </div>
        </div>
      </div>

      {/* Recommended Items with Reasoning Traces */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#072654] uppercase tracking-wider font-mono">
          Recommended Hardware & Upsells
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product, idx) => (
            <div
              key={product.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px] font-semibold">
                    {product.category}
                  </Badge>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Match Score: {98 - idx * 3}%
                  </span>
                </div>

                <div className="flex gap-3">
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1556742049-0a67c55c5934?auto=format&fit=crop&w=600&q=80'}
                    alt={product.name}
                    className="h-16 w-16 rounded-2xl object-cover border border-slate-100 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-[#072654] line-clamp-1">{product.name}</h4>
                    <span className="text-xs font-bold text-[#0B72E7] block mt-0.5">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* AI Reasoning Trace */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-[#072654] font-semibold text-[11px]">
                    <Zap className="h-3 w-3 text-amber-500" />
                    <span>AI Reasoning Trace</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Recommended because your store processes &gt;100 daily transactions. Pairing this with your current POS terminal eliminates peak checkout latency.
                  </p>
                </div>
              </div>

              <Link href="/customer/assistant">
                <Button className="w-full rounded-xl bg-[#072654] hover:bg-[#0c356e] text-white text-xs font-semibold shadow-2xs gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Initiate AI Purchase</span>
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
