'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Truck, 
  Megaphone, 
  TrendingUp, 
  Users, 
  Bot, 
  Settings, 
  ExternalLink,
  Store,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const MERCHANT_NAV = [
  {
    title: 'STORE OPERATIONS',
    items: [
      { href: '/merchant/dashboard', label: 'Merchant Hub', icon: LayoutDashboard, badge: 'Live' },
      { href: '/merchant/catalog', label: 'Catalog & Inventory', icon: Package, badge: '50 SKUs' },
      { href: '/merchant/orders', label: 'Orders & Fulfillment', icon: ShoppingBag, badge: '7-Stage' },
      { href: '/merchant/shipping', label: 'Shipping & Logistics', icon: Truck, badge: '4 Couriers' },
    ],
  },
  {
    title: 'MERCHANT INTELLIGENCE',
    items: [
      { href: '/merchant/demand-intelligence', label: 'Demand Intelligence', icon: TrendingUp, badge: 'AI Engine' },
      { href: '/merchant/revenue', label: 'Revenue Forecasting', icon: TrendingUp, badge: '+28.9%' },
      { href: '/merchant/customers', label: 'Customer Insights', icon: Users, badge: 'Insights' },
    ],
  },
  {
    title: 'GROWTH & MARKETING',
    items: [
      { href: '/merchant/campaigns', label: 'Campaign Recommendations', icon: Megaphone, badge: 'Auto Lift' },
    ],
  },
  {
    title: 'AI TOOLS',
    items: [
      { href: '/merchant/copilot', label: 'Commerce AI Copilot', icon: Bot, badge: 'AI Copilot' },
    ],
  },
];

export function MerchantSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "bg-[#0F172A] text-slate-300 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 shadow-xl transition-all duration-200 select-none",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* 1. Merchant Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0 bg-[#0B1120]">
          <Link href="/merchant/dashboard" className="flex items-center gap-2.5 overflow-hidden group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <Store className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <span className="font-extrabold text-sm tracking-tight text-white block truncate">
                  Razor<span className="text-emerald-400">Merchant</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 block -mt-0.5 uppercase tracking-wider">
                  Seller Portal
                </span>
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono px-1.5 py-0.5">
              SHOPIFY STYLE
            </Badge>
          )}
        </div>

        {/* 2. Store Status Card */}
        {!isCollapsed && (
          <div className="p-3">
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs truncate">
                  {user?.company || 'Acme Direct Corp'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate">
                MID: {user?.merchant_id || 'rzp_live_acme_8842'}
              </div>
            </div>
          </div>
        )}

        {/* 3. Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin">
          {MERCHANT_NAV.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                  {section.title}
                </span>
              )}

              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/merchant/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group',
                      isCollapsed && 'justify-center px-2',
                      isActive
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn(
                        'h-4 w-4 shrink-0 transition-colors', 
                        isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-emerald-400'
                      )} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={cn(
                          'text-[9px] font-mono font-bold px-1.5 py-0.5 rounded',
                          isActive
                            ? 'bg-slate-950/20 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* 4. Footer & Storefront Link */}
      <div className="p-3 border-t border-slate-800 bg-[#0B1120] shrink-0 space-y-2">
        {!isCollapsed && (
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold transition-colors"
          >
            <div className="flex items-center gap-2">
              <Store className="h-3.5 w-3.5 text-emerald-400" />
              <span>View Online Store</span>
            </div>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </Link>
        )}

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
          {!isCollapsed ? (
            <>
              <span className="font-mono text-[10px]">Merchant OS v2.4</span>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-full py-1 text-center text-slate-400 hover:text-white"
              title="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4 mx-auto" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
