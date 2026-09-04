'use client';

import React, { useState } from 'react';
import { Cart, CartItem } from '@/types/checkout';
import { CatalogProduct } from '@/types/catalog';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Package, 
  Tag, 
  Sparkles,
  ArrowRight,
  Boxes,
  PlusCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CartManagerProps {
  cart?: Cart;
  availableProducts?: CatalogProduct[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  isLoading: boolean;
}

export function CartManager({
  cart,
  availableProducts = [],
  onUpdateQuantity,
  onRemoveItem,
  onAddToCart,
  isLoading,
}: CartManagerProps) {
  const [isCatalogDrawerOpen, setIsCatalogDrawerOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');

  const items = cart?.items || [];

  const filteredCatalog = availableProducts.filter((p) => {
    if (!catalogSearch) return true;
    const term = catalogSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-0">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
            <ShoppingCart className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#072654]">
              Shopping Cart Items ({items.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Manage product line-items, adjust quantities, and inspect tax rates
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCatalogDrawerOpen(true)}
          className="h-8 px-3 text-xs bg-[#0B72E7] hover:bg-[#095bc0] text-white font-bold rounded-xl gap-1.5 shadow-xs"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Add Products</span>
        </Button>
      </div>

      {/* Cart Items Table */}
      {items.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
            <Boxes className="h-7 w-7" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Your Cart is Empty</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Use the AI Assistant above or click below to browse the 50-SKU enterprise catalog.
          </p>
          <Button
            size="sm"
            onClick={() => setIsCatalogDrawerOpen(true)}
            className="h-9 px-4 bg-[#072654] text-white font-bold rounded-xl text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Browse Enterprise Catalog
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 pl-6">Product Details</th>
                <th className="p-4 text-right">Unit Price</th>
                <th className="p-4 text-center">Quantity</th>
                <th className="p-4 text-right">Tax & Subtotal</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.product_id} className="hover:bg-blue-50/20 transition-colors group">
                  {/* Product Details */}
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <span className="font-bold text-slate-900 text-xs block line-clamp-1">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="font-mono text-[9px] px-1 py-0 bg-slate-50 text-slate-600 border-slate-200">
                            {item.sku}
                          </Badge>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {item.category}
                          </span>
                        </div>
                        {item.active_offer && (
                          <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-semibold mt-0.5">
                            <Sparkles className="h-2.5 w-2.5 text-indigo-500" />
                            <span>{item.active_offer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Unit Price */}
                  <td className="p-4 text-right">
                    <div className="font-extrabold text-xs text-[#072654]">
                      ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      +{item.gst_rate_pct}% GST
                    </span>
                  </td>

                  {/* Quantity Stepper */}
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                        disabled={isLoading}
                        className="h-6 w-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-extrabold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                        disabled={isLoading}
                        className="h-6 w-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </td>

                  {/* Subtotal */}
                  <td className="p-4 text-right">
                    <div className="font-extrabold text-sm text-[#0B72E7]">
                      ₹{item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Tax: ₹{(item.subtotal * (item.gst_rate_pct / 100)).toFixed(2)}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="p-4 pr-6 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.product_id)}
                      disabled={isLoading}
                      className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Remove item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Catalog Selector Modal */}
      {isCatalogDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#072654] text-white">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-300" />
                <h3 className="font-bold text-sm text-white">
                  Add Enterprise Products to Cart
                </h3>
              </div>
              <button
                onClick={() => setIsCatalogDrawerOpen(false)}
                className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <input
                type="text"
                placeholder="Search catalog by name, SKU, or category..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#0B72E7]"
              />
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100">
              {filteredCatalog.map((prod) => (
                <div key={prod.id} className="pt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="h-10 w-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block line-clamp-1">
                        {prod.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {prod.sku} • {prod.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-bold text-xs text-[#072654] block">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] text-emerald-600 font-semibold">
                        {prod.stock_quantity} in stock
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        onAddToCart(prod.id, 1);
                        setIsCatalogDrawerOpen(false);
                      }}
                      className="h-7 px-2.5 text-xs bg-[#0B72E7] hover:bg-[#095bc0] text-white font-bold rounded-lg gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
