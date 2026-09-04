'use client';

import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ShieldAlert, 
  Search, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  FileWarning,
  ArrowRight
} from 'lucide-react';
import { FraudAlertDTO } from '@/types/fraud';
import { formatCurrency } from '@/lib/utils';

interface FraudTableProps {
  alerts: FraudAlertDTO[];
  onUpdateStatus: (alertId: string, newStatus: string) => void;
  isUpdating?: boolean;
}

export const FraudTable: React.FC<FraudTableProps> = ({
  alerts,
  onUpdateStatus,
  isUpdating,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<FraudAlertDTO | null>(null);

  const filteredAlerts = alerts.filter(
    (a) =>
      a.alert_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.detection_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.triggered_rule.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Alert ID, Entity, Type, or Rule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-xs"
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          Showing {filteredAlerts.length} of {alerts.length} fraud detection flags
        </span>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Alert ID</TableHead>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead>Entity / Descriptor</TableHead>
              <TableHead className="text-right">Exposure</TableHead>
              <TableHead>Detection Type</TableHead>
              <TableHead>Triggered Rule</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Intervention Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlerts.map((alert) => (
              <TableRow key={alert.alert_id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {alert.alert_id}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{alert.date}</TableCell>
                <TableCell className="font-semibold text-xs max-w-[180px] truncate" title={alert.entity_name}>
                  {alert.entity_name}
                </TableCell>
                <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                  {formatCurrency(alert.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {alert.detection_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate" title={alert.triggered_rule}>
                  {alert.triggered_rule}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span
                      className={`text-xs font-bold ${
                        alert.risk_score >= 90
                          ? 'text-rose-600'
                          : alert.risk_score >= 75
                          ? 'text-amber-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {alert.risk_score}/100
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      alert.risk_level === 'Critical'
                        ? 'destructive'
                        : alert.risk_level === 'High'
                        ? 'warning'
                        : alert.risk_level === 'Medium'
                        ? 'secondary'
                        : 'outline'
                    }
                    className="text-[10px] uppercase font-bold"
                  >
                    {alert.risk_level}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      alert.status === 'Blocked'
                        ? 'destructive'
                        : alert.status === 'Cleared'
                        ? 'success'
                        : 'warning'
                    }
                    className="text-[10px]"
                  >
                    {alert.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {alert.status !== 'Blocked' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => onUpdateStatus(alert.alert_id, 'Blocked')}
                        className="h-7 text-[11px] px-2 gap-1 shadow-sm"
                      >
                        <Lock className="h-3 w-3" />
                        Block
                      </Button>
                    )}
                    {alert.status !== 'Cleared' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => onUpdateStatus(alert.alert_id, 'Cleared')}
                        className="h-7 text-[11px] px-2 gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Clear
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
