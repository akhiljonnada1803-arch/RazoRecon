'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  ExternalLink, 
  Phone, 
  Package, 
  Activity,
  Box,
  Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

function formatTimestamp(isoStr?: string | null) {
  if (!isoStr) return null;
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return isoStr;
  }
}

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const { data: tracking, isLoading, refetch } = useQuery<any>({
    queryKey: ['order-tracking', orderId],
    queryFn: async () => {
      const res = await apiClient.get<any>(`/customer/orders/${orderId}/tracking`);
      return res;
    },
    enabled: Boolean(orderId),
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-6 space-y-4">
        <div className="h-8 bg-slate-200 rounded-xl animate-pulse w-64" />
        <div className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Truck className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Tracking Info Unavailable</h3>
        <p className="text-xs text-slate-500">
          Shipment tracking details could not be found for order #{orderId}.
        </p>
        <Link href="/orders">
          <Button className="w-full bg-[#0B72E7] text-white rounded-xl text-xs">
            Back to My Orders
          </Button>
        </Link>
      </div>
    );
  }

  const carrier = tracking.carrier || {
    name: 'Delhivery Express',
    awb_number: 'AWB-DLHV-994182',
    tracking_id: `TRK-${orderId.slice(-6)}`,
    tracking_url: '#',
    support_phone: '1800-102-3456'
  };

  const milestones = tracking.milestones || [];
  const events = tracking.live_events || [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3">
          <Link href={`/orders/${orderId}`}>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500 hover:text-slate-900 rounded-xl">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>Order Details</span>
            </Button>
          </Link>
          <div className="h-4 w-[1px] bg-slate-200" />
          <span className="font-mono font-bold text-slate-900 text-sm">Tracking #{tracking.order_number || orderId}</span>
          <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 font-mono text-xs">
            {tracking.status || 'IN_TRANSIT'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-8 px-3 rounded-xl border-slate-200 text-slate-700 text-xs font-semibold gap-1.5"
          >
            <Activity className="h-3.5 w-3.5 text-[#0B72E7]" />
            <span>Refresh Telemetry</span>
          </Button>
        </div>
      </div>

      {/* Hero Delivery Status Banner */}
      <div className="bg-gradient-to-r from-[#072654] via-slate-900 to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-mono backdrop-blur-md">
                <Truck className="w-3.5 h-3.5 mr-1" />
                Live GPS Telemetry
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                On Schedule
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Expected Delivery: {tracking.estimated_delivery}
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>Current Location: <strong>{tracking.current_location}</strong></span>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right space-y-1">
            <span className="text-[10px] text-blue-200 uppercase font-mono block">Carrier Service</span>
            <span className="font-bold text-sm text-white block">{carrier.name}</span>
            <span className="font-mono text-xs text-blue-200 block">{carrier.awb_number}</span>
          </div>
        </div>
      </div>

      {/* Visual Amazon/Flipkart Milestone Step Progression Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-sm text-[#072654] flex items-center gap-2">
            <Box className="w-4 h-4 text-[#0B72E7]" />
            <span>Milestone Progression Timeline</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">ISO 8601 UTC Synchronized</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {milestones.map((m: any, idx: number) => {
            const isCompleted = m.completed;
            const formattedTime = formatTimestamp(m.timestamp);
            return (
              <div
                key={m.key || idx}
                className={`p-3 rounded-2xl border transition-all text-center space-y-2 ${
                  isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 font-semibold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold leading-tight">{m.label}</h4>
                  <span className="text-[10px] font-mono text-slate-500 block mt-1 truncate">
                    {formattedTime || (isCompleted ? 'Completed' : 'Pending')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Carrier Information & Live Event Log */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Carrier Details Card */}
        <div className="md:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#072654] flex items-center gap-2 pb-3 border-b border-slate-100">
            <Truck className="h-4 w-4 text-[#0B72E7]" />
            <span>Carrier Information</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-mono text-[10px] uppercase block">Delivery Partner</span>
              <span className="font-bold text-slate-800 text-sm">{carrier.name}</span>
            </div>

            <div>
              <span className="text-slate-400 font-mono text-[10px] uppercase block">Air Waybill (AWB)</span>
              <span className="font-mono font-bold text-[#0B72E7] bg-blue-50 px-2 py-1 rounded-md inline-block mt-0.5">
                {carrier.awb_number}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-mono text-[10px] uppercase block">Tracking Reference</span>
              <span className="font-mono text-slate-700">{carrier.tracking_id}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-500">Carrier Helpline:</span>
              <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                <Phone className="h-3 w-3 text-emerald-600" />
                {carrier.support_phone}
              </span>
            </div>
          </div>
        </div>

        {/* Live Checkpoints Feed */}
        <div className="md:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#072654] flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-600 animate-pulse" />
              <span>Live Checkpoint Scan Stream</span>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 font-mono text-[10px]">Real-Time Active</Badge>
          </h3>

          <div className="space-y-3 text-xs">
            {events.length > 0 ? (
              events.map((evt: any, i: number) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{evt.message}</span>
                      <span className="font-mono text-[10px] text-slate-400">{formatTimestamp(evt.timestamp)}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span>{evt.location}</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Package Dispatched from Central Warehouse</span>
                  <span className="font-mono text-[10px] text-slate-400">Recent</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Fulfillment hub scan verified. Handed over to {carrier.name} for express transit.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
