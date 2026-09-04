'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AdminRole } from '@/types/admin';
import { 
  Shield, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Key, 
  Layers 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminRolesPage() {
  const { data: roles, isLoading } = useQuery<AdminRole[]>({
    queryKey: ['admin', 'roles'],
    queryFn: () => apiClient.get('/admin/roles'),
  });

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Shield className="w-3.5 h-3.5 mr-1" />
                RBAC Security Policy Matrix
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <Lock className="w-3.5 h-3.5 mr-1" />
                Principle of Least Privilege
              </Badge>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight">
              Enterprise Roles & Permission Policies
            </h1>
            <p className="text-blue-100 text-xs mt-1 max-w-xl">
              Inspect permission boundaries across Finance Controllers, CFOs, Auditors, Revenue Managers, Operations Managers, and Platform Admins.
            </p>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(roles || []).map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">{role.name}</h3>
              <Badge variant="outline" className="font-mono text-[9px] bg-slate-50 text-slate-600 border-slate-200">
                {role.id}
              </Badge>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {role.description}
            </p>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">
                Granted Permission Policies ({role.permissions?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(role.permissions || []).map((perm, idx) => (
                  <Badge
                    key={idx}
                    className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px] font-mono"
                  >
                    {perm}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
