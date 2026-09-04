'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Code2
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

export default function AgentCommercePage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario_retail_expansion');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 4x
  const [activeTab, setActiveTab] = useState<'dialogue' | 'ledger' | 'cart'>('dialogue');

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Cart Items Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-[#072654]">Negotiated Binding Cart Items</h3>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-mono">
                    10% Enterprise Rebate Locked
                  </Badge>
                </div>

                <div className="space-y-3">
                  {simulation.final_cart.items.map((it, idx) => (
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
                        <span className="text-[10px] text-emerald-700 font-mono">10% Off Applied</span>
                      </div>
                    </div>
                  ))}
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
          )}
        </div>
      )}
    </div>
  );
}
