'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MetricCard } from '@/components/common/MetricCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ExceptionDetailsDrawer } from '@/components/exceptions/ExceptionDetailsDrawer';
import { 
  ShieldAlert, 
  Search, 
  AlertTriangle, 
  Zap, 
  Eye, 
  CheckCircle2, 
  Filter,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ExceptionIntelligenceResponseDTO, 
  InvestigatedExceptionDTO, 
  ExceptionType 
} from '@/types/exceptions';
import { formatCurrency } from '@/lib/utils';

export default function ExceptionsPage() {
  const queryClient = useQueryClient();
  const [selectedException, setSelectedException] = useState<InvestigatedExceptionDTO | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('ALL');

  const { data, isLoading, error } = useQuery<ExceptionIntelligenceResponseDTO>({
    queryKey: ['exception-intelligence'],
    queryFn: () => apiClient.get('/exceptions'),
  });

  const resolveMutation = useMutation({
    mutationFn: (payload: { exception_id: string; resolution_action: string }) =>
      apiClient.post('/exceptions/resolve', payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['exception-intelligence'] });
      queryClient.invalidateQueries({ queryKey: ['executive-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['review-queue'] });
      if (selectedException && selectedException.exception_id === vars.exception_id) {
        setSelectedException({
          ...selectedException,
          status: 'Resolved',
        });
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-muted-foreground text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-medium">Exception Intelligence Agent investigating all settlement anomalies...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-sm text-destructive">
        Failed to load exception intelligence. Ensure the FastAPI backend is running on port 8000.
      </div>
    );
  }

  const { summary, exceptions } = data;

  const filteredExceptions = exceptions.filter((exc) => {
    const matchesSearch =
      exc.exception_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exc.txn_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exc.root_cause.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      activeTypeFilter === 'ALL' || exc.type === activeTypeFilter;

    return matchesSearch && matchesType;
  });

  const handleResolve = (exceptionId: string, action: string) => {
    resolveMutation.mutate({
      exception_id: exceptionId,
      resolution_action: action,
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Exception Intelligence Agent
            </h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
              Automated Forensic Diagnosis
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Deep root cause investigation across Missing Invoices, Duplicate Debits, Partial Settlements, Tax Discrepancies & Delayed Clearings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-3 py-1 font-mono">
            {summary.total_exceptions} Exceptions Investigated (100% Coverage)
          </Badge>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Exceptions"
          value={summary.total_exceptions}
          subtitle="Auto-investigated & diagnosed"
          icon={<Layers className="h-4 w-4" />}
        />
        <MetricCard
          title="Critical & High Risks"
          value={summary.critical_count + summary.high_count}
          subtitle={`${summary.critical_count} Critical, ${summary.high_count} High priority`}
          trend={summary.critical_count > 0 ? "negative" : "neutral"}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Exposure Value"
          value={formatCurrency(summary.total_exposure_amount)}
          subtitle="Reserves & pending discrepancy value"
          trend="neutral"
          icon={<FileSpreadsheet className="h-4 w-4" />}
        />
        <MetricCard
          title="AI Diagnosis Accuracy"
          value={`${summary.auto_investigated_pct.toFixed(0)}%`}
          subtitle="Grounded in accounting KB & rules"
          trend="positive"
          icon={<Zap className="h-4 w-4" />}
        />
      </div>

      {/* Filter Tabs by Exception Type */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
        {['ALL', 'Partial Settlement', 'Tax Mismatch', 'Delayed Settlement', 'Duplicate Payment', 'Missing Invoice'].map(
          (t) => (
            <Button
              key={t}
              variant={activeTypeFilter === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTypeFilter(t)}
              className="text-xs h-7"
            >
              {t === 'ALL' ? 'All Exceptions' : t}
              {t !== 'ALL' && summary.by_type[t] ? ` (${summary.by_type[t]})` : ''}
            </Button>
          )
        )}
      </div>

      {/* Main Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, Txn, Type, or Root Cause..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            Showing {filteredExceptions.length} of {exceptions.length} investigated exceptions
          </span>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">Exception ID</TableHead>
                <TableHead className="w-[90px]">Bank Txn</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Root Cause Summary</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Investigation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExceptions.map((exc) => (
                <TableRow
                  key={exc.exception_id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedException(exc)}
                >
                  <TableCell className="font-mono text-xs font-semibold text-primary">
                    {exc.exception_id}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{exc.txn_id}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[11px] font-medium">
                      {exc.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatCurrency(exc.amount)}
                  </TableCell>
                  <TableCell className="text-xs max-w-[240px] truncate text-muted-foreground" title={exc.root_cause}>
                    {exc.root_cause}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        exc.severity === 'Critical'
                          ? 'destructive'
                          : exc.severity === 'High'
                          ? 'warning'
                          : exc.severity === 'Medium'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="text-[10px] uppercase font-bold"
                    >
                      {exc.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {exc.confidence}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={exc.status === 'Resolved' ? 'success' : 'warning'} className="text-[10px]">
                      {exc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedException(exc)}
                      className="h-7 text-xs gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Diagnose
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Slide-out Investigation Drawer Panel */}
      <ExceptionDetailsDrawer
        exception={selectedException}
        onClose={() => setSelectedException(null)}
        onResolve={handleResolve}
        isResolving={resolveMutation.isPending}
      />
    </div>
  );
}
