'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldAlert, 
  Lock, 
  ArrowLeft, 
  UserCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AccessDenied403Props {
  requiredPermission?: string;
  routePath?: string;
}

export const AccessDenied403: React.FC<AccessDenied403Props> = ({
  requiredPermission = 'Enterprise Access',
  routePath,
}) => {
  const { user, quickSwitchUser } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200/90 p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Icon & Badge */}
        <div className="flex flex-col items-center space-y-2">
          <div className="h-16 w-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <Badge variant="outline" className="text-xs font-mono font-bold bg-rose-50 text-rose-700 border-rose-200">
            HTTP 403 • FORBIDDEN
          </Badge>
        </div>

        {/* Headline */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-[#072654] tracking-tight">
            Access Restricted by RBAC Policy
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your current persona (<strong className="text-slate-900">{user?.role || 'Guest'}</strong>) does not possess the <code className="text-rose-700 bg-rose-50 px-1 py-0.5 rounded font-mono text-[11px] font-bold">{requiredPermission}</code> permission required for {routePath || 'this workstation module'}.
          </p>
        </div>

        {/* Demo Role Switcher Helper */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-left space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#072654] flex items-center gap-1.5 text-[11px]">
              <Sparkles className="h-3.5 w-3.5 text-[#0B72E7]" />
              Demo Quick-Switch for Hackathon Judges
            </span>
          </div>

          <p className="text-[11px] text-slate-600">
            Switch to a role with full operational permissions without logging out:
          </p>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => quickSwitchUser('admin@razorrecon.ai')}
              className="h-8 text-[11px] font-bold border-blue-200 bg-white hover:bg-blue-50 text-[#0B72E7] justify-start px-2"
            >
              👑 Platform Admin
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => quickSwitchUser('controller@acme.com')}
              className="h-8 text-[11px] font-bold border-blue-200 bg-white hover:bg-blue-50 text-[#0B72E7] justify-start px-2"
            >
              📊 Finance Controller
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => quickSwitchUser('cfo@acme.com')}
              className="h-8 text-[11px] font-bold border-blue-200 bg-white hover:bg-blue-50 text-[#0B72E7] justify-start px-2"
            >
              💼 Chief Financial Officer
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => quickSwitchUser('auditor@acme.com')}
              className="h-8 text-[11px] font-bold border-blue-200 bg-white hover:bg-blue-50 text-[#0B72E7] justify-start px-2"
            >
              🔍 Senior Auditor
            </Button>
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-2">
          <Link href="/dashboard">
            <Button className="w-full h-10 text-xs font-bold bg-[#072654] hover:bg-[#0B254E] text-white rounded-xl shadow-xs gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Executive Dashboard</span>
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};
