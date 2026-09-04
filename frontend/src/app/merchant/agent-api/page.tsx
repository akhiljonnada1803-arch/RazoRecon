'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  Bot, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Globe, 
  ExternalLink,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function MerchantAgentApiPage() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'context' | 'schema' | 'curl'>('context');

  const { data: agentContext, isLoading } = useQuery({
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const curlExample = `curl -X POST "http://localhost:8000/api/v1/commerce/chat" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer rzp_test_agent_token" \\
  -d '{
    "query": "Find the best 4G smart soundbox under ₹4000 for retail checkout",
    "cart": { "items": [] }
  }'`;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Merchant Operations</span>
            <span>•</span>
            <span className="text-[#0B72E7]">Agentic Commerce</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654] flex items-center gap-2.5">
            <Code2 className="h-6 w-6 text-[#0B72E7]" />
            Agent API Center (Track 01)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enable external AI Agents, LLM assistants, and autonomous buyers to discover, compare, and purchase catalog SKUs.
          </p>
        </div>

        <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 text-xs px-3 py-1 font-mono">
          Agent-Readable Standard 1.0
        </Badge>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: JSON Viewer & Interactive Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            {/* Terminal Top Bar */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400 ml-2">agent_catalog_feed.json</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl text-[11px] font-mono">
                  <button
                    onClick={() => setActiveTab('context')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activeTab === 'context' ? 'bg-[#0B72E7] text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    AI Context
                  </button>
                  <button
                    onClick={() => setActiveTab('curl')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activeTab === 'curl' ? 'bg-[#0B72E7] text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    cURL Request
                  </button>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(activeTab === 'curl' ? curlExample : JSON.stringify(agentContext, null, 2))}
                  className="h-7 px-2.5 rounded-lg border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs gap-1"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>
            </div>

            {/* Code Content */}
            <div className="p-6 overflow-x-auto custom-scrollbar font-mono text-xs leading-relaxed text-blue-300 max-h-[500px]">
              {activeTab === 'curl' ? (
                <pre className="text-emerald-400">{curlExample}</pre>
              ) : (
                <pre>{JSON.stringify(agentContext, null, 2)}</pre>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Agent Endpoints Specification */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#072654] pb-3 border-b border-slate-100 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#0B72E7]" />
              <span>Autonomous Agent Endpoints</span>
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
                  Returns all 50 SKUs with structured features, stock status, and active discounts.
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
                  Optimized dense token representation for LLM system prompts and RAG retrieval.
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
                  Conversational shopping query resolver with side-by-side spec comparison data.
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
                  Autonomous cart validation and instant 1-click Razorpay payment link creation.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-[#072654] font-bold text-xs">
              <ShieldCheck className="h-4 w-4 text-[#0B72E7]" />
              <span>Razorpay AI Security Sandbox</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Every autonomous agent action is sandboxed with strict spend limits, token authentication, and immutable audit logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
