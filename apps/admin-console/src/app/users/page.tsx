'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AdminUser } from '@/types/admin';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  Lock, 
  ArrowRight,
  Sparkles,
  Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminUsersPage() {
  const { quickSwitchUser, user: currentUser } = useAuth();

  const { data: users, isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => apiClient.get('/admin/users'),
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
                <Users className="w-3.5 h-3.5 mr-1" />
                Enterprise RBAC Directory
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Multi-Tenant Org Isolation
              </Badge>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight">
              Enterprise Operators & Role Mapping
            </h1>
            <p className="text-blue-100 text-xs mt-1 max-w-xl">
              Manage enterprise personas, access tokens, organization memberships, and granular permission boundaries.
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Operator Name</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Tenant Organization</th>
                <th className="py-3.5 px-4 text-right">Quick Persona Switch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(users || []).map((u) => {
                const isCurrent = currentUser?.email === u.email;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-[#072654] text-white flex items-center justify-center font-bold text-[10px]">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        className={`text-[10px] font-semibold ${
                          u.role.includes('Admin')
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : u.role.includes('CFO') || u.role.includes('Controller')
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : u.role.includes('Revenue')
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-700 font-medium">{u.company || 'Acme Direct Corp'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isCurrent ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[10px]">
                          Active Current User
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => quickSwitchUser(u.email)}
                          className="h-7 text-xs font-semibold text-[#0B72E7] hover:bg-blue-50 border-blue-200 rounded-lg"
                        >
                          Switch Role
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
