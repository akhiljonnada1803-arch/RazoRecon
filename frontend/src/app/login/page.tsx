'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Building2, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Store,
  Package,
  Truck,
  Bot,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface DemoUserAccount {
  role: string;
  title: string;
  name: string;
  email: string;
  badge: string;
  badgeColor: string;
  icon: string;
  description: string;
}

const DEMO_ACCOUNTS: DemoUserAccount[] = [
  {
    role: 'Merchant Owner',
    title: 'Merchant Owner',
    name: 'Rajesh Sharma',
    email: 'owner@acme.com',
    badge: 'Catalog, Orders & Revenue Growth',
    badgeColor: 'bg-blue-50 text-[#0B72E7] border-blue-200',
    icon: '🏬',
    description: 'Publish AI-readable products, manage inventory & accept orders.',
  },
  {
    role: 'Customer',
    title: 'AI Shopper / Customer',
    name: 'Ananya Roy',
    email: 'customer@acme.com',
    badge: 'AI Shopping Assistant & Track Orders',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: '🛍️',
    description: 'Conversational buying, AI product comparisons & live tracking.',
  },
  {
    role: 'Operations Manager',
    title: 'Operations Manager',
    name: 'Pooja Verma',
    email: 'ops@acme.com',
    badge: 'Fulfillment & Courier Logistics',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: '📦',
    description: 'Pack orders, assign couriers (Delhivery/Blue Dart) & update shipments.',
  },
  {
    role: 'Platform Admin',
    title: 'Platform Admin',
    name: 'Platform Administrator',
    email: 'admin@razorcommerce.ai',
    badge: 'Platform Config & Delivery Partners',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: '👑',
    description: 'Manage merchants, delivery fleets, platform settings & Agent APIs.',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('owner@acme.com');
  const [password, setPassword] = useState('demo123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isDemoOpen, setIsDemoOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectDemoUser = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('demo123');
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const success = await login(email, password);
    if (!success) {
      setErrorMsg('Invalid email or password. Please select a demo account or use demo123.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
      {/* 1. LEFT SIDE: Value Proposition & Razorpay Track 01 */}
      <div className="lg:w-[46%] bg-gradient-to-br from-[#072654] via-[#0B254E] to-[#041530] text-white p-8 sm:p-14 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-[#0B72E7] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/30">
              R
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tight">
                RazorCommerce <span className="text-[#38BDF8]">AI</span>
              </span>
              <span className="text-[10px] font-mono text-blue-200/70 block tracking-widest uppercase font-semibold">
                AI-Native Commerce Operating System
              </span>
            </div>
          </div>
        </div>

        {/* Main Hero Typography */}
        <div className="relative z-10 my-auto py-8 space-y-6">
          <div className="space-y-3">
            <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 text-[11px] font-mono px-3 py-1">
              RAZORPAY TRACK 01 • AGENTIC COMMERCE
            </Badge>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-[1.15]">
              Publish Products.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-200">
                AI Buyers Discover & Buy.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-blue-100/80 max-w-md leading-relaxed">
              Enabling merchants to become AI-buyable while customers discover, buy, and track orders end-to-end through autonomous shopping agents.
            </p>
          </div>

          {/* 4 Feature Value Checks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 max-w-lg">
            {[
              { title: 'Agent-Readable Catalog', desc: 'Structured JSON APIs for AI discovery' },
              { title: 'Customer AI Assistant', desc: 'Conversational buying & comparison' },
              { title: '7-Stage Order Workflow', desc: 'Accept, Pack, Ship & Deliver' },
              { title: 'Courier Integrations', desc: 'Delhivery, Blue Dart, Shiprocket, Ekart' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5 backdrop-blur-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">{item.title}</span>
                  <span className="text-[11px] text-blue-200/70 block">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Trust Guarantee */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-blue-200/70">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Merchant & Customer Roles Segregated
          </span>
          <span className="font-mono text-[11px]">Razorpay Track 01</span>
        </div>
      </div>

      {/* 2. RIGHT SIDE: Clean Login Card & 4 Core Personas */}
      <div className="lg:w-[54%] flex flex-col justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-xl w-full mx-auto space-y-6">
          
          {/* Headline */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#072654] tracking-tight">
              Sign in to RazorCommerce AI
            </h2>
            <p className="text-xs text-slate-500">
              Select a persona below to explore the Merchant Hub or Customer Experience.
            </p>
          </div>

          {/* Quick Demo Accounts (4 Roles) */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setIsDemoOpen(!isDemoOpen)}
              className="w-full p-3.5 bg-slate-50/80 hover:bg-slate-100/70 transition-colors flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#0B72E7]" />
                <span className="text-xs font-bold text-[#072654]">
                  Track 01 Demo Personas (Password: <code className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">demo123</code>)
                </span>
              </div>
              {isDemoOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            {isDemoOpen && (
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectDemoUser(acc.email)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      email === acc.email
                        ? 'border-[#0B72E7] bg-blue-50/60 shadow-xs ring-1 ring-[#0B72E7]'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-base">{acc.icon}</span>
                          <span className="text-xs font-bold text-slate-900 truncate">{acc.title}</span>
                        </div>
                        <Badge className={`text-[9px] font-mono px-1.5 py-0 ${acc.badgeColor}`}>
                          {acc.role.split(' ')[0]}
                        </Badge>
                      </div>

                      <span className="text-[11px] text-slate-800 font-semibold block mt-1">{acc.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{acc.email}</span>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{acc.description}</p>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono font-semibold text-[#0B72E7]">
                      <span>1-Click Load</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium animate-in fade-in duration-150">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Work / Customer Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@acme.com or customer@acme.com"
                  className="h-10 pl-9 text-xs border-slate-200 rounded-xl bg-white focus:border-[#0B72E7]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-[#0B72E7] font-mono">
                  Default: demo123
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 pl-9 text-xs border-slate-200 rounded-xl bg-white focus:border-[#0B72E7]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#0B72E7] focus:ring-[#0B72E7] h-4 w-4"
                />
                <span>Remember session for 30 days</span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 text-xs font-bold bg-[#0B72E7] hover:bg-blue-600 text-white rounded-xl shadow-xs gap-2 mt-2 active:scale-98 transition-all"
            >
              <span>{isSubmitting ? 'Authenticating Role...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Footer Metadata */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Enterprise 256-Bit SSL • SOC2 Type II</span>
            <span>RazorCommerce AI v3.0 (Track 01)</span>
          </div>

        </div>
      </div>
    </div>
  );
}
