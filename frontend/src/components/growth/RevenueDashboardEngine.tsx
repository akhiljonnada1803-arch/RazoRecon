'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Zap, 
  CreditCard, 
  ArrowUpRight, 
  Bot, 
  Calendar, 
  Sparkles,
  BarChart3,
  Wallet
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function RevenueDashboardEngine() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/merchant/growth/revenue-dashboard')
      .then(res => res.json())
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load revenue dashboard', err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Loading AI Revenue Growth Dashboard...</span>
        </div>
      </div>
    );
  }

  const kpis = data.kpis || {};
  const hourly = data.hourly_velocity_today || [];
  const monthly = data.monthly_trend || [];
  const channels = data.payment_channel_breakdown || [];

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0C3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-blue-400/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                Live Revenue Operations
              </Badge>
              <Badge className="bg-white/10 text-blue-200 border-white/20 text-xs font-mono">
                AutoPay Sync Live
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Merchant Revenue & Growth Dashboard
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-2xl">
              Comprehensive telemetry tracking daily GMV velocity, monthly target achievement, Average Order Value expansion, and AI-driven autonomous commerce revenue.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right min-w-[240px]">
            <span className="text-[11px] font-semibold text-blue-200 block uppercase tracking-wider">
              AI Commerce Revenue Share
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-300">
              {kpis.ai_commerce_revenue_pct}%
            </div>
            <span className="text-[10px] text-blue-200 font-mono">
              ₹{kpis.ai_commerce_gmv_mtd_inr?.toLocaleString('en-IN')} MTD via AI Agents
            </span>
          </div>
        </div>
      </div>

      {/* 2. 6 REQUIRED REVENUE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Revenue Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Revenue Today</span>
          <div className="text-xl font-black text-slate-900 font-mono">
            ₹{kpis.revenue_today_inr?.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> +{kpis.revenue_today_growth_pct}% vs yest.
          </span>
        </div>

        {/* Metric 2: Revenue This Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Revenue This Month</span>
          <div className="text-xl font-black text-[#0B72E7] font-mono">
            ₹{(kpis.revenue_mtd_inr / 100000).toFixed(2)} L
          </div>
          <span className="text-[11px] text-slate-500 font-semibold block">
            {kpis.target_achievement_pct}% of monthly goal
          </span>
        </div>

        {/* Metric 3: Orders Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Orders Today</span>
          <div className="text-xl font-black text-slate-900 font-mono">
            {kpis.orders_today} Orders
          </div>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> +{kpis.orders_today_growth_pct}% velocity
          </span>
        </div>

        {/* Metric 4: Average Order Value (AOV) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Order Value</span>
          <div className="text-xl font-black text-purple-600 font-mono">
            ₹{kpis.average_order_value_aov_inr?.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-bold text-purple-600 flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" /> +{kpis.aov_growth_pct}% AOV Lift
          </span>
        </div>

        {/* Metric 5: Growth % */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">YoY Growth %</span>
          <div className="text-xl font-black text-emerald-600 font-mono">
            +{kpis.yoy_annual_growth_pct}%
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            Annualized trajectory
          </span>
        </div>

        {/* Metric 6: AI Commerce Revenue % */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">AI Commerce %</span>
          <div className="text-xl font-black text-emerald-700 font-mono flex items-center gap-1">
            <Bot className="w-4 h-4 text-emerald-600" />
            {kpis.ai_commerce_revenue_pct}%
          </div>
          <span className="text-[11px] text-emerald-700 font-bold block">
            Track 01 Core Milestone
          </span>
        </div>
      </div>

      {/* 3. HOURLY VELOCITY TODAY & MULTI-MONTH RUNRATE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Hourly Velocity Today */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Today&apos;s Hourly Velocity & AI Order Trigger</h3>
              <p className="text-xs text-slate-500">Order count and gross revenue distribution throughout the day.</p>
            </div>
            <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-xs font-mono">
              Live Intraday
            </Badge>
          </div>

          <div className="space-y-3">
            {hourly.map((h: any, i: number) => {
              const maxRev = 75000.0;
              const w = Math.min(100, (h.revenue_inr / maxRev) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="font-bold text-slate-700">{h.hour}</span>
                    <span className="text-slate-900 font-bold">
                      ₹{h.revenue_inr.toLocaleString('en-IN')} ({h.orders} orders • <span className="text-emerald-600">{h.ai_orders} AI</span>)
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${w}%` }} 
                      className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all" 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Payment Channels & AutoPay Share */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Payment Channels Breakdown</h3>
            <p className="text-xs text-slate-500">Razorpay AutoPay vs alternative checkout routes.</p>
          </div>

          <div className="space-y-3">
            {channels.map((ch: any, i: number) => (
              <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800">{ch.channel}</span>
                  <span className="font-mono text-emerald-600 font-bold">{ch.growth}</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>₹{(ch.amount_inr / 100000).toFixed(2)} Lakhs</span>
                  <span className="font-bold text-slate-900">{ch.share_pct}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 font-medium">
            💡 <strong>UPI AutoPay Mandates</strong> deliver 43.2% of total store revenue with near-instant sub-second settlement.
          </div>
        </div>
      </div>
    </div>
  );
}
