'use client';

import React, { useEffect, useState } from 'react';
import { HeroScenario } from '@/types/hero_demo';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Zap, 
  Sparkles, 
  Sliders,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeroPlaybackControlsProps {
  scenarios: HeroScenario[];
  selectedScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  currentStep: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  onRunAll: () => void;
  onReset: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  isExecuting: boolean;
}

export function HeroPlaybackControls({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  currentStep,
  onNextStep,
  onPrevStep,
  onRunAll,
  onReset,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
  isExecuting,
}: HeroPlaybackControlsProps) {
  return (
    <div className="bg-[#072654] text-white p-4 rounded-3xl shadow-xl border border-blue-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Scenario Switcher */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-2xl bg-[#0B72E7] flex items-center justify-center text-white shrink-0 shadow-xs">
          <Layers className="h-4 w-4" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block">
            Procurement Scenario
          </span>
          <select
            value={selectedScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            disabled={isExecuting || isPlaying}
            className="h-8 px-2 text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl outline-hidden focus:border-[#0B72E7] transition-all cursor-pointer"
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id} className="bg-[#072654] text-white">
                {sc.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Playback Controls Strip */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevStep}
          disabled={currentStep <= 1 || isExecuting || isPlaying}
          className="h-9 px-3 text-xs bg-white/10 hover:bg-white/20 text-white border-white/15 rounded-xl gap-1 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Prev Phase</span>
        </Button>

        {/* Play/Pause Auto */}
        <Button
          onClick={onTogglePlay}
          className={`h-9 px-4 text-xs font-bold rounded-xl gap-2 shadow-xs transition-all ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-900'
              : 'bg-[#0B72E7] hover:bg-[#095bc0] text-white'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              <span>Pause Auto-Flow</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Auto-Play Demo</span>
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNextStep}
          disabled={currentStep >= 10 || isExecuting || isPlaying}
          className="h-9 px-3 text-xs bg-white/10 hover:bg-white/20 text-white border-white/15 rounded-xl gap-1 disabled:opacity-40"
        >
          <span className="hidden sm:inline">Next Phase</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Instant 1-Click Run All */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRunAll}
          disabled={isExecuting || isPlaying}
          className="h-9 px-3 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-400/30 rounded-xl gap-1.5 font-bold"
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Execute All (1-Click)</span>
        </Button>

        {/* Reset */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          disabled={isExecuting}
          className="h-9 w-9 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl"
          title="Reset to Step 1"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Speed Selector */}
      <div className="flex items-center gap-1.5 justify-end">
        <span className="text-[10px] text-blue-300 font-bold uppercase mr-1">Speed:</span>
        {[1, 2, 4].map((speed) => (
          <button
            key={speed}
            onClick={() => onChangeSpeed(speed)}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
              playbackSpeed === speed
                ? 'bg-blue-500 text-white shadow-xs'
                : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
}
