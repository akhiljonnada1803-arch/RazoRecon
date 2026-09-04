'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Truck, 
  Package, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Search, 
  ShieldCheck, 
  Sliders, 
  Zap,
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const CARRIERS = [
  { name: 'Delhivery Express', active_shipments: 42, sla: '98.4%', avg_time: '1.8 Days', status: 'Optimal' },
  { name: 'Blue Dart Express', active_shipments: 28, sla: '99.1%', avg_time: '1.2 Days', status: 'Optimal' },
  { name: 'Shiprocket Air', active_shipments: 19, sla: '96.8%', avg_time: '2.1 Days', status: 'Optimal' },
  { name: 'Ekart Logistics', active_shipments: 34, sla: '97.5%', avg_time: '2.0 Days', status: 'Optimal' }
];

export default function MerchantShippingPage() {
  const [search, setSearch] = useState('');

  const { data: ordersData, isLoading } = useQuery<any>({
    queryKey: ['merchant', 'shipping', 'orders'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/merchant/orders?limit=100');
      return res?.orders || res?.items || (Array.isArray(res) ? res : []);
    },
  });

  const orders: any[] = Array.isArray(ordersData) ? ordersData : [];
  const shipments = orders.filter(o => ['SHIPPED', 'OUT_FOR_DELIVERY', 'PACKED'].includes(o.order_status || o.status));

  const filteredShipments = shipments.filter(s => {
    const id = s.id || s.order_id || '';
    const courier = s.delivery_partner || '';
    const awb = s.tracking_id || '';
    const term = search.toLowerCase();
    return id.toLowerCase().includes(term) || courier.toLowerCase().includes(term) || awb.toLowerCase().includes(term);
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Merchant Operations</span>
            <span>•</span>
            <span className="text-[#0B72E7]">Logistics & Fleet</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654]">
            Shipping & Courier Dispatch Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Multi-carrier dispatch routing with automated AWB generation across Delhivery, Blue Dart, Shiprocket, and Ekart.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1.5 border-slate-200">
            <FileSpreadsheet className="h-3.5 w-3.5 text-slate-500" />
            <span>Export Manifest</span>
          </Button>
        </div>
      </div>

      {/* 4 Delivery Partners Fleet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARRIERS.map((carrier) => (
          <div key={carrier.name} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold text-xs">
                <Truck className="h-4.5 w-4.5" />
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                {carrier.status}
              </Badge>
            </div>

            <div>
              <h3 className="font-bold text-sm text-[#072654]">{carrier.name}</h3>
              <span className="text-xs text-slate-400">Integrated Webhook API</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Active</span>
                <strong className="text-slate-800">{carrier.active_shipments}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">SLA Rate</span>
                <strong className="text-emerald-700">{carrier.sla}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Avg Time</span>
                <strong className="text-slate-800">{carrier.avg_time}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Dispatches Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search active dispatches by AWB or order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-slate-200"
            />
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {filteredShipments.length} Active Shipments in Transit
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No active shipments in transit. Packed orders will appear here upon carrier dispatch.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order Ref</th>
                  <th className="py-3 px-4 font-semibold">Carrier & AWB</th>
                  <th className="py-3 px-4 font-semibold">Destination</th>
                  <th className="py-3 px-4 font-semibold">Status Stage</th>
                  <th className="py-3 px-4 font-semibold text-right">Customer Tracking Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredShipments.map((s) => {
                  const orderId = s.id || s.order_id || 'ORD_000';
                  return (
                    <tr key={orderId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {orderId}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{s.delivery_partner || 'Delhivery'}</span>
                          <span className="font-mono text-[11px] text-[#0B72E7] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            {s.tracking_id || `AWB-${orderId.slice(-6)}`}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-xs">
                        {s.shipping_address || 'Bengaluru, Karnataka - 560034'}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px]">
                          {s.order_status || s.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/customer/track?orderId=${orderId}`} target="_blank">
                          <Button size="sm" variant="outline" className="h-7 px-2.5 rounded-lg text-[11px] font-semibold gap-1 border-slate-200">
                            <span>Open Tracker</span>
                            <ArrowUpRight className="h-3 w-3 text-slate-400" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
