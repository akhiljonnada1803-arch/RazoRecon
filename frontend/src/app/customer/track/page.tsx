'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  MapPin, 
  Phone, 
  Calendar, 
  Search, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  QrCode,
  Boxes,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const STAGES = [
  { id: 'PAYMENT_RECEIVED', title: 'Payment Received', desc: 'Instant Razorpay settlement verified' },
  { id: 'ACCEPTED', title: 'Order Accepted', desc: 'Merchant verified and allocated inventory' },
  { id: 'PICKING', title: 'Warehouse Picking', desc: 'Items picked from warehouse storage bins' },
  { id: 'PACKED', title: 'Packed & Barcoded', desc: 'Tamper-evident packaging completed' },
  { id: 'READY_FOR_PICKUP', title: 'Ready for Courier', desc: 'Staged in outbound bay awaiting carrier truck' },
  { id: 'PICKED_UP_BY_COURIER', title: 'Picked Up by Courier', desc: 'Carrier partner scanned box and assigned AWB' },
  { id: 'IN_TRANSIT', title: 'In Transit', desc: 'Moving through sorting hubs and air terminals' },
  { id: 'OUT_FOR_DELIVERY', title: 'Out For Delivery', desc: 'Assigned to local last-mile delivery rider' },
  { id: 'DELIVERED', title: 'Delivered', desc: 'Package signed and delivered to customer' }
];

