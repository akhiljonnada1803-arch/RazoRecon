'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
  CheckCircle2,
  Tag,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  recommendations?: any[];
  timestamp: string;
}

interface GrowthAgentChatDrawerProps {
  initialQuery?: string;
  onClose?: () => void;
  isOpen?: boolean;
}

export function GrowthAgentChatDrawer({
  initialQuery,
  onClose,
  isOpen = true
}: GrowthAgentChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_0',
      sender: 'agent',
      text: "👋 **Hello Merchant! I am your Autonomous Growth Agent.**\n\nI continuously evaluate your sales velocity, inventory aging, customer segments, and checkout conversion rates. Ask me anything about declining products, revenue opportunities, bundles, or volume discounts!",
      timestamp: 'Just now'
    }
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now'
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const res: any = await apiClient.post('/merchant/growth-agent/chat', {
        message: textToSend,
        conversation_id: 'merchant_conv_01'
      });

      const agentMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        sender: 'agent',
        text: res.response,
        recommendations: res.recommendations || [],
        timestamp: res.timestamp || 'Just now'
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (e) {
      console.error('Growth chat error', e);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'agent',
          text: "I encountered a brief connection error querying the growth models. Please try asking again in a moment.",
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      sendMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleApplyRec = async (recId: string) => {
    setApplyingId(recId);
    try {
      await apiClient.post(`/merchant/growth-agent/apply/${recId}?applied_by=Merchant Admin`);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_applied_${Date.now()}`,
          sender: 'agent',
          text: `🎉 **Strategy Successfully Applied!**\n\nThe recommended pricing rule and catalog update are now live on your storefront. We will track conversion lift in your dashboard.`,
          timestamp: 'Just now'
        }
      ]);
    } catch (e) {
      console.error('Failed to apply strategy', e);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-[#072654] text-white p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm flex items-center gap-2">
              <span>Merchant Growth Agent Chat</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <span className="text-[10px] text-slate-300">
              Continuously analyzing live store metrics
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Suggested Query Chips */}
      <div className="p-2.5 bg-white border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
        {[
          'Which products are declining?',
          'How can I increase my AOV?',
          'Recommend volume discounts',
          'Suggest high-margin bundles'
        ].map((q, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(q)}
            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#0B72E7] text-slate-700 font-semibold shrink-0 transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] p-4 rounded-2xl text-xs leading-relaxed space-y-3 ${
                m.sender === 'user'
                  ? 'bg-[#0B72E7] text-white rounded-br-none shadow-xs'
                  : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-2xs'
              }`}
            >
              <div className="whitespace-pre-line font-medium">{m.text}</div>

              {/* Embedded Recommendation Cards */}
              {m.recommendations && m.recommendations.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100 mt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Recommended Growth Actions ({m.recommendations.length}):
                  </span>
                  {m.recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-slate-800"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[9px] font-extrabold bg-white uppercase">
                          {rec.category_label}
                        </Badge>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          Confidence: {Math.round(rec.confidence_score * 100)}%
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-xs">{rec.title}</h4>

                      <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                        <p className="text-slate-600">
                          <strong className="text-slate-700">Insight: </strong>
                          {rec.insight}
                        </p>
                        <p className="text-slate-600">
                          <strong className="text-slate-700">Reason: </strong>
                          {rec.reason}
                        </p>
                        <p className="text-[#0B72E7] font-semibold">
                          <strong>Action: </strong>
                          {rec.recommended_action}
                        </p>
                        <p className="text-emerald-700 font-bold font-mono">
                          Impact: {rec.expected_revenue_impact}
                        </p>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleApplyRec(rec.id)}
                          disabled={rec.status === 'APPLIED' || applyingId === rec.id}
                          className="h-7 px-3 rounded-lg text-[10px] font-bold bg-[#0B72E7] text-white hover:bg-[#095ec2] gap-1"
                        >
                          <Zap className="w-3 h-3 text-amber-300" />
                          <span>
                            {rec.status === 'APPLIED'
                              ? 'Applied'
                              : applyingId === rec.id
                              ? 'Applying...'
                              : 'Execute 1-Click'}
                          </span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <span className="text-[9px] block text-right opacity-60 mt-1">{m.timestamp}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0B72E7]" />
            <span>Growth Agent analyzing store metrics...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputVal);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask Growth Agent about sales, bundles, or discounts..."
            className="flex-1 h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0B72E7]"
          />
          <Button
            type="submit"
            disabled={loading || !inputVal.trim()}
            className="h-10 px-4 bg-[#0B72E7] hover:bg-[#095ec2] text-white rounded-xl font-bold text-xs"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
