'use client';

import React from 'react';
import { 
  Megaphone, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Tag, 
  CheckCircle2, 
  Clock, 
  PauseCircle, 
  PlayCircle, 
  Trash2, 
  Sparkles,
  MessageSquare,
  Mail,
  Smartphone,
  PhoneCall,
  ArrowUpRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Campaign } from '@/types/campaign';

interface CampaignTableProps {
  campaigns: Campaign[];
  onToggleStatus: (campaignId: string, currentStatus: string) => void;
  onDeleteCampaign: (campaignId: string) => void;
  onSelectCampaign: (campaign: Campaign) => void;
}

export function CampaignTable({
  campaigns,
  onToggleStatus,
  onDeleteCampaign,
  onSelectCampaign
}: CampaignTableProps) {
  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getChannelIcon = (ch: string) => {
    const c = ch.toLowerCase();
    if (c.includes('whatsapp')) return <MessageSquare className="h-3 w-3 text-emerald-600" />;
    if (c.includes('email')) return <Mail className="h-3 w-3 text-blue-600" />;
    if (c.includes('call') || c.includes('rm')) return <PhoneCall className="h-3 w-3 text-purple-600" />;
    return <Smartphone className="h-3 w-3 text-slate-600" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px] font-semibold flex items-center gap-1">
            <Clock className="h-3 w-3 text-[#0B72E7]" />
            Scheduled
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-semibold">
            Completed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-semibold">
            Draft
          </Badge>
        );
    }
  };

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3 shadow-2xs">
        <div className="h-12 w-12 rounded-2xl bg-blue-50 text-[#0B72E7] mx-auto flex items-center justify-center">
          <Megaphone className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Campaigns Configured</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Generate your first AI campaign or simulate discount elasticity curves to begin orchestrating targeted merchant growth.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#072654]">Active & Scheduled Campaigns</h2>
          <p className="text-[11px] text-slate-500">
            Real-time performance projections, expected revenue lift, and customer segment attribution.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold text-slate-400">
          {campaigns.length} total entries
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            <tr>
              <th className="py-3 px-4">Campaign Name</th>
              <th className="py-3 px-4">Target Segment</th>
              <th className="py-3 px-4">Discount Mechanics</th>
              <th className="py-3 px-4">Expected Revenue Lift</th>
              <th className="py-3 px-4">Projected Orders</th>
              <th className="py-3 px-4">Channels</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campaigns.map((camp) => (
              <tr 
                key={camp.id}
                className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                onClick={() => onSelectCampaign(camp)}
              >
                {/* 1. Campaign Name */}
                <td className="py-3.5 px-4">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-[#0B72E7] transition-colors">
                      <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>{camp.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                      <span>ID: {camp.id}</span>
                      <span>•</span>
                      <span>{camp.start_date} to {camp.end_date}</span>
                    </div>
                  </div>
                </td>

                {/* 2. Target Segment */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{camp.target_segment}</span>
                  </div>
                </td>

                {/* 3. Discount Mechanics */}
                <td className="py-3.5 px-4">
                  <div className="space-y-0.5">
                    <Badge variant="outline" className="text-[10px] font-mono bg-slate-50 border-slate-200 text-slate-700">
                      {camp.discount_type === 'percentage' 
                        ? `${camp.discount_value}% OFF` 
                        : `₹${camp.discount_value.toLocaleString('en-IN')} Flat`}
                    </Badge>
                    <div className="text-[10px] text-slate-400">
                      Min order: ₹{camp.min_order_value.toLocaleString('en-IN')}
                    </div>
                  </div>
                </td>

                {/* 4. Expected Revenue Lift */}
                <td className="py-3.5 px-4">
                  <div className="space-y-0.5">
                    <div className="font-bold text-emerald-600 font-mono text-xs flex items-center gap-1">
                      <span>+{formatINR(camp.expected_revenue_lift)}</span>
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded w-fit border border-emerald-100">
                      +{camp.expected_revenue_lift_pct}% lift
                    </div>
                  </div>
                </td>

                {/* 5. Projected Orders */}
                <td className="py-3.5 px-4">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 font-mono text-xs flex items-center gap-1.5">
                      <ShoppingBag className="h-3.5 w-3.5 text-purple-600" />
                      <span>{camp.projected_orders.toLocaleString()} orders</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      GMV: {formatINR(camp.projected_gmv)}
                    </div>
                  </div>
                </td>

                {/* 6. Channels */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {camp.channels.map((ch, idx) => (
                      <div 
                        key={idx} 
                        className="h-6 w-6 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600"
                        title={ch}
                      >
                        {getChannelIcon(ch)}
                      </div>
                    ))}
                  </div>
                </td>

                {/* 7. Status */}
                <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                  {getStatusBadge(camp.status)}
                </td>

                {/* 8. Actions */}
                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] text-slate-600 hover:text-[#0B72E7] hover:bg-blue-50"
                      onClick={() => onToggleStatus(camp.id, camp.status)}
                      title={camp.status === 'active' ? 'Pause Campaign' : 'Activate Campaign'}
                    >
                      {camp.status === 'active' ? (
                        <PauseCircle className="h-3.5 w-3.5 text-amber-600" />
                      ) : (
                        <PlayCircle className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] text-slate-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => onDeleteCampaign(camp.id)}
                      title="Delete Campaign"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
