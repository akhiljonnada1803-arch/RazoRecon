'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  Store, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Truck, 
  CreditCard, 
  Bot, 
  CheckCircle2, 
  Package, 
  TrendingUp, 
  Layers, 
  Check, 
  Globe, 
  Lock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function MerchantLandingPage() {
  const benefits = [
    {
      icon: Sparkles,
      title: 'AI Discovery & Agent Commerce',
      desc: 'Publish once in structured schema. Autonomous AI shopping agents discover, compare, and recommend your products to millions of enterprise and retail buyers.',
      badge: 'Autonomous Reach'
    },
    {
      icon: CreditCard,
      title: 'Direct Razorpay Payments',
      desc: 'Instant settlement to your Razorpay current account. Full support for UPI, Cards, NetBanking, EMI, and corporate purchase cards with zero reconciliation lag.',
      badge: 'Instant Payouts'
    },
    {
      icon: Truck,
      title: '7-Stage Courier Fulfillment',
      desc: 'Deep integration with Delhivery, Blue Dart, Ekart, and Shiprocket. Automated tracking generation, dispatch webhooks, and real-time SLA monitoring.',
      badge: 'Multi-Courier Logistics'
    },
    {
      icon: BarChart3,
      title: 'AI Inventory & Demand Forecasting',
      desc: 'Predict stock runouts before they happen. Copilot recommends dynamic bundling, promotional pricing, and optimal safety buffers automatically.',
      badge: 'Predictive Analytics'
    }
  ];

  const features = [
    {
      title: 'Agent-Readable Product Catalog',
      desc: 'Transform standard SKUs into rich JSON-LD semantic vectors designed for AI buyer agents and conversational search.',
      stat: '< 50ms',
      statLabel: 'API Response Time'
    },
    {
      title: 'Automated 7-Stage Order Pipeline',
      desc: 'From PAYMENT_RECEIVED to OUT_FOR_DELIVERY. Auto-generate compliant GST tax invoices and shipping labels with 1 click.',
      stat: '99.98%',
      statLabel: 'Pipeline Accuracy'
    },
    {
      title: 'Commerce AI Copilot',
      desc: 'Autonomous copilot tracks conversion funnels, flags abandoned carts, and suggests targeted discount campaigns.',
      stat: '3.4x',
      statLabel: 'Revenue Velocity'
    },
    {
      title: 'Financial Reconciliation Engine',
      desc: 'Automated 2-way and 3-way matching between gateway settlements, bank feeds, and ERP general ledger entries.',
      stat: '0.00%',
      statLabel: 'Mismatch Rate'
    }
  ];

  const metrics = [
    { value: '₹48.2 Cr+', label: 'Monthly GMV Processed', change: '+38% MoM' },
    { value: '1.2M+', label: 'Orders Dispatched', change: '99.6% On-time' },
    { value: '8,500+', label: 'Active Verified Merchants', change: 'Across India' },
    { value: '12 Min', label: 'Average Settlement Time', change: 'T+0 Available' }
  ];

  const pricingTiers = [
    {
      name: 'Starter Merchant',
      price: '₹0',
      period: '/month',
      desc: 'Perfect for emerging merchants getting started with AI marketplace distribution.',
      features: [
        'Up to 50 Product SKUs',
        'AI Buyer Agent Discovery',
        'Standard Razorpay Payment Gateway',
        'Manual Courier Label Generation',
        'Basic Analytics & Order Management'
      ],
      popular: false,
      cta: 'Start Selling Free',
      ctaVariant: 'outline'
    },
    {
      name: 'Growth Seller',
      price: '₹2,499',
      period: '/month',
      desc: 'For high-velocity businesses scaling order volume and multi-courier fulfillment.',
      features: [
        'Unlimited Product SKUs',
        'Priority AI Agent Recommendation',
        'Automated Delhivery & Blue Dart API',
        'Instant T+0 Razorpay Settlement',
        'Commerce AI Copilot & Price Optimization',
        'Automated GST E-Invoicing'
      ],
      popular: true,
      cta: 'Start 14-Day Free Trial',
      ctaVariant: 'primary'
    },
    {
      name: 'Enterprise Scale',
      price: '₹7,999',
      period: '/month',
      desc: 'Custom multi-warehouse infrastructure and dedicated compliance reconciliation.',
      features: [
        'Dedicated Merchant Subdomains',
        'Multi-Warehouse Logistics Routing',
        'ERP Webhooks & Custom Schema APIs',
        'Custom Audit Trail & FinOps Engine',
        '24/7 Dedicated Account Manager',
        '99.99% Enterprise SLA'
      ],
      popular: false,
      cta: 'Contact Enterprise Sales',
      ctaVariant: 'outline'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between antialiased">
      {/* 1. MERCHANT NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xl text-[#072654] tracking-tight block leading-none">
                Cart<span className="text-emerald-600">Mind Business</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                Grow Revenue with AI-Powered Commerce
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#benefits" className="hover:text-emerald-600 transition-colors">Benefits</a>
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#metrics" className="hover:text-emerald-600 transition-colors">Metrics</a>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing</a>
            <a href="https://razorpay.com/docs" target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
              <span>Docs</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl">
                Sign In
              </Button>
            </Link>

            <Link href="/register">
              <Button size="sm" className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs">
                Register Store
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="space-y-20 pb-20">
        
        {/* SECTION 1: HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC] pt-12 pb-16 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CARTMIND BUSINESS COMMERCE PLATFORM</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#072654] tracking-tight leading-[1.12]">
                  CartMind Business<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600">
                    Grow Revenue with AI-Powered Commerce.
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                  Manage products, track orders, monitor revenue, launch campaigns, and scale your business with intelligent commerce automation.
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <Link href="/register">
                    <Button className="h-12 px-7 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 gap-2">
                      <span>Create Merchant Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Link href="/login">
                    <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-300 hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-bold">
                      <span>Sign In to CartMind Business</span>
                    </Button>
                  </Link>

                  <a 
                    href="http://localhost:3000" 
                    className="text-xs font-semibold text-slate-500 hover:text-emerald-700 underline underline-offset-4 flex items-center gap-1 ml-2"
                  >
                    <span>View Customer Storefront</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Trust Points */}
                <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200 text-xs">
                  <div>
                    <span className="font-extrabold text-[#072654] block text-sm">Instant</span>
                    <span className="text-slate-500 text-[11px]">Merchant Onboarding</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-[#072654] block text-sm">0% Free Tier</span>
                    <span className="text-slate-500 text-[11px]">No Setup Fee</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-[#072654] block text-sm">PCI-DSS L1</span>
                    <span className="text-slate-500 text-[11px]">Razorpay Security</span>
                  </div>
                </div>
              </div>

              {/* Right Hero Image / Dashboard Preview */}
              <div className="lg:col-span-5">
                <div className="bg-gradient-to-tr from-[#072654] to-slate-900 rounded-3xl p-6 shadow-2xl text-white border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      LIVE SELLER PIPELINE
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Today's Revenue</span>
                        <span className="text-lg font-black text-white font-mono">₹1,84,200.00</span>
                      </div>
                      <span className="text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2 py-1 rounded-lg">
                        +24.8% vs yesterday
                      </span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-300">Live Stage Dispatch Pipeline</span>
                      {[
                        { stage: 'PAYMENT_RECEIVED', count: 18, color: 'bg-blue-500' },
                        { stage: 'ORDER_PACKED', count: 12, color: 'bg-purple-500' },
                        { stage: 'IN_TRANSIT (Delhivery)', count: 42, color: 'bg-emerald-500' },
                      ].map((st, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/5 text-[11px]">
                          <span className="text-slate-300 font-mono">{st.stage}</span>
                          <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded font-mono">{st.count} orders</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-800/60 text-emerald-200 text-[11px] flex items-center gap-2">
                      <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Copilot: 8 orders auto-bundled with 4G Soundbox.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: BENEFITS */}
        <section id="benefits" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
              WHY SELL ON RAZORCOMMERCE
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-[#072654]">
              Everything You Need to Scale Your Commercial Store
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Built specifically for modern merchants who want zero reconciliation headaches and autonomous sales channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, idx) => (
              <div 
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-lg hover:border-emerald-300 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <b.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 bg-emerald-50/50">
                    {b.badge}
                  </Badge>
                  <h3 className="font-extrabold text-base text-[#072654]">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: MERCHANT FEATURES */}
        <section id="features" className="bg-white py-16 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-xs font-bold">
                  OPERATING SUITE
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-black text-[#072654]">
                  Powerful Tools for Catalog, Orders & Logistics
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Manage inventory, coordinate dispatch with couriers, and automate customer communications from one unified dashboard.
                </p>
              </div>

              <Link href="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-10 px-5">
                  Explore Seller Dashboard
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feat, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-50/80 p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-start justify-between gap-4 hover:bg-white hover:shadow-md transition-all"
                >
                  <div className="space-y-2 flex-1">
                    <h3 className="font-bold text-base text-slate-900">{feat.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                  </div>
                  <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 shrink-0">
                    <span className="font-black text-2xl text-emerald-600 font-mono block">{feat.stat}</span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">{feat.statLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: MERCHANT SUCCESS METRICS */}
        <section id="metrics" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-bold">
              PROVEN PERFORMANCE
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-[#072654]">
              Trusted by Over 8,500+ High-Growth Merchants
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {metrics.map((m, idx) => (
              <div 
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs text-center space-y-2"
              >
                <span className="font-black text-3xl sm:text-4xl text-[#072654] font-mono block">
                  {m.value}
                </span>
                <span className="font-bold text-xs text-slate-700 block">
                  {m.label}
                </span>
                <span className="inline-block text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {m.change}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: PRICING */}
        <section id="pricing" className="bg-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <Badge className="bg-white/10 text-emerald-400 border-white/20 text-xs font-bold">
                SIMPLE, TRANSPARENT PRICING
              </Badge>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                Choose the Plan That Fits Your Scale
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Start free and upgrade as your order velocity and fulfillment requirements grow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingTiers.map((tier, idx) => (
                <div 
                  key={idx}
                  className={`rounded-3xl p-8 flex flex-col justify-between space-y-6 ${
                    tier.popular
                      ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-emerald-500 shadow-2xl relative'
                      : 'bg-slate-800/60 border border-slate-700'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                      Most Popular For Sellers
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-lg text-white">{tier.name}</h3>
                      <p className="text-xs text-slate-400">{tier.desc}</p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="font-black text-4xl text-white font-mono">{tier.price}</span>
                      <span className="text-xs text-slate-400">{tier.period}</span>
                    </div>

                    <ul className="space-y-2.5 pt-4 border-t border-slate-700 text-xs text-slate-300">
                      {tier.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href="/register" className="block w-full">
                    <Button 
                      className={`w-full h-11 text-xs font-bold rounded-xl ${
                        tier.popular
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6: BECOME A MERCHANT CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-[#072654] rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-3 relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Ready to Become an AI-Native Merchant?
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                Join thousands of merchants already publishing agent-readable catalogs and generating autonomous sales today.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Link href="/register">
                  <Button className="h-12 px-8 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-extrabold shadow-lg">
                    Create Merchant Account
                  </Button>
                </Link>

                <Link href="/login">
                  <Button variant="outline" className="h-12 px-6 rounded-xl border-white/30 text-white hover:bg-white/10 text-xs sm:text-sm font-bold">
                    Sign In to Existing Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Store className="w-4 h-4 text-emerald-600" />
            <span>CartMind Business</span>
          </div>
          <div>
            Powered by CartMind AI Commerce Platform
          </div>
        </div>
      </footer>
    </div>
  );
}
