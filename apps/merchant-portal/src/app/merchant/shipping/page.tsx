'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  FileSpreadsheet,
  QrCode,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Navigation,
  Layers,
  Sparkles,
  Send,
  Boxes,
  RotateCcw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const CARRIER_LOGOS: Record<string, { bg: string; text: string; code: string }> = {
  'Delhivery Express': { bg: 'bg-red-50', text: 'text-red-600', code: 'DELHIVERY' },
  'BlueDart Express': { bg: 'bg-blue-50', text: 'text-blue-700', code: 'BLUEDART' },
  'XpressBees Logistics': { bg: 'bg-amber-50', text: 'text-amber-700', code: 'XPRESSBEES' },
  'Ekart Logistics': { bg: 'bg-emerald-50', text: 'text-emerald-700', code: 'EKART' },
  'Shadowfax Express': { bg: 'bg-purple-50', text: 'text-purple-700', code: 'SHADOWFAX' }
};

const TRANSIT_HUBS = [
  'Mumbai Air Cargo Terminal (BOM)',
  'Bengaluru Central Sort Facility (BLR-HUB)',
  'Gurugram Megahub Transshipment Center (DEL-NORTH)',
  'Hyderabad Central Logistics Park (HYD-AIR)',
  'Chennai Freight Station (MAA-SOUTH)',
  'Pune Automated Sorting Depot',
  'Kolkata Transshipment Center (CCU-EAST)'
];

