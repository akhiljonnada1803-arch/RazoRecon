'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Check, 
  Lock, 
  Zap, 
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Sparkles,
  ShoppingBag,
  Store,
  Package,
  Truck
} from 'lucide-react';

const DEMO_ROLES = [
  {
    name: 'Merchant Owner',
    email: 'owner@acme.com',
    badge: 'Catalog, Inventory, Orders & Revenue Growth',
    icon: '🏬',
  },
  {
    name: 'Customer',
    email: 'customer@acme.com',
    badge: 'AI Shopping Assistant, Wishlist & Track Orders',
    icon: '🛍️',
  },
  {
    name: 'Operations Manager',
    email: 'ops@acme.com',
    badge: 'Fulfillment Pipeline & Courier Logistics',
    icon: '📦',
  },
  {
    name: 'Platform Admin',
    email: 'admin@razorcommerce.ai',
    badge: 'Platform Config, Merchants & Delivery Partners',
    icon: '👑',
  },
];

export function Header() {
  const { user, organizations, switchOrganization, quickSwitchUser, hasPermission, logout, isCustomer } = useAuth();
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Left: Organization / Customer Switcher */}
      <div className="flex items-center gap-3">
        {!isCustomer ? (
          <div className="relative">
            <button
              onClick={() => {
                setIsOrgDropdownOpen(!isOrgDropdownOpen);
                setIsUserDropdownOpen(false);
                setIsRoleSwitcherOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 transition-colors shadow-2xs group"
            >
              <div className="h-6 w-6 rounded-lg bg-[#0B72E7] flex items-center justify-center text-white font-bold text-xs shadow-xs">
                {user?.company.slice(0, 1) || 'A'}
              </div>
              <div className="text-left space-y-0.5">
                <span className="text-xs font-bold text-[#072654] block leading-none">
                  {user?.company || 'Acme Direct Corp'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block leading-none">
                  {user?.merchant_id || 'rzp_live_acme_8842'}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
            </button>

            {/* Org Menu */}
            {isOrgDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400">
                  SWITCH MERCHANT TENANT
                </div>

                <div className="space-y-1 mt-1">
                  {organizations.map((org) => {
                    const isCurrent = user?.company === org.name;
                    return (
                      <button
                        key={org.id}
                        onClick={() => {
                          switchOrganization(org.name);
                          setIsOrgDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isCurrent
                            ? 'bg-blue-50/80 text-[#0B72E7] font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="block font-semibold">{org.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">{org.industry || org.merchant_id}</span>
                        </div>
                        {isCurrent && <Check className="h-4 w-4 text-[#0B72E7]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-2xs">
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold">Consumer Shopping Hub</span>
          </div>
        )}

        <span className="text-slate-300 font-mono hidden sm:inline">/</span>
        
        {/* Quick Demo Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setIsRoleSwitcherOpen(!isRoleSwitcherOpen);
              setIsOrgDropdownOpen(false);
              setIsUserDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-800 text-xs font-semibold hover:bg-purple-100/80 transition-colors shadow-2xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            <span className="max-w-[160px] truncate">Persona: {user?.role || 'Merchant Owner'}</span>
            <ChevronDown className="h-3 w-3 text-purple-500 shrink-0" />
          </button>

          {isRoleSwitcherOpen && (
            <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 text-[10px] font-bold font-mono uppercase tracking-wider text-purple-700">
                SWITCH TRACK 01 PERSONAS
              </div>

              <div className="space-y-1 mt-1">
                {DEMO_ROLES.map((r) => {
                  const isCurrent = user?.email === r.email;
                  return (
                    <button
                      key={r.email}
                      onClick={() => {
                        quickSwitchUser(r.email);
                        setIsRoleSwitcherOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-purple-50/80 text-purple-900 font-bold border border-purple-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span>{r.icon}</span>
                          <span className="font-bold">{r.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">{r.email}</span>
                        <span className="text-[10px] text-purple-600 block">{r.badge}</span>
                      </div>
                      {isCurrent && <Check className="h-4 w-4 text-purple-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3">
        {isCustomer ? (
          <Link href="/customer/assistant">
            <Button
              size="sm"
              className="text-xs h-8 px-3 rounded-xl bg-[#0B72E7] hover:bg-blue-600 text-white font-semibold gap-1.5 shadow-2xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Shopping Assistant</span>
            </Button>
          </Link>
        ) : (
          <Link href="/merchant/agent-api">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 px-2.5 rounded-xl border-blue-200 bg-blue-50 text-[#0B72E7] hover:bg-blue-100 font-semibold gap-1.5 shadow-2xs"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Agent API Center</span>
            </Button>
          </Link>
        )}

        {/* User Profile Dropdown */}
        <div className="relative ml-1">
          <button
            onClick={() => {
              setIsUserDropdownOpen(!isUserDropdownOpen);
              setIsOrgDropdownOpen(false);
              setIsRoleSwitcherOpen(false);
            }}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <div className="text-right hidden md:block">
              <span className="text-xs font-bold text-[#072654] block leading-tight">
                {user?.name || 'Rajesh Sharma'}
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight font-medium">
                {user?.role || 'Merchant Owner'}
              </span>
            </div>

            <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
              <User className="h-3.5 w-3.5 text-slate-600" />
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-[#072654] block">
                  {user?.name || 'Rajesh Sharma'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono block truncate">
                  {user?.email || 'owner@acme.com'}
                </span>
                <span className="inline-block mt-1 text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                  Role: {user?.role || 'Merchant Owner'}
                </span>
              </div>

              <div className="space-y-0.5 mt-1 text-xs text-slate-700 font-medium">
                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-semibold"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
