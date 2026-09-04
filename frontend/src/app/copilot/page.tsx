'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  Store,
  Users,
  MessageSquare, 
  RefreshCw, 
  ShieldCheck, 
  Terminal,
  Zap,
  TrendingUp,
  Package,
  Truck,
  Megaphone,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/components/copilot/ChatMessage';
import { CopilotMessageDTO } from '@/types/copilot';

const MERCHANT_INITIAL_MESSAGE: CopilotMessageDTO = {
  id: 'init-merchant',
  role: 'assistant',
  content:
    "Hello! I am your **Commerce AI Copilot** (Merchant Mode). I have live access to your Commerce Transaction Engine, 7-stage order lifecycle, inventory stock levels, customer churn telemetry, and autonomous campaign generation tools.\n\nHow can I help grow your revenue and streamline operations today?",
  citations: [{ doc_id: 'kb-0102', title: 'Merchant Revenue Intelligence & SKU Velocity Metrics' }],
};

const CUSTOMER_INITIAL_MESSAGE: CopilotMessageDTO = {
  id: 'init-customer',
  role: 'assistant',
  content:
    "Welcome to **RazorCommerce Assistant**! I can help you discover products across 50 verified SKUs, compare specifications, find promotional discounts, and track your active package shipments in real-time.\n\nWhat are you shopping for today?",
  citations: [{ doc_id: 'kb-0041', title: 'Agentic Commerce Protocol Discovery Specification' }],
};

const MERCHANT_PROMPTS = [
  "Analyze our 30-day sales and GMV velocity",
  "Which SKUs have low stock or shortage risk?",
  "Generate an AI promotional discount campaign",
  "Show active commerce exceptions and revenue at risk",
];

const CUSTOMER_PROMPTS = [
  "Find best noise cancelling headphones under ₹30,000",
  "Compare smartwatches with titanium build",
  "Track my recent order ORD-2026-8941",
  "Are there any active discount coupons available?",
];

export default function CommerceCopilotPage() {
  const [copilotMode, setCopilotMode] = useState<'MERCHANT' | 'CUSTOMER'>('MERCHANT');
  const [messages, setMessages] = useState<CopilotMessageDTO[]>([MERCHANT_INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleModeChange = (mode: 'MERCHANT' | 'CUSTOMER') => {
    setCopilotMode(mode);
    setMessages([mode === 'MERCHANT' ? MERCHANT_INITIAL_MESSAGE : CUSTOMER_INITIAL_MESSAGE]);
  };

  const handleSend = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const userMessage: CopilotMessageDTO = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const assistantMsgId = `asst-${Date.now()}`;
    const initialAssistantMsg: CopilotMessageDTO = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      trace: [],
      citations: [],
    };

    setMessages([...newMessages, initialAssistantMsg]);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Copilot API error: ${response.status}`);
      }

      const json = await response.json();
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content: json.answer,
                trace: json.trace || [],
                citations: json.citations || [],
              }
            : msg
        )
      );
    } catch (err) {
      console.error('Copilot query error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  "I encountered an issue connecting to the Commerce Intelligence engine. Please verify the backend service is running and try again.",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const currentPrompts = copilotMode === 'MERCHANT' ? MERCHANT_PROMPTS : CUSTOMER_PROMPTS;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 flex flex-col justify-between max-w-5xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0c3977] to-[#0B72E7] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Bot className="w-3.5 h-3.5 mr-1 text-amber-300" />
                Commerce AI Copilot
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs font-mono">
                <Zap className="w-3.5 h-3.5 mr-1" />
                Deterministic Action Engine
              </Badge>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {copilotMode === 'MERCHANT' ? 'Merchant Operations & Revenue Assistant' : 'Customer Shopping & Discovery Assistant'}
            </h1>
            <p className="text-blue-100 text-xs max-w-xl">
              {copilotMode === 'MERCHANT'
                ? 'Autonomous sales analysis, low-stock alerts, algorithmic campaign generation, and multi-rail settlement reconciliation.'
                : 'Natural language product recommendations, specification comparisons, active promo discovery, and real-time package tracking.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20">
            <button
              onClick={() => handleModeChange('MERCHANT')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                copilotMode === 'MERCHANT'
                  ? 'bg-white text-[#072654] shadow-md'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Merchant Mode</span>
            </button>

            <button
              onClick={() => handleModeChange('CUSTOMER')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                copilotMode === 'CUSTOMER'
                  ? 'bg-white text-[#0B72E7] shadow-md'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Customer Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Autonomous Action Chips (Merchant Mode Only) */}
      {copilotMode === 'MERCHANT' && (
        <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
            1-Click Agent Actions:
          </span>
          <button
            onClick={() => handleSend("Generate a 15% discount promotional campaign for high churn risk buyers")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-[#0B72E7] border border-blue-200 transition-colors flex items-center gap-1"
          >
            <Megaphone className="w-3 h-3" />
            Launch AI Win-Back Promo
          </button>
          <button
            onClick={() => handleSend("Create a cross-sell bundle offer for top selling electronics")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Create Cross-Sell Bundle
          </button>
          <button
            onClick={() => handleSend("Check inventory alerts and identify low stock SKUs")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors flex items-center gap-1"
          >
            <Package className="w-3 h-3" />
            Run Stockout Scan
          </button>
        </div>
      )}

      {/* Chat Messages Body */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs overflow-y-auto min-h-[420px] max-h-[560px] space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChatMessage message={msg} />
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 animate-pulse">
            <RefreshCw className="w-4 h-4 text-[#0B72E7] animate-spin" />
            <span>Executing deterministic commerce tools & compiling intelligence...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-2">
        {currentPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-[#0B72E7] text-xs font-medium transition-all shadow-2xs text-left"
          >
            💡 {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
        <Input
          placeholder={
            copilotMode === 'MERCHANT'
              ? "Ask about sales GMV, inventory stock, promo campaigns, or exceptions..."
              : "Search products, compare features, or ask to track your delivery..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(input)}
          disabled={isLoading}
          className="border-none shadow-none text-xs sm:text-sm focus-visible:ring-0"
        />

        <Button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isLoading}
          className="bg-[#0B72E7] hover:bg-[#095ec2] text-white rounded-xl px-4 text-xs font-bold gap-1.5 shadow-xs"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleModeChange(copilotMode)}
          className="text-slate-400 hover:text-slate-600 rounded-xl px-2"
          title="Reset conversation"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
