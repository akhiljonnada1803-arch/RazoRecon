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
      <div className="bg-gradient-to-r from-[#072654] via-slate-900 to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-mono backdrop-blur-md">
                <Code2 className="w-3.5 h-3.5 mr-1" />
                Autonomous Commerce Gateway
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                OpenAPI 3.1
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Agent API Center & Specifications
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Equip external AI agents (LangChain, CrewAI, AutoGen) to browse merchant catalogs, verify stock, and execute payments.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Button
          variant={activeTab === 'curl' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('curl')}
          className={activeTab === 'curl' ? 'bg-[#0B72E7] text-white font-bold text-xs rounded-xl' : 'text-slate-600 font-semibold text-xs rounded-xl'}
        >
          <Terminal className="h-3.5 w-3.5 mr-1.5" />
          cURL Playground
        </Button>
        <Button
          variant={activeTab === 'context' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('context')}
          className={activeTab === 'context' ? 'bg-[#0B72E7] text-white font-bold text-xs rounded-xl' : 'text-slate-600 font-semibold text-xs rounded-xl'}
        >
          <Zap className="h-3.5 w-3.5 mr-1.5" />
          Dense LLM Context
        </Button>
        <Button
          variant={activeTab === 'openapi' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('openapi')}
          className={activeTab === 'openapi' ? 'bg-[#0B72E7] text-white font-bold text-xs rounded-xl' : 'text-slate-600 font-semibold text-xs rounded-xl'}
        >
          <Globe className="h-3.5 w-3.5 mr-1.5" />
          OpenAPI Specification
        </Button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'curl' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#072654]">Conversational AI Ingestion Query</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(curlExample)}
              className="text-xs rounded-xl gap-1"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy cURL'}</span>
            </Button>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl font-mono text-xs text-blue-300 overflow-x-auto">
            <pre>{curlExample}</pre>
          </div>
        </div>
      )}

      {activeTab === 'context' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#072654]">Agent Context Token Feed</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(JSON.stringify(agentContext, null, 2))}
              className="text-xs rounded-xl gap-1"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </Button>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl font-mono text-xs text-emerald-400 overflow-x-auto max-h-96">
            <pre>{JSON.stringify(agentContext, null, 2)}</pre>
          </div>
        </div>
      )}

      {activeTab === 'openapi' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#072654]">OpenAPI 3.1 JSON Schema</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(JSON.stringify(openApiSpec, null, 2))}
              className="text-xs rounded-xl gap-1"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy Spec'}</span>
            </Button>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl font-mono text-xs text-amber-300 overflow-x-auto max-h-96">
            <pre>{JSON.stringify(openApiSpec, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
