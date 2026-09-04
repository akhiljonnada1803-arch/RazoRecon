'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AICatalogContext } from '@/types/catalog';
import { 
  X, 
  Code, 
  Copy, 
  Check, 
  Sparkles, 
  Bot, 
  Terminal,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AICatalogViewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AICatalogViewModal({
  isOpen,
  onClose,
}: AICatalogViewModalProps) {
  const [copied, setCopied] = useState(false);

  const { data: aiContext, isLoading } = useQuery<AICatalogContext>({
    queryKey: ['catalog-ai-context'],
    queryFn: () => apiClient.get('/catalog/ai-context'),
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const jsonString = aiContext ? JSON.stringify(aiContext, null, 2) : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[88vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#072654] text-white flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-[#0B72E7]">
              <Bot className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  AI-Readable Catalog Schema API
                </h3>
                <Badge className="bg-emerald-500 text-white text-[10px] font-mono border-0">
                  GET /api/v1/catalog/ai-context
                </Badge>
              </div>
              <p className="text-xs text-blue-200/80">
                Structured embeddings-ready JSON schema for LLM tool calling, Copilots & RAG
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 bg-slate-950 text-slate-100 font-mono text-xs">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
              <div className="h-6 w-6 border-2 border-[#0B72E7] border-t-transparent rounded-full animate-spin" />
              <span>Generating AI Catalog Schema payload...</span>
            </div>
          ) : (
            <pre className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto text-[11px] leading-relaxed text-emerald-400">
              {jsonString}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-sans">
            Ready for OpenAI GPT-4o, Claude 3.5, and LangChain tool integration.
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleCopy}
              disabled={isLoading || !aiContext}
              className="h-9 px-4 text-xs font-bold bg-[#0B72E7] hover:bg-[#095bc0] text-white rounded-xl gap-1.5 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" />
                  <span>Copied JSON</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy AI Schema</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 px-3 text-xs bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 rounded-xl"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
