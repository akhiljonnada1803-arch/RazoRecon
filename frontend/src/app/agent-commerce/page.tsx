'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Bot, 
  Sparkles, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  CheckCircle2, 
  Sliders, 
  BookOpenCheck, 
  ShoppingBag,
  CreditCard,
  Zap,
  ArrowRight,
  ShieldCheck,
  Code2,
  FileText,
  ExternalLink,
  PackageCheck,
  Truck,
  Building2,
  ArrowUpRight,
  Download,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { A2ATimeline } from '@/components/agent-commerce/A2ATimeline';
import { A2ADialoguePanel } from '@/components/agent-commerce/A2ADialoguePanel';
import { A2ALedgerViewer } from '@/components/agent-commerce/A2ALedgerViewer';
import { A2AScenarioSelector } from '@/components/agent-commerce/A2AScenarioSelector';
import { 
  A2APresetScenario, 
  A2ASimulationResponse, 
  A2ASimulationRequest 
} from '@/types/agent_commerce';
import { downloadOrderInvoice } from '@/lib/invoice';

export default function AgentCommercePage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario_retail_expansion');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 4x
  const [activeTab, setActiveTab] = useState<'dialogue' | 'ledger' | 'cart'>('dialogue');
  const [downloadingInvoice, setDownloadingInvoice] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Preset Scenarios
  const { data: scenarios = [] } = useQuery<A2APresetScenario[]>({
    queryKey: ['agent-commerce', 'scenarios'],
    queryFn: () => apiClient.get('/agent-commerce/scenarios'),
  });

  // 2. Fetch Simulation Data for Selected Scenario
  const { 
    data: simulation, 
    isLoading: isSimLoading, 
    refetch: runSimulation 
  } = useQuery<A2ASimulationResponse>({
    queryKey: ['agent-commerce', 'simulate', selectedScenarioId],
    queryFn: () => apiClient.post('/agent-commerce/simulate', { scenario_id: selectedScenarioId }),
  });

  // Handle Playback Interval
  useEffect(() => {
    if (isPlaying && simulation) {
      const intervalMs = 2800 / playbackSpeed;
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < simulation.steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, simulation]);

  // Reset step index when scenario changes
  const handleSelectScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const handleStepNext = () => {
    if (simulation && currentStepIndex < simulation.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const formatINR = (val: number) => {
    return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const handleDownloadInvoice = async (orderId?: string) => {
    if (!orderId) return;
    setDownloadingInvoice(true);
    try {
      await downloadOrderInvoice(orderId);
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const currentStep = simulation?.steps[currentStepIndex] || simulation?.steps[0];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#072654] via-[#0B3A7A] to-[#0B72E7] p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-blue-200 border border-white/10 shadow-inner">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Agent-to-Agent Commerce Simulator</h1>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] font-mono">
                  Autonomous Protocol
                </Badge>
              </div>
              <p className="text-xs text-blue-100/80">
                Simulate autonomous negotiation, Razorpay cryptographic settlement, and double-entry FinOps reconciliation between Buyer and Seller AI agents.
              </p>
            </div>
          </div>
        </div>

        {/* Playback Controls Toolbar */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/15 relative z-10">
          <Button
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`h-8 px-3 text-xs font-bold gap-1.5 shadow-xs ${
              isPlaying 
                ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Auto-Play</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleStepNext}
            disabled={!simulation || currentStepIndex >= simulation.steps.length - 1}
            className="h-8 px-2.5 text-xs text-white hover:bg-white/20 gap-1"
          >
            <SkipForward className="h-3.5 w-3.5" />
            <span>Step</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="h-8 px-2.5 text-xs text-white hover:bg-white/20"
            title="Reset Simulation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-white/20 mx-1" />

          {/* Speed Controls */}
          <div className="flex items-center gap-1 text-[11px] font-mono font-bold">
            {[1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-white text-[#072654] font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Scenario Selector */}
      {scenarios.length > 0 && (
        <A2AScenarioSelector
          scenarios={scenarios}
          selectedScenarioId={selectedScenarioId}
          onSelectScenario={handleSelectScenario}
          onRunSimulation={() => {
            runSimulation();
            setCurrentStepIndex(0);
            setIsPlaying(true);
          }}
          isRunning={isSimLoading}
        />
      )}

      {/* 3. Visual 6-Step Workflow Timeline */}
      {simulation && (
        <A2ATimeline
          steps={simulation.steps}
          currentStepIndex={currentStepIndex}
          onSelectStep={(idx) => {
            setCurrentStepIndex(idx);
            setIsPlaying(false);
          }}
        />
      )}

      {/* 3.5 Real System Order Live Execution Banner */}
      {simulation && simulation.created_order_number && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-[#061B30] via-[#072654] to-[#06203D] text-white p-6 shadow-xl shadow-emerald-950/20">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Left info column */}
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Real System Order Active
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {simulation.created_order_number}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ID: {simulation.created_order_id}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-300 border border-slate-600/40">
                  Razorpay UPI • Captured
                </span>
              </div>

              <h2 className="text-lg font-bold text-white tracking-tight">
                Autonomous Negotiation Concluded & Reconciled Across Systems
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                This transaction was autonomously initiated by the AI Buyer, negotiated with the AI Seller, and executed into real system state: stock deducted from Catalog DB, real order created in Merchant DB, Razorpay transaction captured, and courier dispatched with live AWB tracking.
              </p>

              {/* Logistics & Inventory Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                  <Truck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[10px]">Courier & Tracking</span>
                    <span className="font-semibold text-slate-200 text-[11px]">
                      {simulation.delivery_partner || 'BlueDart Apex'} • <span className="font-mono text-emerald-400">{simulation.tracking_id || 'TRK-LIVE'}</span>
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                  <PackageCheck className="h-4 w-4 text-blue-400 shrink-0" />
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[10px]">Inventory Status</span>
                    <span className="font-semibold text-slate-200 text-[11px]">Live Stock Reserved & Deducted</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-purple-400 shrink-0" />
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[10px]">Audit Trails</span>
                    <span className="font-semibold text-slate-200 text-[11px]">4 Immutable A2A Events Logged</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Action buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 pt-2 lg:pt-0">
              <Button
                onClick={() => handleDownloadInvoice(simulation.created_order_id)}
                disabled={downloadingInvoice}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 text-xs transition-all cursor-pointer"
              >
                {downloadingInvoice ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 text-slate-950" />
                    <span>Download GST Invoice (PDF)</span>
                  </>
                )}
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                <Link
                  href={`/customer/track?orderId=${encodeURIComponent(simulation.created_order_id || '')}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-medium text-white transition-all"
                >
                  <Truck className="h-3.5 w-3.5 text-blue-400" />
                  <span>Track in Customer Portal</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-400 ml-auto" />
                </Link>

                <Link
                  href="/merchant/orders"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-medium text-white transition-all"
                >
                  <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>View in Merchant Portal</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-400 ml-auto" />
                </Link>

                <Link
                  href="/reconciliation"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-medium text-white transition-all"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                  <span>Inspect in Admin Recon</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-400 ml-auto" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Workstation Sub-Views */}
      {simulation && currentStep && (
        <div className="space-y-4">
          {/* Sub-view Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('dialogue')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'dialogue'
                    ? 'border-[#0B72E7] text-[#0B72E7] bg-white rounded-t-xl shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                <Bot className="h-4 w-4" />
                <span>Live Agent Dialogue & Negotiation</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-100 text-[#0B72E7]">
                  {currentStep.dialogue.length} messages
                </span>
              </button>

              <button
                onClick={() => setActiveTab('ledger')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'ledger'
                    ? 'border-[#0B72E7] text-[#0B72E7] bg-white rounded-t-xl shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                <BookOpenCheck className="h-4 w-4" />
                <span>General Ledger & FinOps Reconciliation</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-100 text-purple-700">
                  Step 06
                </span>
              </button>

              <button
                onClick={() => setActiveTab('cart')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'cart'
                    ? 'border-[#0B72E7] text-[#0B72E7] bg-white rounded-t-xl shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Binding Order & Cryptographic Proof</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              Simulation ID: {simulation.simulation_id}
            </span>
          </div>

          {/* Sub-view Content */}
          {activeTab === 'dialogue' && (
            <A2ADialoguePanel
              currentStep={currentStep}
              buyerName={simulation.buyer_name}
              buyerPersona={simulation.buyer_persona}
              sellerName={simulation.seller_name}
              sellerPersona={simulation.seller_persona}
            />
          )}

          {activeTab === 'ledger' && (
            <A2ALedgerViewer
              ledger={simulation.final_ledger}
              reconciliationStatus={simulation.reconciliation_status}
              paymentDetails={simulation.final_payment}
            />
          )}

          {activeTab === 'cart' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Cart Items Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-[#072654]">Negotiated Binding Cart Items</h3>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-mono">
                    {simulation.final_cart.discount_amount > 0 
                      ? `${Math.round((simulation.final_cart.discount_amount / (simulation.final_cart.subtotal + simulation.final_cart.discount_amount)) * 100)}% Volume Tier Rebate Locked`
                      : 'Standard Pricing'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {simulation.final_cart.items.map((it, idx) => {
                    const discountPct = it.list_price > 0 
                      ? Math.round(((it.list_price - it.discounted_price) / it.list_price) * 100) 
                      : 0;
                    return (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800 block">{it.name}</span>
                          <span className="text-[11px] text-slate-400">
                            Qty: {it.qty} • List: ₹{it.list_price.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold font-mono text-emerald-600 block">
                            ₹{it.discounted_price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-mono">
                            {discountPct > 0 ? `${discountPct}% Volume Discount` : 'Full Price'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-200/80 pt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Negotiated Subtotal:</span>
                    <span className="font-mono font-semibold text-slate-800">{formatINR(simulation.final_cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>18% GST (Tax Credit Eligible):</span>
                    <span className="font-mono font-semibold text-slate-800">{formatINR(simulation.final_cart.gst_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-[#072654] border-t border-slate-200 pt-2">
                    <span>Total Order Payable:</span>
                    <span className="font-mono text-[#0B72E7]">{formatINR(simulation.final_cart.total)}</span>
                  </div>
                </div>
              </div>

              {/* Right: Payment Gateway & Signature Proof */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-[#072654]">Razorpay Test Mode Settlement Proof</h3>
                  <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px] font-mono">
                    CAPTURED
                  </Badge>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 font-mono">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Razorpay Order ID</span>
                    <span className="font-bold text-[#0B72E7] text-sm block">{simulation.final_payment.order_id}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 font-mono">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Razorpay Payment ID</span>
                    <span className="font-bold text-emerald-600 text-sm block">{simulation.final_payment.payment_id}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 font-mono">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">HMAC SHA256 Signature</span>
                    <span className="text-[11px] text-slate-700 block break-all">{simulation.final_payment.signature}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase font-mono block">FinOps Reconciliation Seal</span>
                    <p className="text-xs text-emerald-700 leading-tight">
                      Validated in memory engine. Payout deposit matches bank feed with 0 discrepancies.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: Real System State & Multi-Portal Traceability */}
            {simulation.created_order_number && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#072654]">Real System State & Multi-Portal Traceability</h3>
                      <p className="text-[11px] text-slate-500">Live order record created in Merchant DB with synchronized state across all stakeholder portals.</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-mono">
                    SYNCHRONIZED
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Customer Portal</span>
                    <span className="font-bold text-slate-800 block">Orders & Live Tracking</span>
                    <p className="text-[11px] text-slate-500">Order appears in customer order history with dispatch timeline.</p>
                    <Link
                      href={`/customer/track?orderId=${encodeURIComponent(simulation.created_order_id || '')}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B72E7] hover:underline pt-1"
                    >
                      <span>Track Shipment</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Merchant Portal</span>
                    <span className="font-bold text-slate-800 block">Order Management</span>
                    <p className="text-[11px] text-slate-500">Revenue aggregated into merchant metrics; ready for packing.</p>
                    <Link
                      href="/merchant/orders"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:underline pt-1"
                    >
                      <span>View Orders List</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Admin Console</span>
                    <span className="font-bold text-slate-800 block">Reconciliation & Audit</span>
                    <p className="text-[11px] text-slate-500">Gross ₹{simulation.final_cart.total.toLocaleString('en-IN')} reconciled with zero discrepancy.</p>
                    <Link
                      href="/reconciliation"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:underline pt-1"
                    >
                      <span>Reconciliation Grid</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Statutory Invoice</span>
                    <span className="font-bold text-slate-800 block">GST Tax Invoice PDF</span>
                    <p className="text-[11px] text-slate-500">Single-page A4 PDF formatted with 18% GST and seller GSTIN.</p>
                    <button
                      onClick={() => handleDownloadInvoice(simulation.created_order_id)}
                      disabled={downloadingInvoice}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline pt-1 cursor-pointer"
                    >
                      <Download className="h-3 w-3" />
                      <span>{downloadingInvoice ? 'Downloading...' : 'Download Invoice'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      )}
    </div>
  );
}
