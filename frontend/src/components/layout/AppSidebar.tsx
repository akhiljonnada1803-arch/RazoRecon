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
  Terminal,
  Key,
  Activity,
  Server,
  Settings,
  AlertTriangle,
  RotateCcw,
  BarChart3,
  Wrench
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

// 1. CUSTOMER NAVIGATION
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
      { href: '/customer/installation', label: 'Installation Services', icon: Wrench, badge: 'On-Site' },
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

// 2. MERCHANT BUSINESS OPERATIONS (Shopify / Amazon Seller Central Style)
const MERCHANT_SECTIONS: NavSection[] = [
  {
    title: 'STORE MANAGEMENT',
    items: [
      { href: '/merchant/dashboard', label: 'Merchant Hub', icon: LayoutDashboard },
      { href: '/merchant/catalog', label: 'Catalog & Inventory', icon: Package, badge: '50 SKUs' },
      { href: '/merchant/orders', label: 'Orders & Fulfillment', icon: ShoppingBag, badge: '7-Stage' },
      { href: '/reconciliation', label: 'Transaction Engine', icon: Zap, badge: 'Multi-Rail' },
      { href: '/exceptions', label: 'Exception Center', icon: ShieldAlert, badge: 'Incident' },
      { href: '/vendor-intelligence', label: 'Merchant Intelligence', icon: Sparkles, badge: 'LTV / Churn' },
      { href: '/copilot', label: 'Commerce AI Copilot', icon: Bot, badge: 'Copilot' },
      { href: '/merchant/shipping', label: 'Shipping & Fleet', icon: Truck, badge: '4 Couriers' },
      { href: '/merchant/logistics-intelligence', label: 'Logistics Intelligence', icon: Truck, badge: '5 Fleets' },
      { href: '/merchant/return-risk', label: 'Return Risk Engine', icon: ShieldCheck, badge: '1.3% RTO' },
      { href: '/merchant/review-return-agent', label: 'Review & Return Agent', icon: ShieldCheck, badge: 'AI Shield' },
      { href: '/merchant/customers', label: 'Customer Insights', icon: Users, badge: 'Insights' },
      { href: '/merchant/razorpay-analytics', label: 'Razorpay Gateway', icon: CreditCard, badge: 'Live PG' },
    ],
  },
  {
    title: 'GROWTH & MARKETING',
    items: [
      { href: '/merchant/growth-agent', label: 'AI Growth Agent', icon: Bot, badge: 'Advisor' },
      { href: '/merchant/analytics', label: 'Advanced Analytics', icon: BarChart3, badge: '7 Charts' },
      { href: '/growth/campaigns', label: 'Campaign Manager', icon: Megaphone, badge: 'Auto' },
      { href: '/growth/upsell', label: 'Upsell Engine', icon: Sparkles, badge: 'Active' },
      { href: '/growth', label: 'Revenue Dashboard', icon: TrendingUp, badge: '+28.9%' },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      { href: '/merchant/settings', label: 'Store Settings', icon: Settings },
      { href: '/hero-demo', label: 'Interactive Demo', icon: Sparkles, badge: 'Track 01' },
    ],
  },
];

