'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ApiKeyItem } from '@/types/admin';
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Lock,
  Zap,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function AdminApiKeysPage() {
  const queryClient = useQueryClient();
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'LIVE' | 'TEST'>('TEST');

  const { data: keys = [], isLoading } = useQuery<ApiKeyItem[]>({
    queryKey: ['admin', 'api-keys'],
    queryFn: () => apiClient.get('/admin/api-keys'),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; environment: string }) => {
      return apiClient.post('/admin/api-keys', payload);
    },
    onSuccess: () => {
      setIsModalOpen(false);
      setNewKeyName('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'api-keys'] });
    }
  });

  const revokeMutation = useMutation({
    mutationFn: (keyId: string) => {
      return apiClient.delete(`/admin/api-keys/${keyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'api-keys'] });
    }
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Developer Console</span>
            <span>•</span>
            <span className="text-[#0B72E7]">Authentication</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654] flex items-center gap-2.5">
            <Key className="h-6 w-6 text-[#0B72E7]" />
            API Key Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage Bearer authentication tokens for external autonomous agents, buyer bots, and ERP ledger connectors.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold shadow-xs flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Generate New API Key</span>
        </Button>
      </div>

      {/* Keys Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No active API keys found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Key Name & Role</th>
                  <th className="py-3.5 px-6 font-semibold">Environment</th>
                  <th className="py-3.5 px-6 font-semibold">API Key Secret</th>
                  <th className="py-3.5 px-6 font-semibold">Total Requests</th>
                  <th className="py-3.5 px-6 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900 block text-xs">{k.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{k.role}</span>
                    </td>

                    <td className="py-4 px-6">
                      <Badge className={k.environment === 'LIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]' : 'bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px]'}>
                        {k.environment}
                      </Badge>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 font-mono text-xs text-slate-700">
                        <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                          {k.key_secret_masked}
                        </span>
                        <button
                          onClick={() => handleCopy(k.id, k.key_secret_masked)}
                          className="h-6 w-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                          title="Copy API Key"
                        >
                          {copiedKeyId === k.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono font-bold text-slate-800">
                      {k.requests_count.toLocaleString('en-IN')}
                    </td>

                    <td className="py-4 px-6">
                      <Badge className={k.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]' : 'bg-rose-50 text-rose-700 border-rose-200 text-[10px]'}>
                        {k.status}
                      </Badge>
                    </td>

                    <td className="py-4 px-6 text-right">
                      {k.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm(`Revoke API key "${k.name}"?`)) {
                              revokeMutation.mutate(k.id);
                            }
                          }}
                          className="h-7 px-2.5 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold"
                        >
                          Revoke Key
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#072654] flex items-center gap-2">
                <Key className="h-4.5 w-4.5 text-[#0B72E7]" />
                <span>Generate Agent API Key</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Key Name / Description *</label>
                <Input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., LangChain Procurement Agent"
                  className="h-9 text-xs rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Environment</label>
                <select
                  value={newKeyEnv}
                  onChange={(e: any) => setNewKeyEnv(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs bg-white focus:outline-none"
                >
                  <option value="TEST">TEST / Sandbox</option>
                  <option value="LIVE">LIVE / Production</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!newKeyName.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate({ name: newKeyName.trim(), environment: newKeyEnv })}
                className="rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold"
              >
                {createMutation.isPending ? 'Generating...' : 'Create Key'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
