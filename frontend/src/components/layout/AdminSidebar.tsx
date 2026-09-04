'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  CreditCard, 
  ShieldAlert, 
  Activity, 
  Server, 
  Key, 
  Radio, 
  Sliders, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Zap,
  RotateCcw,
  CheckCircle2,
  Terminal,
  Code2,
  Building2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ADMIN_NAV = [
  {
    title: 'CORE PLATFORM CONSOLE',
    items: [
      { href: '/admin/dashboard', label: 'Console Overview', icon: LayoutDashboard },
      { href: '/admin/merchants', label: 'Merchant Approvals', icon: Building2, badge: 'KYC Active' },
      { href: '/admin/users', label: 'User Directory', icon: Users },
      { href: '/admin/roles', label: 'RBAC Roles', icon: Shield },
    ],
  },
  {
    title: 'TRANSACTIONS & RISK',
    items: [
      { href: '/admin/payments', label: 'Payment Core', icon: CreditCard, badge: 'Multi-Rail' },
      { href: '/admin/fraud', label: 'Fraud Monitoring', icon: ShieldAlert, badge: 'AI Guard' },
      { href: '/admin/disputes', label: 'Disputes & Chargebacks', icon: RotateCcw, badge: '0.02%' },
    ],
  },
  {
    title: 'INFRASTRUCTURE & APIS',
    items: [
      { href: '/admin/analytics', label: 'Platform Analytics', icon: Activity, badge: 'Live SLA' },
      { href: '/admin/protocol-monitoring', label: 'Protocol Monitoring', icon: Server, badge: '99.99%' },
      { href: '/admin/api-keys', label: 'API Key Management', icon: Key },
      { href: '/admin/webhooks', label: 'Webhooks & Events', icon: Radio },
      { href: '/admin/settings', label: 'System Settings', icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "bg-[#071328] text-slate-300 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 shadow-2xl transition-all duration-200 select-none",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* 1. Admin Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0 bg-[#050C1B]">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 overflow-hidden group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <Server className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <span className="font-extrabold text-sm tracking-tight text-white block truncate">
                  Razor<span className="text-[#0B72E7]">Admin</span>
                </span>
                <span className="text-[10px] font-semibold text-blue-300 block -mt-0.5 uppercase tracking-wider">
                  Platform Console
                </span>
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-mono px-1.5 py-0.5">
              ENTERPRISE
            </Badge>
          )}
        </div>

        {/* 2. Admin Persona Pill */}
        {!isCollapsed && (
          <div className="p-3">
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs truncate">
                  Platform Administrator
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                  PROD
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate">
                {user?.email || 'admin@razorcommerce.ai'}
              </div>
            </div>
          </div>
        )}

        {/* 3. Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin">
          {ADMIN_NAV.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                  {section.title}
                </span>
              )}

              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
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
                        ? 'bg-[#0B72E7] text-white font-bold shadow-md shadow-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn(
                        'h-4 w-4 shrink-0 transition-colors', 
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                      )} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={cn(
                          'text-[9px] font-mono font-bold px-1.5 py-0.5 rounded',
                          isActive
                            ? 'bg-white/20 text-white'
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

      {/* 4. Footer System Health */}
      <div className="p-3 border-t border-slate-800 bg-[#050C1B] shrink-0">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-slate-300">99.99% Uptime</span>
              </div>
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
