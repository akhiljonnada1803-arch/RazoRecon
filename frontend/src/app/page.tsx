'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Product, CartItem, CartState } from '@/types/commerce';
import { ShoppingCartDrawer } from '@/components/commerce/ShoppingCartDrawer';
import { RazorpayMultiCheckoutModal } from '@/components/commerce/RazorpayMultiCheckoutModal';
import { 
  Sparkles, 
  ArrowRight, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star, 
  Flame, 
  Search, 
  Cpu, 
  Shirt, 
  Home as HomeIcon, 
  BookOpen, 
  Smile, 
  Apple, 
  Zap, 
  CheckCircle2,
  ChevronRight,
  Bot,
  TrendingUp,
  Heart,
  Eye,
  CreditCard,
  Building2,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoaders';

export default function PublicHomePage() {
  const router = useRouter();
  const [searchPrompt, setSearchPrompt] = useState('');
  const [activeRecommendationTab, setActiveRecommendationTab] = useState<'personalized' | 'trending' | 'recent'>('personalized');
  
  const [cart, setCart] = useState<CartState>({
    items: [],
    subtotal: 0,
    delivery_fee: 0,
    platform_fee: 0,
    gst_included: 0,
    tax_gst: 0,
    shipping: 0,
    discount: 0,
    coupon_applied: null,
    total: 0,
    currency: 'INR'
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);

  // Fetch catalog products from API
  const { data: catalogData, isLoading } = useQuery({
    queryKey: ['public-home-products'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/catalog/products?limit=12');
      return res?.products || res?.items || [];
    },
  });

  const products: Product[] = Array.isArray(catalogData) ? catalogData : [];

  const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.items.find((i) => i.product_id === product.id);
      let updatedItems: CartItem[];
      if (existing) {
        updatedItems = prev.items.map((i) =>
          i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updatedItems = [
          ...prev.items,
          {
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image_url: product.image_url,
            category: product.category,
            product
          }
        ];
      }
      const subtotal = round2(updatedItems.reduce((acc, it) => acc + it.price * it.quantity, 0));
      const gst_included = round2(subtotal - subtotal / 1.18);
      return {
        ...prev,
        items: updatedItems,
        items_total: subtotal,
        subtotal,
        gst_included,
        tax_gst: gst_included,
        total: subtotal
      };
    });
    setIsCartOpen(true);
  };

  const handleBuyNow = async (product: Product) => {
    // 1-Click Buy Now
    const singleCart: CartState = {
      items: [{
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image_url: product.image_url,
        category: product.category,
        product
      }],
      items_total: product.price,
      subtotal: product.price,
      gst_included: round2(product.price - product.price / 1.18),
      tax_gst: round2(product.price - product.price / 1.18),
      delivery_fee: 0,
      platform_fee: 0,
      shipping: 0,
      discount: 0,
      coupon_applied: null,
      total: product.price,
      currency: 'INR'
    };

    try {
      const res: any = await apiClient.post('/commerce/checkout', { cart: singleCart });
      setCheckoutResult(res);
      setIsCheckoutModalOpen(true);
    } catch (e) {
      console.error('Buy Now Checkout failed:', e);
      // Fallback
      handleAddToCart(product);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPrompt.trim()) {
      router.push('/customer/products');
      return;
    }
    router.push(`/customer/products?search=${encodeURIComponent(searchPrompt.trim())}`);
  };

  const suggestedSearches = [
    'Best POS machine',
    'Payment terminal',
    'Smart speaker',
    'Wireless headphones'
  ];

  const categories = [
    { 
      name: 'Electronics', 
      icon: Cpu, 
      desc: 'POS, Soundboxes & Terminals', 
      query: 'Fintech Hardware', 
      count: '120+ Products', 
      bg: 'from-blue-600 to-indigo-700',
      tag: 'Bestsellers'
    },
    { 
      name: 'Fashion', 
      icon: Shirt, 
      desc: 'Executive & Casual Apparel', 
      query: 'Fashion', 
      count: '85+ Products', 
      bg: 'from-purple-600 to-pink-600',
      tag: 'Trending'
    },
    { 
      name: 'Home', 
      icon: HomeIcon, 
      desc: 'Office Furniture & Smart Living', 
      query: 'Home', 
      count: '64+ Products', 
      bg: 'from-amber-600 to-orange-600',
      tag: 'New'
    },
    { 
      name: 'Beauty', 
      icon: Smile, 
      desc: 'Wellness, Skincare & Grooming', 
      query: 'Beauty', 
      count: '42+ Products', 
      bg: 'from-rose-500 to-pink-600',
      tag: 'Top Rated'
    },
    { 
      name: 'Books', 
      icon: BookOpen, 
      desc: 'Finance, GST & Tech Guides', 
      query: 'Books', 
      count: '58+ Products', 
      bg: 'from-emerald-600 to-teal-700',
      tag: 'Essential'
    },
    { 
      name: 'Grocery', 
      icon: Apple, 
      desc: 'Pantry, Gourmet Coffee & Snacks', 
      query: 'Grocery', 
      count: '90+ Products', 
      bg: 'from-lime-600 to-emerald-700',
      tag: 'Fast Delivery'
    }
  ];

  // Divide products into Featured and Recommendations
  const featuredProducts = products.slice(0, 4);
  const recommendedProducts = products.slice(4, 8);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 w-full">
        
        {/* ======================================================== */}
        {/* 1. HERO SECTION (Compact - Reduced Height by 40%)        */}
        {/* ======================================================== */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#072654] via-[#0A3875] to-[#0B72E7] text-white p-6 sm:p-10 shadow-xl border border-blue-900/30">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-3xl space-y-4 relative z-10">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Intelligent AI Commerce Marketplace</span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Shop Smarter with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-blue-100 to-white">AI Commerce</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xs sm:text-sm md:text-base text-blue-100/90 leading-relaxed max-w-2xl font-normal">
              Discover, compare and purchase products through intelligent AI-powered shopping.
            </p>

            {/* Compact Search Bar */}
            <form onSubmit={handleSearchSubmit} className="pt-1 max-w-2xl">
              <div className="flex items-center rounded-2xl bg-white p-1 shadow-2xl border border-white/50 focus-within:ring-2 focus-within:ring-amber-300 transition-all">
                <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchPrompt}
                  onChange={(e) => setSearchPrompt(e.target.value)}
                  placeholder="Find me a gaming laptop under ₹80,000"
                  className="w-full px-3 py-2 text-xs sm:text-sm text-slate-800 bg-transparent focus:outline-hidden placeholder:text-slate-400"
                />
                <Button 
                  type="submit" 
                  className="bg-[#0B72E7] hover:bg-[#095ec2] text-white rounded-xl text-xs font-bold px-5 h-9 shrink-0 shadow-xs"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Suggested Searches Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-blue-200/80 text-[11px] font-medium">Popular:</span>
              {suggestedSearches.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => router.push(`/customer/products?search=${encodeURIComponent(chip)}`)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-blue-100 hover:text-white text-[11px] font-medium transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a href="#featured-products">
                <Button 
                  size="sm" 
                  className="h-10 px-5 rounded-xl bg-white text-[#072654] hover:bg-slate-100 font-bold text-xs shadow-md gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#0B72E7]" />
                  <span>Start Shopping</span>
                </Button>
              </a>

              <Link href="/customer/assistant">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-10 px-5 rounded-xl border-white/30 text-white hover:bg-white/10 font-bold text-xs backdrop-blur-xs gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Talk to AI</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 2. SHOW PRODUCTS ABOVE THE FOLD (FEATURED PRODUCTS)      */}
        {/* ======================================================== */}
        <section id="featured-products" className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-[#072654] tracking-tight">
                  Featured Products
                </h2>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                  Verified Merchants
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Top rated products with GST-inclusive pricing & express delivery
              </p>
            </div>

            <Link 
              href="/customer/products" 
              className="text-xs font-bold text-[#0B72E7] hover:underline flex items-center gap-1"
            >
              <span>View All 50+ SKUs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product) => {
                const discountPct = 20;
                const originalPrice = round2(product.price * 1.25);
                const rating = 4.8;
                const reviewsCount = 1240;

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-blue-300 transition-all duration-200 flex flex-col justify-between overflow-hidden relative"
                  >
                    {/* Badge */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                      <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                        {discountPct}% OFF
                      </span>
                    </div>

                    {/* Image Container */}
                    <Link 
                      href={`/customer/products/${product.id}`}
                      className="h-48 w-full bg-slate-50 overflow-hidden flex items-center justify-center relative p-4"
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </Link>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {product.category}
                        </span>
                        <Link 
                          href={`/customer/products/${product.id}`}
                          className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#0B72E7] transition-colors line-clamp-2 block leading-snug mt-1"
                          title={product.name}
                        >
                          {product.name}
                        </Link>
                      </div>

                      {/* Rating & Reviews */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold text-[11px]">
                          <span>{rating}</span>
                          <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                        </div>
                        <span className="text-[11px] text-slate-400">
                          ({reviewsCount.toLocaleString('en-IN')} reviews)
                        </span>
                      </div>

                      {/* Pricing Section (GST Inclusive) */}
                      <div className="space-y-0.5 border-t border-slate-100 pt-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base sm:text-lg font-black text-[#072654]">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ₹{originalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-emerald-700 font-bold">
                            Inclusive of GST
                          </span>
                          <span className="text-slate-500 flex items-center gap-0.5">
                            <Truck className="w-3 h-3 text-emerald-600" />
                            <span>FREE Delivery by Tomorrow</span>
                          </span>
                        </div>
                      </div>

                      {/* Dual Action CTA: Add to Cart & Buy Now */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          className="text-xs font-bold border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-800 rounded-xl h-9"
                        >
                          Add to Cart
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleBuyNow(product)}
                          className="text-xs font-bold bg-[#0B72E7] hover:bg-[#095ec2] text-white rounded-xl h-9 shadow-xs"
                        >
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* 3. CATEGORY SECTION                                      */}
        {/* ======================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[#072654] tracking-tight">
                Shop by Category
              </h2>
              <p className="text-xs text-slate-500">
                Explore popular consumer electronics, fashion, home essentials and more
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                href={`/customer/products?category=${encodeURIComponent(cat.query)}`}
                className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-center flex flex-col items-center justify-between space-y-3 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.bg} text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block group-hover:text-[#0B72E7] transition-colors">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-semibold">
                    {cat.count}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. AI RECOMMENDATION SECTION                             */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0B72E7]" />
                <h2 className="text-xl font-extrabold text-[#072654] tracking-tight">
                  Recommended For You
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                AI curated selections based on your browsing patterns and marketplace demand
              </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold text-slate-600">
              <button
                onClick={() => setActiveRecommendationTab('personalized')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeRecommendationTab === 'personalized'
                    ? 'bg-white text-[#0B72E7] shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Personalized
              </button>
              <button
                onClick={() => setActiveRecommendationTab('trending')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeRecommendationTab === 'trending'
                    ? 'bg-white text-[#0B72E7] shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Trending
              </button>
              <button
                onClick={() => setActiveRecommendationTab('recent')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeRecommendationTab === 'recent'
                    ? 'bg-white text-[#0B72E7] shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Recently Viewed
              </button>
            </div>
          </div>

          {/* Recommended Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(recommendedProducts.length > 0 ? recommendedProducts : featuredProducts).map((product, idx) => (
              <div
                key={product.id || idx}
                className="group bg-slate-50/70 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between hover:bg-white hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      {idx === 0 ? '98% Match' : idx === 1 ? 'Trending #1' : idx === 2 ? 'AI Pick' : 'Best Value'}
                    </span>
                    <Heart className="w-4 h-4 text-slate-300 hover:text-rose-500 cursor-pointer transition-colors" />
                  </div>

                  <Link 
                    href={`/customer/products/${product.id}`}
                    className="h-36 w-full bg-white rounded-xl overflow-hidden flex items-center justify-center p-2 mb-3 border border-slate-200/60"
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </Link>

                  <Link 
                    href={`/customer/products/${product.id}`}
                    className="font-bold text-xs text-slate-900 line-clamp-2 group-hover:text-[#0B72E7] transition-colors"
                  >
                    {product.name}
                  </Link>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-[#072654]">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      GST Included
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    className="w-full text-xs font-bold bg-[#072654] hover:bg-[#0B72E7] text-white rounded-xl h-8 shadow-xs"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5. TRUST SECTION                                         */}
        {/* ======================================================== */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              icon: Lock, 
              title: 'Secure Razorpay Payments', 
              desc: '100% Encrypted transactions with instant reconciliation & fraud protection' 
            },
            { 
              icon: Truck, 
              title: 'Fast Delivery', 
              desc: 'Same-day dispatch with 11-stage live courier tracking via Delhivery & BlueDart' 
            },
            { 
              icon: RotateCcw, 
              title: 'Easy Returns', 
              desc: '7-day hassle-free refunds processed directly to your original payment source' 
            },
            { 
              icon: ShieldCheck, 
              title: 'Verified Merchants', 
              desc: '100% authentic products guaranteed by certified Razorpay business sellers' 
            }
          ].map((item, i) => (
            <div 
              key={i} 
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-colors flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </section>

      </div>

      {/* ======================================================== */}
      {/* 6. FOOTER                                                */}
      {/* ======================================================== */}
      <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Col 1: Brand */}
            <div className="col-span-2 space-y-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#0B72E7] text-white flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-black text-base text-[#072654] tracking-tight">
                  Razor<span className="text-[#0B72E7]">Commerce</span> AI
                </span>
              </Link>
              <p className="text-slate-500 max-w-sm leading-relaxed text-[11px]">
                The next-generation AI commerce operating system. Autonomous product discovery, real-time comparison, GST-inclusive transparent pricing, and instant multi-method Razorpay checkout.
              </p>
              <div className="text-[11px] text-slate-400">
                © 2026 RazorCommerce AI. Powered by Razorpay Commerce Architecture.
              </div>
            </div>

            {/* Col 2: Marketplace */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                Marketplace
              </h5>
              <ul className="space-y-1.5 text-slate-500">
                <li><Link href="/customer/products" className="hover:text-[#0B72E7]">All Products</Link></li>
                <li><Link href="/customer/products?deals=true" className="hover:text-[#0B72E7]">Trending Deals</Link></li>
                <li><Link href="/customer/assistant" className="hover:text-[#0B72E7]">AI Shopping Copilot</Link></li>
                <li><Link href="/customer/track" className="hover:text-[#0B72E7]">Track Order</Link></li>
              </ul>
            </div>

            {/* Col 3: Company */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                Company
              </h5>
              <ul className="space-y-1.5 text-slate-500">
                <li><Link href="/about" className="hover:text-[#0B72E7]">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-[#0B72E7]">Contact Support</Link></li>
                <li><Link href="/privacy" className="hover:text-[#0B72E7]">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[#0B72E7]">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Col 4: Merchants */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                For Business
              </h5>
              <ul className="space-y-1.5 text-slate-500">
                <li><Link href="/login" className="hover:text-[#0B72E7] font-semibold text-[#0B72E7]">Become a Merchant</Link></li>
                <li><Link href="/merchant/dashboard" className="hover:text-[#0B72E7]">Merchant Portal</Link></li>
                <li><Link href="/hero-demo" className="hover:text-[#0B72E7]">Live Demo Flow</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Shopping Cart Drawer */}
      <ShoppingCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={(pId, delta) => {
          setCart((prev) => {
            const updated = prev.items
              .map((i) => (i.product_id === pId ? { ...i, quantity: i.quantity + delta } : i))
              .filter((i) => i.quantity > 0);
            const sub = round2(updated.reduce((acc, it) => acc + it.price * it.quantity, 0));
            const gst = round2(sub - sub / 1.18);
            return { ...prev, items: updated, subtotal: sub, items_total: sub, gst_included: gst, tax_gst: gst, total: sub };
          });
        }}
        onRemoveItem={(pId) => {
          setCart((prev) => {
            const updated = prev.items.filter((i) => i.product_id !== pId);
            const sub = round2(updated.reduce((acc, it) => acc + it.price * it.quantity, 0));
            const gst = round2(sub - sub / 1.18);
            return { ...prev, items: updated, subtotal: sub, items_total: sub, gst_included: gst, tax_gst: gst, total: sub };
          });
        }}
        onApplyCoupon={(code) => {
          const disc = code.toUpperCase() === 'RAZOR2026' ? round2(cart.subtotal * 0.1) : 0;
          setCart((prev) => ({
            ...prev,
            coupon_applied: code,
            discount: disc,
            total: Math.max(0, round2(prev.subtotal - disc))
          }));
        }}
        onCheckout={async () => {
          if (cart.items.length === 0) return;
          try {
            const res: any = await apiClient.post('/commerce/checkout', { cart });
            setCheckoutResult(res);
            setIsCartOpen(false);
            setIsCheckoutModalOpen(true);
          } catch (e) {
            console.error(e);
          }
        }}
        isCheckingOut={false}
      />

      {/* Razorpay Multi-Method Checkout Modal */}
      <RazorpayMultiCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        result={checkoutResult}
      />
    </div>
  );
}
