'use client';

import React from 'react';
import { 
  Building2, 
  ShieldAlert, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertCircle 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface VendorKPIGridProps {
  totalVendors: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  averageRiskScore: number;
  totalExceptions: number;
}

export const VendorKPIGrid: React.FC<VendorKPIGridProps> = ({
  totalVendors,
  highRiskCount,
  mediumRiskCount,
  lowRiskCount,
  averageRiskScore,
  totalExceptions,
}) => {
  const kpis = [
    {
      title: 'Total Vendors',
      value: totalVendors,
      unit: 'Active',
      description: 'Tracked across all bank & gateway feeds',
      trend: '+2 this month',
      trendType: 'neutral',
      icon: Building2,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      title: 'High Risk Vendors',
      value: highRiskCount,
      unit: 'Outliers',
      description: 'Score ≥ 61 • AP verification required',
      trend: 'Requires Action',
      trendType: 'danger',
      icon: ShieldAlert,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
    {
      title: 'Medium Risk Vendors',
      value: mediumRiskCount,
      unit: 'Monitored',
      description: 'Score 31–60 • Standard tolerance bounds',
      trend: 'Stable range',
      trendType: 'neutral',
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      title: 'Low Risk Vendors',
      value: lowRiskCount,
      unit: 'Compliant',
      description: 'Score 0–30 • Zero billing discrepancy',
      trend: '99.8% match',
      trendType: 'positive',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Average Portfolio Risk',
      value: averageRiskScore,
      unit: '/ 100',
      description: 'Weighted 4-factor risk composition',
      trend: '+3.4 pts vs Q4',
      trendType: 'neutral',
      icon: Activity,
      color: 'text-[#0B72E7] bg-blue-50 border-blue-100',
    },
    {
      title: 'Total Exceptions',
      value: totalExceptions,
      unit: 'Events',
      description: 'Historical failure modes on memory record',
      trend: '12 auto-resolved',
      trendType: 'neutral',
      icon: AlertCircle,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card 
            key={kpi.title} 
            className="border border-slate-200/90 bg-white rounded-2xl p-4 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-slate-500 tracking-tight">
                {kpi.title}
              </span>
              <div className={`p-2 rounded-xl border ${kpi.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[30px] font-extrabold font-mono text-[#072654] leading-none">
                  {kpi.value}
                </span>
                <span className="text-[11px] font-medium text-slate-400 font-mono">
                  {kpi.unit}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug line-clamp-1">
                {kpi.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className={`font-semibold ${
                kpi.trendType === 'danger' 
                  ? 'text-rose-600' 
                  : kpi.trendType === 'positive' 
                  ? 'text-emerald-600' 
                  : 'text-slate-500'
              }`}>
                {kpi.trend}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
