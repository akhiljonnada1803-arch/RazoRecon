'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Product } from '@/types/commerce';
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  Sparkles, 
  Bot, 
  ArrowRight,
  Package,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function CustomerWishlistPage() {
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['customer-wishlist-products'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/catalog/products?limit=20');
      return res?.items || res?.products || res || [];
    },
  });

  const products: Product[] = Array.isArray(productsData) ? productsData : [];
  // Take sample items for wishlist demonstration
  const [wishlistItems, setWishlistItems] = useState<string[]>(['SKU-POS-001', 'SKU-SND-002', 'SKU-KBD-006']);

  const activeWishlist = products.filter((p) => wishlistItems.includes(p.id) || wishlistItems.includes(p.sku || ''));

  const removeFromWishlist = (id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Customer Experience</span>
            <span>•</span>
            <span className="text-[#0B72E7]">Saved Items</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654] flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            My Wishlist
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Save items for future purchases, track price drops, and get personalized bundle recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/customer/assistant">
            <Button className="h-10 px-4 rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold shadow-xs flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span>Ask AI to Recommend Bundles</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid */}
      {activeWishlist.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Heart className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our catalog and save your favorite devices to keep track of stock and discounts.
          </p>
          <Link href="/customer/products">
            <Button size="sm" className="rounded-xl text-xs font-semibold bg-[#0B72E7] hover:bg-[#095ec2] text-white">
              Explore Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {activeWishlist.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-md transition-all duration-200"
            >
              <div className="relative aspect-4/3 bg-slate-50 overflow-hidden">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1556742049-0a67c55c5934?auto=format&fit=crop&w=600&q=80'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shadow-2xs"
                  title="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <Badge className="bg-slate-100 text-slate-700 border-0 text-[10px] font-semibold mb-1">
                    {product.category}
                  </Badge>
                  <h3 className="font-bold text-sm text-[#072654] line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{product.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-[#072654]">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Link href="/customer/assistant">
                    <Button size="sm" className="h-8 px-3 rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold gap-1.5 shadow-2xs">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>Buy via AI</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
