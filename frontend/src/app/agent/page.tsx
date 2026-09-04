'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ToolExecutionTrace } from '@/components/agent/ToolExecutionTrace';
import { Bot, Send, Sparkles, User, RefreshCw } from 'lucide-react';
import { AgentQueryResponseDTO } from '@/types/agent';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  trace?: AgentQueryResponseDTO['trace'];
}

export default function AgentPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I am your Financial Operations Copilot. I answer questions about channel revenue, P&L summaries, category balances, and accounting policies by invoking deterministic calculation tools and knowledge base search.",
    },
  ]);

  const mutation = useMutation<AgentQueryResponseDTO, Error, string>({
    mutationFn: (question: string) => apiClient.post('/agent/query', { question }),
    onSuccess: (data, question) => {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: question },
        { role: 'assistant', content: data.answer, trace: data.trace },
      ]);
      setInput('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || mutation.isPending) return;
    mutation.mutate(input.trim());
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    mutation.mutate(prompt);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          Financial Operations Copilot
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Multi-step agentic planning. Numbers are fetched via deterministic tools — never hallucinated.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            handleSuggestedPrompt('What was my revenue by channel, and is operating income positive or negative?')
          }
          className="text-xs"
        >
          <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
          Revenue by Channel & Operating Income
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSuggestedPrompt('What was our advertising and marketing spend in 2026-03?')}
          className="text-xs"
        >
          <Sparkles className="h-3 w-3 mr-1 text-emerald-500" />
          Advertising Spend (2026-03)
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSuggestedPrompt('What is our accounting policy for Meta and Facebook ad charges?')}
          className="text-xs"
        >
          <Sparkles className="h-3 w-3 mr-1 text-blue-500" />
          Policy for Meta Ads
        </Button>
      </div>

      <Card className="border-border shadow-sm min-h-[500px] flex flex-col justify-between">
        <CardContent className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[600px]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`rounded-lg px-4 py-3 max-w-[85%] text-sm ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/70 text-foreground border border-border/40'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                {m.trace && m.trace.length > 0 && <ToolExecutionTrace traces={m.trace} />}
              </div>
              {m.role === 'user' && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {mutation.isPending && (
            <div className="flex gap-3 items-center text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              <span>Agent planning steps & invoking tools...</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-border/60 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2 w-full">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about revenue, COGS, OpEx, or accounting policies..."
              className="flex-1 text-sm"
              disabled={mutation.isPending}
            />
            <Button type="submit" disabled={mutation.isPending || !input.trim()}>
              <Send className="h-4 w-4 mr-1" />
              Ask
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
