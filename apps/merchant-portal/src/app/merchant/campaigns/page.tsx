'use client';

import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Sparkles, 
  Play, 
  Pause, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  Send, 
  Users, 
  Flame, 
  ArrowUpRight, 
  MessageSquare, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { apiClient } from '@/lib/api-client';

export default function CampaignManagerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOffer, setNewOffer] = useState('');
  const [newGoal, setNewGoal] = useState('Revenue Expansion');

  const fetchCampaigns = () => {
    apiClient.get<any>('/merchant/growth/campaigns')
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load campaigns', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    apiClient.post<any>(`/merchant/growth/campaigns/${id}/toggle`, { status: nextStatus })
      .then(() => fetchCampaigns())
      .catch(err => console.error('Failed to toggle campaign', err));
  };

  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    apiClient.post<any>('/merchant/growth/campaigns/launch', {
      title: newTitle,
      goal: newGoal,
      discount_offer: newOffer || '10% OFF 1st Autonomous Reorder',
      channels: ['WhatsApp AutoPay Push', 'Storefront Banner', 'SMS']
    })
      .then(() => {
        setIsModalOpen(false);
        setNewTitle('');
        setNewOffer('');
        fetchCampaigns();
      })
      .catch(err => console.error('Failed to launch campaign', err));
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Loading AI Campaign Manager...</span>
        </div>
      </div>
    );
  }

  const summary = data.summary || {};
  const campaigns = data.campaigns || [];

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-[#072654] via-[#0C3977] to-[#0B72E7] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-blue-400/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
                <Megaphone className="w-3.5 h-3.5 mr-1" />
                AI Autonomous Marketing Engine
              </Badge>
              <Badge className="bg-white/10 text-blue-200 border-white/20 text-xs font-mono">
                {summary.blended_roi_multiplier}x Blended ROI
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Growth Campaign Manager
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-2xl">
              Deploy autonomous targeted incentives, consumable reorder prompts, POS trade-in campaigns, and WhatsApp AutoPay push triggers with real-time ROI attribution.
            </p>
          </div>

          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl px-5 py-3 shadow-lg shadow-emerald-500/20 shrink-0 text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create AI Growth Campaign
          </Button>
        </div>
      </div>

      {/* 2. 4 TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Campaigns</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {summary.active_campaigns} <span className="text-sm font-normal text-slate-400">/ {summary.total_campaigns}</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Multi-channel broadcast active
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attributed Revenue</span>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            ₹{((summary.total_attributed_revenue_inr || 0) / 100000).toFixed(2)} L
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">
            From ₹{(summary.total_spend_inr || 0).toLocaleString('en-IN')} total spend
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blended ROI Multiplier</span>
          <div className="text-2xl font-black text-[#0B72E7] font-mono">
            {summary.blended_roi_multiplier || 0}x
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Every ₹1 spend returns ₹{summary.blended_roi_multiplier || 0}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Conversions</span>
          <div className="text-2xl font-black text-purple-600 font-mono">
            {summary.total_conversions || 0}
          </div>
          <span className="text-[11px] font-semibold text-purple-600">
            Verified completed purchases
          </span>
        </div>
      </div>

      {/* 3. CAMPAIGNS GRID */}
      {campaigns.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-4">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">{data.message || "No campaigns created."}</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Launch targeted customer incentive and autonomous AutoPay campaigns to boost store GMV.
            </p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0B72E7] hover:bg-blue-600 text-white font-bold rounded-2xl px-5 py-2.5 text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create First Campaign
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((c: any) => {
          const isActive = c.status === 'ACTIVE';
          return (
            <div key={c.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={`text-[10px] font-mono font-bold ${
                    isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {c.status}
                  </Badge>

                  <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 font-mono text-[10px] font-bold">
                    ROI: {c.roi_multiplier}x
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900">{c.title}</h3>
                  <span className="text-[11px] font-semibold text-purple-600 font-mono">Goal: {c.goal}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Segment:</span>
                    <span className="font-bold text-slate-800">{c.target_segment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Incentive Offer:</span>
                    <span className="font-bold text-emerald-600">{c.discount_offer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Broadcast Channels:</span>
                    <span className="font-mono text-slate-700 font-semibold">{c.channels.join(', ')}</span>
                  </div>
                </div>

                {/* ROI Attribution Meter */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-emerald-50/40 rounded-2xl border border-emerald-100 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Audience</span>
                    <span className="text-xs font-bold text-slate-800">{c.audience_reach}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Conversions</span>
                    <span className="text-xs font-bold text-purple-700">{c.conversions}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Attributed GMV</span>
                    <span className="text-xs font-bold text-emerald-700">₹{(c.attributed_revenue_inr / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Button 
                  size="sm" 
                  onClick={() => handleToggleStatus(c.id, c.status)}
                  variant={isActive ? 'outline' : 'default'}
                  className={`flex-1 font-bold text-xs rounded-xl py-2 ${
                    isActive 
                      ? 'border-amber-300 text-amber-700 hover:bg-amber-50' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Pause className="w-3.5 h-3.5 mr-1" /> Pause Campaign
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 mr-1" /> Resume Campaign
                    </>
                  )}
                </Button>

                <Button size="sm" variant="ghost" className="text-xs font-bold text-slate-500 hover:text-slate-900 rounded-xl">
                  Edit Rules
                </Button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* 4. MODAL: LAUNCH NEW CAMPAIGN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-[#0B72E7] flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Launch AI Growth Campaign</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleLaunchCampaign} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Campaign Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Flash Consumables 20% OFF Restock"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-[#0B72E7]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Campaign Goal</label>
                <select 
                  value={newGoal} 
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-[#0B72E7]"
                >
                  <option value="Replenishment Retention">Replenishment Retention</option>
                  <option value="Hardware Fleet Upgrade">Hardware Fleet Upgrade</option>
                  <option value="AOV Expansion">AOV Expansion</option>
                  <option value="Churn Winback">Churn Winback</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Discount Offer & Incentive</label>
                <input 
                  type="text" 
                  placeholder="e.g. ₹1,500 Flat OFF + Free Thermal Rolls"
                  value={newOffer}
                  onChange={(e) => setNewOffer(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-[#0B72E7]"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-slate-700 text-[11px] leading-relaxed">
                🤖 <strong>Autonomous Delivery:</strong> Campaign will automatically sync via WhatsApp AutoPay direct purchase links and storefront banners.
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-md">
                  Deploy & Activate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
