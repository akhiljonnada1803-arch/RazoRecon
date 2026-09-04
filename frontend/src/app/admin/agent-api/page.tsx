'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  Zap, 
  ShieldCheck, 
  Play,
  Key,
  Globe,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function AdminAgentApiPage() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'context' | 'curl' | 'openapi'>('curl');

  const { data: agentContext } = useQuery({
    queryKey: ['agent-api-context'],
    queryFn: async () => {
      try {
        return await apiClient.get('/catalog/agent-context');
      } catch (e) {
        return {
          merchant_id: 'rzp_live_acme_corp',
          platform: 'RazorCommerce AI - Track 01',
          catalog_version: '2026.09',
          total_skus: 50,
          categories: ['Fintech Hardware', 'POS Devices', 'Soundboxes', 'Developer Hardware', 'Enterprise Software'],
          autonomous_checkout_endpoint: 'https://api.razorcommerce.ai/v1/commerce/checkout'
        };
      }
    },
  });

  const curlExample = `curl -X POST "http://localhost:8000/api/v1/commerce/chat" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer rzp_live_agent_94827189" \\
  -d '{
    "query": "Find the best 4G smart soundbox under ₹4000 with multilingual audio",
    "cart": { "items": [] }
  }'`;

  const openApiSpec = {
    openapi: "3.1.0",
    info: {
      title: "RazorCommerce Agentic API",
      version: "1.4.0",
      description: "Autonomous Agent-to-Merchant Protocol for SKU Discovery & 1-Click Razorpay Checkout"
    },
    paths: {
      "/api/v1/catalog/products": {
        get: { summary: "Retrieve structured product catalog for AI agents" }
      },
      "/api/v1/catalog/agent-context": {
        get: { summary: "Dense token representation for LLM system context" }
      },
      "/api/v1/commerce/chat": {
        post: { summary: "Conversational query resolution & spec comparisons" }
      },
      "/api/v1/commerce/checkout": {
        post: { summary: "Initiate autonomous Razorpay checkout & payment link" }
      }
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Developer Console</span>
            <span>•</span>
            <span className="text-[#0B72E7]">Agentic Protocol</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654] flex items-center gap-2.5">
            <Code2 className="h-6 w-6 text-[#0B72E7]" />
            Agent API Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Machine-readable endpoints enabling autonomous AI Buyers (LangChain, AutoGen, CrewAI) to discover SKUs and execute checkout.
          </p>
        </div>

        <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 text-xs px-3 py-1 font-mono">
          Protocol Spec 1.4
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Terminal & Code Explorer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            {/* Terminal Header */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400 ml-2">agent_protocol_runner.sh</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl text-[11px] font-mono">
                  <button
                    onClick={() => setActiveTab('curl')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activeTab === 'curl' ? 'bg-[#0B72E7] text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    cURL Request
                  </button>
                  <button
                    onClick={() => setActiveTab('context')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activeTab === 'context' ? 'bg-[#0B72E7] text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    AI Context JSON
                  </button>
                  <button
                    onClick={() => setActiveTab('openapi')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activeTab === 'openapi' ? 'bg-[#0B72E7] text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    OpenAPI 3.1
                  </button>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(
                    activeTab === 'curl' ? curlExample :
                    activeTab === 'openapi' ? JSON.stringify(openApiSpec, null, 2) :
                    JSON.stringify(agentContext, null, 2)
                  )}
                  className="h-7 px-2.5 rounded-lg border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs gap-1"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>
            </div>

            {/* Code Content */}
            <div className="p-6 overflow-x-auto custom-scrollbar font-mono text-xs leading-relaxed max-h-[500px]">
              {activeTab === 'curl' ? (
                <pre className="text-emerald-400">{curlExample}</pre>
              ) : activeTab === 'openapi' ? (
                <pre className="text-amber-300">{JSON.stringify(openApiSpec, null, 2)}</pre>
              ) : (
                <pre className="text-blue-300">{JSON.stringify(agentContext, null, 2)}</pre>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Endpoints & Authentication */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#072654] pb-3 border-b border-slate-100 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#0B72E7]" />
              <span>Available Agent Endpoints</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                    GET
                  </span>
                  <span className="font-mono font-semibold text-slate-800">/catalog/products</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Machine-readable catalog feed with inventory status and pricing specs.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                    GET
                  </span>
                  <span className="font-mono font-semibold text-slate-800">/catalog/agent-context</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Optimized dense token representation for LLM system prompts.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded text-[10px]">
                    POST
                  </span>
                  <span className="font-mono font-semibold text-slate-800">/commerce/chat</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Autonomous conversational query search with comparative reasoning matrices.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded text-[10px]">
                    POST
                  </span>
                  <span className="font-mono font-semibold text-slate-800">/commerce/checkout</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Instant 1-click Razorpay test payment link generation for autonomous buyers.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-[#072654] font-bold text-xs">
              <ShieldCheck className="h-4 w-4 text-[#0B72E7]" />
              <span>Sandbox Authentication</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Authenticate all agent requests using Bearer token headers in the format: <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-[#0B72E7]">Authorization: Bearer rzp_test_...</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
