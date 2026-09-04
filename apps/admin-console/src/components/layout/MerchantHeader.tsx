'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Building2, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Check, 
  ExternalLink,
  Store,
  Bell,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function MerchantHeader() {
  const { user, organizations, switchOrganization, logout } = useAuth();
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Left: Store Selector & Live Indicator */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => {
              setIsOrgDropdownOpen(!isOrgDropdownOpen);
              setIsUserDropdownOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors shadow-2xs group"
          >
            <div className="h-6 w-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              {user?.company ? user.company.charAt(0) : 'A'}
            </div>
            <div className="text-left space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block leading-none">
                {user?.company || 'Acme Direct Corp'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block leading-none">
                {user?.merchant_id || 'rzp_live_acme_8842'}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
          </button>

          {/* Org Menu */}
          {isOrgDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400">
                SELECT MERCHANT STORE
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
                          ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="block font-semibold">{org.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{org.industry || org.merchant_id}</span>
                      </div>
                      {isCurrent && <Check className="h-4 w-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <Badge variant="outline" className="hidden sm:inline-flex bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
          Shopify Seller Mode
        </Badge>
      </div>

      {/* Right: Actions & Merchant Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Link to Customer Storefront */}
        <Link href="/" target="_blank">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 px-3 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold gap-1.5 shadow-2xs"
          >
            <Store className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Online Storefront</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </Button>
        </Link>

        {/* Merchant Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsUserDropdownOpen(!isUserDropdownOpen);
              setIsOrgDropdownOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <div className="text-right hidden md:block">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {user?.name || 'Rajesh Sharma'}
              </span>
              <span className="text-[10px] text-emerald-600 block leading-tight font-semibold">
                Store Owner
              </span>
            </div>

            <div className="h-7 w-7 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-xs">
              {user?.name ? user.name.charAt(0) : 'R'}
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 block">
                  {user?.name || 'Rajesh Sharma'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono block truncate">
                  {user?.email || 'owner@acme.com'}
                </span>
                <span className="inline-block mt-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                  Merchant Seller Account
                </span>
              </div>

              <div className="space-y-0.5 mt-1 text-xs text-slate-700 font-medium">
                <Link
                  href="/merchant/settings"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  <span>Store Settings</span>
                </Link>

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
