'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChatMessage, 
  Product, 
  ComparisonData, 
  CartState 
} from '@/types/commerce';
import { ProductRecommendationCard } from './ProductRecommendationCard';
import { AIReviewIntelligenceCard } from './AIReviewIntelligenceCard';

import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ShoppingBag, 
  Zap, 
  RotateCcw, 
  GitCompare, 
  CheckCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CommerceChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onAddToCart: (product: Product) => void;
  onCompare: (product: Product) => void;
  onOpenComparison: (data: ComparisonData) => void;
  onOpenCart: () => void;
  onResetChat: () => void;
}

export function CommerceChatInterface({
  messages,
  onSendMessage,
  isLoading,
  onAddToCart,
  onCompare,
  onOpenComparison,
  onOpenCart,
  onResetChat,
}: CommerceChatInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handlePromptClick = (prompt: string) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      {/* Top Banner / Chat Toolbar */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#0B72E7] flex items-center justify-center text-white shadow-xs">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#072654]">
                Razorpay Commerce Agent
              </h3>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold py-0">
                Online & Catalog Synced
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              Natural language shopping, specs comparisons & 1-click Razorpay payment links
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onResetChat}
          className="h-8 px-2.5 text-xs font-semibold text-slate-600 border-slate-200 hover:bg-white rounded-xl gap-1.5"
          title="Clear conversational session"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          New Chat
        </Button>
      </div>

      {/* AI Product Advisor Quick Examples Strip */}
      <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
        <span className="text-[11px] font-bold text-[#072654] flex items-center gap-1 shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-[#0B72E7]" /> AI Advisor Searches:
        </span>
        {[
          "Best laptop under ₹60,000",
          "Smart TV under ₹40,000 with 4.5+ rating",
          "POS machine for small retail shop",
          "Printer with low maintenance cost",
          "Pros and cons of Razorpay POS Terminal V3"
        ].map((promptText, idx) => (
          <button
            key={idx}
            onClick={() => handlePromptClick(promptText)}
            className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#0B72E7] text-slate-700 hover:text-[#0B72E7] rounded-lg text-[11px] font-medium transition-all shrink-0 shadow-2xs cursor-pointer"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="h-8 w-8 rounded-xl bg-[#072654] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Bot className="h-4 w-4 text-blue-300" />
              </div>
            )}

            <div className={`space-y-3 max-w-2xl ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#0B72E7] text-white rounded-tr-xs shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                  {renderFormattedText(msg.content)}
                </div>
              </div>

              {/* AI Review Intelligence Card Banner */}
              {msg.review_intelligence && (
                <div className="w-full">
                  <AIReviewIntelligenceCard
                    initialIntelligence={msg.review_intelligence}
                    compact={false}
                  />
                </div>
              )}

              {/* AI Product Advisor Decision Banner */}
              {msg.recommendation_reason && (

                <div className="p-3.5 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200 rounded-2xl flex items-start gap-3 shadow-2xs w-full">
                  <div className="h-7 w-7 rounded-xl bg-[#0B72E7] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#072654] text-xs">
                        AI Product Advisor Decision
                      </span>
                      {msg.confidence_score && (
                        <Badge className="bg-emerald-600 text-white text-[10px] font-bold border-0 shadow-2xs">
                          {Math.round(msg.confidence_score * 100)}% Confidence
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-700 leading-relaxed font-normal">
                      {msg.recommendation_reason}
                    </p>
                  </div>
                </div>
              )}

              {/* Embedded Product Recommendations */}
              {msg.recommended_products && msg.recommended_products.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1 w-full">
                  {msg.recommended_products.map((prod) => (
                    <ProductRecommendationCard
                      key={prod.id}
                      product={prod}
                      onAddToCart={onAddToCart}
                      onCompare={onCompare}
                    />
                  ))}
                </div>
              )}

              {/* Embedded Comparison Matrix Card */}
              {msg.comparison_data && (
                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitCompare className="h-4 w-4 text-[#0B72E7]" />
                      <span className="font-bold text-xs text-[#072654]">
                        Comparison Matrix ({msg.comparison_data.products.length} Products)
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenComparison(msg.comparison_data!)}
                      className="h-7 text-xs font-semibold bg-white text-[#0B72E7] border-blue-200 hover:bg-blue-50 rounded-lg gap-1"
                    >
                      <span>Expand Full Matrix</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-slate-700 font-medium">
                    {msg.comparison_data.verdict}
                  </div>
                </div>
              )}

              {/* Suggested Follow-up Prompts */}
              {msg.suggested_prompts && msg.suggested_prompts.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {msg.suggested_prompts.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handlePromptClick(prompt)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#0B72E7] hover:bg-blue-50/50 hover:text-[#0B72E7] rounded-xl text-xs font-medium text-slate-700 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3 text-[#0B72E7]" />
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="h-8 w-8 rounded-xl bg-blue-100 text-[#0B72E7] flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                <User className="h-4 w-4 font-bold" />
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-[#072654] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="h-4 w-4 text-blue-300" />
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#0B72E7] animate-bounce" />
              <div className="h-2 w-2 rounded-full bg-[#0B72E7] animate-bounce [animation-delay:0.2s]" />
              <div className="h-2 w-2 rounded-full bg-[#0B72E7] animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs font-medium text-slate-500 ml-1">
                Searching catalog & pricing models...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Input Bar */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about products, compare specs, or say 'Add POS terminal to cart'..."
              className="w-full h-12 pl-4 pr-12 text-sm bg-white border border-slate-200 rounded-2xl outline-hidden focus:border-[#0B72E7] focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          <Button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="h-12 w-12 rounded-2xl bg-[#0B72E7] hover:bg-[#095bc0] text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function renderFormattedText(text: string): React.ReactNode {
  // Simple markdown processor for bold, code, links
  const lines = text.split('\n');
  return lines.map((line, lIdx) => {
    // Check for markdown headers
    if (line.startsWith('### ')) {
      return (
        <h4 key={lIdx} className="font-bold text-sm text-slate-900 my-1">
          {line.replace('### ', '')}
        </h4>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h3 key={lIdx} className="font-bold text-base text-slate-900 my-1.5">
          {line.replace('## ', '')}
        </h3>
      );
    }
    
    // Parse bold, code, bullet points
    const parts = line.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
    return (
      <div key={lIdx} className="min-h-[1.25rem]">
        {parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-slate-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code key={pIdx} className="px-1.5 py-0.5 rounded bg-slate-200/80 font-mono text-xs text-slate-900">
                {part.slice(1, -1)}
              </code>
            );
          }
          if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
            const label = part.slice(1, part.indexOf(']('));
            const url = part.slice(part.indexOf('](') + 2, -1);
            return (
              <a
                key={pIdx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0B72E7] underline font-semibold hover:text-[#072654]"
              >
                {label}
              </a>
            );
          }
          return part;
        })}
      </div>
    );
  });
}
