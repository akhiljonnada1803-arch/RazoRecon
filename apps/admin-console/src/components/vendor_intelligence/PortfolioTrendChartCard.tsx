'use client';

import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { TrendingUp, Activity, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RiskTrendPointDTO } from '@/types/vendor_risk';

interface PortfolioTrendChartCardProps {
  trend: RiskTrendPointDTO[];
}

export const PortfolioTrendChartCard: React.FC<PortfolioTrendChartCardProps> = ({ trend }) => {
  return (
    <Card className="border border-slate-200/90 bg-white rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-[22px] font-bold text-[#072654] tracking-tight">
            Portfolio Risk Trend
          </h2>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Quarterly trajectory of mean counterparty risk and high-risk threshold breaches
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0B72E7]" />
            <span className="text-slate-600 font-medium">Mean Risk Score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-600 font-medium">High Risk Vendors</span>
          </div>
        </div>
      </div>

      <div className="h-[240px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#94A3B8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis 
              domain={[0, 100]} 
              stroke="#94A3B8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip
              formatter={(value: any, name: any) => [
                name === 'avg_risk_score' ? `${value} / 100` : `${value} Vendors`,
                name === 'avg_risk_score' ? 'Mean Risk' : 'High Risk Count'
              ]}
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                borderColor: '#E2E8F0', 
                borderRadius: '12px', 
                fontSize: '12px', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' 
              }}
            />
            <Line 
              type="monotone" 
              dataKey="avg_risk_score" 
              stroke="#0B72E7" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#0B72E7', strokeWidth: 2, stroke: '#FFFFFF' }} 
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="high_risk_count" 
              stroke="#EF4444" 
              strokeWidth={2} 
              strokeDasharray="4 4" 
              dot={{ r: 3, fill: '#EF4444' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
        <span>Portfolio Tolerance Target: ≤ 40.0 / 100</span>
        <span className="font-mono text-slate-700 font-semibold">
          Current Mean: {trend.length > 0 ? trend[trend.length - 1].avg_risk_score : 0} / 100
        </span>
      </div>
    </Card>
  );
};
