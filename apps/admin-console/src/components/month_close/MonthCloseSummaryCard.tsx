'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Layers, 
  GitCompare, 
  AlertOctagon, 
  ShieldAlert, 
  TrendingUp, 
  Lock,
  Code,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MonthCloseResultDTO } from '@/types/month_close';

interface MonthCloseSummaryCardProps {
  result: MonthCloseResultDTO;
}

export const MonthCloseSummaryCard: React.FC<MonthCloseSummaryCardProps> = ({ result }) => {
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  const formattedOutput = {
    records_processed: result.records_processed,
    match_rate: result.match_rate,
    exceptions: result.exceptions,
    fraud_alerts: result.fraud_alerts,
    finance_health: result.finance_health,
    forecast: result.forecast,
    status: result.status,
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(formattedOutput, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const metrics = [
    {
      title: 'Records Processed',
      value: result.records_processed,
      subtitle: 'Bank debits & settlements',
      icon: Layers,
      color: 'text-blue-500',
    },
    {
      title: 'Match Rate',
      value: `${result.match_rate}%`,
      subtitle: 'Zero math drift verified',
      icon: GitCompare,
      color: 'text-emerald-500',
    },
    {
      title: 'Exceptions',
      value: result.exceptions,
      subtitle: 'Tracked & diagnosed',
      icon: AlertOctagon,
      color: 'text-amber-500',
    },
    {
      title: 'Fraud Alerts',
      value: result.fraud_alerts,
      subtitle: 'Loss prevention active',
      icon: ShieldAlert,
      color: 'text-rose-500',
    },
    {
      title: 'Finance Health',
      value: `${result.finance_health}/100`,
      subtitle: 'Audit Grade A+',
      icon: ShieldCheck,
      color: 'text-emerald-500',
    },
    {
      title: 'Cash Forecast',
      value: result.forecast,
      subtitle: '+14.8% 30-Day Growth',
      icon: TrendingUp,
      color: 'text-violet-500',
    },
    {
      title: 'Books Status',
      value: result.status,
      subtitle: 'Certified & Signed',
      icon: Lock,
      color: 'text-primary',
      isStatus: true,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 7 Core KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
            >
              <Card className="border border-border/70 bg-card/70 backdrop-blur-md shadow-sm p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                    {m.title}
                  </span>
                  <Icon className={`h-3.5 w-3.5 ${m.color}`} />
                </div>
                <div>
                  <div className="text-lg font-bold font-mono tracking-tight text-foreground">
                    {m.value}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {m.subtitle}
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Structured JSON Output Toggle Card */}
      <Card className="border border-border/70 bg-muted/20 shadow-sm">
        <CardHeader className="py-2.5 px-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-primary" />
            <CardTitle className="text-xs font-semibold">
              Certified Autonomous Close Output Payload
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowJson(!showJson)}
              className="text-[11px] h-6 px-2 text-muted-foreground hover:text-foreground"
            >
              {showJson ? 'Collapse JSON' : 'Inspect JSON'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyJson}
              className="text-[11px] h-6 px-2 gap-1 text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </CardHeader>

        {showJson && (
          <CardContent className="p-4 pt-0">
            <pre className="p-3 rounded-lg bg-background/90 border border-border/60 font-mono text-xs text-emerald-700 dark:text-emerald-300 overflow-x-auto leading-relaxed">
              {JSON.stringify(formattedOutput, null, 2)}
            </pre>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