// 3. PLATFORM ADMIN DEVELOPER & INFRASTRUCTURE CONSOLE
const ADMIN_SECTIONS: NavSection[] = [
  {
    title: 'FLAGSHIP HERO DEMO',
    items: [
      { href: '/hero-demo', label: 'Hero Demo (Track 01)', icon: Sparkles, badge: 'Track 01' },
    ],
  },
  {
    title: 'DEVELOPER & COMMERCE CORE',
    items: [
      { href: '/admin/dashboard', label: 'Console Overview', icon: LayoutDashboard },
      { href: '/admin/agent-api', label: 'Agent API Center', icon: Code2, badge: 'REST API' },
      { href: '/admin/agent-catalog-feed', label: 'Agent Catalog Feed', icon: Terminal, badge: 'JSON Feed' },
      { href: '/reconciliation', label: 'Transaction Engine', icon: Zap, badge: 'Multi-Rail' },
      { href: '/exceptions', label: 'Exception Center', icon: ShieldAlert, badge: 'Incidents' },
      { href: '/vendor-intelligence', label: 'Commerce Intelligence', icon: Sparkles, badge: 'LTV / Churn' },
      { href: '/copilot', label: 'Commerce AI Copilot', icon: Bot, badge: 'Copilot' },
      { href: '/admin/api-keys', label: 'API Key Management', icon: Key, badge: 'Auth' },
      { href: '/admin/webhooks', label: 'Webhook Management', icon: Radio, badge: 'Events' },
      { href: '/admin/razorpay-analytics', label: 'Razorpay Analytics', icon: CreditCard, badge: 'MDR & Payout' },
      { href: '/admin/logistics-intelligence', label: 'Logistics Intelligence', icon: Truck, badge: 'Fleet OS' },
      { href: '/admin/return-risk', label: 'Return Risk Analytics', icon: ShieldCheck, badge: 'Platform' },
      { href: '/admin/ai-buyer-logs', label: 'AI Buyer Request Logs', icon: Activity, badge: 'Live Traces' },
      { href: '/admin/protocol-monitoring', label: 'Protocol Monitoring', icon: Server, badge: '99.99%' },
    ],
  },
  {
    title: 'PLATFORM ADMINISTRATION',
    items: [
      { href: '/admin/users', label: 'User Directory', icon: Users },
      { href: '/admin/roles', label: 'RBAC Roles', icon: Shield },
      { href: '/admin/integrations', label: 'ERP & Gateways', icon: Sliders },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isCustomer, canAccessRoute } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const isPlatformAdmin = user?.role === 'Platform Admin' || user?.role_id === 'role_platform_admin';

  let sections: NavSection[];
  if (isCustomer) {
    sections = CUSTOMER_SECTIONS;
  } else if (isPlatformAdmin) {
    sections = ADMIN_SECTIONS;
  } else {
    sections = MERCHANT_SECTIONS;
  }

  return (
    <aside 
      className={cn(
        "border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 shadow-[1px_0_3px_rgba(0,0,0,0.02)] transition-all duration-200",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 shrink-0">
          <Link 
            href={isCustomer ? "/customer/assistant" : isPlatformAdmin ? "/admin/dashboard" : "/merchant/dashboard"} 
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="h-8 w-8 rounded-lg bg-[#0B72E7] flex items-center justify-center text-white font-bold shadow-sm shadow-blue-500/30 shrink-0">
              <CreditCard className="h-4.5 w-4.5" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <span className="font-bold text-sm tracking-tight text-[#072654] block truncate">Razor<span className="text-[#0B72E7]">Commerce</span></span>
                <span className="text-[10px] font-medium text-slate-500 block -mt-0.5 truncate">
                  {isCustomer ? 'AI Store' : isPlatformAdmin ? 'Platform Admin' : 'Merchant Portal'}
                </span>
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <Badge variant="outline" className="text-[9px] font-mono bg-blue-50 text-[#0B72E7] border-blue-200 shrink-0">
              TRACK 01
            </Badge>
          )}
        </div>

        {/* Account / Persona Pill */}
        {!isCollapsed && (
          <div className="px-3 pt-3">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs shadow-2xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className={cn(
                  "h-6 w-6 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0",
                  isCustomer ? "bg-purple-600" : isPlatformAdmin ? "bg-slate-900" : "bg-[#072654]"
                )}>
                  {isCustomer ? 'CU' : isPlatformAdmin ? 'AD' : (user?.company ? user.company.slice(0, 2).toUpperCase() : 'MC')}
                </div>
                <div className="truncate">
                  <span className="font-semibold text-slate-800 block truncate text-[11px]">
                    {isCustomer ? (user?.name || 'Customer') : isPlatformAdmin ? 'Platform Admin' : (user?.company || 'Acme Direct')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block truncate">
                    {user?.email || 'operator@razorcommerce.ai'}
                  </span>
                </div>
              </div>
              <span className={cn(
                "text-[9px] font-mono font-bold px-1 py-0.5 rounded border shrink-0",
                isCustomer 
                  ? "bg-purple-50 text-purple-700 border-purple-200" 
                  : isPlatformAdmin 
                  ? "bg-slate-900 text-white border-slate-800" 
                  : "bg-blue-50 text-[#0B72E7] border-blue-200"
              )}>
                {isCustomer ? 'CUSTOMER' : isPlatformAdmin ? 'ADMIN' : 'MERCHANT'}
              </span>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                  {section.title}
                </span>
              )}
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/merchant/dashboard' && item.href !== '/admin/dashboard' && item.href !== '/customer/assistant' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150',
                      isCollapsed && 'justify-center px-2',
                      isActive
                        ? 'bg-[#0B72E7] text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-slate-500')} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[9px] font-mono border-0 font-bold px-1.5 py-0',
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer System Status & Collapse Toggle */}
      <div className="p-3 border-t border-slate-200 shrink-0 bg-slate-50/50 flex items-center justify-between">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-700">Protocol Active</span>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded hover:bg-slate-200 transition-colors"
              title="Collapse sidebar"
            >
              ◀
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full text-center text-xs font-bold text-slate-500 hover:text-[#0B72E7] py-1"
            title="Expand sidebar"
          >
            ▶
          </button>
        )}
      </div>
    </aside>
  );
}
