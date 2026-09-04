'use client';

import React from 'react';
import { 
  Sparkles, 
  ShieldAlert, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  FileCheck2, 
  AlertTriangle,
  Building2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const AIRecommendationsCard: React.FC = () => {
  const recommendations = [
    {
      id: 'REC-01',
      counterparty: 'ABC Logistics (Score: 82 / 100)',
      category: 'SLA Delay & GST Mitigation',
      priority: 'HIGH PRIORITY',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      action: 'Place upcoming batch payouts on dual-sign-off AP hold. Enforce carrier EDI consignment note synchronization to eliminate manual T+7 clearing lags and adjust SAC 9965 GST input tax credit.',
    },
    {
      id: 'REC-02',
      counterparty: 'Alpha Tech Consulting LLC (Score: 92 / 100)',
      category: 'Unvouched Wire & Contract Verification',
      priority: 'CRITICAL',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-300 font-bold',
      action: 'Freeze unvouched international wire disbursements immediately. Request corporate GSTIN registration certificate and valid Purchase Order before releasing further consulting disbursements.',
    },
    {
      id: 'REC-03',
      counterparty: 'Amazon Web Services AWS (Score: 48 / 100)',
      category: 'Duplicate Auto-Debit Prevention',
      priority: 'MEDIUM',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      action: 'Switch corporate billing profile to automated direct ACH netting to prevent concurrent credit card auto-retry duplicate charges.',
    },
  ];

  return (
    <Card className="border border-slate-200 bg-white shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 text-[#0B72E7]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-[#072654]">
              Autonomous AI Counterparty Recommendations
            </CardTitle>
            <p className="text-xs text-slate-500">
              Prescriptive mitigation playbooks derived from historical exception patterns & risk scores
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono bg-blue-50 text-[#0B72E7] border-blue-200">
          Agentic Playbooks
        </Badge>
      </CardHeader>

      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {recommendations.map((rec) => (
          <div key={rec.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-2.5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-400 font-bold">{rec.id}</span>
                <Badge variant="outline" className={`text-[9px] font-mono py-0 h-4 ${rec.badgeColor}`}>
                  {rec.priority}
                </Badge>
              </div>

              <h4 className="font-bold text-slate-900 text-xs">{rec.counterparty}</h4>
              <span className="text-[10px] text-slate-500 block font-medium">{rec.category}</span>
              <p className="text-[11px] text-slate-700 leading-relaxed bg-white p-2 rounded border border-slate-200/80">
                {rec.action}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs border-slate-300 hover:bg-white text-slate-700 font-semibold w-full justify-between"
            >
              <span>Execute Playbook</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
