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
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  RefreshCw, 
  Zap, 
  CreditCard, 
  Layers, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Truck,
  RotateCcw,
  X,
  Check,
  Package,
  Activity
} from 'lucide-react';
import { 
  ExceptionIntelligenceResponseDTO, 
  InvestigatedExceptionDTO, 
  SeverityLevel 
} from '@/types/exceptions';
import { formatCurrency } from '@/lib/utils';

export default function CommerceExceptionCenterPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSeverity, setActiveSeverity] = useState<string>('ALL');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedException, setSelectedException] = useState<InvestigatedExceptionDTO | null>(null);
  const [executingWorkflow, setExecutingWorkflow] = useState<string | null>(null);
  const [resolutionSuccess, setResolutionSuccess] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery<ExceptionIntelligenceResponseDTO>({
    queryKey: ['exceptions-intelligence'],
    queryFn: () => apiClient.get('/exceptions'),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ exceptionId, action }: { exceptionId: string; action: string }) =>
      apiClient.post(`/exceptions/${exceptionId}/resolve`, {
        exception_id: exceptionId,
        resolution_action: action,
      }),
    onSuccess: (_, variables) => {
      setExecutingWorkflow(null);
      setResolutionSuccess(`Successfully executed workflow: "${variables.action}"`);
      queryClient.invalidateQueries({ queryKey: ['exceptions-intelligence'] });
      setTimeout(() => {
        setSelectedException(null);
        setResolutionSuccess(null);
      }, 1800);
    },
    onError: () => {
      setExecutingWorkflow(null);
    }
  });

  const exceptions: InvestigatedExceptionDTO[] = data?.exceptions || [];

  const filteredExceptions = exceptions.filter((e) => {
    const cat = e.category || e.type || '';
    const matchesSearch =
      e.exception_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.root_cause.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.order_id && e.order_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.customer_name && e.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeSeverity !== 'ALL' && e.severity !== activeSeverity) return false;
    if (activeCategory !== 'ALL' && cat !== activeCategory) return false;

    return true;
  });

  const totalExceptions = exceptions.length;
  const criticalCount = exceptions.filter((e) => e.severity === 'Critical' && e.status !== 'Resolved').length;
  const highCount = exceptions.filter((e) => e.severity === 'High' && e.status !== 'Resolved').length;
  const resolvedCount = exceptions.filter((e) => e.status === 'Resolved').length;
  const totalExposure = exceptions
    .filter((e) => e.status !== 'Resolved')
    .reduce((acc, e) => acc + (e.discrepancy_amount || e.amount || 0), 0);

  const handleExecuteWorkflow = (workflowName: string) => {
    if (!selectedException) return;
    setExecutingWorkflow(workflowName);
    resolveMutation.mutate({
      exceptionId: selectedException.exception_id,
      action: workflowName,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-300" />
                Commerce Exception Center
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <Activity className="w-3.5 h-3.5 mr-1" />
                Live Incident Workflows
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Autonomous Exception Resolution & Failure Mitigation
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Real-time detection and 1-click remediation for payment drops, order creation validation errors, shipping delays, warehouse inventory shortages, refund timeouts, and courier API failures.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl font-medium text-xs gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>{isFetching ? 'Scanning...' : 'Rescan Exceptions'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Exceptions Detected"
          value={totalExceptions.toString()}
          subtitle="Across all commerce channels"
          trend={{ value: 12.5, isPositive: false }}
          icon={AlertTriangle}
        />
        <MetricCard
          title="Critical & High Incidents"
          value={`${criticalCount + highCount} Open`}
          subtitle={`${criticalCount} Critical • ${highCount} High Priority`}
          trend={{ value: 8.0, isPositive: false }}
          icon={ShieldAlert}
        />
        <MetricCard
          title="Revenue at Risk"
          value={formatCurrency(totalExposure)}
          subtitle="Active open exposure"
          trend={{ value: 15.2, isPositive: false }}
          icon={CreditCard}
        />
        <MetricCard
          title="Autonomous Resolutions"
          value={`${resolvedCount} Resolved`}
          subtitle="100% automated resolution rate"
          trend={{ value: 96.5, isPositive: true }}
          icon={CheckCircle2}
        />
      </div>

      {/* Category & Severity Filter Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Categories' },
              { id: 'Payment Failure', label: 'Payment Failures' },
              { id: 'Shipping Delay', label: 'Shipping Delays' },
              { id: 'Inventory Shortage', label: 'Inventory Shortages' },
              { id: 'Courier API Failure', label: 'Courier API Failures' },
              { id: 'Refund Issue', label: 'Refund Issues' },
              { id: 'Order Creation Failure', label: 'Order Creation' },
            ].map((tab) => (
              <Button
                key={tab.id}
                size="sm"
                variant={activeCategory === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveCategory(tab.id)}
                className={`rounded-xl text-xs font-semibold ${
                  activeCategory === tab.id
                    ? 'bg-[#072654] text-white'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search Exception ID, Order ID, root cause..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Severity Sub-filter */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Filter Severity:</span>
          {['ALL', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setActiveSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeSeverity === sev
                  ? 'bg-blue-50 text-[#0B72E7] border border-blue-200'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Exception Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0B72E7]" />
            <h3 className="font-bold text-slate-900 text-sm">
              Active Commerce Exceptions ({filteredExceptions.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">1-Click Resolution Workflows</span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <TableRow>
                <TableHead className="py-3 px-4">Exception ID & Date</TableHead>
                <TableHead className="py-3 px-4">Category & Order</TableHead>
                <TableHead className="py-3 px-4">Customer</TableHead>
                <TableHead className="py-3 px-4">Exposure Amount</TableHead>
                <TableHead className="py-3 px-4">Severity</TableHead>
                <TableHead className="py-3 px-4">Root Cause & Resolution Plan</TableHead>
                <TableHead className="py-3 px-4">Status</TableHead>
                <TableHead className="py-3 px-4 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs divide-y divide-slate-100">
              {filteredExceptions.map((exc) => {
                const cat = exc.category || exc.type || 'Commerce Exception';
                const isResolved = exc.status === 'Resolved';

                return (
                  <TableRow key={exc.exception_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{exc.exception_id}</div>
                      <span className="text-[10px] text-slate-400">{exc.date}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        className={`text-[10px] font-bold mb-1 ${
                          cat.includes('Payment')
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : cat.includes('Shipping')
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : cat.includes('Inventory')
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : cat.includes('Courier')
                            ? 'bg-blue-50 text-[#0B72E7] border-blue-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        {cat}
                      </Badge>
                      <div className="font-mono text-[11px] text-slate-600">{exc.order_id || 'N/A'}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {exc.customer_name || 'Anonymous Buyer'}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {formatCurrency(exc.amount)}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        className={`text-[10px] font-bold ${
                          exc.severity === 'Critical'
                            ? 'bg-rose-600 text-white'
                            : exc.severity === 'High'
                            ? 'bg-amber-500 text-white'
                            : exc.severity === 'Medium'
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-500 text-white'
                        }`}
                      >
                        {exc.severity}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="text-slate-800 font-medium line-clamp-1">{exc.root_cause}</p>
                      <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{exc.action}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        className={`text-[10px] font-semibold ${
                          isResolved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isResolved ? '✓ Resolved' : '● Open'}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => setSelectedException(exc)}
                        className={`h-7 text-xs font-semibold rounded-lg gap-1 ${
                          isResolved
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            : 'bg-[#0B72E7] hover:bg-[#095ec2] text-white shadow-xs'
                        }`}
                      >
                        <span>{isResolved ? 'Audit Info' : 'Resolve Workflow'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </td>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 1-Click Resolution Modal */}
      {selectedException && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    {selectedException.exception_id} • {selectedException.category || selectedException.type}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Order: {selectedException.order_id || 'N/A'} • {selectedException.customer_name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedException(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resolutionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2 font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{resolutionSuccess}</span>
              </div>
            )}

            {/* Root Cause & Impact Box */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Root Cause Analysis
                </span>
                <p className="text-slate-800 font-medium leading-relaxed">{selectedException.root_cause}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Business & Revenue Impact
                </span>
                <p className="text-slate-700 leading-relaxed">{selectedException.impact}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Evidence Telemetry
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 font-mono text-[11px]">
                  {selectedException.evidence.map((ev, idx) => (
                    <li key={idx}>{ev}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Resolution Workflows */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0B72E7]" />
                Select Automated Resolution Workflow
              </h4>

              <div className="space-y-2">
                {(selectedException.available_workflows && selectedException.available_workflows.length > 0
                  ? selectedException.available_workflows
                  : [
                      selectedException.action,
                      'Initiate Instant RazorpayX Refund Payout',
                      'Mark as False Positive & Archive'
                    ]
                ).map((wf, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExecuteWorkflow(wf)}
                    disabled={executingWorkflow !== null || selectedException.status === 'Resolved'}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                      selectedException.status === 'Resolved' && selectedException.resolved_action === wf
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-white hover:bg-blue-50/70 border-slate-200 hover:border-blue-300 text-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-50 text-[#0B72E7] flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      {wf}
                    </span>
                    {executingWorkflow === wf ? (
                      <RefreshCw className="w-3.5 h-3.5 text-[#0B72E7] animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedException(null)}
                className="rounded-xl text-xs font-bold px-5"
              >
                Close Window
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
