'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Product, CartState, CartItem, CheckoutResult } from '@/types/commerce';
import { ShoppingCartDrawer } from '@/components/commerce/ShoppingCartDrawer';
import { CheckoutSuccessModal } from '@/components/commerce/CheckoutSuccessModal';
import { 
  Search, 
  Filter, 
  ShoppingBag, 
  Heart, 
  Sparkles, 
  Bot, 
  Check, 
  Star, 
  Zap, 
  CreditCard,
  ShieldCheck,
  Tag,
  ArrowUpDown,
  SlidersHorizontal,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const CATEGORIES = [
  'All',
  'Fintech Hardware',
  'POS Devices',
  'Soundboxes',
  'Developer Hardware',
  'Enterprise Software'
];

export default function CustomerProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'stock'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Cart state
  const [cart, setCart] = useState<CartState>({
    items: [],
    subtotal: 0,
    tax_gst: 0,
    shipping: 0,
    discount: 0,
    coupon_applied: null,
    total: 0,
    currency: 'INR'
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Fetch catalog products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['customer-products-catalog'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/catalog/products?limit=100');
      return res?.items || res?.products || (Array.isArray(res) ? res : []);
    },
  });

  const products: Product[] = Array.isArray(productsData) ? productsData : [];

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const calculateCart = (items: CartItem[], coupon: string | null = cart.coupon_applied || null): CartState => {
    const items_total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gst_included = Math.round(items_total - (items_total / 1.18));
    const delivery_fee = items_total > 5000 || items_total === 0 ? 0 : 499;
    const platform_fee = 0;
    
    let discount = 0;
    if (coupon?.toUpperCase() === 'RAZOR2026') {
      discount = Math.round(items_total * 0.10);
    } else if (coupon?.toUpperCase() === 'FINTECH50') {
      discount = Math.min(2500, Math.round(items_total * 0.15));
    }

    const total = Math.max(0, items_total + delivery_fee + platform_fee - discount);

    return {
      items,
      items_total,
      subtotal: items_total,
      delivery_fee,
      platform_fee,
      gst_included,
      tax_gst: gst_included,
      shipping: delivery_fee,
      discount,
      coupon_applied: coupon,
      total,
      currency: 'INR'
    };
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.items.find(i => i.product_id === product.id);
      let updatedItems: CartItem[];
      const maxStock = product.stock_quantity ?? product.stock ?? 99;

      if (existing) {
        updatedItems = prev.items.map(i => 
          i.product_id === product.id 
            ? { ...i, quantity: Math.min(maxStock, i.quantity + 1) }
            : i
        );
      } else {
        const newItem: CartItem = {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image_url: product.image_url,
          category: product.category,
          product
        };
        updatedItems = [...prev.items, newItem];
      }
      return calculateCart(updatedItems, prev.coupon_applied || null);
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const updatedItems = prev.items
        .map(i => {
          if (i.product_id === productId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];

      return calculateCart(updatedItems, prev.coupon_applied || null);
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => {
      const updatedItems = prev.items.filter(i => i.product_id !== productId);
      return calculateCart(updatedItems, prev.coupon_applied || null);
    });
  };

  const handleApplyCoupon = (code: string) => {
    setCart((prev) => calculateCart(prev.items, code));
  };

  const checkoutMutation = useMutation({
    mutationFn: () => apiClient.post<CheckoutResult>('/commerce/checkout', { cart }),
    onSuccess: (res) => {
      setCheckoutResult(res);
      setIsCartOpen(false);
      setIsCheckoutModalOpen(true);
      setCart({
        items: [],
        subtotal: 0,
        tax_gst: 0,
        shipping: 0,
        discount: 0,
        coupon_applied: null,
        total: 0,
        currency: 'INR'
      });
    }
  });

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch = 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = 
          selectedCategory === 'All' ||
          p.category.toLowerCase().includes(selectedCategory.toLowerCase());

        const matchesStock = !inStockOnly || p.in_stock;

        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'stock') return (b.stock_quantity ?? b.stock ?? 0) - (a.stock_quantity ?? a.stock ?? 0);
        return 0; // featured default
      });
  }, [products, searchQuery, selectedCategory, inStockOnly, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Customer Experience</span>
            <span>•</span>
            <span className="text-[#0B72E7]">Official Storefront</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654]">
            Browse Product Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Explore 50+ enterprise hardware devices, point-of-sale terminals, 4G soundboxes, and developer accessories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/assistant">
            <Button className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span>Ask AI Assistant</span>
              <Sparkles className="h-3 w-3" />
            </Button>
          </Link>

          <Button
            onClick={() => setIsCartOpen(true)}
            className="h-10 px-4 rounded-xl bg-[#072654] hover:bg-[#0c356e] text-white text-xs font-semibold shadow-xs flex items-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Cart ({cart.items.reduce((s, i) => s + i.quantity, 0)})</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search products by title, SKU, or specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-slate-200 focus-visible:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="stock">Highest Stock</option>
              </select>
            </div>

            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                inStockOnly 
                  ? 'bg-blue-50 border-blue-200 text-[#0B72E7] font-bold' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Check className={`h-3.5 w-3.5 ${inStockOnly ? 'opacity-100' : 'opacity-0'}`} />
              <span>In Stock Only</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#0B72E7] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-white rounded-3xl border border-slate-200 animate-pulse p-4 space-y-3">
              <div className="h-44 bg-slate-100 rounded-2xl" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find any products matching your search criteria. Try clearing filters or searching for terms like "POS", "4G", or "Terminal".
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setInStockOnly(false);
            }}
            className="rounded-xl text-xs font-semibold"
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const isWishlisted = wishlist.includes(product.id);
            const stockCount = product.stock_quantity ?? product.stock ?? 0;

            return (
              <div
                key={product.id}
                className="group flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-md transition-all duration-200 hover:border-blue-200"
              >
                {/* Product Image & Badges */}
                <div className="relative aspect-4/3 bg-slate-50 overflow-hidden">
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1556742049-0a67c55c5934?auto=format&fit=crop&w=600&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                    <Badge className="bg-white/90 backdrop-blur-xs text-[#072654] border-0 text-[10px] font-bold shadow-2xs">
                      {product.category}
                    </Badge>
                    {(product.offer || product.active_offer) && (
                      <Badge className="bg-emerald-600 text-white border-0 text-[9px] font-bold shadow-2xs">
                        <Tag className="h-2.5 w-2.5 mr-0.5" />
                        {product.offer || product.active_offer}
                      </Badge>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors shadow-2xs"
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>

                  {/* Stock Indicator */}
                  <div className="absolute bottom-2 right-2">
                    {product.in_stock ? (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50/90 backdrop-blur-xs px-2 py-0.5 rounded-full border border-emerald-200">
                        {stockCount} In Stock
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-50/90 backdrop-blur-xs px-2 py-0.5 rounded-full border border-rose-200">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                      <span>SKU: {product.sku || product.id.slice(0, 8)}</span>
                      <span className="flex items-center text-amber-500 font-medium">
                        <Star className="h-3 w-3 fill-amber-400 mr-0.5" /> 4.9
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-[#072654] line-clamp-1 group-hover:text-[#0B72E7] transition-colors" title={product.name}>
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {product.description || 'Enterprise-grade hardware device optimized for high-volume transactions.'}
                    </p>
                  </div>

                  {/* Pricing and Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-base font-extrabold text-[#072654] block leading-tight">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-0.5">
                        <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                        Inclusive of GST
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        disabled={!product.in_stock}
                        onClick={() => handleAddToCart(product)}
                        className="h-8 px-3 rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold shadow-2xs gap-1.5"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>Add</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-out Shopping Cart Drawer */}
      <ShoppingCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onApplyCoupon={handleApplyCoupon}
        onCheckout={() => checkoutMutation.mutate()}
        isCheckingOut={checkoutMutation.isPending}
      />

      {/* Post-Checkout Razorpay Success Modal */}
      <CheckoutSuccessModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        result={checkoutResult}
      />
    </div>
  );
}
