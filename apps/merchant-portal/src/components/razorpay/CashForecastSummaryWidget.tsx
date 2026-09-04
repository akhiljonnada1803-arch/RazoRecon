'use client';

import React from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign, 
  Calendar, 
  ShieldCheck 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const FORECAST_HORIZONS = [
  {
    horizon: '7-Day Projection',
    inflow: '₹38,200.00',
    outflow: '₹19,400.00',
    netCash: '+₹18,800.00',
    closingBalance: '₹8,04,220.50',
    confidence: '97% Confidence',
    status: 'Positive',
  },
  {
    horizon: '30-Day Projection',
    inflow: '₹1,42,000.00',
    outflow: '₹66,180.00',
    netCash: '+₹75,820.00',
    closingBalance: '₹8,61,240.50',
    confidence: '93% Confidence',
    status: '+14.8% Growth',
  },
  {
    horizon: '90-Day Projection',
    inflow: '₹4,12,000.00',
    outflow: '₹1,98,000.00',
    netCash: '+₹2,14,000.00',
    closingBalance: '₹9,99,420.50',
    confidence: '88% Confidence',
    status: 'Runway > 15 Mo',
  },
];

export const CashForecastSummaryWidget: React.FC = () => {
  return (
    <Card className="border border-slate-200 bg-white shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 text-[#0B72E7]">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-[#072654]">
              Cash Flow & Treasury Projections
            </CardTitle>
            <p className="text-xs text-slate-500">
              Multi-horizon expected inflows vs outflows based on historical settlement velocity
            </p>
          </div>
        </div>

        <Link href="/forecast">
          <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-md border-slate-200 hover:bg-slate-50">
            <span>Detailed Forecast</span>
            <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FORECAST_HORIZONS.map((h) => (
            <div
              key={h.horizon}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-2 hover:bg-slate-50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{h.horizon}</span>
                  <Badge variant="outline" className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
                    {h.status}
                  </Badge>
                </div>

                <div className="space-y-1 pt-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Expected Inflows:</span>
                    <span className="font-mono font-semibold text-emerald-600">{h.inflow}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Expected Outflows:</span>
                    <span className="font-mono font-semibold text-slate-700">{h.outflow}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-800 font-bold pt-1 border-t border-slate-200">
                    <span>Net Cash Flow:</span>
                    <span className="font-mono text-[#0B72E7]">{h.netCash}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Closing Balance:</span>
                <span className="font-mono font-bold text-slate-900">{h.closingBalance}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
