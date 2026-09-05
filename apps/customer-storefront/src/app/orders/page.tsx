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
  Sparkles,
  ChevronDown,
  ChevronUp,
  History,
  ShieldCheck,
  PackageCheck,
  Calendar,
  FileText,
  ExternalLink,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ReturnRequestModal } from '@/components/commerce/ReturnRequestModal';

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

const FILTER_TABS = [
  { id: 'ALL', label: 'All Orders' },
  { id: 'PROCESSING', label: 'Processing' },
  { id: 'PACKED', label: 'Packed' },
  { id: 'SHIPPED', label: 'Shipped / In Transit' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'CANCELLED', label: 'Cancelled' },
  { id: 'RETURNED', label: 'Returned' },
  { id: 'REFUNDED', label: 'Refunded' }
];

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<any | null>(null);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/orders');
    }
  }, [isLoading, isAuthenticated, router]);

  const { data: ordersData, isLoading: isOrdersLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['customer-orders-list', selectedFilter, searchQuery, user?.id, user?.email],
    queryFn: async () => {
      let effectiveId = user?.id || user?.email;
      let effectiveEmail = user?.email;
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('razorcommerce_user') || localStorage.getItem('razorrecon_user');
          if (raw) {
            const u = JSON.parse(raw);
            if (!effectiveId) effectiveId = u?.id || u?.email;
            if (!effectiveEmail) effectiveEmail = u?.email;
          }
        } catch (e) {}
      }

      const params: Record<string, string | undefined> = {};
      if (selectedFilter !== 'ALL') {
        params.status = selectedFilter;
      }
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (effectiveId) {
        params.user_id = effectiveId;
      }
      if (effectiveEmail) {
        params.customer_email = effectiveEmail;
      }

      const res = await apiClient.get<any>('/customer/orders', params);
      return res?.orders || res?.items || (Array.isArray(res) ? res : []);
    },
    enabled: true,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const orders: any[] = Array.isArray(ordersData) ? ordersData : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">Delivered</Badge>;
      case 'OUT_FOR_DELIVERY':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold">Out For Delivery</Badge>;
      case 'IN_TRANSIT':
      case 'SHIPPED':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold">In Transit</Badge>;
      case 'PICKED_UP_BY_COURIER':
        return <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 text-xs font-semibold">Picked Up by Courier</Badge>;
      case 'READY_FOR_PICKUP':
        return <Badge className="bg-amber-50 text-amber-800 border-amber-300 text-xs font-semibold">Ready for Pickup</Badge>;
      case 'PACKED':
        return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-semibold">Packed</Badge>;
      case 'PICKING':
      case 'PROCESSING':
        return <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs font-semibold">Warehouse Processing</Badge>;
      case 'ACCEPTED':
        return <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-xs font-semibold">Confirmed</Badge>;
      case 'PAYMENT_RECEIVED':
      case 'PENDING_CONFIRMATION':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs font-semibold">Payment Verified</Badge>;
      case 'RETURNED':
        return <Badge className="bg-slate-100 text-slate-700 border-slate-300 text-xs font-semibold">Returned</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-pink-50 text-pink-700 border-pink-200 text-xs font-semibold">Refunded ✓</Badge>;
      case 'REJECTED':
      case 'CANCELLED':
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs font-semibold">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const lastUpdatedFormatted = dataUpdatedAt ? formatTimestamp(new Date(dataUpdatedAt).toISOString()) : 'Live';

  const handleDownloadInvoice = (order: any) => {
    const orderKey = order.id || order.order_number;
    window.open(`/orders/${orderKey}/invoice`, '_blank');
  };

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0B72E7] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Sign in to view your orders</h3>
        <p className="text-xs text-slate-500">
          Track real-time shipment milestones, download GST tax invoices, and manage product returns.
        </p>
        <Link href="/login?redirect=/orders" className="inline-block w-full">
          <Button className="w-full bg-[#0B72E7] text-white font-bold rounded-xl text-xs h-10">
            Sign In to Track Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Customer Experience</span>
            <span>•</span>
            <span className="text-[#0B72E7] font-bold">Purchase History & Logistics</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654]">
            My Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View order details, track live courier dispatches, download GST invoices, and request hassle-free returns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-slate-600 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-[#0B72E7]" />
            <span>Last Updated: <strong className="text-slate-800">{lastUpdatedFormatted}</strong></span>
          </div>

          <Link href="/customer/assistant">
            <Button className="h-10 px-4 rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold shadow-xs flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Ask AI About an Order</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by Order ID, item name or AWB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-slate-200"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 custom-scrollbar">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedFilter === tab.id
                    ? 'bg-[#072654] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {isOrdersLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-3xl border border-slate-200 animate-pulse p-6" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven&apos;t placed any orders matching the &quot;{selectedFilter}&quot; filter.
          </p>
          <Link href="/products">
            <Button size="sm" className="rounded-xl text-xs font-semibold bg-[#0B72E7] hover:bg-[#095ec2] text-white">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const orderId = order.order_number || order.id || 'ORD_UNKNOWN';
            const rawId = order.id || order.order_id || orderId;
            const totalAmount = order.total_amount || order.total || order.amount || 0;
            const items = order.items || [];
            const partner = order.delivery_partner || 'Delhivery Express';
            const trackingId = order.tracking_id || `TRK-${orderId.slice(-6)}`;
            const dateStr = formatTimestamp(order.order_placed_at || order.created_at) || 'Recent';
            const status = order.order_status || order.status || 'PROCESSING';
            const isReturnEligible = order.is_return_eligible;
            const hasReturnRequest = Boolean(order.return_request);

            return (
              <div
                key={rawId}
                className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-md transition-all duration-200 space-y-5"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
                      <Box className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#072654] font-mono">{orderId}</span>
                        {getStatusBadge(status)}
                        {hasReturnRequest && (
                          <Badge className="bg-pink-50 text-pink-700 border-pink-200 text-[10px] font-mono">
                            Return: {order.return_request.return_status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Placed on {dateStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                    <Button
                      onClick={() => router.push(`/orders/${rawId}/tracking`)}
                      className="h-8 px-3 rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold shadow-2xs gap-1.5"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      <span>Track Order</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => router.push(`/orders/${rawId}`)}
                      className="h-8 px-3 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 gap-1.5"
                    >
                      <FileText className="h-3.5 w-3.5 text-slate-500" />
                      <span>View Details</span>
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => handleDownloadInvoice(order)}
                      className="h-8 px-2 text-slate-500 hover:text-[#0B72E7] text-xs font-medium gap-1"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Invoice</span>
                    </Button>
                  </div>
                </div>

                {/* Body Item Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                  {/* Items List with Thumbnails */}
                  <div className="space-y-2">
                    <span className="text-slate-400 font-medium uppercase text-[10px] font-mono">Products in Package</span>
                    <div className="space-y-2">
                      {items.length > 0 ? (
                        items.map((it: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={it.image_url || 'https://images.unsplash.com/photo-1556742049-0a67c55cb211?w=100&q=80'}
                                alt={it.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="truncate flex-1">
                              <span className="font-semibold text-slate-800 block truncate">{it.product_name || it.name || 'Fintech SKU'}</span>
                              <span className="text-[10px] text-slate-400 font-mono">Qty: {it.quantity || 1} • ₹{Number(it.unit_price || it.price || 0).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-500">Razorpay Smart POS Pro Terminal</span>
                      )}
                    </div>
                  </div>

                  {/* Carrier & Tracking */}
                  <div className="space-y-2">
                    <span className="text-slate-400 font-medium uppercase text-[10px] font-mono">Logistics & Courier</span>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">{partner}</span>
                        <Badge className="bg-blue-50 text-[#0B72E7] font-mono text-[9px]">{trackingId}</Badge>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Estimated: <strong className="text-slate-800">{order.estimated_delivery || 'Within 2-4 Days'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Payment & Return CTA */}
                  <div className="space-y-2 md:text-right flex flex-col justify-between">
                    <div>
                      <span className="text-slate-400 font-medium uppercase text-[10px] font-mono">Total Paid</span>
                      <div className="text-xl font-extrabold text-[#072654] font-mono">
                        ₹{Number(totalAmount).toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                        Razorpay {order.payment_method || 'UPI'} Verified
                      </span>
                    </div>

                    <div className="pt-2">
                      {isReturnEligible && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedReturnOrder(order)}
                          className="h-8 px-3 rounded-xl border-pink-200 text-pink-700 hover:bg-pink-50 text-xs font-semibold gap-1.5"
                        >
                          <RotateCcw className="h-3.5 w-3.5 text-pink-600" />
                          <span>{hasReturnRequest ? 'Track Return & Refund' : 'Return Item'}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Return Request Modal */}
      {selectedReturnOrder && (
        <ReturnRequestModal
          isOpen={Boolean(selectedReturnOrder)}
          onClose={() => setSelectedReturnOrder(null)}
          order={selectedReturnOrder}
          onSuccess={() => {
            setSelectedReturnOrder(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
