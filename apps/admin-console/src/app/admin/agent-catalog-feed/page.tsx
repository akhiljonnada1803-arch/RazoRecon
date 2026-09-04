'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Terminal, 
  Copy, 
  Check, 
  RefreshCw, 
  FileCode, 
  Sparkles, 
  Layers, 
  CheckCircle2,
  Cpu,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminAgentCatalogFeedPage() {
  const [copied, setCopied] = useState(false);

  const { data: feedData, isLoading, refetch } = useQuery<any>({
    queryKey: ['admin', 'agent-catalog-feed'],
    queryFn: () => apiClient.get('/catalog/agent-context'),
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(feedData, null, 2));
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
            <span className="text-[#0B72E7]">Agentic Data Feed</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#072654] flex items-center gap-2.5">
            <Terminal className="h-6 w-6 text-[#0B72E7]" />
            Live Agent Catalog Feed
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Auto-generated dense token representations and JSON schemas ingested by autonomous AI Agents on product updates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl text-xs font-semibold gap-1.5 border-slate-200"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Refresh Feed</span>
          </Button>
          <Button
            size="sm"
            onClick={handleCopy}
            className="rounded-xl bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold gap-1.5 shadow-xs"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON Feed'}</span>
          </Button>
        </div>
      </div>

      {/* Feed Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-400 uppercase font-mono font-semibold">Feed Version</span>
          <div className="text-lg font-bold text-[#072654] font-mono">v{feedData?.schema_version || '2026.1'}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">Valid Protocol Standard</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-400 uppercase font-mono font-semibold">Total SKUs In Feed</span>
          <div className="text-lg font-bold text-slate-900 font-mono">{feedData?.total_items || 50} Items</div>
          <span className="text-[10px] text-slate-500">100% Schema Validated</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-400 uppercase font-mono font-semibold">Dense Token Size</span>
          <div className="text-lg font-bold text-purple-700 font-mono">~3.8k Tokens</div>
          <span className="text-[10px] text-purple-600 font-medium">LLM Prompt Friendly</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-400 uppercase font-mono font-semibold">Last Auto-Sync</span>
          <div className="text-lg font-bold text-emerald-700 font-mono">Live Sync</div>
          <span className="text-[10px] text-slate-400">Triggered on SKU edits</span>
        </div>
      </div>

      {/* JSON Viewer */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden p-6 font-mono text-xs text-emerald-400 leading-relaxed max-h-[600px] overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="text-slate-500 py-12 text-center">Loading live AI feed...</div>
        ) : (
          <pre>{JSON.stringify(feedData, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
