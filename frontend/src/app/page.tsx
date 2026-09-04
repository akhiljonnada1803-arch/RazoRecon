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
  Store, 
  Zap, 
  Clock,
  CheckCircle2,
  ChevronRight,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoaders';

export default function PublicHomePage() {
  const router = useRouter();
  const [searchPrompt, setSearchPrompt] = useState('');
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

  // Fetch featured catalog products
  const { data: catalogData, isLoading } = useQuery({
    queryKey: ['public-home-products'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/catalog/products?limit=8');
      return res?.products || res?.items || [];
    },
  });

  const products: Product[] = Array.isArray(catalogData) ? catalogData : [];

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

  const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPrompt.trim()) {
      router.push('/customer/products');
      return;
    }
    router.push(`/customer/products?search=${encodeURIComponent(searchPrompt.trim())}`);
  };

  const categories = [
    { name: 'Electronics', icon: Cpu, desc: 'Smart POS, Soundboxes & Workstations', query: 'Fintech Hardware', count: '24+ Items', bg: 'from-blue-500 to-indigo-600' },
    { name: 'Fashion & Workwear', icon: Shirt, desc: 'Executive apparel & business attire', query: 'Workstation Accessories', count: '18+ Items', bg: 'from-purple-500 to-pink-600' },
    { name: 'Home & Office Living', icon: HomeIcon, desc: 'Smart workspace ergonomic desks', query: 'Developer Hardware', count: '12+ Items', bg: 'from-amber-500 to-orange-600' },
    { name: 'Books & Accounting', icon: BookOpen, desc: 'GST statutory & FinOps guides', query: 'Enterprise Software', count: '15+ Items', bg: 'from-emerald-500 to-teal-600' },
    { name: 'Beauty & Grooming', icon: Smile, desc: 'Executive wellness & personal care', query: 'Accessories', count: '9+ Items', bg: 'from-rose-500 to-pink-500' },
    { name: 'Daily Groceries & Pantry', icon: Apple, desc: 'Pantry snacks & enterprise coffee', query: 'Pantry', count: '30+ Items', bg: 'from-lime-600 to-emerald-600' }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#072654] via-[#09356d] to-[#0B72E7] text-white p-8 md:p-14 shadow-xl border border-blue-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Next-Generation AI Commerce & Razorpay Checkout</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Shop Smarter with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-blue-200 to-white">AI Commerce</span>
          </h1>

          <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed max-w-2xl">
            Autonomous discovery, real-time specification comparison, and 1-click Razorpay test checkouts across verified enterprise fintech hardware, software, and developer peripherals.
          </p>

          {/* Prompt Search Input */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-xl">
            <div className="flex items-center rounded-2xl bg-white p-1.5 shadow-2xl border border-white/40">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
                placeholder="Ask AI: 'Find smart POS terminal under ₹15,000 with 4G SIM'..."
                className="w-full px-3 py-2 text-xs sm:text-sm text-slate-800 bg-transparent focus:outline-hidden placeholder:text-slate-400"
              />
              <Button type="submit" className="bg-[#0B72E7] hover:bg-[#095ec2] text-white rounded-xl text-xs sm:text-sm font-bold px-5 h-10 shrink-0">
                Search
              </Button>
            </div>
          </form>

          {/* Dual Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/customer/products">
              <Button size="lg" className="h-12 px-6 rounded-2xl bg-white text-[#072654] hover:bg-slate-100 font-bold text-sm shadow-md gap-2">
                <ShoppingBag className="w-4 h-4 text-[#0B72E7]" />
                <span>Start Shopping</span>
              </Button>
            </Link>

            <Link href="/merchant/dashboard">
              <Button size="lg" variant="outline" className="h-12 px-6 rounded-2xl border-white/30 text-white hover:bg-white/10 font-bold text-sm backdrop-blur-xs gap-2">
                <Store className="w-4 h-4 text-amber-300" />
                <span>Become a Merchant</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. TRUST VALUE PROPOSITIONS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: ShieldCheck, title: 'GST-Inclusive Pricing', desc: 'Transparent prices with zero surprise checkout fees' },
          { icon: Truck, title: 'Express Dispatch', desc: 'Real-time AWB & 11-stage shipment tracking' },
          { icon: Bot, title: 'AI Copilot Shopping', desc: 'Autonomous product discovery & price analysis' },
          { icon: RotateCcw, title: 'Instant Reconciliation', desc: '100% Razorpay payment signature verification' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-blue-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
              <item.icon className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{item.title}</h4>
            <p className="text-[11px] text-slate-500 leading-normal">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* 3. POPULAR CATEGORIES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#072654] tracking-tight">
              Explore by Category
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse top-tier hardware, software licenses, and productivity peripherals
            </p>
          </div>
          <Link href="/customer/products" className="text-xs font-bold text-[#0B72E7] hover:underline flex items-center gap-1">
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
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
                <span className="font-bold text-xs text-slate-800 block group-hover:text-[#0B72E7] transition-colors">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                  {cat.count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. TRENDING DEALS (FLASH SALE BANNER) */}
      <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white">
            <Flame className="w-3.5 h-3.5 fill-white" />
            <span>Limited Time Flash Sale</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Up to 20% Instant Discount with Coupon <span className="underline decoration-white/60">RAZOR2026</span>
          </h3>
          <p className="text-xs sm:text-sm text-white/90">
            Exclusive enterprise offers on Android Smart Terminals, 4G Soundboxes, and FinOps Multi-Tenant software.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <div className="text-center px-2">
            <span className="text-2xl font-extrabold font-mono block">04</span>
            <span className="text-[9px] uppercase tracking-wider text-white/80">Hours</span>
          </div>
          <span className="text-xl font-bold">:</span>
          <div className="text-center px-2">
            <span className="text-2xl font-extrabold font-mono block">28</span>
            <span className="text-[9px] uppercase tracking-wider text-white/80">Mins</span>
          </div>
          <span className="text-xl font-bold">:</span>
          <div className="text-center px-2">
            <span className="text-2xl font-extrabold font-mono block">45</span>
            <span className="text-[9px] uppercase tracking-wider text-white/80">Secs</span>
          </div>
        </div>
      </section>

      {/* 5. FEATURED PRODUCTS GRID */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#072654] tracking-tight">
              Featured Products
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Handpicked bestseller POS terminals, enterprise accessories & peripherals
            </p>
          </div>
          <Link href="/customer/products" className="text-xs font-bold text-[#0B72E7] hover:underline flex items-center gap-1">
            <span>Explore All 50 SKUs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const stockQty = product.stock_quantity ?? product.stock ?? 50;
              const isLowStock = stockQty > 0 && stockQty <= 15;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Image Container */}
                  <div className="h-52 bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=500'}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-[#072654] text-white text-[10px] font-semibold border-0">
                        {product.category}
                      </Badge>
                    </div>
                    {isLowStock && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-amber-500 text-white text-[9px] font-bold border-0">
                          Only {stockQty} Left
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{product.rating || 4.9}</span>
                        <span className="text-slate-400 font-normal">({product.reviews_count || 128})</span>
                      </div>

                      <Link href={`/customer/products/${product.id}`} className="block">
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#0B72E7] transition-colors line-clamp-1" title={product.name}>
                          {product.name}
                        </h3>
                      </Link>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {product.tagline || product.description}
                      </p>
                    </div>

                    {/* Price & Action Row */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-lg font-extrabold text-[#072654] font-mono leading-none">
                          ₹{product.price.toLocaleString('en-IN')}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Inclusive of GST</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        className="h-9 px-3.5 bg-[#0B72E7] hover:bg-[#095ec2] text-white rounded-xl text-xs font-bold gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. INTERACTIVE AI SHOPPING ASSISTANT BANNER */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#0B72E7] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Copilot Discovery</span>
          </div>
          <h3 className="text-2xl font-bold text-[#072654]">
            Can't decide which hardware fits your business?
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Chat with our Commerce AI Assistant to compare battery life, scan speeds, MDR rates, and receive instant Razorpay payment links tailored to your retail throughput.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              'Compare POS Terminal V3 vs Soundbox 4G',
              'Best gaming workstation peripherals',
              'Recommend devices with 4G Dual SIM'
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => router.push(`/customer/assistant?prompt=${encodeURIComponent(prompt)}`)}
                className="text-[11px] bg-white hover:bg-blue-100 text-slate-700 px-3 py-1 rounded-xl border border-slate-200 transition-colors"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        <Link href="/customer/assistant">
          <Button size="lg" className="h-12 px-6 rounded-2xl bg-[#0B72E7] hover:bg-[#095ec2] text-white font-bold text-sm shadow-md gap-2">
            <Bot className="w-5 h-5" />
            <span>Open AI Assistant</span>
          </Button>
        </Link>
      </section>

      {/* 7. FOOTER */}
      <footer className="pt-12 border-t border-slate-200 space-y-8 text-xs text-slate-500">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-[#0B72E7] text-white flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-[#072654]">RazorCommerce AI</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              India's premier AI-powered commerce operating system with built-in deterministic reconciliation and Razorpay payment gateway integration.
            </p>
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>100% RBI & GST Compliant Test Mode Sandbox</span>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 uppercase text-[11px]">Customer Care</h5>
            <ul className="space-y-1.5 text-slate-600">
              <li><Link href="/customer/orders" className="hover:text-[#0B72E7]">My Orders</Link></li>
              <li><Link href="/customer/track" className="hover:text-[#0B72E7]">Track Shipment</Link></li>
              <li><Link href="/customer/wishlist" className="hover:text-[#0B72E7]">Saved Wishlist</Link></li>
              <li><Link href="/customer/assistant" className="hover:text-[#0B72E7]">AI Shopping Help</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 uppercase text-[11px]">Merchant Hub</h5>
            <ul className="space-y-1.5 text-slate-600">
              <li><Link href="/merchant/dashboard" className="hover:text-[#0B72E7]">Seller Dashboard</Link></li>
              <li><Link href="/merchant/catalog" className="hover:text-[#0B72E7]">Catalog Management</Link></li>
              <li><Link href="/merchant/orders" className="hover:text-[#0B72E7]">Fulfillment Queue</Link></li>
              <li><Link href="/merchant/shipping" className="hover:text-[#0B72E7]">Shipping Logistics</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 uppercase text-[11px]">Platform</h5>
            <ul className="space-y-1.5 text-slate-600">
              <li><Link href="/admin/dashboard" className="hover:text-[#0B72E7]">Admin Console</Link></li>
              <li><Link href="/hero-demo" className="hover:text-[#0B72E7]">Live Track 01 Demo</Link></li>
              <li><a href="#" className="hover:text-[#0B72E7]">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#0B72E7]">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <span>© 2026 RazorCommerce AI • Secured with Razorpay Test Mode Payments</span>
          <div className="flex items-center gap-3">
            <span>UPI</span>
            <span>•</span>
            <span>BharatQR</span>
            <span>•</span>
            <span>Cards</span>
            <span>•</span>
            <span>NetBanking</span>
            <span>•</span>
            <span>Instant Recon</span>
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