export default function MerchantShippingPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'READY_FOR_PICKUP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED'>('ALL');
  const [selectedTimelineOrder, setSelectedTimelineOrder] = useState<any | null>(null);

  // Courier Pickup Modal State
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [pickupOrderId, setPickupOrderId] = useState<string>('');
  const [selectedCourier, setSelectedCourier] = useState('Delhivery Express');

  // Location Update Modal State
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationOrderId, setLocationOrderId] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState(TRANSIT_HUBS[0]);
  const [customLocation, setCustomLocation] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch Delivery Partners
  const { data: partnersData } = useQuery<any[]>({
    queryKey: ['merchant', 'delivery-partners'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/merchant/delivery-partners');
      return Array.isArray(res) ? res : [];
    }
  });

  const partners = Array.isArray(partnersData) && partnersData.length > 0 ? partnersData : [
    { name: 'Delhivery Express', code: 'Delhivery', prefix: 'DLV', sla: '1-2 business days', rating: 4.8, active_shipments: 14, status: 'CONNECTED' },
    { name: 'BlueDart Express', code: 'BlueDart', prefix: 'BLU', sla: 'Next Day Air', rating: 4.9, active_shipments: 18, status: 'CONNECTED' },
    { name: 'XpressBees Logistics', code: 'XpressBees', prefix: 'XPB', sla: '2-3 business days', rating: 4.7, active_shipments: 11, status: 'CONNECTED' },
    { name: 'Ekart Logistics', code: 'Ekart', prefix: 'EKT', sla: '1-2 business days', rating: 4.8, active_shipments: 15, status: 'CONNECTED' },
    { name: 'Shadowfax Express', code: 'Shadowfax', prefix: 'SFX', sla: 'Same Day / Next Day', rating: 4.6, active_shipments: 9, status: 'CONNECTED' }
  ];

  // Fetch Orders
  const { data: ordersData, isLoading, refetch, isFetching } = useQuery<any>({
    queryKey: ['merchant', 'shipping', 'orders'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/merchant/orders?limit=100');
      return res?.orders || res?.items || (Array.isArray(res) ? res : []);
    },
  });

  const orders: any[] = Array.isArray(ordersData) ? ordersData : [];

  // Mutations
  const courierPickupMutation = useMutation({
    mutationFn: ({ orderId, courier }: { orderId: string; courier: string }) => {
      return apiClient.post(`/merchant/orders/${orderId}/courier-pickup?courier_name=${encodeURIComponent(courier)}`);
    },
    onSuccess: (res: any, variables) => {
      setIsPickupModalOpen(false);
      const awb = res?.order?.awb_number || 'Generated';
      const trk = res?.order?.tracking_id || '';
      showToast('success', `Picked up by ${variables.courier}. AWB ${awb} & Tracking ID ${trk} generated!`);
      queryClient.invalidateQueries({ queryKey: ['merchant', 'shipping'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'delivery-partners'] });
    },
    onError: (err: any, variables) => {
      showToast('error', `Courier pickup failed for ${variables.orderId}: ${err?.message || 'Server error'}`);
    }
  });

  const updateLocationMutation = useMutation({
    mutationFn: ({ orderId, location }: { orderId: string; location: string }) => {
      return apiClient.post(`/merchant/orders/${orderId}/in-transit?location=${encodeURIComponent(location)}`);
    },
    onSuccess: (_, variables) => {
      setIsLocationModalOpen(false);
      showToast('success', `Shipment ${variables.orderId} location checkpoint updated to ${variables.location}`);
      queryClient.invalidateQueries({ queryKey: ['merchant', 'shipping'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
    },
    onError: (err: any, variables) => {
      showToast('error', `Failed to update location for ${variables.orderId}: ${err?.message || 'Server error'}`);
    }
  });

  const outForDeliveryMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.post(`/merchant/orders/${orderId}/out-for-delivery`),
    onSuccess: (_, orderId) => {
      showToast('success', `Order ${orderId} is now Out for Delivery with local rider`);
      queryClient.invalidateQueries({ queryKey: ['merchant', 'shipping'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
    },
    onError: (err: any, orderId) => {
      showToast('error', `Failed to mark Out for Delivery: ${err?.message || 'Server error'}`);
    }
  });

  const deliverMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.post(`/merchant/orders/${orderId}/deliver`),
    onSuccess: (_, orderId) => {
      showToast('success', `Order ${orderId} delivered and signed successfully`);
      queryClient.invalidateQueries({ queryKey: ['merchant', 'shipping'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
    },
    onError: (err: any, orderId) => {
      showToast('error', `Failed to mark delivered: ${err?.message || 'Server error'}`);
    }
  });

  const returnMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.post(`/merchant/orders/${orderId}/return?reason=Customer%20Return%20Initiated`),
    onSuccess: (_, orderId) => {
      showToast('success', `Return process initiated for ${orderId}`);
      queryClient.invalidateQueries({ queryKey: ['merchant', 'shipping'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
    },
    onError: (err: any, orderId) => {
      showToast('error', `Failed to process return: ${err?.message || 'Server error'}`);
    }
  });

  // Filter logistics shipments
  const logisticsShipments = orders.filter(o => 
    ['READY_FOR_PICKUP', 'PICKED_UP_BY_COURIER', 'IN_TRANSIT', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED'].includes(o.order_status || o.status)
  );

  const readyForPickupQueue = orders.filter(o => (o.order_status || o.status) === 'READY_FOR_PICKUP');

  const filteredShipments = logisticsShipments.filter(s => {
    const status = s.order_status || s.status || '';
    if (activeTab === 'READY_FOR_PICKUP' && status !== 'READY_FOR_PICKUP') return false;
    if (activeTab === 'IN_TRANSIT' && !['PICKED_UP_BY_COURIER', 'IN_TRANSIT', 'SHIPPED'].includes(status)) return false;
    if (activeTab === 'OUT_FOR_DELIVERY' && status !== 'OUT_FOR_DELIVERY') return false;
    if (activeTab === 'DELIVERED' && status !== 'DELIVERED') return false;

    const id = s.id || s.order_id || s.order_number || '';
    const courier = s.delivery_partner || '';
    const awb = s.awb_number || '';
    const tracking = s.tracking_id || '';
    const loc = s.current_location || '';
    const cust = s.customer_name || '';
    const term = search.toLowerCase();

    return id.toLowerCase().includes(term) ||
           courier.toLowerCase().includes(term) ||
           awb.toLowerCase().includes(term) ||
           tracking.toLowerCase().includes(term) ||
           loc.toLowerCase().includes(term) ||
           cust.toLowerCase().includes(term);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Delivered</Badge>;
      case 'OUT_FOR_DELIVERY':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs">Out For Delivery</Badge>;
      case 'IN_TRANSIT':
      case 'SHIPPED':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">In Transit</Badge>;
      case 'PICKED_UP_BY_COURIER':
        return <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 text-xs">Picked Up</Badge>;
      case 'READY_FOR_PICKUP':
        return <Badge className="bg-amber-50 text-amber-800 border-amber-300 text-xs">Ready for Pickup</Badge>;
      case 'RETURNED':
        return <Badge className="bg-slate-100 text-slate-700 border-slate-300 text-xs">Returned</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const handleOpenPickupModal = (orderId: string) => {
    setPickupOrderId(orderId);
    setIsPickupModalOpen(true);
  };

  const handleOpenLocationModal = (orderId: string, currentLoc?: string) => {
    setLocationOrderId(orderId);
    setSelectedLocation(currentLoc || TRANSIT_HUBS[0]);
    setIsLocationModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Toast Notification Alert Banner */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl border shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Merchant Operations</span>
            <span>•</span>
            <span className="text-[#0B72E7] font-bold">Logistics & Fleet</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654]">
            Shipping & Courier Logistics Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Multi-carrier dispatch operations: Simulate courier pickup, generate live AWBs, track transshipment hubs, and manage last-mile deliveries across 5 partner fleets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/merchant/orders">
            <Button variant="outline" size="sm" className="h-10 px-3.5 rounded-xl border-slate-200 text-xs font-semibold gap-1.5 text-[#072654]">
              <Package className="h-3.5 w-3.5 text-[#0B72E7]" />
              <span>Orders Center</span>
            </Button>
          </Link>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="h-10 px-3 rounded-xl border-slate-200 text-xs font-semibold gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isFetching ? 'animate-spin text-[#0B72E7]' : ''}`} />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {/* 5 Demo Courier Partner Fleet Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {partners.map((partner) => {
          const style = CARRIER_LOGOS[partner.name] || { bg: 'bg-blue-50', text: 'text-blue-700', code: 'LOGISTICS' };
          return (
            <div key={partner.name} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className={`h-8 w-8 rounded-xl ${style.bg} ${style.text} flex items-center justify-center font-bold text-xs`}>
                  <Truck className="h-4 w-4" />
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                  API Connected
                </Badge>
              </div>

              <div>
                <h3 className="font-bold text-xs text-[#072654] truncate">{partner.name}</h3>
                <span className="text-[10px] text-slate-400 font-mono">SLA: {partner.sla}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Active Fleet</span>
                  <strong className="text-slate-800 font-mono">{partner.active_shipments || 0} pkgs</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Rating</span>
                  <strong className="text-emerald-700 font-mono">★ {partner.rating || 4.8}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Outbound Dispatch Queue (Awaiting Courier Pickup) */}
      {readyForPickupQueue.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Boxes className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-amber-950">
                  Outbound Pickup Bay ({readyForPickupQueue.length} Packages Awaiting Courier Vehicle)
                </h2>
                <p className="text-[11px] text-amber-700">
                  Packed boxes staged in warehouse dock. Simulate courier partner scanning and live AWB generation.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {readyForPickupQueue.slice(0, 6).map((item) => {
              const orderId = item.id || item.order_id || item.order_number;
              return (
                <div key={orderId} className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-2xs flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-xs text-slate-900 block">{item.order_number || orderId}</span>
                    <span className="text-[11px] text-slate-600 font-medium block truncate max-w-[150px]">{item.customer_name}</span>
                    <span className="text-[10px] text-amber-700 font-mono block">₹{Number(item.total_amount).toLocaleString('en-IN')} • Ready for Pickup</span>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleOpenPickupModal(orderId)}
                    className="h-8 px-3 rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-[11px] font-semibold gap-1.5 shrink-0 shadow-2xs"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>Courier Pickup</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Dispatches & Fleet Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by AWB, tracking, courier, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-slate-200"
            />
          </div>

          {/* Tab Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {(['ALL', 'READY_FOR_PICKUP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-[#072654] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {tab.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <Truck className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">No active shipments match this filter.</p>
            <p>Orders will appear here once marked packed and ready for pickup.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order Ref</th>
                  <th className="py-3 px-4 font-semibold">Courier Partner</th>
                  <th className="py-3 px-4 font-semibold">AWB Number</th>
                  <th className="py-3 px-4 font-semibold">Tracking ID</th>
                  <th className="py-3 px-4 font-semibold">Current Location Checkpoint</th>
                  <th className="py-3 px-4 font-semibold">ETA</th>
                  <th className="py-3 px-4 font-semibold">Delivery Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Courier Simulation Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredShipments.map((s) => {
                  const orderId = s.id || s.order_id || s.order_number || 'ORD_000';
                  const currentStatus = s.order_status || s.status;
                  const courier = s.delivery_partner;
                  const awb = s.awb_number;
                  const tracking = s.tracking_id;
                  const loc = s.current_location || 'Central Fulfillment Dock';
                  const eta = s.estimated_delivery || '2 Days';

                  return (
                    <tr key={orderId} className="hover:bg-slate-50/80 transition-colors">
                      {/* Order Ref */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {s.order_number || orderId}
                      </td>

                      {/* Courier Partner */}
                      <td className="py-3.5 px-4">
                        {courier ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800">{courier}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-700 font-mono bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Awaiting Pickup
                          </span>
                        )}
                      </td>

                      {/* AWB Number */}
                      <td className="py-3.5 px-4 font-mono">
                        {awb ? (
                          <span className="font-bold text-[#0B72E7] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[11px]">
                            {awb}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">Pending Pickup</span>
                        )}
                      </td>

                      {/* Tracking ID */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {tracking ? (
                          <span>{tracking}</span>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">-</span>
                        )}
                      </td>

                      {/* Current Location */}
                      <td className="py-3.5 px-4 max-w-xs truncate">
                        <div className="flex items-center gap-1 text-slate-700">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="text-[11px] font-medium truncate">{loc}</span>
                        </div>
                      </td>

                      {/* ETA */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {eta}
                      </td>

                      {/* Delivery Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(currentStatus)}
                      </td>

                      {/* Courier Simulation Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Pickup trigger if READY_FOR_PICKUP */}
                          {currentStatus === 'READY_FOR_PICKUP' && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenPickupModal(orderId)}
                              className="h-7 px-2.5 rounded-lg bg-[#0B72E7] hover:bg-[#095ec2] text-white text-[11px] font-semibold gap-1 shadow-2xs"
                            >
                              <QrCode className="h-3 w-3" />
                              Pickup & Scan AWB
                            </Button>
                          )}

                          {/* 2. In-Transit Location updater if PICKED_UP_BY_COURIER or IN_TRANSIT */}
                          {(currentStatus === 'PICKED_UP_BY_COURIER' || currentStatus === 'IN_TRANSIT' || currentStatus === 'SHIPPED') && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenLocationModal(orderId, loc)}
                                className="h-7 px-2.5 rounded-lg border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 text-[11px] font-semibold gap-1"
                              >
                                <Navigation className="h-3 w-3" />
                                Update Hub
                              </Button>

                              <Button
                                size="sm"
                                onClick={() => outForDeliveryMutation.mutate(orderId)}
                                disabled={outForDeliveryMutation.isPending}
                                className="h-7 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold gap-1 shadow-2xs"
                              >
                                Out for Delivery
                              </Button>
                            </>
                          )}

                          {/* 3. Mark Delivered if OUT_FOR_DELIVERY */}
                          {currentStatus === 'OUT_FOR_DELIVERY' && (
                            <Button
                              size="sm"
                              onClick={() => deliverMutation.mutate(orderId)}
                              disabled={deliverMutation.isPending}
                              className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold gap-1 shadow-2xs"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Mark Delivered
                            </Button>
                          )}

                          {/* 4. Return simulation */}
                          {currentStatus === 'DELIVERED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => returnMutation.mutate(orderId)}
                              disabled={returnMutation.isPending}
                              className="h-7 px-2 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-semibold gap-1"
                            >
                              <RotateCcw className="h-2.5 w-2.5 text-slate-400" />
                              Return
                            </Button>
                          )}

                          {/* Timeline Drawer Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedTimelineOrder(s)}
                            className="h-7 px-2 rounded-lg text-slate-600 hover:bg-slate-100 text-[11px] font-semibold"
                            title="View Milestone Timeline"
                          >
                            <Clock className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Courier Pickup Simulation Modal */}
      {isPickupModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#072654]">Simulate Courier Pickup</h3>
                  <p className="text-[11px] text-slate-400">Order: {pickupOrderId}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPickupModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select the courier partner vehicle accepting the shipment at the dispatch bay. This will generate the official <strong>AWB Number</strong> and <strong>Tracking ID</strong>.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Courier Partner Fleet</label>
              <div className="grid grid-cols-1 gap-2">
                {partners.map((partner) => (
                  <button
                    key={partner.name}
                    type="button"
                    onClick={() => setSelectedCourier(partner.name)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedCourier === partner.name
                        ? 'border-[#0B72E7] bg-blue-50/50 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{partner.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">SLA: {partner.sla} • Prefix: {partner.prefix}</span>
                    </div>
                    {selectedCourier === partner.name && (
                      <CheckCircle2 className="w-4 h-4 text-[#0B72E7]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPickupModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => courierPickupMutation.mutate({ orderId: pickupOrderId, courier: selectedCourier })}
                disabled={courierPickupMutation.isPending}
                className="rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold gap-1 shadow-xs"
              >
                <QrCode className="h-3.5 w-3.5" />
                {courierPickupMutation.isPending ? 'Generating AWB...' : 'Confirm Pickup & Generate AWB'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* In-Transit Location Update Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#072654]">Update In-Transit Hub Scan</h3>
                  <p className="text-[11px] text-slate-400">Order: {locationOrderId}</p>
                </div>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">Select Transshipment Hub Facility</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {TRANSIT_HUBS.map((hub) => (
                  <button
                    key={hub}
                    type="button"
                    onClick={() => { setSelectedLocation(hub); setCustomLocation(''); }}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                      selectedLocation === hub && !customLocation
                        ? 'border-purple-600 bg-purple-50/60 text-purple-900 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span>{hub}</span>
                    {selectedLocation === hub && !customLocation && <Check className="h-3.5 w-3.5 text-purple-700" />}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Or Enter Custom Hub Checkpoint</label>
                <Input
                  type="text"
                  placeholder="e.g. Surat Secondary Sorting Terminal"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="h-8 text-xs rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLocationModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => updateLocationMutation.mutate({ 
                  orderId: locationOrderId, 
                  location: customLocation.trim() || selectedLocation 
                })}
                disabled={updateLocationMutation.isPending}
                className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold gap-1 shadow-xs"
              >
                <Check className="h-3.5 w-3.5" />
                {updateLocationMutation.isPending ? 'Updating...' : 'Record Hub Checkpoint'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Shipment Timeline Modal */}
      {selectedTimelineOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#072654]">
                    Shipment Timeline • {selectedTimelineOrder.order_number || selectedTimelineOrder.id}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Carrier: {selectedTimelineOrder.delivery_partner || 'Awaiting Partner'} • AWB: {selectedTimelineOrder.awb_number || 'Pending Pickup'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTimelineOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline Milestones */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar py-2">
              {Array.isArray(selectedTimelineOrder.timeline) && selectedTimelineOrder.timeline.length > 0 ? (
                selectedTimelineOrder.timeline.map((event: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    {idx < selectedTimelineOrder.timeline.length - 1 && (
                      <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-slate-200" />
                    )}
                    <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 z-10">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-0.5 pb-3">
                      <p className="text-xs font-bold text-slate-900">{event.status}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span>{event.time}</span>
                        <span>•</span>
                        <span className="text-[#0B72E7]">{event.location}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No timeline events recorded yet.</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link href={`/customer/track?orderId=${selectedTimelineOrder.id || selectedTimelineOrder.order_id}`} target="_blank">
                <Button size="sm" variant="outline" className="text-xs font-semibold gap-1 border-slate-200">
                  <span>Open Customer Tracking View</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </Button>
              </Link>

              <Button
                size="sm"
                onClick={() => setSelectedTimelineOrder(null)}
                className="rounded-xl bg-[#072654] text-white text-xs font-semibold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
