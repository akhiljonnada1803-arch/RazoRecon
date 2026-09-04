'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Receipt, 
  ArrowUpRight, 
  RotateCcw,
  Search,
  Box,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['customer-orders-list'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/merchant/orders?limit=50');
      return res?.orders || res?.items || res || [];
    },
  });

  const orders: any[] = Array.isArray(ordersData) ? ordersData : [];

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
        return <Badge className="bg-amber-50 text-amber-800 border-amber-300 text-xs">Ready for Pickup</Badge>;
      case 'PACKED':
        return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">Packed</Badge>;
      case 'PICKING':
      case 'PROCESSING':
        return <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs">Warehouse Picking</Badge>;
      case 'ACCEPTED':
        return <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-xs">Confirmed</Badge>;
      case 'PAYMENT_RECEIVED':
      case 'PENDING_CONFIRMATION':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">Payment Verified</Badge>;
      case 'RETURNED':
        return <Badge className="bg-slate-100 text-slate-700 border-slate-300 text-xs">Returned</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-pink-50 text-pink-700 border-pink-200 text-xs">Refunded</Badge>;
      case 'REJECTED':
      case 'CANCELLED':
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const id = o.id || o.order_id || '';
    const cust = o.customer_name || '';
    const courier = o.delivery_partner || '';
    return id.toLowerCase().includes(searchQuery.toLowerCase()) ||
           cust.toLowerCase().includes(searchQuery.toLowerCase()) ||
           courier.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Customer Experience</span>
            <span>•</span>
            <span className="text-[#0B72E7]">Purchase History</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654]">
            My Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View order status, download tax invoices, and track live shipments end-to-end.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/customer/assistant">
            <Button className="h-10 px-4 rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold shadow-xs flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Ask AI About an Order</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by Order ID or courier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl border-slate-200 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-3xl border border-slate-200 animate-pulse p-6" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't placed any orders yet, or no orders match your search.
          </p>
          <Link href="/customer/products">
            <Button size="sm" className="rounded-xl text-xs font-semibold bg-[#0B72E7] hover:bg-[#095ec2] text-white">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const orderId = order.id || order.order_id || 'ORD_UNKNOWN';
            const totalAmount = order.total_amount || order.total || order.amount || 0;
            const items = order.items || [];
            const partner = order.delivery_partner || 'Delhivery Express';
            const trackingId = order.tracking_id || `AWB-${orderId.slice(-6)}`;
            const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }) : 'Recent';

            return (
              <div
                key={orderId}
                className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-md transition-all duration-200 space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
                      <Box className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#072654] font-mono">{orderId}</span>
                        {getStatusBadge(order.order_status || order.status || 'PROCESSING')}
                      </div>
                      <span className="text-xs text-slate-400">Placed on {dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      onClick={() => router.push(`/customer/track?orderId=${orderId}`)}
                      className="h-8 px-3 rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold shadow-2xs gap-1.5"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      <span>Track Shipment</span>
                    </Button>
                  </div>
                </div>

                {/* Body Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Items summary */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium uppercase text-[10px] font-mono">Items In Package</span>
                    <div className="text-slate-700 font-semibold">
                      {items.length > 0 ? (
                        items.map((it: any, idx: number) => (
                          <div key={idx} className="flex justify-between py-0.5">
                            <span className="truncate">{it.product_name || it.name || 'Fintech Device'} x {it.quantity || 1}</span>
                            <span className="font-mono text-slate-500">₹{((it.unit_price || it.price || 0) * (it.quantity || 1)).toLocaleString('en-IN')}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-500">POS Hardware Bundle</span>
                      )}
                    </div>
                  </div>

                  {/* Delivery partner info */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium uppercase text-[10px] font-mono">Logistics Carrier</span>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                        {partner.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block">{partner}</span>
                        <span className="font-mono text-[11px] text-[#0B72E7]">{trackingId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Total & Payment */}
                  <div className="space-y-1 md:text-right">
                    <span className="text-slate-400 font-medium uppercase text-[10px] font-mono">Total Paid</span>
                    <div className="text-lg font-bold text-[#072654]">
                      ₹{Number(totalAmount).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                      Razorpay Verified
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
