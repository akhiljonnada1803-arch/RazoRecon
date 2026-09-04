'use client';

import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskDistributionPointDTO, RiskTrendPointDTO } from '@/types/vendor_risk';

interface VendorRiskChartsProps {
  distribution: RiskDistributionPointDTO[];
  trend: RiskTrendPointDTO[];
}

export const VendorRiskCharts: React.FC<VendorRiskChartsProps> = ({ distribution, trend }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Risk Distribution Chart */}
      <Card className="border border-slate-200 bg-white shadow-xs">
        <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">
              Vendor Risk Distribution
            </CardTitle>
            <p className="text-xs text-slate-500">
              Breakdown by Low (0-30), Medium (31-60), and High (61-100)
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono text-slate-500">
            Portfolio Breakdown
          </Badge>
        </CardHeader>

        <CardContent className="p-4 pt-6">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis dataKey="level" type="category" stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} Vendors`, 'Count']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
            {distribution.map((d) => (
              <div key={d.level} className="p-2 rounded bg-slate-50">
                <span className="text-[10px] text-slate-500 block">{d.level}</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{d.count} ({d.percentage}%)</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2. Risk Trend Chart */}
      <Card className="border border-slate-200 bg-white shadow-xs">
        <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">
              Historical Risk Trend Trajectory
            </CardTitle>
            <p className="text-xs text-slate-500">
              Average counterparty risk score progression over accounting quarters
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono text-slate-500">
            4-Period Trend
          </Badge>
        </CardHeader>

        <CardContent className="p-4 pt-6">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    name === 'avg_risk_score' ? `${value} / 100` : value,
                    name === 'avg_risk_score' ? 'Avg Risk Score' : 'High Risk Vendors'
                  ]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="avg_risk_score" name="Average Risk Score" stroke="#0B72E7" strokeWidth={2.5} dot={{ r: 4, fill: '#0B72E7' }} />
                <Line type="monotone" dataKey="high_risk_count" name="High Risk Vendors" stroke="#EF4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: '#EF4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs px-2">
            <span className="text-slate-500">Current Average Score:</span>
            <span className="font-mono font-bold text-slate-900">
              {trend.length > 0 ? trend[trend.length - 1].avg_risk_score : 0} / 100
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
