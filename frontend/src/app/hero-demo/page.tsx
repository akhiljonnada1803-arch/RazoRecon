'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import {
  HeroDemoState,
  HeroScenario,
  HeroStepData,
} from '@/types/hero_demo';
import { HeroTimelineStepper } from '@/components/hero-demo/HeroTimelineStepper';
import { HeroPlaybackControls } from '@/components/hero-demo/HeroPlaybackControls';
import { HeroStepDisplay } from '@/components/hero-demo/HeroStepDisplay';
import { HeroAuditReasoningPanel } from '@/components/hero-demo/HeroAuditReasoningPanel';
import {
  Sparkles,
  Zap,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Building2,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function HeroDemoPage() {
  const [scenarios, setScenarios] = useState<HeroScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('mumbai_retail_expansion');
  const [demoState, setDemoState] = useState<HeroDemoState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [stepLoading, setStepLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 4x

  // Reference for auto-play timer
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch scenarios and initial state
  const fetchScenariosAndState = async (scenarioId?: string) => {
    try {
      setLoading(true);
      const targetScenario = scenarioId || selectedScenarioId;
      
      const [scenariosRes, stateRes] = await Promise.all([
        apiClient.get<HeroScenario[]>('/hero-demo/scenarios'),
        apiClient.get<HeroDemoState>(`/hero-demo/state?scenario_id=${targetScenario}`),
      ]);

      if (scenariosRes) {
        setScenarios(scenariosRes);
      }
      if (stateRes) {
        setDemoState(stateRes);
      }
    } catch (err) {
      console.error('Failed to fetch Hero Demo state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenariosAndState(selectedScenarioId);
  }, [selectedScenarioId]);

  // Handle Step Forward
  const handleNextStep = async () => {
    if (!demoState || demoState.current_step >= 10 || stepLoading) return;
    try {
      setStepLoading(true);
      const targetStep = demoState.current_step + 1;
      const res = await apiClient.post<HeroDemoState>('/hero-demo/step', {
        scenario_id: selectedScenarioId,
        step_number: targetStep,
      });
      if (res) {
        setDemoState(res);
        if (res.is_completed) {
          setIsPlaying(false);
        }
      }
    } catch (err) {
      console.error('Failed to execute next step:', err);
      setIsPlaying(false);
    } finally {
      setStepLoading(false);
    }
  };

  // Handle Step Backward / Go to specific step
  const handleGoToStep = async (stepNum: number) => {
    if (stepLoading || stepNum === demoState?.current_step) return;
    try {
      setStepLoading(true);
      const res = await apiClient.post<HeroDemoState>('/hero-demo/step', {
        scenario_id: selectedScenarioId,
        step_number: stepNum,
      });
      if (res) {
        setDemoState(res);
      }
    } catch (err) {
      console.error('Failed to navigate to step:', err);
    } finally {
      setStepLoading(false);
    }
  };

  // Handle Previous Step
  const handlePrevStep = async () => {
    if (!demoState || demoState.current_step <= 1 || stepLoading) return;
    await handleGoToStep(demoState.current_step - 1);
  };

  // Handle Run All
  const handleRunAll = async () => {
    try {
      setStepLoading(true);
      setIsPlaying(false);
      const res = await apiClient.post<HeroDemoState>('/hero-demo/run-all', {
        scenario_id: selectedScenarioId,
      });
      if (res) {
        setDemoState(res);
      }
    } catch (err) {
      console.error('Failed to run all steps:', err);
    } finally {
      setStepLoading(false);
    }
  };

  // Handle Reset
  const handleReset = async () => {
    try {
      setStepLoading(true);
      setIsPlaying(false);
      const res = await apiClient.post<HeroDemoState>('/hero-demo/reset', {
        scenario_id: selectedScenarioId,
      });
      if (res) {
        setDemoState(res);
      }
    } catch (err) {
      console.error('Failed to reset demo:', err);
    } finally {
      setStepLoading(false);
    }
  };

  // Auto-play loop
  useEffect(() => {
    if (isPlaying && demoState) {
      if (demoState.current_step >= 10) {
        setIsPlaying(false);
        return;
      }

      const delay = Math.max(1400 / playbackSpeed, 400);
      autoPlayTimerRef.current = setTimeout(() => {
        handleNextStep();
      }, delay);
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [isPlaying, demoState, playbackSpeed]);

  const currentStepData: HeroStepData | undefined =
    demoState?.steps?.find((s) => s.step_number === demoState.current_step) ||
    (demoState?.steps && demoState.steps.length > 0
      ? demoState.steps[demoState.steps.length - 1]
      : undefined);

  return (
    <div className="space-y-6 pb-16">
      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Track 01 Flagship Hero Demo
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Zero Discrepancy SLA
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Autonomous AI Commerce & Real-Time Financial Reconciler
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-3xl">
              Deterministic 10-phase demonstration of Merchant Catalog Ingestion, Customer Intent AI, Cart Creation, Razorpay Test Checkout, Memory Persona Profiling, and Instant Double-Entry ERP Reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-right">
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-200 block">
                Active Scenario
              </span>
              <span className="text-sm font-bold text-white">
                {demoState?.scenario.title || 'Loading...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Playback & Scenario Controls */}
      <HeroPlaybackControls
        scenarios={scenarios}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={(id) => {
          setIsPlaying(false);
          setSelectedScenarioId(id);
        }}
        currentStep={demoState?.current_step || 1}
        onNextStep={handleNextStep}
        onPrevStep={handlePrevStep}
        onRunAll={handleRunAll}
        onReset={handleReset}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        playbackSpeed={playbackSpeed}
        onChangeSpeed={setPlaybackSpeed}
        isExecuting={stepLoading || loading}
      />

      {/* 10-Step Interactive Stepper */}
      <HeroTimelineStepper
        currentStep={demoState?.current_step || 1}
        steps={demoState?.steps || []}
        onSelectStep={handleGoToStep}
      />

      {/* Two-Column Main Stage: Left Visual Step Card, Right Audit/Reasoning Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Visual Stage (Step Card) - 7 cols */}
        <div className="lg:col-span-7">
          {demoState?.scenario ? (
            <HeroStepDisplay
              currentStepData={currentStepData}
              scenario={demoState.scenario}
              onJumpToCheckout={() => handleGoToStep(6)}
            />
          ) : (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center text-slate-500 text-sm">
              Loading hero demo scenario...
            </div>
          )}
        </div>

        {/* Forensic Audit, Reasoning Trace, Risk Check, and General Ledger Panel - 5 cols */}
        <div className="lg:col-span-5">
          <HeroAuditReasoningPanel
            steps={demoState?.steps || []}
            auditLogs={demoState?.audit_logs || []}
            transactions={demoState?.transactions || []}
            activeStepNumber={demoState?.current_step || 1}
          />
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0B72E7]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Razorpay AI Commerce Track 01 Architecture
            </h3>
            <p className="text-[11px] text-slate-500">
              Deterministic Agent Execution • Explainable ReAct Trace • Reconciled Ledger Audit Trail • Adaptive Vendor Memory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="rounded-xl border-slate-200 text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Demo
          </Button>
          <Button
            size="sm"
            onClick={handleRunAll}
            className="rounded-xl bg-[#0B72E7] hover:bg-blue-600 text-white text-xs font-bold shadow-sm shadow-blue-500/20"
          >
            <Zap className="w-3.5 h-3.5 mr-1 fill-current" />
            1-Click Fast Forward
          </Button>
        </div>
      </div>
    </div>
  );
}
