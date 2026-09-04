'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  GitCompare, 
  Layers, 
  TrendingUp, 
  Radio, 
  ShieldAlert, 
  Sparkles, 
  CreditCard,
  Zap,
  ShieldCheck,
  BrainCircuit,
  ShoppingBag,
  Package,
  Megaphone,
  Bot,
  Store,
  Users,
  Clock,
  Shield,
  FileText,
  Sliders,
  Heart,
  Truck,
  Code2,
  Compass,
  UserCheck
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

const CUSTOMER_SECTIONS: NavSection[] = [
  {
    title: 'AI SHOPPING HUB',
    items: [
      { href: '/customer/assistant', label: 'AI Shopping Assistant', icon: Bot, badge: 'Live AI' },
      { href: '/customer/products', label: 'Browse Products', icon: Store, badge: '50 SKUs' },
      { href: '/customer/recommendations', label: 'AI Recommendations', icon: Sparkles, badge: 'For You' },
    ],
  },
  {
    title: 'MY ORDERS & TRACKING',
    items: [
      { href: '/customer/orders', label: 'My Orders', icon: ShoppingBag },
      { href: '/customer/track', label: 'Track Order', icon: Truck, badge: '7 Stages' },
      { href: '/customer/wishlist', label: 'My Wishlist', icon: Heart },
    ],
  },
  {
    title: 'ACCOUNT & PREFERENCES',
    items: [
      { href: '/customer/profile', label: 'Customer Profile', icon: Users },
      { href: '/hero-demo', label: 'Interactive Demo Flow', icon: Sparkles, badge: 'Track 01' },
    ],
  },
];

const MERCHANT_SECTIONS: NavSection[] = [
  {
    title: 'FLAGSHIP HERO DEMO',
    items: [
      { href: '/hero-demo', label: 'Hero Demo (Track 01)', icon: Sparkles, badge: 'Track 01' },
    ],
  },
  {
    title: 'MERCHANT OPERATIONS',
    items: [
      { href: '/merchant/dashboard', label: 'Merchant Hub', icon: LayoutDashboard },
      { href: '/merchant/catalog', label: 'Catalog Management', icon: Package, badge: '50 SKUs' },
      { href: '/merchant/inventory', label: 'Inventory Control', icon: Layers, badge: 'Stock' },
      { href: '/merchant/orders', label: 'Orders & Fulfillment', icon: ShoppingBag, badge: '7-Stage' },
      { href: '/merchant/shipping', label: 'Shipping & Logistics', icon: Truck, badge: '4 Couriers' },
      { href: '/merchant/customers', label: 'Customer LTV & Memory', icon: Users, badge: 'Insights' },
      { href: '/merchant/agent-api', label: 'Agent API Center', icon: Code2, badge: 'Track 01' },
    ],
  },
  {
    title: 'GROWTH ENGINE',
    items: [
      { href: '/growth', label: 'Revenue Overview', icon: TrendingUp, badge: '+28.9%' },
      { href: '/growth/upsell', label: 'Upsell & Cross-Sell', icon: Sparkles, badge: 'Engine' },
      { href: '/growth/campaigns', label: 'Campaigns', icon: Megaphone, badge: 'AI Gen' },
      { href: '/growth/segments', label: 'RFM Segments', icon: Layers, badge: 'Clusters' },
    ],
  },
  {
    title: 'FINANCE INTELLIGENCE',
    items: [
      { href: '/finance/reconciliation', label: 'Reconciliation Engine', icon: GitCompare },
      { href: '/finance/exceptions', label: 'Exception Queue', icon: CheckSquare },
      { href: '/finance/vendors', label: 'Vendor Intelligence', icon: ShieldAlert, badge: 'Risk' },
      { href: '/finance/copilot', label: 'CFO AI Copilot', icon: BrainCircuit, badge: 'ReAct' },
    ],
  },
  {
    title: 'AUDIT & COMPLIANCE',
    items: [
      { href: '/audit/logs', label: 'Audit Logs', icon: FileText },
      { href: '/audit/timeline', label: 'Visual Timeline', icon: Clock },
      { href: '/audit/compliance', label: 'Compliance & GST', icon: ShieldCheck, badge: '100%' },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { href: '/admin/users', label: 'User Directory', icon: Users },
      { href: '/admin/roles', label: 'RBAC Roles', icon: Shield },
      { href: '/admin/integrations', label: 'Integrations & ERP', icon: Sliders },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isCustomer, canAccessRoute } = useAuth();

  const sections = isCustomer ? CUSTOMER_SECTIONS : MERCHANT_SECTIONS;

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 shadow-[1px_0_3px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col h-full overflow-hidden">
        {/* RazorCommerce Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 shrink-0">
          <Link href={isCustomer ? "/customer/assistant" : "/merchant/dashboard"} className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#0B72E7] flex items-center justify-center text-white font-bold shadow-sm shadow-blue-500/30">
              <CreditCard className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-[#072654] block">Razor<span className="text-[#0B72E7]">Commerce</span> AI</span>
              <span className="text-[10px] font-medium text-slate-500 block -mt-0.5">
                {isCustomer ? 'AI Shopping Experience' : 'Commerce Operating System'}
              </span>
            </div>
          </Link>

          <Badge variant="outline" className="text-[9px] font-mono bg-blue-50 text-[#0B72E7] border-blue-200">
            TRACK 01
          </Badge>
        </div>

        {/* Account / Persona Pill */}
        <div className="px-3 pt-3">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs shadow-2xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className={cn(
                "h-6 w-6 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0",
                isCustomer ? "bg-purple-600" : "bg-[#072654]"
              )}>
                {isCustomer ? 'CU' : (user?.company.slice(0, 2).toUpperCase() || 'AC')}
              </div>
              <div className="truncate">
                <span className="font-semibold text-slate-800 block truncate text-[11px]">
                  {isCustomer ? (user?.name || 'Customer Account') : (user?.company || 'Acme Direct Corp')}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block truncate">
                  {user?.email || 'user@razorcommerce.ai'}
                </span>
              </div>
            </div>
            <span className={cn(
              "text-[9px] font-mono font-bold px-1 py-0.5 rounded border",
              isCustomer 
                ? "text-purple-700 bg-purple-50 border-purple-200" 
                : "text-[#0B72E7] bg-blue-50 border-blue-200"
            )}>
              {user?.role.split(' ')[0] || 'User'}
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
          {sections.map((section) => {
            const allowedItems = section.items.filter((item) => canAccessRoute(item.href));
            if (allowedItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-0.5">
                <span className="px-3 text-[9px] font-bold tracking-wider text-slate-400 font-mono uppercase block mb-1">
                  {section.title}
                </span>
                {allowedItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/merchant/dashboard' && item.href !== '/customer/assistant' && pathname.startsWith(item.href));

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

                      {item.badge && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] px-1.5 py-0 h-4 font-mono font-semibold",
                            isActive 
                              ? "bg-blue-100/60 text-[#0B72E7] border-blue-200" 
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          )}
                        >
                          {item.badge}
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
                <span className="truncate">{user?.role || 'Customer'}</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                Active
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {isCustomer ? 'Autonomous AI Buyer Experience' : 'Merchant AI Commerce Operating System'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
