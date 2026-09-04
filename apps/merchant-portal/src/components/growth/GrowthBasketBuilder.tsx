'use client';

import React from 'react';
import { GrowthBasketItem, SampleBasket } from '@/types/growth';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  Sparkles, 
  Package, 
  Layers, 
  RotateCcw,
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface GrowthBasketBuilderProps {
  basketItems: GrowthBasketItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  sampleBaskets: SampleBasket[];
  onSelectSampleBasket: (basket: SampleBasket) => void;
  onResetBasket: () => void;
  isAnalyzing: boolean;
}

export function GrowthBasketBuilder({
  basketItems,
  onUpdateQuantity,
  onRemoveItem,
  sampleBaskets,
  onSelectSampleBasket,
  onResetBasket,
  isAnalyzing,
}: GrowthBasketBuilderProps) {
  const basketTotal = basketItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalUnits = basketItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
      {/* Title & Preset Switchers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#072654] flex items-center gap-2">
              Active Merchant Cart
              <Badge className="bg-[#0B72E7] text-white text-[10px] py-0 border-0">
                {totalUnits} units
              </Badge>
            </h3>
            <p className="text-xs text-slate-500">
              Live checkout items analyzed for upsell & cross-sell attachment opportunities
            </p>
          </div>
        </div>

        {/* Preset Sample Baskets */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Store className="h-3 w-3" />
            Presets:
          </span>
          {sampleBaskets.map((sb) => (
            <button
              key={sb.id}
              onClick={() => onSelectSampleBasket(sb)}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-blue-50 hover:text-[#0B72E7] border border-slate-200 hover:border-blue-200 rounded-xl text-slate-700 whitespace-nowrap transition-all"
              title={sb.description}
            >
              {sb.name}
            </button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetBasket}
            className="h-7 px-2 text-xs text-slate-400 hover:text-slate-600 rounded-lg"
            title="Reset Cart"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Cart Items Grid/List */}
      <div className="space-y-3">
        {basketItems.map((item) => (
          <div
            key={item.product_id}
            className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-900 line-clamp-1">
                  {item.name}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-extrabold text-[#0B72E7]">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    ({item.brand} • {item.category})
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper & Total */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center border border-slate-200 bg-white rounded-xl overflow-hidden h-8">
                <button
                  onClick={() => onUpdateQuantity(item.product_id, -1)}
                  className="px-2 h-full text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="px-2.5 text-xs font-bold text-slate-800">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.product_id, 1)}
                  className="px-2 h-full text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <div className="w-24 text-right">
                <div className="text-xs font-extrabold text-[#072654]">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>

              <button
                onClick={() => onRemoveItem(item.product_id)}
                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                title="Remove Item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Basket Total Summary */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <span className="font-medium">Subtotal of Active Merchant Basket:</span>
        <span className="text-base font-extrabold text-[#072654]">
          ₹{basketTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
