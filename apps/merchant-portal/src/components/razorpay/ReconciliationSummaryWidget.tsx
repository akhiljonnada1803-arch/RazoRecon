'use client';

import React from 'react';
import Link from 'next/link';
import { 
  GitCompare, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  Layers
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const CHANNELS = [
  {
    channel: 'Shopify DTC Payments',
    volume: '₹1,42,000.00',
    batches: 18,
    matchRate: '100.0%',
    status: 'Matched',
    statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    notes: 'Exact penny match (T+2 settlement cycles)',
  },
  {
    channel: 'Amazon Seller Central',
    volume: '₹1,18,000.00',
    batches: 15,
    matchRate: '84.5%',
    status: 'Reserves Held',
    statusClass: 'bg-amber-50 text-amber-700 border-amber-200',
    notes: '₹1,780.73 withheld (14-day rolling reserve)',
  },
  {
    channel: 'Stripe Gateway Feed',
    volume: '₹98,000.00',
    batches: 12,
    matchRate: '100.0%',
    status: 'Matched',
    statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    notes: 'Zero math drift verified against bank feed',
  },
];

export const ReconciliationSummaryWidget: React.FC = () => {
  return (
    <Card className="border border-slate-200 bg-white shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 text-[#0B72E7]">
            <GitCompare className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-[#072654]">
              Multi-Channel Reconciliation Status
            </CardTitle>
            <p className="text-xs text-slate-500">
              Gross-to-net deposit matching across payment gateways
            </p>
          </div>
        </div>

        <Link href="/reconciliation">
          <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-md border-slate-200 hover:bg-slate-50">
            <span>View Full Ledger</span>
            <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 text-xs">
          {CHANNELS.map((c) => (
            <div
              key={c.channel}
              className="p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/70 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{c.channel}</span>
                  <Badge variant="outline" className={`text-[10px] font-semibold py-0 h-4 ${c.statusClass}`}>
                    {c.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  {c.notes}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-1 sm:pt-0">
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-800 block">{c.volume}</span>
                  <span className="text-[10px] text-slate-500">{c.batches} Batches • {c.matchRate} Matched</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
