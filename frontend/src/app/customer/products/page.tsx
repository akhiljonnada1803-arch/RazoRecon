'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Product, CartState, CartItem, CheckoutResult } from '@/types/commerce';
import { ShoppingCartDrawer } from '@/components/commerce/ShoppingCartDrawer';
import { CheckoutSuccessModal } from '@/components/commerce/CheckoutSuccessModal';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  Sparkles, 
  Bot, 
  Check, 
  Star, 
  Zap, 
  ShieldCheck, 
  Tag, 
  ArrowUpDown, 
  Package, 
  Flame, 
  Percent, 
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

function CustomerProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL parameters
  const dealsParam = searchParams.get('deals') === 'true';
  const categoryParam = searchParams.get('category') || 'All';
  const searchUrlParam = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(searchUrlParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [isDealsOnly, setIsDealsOnly] = useState(dealsParam);
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'stock' | 'discount'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Sync state if URL query params change
  useEffect(() => {
    setIsDealsOnly(searchParams.get('deals') === 'true');
    if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category')!);
    }
    if (searchParams.get('search')) {
      setSearchQuery(searchParams.get('search')!);
    }
  }, [searchParams]);

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

  const products: Product[] = useMemo(() => {
    return Array.isArray(productsData) ? productsData : [];
  }, [productsData]);

  // Dynamically derive unique categories from the product catalog
  const categories = useMemo(() => {
    const rawCategories = products
      .map(p => p.category)
      .filter((c): c is string => Boolean(c && typeof c === 'string'));
    const unique = Array.from(new Set(rawCategories)).sort();
    return ['All', ...unique];
  }, [products]);

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

  const isProductDeal = (p: Product) => {
    return Boolean(
      (p.original_price && p.original_price > p.price) ||
      (p.offer_discount_pct && p.offer_discount_pct > 0) ||
      p.active_offer ||
      p.offer ||
      p.offer_badge
    );
  };

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch = !query ||
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.sku && p.sku.toLowerCase().includes(query)) ||
          (p.brand && p.brand.toLowerCase().includes(query));

        const matchesCategory = 
          selectedCategory === 'All' ||
          p.category.toLowerCase() === selectedCategory.toLowerCase();

        const matchesDeals = !isDealsOnly || isProductDeal(p);

        const matchesStock = !inStockOnly || p.in_stock;

        return matchesSearch && matchesCategory && matchesDeals && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'stock') return (b.stock_quantity ?? b.stock ?? 0) - (a.stock_quantity ?? a.stock ?? 0);
        if (sortBy === 'discount') {
          const discountA = a.original_price ? (a.original_price - a.price) : 0;
          const discountB = b.original_price ? (b.original_price - b.price) : 0;
          return discountB - discountA;
        }
        return 0; // featured default
      });
  }, [products, searchQuery, selectedCategory, isDealsOnly, inStockOnly, sortBy]);

  const totalDealsCount = useMemo(() => {
    return products.filter(isProductDeal).length;
  }, [products]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setIsDealsOnly(false);
    setInStockOnly(false);
    setSortBy('featured');
    router.replace('/customer/products');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Customer Experience</span>
            <span>•</span>
            <span className="text-[#0B72E7] font-bold">Official Storefront</span>
            {isDealsOnly && (
              <>
                <span>•</span>
                <span className="text-amber-600 font-bold flex items-center gap-1">
                  <Flame className="h-3 w-3 fill-amber-500" /> Exclusive Deals
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654]">
            {isDealsOnly ? '🔥 Hot Deals & Promotional Offers' : 'Browse Product Catalog'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {isDealsOnly 
              ? `Save big on ${totalDealsCount} enterprise-grade hardware devices, terminals, soundboxes, and accessories with instant GST credit.`
              : 'Explore enterprise hardware devices, point-of-sale terminals, 4G soundboxes, and developer accessories.'
            }
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/customer/assistant">
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

      {/* Deals Highlight Callout (if in Deals mode) */}
      {isDealsOnly && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-0.5 rounded-3xl shadow-sm">
          <div className="bg-white/95 backdrop-blur-sm rounded-[22px] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-inner">
                <Flame className="h-6 w-6 fill-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-slate-900">
                    Flash Deals & Volume Discounts Active
                  </h2>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-bold">
                    {filteredProducts.length} Offers Available
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  All promotional products feature certified Razorpay merchant pricing, 18% GST invoice deduction, and instant checkout.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsDealsOnly(false);
                router.replace('/customer/products');
              }}
              className="text-xs font-bold rounded-xl border-slate-300 hover:bg-slate-50 shrink-0"
            >
              View Full Catalog
            </Button>
          </div>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search products by title, SKU, brand, or specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-slate-200 focus-visible:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Deals Quick Filter Toggle */}
            <button
              onClick={() => {
                const next = !isDealsOnly;
                setIsDealsOnly(next);
                if (next) {
                  router.replace('/customer/products?deals=true');
                } else {
                  router.replace('/customer/products');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isDealsOnly 
                  ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-xs' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Flame className={`h-3.5 w-3.5 ${isDealsOnly ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
              <span>Only Deals</span>
              {totalDealsCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isDealsOnly ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-500'}`}>
                  {totalDealsCount}
                </span>
              )}
            </button>

            {/* In Stock Toggle */}
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                inStockOnly 
                  ? 'bg-blue-50 border-blue-200 text-[#0B72E7] font-bold' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Check className={`h-3.5 w-3.5 ${inStockOnly ? 'opacity-100 text-[#0B72E7]' : 'opacity-0'}`} />
              <span>In Stock Only</span>
            </button>

            {/* Sorting Dropdown */}
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
                <option value="discount">Biggest Discount</option>
                <option value="stock">Highest Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            const count = cat === 'All' 
              ? products.length 
              : products.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0B72E7] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-400/40 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
            We couldn't find any products matching your current search or category filter. Try clearing filters or resetting.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="rounded-xl text-xs font-semibold flex items-center gap-2 mx-auto mt-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All Filters</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const isWishlisted = wishlist.includes(product.id);
            const stockCount = product.stock_quantity ?? product.stock ?? 0;
            const hasDiscount = product.original_price && product.original_price > product.price;
            const discountPct = hasDiscount 
              ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
              : (product.offer_discount_pct || 0);
            const offerText = product.offer_badge || product.active_offer || product.offer;

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
                  <div className="absolute top-3 left-3 flex flex-col gap-1 items-start max-w-[70%]">
                    <Badge className="bg-white/90 backdrop-blur-xs text-[#072654] border-0 text-[10px] font-bold shadow-2xs truncate">
                      {product.category}
                    </Badge>
                    {offerText && (
                      <Badge className="bg-amber-600 text-white border-0 text-[9px] font-extrabold shadow-2xs flex items-center gap-1">
                        <Flame className="h-2.5 w-2.5 fill-white" />
                        <span className="truncate">{offerText}</span>
                      </Badge>
                    )}
                  </div>

                  {/* Discount percentage tag */}
                  {discountPct > 0 && (
                    <div className="absolute bottom-2 left-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xs flex items-center gap-0.5">
                      <Percent className="h-2.5 w-2.5" />
                      <span>{discountPct}% OFF</span>
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors shadow-2xs cursor-pointer"
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
                        <Star className="h-3 w-3 fill-amber-400 mr-0.5" /> {product.rating || 4.9}
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
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-extrabold text-[#072654] leading-tight">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through font-medium">
                            ₹{product.original_price!.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
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
                        className="h-8 px-3 rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold shadow-2xs gap-1.5 cursor-pointer"
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

export default function CustomerProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50/50 p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 font-medium text-xs animate-pulse">
          <Package className="h-5 w-5 animate-spin text-[#0B72E7]" />
          <span>Loading product catalog...</span>
        </div>
      </div>
    }>
      <CustomerProductsContent />
    </Suspense>
  );
}
