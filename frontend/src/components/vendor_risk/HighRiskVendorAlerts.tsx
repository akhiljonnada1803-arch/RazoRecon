'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  AlertTriangle, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  DollarSign,
  Building2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HighRiskAlertDTO } from '@/types/vendor_risk';
import { formatCurrency } from '@/lib/utils';

interface HighRiskVendorAlertsProps {
  alerts: HighRiskAlertDTO[];
}

export const HighRiskVendorAlerts: React.FC<HighRiskVendorAlertsProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <Card className="border border-emerald-200 bg-emerald-50/40 shadow-xs">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900">Zero Critical Vendor Outliers</h4>
            <p className="text-xs text-emerald-700">All tracked counterparties are currently operating within acceptable historical tolerance bounds.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-rose-200 bg-white shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-rose-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-rose-50 text-rose-600">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">
              High Risk Counterparty Alerts
            </CardTitle>
            <p className="text-xs text-slate-500">
              {alerts.length} vendors scored &gt; 60/100 due to recurring settlement delays & duplicate debits
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-[10px] font-bold font-mono bg-rose-50 text-rose-700 border-rose-300">
          {alerts.length} Active Alerts
        </Badge>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-slate-100 text-xs">
        {alerts.map((alert) => (
          <div key={alert.alert_id} className="p-3.5 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-rose-50/20 transition-colors">
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{alert.vendor}</span>
                <Badge variant="outline" className="text-[10px] font-bold font-mono bg-rose-50 text-rose-700 border-rose-200">
                  Risk Score: {alert.risk_score}/100
                </Badge>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-medium">Main Risk: <strong className="text-slate-900">{alert.main_risk}</strong></span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">Exposure: <strong className="font-mono text-slate-900">{formatCurrency(alert.exposure_amount)}</strong></span>
              </div>

              <p className="text-[11px] text-rose-800 bg-rose-50/80 p-2 rounded border border-rose-200 leading-snug">
                <strong className="font-semibold">Recommended Action:</strong> {alert.recommended_action}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-1 md:pt-0">
              <Link href="/review">
                <Button variant="outline" size="sm" className="h-7 text-xs font-semibold border-slate-300 hover:bg-slate-50">
                  Inspect Exceptions
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
