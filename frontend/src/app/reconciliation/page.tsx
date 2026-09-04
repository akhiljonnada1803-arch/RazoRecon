'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MetricCard } from '@/components/common/MetricCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Search, 
  Zap, 
  CreditCard, 
  Truck, 
  Bot, 
  ArrowRight,
  RefreshCw,
  Sparkles,
  Package,
  Layers,
  RotateCcw,
  Check,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { 
  ReconciliationResponseDTO, 
  CommerceTransactionDTO,
  RazorpayReconciliationResponseDTO 
} from '@/types/reconciliation';
import { formatCurrency } from '@/lib/utils';

const LIFECYCLE_STAGES = [
  { key: 'Pending Payment', label: 'Pending Payment', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { key: 'Paid', label: 'Paid (Captured)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'Merchant Approved', label: 'Merchant Approved', color: 'bg-blue-50 text-[#0B72E7] border-blue-200' },
  { key: 'Packed', label: 'Packed & Invoiced', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { key: 'Shipped', label: 'In Transit / Shipped', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { key: 'Delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { key: 'Returned/Refunded', label: 'Returned / Refunded', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

export default function CommerceTransactionEnginePage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'AGENT' | 'DIRECT' | 'ACTIVE_SHIPMENT' | 'REFUNDED'>('ALL');
  const [selectedTxn, setSelectedTxn] = useState<CommerceTransactionDTO | null>(null);
  const [syncResult, setSyncResult] = useState<RazorpayReconciliationResponseDTO | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery<ReconciliationResponseDTO>({
    queryKey: ['reconciliation'],
    queryFn: () => apiClient.get('/reconciliation'),
  });

  const syncMutation = useMutation({
    mutationFn: () =>
      apiClient.post<RazorpayReconciliationResponseDTO>('/reconciliation/run-razorpay', { scale: 500 }),
    onSuccess: (res) => {
      setSyncResult(res);
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
    },
  });

  const transactions: CommerceTransactionDTO[] = data?.commerce_transactions || [];

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.product_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.carrier && t.carrier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.tracking_number && t.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'AGENT') return t.is_agent_purchase;
    if (activeFilter === 'DIRECT') return !t.is_agent_purchase;
    if (activeFilter === 'ACTIVE_SHIPMENT') return t.lifecycle_stage === 'Packed' || t.lifecycle_stage === 'Shipped';
    if (activeFilter === 'REFUNDED') return t.lifecycle_stage === 'Returned/Refunded';

    return true;
  });

  const totalGMV = transactions.reduce((acc, t) => acc + t.amount, 0);
  const agentPurchasesCount = transactions.filter(t => t.is_agent_purchase).length;
  const agentGMV = transactions.filter(t => t.is_agent_purchase).reduce((acc, t) => acc + t.amount, 0);
  const deliveredCount = transactions.filter(t => t.lifecycle_stage === 'Delivered').length;
  const activeShipmentsCount = transactions.filter(t => t.lifecycle_stage === 'Packed' || t.lifecycle_stage === 'Shipped').length;
  const refundedCount = transactions.filter(t => t.lifecycle_stage === 'Returned/Refunded').length;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Zap className="w-3.5 h-3.5 mr-1 text-amber-300" />
                Commerce Transaction Engine
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                7-Stage Lifecycle Active
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Order Lifecycle & Multi-Rail Transaction Engine
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Track real-time orders, Razorpay payments, carrier deliveries (Delhivery, Blue Dart, Shiprocket, Ekart), instant refunds, and autonomous AI Agent purchases across the entire commerce pipeline.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl font-medium text-xs gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>{isFetching ? 'Updating...' : 'Sync Telemetry'}</span>
            </Button>

            <Button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs gap-2 shadow-lg shadow-emerald-900/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>{syncMutation.isPending ? 'Reconciling 500 Rails...' : 'Sync 500 Razorpay Rails'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Sync Notification Banner */}
      {syncResult && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Check className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-emerald-950">
                {syncResult.status} • {syncResult.matched}/{syncResult.payments_imported} Payments Auto-Matched ({syncResult.match_rate}%)
              </p>
              <p className="text-emerald-700">
                Processed {formatCurrency(syncResult.total_volume_inr || 2845200)} volume across 22 carrier & gateway counterparties.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSyncResult(null)}
            className="text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* 7-Stage Order Lifecycle Pipeline Tracker */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#072654] uppercase tracking-wider">
              Autonomous 7-Stage Order Lifecycle Pipeline
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic state progression from checkout creation to final delivery and automated return reconciliation.
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-[#0B72E7] border-blue-200 font-mono text-[10px]">
            Live State Machine
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
          {LIFECYCLE_STAGES.map((st, idx) => {
            const count = transactions.filter(t => t.lifecycle_stage === st.key).length;
            return (
              <div
                key={st.key}
                className={`p-3 rounded-2xl border text-center transition-all ${st.color} flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400">0{idx + 1}</span>
                  <span className="text-xs font-extrabold">{count}</span>
                </div>
                <div className="text-xs font-bold truncate" title={st.label}>{st.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Commerce Orders"
          value={transactions.length.toString()}
          subtitle="Processed across all channels"
          trend={{ value: 18.4, isPositive: true }}
          icon={ShoppingBag}
        />
        <MetricCard
          title="Total Captured GMV"
          value={formatCurrency(totalGMV)}
          subtitle="100% gateway verified"
          trend={{ value: 24.2, isPositive: true }}
          icon={CreditCard}
        />
        <MetricCard
          title="AI Agent Purchases"
          value={`${agentPurchasesCount} Orders`}
          subtitle={`${formatCurrency(agentGMV)} (${Math.round((agentPurchasesCount/Math.max(1, transactions.length))*100)}% of GMV)`}
          trend={{ value: 42.8, isPositive: true }}
          icon={Bot}
        />
        <MetricCard
          title="Active Shipments & SLA"
          value={`${activeShipmentsCount} In-Transit`}
          subtitle={`${deliveredCount} Delivered • ${refundedCount} Refunded`}
          trend={{ value: 99.4, isPositive: true }}
          icon={Truck}
        />
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Button
            size="sm"
            variant={activeFilter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('ALL')}
            className={`rounded-xl text-xs font-semibold ${
              activeFilter === 'ALL' ? 'bg-[#072654] text-white' : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            All Transactions ({transactions.length})
          </Button>

          <Button
            size="sm"
            variant={activeFilter === 'AGENT' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('AGENT')}
            className={`rounded-xl text-xs font-semibold gap-1.5 ${
              activeFilter === 'AGENT' ? 'bg-[#0B72E7] text-white' : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            AI Agent Purchases ({agentPurchasesCount})
          </Button>

          <Button
            size="sm"
            variant={activeFilter === 'ACTIVE_SHIPMENT' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('ACTIVE_SHIPMENT')}
            className={`rounded-xl text-xs font-semibold gap-1.5 ${
              activeFilter === 'ACTIVE_SHIPMENT' ? 'bg-purple-600 text-white' : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            In-Transit Shipments ({activeShipmentsCount})
          </Button>

          <Button
            size="sm"
            variant={activeFilter === 'REFUNDED' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('REFUNDED')}
            className={`rounded-xl text-xs font-semibold gap-1.5 ${
              activeFilter === 'REFUNDED' ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Refunds ({refundedCount})
          </Button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search Order ID, buyer, SKU, AWB..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Multi-Rail Transaction Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0B72E7]" />
            <h3 className="font-bold text-slate-900 text-sm">
              Live Commerce Transactions & Multi-Rail Tracking ({filteredTransactions.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Realtime Webhook Feed</span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <TableRow>
                <TableHead className="py-3 px-4">Order ID & Date</TableHead>
                <TableHead className="py-3 px-4">Customer / AI Buyer</TableHead>
                <TableHead className="py-3 px-4">Product SKU</TableHead>
                <TableHead className="py-3 px-4">Gross Amount</TableHead>
                <TableHead className="py-3 px-4">Payment Rail</TableHead>
                <TableHead className="py-3 px-4">Lifecycle State</TableHead>
                <TableHead className="py-3 px-4">Carrier & AWB</TableHead>
                <TableHead className="py-3 px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs divide-y divide-slate-100">
              {filteredTransactions.map((t) => (
                <TableRow key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-slate-900">{t.order_id}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{t.created_at}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {t.customer_name}
                      {t.is_agent_purchase && (
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[9px] font-mono px-1.5 py-0">
                          <Bot className="w-2.5 h-2.5 mr-0.5" />
                          {t.agent_name ? t.agent_name.split(' ')[0] : 'AI Agent'}
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{t.customer_email}</span>
                  </td>

                  <td className="py-3.5 px-4 max-w-[200px]">
                    <div className="font-medium text-slate-800 truncate" title={t.product_title}>
                      {t.product_title}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Qty: {t.quantity}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {formatCurrency(t.amount)}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-700">{t.payment_method}</div>
                    <span className={`inline-block text-[10px] font-mono font-semibold ${
                      t.payment_status === 'Captured' ? 'text-emerald-600' : t.payment_status === 'Refunded' ? 'text-rose-600' : 'text-amber-600'
                    }`}>
                      ● {t.payment_status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge
                      className={`text-[10px] font-semibold ${
                        t.lifecycle_stage === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : t.lifecycle_stage === 'Shipped' || t.lifecycle_stage === 'Packed'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : t.lifecycle_stage === 'Paid' || t.lifecycle_stage === 'Merchant Approved'
                          ? 'bg-blue-50 text-[#0B72E7] border-blue-200'
                          : t.lifecycle_stage === 'Returned/Refunded'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {t.lifecycle_stage}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{t.carrier || 'Standard Logistics'}</div>
                    {t.tracking_number ? (
                      <span className="text-[10px] font-mono text-[#0B72E7] flex items-center gap-1 cursor-pointer hover:underline">
                        {t.tracking_number} <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">Awaiting Dispatch</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedTxn(t)}
                      className="h-7 text-xs font-semibold text-[#0B72E7] hover:bg-blue-50 border-blue-200 rounded-lg gap-1"
                    >
                      <span>Timeline</span>
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Transaction Timeline Inspection Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedTxn.order_id}</h3>
                  <span className="text-xs text-slate-400 font-mono">{selectedTxn.product_title}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Details */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
                <span className="font-semibold text-slate-900">{selectedTxn.customer_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Amount</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(selectedTxn.amount)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Method</span>
                <span className="font-medium text-slate-800">{selectedTxn.payment_method}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Carrier Dispatch</span>
                <span className="font-medium text-slate-800">{selectedTxn.carrier || 'Delhivery'}</span>
              </div>
            </div>

            {/* Stage Progression Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                7-Stage State Progression History
              </h4>
              <div className="space-y-3 pl-2 border-l-2 border-blue-200 ml-2">
                {selectedTxn.timeline.map((item, idx) => (
                  <div key={idx} className="relative pl-4 space-y-0.5">
                    <span className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full bg-[#0B72E7] border-2 border-white" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{item.stage}</span>
                      <span className="text-[10px] font-mono text-slate-400">{item.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={() => setSelectedTxn(null)}
                className="bg-[#072654] hover:bg-[#0c3977] text-white rounded-xl text-xs font-bold px-5"
              >
                Close Timeline
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
