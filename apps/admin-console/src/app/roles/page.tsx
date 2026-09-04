'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AdminRole } from '@/types/admin';
import { 
  Shield, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Key, 
  Layers,
  Search,
  Filter,
  Plus,
  SlidersHorizontal,
  KeyRound,
  FileCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STATIC_ROLES: AdminRole[] = [
  {
    id: 'role_platform_admin',
    name: 'Platform Administrator',
    description: 'Full root administrative privileges across all merchant tenants, API keys, and reconciliation protocols.',
    permissions: ['admin:*', 'merchants:*', 'payments:*', 'reconciliation:*', 'audit:*', 'settings:*']
  },
  {
    id: 'role_merchant_owner',
    name: 'Merchant Owner',
    description: 'Full operations authority for merchant organization: catalog publishing, fulfillment dispatch, campaigns.',
    permissions: ['catalog:*', 'orders:*', 'shipping:*', 'analytics:read', 'revenue:read']
  },
  {
    id: 'role_ops_mgr',
    name: 'Operations Manager',
    description: 'Fulfillment operations, multi-courier tracking, shipping labels generation and dispute resolution.',
    permissions: ['orders:manage', 'shipping:*', 'couriers:dispatch', 'inventory:update']
  },
  {
    id: 'role_rev_mgr',
    name: 'Revenue Manager',
    description: 'Commercial pricing strategies, dynamic bundling, coupon campaigns, and marketing conversion telemetry.',
    permissions: ['campaigns:*', 'pricing:manage', 'analytics:*', 'discounts:apply']
  },
  {
    id: 'role_cfo',
    name: 'Chief Financial Officer',
    description: 'Comprehensive financial oversight, settlement approvals, tax liability ledger and general ledger export.',
    permissions: ['revenue:*', 'settlements:approve', 'tax:audit', 'bank_accounts:view']
  },
  {
    id: 'role_auditor',
    name: 'Statutory Auditor',
    description: 'Read-only access to immutable audit trails, cryptographic hash chains, and PCI compliance logs.',
    permissions: ['audit:read_immutable', 'compliance:verify', 'logs:export']
  },
  {
    id: 'role_customer',
    name: 'Customer Shopper',
    description: 'Consumer access for autonomous AI shopping, cart management, checkout, and personal order tracking.',
    permissions: ['catalog:read', 'cart:manage', 'orders:read_self', 'assistant:chat']
  }
];

export default function AdminRolesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('ALL');

  const { data: rolesData } = useQuery<AdminRole[]>({
    queryKey: ['admin', 'roles'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<AdminRole[]>('/admin/roles');
        return Array.isArray(res) && res.length > 0 ? res : STATIC_ROLES;
      } catch (e) {
        return STATIC_ROLES;
      }
    },
  });

  const roles = rolesData || STATIC_ROLES;

  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const matchesSearch = 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPerm = 
        selectedPermission === 'ALL' || 
        r.permissions.some(p => p.toLowerCase().includes(selectedPermission.toLowerCase()));

      return matchesSearch && matchesPerm;
    });
  }, [roles, searchQuery, selectedPermission]);

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 mb-1">
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
            Role-Based Access Control (RBAC) Policies
          </h1>
          <p className="text-blue-100 text-xs mt-1 max-w-xl">
            Inspect permission boundaries across Platform Admins, Merchant Owners, Operations Managers, CFOs, Auditors, and Customers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-white text-[#072654] hover:bg-slate-100 text-xs font-bold rounded-xl h-10 px-4 shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </Button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Configured Roles', val: `${roles.length} System Roles`, change: 'Pre-defined & Custom', color: 'text-blue-600' },
          { label: 'Active Policy Rules', val: '48 Permissions', change: 'Granular scopes', color: 'text-emerald-600' },
          { label: 'Root Admins', val: '2 Operators', change: 'MFA Enforced', color: 'text-purple-600' },
          { label: 'Audit Trail', val: 'Immutable', change: 'SHA-256 Chained', color: 'text-amber-600' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">{s.label}</span>
            <span className="text-2xl font-black text-slate-900 block">{s.val}</span>
            <span className={`text-[11px] font-semibold ${s.color} block`}>{s.change}</span>
          </div>
        ))}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search role name, ID, or permission..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          {['ALL', 'admin', 'orders', 'shipping', 'campaigns', 'audit'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPermission(p)}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-mono ${
                selectedPermission === p
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {p === 'ALL' ? 'ALL POLICIES' : `${p}:*`}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Data Table & Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredRoles.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <Shield className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No roles found</h4>
            <p className="text-xs text-slate-500">No role matches the criteria: "{searchQuery}".</p>
            <Button onClick={() => { setSearchQuery(''); setSelectedPermission('ALL'); }} size="sm" variant="outline" className="text-xs font-bold rounded-xl mt-2">
              Reset Filters
            </Button>
          </div>
        ) : (
          filteredRoles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{role.name}</h3>
                  </div>
                  <Badge variant="outline" className="font-mono text-[9px] bg-slate-50 text-slate-600 border-slate-200">
                    {role.id}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {role.description}
                </p>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">
                    Granted Permissions ({role.permissions?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(role.permissions || []).map((perm: string, idx: number) => (
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

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] font-mono">Scope: Tenant Bound</span>
                <Button variant="ghost" size="sm" className="text-xs text-[#0B72E7] font-bold h-7 px-2 hover:bg-blue-50">
                  Edit Policies
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
