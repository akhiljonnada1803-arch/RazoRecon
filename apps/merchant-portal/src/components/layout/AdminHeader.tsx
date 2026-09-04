'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Server, 
  Activity,
  Terminal,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AdminHeader() {
  const { user, logout } = useAuth();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Left: Platform Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white shadow-2xs">
          <Server className="h-4 w-4 text-[#0B72E7]" />
          <span className="text-xs font-bold font-mono">Platform Admin Console</span>
        </div>

        <Badge variant="outline" className="hidden sm:inline-flex bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px] font-mono font-bold">
          LIVE PROD (ap-south-1)
        </Badge>
      </div>

      {/* Right: Actions & Admin Profile */}
      <div className="flex items-center gap-3">
        <Link href="/admin/api-keys">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 px-3 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold gap-1.5 shadow-2xs"
          >
            <Key className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline">API Keys & Auth</span>
          </Button>
        </Link>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <div className="text-right hidden md:block">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-blue-600 block leading-tight font-mono font-semibold">
                Super Admin
              </span>
            </div>

            <div className="h-7 w-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 block">
                  {user?.name || 'Platform Administrator'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono block truncate">
                  {user?.email || 'admin@razorcommerce.ai'}
                </span>
                <span className="inline-block mt-1 text-[10px] font-mono text-white bg-slate-900 px-1.5 py-0.5 rounded font-bold">
                  Root Platform Authority
                </span>
              </div>

              <div className="space-y-0.5 mt-1 text-xs text-slate-700 font-medium">
                <Link
                  href="/admin/settings"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  <span>Platform Settings</span>
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
