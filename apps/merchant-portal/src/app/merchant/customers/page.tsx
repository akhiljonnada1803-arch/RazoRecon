'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MerchantCustomer } from '@/types/merchant';
import { 
  Users, 
  Search, 
  Sparkles, 
  Crown, 
  CreditCard, 
  ArrowRight, 
  Award,
  Brain,
  History,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MerchantCustomersPage() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<MerchantCustomer | null>(null);

  const { data: customers, isLoading } = useQuery<MerchantCustomer[]>({
    queryKey: ['merchant', 'customers'],
    queryFn: () => apiClient.get('/merchant/customers'),
  });

  const filteredCustomers = (customers || []).filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.tier.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Users className="w-3.5 h-3.5 mr-1" />
                Customer LTV & AI Behavioral Memory
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <Brain className="w-3.5 h-3.5 mr-1" />
                Personalized Recommendations Active
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Customer Intelligence & Lifetime Value
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Understand purchase velocity, preferred hardware categories, payment habits, and AI buyer propensity models.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by customer name, email, or tier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-slate-200 text-xs bg-slate-50/50"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Showing {filteredCustomers.length} Enterprise Customers
        </span>
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header Profile */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#0B72E7] to-[#072654] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                    <span className="text-[11px] text-slate-400 font-mono block truncate max-w-[170px]">{c.email}</span>
                  </div>
                </div>

                <Badge
                  className={`text-[9px] font-bold ${
                    c.tier.includes('Platinum')
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : c.tier.includes('Gold')
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {c.tier}
                </Badge>
              </div>

              {/* LTV & Orders */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 text-[10px] block font-semibold">Lifetime Value</span>
                  <span className="font-bold text-[#0B72E7] font-mono text-sm">
                    ₹{c.lifetime_value.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 text-[10px] block font-semibold">Orders / AOV</span>
                  <span className="font-bold text-slate-800 font-mono text-xs">
                    {c.orders_count} ord • ₹{(c.average_order_value / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>

              {/* Favorite Categories */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Affinity Categories
                </span>
                <div className="flex flex-wrap gap-1">
                  {c.preferences.favourite_categories.map((cat, idx) => (
                    <Badge key={idx} variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px]">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100 text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0B72E7] uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  AI Buyer Insight
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                  {c.ai_insights}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCustomer(c)}
              className="w-full rounded-xl text-xs font-semibold text-[#0B72E7] hover:bg-blue-50 border-slate-200 mt-2"
            >
              Inspect Persona Dossier <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        ))}
      </div>

      {/* Customer Dossier Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#0B72E7] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedCustomer.name}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">{selectedCustomer.email}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
                className="h-7 w-7 p-0 rounded-lg"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] block font-semibold">Tier Status</span>
                  <span className="font-bold text-purple-700 font-mono">{selectedCustomer.tier}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] block font-semibold">Preferred Channel</span>
                  <span className="font-bold text-slate-800">{selectedCustomer.preferences.preferred_payment}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  AI Behavioral Persona Analysis
                </span>
                <p className="text-slate-700 text-xs leading-relaxed">
                  {selectedCustomer.ai_insights}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
                className="rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
