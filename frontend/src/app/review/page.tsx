'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { ReviewQueueResponseDTO } from '@/types/review';
import { formatCurrency } from '@/lib/utils';

const POPULAR_CATEGORIES = [
  'Shopify Sales',
  'Amazon Sales',
  'Advertising & Marketing',
  'Software & SaaS',
  'Payment Processing Fees',
  'Shipping & Fulfillment',
  'Cost of Goods Sold',
  'Payroll Expense',
  'Office & Admin',
  'Internal Transfer',
];

import { ZeroDataEmptyState } from '@/components/common/ZeroDataEmptyState';

export default function ReviewQueuePage() {
  const queryClient = useQueryClient();
  const [selectedTxn, setSelectedTxn] = useState<string | null>(null);
  const [overrideCat, setOverrideCat] = useState<string>('');

  const { data, isLoading, error } = useQuery<ReviewQueueResponseDTO>({
    queryKey: ['review-queue'],
    queryFn: () => apiClient.get('/review'),
  });

  const overrideMutation = useMutation({
    mutationFn: (payload: { txn_id: string; approved_category: string }) =>
      apiClient.post('/review/override', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-queue'] });
      queryClient.invalidateQueries({ queryKey: ['categorization'] });
      queryClient.invalidateQueries({ queryKey: ['income-statement'] });
      setSelectedTxn(null);
      setOverrideCat('');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground text-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading human-in-the-loop review queue...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-sm text-destructive">
        Failed to load review queue.
      </div>
    );
  }

  const { low_confidence_categorizations, unmatched_deposits, total_pending_review } = data;

  if (total_pending_review === 0 && low_confidence_categorizations.length === 0 && unmatched_deposits.length === 0) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#072654]">Exception Review Queue</h1>
            <p className="text-xs text-slate-500 mt-1">
              Human-in-the-loop exception resolution and operator audit queue.
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border-emerald-200">
            0 Pending Exceptions
          </Badge>
        </div>

        <ZeroDataEmptyState
          moduleName="Exception Review Queue"
          description="No exceptions detected. Generate demo data or connect a live gateway feed to begin continuous exception detection."
        />
      </div>
    );
  }

  const handleApprove = (txn_id: string, category: string) => {
    overrideMutation.mutate({ txn_id, approved_category: category });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Human Review Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Items the AI agent declined to auto-post. Financial operators retain absolute control.
          </p>
        </div>
        <Badge variant={total_pending_review === 0 ? "success" : "warning"} className="px-3 py-1 text-xs font-medium">
          {total_pending_review} Items Pending Review
        </Badge>
      </div>

      {/* Section 1: Low confidence categorization items */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Low-Confidence Categorizations ({low_confidence_categorizations.length})
            </CardTitle>
            <span className="text-xs text-muted-foreground">Confidence &lt; 75% or Marked as Needs Review</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {low_confidence_categorizations.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-emerald-500" />
              <span>All transaction categorizations have been approved or auto-posted!</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Txn ID</TableHead>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Suggested Category</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>AI Rationale</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {low_confidence_categorizations.map((item) => (
                  <TableRow key={item.txn_id}>
                    <TableCell className="font-mono text-xs font-medium">{item.txn_id}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.date}</TableCell>
                    <TableCell className="font-medium text-xs max-w-[200px] truncate" title={item.description}>
                      {item.description}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono">
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs font-normal">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {(item.confidence * 100).toFixed(0)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate" title={item.rationale}>
                      {item.rationale}
                    </TableCell>
                    <TableCell className="text-right">
                      {selectedTxn === item.txn_id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={overrideCat}
                            onChange={(e) => setOverrideCat(e.target.value)}
                            className="h-8 text-xs border rounded px-2 bg-background"
                          >
                            <option value="">Select Category...</option>
                            {POPULAR_CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            disabled={!overrideCat || overrideMutation.isPending}
                            onClick={() => handleApprove(item.txn_id, overrideCat)}
                            className="h-8 text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" /> Save
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {item.category !== 'Needs Review' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(item.txn_id, item.category)}
                              disabled={overrideMutation.isPending}
                              className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Accept
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedTxn(item.txn_id);
                              setOverrideCat(item.category !== 'Needs Review' ? item.category : '');
                            }}
                            className="h-8 text-xs"
                          >
                            Override
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Deposits needing human look */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            Deposits Flagged by Reconciliation Engine ({unmatched_deposits.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {unmatched_deposits.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              All deposits are reconciled cleanly.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Bank Txn</TableHead>
                  <TableHead className="text-right">Deposit Amount</TableHead>
                  <TableHead>Payout ID</TableHead>
                  <TableHead className="text-right">Expected Net</TableHead>
                  <TableHead className="text-right">Discrepancy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Audit Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unmatched_deposits.map((m) => (
                  <TableRow key={m.txn_id}>
                    <TableCell className="font-mono text-xs font-semibold">{m.txn_id}</TableCell>
                    <TableCell className="text-right text-xs font-mono font-medium">
                      {formatCurrency(m.deposit_amount)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{m.payout_id || "—"}</TableCell>
                    <TableCell className="text-right text-xs font-mono text-muted-foreground">
                      {m.expected_net !== null && m.expected_net !== undefined
                        ? formatCurrency(m.expected_net)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono text-rose-600 dark:text-rose-400 font-semibold">
                      {m.discrepancy !== null && m.discrepancy !== undefined
                        ? formatCurrency(m.discrepancy)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="warning" className="text-[11px]">
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{m.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
