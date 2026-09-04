'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { WebhookItem } from '@/types/admin';
import { 
  Radio, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Zap, 
  Globe, 
  ShieldCheck, 
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const AVAILABLE_EVENTS = [
  'order.placed',
  'order.paid',
  'order.shipped',
  'order.delivered',
  'settlement.created',
  'refund.processed',
  'inventory.low_stock'
];

export default function AdminWebhooksPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['order.placed', 'order.paid']);

  const { data: webhooks = [], isLoading } = useQuery<WebhookItem[]>({
    queryKey: ['admin', 'webhooks'],
    queryFn: () => apiClient.get('/admin/webhooks'),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { url: string; events: string[] }) => {
      return apiClient.post('/admin/webhooks', payload);
    },
    onSuccess: () => {
      setIsModalOpen(false);
      setNewUrl('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'webhooks'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/webhooks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'webhooks'] });
    }
  });

  const toggleEvent = (ev: string) => {
    setSelectedEvents(prev => 
      prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Developer Console</span>
            <span>•</span>
            <span className="text-[#0B72E7]">Event Delivery</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654] flex items-center gap-2.5">
            <Radio className="h-6 w-6 text-[#0B72E7]" />
            Webhook Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure real-time HTTP event callbacks for orders, settlements, and supply chain milestones.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold shadow-xs flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Webhook Endpoint</span>
        </Button>
      </div>

      {/* Webhooks Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : webhooks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No webhooks registered.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Endpoint URL</th>
                  <th className="py-3.5 px-6 font-semibold">Subscribed Events</th>
                  <th className="py-3.5 px-6 font-semibold">Health Delivery Rate</th>
                  <th className="py-3.5 px-6 font-semibold">Last Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {webhooks.map((wh) => (
                  <tr key={wh.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900 text-xs truncate max-w-sm">
                      {wh.url}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {wh.events.map(ev => (
                          <Badge key={ev} variant="outline" className="text-[10px] font-mono text-slate-600 bg-slate-50">
                            {ev}
                          </Badge>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono font-bold text-emerald-700">
                      {wh.health_rate}
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        HTTP {wh.last_delivery_status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm(`Remove webhook "${wh.url}"?`)) {
                            deleteMutation.mutate(wh.id);
                          }
                        }}
                        className="h-7 px-2.5 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Webhook Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#072654] flex items-center gap-2">
                <Radio className="h-4.5 w-4.5 text-[#0B72E7]" />
                <span>Register Webhook Endpoint</span>
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
                <label className="font-semibold text-slate-700">Destination Callback URL *</label>
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://api.yourdomain.com/webhooks/razorpay"
                  className="h-9 text-xs rounded-xl border-slate-200 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block">Select Subscribed Events</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto custom-scrollbar p-1">
                  {AVAILABLE_EVENTS.map(ev => {
                    const isSelected = selectedEvents.includes(ev);
                    return (
                      <button
                        key={ev}
                        type="button"
                        onClick={() => toggleEvent(ev)}
                        className={`p-2 rounded-xl text-[11px] font-mono font-semibold border text-left transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-200 text-[#0B72E7]'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {ev}
                      </button>
                    );
                  })}
                </div>
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
                disabled={!newUrl.trim() || selectedEvents.length === 0 || createMutation.isPending}
                onClick={() => createMutation.mutate({ url: newUrl.trim(), events: selectedEvents })}
                className="rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold"
              >
                {createMutation.isPending ? 'Registering...' : 'Register Webhook'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
