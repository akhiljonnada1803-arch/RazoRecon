'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  Plus, 
  MessageSquare, 
  RefreshCw, 
  ShieldCheck, 
  Terminal,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/components/copilot/ChatMessage';
import { SuggestedPrompts } from '@/components/copilot/SuggestedPrompts';
import { CopilotMessageDTO } from '@/types/copilot';

const INITIAL_MESSAGE: CopilotMessageDTO = {
  id: 'init-1',
  role: 'assistant',
  content:
    "Hello! I am your **CFO AI Copilot**. I have live access to your posted ledger, reconciliation engine, 90-day cash forecasts, fraud sentinel, and the 148-passage accounting policy knowledge base.\n\nAll figures are computed in deterministic Python — never hallucinated. How can I assist your financial operations today?",
  citations: [{ doc_id: 'kb-0001', title: 'Financial Operations & Governance' }],
};

export default function CFOCopilotPage() {
  const [messages, setMessages] = useState<CopilotMessageDTO[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
      isStreaming: true,
      trace: [],
      citations: [],
    };

    setMessages([...newMessages, initialAssistantMsg]);

    try {
      const response = await fetch('/api/v1/copilot/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming connection failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let traceData: any[] = [];
      let citationsData: any[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'metadata') {
                traceData = data.trace || [];
                citationsData = data.citations || [];
              } else if (data.type === 'content') {
                accumulatedContent += data.delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: accumulatedContent,
                          trace: traceData,
                          citations: citationsData,
                        }
                      : m
                  )
                );
              } else if (data.type === 'done') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                  )
                );
              }
            } catch (e) {
              // Ignore line parse errors during chunking
            }
          }
        }
      }
    } catch (err) {
      // Fallback to standard query endpoint
      try {
        const fallbackRes = await fetch('/api/v1/copilot/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        const fallbackData = await fallbackRes.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: fallbackData.answer,
                  trace: fallbackData.trace,
                  citations: fallbackData.citations,
                  isStreaming: false,
                }
              : m
          )
        );
      } catch (fallbackErr) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: 'Encountered an issue executing tool planning. Please ensure the backend is running.',
                  isStreaming: false,
                }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-7.5rem)] pb-2">
      {/* Top Copilot Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              CFO Executive Copilot
              <Badge variant="outline" className="text-[10px] bg-emerald-500/5 text-emerald-600 border-emerald-500/20 font-mono">
                ReAct Agent
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">
              Direct reasoning across match rates, cash flows, fraud sentinel & accounting policy.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetChat}
            className="text-xs h-8 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New Session
          </Button>
        </div>
      </div>

      {/* Message Stream Area (ChatGPT style) */}
      <div className="flex-1 overflow-y-auto space-y-2 py-4 rounded-xl">
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}

        {messages.length === 1 && (
          <div className="p-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Suggested Executive Prompts
            </span>
            <SuggestedPrompts
              onSelectPrompt={handleSend}
              disabled={isLoading}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Bar */}
      <div className="shrink-0 pt-3 border-t border-border/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="relative flex items-center bg-card rounded-xl border border-border/80 shadow-md focus-within:ring-2 focus-within:ring-primary/30 transition-all"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about match rate, cash runway, fraud risks, or vendor exceptions..."
            disabled={isLoading}
            className="border-0 shadow-none focus-visible:ring-0 text-sm py-5 pl-4 pr-12 bg-transparent"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-transform active:scale-95 disabled:opacity-40"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        <p className="text-[10px] text-center text-muted-foreground mt-2">
          CFO Copilot verifies every figure via deterministic Python ledger tools. Policy justifications cite the 148-passage KB.
        </p>
      </div>
    </div>
  );
}
