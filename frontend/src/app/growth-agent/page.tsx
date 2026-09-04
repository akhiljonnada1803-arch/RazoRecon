'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  GrowthBasketItem, 
  GrowthAnalysisResponse, 
  RecommendationCard, 
  SampleBasket, 
  AffinityRule 
} from '@/types/growth';
import { GrowthMetricCards } from '@/components/growth/GrowthMetricCards';
import { GrowthBasketBuilder } from '@/components/growth/GrowthBasketBuilder';
import { GrowthRecommendationCard } from '@/components/growth/GrowthRecommendationCard';
import { BasketAffinityMatrix } from '@/components/growth/BasketAffinityMatrix';
import { GrowthStrategyHero } from '@/components/growth/GrowthStrategyHero';
import { 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight, 
  Package, 
  Layers, 
  Zap, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function RevenueGrowthAgentPage() {
  const queryClient = useQueryClient();

  const [basketItems, setBasketItems] = useState<GrowthBasketItem[]>([
    {
      product_id: 'prod_rzp_pos_mini_x',
      name: 'Razorpay POS Mini Compact Reader',
      brand: 'Razorpay Hardware',
      category: 'Payment Terminals',
      price: 5999.00,
      cost_price: 3800.00,
      quantity: 2,
      image_url: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=600&auto=format&fit=crop&q=80'
    },
    {
      product_id: 'prod_rzp_qr_stand_active',
      name: 'Razorpay Dynamic QR LED Display Stand',
      brand: 'Razorpay Hardware',
      category: 'Payment Terminals',
      price: 1899.00,
      cost_price: 950.00,
      quantity: 1,
      image_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&auto=format&fit=crop&q=80'
    }
  ]);

  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // 1. Fetch Sample Preset Baskets
  const { data: sampleBaskets = [] } = useQuery<SampleBasket[]>({
    queryKey: ['growth-sample-baskets'],
    queryFn: () => apiClient.get('/growth/sample-baskets'),
  });

  // 2. Analyze Basket Mutation / Query
  const analysisMutation = useMutation({
    mutationFn: (items: GrowthBasketItem[]) => 
      apiClient.post<GrowthAnalysisResponse>('/growth/analyze', { items }),
  });

  useEffect(() => {
    analysisMutation.mutate(basketItems);
  }, [basketItems]);

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setBasketItems((prev) => 
      prev.map((item) => {
        if (item.product_id === productId) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId: string) => {
    setBasketItems((prev) => {
      const updated = prev.filter((item) => item.product_id !== productId);
      if (updated.length === 0 && sampleBaskets.length > 0) {
        return sampleBaskets[0].items;
      }
      return updated;
    });
  };

  const handleSelectSampleBasket = (basket: SampleBasket) => {
    setBasketItems(basket.items);
    showToast(`Loaded preset: "${basket.name}"`);
  };

  const handleResetBasket = () => {
    if (sampleBaskets.length > 0) {
      setBasketItems(sampleBaskets[0].items);
    }
  };

  // Apply Upsell or Cross-sell Recommendation directly to cart
  const handleApplyRecommendation = (rec: RecommendationCard) => {
    if (rec.type === 'upsell' && rec.original_product_id) {
      // Replace original product with upgraded product
      setBasketItems((prev) => {
        const existingOriginal = prev.find((i) => i.product_id === rec.original_product_id);
        const qty = existingOriginal ? existingOriginal.quantity : 1;
        const filtered = prev.filter((i) => i.product_id !== rec.original_product_id);
        
        return [
          ...filtered,
          {
            product_id: rec.target_product_id || 'prod_upsell',
            name: rec.target_product_name || 'Upgraded Product',
            brand: rec.target_brand || 'Razorpay Enterprise',
            category: rec.target_category || 'Hardware',
            price: rec.target_price || 0,
            cost_price: rec.target_cost_price || 0,
            quantity: qty,
            image_url: rec.target_image_url
          }
        ];
      });
      showToast(`Upgraded to ${rec.target_product_name || 'Upgraded Product'}!`);
    } else {
      // Cross-sell: Add new complementary item to cart
      setBasketItems((prev) => {
        const existing = prev.find((i) => i.product_id === rec.target_product_id);
        if (existing) {
          return prev.map((i) => i.product_id === rec.target_product_id ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [
          ...prev,
          {
            product_id: rec.target_product_id || 'prod_cross_sell',
            name: rec.target_product_name || 'Complementary Add-on',
            brand: rec.target_brand || 'Razorpay Enterprise',
            category: rec.target_category || 'Accessories',
            price: rec.target_price || 0,
            cost_price: rec.target_cost_price || 0,
            quantity: 1,
            image_url: rec.target_image_url
          }
        ];
      });
      showToast(`Added ${rec.target_product_name || 'Complementary Add-on'} to cart!`);
    }
  };

  const analysisData = analysisMutation.data;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#072654] text-white px-5 py-3 rounded-2xl shadow-xl border border-blue-500/30 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top duration-300">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 1. Executive Strategy Hero */}
      <section>
        <GrowthStrategyHero
          strategyRationale={analysisData?.ai_strategy_rationale || "Analyzing active merchant basket for maximum revenue expansion and cross-sell attachment..."}
          healthScore={analysisData?.growth_health_score || 85}
        />
      </section>

      {/* 2. Top Revenue Uplift Metric Cards */}
      <section>
        <GrowthMetricCards data={analysisData} />
      </section>

      {/* 3. Active Basket Builder & Upsell/Cross-sell Columns */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Merchant Cart Builder */}
        <div className="lg:col-span-5 space-y-6">
          <GrowthBasketBuilder
            basketItems={basketItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            sampleBaskets={sampleBaskets}
            onSelectSampleBasket={handleSelectSampleBasket}
            onResetBasket={handleResetBasket}
            isAnalyzing={analysisMutation.isPending}
          />
        </div>

        {/* Right: AI Recommendation Grid (Upsell & Cross-sell) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upsell Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#0B72E7]" />
                <h3 className="font-bold text-sm text-[#072654]">
                  High-Impact Upsell Upgrades
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {analysisData?.upsell_recommendations?.length || 0} opportunities
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisData?.upsell_recommendations?.map((rec) => (
                <GrowthRecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onApplyRecommendation={handleApplyRecommendation}
                />
              ))}
            </div>
          </div>

          {/* Cross-Sell Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-sm text-[#072654]">
                  High-Affinity Cross-Sell Complements
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {analysisData?.cross_sell_recommendations?.length || 0} complements
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisData?.cross_sell_recommendations?.map((rec) => (
                <GrowthRecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onApplyRecommendation={handleApplyRecommendation}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Market Basket Affinity Matrix (Lift Analysis) */}
      <section>
        <BasketAffinityMatrix
          rules={analysisData?.affinity_rules || []}
        />
      </section>
    </div>
  );
}
