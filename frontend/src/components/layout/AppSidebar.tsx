'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  GitCompare, 
  Layers, 
  BarChart3, 
  TrendingUp, 
  Radio, 
  ShieldAlert, 
  Sparkles, 
  Lock, 
  CreditCard,
  Zap,
  ChevronRight,
  Calendar,
  ShieldCheck,
  BrainCircuit,
  ShoppingBag,
  Package,
  Megaphone,
  Bot
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavSection {
  title: string;
  items: Array<{
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
    badgeVariant?: 'default' | 'outline' | 'secondary' | 'destructive';
  }>;
}

const NAVIGATION_SECTIONS: NavSection[] = [
  {
    title: 'CORE OPERATIONS',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/catalog', label: 'Product Catalog', icon: Package, badge: '50 SKUs' },
      { href: '/commerce-agent', label: 'Commerce Agent', icon: ShoppingBag, badge: 'Commerce' },
      { href: '/checkout', label: 'AI Checkout Engine', icon: CreditCard, badge: 'Cart & Pay' },
      { href: '/growth-agent', label: 'Revenue Growth Agent', icon: TrendingUp, badge: 'Growth AI' },

      { href: '/campaigns', label: 'Campaigns', icon: Megaphone, badge: 'Campaigns' },
      { href: '/agent-commerce', label: 'A2A Commerce Simulator', icon: Bot, badge: 'A2A Sim' },
      { href: '/review', label: 'Exception Queue', icon: CheckSquare },
      { href: '/month-close', label: 'Month-End Close', icon: Lock },
      { href: '/demo', label: 'Demo Data Suite', icon: Zap },
    ],
  },
  {
    title: 'RECONCILIATION & LEDGER',
    items: [
      { href: '/reconciliation', label: 'Reconciliation Engine', icon: GitCompare },
      { href: '/categorization', label: 'Categorization Ledger', icon: Layers },
      { href: '/income-statement', label: 'P&L Statement', icon: BarChart3 },
    ],
  },
  {
    title: 'RISK & TREASURY',
    items: [
      { href: '/vendor-intelligence', label: 'Vendor Intelligence', icon: ShieldAlert, badge: 'Live Intel' },
      { href: '/forecast', label: 'Cash Forecasting', icon: TrendingUp },
      { href: '/fraud', label: 'Fraud Detection', icon: Radio },
      { href: '/exceptions', label: 'Exception Intelligence', icon: ShieldAlert },
      { href: '/copilot', label: 'CFO AI Copilot', icon: Sparkles },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, canAccessRoute } = useAuth();

  const { data: dashData } = useQuery<{ has_data?: boolean; kpis?: { open_exceptions: number }; cash_trend?: any[] }>({
    queryKey: ['dashboard', 'executive'],
    queryFn: () => apiClient.get('/dashboard/executive'),
  });

  const hasData = dashData?.has_data !== false && (dashData?.cash_trend && dashData.cash_trend.length > 0);
  const openExceptions = dashData?.kpis?.open_exceptions || 0;

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 shadow-[1px_0_3px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Razorpay Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#0B72E7] flex items-center justify-center text-white font-bold shadow-sm shadow-blue-500/30">
              <CreditCard className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-[#072654] block">Razorpay<span className="text-[#0B72E7]">Recon</span></span>
              <span className="text-[10px] font-medium text-slate-500 block -mt-0.5">Finance Operations</span>
            </div>
          </Link>

          <Badge variant="outline" className="text-[10px] font-mono bg-blue-50 text-[#0B72E7] border-blue-200">
            PROD
          </Badge>
        </div>

        {/* Merchant Account Pill */}
        <div className="px-3 pt-3">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs shadow-2xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-6 w-6 rounded-lg bg-[#072654] flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                {user?.company.slice(0, 2).toUpperCase() || 'AC'}
              </div>
              <div className="truncate">
                <span className="font-semibold text-slate-800 block truncate text-[11px]">{user?.company || 'Acme Direct Corp'}</span>
                <span className="text-[10px] text-slate-400 font-mono block truncate">{user?.merchant_id || 'rzp_live_9482'}</span>
              </div>
            </div>
            <span className="text-[9px] font-mono text-[#0B72E7] font-bold bg-blue-50 px-1 py-0.5 rounded border border-blue-200">
              {user?.role.split(' ')[0] || 'Admin'}
            </span>
          </div>
        </div>

        {/* Dynamic RBAC Filtered Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {NAVIGATION_SECTIONS.map((section) => {
            const allowedItems = section.items.filter((item) => canAccessRoute(item.href));
            if (allowedItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-0.5">
                <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase block mb-1">
                  {section.title}
                </span>
                {allowedItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                  // Dynamic badge computation
                  let badgeText = item.badge;
                  if (item.href === '/review' && hasData && openExceptions > 0) {
                    badgeText = `${openExceptions} Pending`;
                  } else if (item.href === '/review' && !hasData) {
                    badgeText = undefined;
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150",
                        isActive
                          ? "bg-blue-50 text-[#0B72E7] font-bold shadow-2xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={cn("h-4 w-4", isActive ? "text-[#0B72E7]" : "text-slate-400")} />
                        <span>{item.label}</span>
                      </div>

                      {badgeText && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] px-1.5 py-0 h-4 font-mono font-semibold",
                            isActive 
                              ? "bg-blue-100/60 text-[#0B72E7] border-blue-200" 
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          )}
                        >
                          {badgeText}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer Role Permission Pill */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 shrink-0">
          <div className="rounded-xl bg-white border border-slate-200 p-2.5 space-y-1 text-xs shadow-2xs">
            <div className="flex items-center justify-between text-slate-800 font-semibold text-[11px]">
              <span className="flex items-center gap-1.5 truncate">
                <ShieldCheck className="h-3.5 w-3.5 text-[#0B72E7]" />
                <span className="truncate">{user?.role || 'Finance Controller'}</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                Active RBAC
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {hasData 
                ? `500 records processed • ${openExceptions} exceptions` 
                : '0 records processed • Awaiting Ingestion Feed'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
