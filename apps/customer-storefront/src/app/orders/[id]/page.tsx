'use client';

import React, { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  Receipt, 
  RotateCcw,
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  Building2, 
  FileText, 
  Download, 
  Calendar,
  ExternalLink,
  Package,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ReturnRequestModal } from '@/components/commerce/ReturnRequestModal';

function formatTimestamp(isoStr?: string | null) {
  if (!isoStr) return 'N/A';
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

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldPrint = searchParams.get('print') === 'true';
  const orderId = params?.id as string;

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const { data: order, isLoading, refetch } = useQuery<any>({
    queryKey: ['order-details', orderId],
    queryFn: async () => {
      const res = await apiClient.get<any>(`/customer/orders/${orderId}`);
      return res;
    },
    enabled: Boolean(orderId),
  });

  React.useEffect(() => {
    if (shouldPrint && order) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [shouldPrint, order]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-6 space-y-4">
        <div className="h-8 bg-slate-200 rounded-xl animate-pulse w-64" />
        <div className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Order Not Found</h3>
        <p className="text-xs text-slate-500">
          The requested order identifier could not be located in your purchase history.
        </p>
        <Link href="/orders">
          <Button className="w-full bg-[#0B72E7] text-white rounded-xl text-xs">
            Back to My Orders
          </Button>
        </Link>
      </div>
    );
  }

  const items = order.items || [];
  const status = order.order_status || order.status || 'PROCESSING';
  const merchant = order.merchant || {
    name: 'Acme Direct Hardware & Fintech Systems',
    gstin: '29ABCDE1234F1Z5',
    support_email: 'support@acmedirect.in',
    support_phone: '+91 80 4719 3300'
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'DELIVERED':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">Delivered</Badge>;
      case 'OUT_FOR_DELIVERY':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold">Out For Delivery</Badge>;
      case 'IN_TRANSIT':
      case 'SHIPPED':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold">In Transit</Badge>;
      case 'PACKED':
        return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-semibold">Packed</Badge>;
      case 'RETURNED':
        return <Badge className="bg-slate-100 text-slate-700 border-slate-300 text-xs font-semibold">Returned</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-pink-50 text-pink-700 border-pink-200 text-xs font-semibold">Refunded ✓</Badge>;
      default:
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs font-semibold">{st}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3">
          <Link href="/orders">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500 hover:text-slate-900 rounded-xl">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>Back to Orders</span>
            </Button>
          </Link>
          <div className="h-4 w-[1px] bg-slate-200" />
          <span className="font-mono font-bold text-slate-900 text-sm">{order.order_number || order.id}</span>
          {getStatusBadge(status)}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push(`/orders/${order.id || order.order_number}/tracking`)}
            className="h-8 px-3 rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold gap-1.5 shadow-2xs"
          >
            <Truck className="h-3.5 w-3.5" />
            <span>Live Tracking</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push(`/orders/${order.id || order.order_number}/invoice`)}
            className="h-8 px-3 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold gap-1.5"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>Tax Invoice</span>
          </Button>
        </div>
      </div>

      {/* Main Order Details Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Order Header Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-mono text-[10px] uppercase block">Order Date</span>
            <span className="font-semibold text-slate-800">{formatTimestamp(order.order_placed_at || order.created_at)}</span>
          </div>
          <div>
            <span className="text-slate-400 font-mono text-[10px] uppercase block">Payment Status</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block mt-0.5">
              PAID ({order.payment_method || 'UPI'})
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-mono text-[10px] uppercase block">Estimated Delivery</span>
            <span className="font-semibold text-slate-800">{order.estimated_delivery || 'Within 2-4 Days'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-mono text-[10px] uppercase block">Total Amount</span>
            <span className="font-mono font-extrabold text-[#072654] text-sm">
              ₹{Number(order.total_amount || order.amount || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Product Items Breakdown */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-[#072654] flex items-center justify-between">
            <span>Package Contents ({items.length} items)</span>
            <Package className="h-4 w-4 text-slate-400" />
          </h3>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {items.map((it: any, idx: number) => (
              <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.image_url || 'https://images.unsplash.com/photo-1556742049-0a67c55cb211?w=200&q=80'}
                      alt={it.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#072654]">{it.product_name || it.name || 'Hardware SKU'}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">{it.sku || 'SKU-RZP-DEFAULT'}</span>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Quantity: <strong className="text-slate-900">{it.quantity || 1}</strong>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right font-mono text-xs">
                  <span className="text-slate-400 block text-[11px]">Unit Price: ₹{Number(it.unit_price || it.price || 0).toLocaleString('en-IN')}</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ₹{((it.unit_price || it.price || 0) * (it.quantity || 1)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3-Column Detailed Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {/* Shipping Address */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <MapPin className="h-4 w-4 text-[#0B72E7]" />
              <span>Delivery Address</span>
            </div>
            <p className="font-semibold text-slate-900">{order.customer_name}</p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {order.shipping_address || 'Bangalore, Karnataka, India'}
            </p>
            <div className="text-[11px] text-slate-500 font-mono pt-1">
              Phone: {order.customer_phone || '+91 98765 43210'}
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <CreditCard className="h-4 w-4 text-[#0B72E7]" />
              <span>Payment & Invoice</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">₹{Number(order.subtotal || order.total_amount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax (18%):</span>
                <span className="font-mono font-semibold">₹{Number(order.tax || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee:</span>
                <span className="font-mono font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="font-mono">₹{Number(order.total_amount || order.amount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/orders/${order.id || order.order_number}/invoice`)}
              className="w-full mt-2 h-7 rounded-lg text-[11px] font-semibold border-slate-200 text-slate-700 hover:text-[#0B72E7] hover:bg-slate-100 gap-1.5"
            >
              <FileText className="h-3 w-3" />
              <span>View & Print GST Invoice</span>
            </Button>
          </div>

          {/* Merchant & Courier Info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Building2 className="h-4 w-4 text-[#0B72E7]" />
              <span>Merchant & Carrier</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600">
              <p className="font-semibold text-slate-800">{merchant.name}</p>
              <p className="font-mono text-[10px]">GSTIN: {merchant.gstin}</p>
              <p>Carrier: <strong className="text-slate-800">{order.delivery_partner || 'Delhivery Express'}</strong></p>
              <p className="font-mono text-[10px] text-[#0B72E7]">AWB: {order.awb_number || 'AWB-DLHV-9941'}</p>
            </div>
          </div>
        </div>

        {/* Return / Refund CTA Section */}
        {order.is_return_eligible && (
          <div className="p-5 bg-pink-50/50 rounded-2xl border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs text-pink-950 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-pink-600" />
                <span>Eligible for 15-Day Hassle-Free Returns</span>
              </h4>
              <p className="text-[11px] text-pink-800">
                If the hardware is defective or does not meet requirements, request doorstep pickup and 100% refund.
              </p>
            </div>

            <Button
              onClick={() => setIsReturnModalOpen(true)}
              className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shrink-0 shadow-2xs"
            >
              {order.return_request ? 'Track Return Status' : 'Request Return / Refund'}
            </Button>
          </div>
        )}
      </div>

      {/* Return Modal */}
      {isReturnModalOpen && (
        <ReturnRequestModal
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          order={order}
          onSuccess={() => {
            setIsReturnModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
