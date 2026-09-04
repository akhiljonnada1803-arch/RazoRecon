'use client';

import React from 'react';
import { 
  Bot, 
  ShoppingCart, 
  FileCheck2, 
  CreditCard, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type CheckoutStep = 'agent' | 'cart' | 'order' | 'checkout';

interface CheckoutWorkflowStepperProps {
  currentStep: CheckoutStep;
  itemsCount: number;
  finalAmount: number;
  orderCreated: boolean;
  paymentComplete: boolean;
  onStepClick?: (step: CheckoutStep) => void;
}

export function CheckoutWorkflowStepper({
  currentStep,
  itemsCount,
  finalAmount,
  orderCreated,
  paymentComplete,
  onStepClick,
}: CheckoutWorkflowStepperProps) {
  const steps: Array<{
    id: CheckoutStep;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    badge?: string;
  }> = [
    {
      id: 'agent',
      title: '1. Agent Assistant',
      subtitle: 'AI Natural Language Intent',
      icon: Bot,
      badge: 'Interactive AI',
    },
    {
      id: 'cart',
      title: '2. Interactive Cart',
      subtitle: `${itemsCount} item${itemsCount === 1 ? '' : 's'} configured`,
      icon: ShoppingCart,
      badge: itemsCount > 0 ? `${itemsCount} SKUs` : 'Empty',
    },
    {
      id: 'order',
      title: '3. Order Creation',
      subtitle: finalAmount > 0 ? `₹${finalAmount.toLocaleString('en-IN')}` : 'Subtotal & Taxes',
      icon: FileCheck2,
      badge: orderCreated ? 'Order Placed' : 'Dynamic Tax/Discount',
    },
    {
      id: 'checkout',
      title: '4. Razorpay Checkout',
      subtitle: paymentComplete ? 'Captured & Reconciled' : '1-Click Test Payment',
      icon: CreditCard,
      badge: paymentComplete ? 'Paid (0 Discrepancy)' : 'Sandbox Mode',
    },
  ];

  const getStepStatus = (stepId: CheckoutStep) => {
    if (paymentComplete && stepId === 'checkout') return 'complete';
    if (orderCreated && (stepId === 'agent' || stepId === 'cart' || stepId === 'order')) return 'complete';
    if (currentStep === stepId) return 'active';
    return 'idle';
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#0B72E7] to-[#072654] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#072654]">
                AI Checkout Engine
              </h1>
              <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px] font-bold">
                End-to-End Flow
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Agent → Cart → Order Creation → Razorpay Test Checkout & Auto-Reconciliation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {paymentComplete ? (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold border gap-1.5 px-3 py-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Settlement Reconciled
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs font-semibold px-3 py-1">
              Total: <strong className="ml-1 text-[#072654]">₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </Badge>
          )}
        </div>
      </div>

      {/* Stepper Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
        {steps.map((s, idx) => {
          const status = getStepStatus(s.id);
          const isCurrent = currentStep === s.id;
          const Icon = s.icon;

          return (
            <div
              key={s.id}
              onClick={() => onStepClick?.(s.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                status === 'complete'
                  ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                  : isCurrent
                  ? 'bg-blue-50/80 border-[#0B72E7] shadow-xs'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      status === 'complete'
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-[#0B72E7] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {status === 'complete' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span
                      className={`text-xs font-bold block truncate ${
                        isCurrent ? 'text-[#072654]' : 'text-slate-700'
                      }`}
                    >
                      {s.title}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {s.subtitle}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
