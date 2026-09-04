'use client';

import React from 'react';
import Link from 'next/link';
import { 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const EXCEPTIONS = [
  {
    id: 'exc-1',
    txnId: 'BT0004',
    date: '03/04/2026',
    entity: 'DIRECT WIRE TRF BENEFICIARY_1',
    amount: '₹8,900.00',
    type: 'Unvouched Wire',
    typeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    impact: 'Unknown Category',
    recommendation: 'Verify vendor GSTIN against procurement contract before clearance.',
    actionLabel: 'Categorize',
    href: '/review',
  },
  {
    id: 'exc-2',
    txnId: 'FRD-001',
    date: '03/02/2026',
    entity: 'AMAZON WEB SERVICES AWS',
    amount: '₹12,500.00',
    type: 'Duplicate Debit',
    typeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    impact: 'Double Billing Risk',
    recommendation: 'Duplicate debit within 3h; initiate bank recall.',
    actionLabel: 'Recall Debit',
    href: '/fraud',
  },
  {
    id: 'exc-3',
    txnId: 'AMZ-001',
    date: '03/05/2026',
    entity: 'Amazon Seller Central',
    amount: '₹1,780.73',
    type: 'Rolling Reserve',
    typeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    impact: 'Liquidity Withheld',
    recommendation: '14-day hold pending return rate check; unlocks Mar 28.',
    actionLabel: 'Track Release',
    href: '/reconciliation',
  },
  {
    id: 'exc-4',
    txnId: 'TX-009',
    date: '03/06/2026',
    entity: 'Shopify DTC Sales',
    amount: '₹100.00',
    type: 'GST Netting Variance',
    typeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    impact: 'Rounding Drift',
    recommendation: 'Auto-post minor rounding variance to GST Clearing.',
    actionLabel: 'Auto-Post',
    href: '/review',
  },
];

export const ExceptionResolutionTable: React.FC = () => {
  return (
    <Card className="border border-slate-200 bg-white shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-[#072654]">
              Exception Resolution Queue
            </CardTitle>
            <p className="text-xs text-slate-500">
              6 items requiring operator review (₹23,280.73 total exposure)
            </p>
          </div>
        </div>

        <Link href="/review">
          <Button size="sm" className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-md shadow-xs">
            <span>Open All (6 Items)</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-2.5 px-4">TXN ID & DATE</th>
              <th className="py-2.5 px-3">ENTITY / DESCRIPTION</th>
              <th className="py-2.5 px-3">EXCEPTION TYPE</th>
              <th className="py-2.5 px-3">AMOUNT</th>
              <th className="py-2.5 px-3">RECOMMENDED ACTION</th>
              <th className="py-2.5 px-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {EXCEPTIONS.map((exc) => (
              <tr key={exc.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4">
                  <span className="font-mono font-bold text-slate-800 block">{exc.txnId}</span>
                  <span className="text-[10px] text-slate-500">{exc.date}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="font-semibold text-slate-800 block truncate max-w-[180px]">{exc.entity}</span>
                  <span className="text-[10px] text-slate-500">{exc.impact}</span>
                </td>
                <td className="py-3 px-3">
                  <Badge variant="outline" className={`text-[10px] font-semibold py-0 h-4.5 ${exc.typeClass}`}>
                    {exc.type}
                  </Badge>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-slate-900">
                  {exc.amount}
                </td>
                <td className="py-3 px-3 text-[11px] text-slate-600 max-w-[240px] leading-tight">
                  {exc.recommendation}
                </td>
                <td className="py-3 px-4 text-right">
                  <Link href={exc.href}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2.5 rounded border-slate-300 hover:bg-slate-100 hover:text-slate-900 font-semibold"
                    >
                      {exc.actionLabel}
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
