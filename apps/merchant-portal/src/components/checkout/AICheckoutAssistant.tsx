'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Tag, 
  Zap, 
  ShoppingCart, 
  CheckCircle2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface AICheckoutAssistantProps {
  onSendCommand: (prompt: string) => Promise<any>;
  isProcessing: boolean;
  onApplyCoupon: (code: string) => void;
  onQuickAddProduct: (productId: string, qty: number) => void;
}

const SUGGESTED_PROMPTS = [
  'Add 2x Razorpay Smart POS Terminal V3 Pro',
  'Add RazorRecon Enterprise SaaS License',
  'Apply optimal RAZOR2026 coupon',
  'Add 3x 4G Soundbox Pro with Multilingual Voice',
  'Clear all items and start over',
];

export function AICheckoutAssistant({
  onSendCommand,
  isProcessing,
  onApplyCoupon,
  onQuickAddProduct,
}: AICheckoutAssistantProps) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string; action?: string }>>([
    {
      sender: 'agent',
      text: 'Hello! I am your **AI Checkout Assistant**. Tell me what hardware terminals, soundboxes, or FinOps licenses you need, and I will assemble your cart, apply best discounts, and generate 1-click Razorpay checkout links.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim() || isProcessing) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: prompt, time: timeStr }]);
    if (!textToSend) setInputPrompt('');

    try {
      const res = await onSendCommand(prompt);
      if (res?.agent_message) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: res.agent_message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            action: res.applied_action,
          },
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `I encountered an issue processing that: ${e?.message || 'Please try again.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#072654] to-[#0a356e] text-white rounded-3xl p-5 shadow-lg border border-blue-900/40 flex flex-col h-full min-h-[460px] justify-between relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#0B72E7]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30 shadow-xs">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                AI Checkout Assistant
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[9px] px-1.5 py-0 font-bold">
                  Autonomous
                </Badge>
              </span>
              <span className="text-[10px] text-blue-200/80 block">
                Conversational shopping & instant cart compilation
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-emerald-300">Live</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="space-y-3 py-3 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#0B72E7] text-white rounded-tr-xs font-medium shadow-xs'
                    : 'bg-white/10 backdrop-blur-md text-blue-50 rounded-tl-xs border border-white/10'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-blue-300/60 mt-0.5 px-1">{m.time}</span>
            </div>
          ))}
          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-blue-200 bg-white/5 p-2 rounded-xl w-fit">
              <div className="h-3 w-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span>Agent parsing request & updating cart...</span>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Prompts & Input Box */}
      <div className="space-y-2.5 pt-2 border-t border-white/10">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isProcessing}
              className="text-[10px] whitespace-nowrap bg-white/10 hover:bg-white/20 text-blue-100 border border-white/15 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1"
            >
              <Sparkles className="h-2.5 w-2.5 text-blue-300" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Text Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/15"
        >
          <Input
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Type command e.g. 'Add 2 POS terminals and apply coupon'..."
            disabled={isProcessing}
            className="h-9 text-xs bg-transparent border-0 text-white placeholder:text-blue-200/50 focus-visible:ring-0 shadow-none"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!inputPrompt.trim() || isProcessing}
            className="h-8 px-3 bg-[#0B72E7] hover:bg-blue-600 text-white font-bold rounded-xl shrink-0 gap-1"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
