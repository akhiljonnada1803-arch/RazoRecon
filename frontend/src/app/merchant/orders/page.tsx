'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Truck, 
  Package, 
  CreditCard, 
  ChevronRight, 
  ShieldCheck, 
  MapPin, 
  Phone,
  Send,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowUpRight,
  Boxes,
  ClipboardList
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const STAGES_LIST = [
  'ALL',
  'PAYMENT_RECEIVED',
  'ACCEPTED',
  'PICKING',
  'PACKED',
  'READY_FOR_PICKUP',
  'PICKED_UP_BY_COURIER',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'RETURNED'
];

export default function MerchantOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const { data: ordersData, isLoading, refetch, isFetching } = useQuery<any>({
    queryKey: ['merchant', 'orders', statusFilter],
    queryFn: async () => {
      const param = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const res = await apiClient.get<any>(`/merchant/orders${param}`);
      return res?.orders || res?.items || (Array.isArray(res) ? res : []);
    },
  });

  const orders: any[] = Array.isArray(ordersData) ? ordersData : [];

  // Merchant Action Mutations
  const acceptMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.post(`/merchant/orders/${orderId}/accept`),
    onSuccess: (_, orderId) => {
      showToast('success', `Order ${orderId} accepted successfully`);
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
    },
    onError: (err: any, orderId) => {
      showToast('error', `Failed to accept order ${orderId}: ${err?.message || 'Server error'}`);
    }
  });

  const pickingMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.post(`/merchant/orders/${orderId}/start-picking`),
    onSuccess: (_, orderId) => {
      showToast('success', `Warehouse picking initiated for ${orderId}`);
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
    },
    onError: (err: any, orderId) => {
      showToast('error', `Failed to start picking for ${orderId}: ${err?.message || 'Server error'}`);
    }
  });

  const packMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.post(`/merchant/orders/${orderId}/pack`),
    onSuccess: (_, orderId) => {
      showToast('success', `Order ${orderId} packed and barcoded`);
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
    },
    onError: (err: any, orderId) => {
      showToast('error', `Failed to pack order ${orderId}: ${err?.message || 'Server error'}`);
    }
  });

  const readyForPickupMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.post(`/merchant/orders/${orderId}/ready-for-pickup`),
    onSuccess: (_, orderId) => {
      showToast('success', `Order ${orderId} staged in dispatch bay for courier pickup`);
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
    },
    onError: (err: any, orderId) => {
      showToast('error', `Failed to mark ready for pickup ${orderId}: ${err?.message || 'Server error'}`);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.post(`/merchant/orders/${orderId}/reject`, { reason: 'Out of Stock / Merchant Rejection' }),
    onSuccess: (_, orderId) => {
      showToast('success', `Order ${orderId} rejected and refund initiated`);
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
    },
    onError: (err: any, orderId) => {
      showToast('error', `Failed to reject order ${orderId}: ${err?.message || 'Server error'}`);
    }
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
        return <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 text-xs">Picked Up by Courier</Badge>;
      case 'READY_FOR_PICKUP':
        return <Badge className="bg-amber-50 text-amber-800 border-amber-300 text-xs font-semibold">Ready for Pickup</Badge>;
      case 'PACKED':
        return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">Packed</Badge>;
      case 'PICKING':
      case 'PROCESSING':
        return <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs">Picking</Badge>;
      case 'ACCEPTED':
        return <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-xs">Accepted</Badge>;
      case 'PAYMENT_RECEIVED':
      case 'PENDING_CONFIRMATION':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">Payment Received</Badge>;
      case 'RETURNED':
        return <Badge className="bg-slate-100 text-slate-700 border-slate-300 text-xs">Returned</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-pink-50 text-pink-700 border-pink-200 text-xs">Refunded</Badge>;
      case 'REJECTED':
      case 'CANCELLED':
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const id = o.id || o.order_id || o.order_number || '';
    const cust = o.customer_name || '';
    const email = o.customer_email || '';
    const courier = o.delivery_partner || '';
    const tracking = o.tracking_id || '';
    const awb = o.awb_number || '';
    const term = search.toLowerCase();

    return id.toLowerCase().includes(term) ||
           cust.toLowerCase().includes(term) ||
           email.toLowerCase().includes(term) ||
           courier.toLowerCase().includes(term) ||
           tracking.toLowerCase().includes(term) ||
           awb.toLowerCase().includes(term);
  });

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
            <span className="text-[#0B72E7] font-bold">Orders & Warehouse Fulfillment</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654]">
            Orders & Fulfillment Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage warehouse operations: Accept orders, pick inventory, pack tamper-proof boxes, and stage for courier pickup.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/merchant/shipping">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-3.5 rounded-xl border-slate-200 text-xs font-semibold gap-1.5 text-[#072654] hover:bg-slate-50"
            >
              <Truck className="h-3.5 w-3.5 text-[#0B72E7]" />
              <span>Logistics & Fleet Hub</span>
              <ArrowUpRight className="h-3 w-3 text-slate-400" />
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

      {/* Stage Progression Pipeline Status Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by Order ID, customer, AWB or tracking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-slate-200"
            />
          </div>

          {/* Realistic E-Commerce Lifecycle Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 custom-scrollbar">
            {STAGES_LIST.map((stage) => (
              <button
                key={stage}
                onClick={() => setStatusFilter(stage)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === stage
                    ? 'bg-[#072654] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {stage.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No orders found</h3>
            <p className="text-xs text-slate-500">No orders match the current status or search filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Order ID & Date</th>
                  <th className="py-3.5 px-6 font-semibold">Customer</th>
                  <th className="py-3.5 px-6 font-semibold">Amount</th>
                  <th className="py-3.5 px-6 font-semibold">Fulfillment Stage</th>
                  <th className="py-3.5 px-6 font-semibold">Courier / AWB Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Merchant Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((order) => {
                  const orderId = order.id || order.order_id || order.order_number || 'ORD_000';
                  const currentStatus = order.order_status || order.status || 'PAYMENT_RECEIVED';
                  const amount = order.total_amount || order.total || order.amount || 0;
                  const courier = order.delivery_partner;
                  const awb = order.awb_number;
                  const tracking = order.tracking_id;

                  return (
                    <tr key={orderId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-slate-900 block">{order.order_number || orderId}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Today'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-800 block text-xs">{order.customer_name || 'Customer'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{order.customer_email || 'buyer@example.com'}</span>
                      </td>

                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        ₹{Number(amount).toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-6">
                        {getStatusBadge(currentStatus)}
                      </td>

                      <td className="py-4 px-6">
                        {awb ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-800 block text-xs">{courier}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-[#0B72E7] font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                {awb}
                              </span>
                              {tracking && (
                                <span className="font-mono text-[10px] text-slate-500">
                                  ({tracking})
                                </span>
                              )}
                            </div>
                          </div>
                        ) : currentStatus === 'READY_FOR_PICKUP' ? (
                          <span className="font-mono text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold flex items-center gap-1">
                            <Clock className="h-3 w-3 text-amber-600" />
                            Awaiting Carrier Pickup
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono italic">
                            Pre-Pickup (No AWB)
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Merchant Actions strictly according to e-commerce fulfillment */}
                          {(currentStatus === 'PAYMENT_RECEIVED' || currentStatus === 'PENDING_CONFIRMATION') && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => acceptMutation.mutate(orderId)}
                                disabled={acceptMutation.isPending}
                                className="h-7 px-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold gap-1 shadow-2xs"
                              >
                                <Check className="h-3 w-3" />
                                Accept Order
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectMutation.mutate(orderId)}
                                disabled={rejectMutation.isPending}
                                className="h-7 px-2.5 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold"
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          {currentStatus === 'ACCEPTED' && (
                            <Button
                              size="sm"
                              onClick={() => pickingMutation.mutate(orderId)}
                              disabled={pickingMutation.isPending}
                              className="h-7 px-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-semibold gap-1 shadow-2xs"
                            >
                              <ClipboardList className="h-3 w-3" />
                              Start Picking
                            </Button>
                          )}

                          {currentStatus === 'PICKING' && (
                            <Button
                              size="sm"
                              onClick={() => packMutation.mutate(orderId)}
                              disabled={packMutation.isPending}
                              className="h-7 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold gap-1 shadow-2xs"
                            >
                              <Boxes className="h-3 w-3" />
                              Mark Packed
                            </Button>
                          )}

                          {currentStatus === 'PACKED' && (
                            <Button
                              size="sm"
                              onClick={() => readyForPickupMutation.mutate(orderId)}
                              disabled={readyForPickupMutation.isPending}
                              className="h-7 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold gap-1 shadow-2xs"
                            >
                              <Package className="h-3 w-3" />
                              Mark Ready For Pickup
                            </Button>
                          )}

                          {currentStatus === 'READY_FOR_PICKUP' && (
                            <Link href={`/merchant/shipping?orderId=${orderId}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 rounded-lg border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 text-[11px] font-semibold gap-1"
                              >
                                <Truck className="h-3 w-3 text-amber-700" />
                                <span>Courier Dispatch</span>
                                <ArrowUpRight className="h-2.5 w-2.5" />
                              </Button>
                            </Link>
                          )}

                          {['PICKED_UP_BY_COURIER', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(currentStatus) && (
                            <Link href={`/customer/track?orderId=${orderId}`} target="_blank">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold gap-1"
                              >
                                <span>Track Live</span>
                                <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
                              </Button>
                            </Link>
                          )}

                          {currentStatus === 'RETURNED' && (
                            <Badge className="bg-slate-100 text-slate-700 border-slate-300 text-[10px] font-mono">
                              Returned
                            </Badge>
                          )}

                          {currentStatus === 'REFUNDED' && (
                            <Badge className="bg-pink-50 text-pink-700 border-pink-200 text-[10px] font-mono">
                              Refunded ✓
                            </Badge>
                          )}

                          {currentStatus === 'REJECTED' && (
                            <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-mono">
                              Cancelled
                            </Badge>
                          )}
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
    </div>
  );
}
