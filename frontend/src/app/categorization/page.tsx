'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MetricCard } from '@/components/common/MetricCard';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { CheckCircle2, AlertCircle, BookOpen, Layers, Search } from 'lucide-react';
import { CategorizationResponseDTO } from '@/types/categorization';
import { formatCurrency } from '@/lib/utils';

export default function CategorizationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, error } = useQuery<CategorizationResponseDTO>({
    queryKey: ['categorization'],
    queryFn: () => apiClient.get('/categorization'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground text-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Categorizing transactions with RAG memory & policy index...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-sm text-destructive">
        Failed to load categorization data. Ensure FastAPI backend is running on port 8000.
      </div>
    );
  }

  const filteredItems = data.items.filter(
    (item) =>
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.txn_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transaction Categorization</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Categorization agent grounded by Accounting Policy RAG and historical memory.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="Total Transactions" 
          value={data.total_count} 
          icon={<Layers className="h-4 w-4" />} 
        />
        <MetricCard 
          title="Auto-Postable Rate" 
          value={`${(data.auto_post_rate * 100).toFixed(0)}%`} 
          subtitle={`${data.auto_post_count} transactions (Confidence >= 75%)`}
          trend="positive"
          icon={<CheckCircle2 className="h-4 w-4" />} 
        />
        <MetricCard 
          title="Requires Human Review" 
          value={data.review_count} 
          subtitle="Flagged or low-confidence"
          trend={data.review_count > 0 ? "negative" : "positive"}
          icon={<AlertCircle className="h-4 w-4" />} 
        />
      </div>

      {/* Table Container */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, memo, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            Showing {filteredItems.length} of {data.total_count} transactions
          </span>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[90px]">Txn ID</TableHead>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Predicted Category</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>P&L Section</TableHead>
                <TableHead>Cited Policy Rule</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((row) => (
                <TableRow key={row.txn_id}>
                  <TableCell className="font-mono text-xs font-medium">{row.txn_id}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.date}</TableCell>
                  <TableCell className="font-medium text-xs max-w-[220px] truncate" title={row.description}>
                    {row.description}
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono">
                    {formatCurrency(row.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {row.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-semibold ${
                        row.confidence >= 0.75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {(row.confidence * 100).toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.section}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={row.cited_rule ?? ''}>
                    {row.cited_rule !== "—" ? (
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <BookOpen className="h-3 w-3 inline shrink-0" />
                        <span className="truncate">{row.cited_rule}</span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {row.auto_post ? (
                      <Badge variant="success" className="text-[11px]">
                        Auto-Post
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-[11px]">
                        Review
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
