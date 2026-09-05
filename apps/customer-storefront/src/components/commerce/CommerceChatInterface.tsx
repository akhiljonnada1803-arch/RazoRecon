'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChatMessage, 
  Product, 
  ComparisonData, 
  DeliveryAddress,
  AdvisorOrderSummary
} from '@/types/commerce';
import { AdvisorProductCard } from './AdvisorProductCard';
import { AdvisorComparisonTable } from './AdvisorComparisonTable';
import { AdvisorAddressSelector } from './AdvisorAddressSelector';
import { AdvisorOrderSummaryCard } from './AdvisorOrderSummaryCard';
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
  ShieldCheck,
  Award,
  PackageCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CommerceChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onAddToCart: (product: Product) => void;
  onBuyAutoPay?: (product: Product) => void;
  isAutoPayEnabled?: boolean;
  onCompare: (product: Product) => void;
  onOpenComparison: (data: ComparisonData) => void;
  onOpenCart: () => void;
  onResetChat: () => void;
  onSelectProduct?: (product: Product) => void;
  onSelectAddress?: (address: DeliveryAddress, product: Product) => void;
  onConfirmAutoPayPurchase?: (product: Product, address: DeliveryAddress) => void;
}

export function CommerceChatInterface({
  messages,
  onSendMessage,
  isLoading,
  onAddToCart,
  onBuyAutoPay,
  isAutoPayEnabled,
  onCompare,
  onOpenComparison,
  onOpenCart,
  onResetChat,
  onSelectProduct,
  onSelectAddress,
  onConfirmAutoPayPurchase,
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

  const handleProductSelect = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      onSendMessage(`Select ${product.name}`);
    }
  };

  const handleAddressSelect = (address: DeliveryAddress, product: Product) => {
    if (onSelectAddress) {
      onSelectAddress(address, product);
    } else {
      onSendMessage(`Ship to ${address.label}`);
    }
  };

  const handleConfirmPurchase = (product: Product, address: DeliveryAddress) => {
    if (onConfirmAutoPayPurchase) {
      onConfirmAutoPayPurchase(product, address);
    } else {
      onSendMessage(`Confirm & Buy ${product.name} via AutoPay`);
    }
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
                AI Commerce Personal Shopping Advisor
              </h3>
              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-semibold py-0.5 border-0 shadow-xs">
                ⚡ 10-Step Advisory Flow Active
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              Personalized multi-factor product matching, Pros &amp; Cons comparison, and autonomous AutoPay buying
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onResetChat}
          className="h-8 px-2.5 text-xs font-semibold text-slate-600 border-slate-200 hover:bg-white rounded-xl gap-1.5 cursor-pointer"
          title="Clear conversational session"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          New Advisory
        </Button>
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

            <div className={`space-y-4 max-w-3xl ${msg.role === 'user' ? 'items-end' : 'items-start'} w-full`}>
              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#0B72E7] text-white rounded-tr-xs shadow-xs ml-auto max-w-xl'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                  {renderFormattedText(msg.content)}
                </div>
              </div>

              {/* STEP 3: TOP 3 PRODUCT RECOMMENDATION CARDS WITH PROS & CONS */}
              {msg.recommended_products && msg.recommended_products.length > 0 && msg.flow_step !== 'ADDRESS_SELECTION' && msg.flow_step !== 'ORDER_SUMMARY' && msg.flow_step !== 'AUTONOMOUS_PURCHASE' && (
                <div className="space-y-4 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#072654] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Top 3 Candidate Recommendations
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Ranked by Budget, Specs, Trust &amp; Delivery SLA
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {msg.recommended_products.slice(0, 3).map((prod, idx) => (
                      <AdvisorProductCard
                        key={prod.id || idx}
                        product={prod}
                        rankIndex={idx}
                        isRecommended={idx === 0}
                        onSelect={handleProductSelect}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: SIDE-BY-SIDE COMPARISON MATRIX TABLE */}
              {msg.comparison_data && msg.flow_step !== 'ADDRESS_SELECTION' && msg.flow_step !== 'ORDER_SUMMARY' && msg.flow_step !== 'AUTONOMOUS_PURCHASE' && (
                <div className="w-full">
                  <AdvisorComparisonTable data={msg.comparison_data} />
                </div>
              )}

              {/* STEP 7: INTERACTIVE ADDRESS SELECTION CARD */}
              {msg.flow_step === 'ADDRESS_SELECTION' && msg.selected_product && (
                <div className="w-full max-w-xl">
                  <AdvisorAddressSelector
                    product={msg.selected_product}
                    addresses={msg.saved_addresses || []}
                    onSelectAddress={(addr) => handleAddressSelect(addr, msg.selected_product!)}
                  />
                </div>
              )}

              {/* STEP 8 & 9: ORDER SUMMARY & AUTOPAY PRE-FLIGHT VERIFICATION */}
              {msg.flow_step === 'ORDER_SUMMARY' && msg.order_summary && (
                <div className="w-full max-w-xl">
                  <AdvisorOrderSummaryCard
                    summary={msg.order_summary}
                    onConfirmAutoPay={() => handleConfirmPurchase(msg.selected_product!, msg.selected_address!)}
                    onManualCheckout={() => onAddToCart(msg.selected_product!)}
                    onChangeAddress={() => handleProductSelect(msg.selected_product!)}
                  />
                </div>
              )}

              {/* STEP 10: AUTOPAY AUTONOMOUS ORDER RECEIPT */}
              {msg.autonomous_order && (
                <div className="p-5 bg-slate-900 border border-emerald-500/40 rounded-3xl text-white space-y-4 w-full max-w-xl shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                        AutoPay Autonomous Receipt
                      </span>
                    </div>
                    <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-700/60">
                      Order #{msg.autonomous_order.order_id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-extrabold text-sm text-white">
                        {msg.autonomous_order.product?.name || msg.selected_product?.name || 'Autonomous Purchase'}
                      </div>
                      <div className="text-[11px] text-emerald-200/80 mt-0.5">
                        Payment: <strong>{msg.autonomous_order.payment_method}</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-emerald-400 font-mono">
                        ₹{(msg.autonomous_order.total || 0).toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-emerald-300 font-bold">✓ AutoPay Approved</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-slate-300">
                      Invoice generated &amp; carrier dispatch scheduled via Delhivery.
                    </span>
                    <a
                      href={`/orders/${msg.autonomous_order.order_id}`}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition whitespace-nowrap"
                    >
                      View Order Dossier →
                    </a>
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
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 text-xs font-medium text-slate-700 hover:text-[#0B72E7] transition-all text-left shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3 text-indigo-500" />
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3.5 justify-start">
            <div className="h-8 w-8 rounded-xl bg-[#072654] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Bot className="h-4 w-4 text-blue-300" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Analyzing requirements, evaluating specs, ranking candidates &amp; verifying AutoPay guardrails...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-slate-200 bg-white flex items-center gap-3 shrink-0"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask your Personal Shopping Advisor (e.g. 'I need a laptop under ₹60,000' or 'Find the best POS machine')..."
            className="w-full pl-4 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="h-11 px-5 rounded-2xl bg-[#0B72E7] hover:bg-[#095ec2] text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>Send</span>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}

// Simple markdown formatter helper for chat bubbles
function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\n)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-extrabold text-[#072654]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} className="italic text-slate-600">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="bg-slate-200 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-[11px]">{part.slice(1, -1)}</code>;
    }
    if (part === '\n') {
      return <br key={index} />;
    }
    return part;
  });
}
