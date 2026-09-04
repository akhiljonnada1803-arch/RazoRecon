'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Server, 
  Activity, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  Building2, 
  CreditCard, 
  Sparkles, 
  Terminal, 
  AlertTriangle, 
  Cpu, 
  CheckCircle2, 
  Globe, 
  BarChart3,
  KeyRound,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AdminLandingPage() {
  const platformMetrics = [
    { label: 'Total Platform GMV', value: '₹342.8 Cr', change: '+42.5% YoY', icon: TrendingUp },
    { label: 'Active Merchant Tenants', value: '8,520', change: '+18.2% MoM', icon: Building2 },
    { label: 'Transactions Processed', value: '14.8M', change: '99.98% Success Rate', icon: CreditCard },
    { label: 'Reconciliation Precision', value: '100.00%', change: 'Zero Discrepancy', icon: ShieldCheck }
  ];

  const merchantGrowth = [
    { tier: 'Enterprise Tier', count: '480 Tenants', gmv: '₹185 Cr GMV', growth: '+34%' },
    { tier: 'Growth Merchants', count: '2,840 Tenants', gmv: '₹118 Cr GMV', growth: '+49%' },
    { tier: 'Starter Merchants', count: '5,200 Tenants', gmv: '₹39.8 Cr GMV', growth: '+22%' }
  ];

  const systemHealth = [
    { service: 'FastAPI Backend Core Engine', status: 'HEALTHY', latency: '24ms', uptime: '99.99%' },
    { service: 'Razorpay Multi-Rail Gateway', status: 'OPERATIONAL', latency: '68ms', uptime: '99.98%' },
    { service: 'Agentic AI Reconciliation Worker', status: 'ACTIVE', latency: '42ms', uptime: '100.00%' },
    { service: 'Multi-Courier Webhook Dispatcher', status: 'HEALTHY', latency: '35ms', uptime: '99.95%' }
  ];

  const securityOverview = [
    {
      title: 'PCI-DSS Level 1 Certified',
      desc: 'All payment sessions, card data, and merchant credentials operate within certified encrypted hardware vaults.'
    },
    {
      title: 'Granular Role-Based Access Control (RBAC)',
      desc: 'Strict role hierarchy (Admin, Merchant Owner, Operations, Revenue, Auditor) with tamper-proof audit trails.'
    },
    {
      title: 'Real-time AI Fraud Monitoring',
      desc: 'Autonomous anomaly detection algorithms analyzing transaction frequency, geolocation, and velocity.'
    },
    {
      title: 'Automated 3-Way Reconciliation',
      desc: 'Continuous real-time verification matching gateway logs, bank settlement feeds, and ERP books.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#071328] text-slate-100 flex flex-col justify-between antialiased">
      {/* 1. ADMIN NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#071328]/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xl text-white tracking-tight block leading-none">
                RazorCommerce <span className="text-[#38BDF8]">Admin</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase block mt-0.5">
                Platform Operations Console • Port 3002
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-slate-400">
            <a href="#metrics" className="hover:text-white transition-colors">Metrics</a>
            <a href="#growth" className="hover:text-white transition-colors">Merchant Growth</a>
            <a href="#health" className="hover:text-white transition-colors">System Health</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button className="h-9 px-4 text-xs font-mono font-bold bg-[#0B72E7] hover:bg-blue-600 text-white rounded-xl shadow-md gap-2">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="space-y-16 pb-20">
        
        {/* SECTION 1: HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-800/80">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-xs font-mono text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>ENTERPRISE GOVERNANCE & PLATFORM OPERATIONS</span>
            </div>

            <div className="max-w-3xl space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
                RazorCommerce <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                  Platform Operations Console.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
                Unified administration for merchant approvals, multi-rail settlement reconciliation, AI agentic protocol telemetry, and enterprise risk controls.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link href="/login">
                  <Button className="h-11 px-6 rounded-xl bg-[#0B72E7] hover:bg-blue-600 text-white text-xs font-mono font-bold shadow-lg shadow-blue-500/20 gap-2">
                    <span>Access Operations Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <a 
                  href="http://localhost:3000" 
                  className="text-xs font-mono text-slate-400 hover:text-white underline underline-offset-4 flex items-center gap-1 ml-3"
                >
                  <span>Customer Storefront</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>

                <a 
                  href="http://localhost:3001" 
                  className="text-xs font-mono text-slate-400 hover:text-white underline underline-offset-4 flex items-center gap-1 ml-3"
                >
                  <span>Merchant Portal</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: PLATFORM METRICS */}
        <section id="metrics" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#38BDF8]" />
              <span>Platform Volume & Telemetry</span>
            </h2>
            <Badge className="bg-slate-800 text-slate-300 font-mono text-[10px]">
              REAL-TIME AGGREGATE
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {platformMetrics.map((m, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-lg space-y-2"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-mono">{m.label}</span>
                  <m.icon className="w-4 h-4 text-[#38BDF8]" />
                </div>
                <span className="text-2xl sm:text-3xl font-black text-white font-mono block">
                  {m.value}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold block">
                  {m.change}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: MERCHANT GROWTH */}
        <section id="growth" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#38BDF8]" />
              <span>Merchant Growth by Tier</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {merchantGrowth.map((g, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{g.tier}</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                    {g.growth}
                  </span>
                </div>
                <div className="space-y-1 font-mono text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tenants:</span>
                    <span className="font-bold text-white">{g.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Volume:</span>
                    <span className="font-bold text-[#38BDF8]">{g.gmv}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: SYSTEM HEALTH */}
        <section id="health" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Microservice Cluster Health</span>
            </h2>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>

          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden">
            <div className="divide-y divide-slate-800 font-mono text-xs">
              {systemHealth.map((sh, idx) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-white font-medium">{sh.service}</span>
                  </div>
                  <div className="flex items-center gap-6 text-slate-400 text-[11px]">
                    <span>Latency: <span className="text-slate-200">{sh.latency}</span></span>
                    <span>Uptime: <span className="text-emerald-400 font-bold">{sh.uptime}</span></span>
                    <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 text-[10px] font-bold">
                      {sh.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: SECURITY OVERVIEW */}
        <section id="security" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              <span>Platform Security & Compliance Overview</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {securityOverview.map((sec, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-2"
              >
                <h4 className="font-bold text-sm text-white font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{sec.title}</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {sec.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-[#050e1d] py-8 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Terminal className="w-4 h-4 text-[#38BDF8]" />
            <span>RazorCommerce Platform Admin Console • Port 3002</span>
          </div>
          <div>
            Restricted Access • Internal Operations Only
          </div>
        </div>
      </footer>
    </div>
  );
}
