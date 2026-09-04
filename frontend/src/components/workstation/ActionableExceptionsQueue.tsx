'use client';

import React from 'react';
import Link from 'next/link';
import { 
  AlertOctagon, 
  AlertCircle, 
  ShieldAlert, 
  ArrowRight, 
  Check, 
  Clock, 
  DollarSign,
  FileSearch,
  CheckCircle2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const PENDING_EXCEPTIONS = [
  {
    id: 'exc-1',
    txnId: 'BT0004',
    type: 'Unvouched Wire',
    category: 'Unknown / Suspense',
    entity: 'DIRECT WIRE TRF BENEFICIARY_1',
    amount: '₹8,900.00',
    severity: 'high' as const,
    issue: 'Wire transfer without purchase order or verified tax invoice attached.',
    recommendedAction: 'Verify vendor GSTIN against procurement contract before clearance.',
    actionLabel: 'Categorize Txn',
    href: '/review',
  },
  {
    id: 'exc-2',
    txnId: 'FRD-001',
    type: 'Duplicate Debit',
    category: 'Software & SaaS',
    entity: 'AMAZON WEB SERVICES AWS',
    amount: '₹12,500.00',
    severity: 'critical' as const,
    issue: 'Duplicate debit of ₹12,500.00 posted within 3 hours of primary billing.',
    recommendedAction: 'Freeze payout, initiate bank recall, and flag vendor AP entry.',
    actionLabel: 'Block Duplicate',
    href: '/fraud',
  },
  {
    id: 'exc-3',
    txnId: 'AMZ-001',
    type: 'Rolling Reserve',
    category: 'Marketplace Withholding',
    entity: 'Amazon Seller Central',
    amount: '₹1,780.73',
    severity: 'medium' as const,
    issue: '14-day rolling reserve withheld pending customer return validation.',
    recommendedAction: 'Reserve unlocks on March 28; auto-reconcile unlocked batch.',
    actionLabel: 'Track Reserve',
    href: '/reconciliation',
  },
  {
    id: 'exc-4',
    txnId: 'TX-009',
    type: 'Tax Variance',
    category: 'GST Rounding',
    entity: 'Shopify DTC Sales',
    amount: '₹100.00',
    severity: 'low' as const,
    issue: 'Minor ₹100 GST rounding variance between order subtotal and gross deposit.',
    recommendedAction: 'Auto-post minor rounding difference to GST Clearing account.',
    actionLabel: 'Auto-Post Variance',
    href: '/review',
  },
];

export const ActionableExceptionsQueue: React.FC = () => {
  return (
    <Card className="border border-border/80 bg-card shadow-sm">
      <CardHeader className="p-4 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <div>
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Active Exception Queue & Decision Items
            </CardTitle>
            <p className="text-xs text-foreground font-semibold mt-0.5">
              4 Categories Flagged (₹23,280.73 Total Value Under Investigation)
            </p>
          </div>
        </div>

        <Link href="/review">
          <Button size="sm" className="h-7 text-xs gap-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold">
            <span>Open All (6 Items)</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border/60 text-xs">
          {PENDING_EXCEPTIONS.map((exc) => (
            <div
              key={exc.id}
              className="p-3.5 px-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-foreground text-xs">{exc.txnId}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold ${
                      exc.severity === 'critical'
                        ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                        : exc.severity === 'high'
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                        : exc.severity === 'medium'
                        ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {exc.type}
                  </Badge>
                  <span className="font-semibold text-foreground">{exc.entity}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-mono font-bold text-foreground">{exc.amount}</span>
                </div>

                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  <strong className="text-foreground">Issue:</strong> {exc.issue}
                </p>

                <p className="text-[11px] text-primary/90 flex items-center gap-1 font-medium">
                  <strong className="text-foreground">Recommended:</strong> {exc.recommendedAction}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0">
                <Link href={exc.href}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-3 font-semibold border-border/80 hover:bg-muted hover:text-foreground"
                  >
                    {exc.actionLabel}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
