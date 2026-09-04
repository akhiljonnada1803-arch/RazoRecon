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
  X
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
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'REJECTED'
];

const COURIER_PARTNERS = [
  'Delhivery Express',
  'Blue Dart Express',
  'Shiprocket Air',
  'Ekart Logistics'
];

export default function MerchantOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Courier Assignment Modal
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  const [courierOrderId, setCourierOrderId] = useState<string>('');
  const [selectedCourier, setSelectedCourier] = useState('Delhivery Express');

  const { data: ordersData, isLoading } = useQuery<any>({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
    }
  });

  const assignCourierMutation = useMutation({
    mutationFn: ({ orderId, courier }: { orderId: string; courier: string }) => {
      return apiClient.put(`/merchant/orders/${orderId}/courier?courier_name=${encodeURIComponent(courier)}`);
    },
    onSuccess: () => {
      setIsCourierModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
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
    const id = o.id || o.order_id || '';
    const cust = o.customer_name || '';
    const email = o.customer_email || '';
    const courier = o.delivery_partner || '';
    const term = search.toLowerCase();

    return id.toLowerCase().includes(term) ||
           cust.toLowerCase().includes(term) ||
           email.toLowerCase().includes(term) ||
           courier.toLowerCase().includes(term);
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Merchant Operations</span>
            <span>•</span>
            <span className="text-[#0B72E7]">Supply Chain & Fulfillment</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654]">
            7-Stage Order Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage transitions across Pending Confirmation, Accepted, Processing, Packed, Shipped, Out for Delivery, and Delivered.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold bg-blue-50 text-[#0B72E7] px-3 py-1.5 rounded-xl border border-blue-200">
          <Truck className="h-4 w-4" />
          <span>4 Integrated Couriers</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by Order ID, buyer name, or AWB..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-slate-200"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 custom-scrollbar">
            {STAGES_LIST.map((stage) => {
              const label = stage === 'ALL' ? 'All Orders' : stage.replace('_', ' ').toLowerCase();
              return (
                <button
                  key={stage}
                  onClick={() => setStatusFilter(stage)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                    statusFilter === stage
                      ? 'bg-[#0B72E7] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No orders found</h3>
            <p className="text-xs text-slate-500">No orders match the current status filter.</p>
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
                  const orderId = order.id || order.order_id || 'ORD_000';
                  const currentStatus = order.order_status || order.status || 'PENDING_CONFIRMATION';
                  const amount = order.total_amount || order.total || order.amount || 0;
                  const courier = order.delivery_partner || 'Unassigned';
                  const tracking = order.tracking_id || '-';

                  return (
                    <tr key={orderId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-slate-900 block">{orderId}</span>
                        <span className="text-[10px] text-slate-400">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Today'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-800 block text-xs">{order.customer_name || 'Acme Retailer'}</span>
                        <span className="text-[10px] text-slate-400">{order.customer_email || 'buyer@acme.com'}</span>
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
                          <span className="font-mono text-[10px] text-[#0B72E7]">{tracking}</span>
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
                                className="h-7 px-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold gap-1"
                              >
                                <Check className="h-3 w-3" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatusMutation.mutate({ orderId, status: 'REJECTED' })}
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
                              className="h-7 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold gap-1"
                            >
                              Start Picking
                            </Button>
                          )}

                          {currentStatus === 'PROCESSING' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ orderId, status: 'PACKED' })}
                              className="h-7 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold gap-1"
                            >
                              Mark Packed
                            </Button>
                          )}

                          {currentStatus === 'PACKED' && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenCourierModal(orderId)}
                              className="h-7 px-2.5 rounded-lg bg-[#0B72E7] hover:bg-[#095ec2] text-white text-[11px] font-semibold gap-1"
                            >
                              <Truck className="h-3 w-3" />
                              Assign Courier
                            </Button>
                          )}

                          {currentStatus === 'SHIPPED' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ orderId, status: 'OUT_FOR_DELIVERY' })}
                              className="h-7 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold gap-1"
                            >
                              Out for Delivery
                            </Button>
                          )}

                          {currentStatus === 'OUT_FOR_DELIVERY' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ orderId, status: 'DELIVERED' })}
                              className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Delivered
                            </Button>
                          )}

                          {currentStatus === 'DELIVERED' && (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                              Completed
                            </Badge>
                          )}

                          {currentStatus === 'REJECTED' && (
                            <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#072654] flex items-center gap-2">
                <Truck className="h-4.5 w-4.5 text-[#0B72E7]" />
                <span>Assign Carrier & Dispatch</span>
              </h3>
              <button
                onClick={() => setIsCourierModalOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select a logistics carrier to generate live AWB tracking number and advance order to <strong>SHIPPED</strong> stage.
            </p>

            <div className="space-y-2">
              {COURIER_PARTNERS.map((carrier) => (
                <button
                  key={carrier}
                  onClick={() => setSelectedCourier(carrier)}
                  className={`w-full p-3 rounded-2xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    selectedCourier === carrier
                      ? 'border-[#0B72E7] bg-blue-50/50 text-[#0B72E7]'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Truck className="h-4 w-4 text-slate-400" />
                    <span>{carrier}</span>
                  </div>
                  {selectedCourier === carrier && <Check className="h-4 w-4 text-[#0B72E7]" />}
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
                disabled={assignCourierMutation.isPending}
                onClick={() => assignCourierMutation.mutate({ orderId: courierOrderId, courier: selectedCourier })}
                className="rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold"
              >
                {assignCourierMutation.isPending ? 'Dispatching...' : 'Dispatch Package'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
