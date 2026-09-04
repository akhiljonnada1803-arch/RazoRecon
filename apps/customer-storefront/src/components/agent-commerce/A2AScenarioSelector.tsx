'use client';

import React from 'react';
import { 
  Building2, 
  Store, 
  Laptop, 
  HardDrive, 
  Sparkles, 
  ArrowRight,
  Bot
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { A2APresetScenario } from '@/types/agent_commerce';

interface A2AScenarioSelectorProps {
  scenarios: A2APresetScenario[];
  selectedScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  onRunSimulation: () => void;
  isRunning?: boolean;
}

const SCENARIO_ICONS: Record<string, React.ElementType> = {
  scenario_retail_expansion: Store,
  scenario_finops_enterprise: Building2,
  scenario_dev_workstation: Laptop,
  scenario_storage_cluster: HardDrive
};

export function A2AScenarioSelector({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  onRunSimulation,
  isRunning = false
}: A2AScenarioSelectorProps) {
  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#072654]">Select Procurement Scenario</h2>
          <p className="text-[11px] text-slate-500">
            Choose an enterprise B2B scenario to observe autonomous buyer-seller price discovery, order locking, and FinOps reconciliation.
          </p>
        </div>

        <Button
          onClick={onRunSimulation}
          disabled={isRunning}
          className="bg-[#0B72E7] hover:bg-blue-600 text-white font-bold text-xs gap-1.5 h-9 shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {isRunning ? 'Simulating Pipeline...' : 'Run Autonomous Simulation'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarios.map((sc) => {
          const Icon = SCENARIO_ICONS[sc.id] || Store;
          const isSelected = sc.id === selectedScenarioId;

          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'border-[#0B72E7] bg-blue-50/70 shadow-2xs ring-2 ring-[#0B72E7]/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-[#0B72E7] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono bg-white border-slate-200 text-slate-600">
                    Budget: {formatINR(sc.initial_budget)}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {sc.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {sc.industry}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {sc.requirement_prompt}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>{sc.target_items_count} Target Units</span>
                <span className={`font-bold flex items-center gap-0.5 ${isSelected ? 'text-[#0B72E7]' : 'text-slate-500'}`}>
                  Select
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