export default function CustomerTrackPage() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams?.get('orderId') || '';

  const [searchQuery, setSearchQuery] = useState(initialOrderId);
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId);

  // Fetch all orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['customer-orders-all'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/merchant/orders?limit=50');
      return res?.orders || res?.items || (Array.isArray(res) ? res : []);
    },
  });

  const orders: any[] = Array.isArray(ordersData) ? ordersData : [];

  // Auto-select first order if none specified
  useEffect(() => {
    if (!selectedOrderId && orders.length > 0) {
      setSelectedOrderId(orders[0].id || orders[0].order_id || orders[0].order_number);
    }
  }, [orders, selectedOrderId]);

  const currentOrder = orders.find(
    (o) => (o.id || o.order_id || o.order_number) === selectedOrderId
  ) || orders[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const term = searchQuery.trim().toLowerCase();
    const match = orders.find(
      (o) => (o.id || o.order_id || o.order_number || '').toLowerCase().includes(term) ||
             (o.tracking_id || '').toLowerCase().includes(term) ||
             (o.awb_number || '').toLowerCase().includes(term)
    );
    if (match) {
      setSelectedOrderId(match.id || match.order_id || match.order_number);
    }
  };

  const getStageIndex = (status: string) => {
    if (status === 'PENDING_CONFIRMATION') return 0;
    if (status === 'PROCESSING') return 2;
    if (status === 'SHIPPED') return 6;
    const idx = STAGES.findIndex((s) => s.id === status);
    return idx >= 0 ? idx : 0;
  };

  const currentStatus = currentOrder?.order_status || currentOrder?.status || 'PAYMENT_RECEIVED';
  const currentStageIndex = getStageIndex(currentStatus);
  const isPickedUpOrBeyond = currentStageIndex >= 5;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Customer Experience</span>
            <span>•</span>
            <span className="text-[#0B72E7] font-bold">Logistics & Tracking</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654]">
            Order Tracking & Live Milestones
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time supply chain telemetry integrated with Delhivery, BlueDart, XpressBees, Ekart, and Shadowfax.
          </p>
        </div>

        {/* Search Order, AWB, or Tracking */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search Order ID, AWB, or Tracking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-slate-200 focus-visible:ring-blue-500"
            />
          </div>
          <Button type="submit" size="sm" className="h-9 px-4 rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold shadow-xs">
            Track
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="h-96 bg-white rounded-3xl border border-slate-200 animate-pulse p-8" />
      ) : !currentOrder ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No active tracking found</h3>
          <p className="text-xs text-slate-500">Please enter a valid Order ID or browse from your order history.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Tracking Timeline Card (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              {/* Carrier & AWB Overview Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#0B72E7] flex items-center justify-center font-bold">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[#072654]">
                        {currentOrder.delivery_partner || 'Awaiting Carrier Partner'}
                      </h2>
                      {isPickedUpOrBeyond && currentOrder.awb_number ? (
                        <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-xs font-mono font-bold">
                          {currentOrder.awb_number}
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-800 border-amber-300 text-[10px] font-mono">
                          AWB Assigned Upon Pickup
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Estimated Delivery: <strong className="text-slate-800">{currentOrder.estimated_delivery || '2-3 Business Days'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  {currentOrder.tracking_id && (
                    <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                      TRK: <strong>{currentOrder.tracking_id}</strong>
                    </span>
                  )}
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-3 py-1">
                    Live Telemetry
                  </Badge>
                </div>
              </div>

              {/* Current Checkpoint Location Callout */}
              {currentOrder.current_location && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shrink-0">
                    <Navigation className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Current Location Checkpoint</span>
                    <p className="text-xs font-semibold text-slate-800 truncate">{currentOrder.current_location}</p>
                  </div>
                </div>
              )}

              {/* Sequential Supply Chain Milestones */}
              <div className="space-y-6 py-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Supply Chain Progression ({STAGES.length} Stages)
                </h3>

                <div className="relative pl-6 space-y-7 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {STAGES.map((stage, idx) => {
                    const isCompleted = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;

                    return (
                      <div key={stage.id} className="relative flex items-start gap-4">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-6 top-0.5 h-5 w-5 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCompleted
                              ? 'bg-[#0B72E7] border-[#0B72E7] text-white shadow-xs'
                              : 'bg-white border-slate-300 text-transparent'
                          }`}
                        >
                          {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-sm font-bold ${
                                isCurrent
                                  ? 'text-[#0B72E7]'
                                  : isCompleted
                                  ? 'text-[#072654]'
                                  : 'text-slate-400'
                              }`}
                            >
                              {stage.title}
                            </h4>
                            {isCurrent && (
                              <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px] py-0">
                                Current Status
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{stage.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Timestamped Event Log */}
              {Array.isArray(currentOrder.timeline) && currentOrder.timeline.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Official Checkpoint Log
                  </h3>
                  <div className="space-y-2 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                    {currentOrder.timeline.map((evt: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 last:border-none">
                        <div>
                          <span className="font-semibold text-slate-800 block">{evt.status}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{evt.location}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0">{evt.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info Card (1 Col) */}
          <div className="space-y-6">
            {/* Package Summary */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-[#072654] pb-3 border-b border-slate-100 flex items-center gap-2">
                <Package className="h-4 w-4 text-[#0B72E7]" />
                <span>Package Summary</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Order Reference:</span>
                  <span className="font-mono font-bold text-[#072654]">{currentOrder.order_number || currentOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Total Amount:</span>
                  <span className="font-bold text-slate-800">
                    ₹{Number(currentOrder.total_amount || currentOrder.total || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Payment Status:</span>
                  <span className="text-emerald-600 font-semibold font-mono">PAID (Razorpay)</span>
                </div>
                {isPickedUpOrBeyond && currentOrder.awb_number && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">AWB Number:</span>
                    <span className="font-mono font-bold text-[#0B72E7]">{currentOrder.awb_number}</span>
                  </div>
                )}
              </div>

              {/* Shipping Address */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Delivery Address</span>
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {currentOrder.shipping_address || 'Bengaluru, Karnataka, India'}
                  </span>
                </div>
              </div>

              {/* Recipient */}
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-600">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{currentOrder.customer_phone || '+91 98765 43210'}</span>
              </div>
            </div>

            {/* Quick Switch Order List */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Recent Orders ({orders.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {orders.slice(0, 10).map((ord) => {
                  const id = ord.order_number || ord.id || ord.order_id;
                  const isSelected = (ord.id === selectedOrderId || ord.order_number === selectedOrderId);
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedOrderId(ord.id || ord.order_number)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-blue-50 border-blue-200 text-[#0B72E7] font-bold'
                          : 'bg-slate-50/70 border-slate-100 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <span className="block font-mono text-[11px]">{ord.order_number || ord.id}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{ord.order_status || 'PAYMENT_RECEIVED'}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
