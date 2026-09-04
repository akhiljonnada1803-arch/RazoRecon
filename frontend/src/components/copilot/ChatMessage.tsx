'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  User, 
  Terminal, 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CopilotMessageDTO } from '@/types/copilot';

interface ChatMessageProps {
  message: CopilotMessageDTO;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`py-4 px-4 sm:px-6 flex gap-4 ${
        isUser ? 'bg-transparent' : 'bg-muted/30 border-y border-border/40'
      }`}
    >
      {/* Avatar */}
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-emerald-600 text-white ring-2 ring-emerald-500/20'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message content */}
      <div className="flex-1 space-y-2.5 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            {isUser ? 'You (Financial Executive)' : 'CFO AI Copilot'}
          </span>
          {!isUser && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </Button>
          )}
        </div>

        {/* Text body */}
        <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap space-y-2">
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />
          )}
        </div>

        {/* Citations list */}
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-blue-500" />
              Policy Citations:
            </span>
            {message.citations.map((c, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-[10px] bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/20 font-mono"
              >
                [{c.doc_id}] {c.title}
              </Badge>
            ))}
          </div>
        )}

        {/* Collapsible Deterministic Tool Execution Trace */}
        {message.trace && message.trace.length > 0 && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTraceOpen(!isTraceOpen)}
              className="px-2 py-1 h-6 text-[11px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 bg-muted/50 rounded"
            >
              <Terminal className="h-3 w-3 text-emerald-500" />
              <span>Tool Execution Audit Trail ({message.trace.length} tools called)</span>
              {isTraceOpen ? <ChevronDown className="h-3 w-3 ml-1" /> : <ChevronRight className="h-3 w-3 ml-1" />}
            </Button>

            {isTraceOpen && (
              <div className="mt-2 space-y-2 rounded-lg border border-border/60 bg-muted/60 p-3 font-mono text-[11px]">
                {message.trace.map((t, idx) => (
                  <div key={idx} className="space-y-1 bg-background/80 p-2.5 rounded border border-border/50">
                    <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-bold">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        {t.tool}()
                      </span>
                      <span className="text-[10px] text-muted-foreground font-normal">Step {idx + 1}</span>
                    </div>
                    {Object.keys(t.args || {}).length > 0 && (
                      <div className="text-muted-foreground text-[10px]">
                        <strong>Args:</strong> {JSON.stringify(t.args)}
                      </div>
                    )}
                    <pre className="text-[10px] text-emerald-700 dark:text-emerald-300 overflow-x-auto bg-muted/40 p-1.5 rounded">
                      {typeof t.result === 'object' ? JSON.stringify(t.result, null, 2) : String(t.result)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
