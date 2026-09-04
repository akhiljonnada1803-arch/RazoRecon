'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Database, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  RefreshCw,
  Layers,
  BookOpen
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const LOADED_DATASETS = [
  {
    id: 'bank-feed',
    name: 'Operating Bank Feed',
    filename: 'bank_feed.csv',
    recordCount: '100 Transactions',
    totalVolume: '₹59,772.12 Net',
    lastSync: 'Synced 10m ago',
    status: 'Healthy',
    statusVariant: 'success' as const,
    href: '/categorization',
  },
  {
    id: 'shopify',
    name: 'Shopify DTC Payouts',
    filename: 'shopify_payouts.csv',
    recordCount: '18 Settlement Batches',
    totalVolume: '₹1,42,000.00 Gross',
    lastSync: 'Synced 10m ago',
    status: '100% Matched',
    statusVariant: 'success' as const,
    href: '/reconciliation',
  },
  {
    id: 'amazon',
    name: 'Amazon Seller Central',
    filename: 'amazon_payouts.csv',
    recordCount: '15 Settlement Batches',
    totalVolume: '₹1,18,000.00 Gross',
    lastSync: 'Synced 10m ago',
    status: '4 Reserves Held',
    statusVariant: 'warning' as const,
    href: '/reconciliation',
  },
  {
    id: 'stripe',
    name: 'Stripe Gateway Feed',
    filename: 'stripe_payouts.csv',
    recordCount: '12 Settlement Batches',
    totalVolume: '₹98,000.00 Gross',
    lastSync: 'Synced 10m ago',
    status: '100% Matched',
    statusVariant: 'success' as const,
    href: '/reconciliation',
  },
  {
    id: 'policy-rag',
    name: 'Accounting Policy Index',
    filename: 'accounting_policy_kb.json',
    recordCount: '148 GAAP Passages',
    totalVolume: 'Coverage 100%',
    lastSync: 'Indexed & Ready',
    status: 'Active',
    statusVariant: 'success' as const,
    href: '/copilot',
  },
];

export const LoadedFeedsCard: React.FC = () => {
  return (
    <Card className="border border-border/80 bg-card shadow-sm">
      <CardHeader className="p-4 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <div>
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Loaded Financial Datasets
            </CardTitle>
            <p className="text-xs text-foreground font-semibold mt-0.5">
              5 Data Sources Active (229 Total Records Loaded)
            </p>
          </div>
        </div>

        <Link href="/demo">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-border/80 hover:bg-muted font-medium">
            <RefreshCw className="h-3 w-3" />
            <span>Generate Scenario</span>
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border/60 text-xs">
          {LOADED_DATASETS.map((ds) => (
            <div
              key={ds.id}
              className="p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-1.5 rounded-md bg-muted text-muted-foreground shrink-0 mt-0.5 sm:mt-0">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{ds.name}</span>
                    <code className="text-[10px] text-muted-foreground font-mono bg-muted/60 px-1.5 py-0.2 rounded border border-border/40">
                      {ds.filename}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    <span>{ds.recordCount}</span>
                    <span>•</span>
                    <span className="font-mono">{ds.totalVolume}</span>
                    <span>•</span>
                    <span>{ds.lastSync}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0">
                <Badge
                  variant={ds.statusVariant === 'warning' ? 'destructive' : 'secondary'}
                  className={`text-[10px] font-medium ${
                    ds.statusVariant === 'warning'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {ds.status}
                </Badge>

                <Link
                  href={ds.href}
                  className="text-primary hover:underline text-[11px] font-medium flex items-center gap-0.5"
                >
                  <span>View Feed</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
