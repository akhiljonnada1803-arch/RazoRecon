'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  BrainCircuit, 
  Code2, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { A2ASimulationStep, A2ADialogueMessage } from '@/types/agent_commerce';

interface A2ADialoguePanelProps {
  currentStep: A2ASimulationStep;
  buyerName: string;
  buyerPersona: string;
  sellerName: string;
  sellerPersona: string;
}

export function A2ADialoguePanel({
  currentStep,
  buyerName,
  buyerPersona,
  sellerName,
  sellerPersona
}: A2ADialoguePanelProps) {
  const [showJson, setShowJson] = useState<Record<string, boolean>>({});

  const toggleJson = (id: string) => {
    setShowJson(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col h-[520px]">
      {/* Header with Dual Agent Badges */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-4">
          {/* Buyer Agent Badge */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-[#0B72E7] flex items-center justify-center border border-blue-200 shadow-2xs">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">{buyerName}</span>
              <span className="text-[10px] text-blue-600 font-medium">{buyerPersona}</span>
            </div>
          </div>

          <div className="text-slate-300 font-mono text-xs hidden sm:block">⇄</div>

          {/* Seller Agent Badge */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-2xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">{sellerName}</span>
              <span className="text-[10px] text-emerald-600 font-medium">{sellerPersona}</span>
            </div>
          </div>
        </div>

        <Badge variant="outline" className="text-[10px] font-mono bg-slate-50 border-slate-200 text-slate-600 w-fit">
          {currentStep.title}
        </Badge>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
        {currentStep.dialogue.map((msg) => {
          const isBuyer = msg.sender === 'buyer_agent';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                isBuyer ? 'mr-auto' : 'ml-auto flex-row-reverse'
              }`}
            >
              {/* Avatar Icon */}
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-2xs ${
                isBuyer 
                  ? 'bg-[#0B72E7] text-white' 
                  : 'bg-emerald-600 text-white'
              }`}>
                {isBuyer ? <Bot className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </div>

              {/* Speech Bubble */}
              <div className="space-y-1.5 flex-1">
                <div className={`flex items-center gap-2 ${isBuyer ? 'justify-start' : 'justify-end'}`}>
                  <span className="text-xs font-bold text-slate-800">{msg.sender_name}</span>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {msg.timestamp}
                  </span>
                </div>

                <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-2xs border ${
                  isBuyer
                    ? 'bg-blue-50/80 border-blue-200/70 text-slate-800 rounded-tl-xs'
                    : 'bg-emerald-50/80 border-emerald-200/70 text-slate-800 rounded-tr-xs'
                }`}>
                  <p className="whitespace-pre-line font-medium">{msg.message}</p>

                  {/* Internal Thought Process */}
                  {msg.thought_process && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-start gap-1.5 text-[11px] text-slate-500 italic">
                      <BrainCircuit className="h-3.5 w-3.5 text-[#0B72E7] shrink-0 mt-0.5" />
                      <span><strong>AI Thought:</strong> {msg.thought_process}</span>
                    </div>
                  )}

                  {/* JSON Payload Inspector */}
                  {msg.structured_payload && (
                    <div className="mt-2 pt-2 border-t border-slate-200/50">
                      <button
                        onClick={() => toggleJson(msg.id)}
                        className="text-[10px] font-mono font-semibold text-slate-600 hover:text-[#0B72E7] flex items-center gap-1 transition-colors"
                      >
                        <Code2 className="h-3 w-3" />
                        <span>{showJson[msg.id] ? 'Hide Structured Payload' : 'Inspect JSON Payload'}</span>
                      </button>

                      {showJson[msg.id] && (
                        <pre className="mt-1.5 p-2 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[10px] overflow-x-auto border border-slate-800">
                          {JSON.stringify(msg.structured_payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Output Summary Banner */}
      {currentStep.output_summary && (
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">Step Outcome:</span>
            <span>{currentStep.output_summary}</span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border-emerald-200">
            Phase 0{currentStep.step_number} OK
          </Badge>
        </div>
      )}
    </div>
  );
}
