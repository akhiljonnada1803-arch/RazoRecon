'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Product, CartItem, CartState } from '@/types/commerce';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCartDrawer } from '@/components/commerce/ShoppingCartDrawer';
import { RazorpayMultiCheckoutModal } from '@/components/commerce/RazorpayMultiCheckoutModal';
import { CustomerAuthModal } from '@/components/commerce/CustomerAuthModal';
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
  Sliders, 
  Briefcase, 
  Terminal, 
  Headphones, 
  Zap, 
  CheckCircle2,
  ChevronRight,
  Bot,
  TrendingUp,
  Heart,
  Eye,
  CreditCard,
  Building2,
  Lock,
  Store,
  MessageSquare,
  Award,
  ThumbsUp,
  PackageCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoaders';

export default function PublicHomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [searchPrompt, setSearchPrompt] = useState('');
  const [activeRecommendationTab, setActiveRecommendationTab] = useState<'personalized' | 'trending' | 'recent'>('personalized');
  
  const [cart, setCart] = useState<CartState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('razorcommerce_cart');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {
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
    };
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);

  // Fetch catalog products from API
  const { data: catalogData, isLoading } = useQuery({
    queryKey: ['public-home-products'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/catalog/products?limit=16');
      return res?.products || res?.items || [];
    },
  });

  const products: Product[] = Array.isArray(catalogData) ? catalogData : [];
  const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

  // Sync cart to localStorage for Amazon-style cart persistence & post-login merge
  React.useEffect(() => {
    try {
      localStorage.setItem('razorcommerce_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  const handleAddToCart = (product: Product) => {
    // GUEST GATING: If not authenticated, open login modal and do NOT add item immediately
    if (!isAuthenticated) {
      setPendingProduct(product);
      try {
        localStorage.setItem('razorcommerce_pending_item', JSON.stringify(product));
      } catch (e) {}
      setIsAuthModalOpen(true);
      return;
    }

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
    // GUEST GATING: If not authenticated, redirect to login with redirect to checkout
    if (!isAuthenticated) {
      try {
        localStorage.setItem('razorcommerce_staged_buy_now', JSON.stringify(product));
      } catch (e) {}
      router.push('/login?redirect=/checkout');
      return;
    }

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
      handleAddToCart(product);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPrompt.trim()) {
      router.push('/products');
      return;
    }
    router.push(`/products?search=${encodeURIComponent(searchPrompt.trim())}`);
  };

  const suggestedSearches = [
    'Smart POS Machine',
    '4G Soundbox',
    'Developer Kit',
    'ERP Billing Software',
    'Barcode Scanner'
  ];

  // Specific 5 Required Categories
  const categories = [
    { 
      name: 'Electronics', 
      icon: Cpu, 
      desc: 'Smart Terminals, Displays & Audio', 
      query: 'Electronics', 
      count: '140+ Items', 
      bg: 'from-blue-600 to-indigo-700',
      tag: 'Bestseller'
    },
    { 
      name: 'Fintech Hardware', 
      icon: CreditCard, 
      desc: 'POS Terminals & 4G Soundboxes', 
      query: 'Fintech Hardware', 
      count: '95+ Items', 
      bg: 'from-sky-500 to-blue-600',
      tag: 'Verified GST'
    },
    { 
      name: 'Software', 
      icon: Terminal, 
      desc: 'ERP, Inventory & Accounting Licenses', 
      query: 'Software', 
      count: '60+ Items', 
      bg: 'from-indigo-600 to-purple-700',
      tag: 'Instant License'
    },
    { 
      name: 'Business Tools', 
      icon: Briefcase, 
      desc: 'Thermal Printers, Scanners & Scales', 
      query: 'Business Tools', 
      count: '80+ Items', 
      bg: 'from-emerald-600 to-teal-700',
      tag: 'Express Ship'
    },
    { 
      name: 'Accessories', 
      icon: Headphones, 
      desc: 'Cables, Docks, Paper Rolls & Cases', 
      query: 'Accessories', 
      count: '110+ Items', 
      bg: 'from-amber-500 to-orange-600',
      tag: 'Value Packs'
    }
  ];

  const featuredProducts = products.slice(0, 4);
  const trendingProducts = products.slice(4, 8).length > 0 ? products.slice(4, 8) : products.slice(0, 4);

  // Verified Merchant Spotlight Data
  const merchantSpotlights = [
    {
      name: 'Acme Direct Corp',
      tagline: 'Leading Provider of Certified Fintech Hardware',
      rating: 4.9,
      reviews: 4820,
      badge: 'Platinum Merchant',
      badgeColor: 'bg-blue-50 text-[#0B72E7] border-blue-200',
      ordersCount: '28,400+ Orders',
      deliverySpeed: '99.4% On-time',
      image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'FinTech Hub India',
      tagline: 'Smart POS Terminals & Dynamic QR Speakers',
      rating: 4.8,
      reviews: 3150,
      badge: 'Certified Seller',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      ordersCount: '19,200+ Orders',
      deliverySpeed: '98.9% On-time',
      image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&auto=format&fit=crop&q=60'
    },
    {
      name: 'Apex Commerce Solutions',
      tagline: 'Enterprise Billing & Thermal Receipt Systems',
      rating: 4.9,
      reviews: 2480,
      badge: 'Top Rated',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      ordersCount: '14,800+ Orders',
      deliverySpeed: '99.8% On-time',
      image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=500&auto=format&fit=crop&q=60'
    }
  ];

  // Customer Reviews Data
  const customerReviews = [
    {
      id: 1,
      author: 'Rohit Khandelwal',
      role: 'Retail Store Owner, Bengaluru',
      rating: 5,
      date: '2 days ago',
      title: 'Flawless 1-Click Razorpay Checkout & Fast Dispatch',
      content: 'Ordered two Smart POS terminals. The AI assistant recommended the exact bundle compatible with our GST billing system. Received tracking updates via Delhivery within 3 hours.',
      verified: true
    },
    {
      id: 2,
      author: 'Pooja Deshmukh',
      role: 'Operations Head, TechMart Pune',
      rating: 5,
      date: '1 week ago',
      title: 'Completely Transparent GST Invoicing',
      content: 'No hidden taxes added at the final step! The price shown on the product card was the exact amount billed on our corporate invoice with input tax credit eligibility.',
      verified: true
    },
    {
      id: 3,
      author: 'Vikas Swaminathan',
      role: 'Managing Director, SouthCo Logistics',
      rating: 5,
      date: '2 weeks ago',
      title: 'AI Shopping Assistant Saved Hours of Research',
      content: 'We needed thermal printers that support 80mm high-speed rolls. The AI shopper accurately filtered compliant models with verified merchant warranties.',
      verified: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12 w-full">
        
        {/* ======================================================== */}
        {/* SECTION 1: HERO BANNER                                   */}
        {/* ======================================================== */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#072654] via-[#0A3875] to-[#0B72E7] text-white p-6 sm:p-10 shadow-xl border border-blue-900/30">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-3xl space-y-4 relative z-10">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>AI Commerce Marketplace</span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              AI Commerce Marketplace.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-blue-100 to-white">
                Discover, Compare & Buy with AI.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xs sm:text-sm md:text-base text-blue-100/90 leading-relaxed max-w-2xl font-normal">
              Explore thousands of verified POS hardware, soundboxes, business tools, and enterprise software with instant Razorpay checkout.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="pt-1 max-w-2xl">
              <div className="flex items-center rounded-2xl bg-white p-1 shadow-2xl border border-white/50 focus-within:ring-2 focus-within:ring-amber-300 transition-all">
                <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchPrompt}
                  onChange={(e) => setSearchPrompt(e.target.value)}
                  placeholder="Search products, POS terminals, soundboxes, or ask AI..."
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

            {/* Featured Offers & Popular Searches */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-blue-200/80 text-[11px] font-medium">Trending Searches:</span>
              {suggestedSearches.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => router.push(`/products?search=${encodeURIComponent(chip)}`)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-blue-100 hover:text-white text-[11px] font-medium transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/products">
                <Button 
                  size="sm" 
                  className="h-10 px-5 rounded-xl bg-white text-[#072654] hover:bg-slate-100 font-bold text-xs shadow-md gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#0B72E7]" />
                  <span>Browse All Products</span>
                </Button>
              </Link>

              <Link href="/assistant">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-10 px-5 rounded-xl border-white/30 text-white hover:bg-white/10 font-bold text-xs backdrop-blur-xs gap-2"
                >
                  <Bot className="w-4 h-4 text-amber-300" />
                  <span>Ask AI Shopping Assistant</span>
                </Button>
              </Link>

              <a 
                href="http://localhost:3001" 
                className="text-xs font-semibold text-blue-200 hover:text-white underline underline-offset-4 flex items-center gap-1 ml-2"
              >
                <span>Become a Seller</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: CATEGORIES (5 SPECIFIC CATEGORIES)             */}
        {/* ======================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[#072654] tracking-tight">
                Shop by Category
              </h2>
              <p className="text-xs text-slate-500">
                Explore verified collections curated for commercial reliability and instant tax invoicing
              </p>
            </div>
            <Link href="/products" className="text-xs font-bold text-[#0B72E7] hover:underline flex items-center gap-1">
              <span>View All Categories</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                href={`/products?category=${encodeURIComponent(cat.query)}`}
                className="group bg-white p-5 rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all text-center flex flex-col items-center justify-between space-y-3 cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${cat.bg} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="font-extrabold text-sm text-slate-900 block group-hover:text-[#0B72E7] transition-colors">
                    {cat.name}
                  </span>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{cat.desc}</p>
                  <Badge variant="outline" className="text-[10px] font-mono text-slate-500 mt-1">
                    {cat.count}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 3: TRENDING PRODUCTS                             */}
        {/* ======================================================== */}
        <section id="trending-products" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h2 className="text-xl font-extrabold text-[#072654] tracking-tight">
                  Trending Products
                </h2>
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                  High Demand
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Top rated fintech devices and tools with GST-inclusive pricing & express delivery
              </p>
            </div>

            <Link 
              href="/products?deals=true" 
              className="text-xs font-bold text-[#0B72E7] hover:underline flex items-center gap-1"
            >
              <span>Explore Deals</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {trendingProducts.map((product) => {
                const discountPct = 20;
                const originalPrice = round2(product.price * 1.25);
                const rating = 4.9;
                const reviewsCount = 1420;

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-blue-300 transition-all duration-200 flex flex-col justify-between overflow-hidden relative"
                  >
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                      <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                        {discountPct}% OFF
                      </span>
                    </div>

                    <Link 
                      href={`/products/${product.id}`}
                      className="h-48 w-full bg-slate-50 overflow-hidden flex items-center justify-center relative p-4"
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </Link>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {product.category}
                        </span>
                        <Link 
                          href={`/products/${product.id}`}
                          className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#0B72E7] transition-colors line-clamp-2 block leading-snug mt-1"
                          title={product.name}
                        >
                          {product.name}
                        </Link>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold text-[11px]">
                          <span>{rating}</span>
                          <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                        </div>
                        <span className="text-[11px] text-slate-400">
                          ({reviewsCount.toLocaleString('en-IN')} reviews)
                        </span>
                      </div>

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
                            <span>FREE Delivery</span>
                          </span>
                        </div>
                      </div>

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
        {/* SECTION 4: AI SHOPPING ASSISTANT BANNER & INTERACTIVE WIDGET */}
        {/* ======================================================== */}
        <section className="bg-gradient-to-r from-blue-900 via-[#072654] to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-blue-800/40 shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-xl">
              <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 text-[11px] font-semibold px-3 py-1">
                AUTONOMOUS SHOPPING COPILOT
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                AI Shopping Assistant
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
                Need help picking the best soundbox or POS machine for your store? Ask our AI assistant to compare specifications, calculate bulk GST discounts, and generate 1-click Razorpay bundles.
              </p>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  'Recommend best 4G Soundbox for high-noise shop',
                  'Compare Smart POS V3 Pro vs Android Terminal',
                  'Find billing software with GST e-invoicing'
                ].map((q, idx) => (
                  <Link key={idx} href={`/assistant?q=${encodeURIComponent(q)}`}>
                    <button className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-blue-100 hover:text-white text-xs font-medium transition-all text-left">
                      💡 {q}
                    </button>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15 max-w-md w-full space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B72E7] flex items-center justify-center text-white font-bold shadow-md">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Ask AI Shopper</h4>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Online & Ready
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-black/20 rounded-2xl border border-white/10 text-xs text-blue-100 leading-relaxed">
                "Hello! I can match your store transaction volume with the most cost-efficient POS terminal, verify input tax credit, and create an instant checkout link."
              </div>

              <Link href="/assistant" className="block w-full">
                <Button className="w-full bg-[#0B72E7] hover:bg-blue-500 text-white font-bold rounded-xl text-xs h-10 shadow-lg">
                  Launch Full AI Shopping Assistant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 5: MERCHANT SPOTLIGHT                            */}
        {/* ======================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#0B72E7]" />
                <h2 className="text-xl font-extrabold text-[#072654] tracking-tight">
                  Merchant Spotlight
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Verified high-volume sellers operating on the RazorCommerce OS platform
              </p>
            </div>

            <a 
              href="http://localhost:3001" 
              className="text-xs font-bold text-[#0B72E7] hover:underline flex items-center gap-1"
            >
              <span>Join as a Merchant</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {merchantSpotlights.map((merchant, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                        <img src={merchant.image} alt={merchant.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{merchant.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{merchant.rating}</span>
                          <span className="text-[11px] text-slate-400 font-normal">({merchant.reviews} ratings)</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`text-[10px] font-semibold ${merchant.badgeColor}`}>
                      {merchant.badge}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {merchant.tagline}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span className="font-semibold text-slate-800">{merchant.ordersCount}</span>
                  <span className="text-emerald-600 font-semibold">{merchant.deliverySpeed}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 6: CUSTOMER REVIEWS                              */}
        {/* ======================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-extrabold text-[#072654] tracking-tight">
                  Customer Reviews & Trust
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Real feedback from businesses and buyers across India powered by RazorCommerce
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {customerReviews.map((rev) => (
              <div 
                key={rev.id} 
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{rev.date}</span>
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                    "{rev.title}"
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rev.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">{rev.author}</span>
                    <span className="text-[10px] text-slate-400 block">{rev.role}</span>
                  </div>
                  {rev.verified && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* TRUST SIGNALS STRIP                                      */}
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
      {/* SECTION 7: FOOTER                                        */}
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
                <li><Link href="/products" className="hover:text-[#0B72E7]">All Products</Link></li>
                <li><Link href="/products?deals=true" className="hover:text-[#0B72E7]">Trending Deals</Link></li>
                <li><Link href="/assistant" className="hover:text-[#0B72E7]">AI Shopping Assistant</Link></li>
                <li><Link href="/orders" className="hover:text-[#0B72E7]">My Orders & Tracking</Link></li>
              </ul>
            </div>

            {/* Col 3: Categories */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                Categories
              </h5>
              <ul className="space-y-1.5 text-slate-500">
                <li><Link href="/products?category=Electronics" className="hover:text-[#0B72E7]">Electronics</Link></li>
                <li><Link href="/products?category=Fintech%20Hardware" className="hover:text-[#0B72E7]">Fintech Hardware</Link></li>
                <li><Link href="/products?category=Software" className="hover:text-[#0B72E7]">Software</Link></li>
                <li><Link href="/products?category=Business%20Tools" className="hover:text-[#0B72E7]">Business Tools</Link></li>
                <li><Link href="/products?category=Accessories" className="hover:text-[#0B72E7]">Accessories</Link></li>
              </ul>
            </div>

            {/* Col 4: For Merchants */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                For Merchants
              </h5>
              <ul className="space-y-1.5 text-slate-500">
                <li>
                  <a href="http://localhost:3001" className="hover:text-[#0B72E7] font-bold text-[#0B72E7] flex items-center gap-1">
                    <span>Become a Merchant</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </li>
                <li><a href="http://localhost:3001/login" className="hover:text-[#0B72E7]">Merchant Sign In</a></li>
                <li><a href="http://localhost:3002" className="hover:text-[#0B72E7]">Platform Admin</a></li>
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
          if (!isAuthenticated) {
            setIsCartOpen(false);
            router.push('/login?redirect=/checkout');
            return;
          }
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

      {/* Customer Authentication Gating Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectPath="/cart"
        pendingItemName={pendingProduct?.name}
      />
    </div>
  );
}
