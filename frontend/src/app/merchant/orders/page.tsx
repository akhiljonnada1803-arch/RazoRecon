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
  Sliders,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STAGES_LIST = [
  'ALL',
  'PENDING_CONFIRMATION',
  'ACCEPTED',
  'PROCESSING',
  'PACKED',
  'COURIER_ASSIGNED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'REJECTED'
];

const COURIER_PARTNERS = [
  { name: 'Delhivery Express', prefix: 'DLV', sla: '1-2 Days' },
  { name: 'Blue Dart Air', prefix: 'BLU', sla: 'Next Day' },
  { name: 'Shiprocket Omnichannel', prefix: 'SRK', sla: '2-3 Days' },
  { name: 'Ekart Logistics', prefix: 'EKT', sla: '1-2 Days' }
];

export default function MerchantOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Courier Assignment Modal
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  const [courierOrderId, setCourierOrderId] = useState<string>('');
  const [selectedCourier, setSelectedCourier] = useState('Delhivery Express');

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

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => {
      return apiClient.put(`/merchant/orders/${orderId}/status?status=${status}`);
    },
    onMutate: async ({ orderId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['merchant', 'orders'] });
      const previousData = queryClient.getQueryData(['merchant', 'orders', statusFilter]);

      queryClient.setQueryData(['merchant', 'orders', statusFilter], (old: any) => {
        if (!old) return old;
        const updateList = (items: any[]) =>
          items.map(o =>
            (o.id === orderId || o.order_id === orderId || o.order_number === orderId)
              ? { ...o, order_status: status, status: status }
              : o
          );

        if (Array.isArray(old)) return updateList(old);
        if (old.orders) return { ...old, orders: updateList(old.orders) };
        return old;
      });

      return { previousData };
    },
    onSuccess: (_, variables) => {
      showToast('success', `Order ${variables.orderId} updated to ${variables.status.replace(/_/g, ' ')}`);
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
    },
    onError: (err: any, variables, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(['merchant', 'orders', statusFilter], context.previousData);
      }
      showToast('error', `Failed to update status for ${variables.orderId}: ${err?.message || 'Server error'}`);
    }
  });

  const assignCourierMutation = useMutation({
    mutationFn: ({ orderId, courier }: { orderId: string; courier: string }) => {
      return apiClient.put(`/merchant/orders/${orderId}/courier?courier_name=${encodeURIComponent(courier)}`);
    },
    onSuccess: (_, variables) => {
      setIsCourierModalOpen(false);
      showToast('success', `Assigned ${variables.courier} and generated live AWB for order ${variables.orderId}`);
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
    },
    onError: (err: any, variables) => {
      showToast('error', `Failed to assign courier for ${variables.orderId}: ${err?.message || 'Server error'}`);
    }
  });

  const handleOpenCourierModal = (orderId: string) => {
    setCourierOrderId(orderId);
    setIsCourierModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Delivered</Badge>;
      case 'OUT_FOR_DELIVERY':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs">Out For Delivery</Badge>;
      case 'SHIPPED':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Shipped</Badge>;
      case 'COURIER_ASSIGNED':
        return <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-xs">Courier Assigned</Badge>;
      case 'PACKED':
        return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">Packed</Badge>;
      case 'PROCESSING':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Processing</Badge>;
      case 'ACCEPTED':
        return <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-xs">Accepted</Badge>;
      case 'PENDING_CONFIRMATION':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">Pending</Badge>;
      case 'REJECTED':
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
    const term = search.toLowerCase();

    return id.toLowerCase().includes(term) ||
           cust.toLowerCase().includes(term) ||
           email.toLowerCase().includes(term) ||
           courier.toLowerCase().includes(term) ||
           tracking.toLowerCase().includes(term);
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
            <span className="text-[#0B72E7] font-bold">Supply Chain & Fulfillment</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654]">
            Orders & 7-Stage Fulfillment Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Execute deterministic order status progressions from merchant acceptance, warehouse picking, packing, courier assignment, dispatch to final delivery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="h-10 px-3 rounded-xl border-slate-200 text-xs font-semibold gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isFetching ? 'animate-spin text-[#0B72E7]' : ''}`} />
            <span>Sync Orders</span>
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
              placeholder="Search by Order ID, customer, email, or AWB tracking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-slate-200"
            />
          </div>

          {/* 7-Stage Horizontal Pipeline Filter Tabs */}
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
                  <th className="py-3.5 px-6 font-semibold">Order ID</th>
                  <th className="py-3.5 px-6 font-semibold">Customer</th>
                  <th className="py-3.5 px-6 font-semibold">Amount</th>
                  <th className="py-3.5 px-6 font-semibold">Current Stage</th>
                  <th className="py-3.5 px-6 font-semibold">Carrier / AWB</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Stage Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((order) => {
                  const orderId = order.id || order.order_id || order.order_number || 'ORD_000';
                  const currentStatus = order.order_status || order.status || 'PENDING_CONFIRMATION';
                  const amount = order.total_amount || order.total || order.amount || 0;
                  const courier = order.delivery_partner || 'Unassigned';
                  const tracking = order.tracking_id || '-';

                  return (
                    <tr key={orderId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-slate-900 block">{order.order_number || orderId}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Today'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-800 block text-xs">{order.customer_name || 'Acme Retailer'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{order.customer_email || 'buyer@acme.com'}</span>
                      </td>

                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        ₹{Number(amount).toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-6">
                        {getStatusBadge(currentStatus)}
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-700 block text-xs">{courier}</span>
                          {tracking && tracking !== '-' ? (
                            <span className="font-mono text-[10px] text-[#0B72E7] font-bold flex items-center gap-1">
                              {tracking}
                            </span>
                          ) : (
                            <span className="font-mono text-[10px] text-slate-400">Awaiting Dispatch</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 7-Stage Interactive Action Buttons */}
                          {currentStatus === 'PENDING_CONFIRMATION' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateStatusMutation.mutate({ orderId, status: 'ACCEPTED' })}
                                disabled={updateStatusMutation.isPending}
                                className="h-7 px-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold gap-1 shadow-2xs"
                              >
                                <Check className="h-3 w-3" />
                                Accept Order
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatusMutation.mutate({ orderId, status: 'REJECTED' })}
                                disabled={updateStatusMutation.isPending}
                                className="h-7 px-2.5 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold"
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          {currentStatus === 'ACCEPTED' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ orderId, status: 'PROCESSING' })}
                              disabled={updateStatusMutation.isPending}
                              className="h-7 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold gap-1 shadow-2xs"
                            >
                              Start Picking
                            </Button>
                          )}

                          {currentStatus === 'PROCESSING' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ orderId, status: 'PACKED' })}
                              disabled={updateStatusMutation.isPending}
                              className="h-7 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold gap-1 shadow-2xs"
                            >
                              Mark Packed
                            </Button>
                          )}

                          {(currentStatus === 'PACKED' || currentStatus === 'COURIER_ASSIGNED') && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenCourierModal(orderId)}
                              disabled={assignCourierMutation.isPending}
                              className="h-7 px-2.5 rounded-lg bg-[#0B72E7] hover:bg-[#095ec2] text-white text-[11px] font-semibold gap-1 shadow-2xs"
                            >
                              <Truck className="h-3 w-3" />
                              Assign Courier
                            </Button>
                          )}

                          {currentStatus === 'SHIPPED' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ orderId, status: 'OUT_FOR_DELIVERY' })}
                              disabled={updateStatusMutation.isPending}
                              className="h-7 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold gap-1 shadow-2xs"
                            >
                              Out for Delivery
                            </Button>
                          )}

                          {currentStatus === 'OUT_FOR_DELIVERY' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ orderId, status: 'DELIVERED' })}
                              disabled={updateStatusMutation.isPending}
                              className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold gap-1 shadow-2xs"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Mark Delivered
                            </Button>
                          )}

                          {currentStatus === 'DELIVERED' && (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-mono">
                              Completed ✓
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

      {/* Courier Assignment Modal */}
      {isCourierModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Assign Delivery Partner</h3>
                  <span className="text-xs text-slate-400 font-mono">Order: {courierOrderId}</span>
                </div>
              </div>
              <button
                onClick={() => setIsCourierModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select an integrated logistics partner to generate an automated Air Waybill (AWB) tracking number and dispatch this shipment:
            </p>

            <div className="space-y-2">
              {COURIER_PARTNERS.map((cp) => (
                <button
                  key={cp.name}
                  onClick={() => setSelectedCourier(cp.name)}
                  className={`w-full p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between ${
                    selectedCourier === cp.name
                      ? 'bg-blue-50 border-[#0B72E7] text-[#072654]'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80 text-slate-800'
                  }`}
                >
                  <div>
                    <span className="font-bold block">{cp.name}</span>
                    <span className="text-[10px] text-slate-500">Committed SLA: {cp.sla}</span>
                  </div>
                  {selectedCourier === cp.name && (
                    <Check className="w-4 h-4 text-[#0B72E7]" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCourierModalOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => assignCourierMutation.mutate({ orderId: courierOrderId, courier: selectedCourier })}
                disabled={assignCourierMutation.isPending}
                className="bg-[#0B72E7] hover:bg-[#095ec2] text-white rounded-xl text-xs font-bold px-4"
              >
                {assignCourierMutation.isPending ? 'Generating AWB...' : 'Confirm Dispatch & AWB'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
