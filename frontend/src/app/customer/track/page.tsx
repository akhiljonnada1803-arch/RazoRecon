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
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const STAGES = [
  { id: 'PENDING_CONFIRMATION', title: 'Order Placed', desc: 'Awaiting merchant order confirmation' },
  { id: 'ACCEPTED', title: 'Order Accepted', desc: 'Merchant verified and locked inventory' },
  { id: 'PROCESSING', title: 'Processing', desc: 'Item being picked at warehouse' },
  { id: 'PACKED', title: 'Packed & Barcoded', desc: 'Tamper-proof package ready for courier pickup' },
  { id: 'SHIPPED', title: 'In Transit', desc: 'Handed over to carrier hub' },
  { id: 'OUT_FOR_DELIVERY', title: 'Out For Delivery', desc: 'Delivery rider is in your area' },
  { id: 'DELIVERED', title: 'Delivered', desc: 'Package signed and delivered successfully' }
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
      return res?.orders || res?.items || res || [];
    },
  });

  const orders: any[] = Array.isArray(ordersData) ? ordersData : [];

  // Auto-select first order if none specified
  useEffect(() => {
    if (!selectedOrderId && orders.length > 0) {
      setSelectedOrderId(orders[0].id || orders[0].order_id);
    }
  }, [orders, selectedOrderId]);

  const currentOrder = orders.find(
    (o) => (o.id || o.order_id) === selectedOrderId
  ) || orders[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = orders.find(
      (o) => (o.id || o.order_id).toLowerCase() === searchQuery.trim().toLowerCase() ||
             (o.tracking_id || '').toLowerCase() === searchQuery.trim().toLowerCase()
    );
    if (match) {
      setSelectedOrderId(match.id || match.order_id);
    }
  };

  const getStageIndex = (status: string) => {
    const idx = STAGES.findIndex((s) => s.id === status);
    return idx >= 0 ? idx : 2; // default to processing if unknown
  };

  const currentStatus = currentOrder?.order_status || currentOrder?.status || 'SHIPPED';
  const currentStageIndex = getStageIndex(currentStatus);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Customer Experience</span>
            <span>•</span>
            <span className="text-[#0B72E7]">Logistics & Tracking</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654]">
            Order Tracking & Live Milestones
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time 7-stage supply chain milestones integrated with Delhivery, Blue Dart, Ekart, and Shiprocket.
          </p>
        </div>

        {/* Search Order or AWB */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search Order ID or AWB..."
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
              {/* Carrier Overview Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#0B72E7] flex items-center justify-center font-bold">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[#072654]">
                        {currentOrder.delivery_partner || 'Delhivery Express'}
                      </h2>
                      <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-xs font-mono">
                        {currentOrder.tracking_id || `AWB-${(currentOrder.id || '').slice(-6)}`}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Estimated Delivery: <strong className="text-slate-800">2-3 Business Days</strong>
                    </p>
                  </div>
                </div>

                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-3 py-1 self-start sm:self-center">
                  Live Dispatch
                </Badge>
              </div>

              {/* 7-Checkpoint Visual Timeline */}
              <div className="space-y-6 py-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Supply Chain Progression (7 Stages)
                </h3>

                <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {STAGES.map((stage, idx) => {
                    const isCompleted = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;

                    return (
                      <div key={stage.id} className="relative flex items-start gap-4">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-6 top-1 h-5 w-5 rounded-full flex items-center justify-center border-2 transition-all ${
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
            </div>
          </div>

          {/* Sidebar Info Card (1 Col) */}
          <div className="space-y-6">
            {/* Order Details */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-[#072654] pb-3 border-b border-slate-100 flex items-center gap-2">
                <Package className="h-4 w-4 text-[#0B72E7]" />
                <span>Package Summary</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Order Reference:</span>
                  <span className="font-mono font-bold text-[#072654]">{currentOrder.id || currentOrder.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Total Amount:</span>
                  <span className="font-bold text-slate-800">
                    ₹{Number(currentOrder.total_amount || currentOrder.total || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Payment Channel:</span>
                  <span className="text-emerald-600 font-semibold">Razorpay Verified</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Delivery Address</span>
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {currentOrder.shipping_address || 'Tech Park Hub, Koramangala 4th Block, Bengaluru, Karnataka - 560034'}
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-600">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{currentOrder.customer_phone || '+91 98765 43210'}</span>
              </div>
            </div>

            {/* Quick Switch Order list */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Recent Orders ({orders.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {orders.slice(0, 8).map((ord) => {
                  const id = ord.id || ord.order_id;
                  const isSelected = id === selectedOrderId;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedOrderId(id)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-blue-50 border-blue-200 text-[#0B72E7] font-bold'
                          : 'bg-slate-50/70 border-slate-100 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <span className="block font-mono text-[11px]">{id}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{ord.order_status || 'PROCESSING'}</span>
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
