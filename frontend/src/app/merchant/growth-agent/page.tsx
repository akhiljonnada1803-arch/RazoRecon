'use client';

import React, { useState } from 'react';
import { GrowthAgentDashboard } from '@/components/growth/GrowthAgentDashboard';
import { GrowthAgentChatDrawer } from '@/components/growth/GrowthAgentChatDrawer';
import { Bot, LayoutDashboard, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MerchantGrowthAgentPage() {
  const [activeView, setActiveView] = useState<'both' | 'dashboard' | 'chat'>('both');
  const [chatInitialQuery, setChatInitialQuery] = useState<string | undefined>(undefined);

  const handleOpenChatWithQuery = (query: string) => {
    setChatInitialQuery(query);
    if (activeView === 'dashboard') {
      setActiveView('both');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top View Toggle Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveView('both')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeView === 'both' ? 'bg-white text-[#072654] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Split View (Dashboard + Chat)
          </button>
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeView === 'dashboard' ? 'bg-white text-[#072654] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard Cards Only
          </button>
          <button
            onClick={() => setActiveView('chat')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeView === 'chat' ? 'bg-white text-[#072654] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Conversational Chat Only
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      {activeView === 'both' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 xl:col-span-8">
            <GrowthAgentDashboard onOpenChatWithQuery={handleOpenChatWithQuery} />
          </div>
          <div className="lg:col-span-5 xl:col-span-4 sticky top-6 h-[85vh]">
            <GrowthAgentChatDrawer initialQuery={chatInitialQuery} />
          </div>
        </div>
      ) : activeView === 'dashboard' ? (
        <GrowthAgentDashboard onOpenChatWithQuery={handleOpenChatWithQuery} />
      ) : (
        <div className="max-w-3xl mx-auto h-[82vh]">
          <GrowthAgentChatDrawer initialQuery={chatInitialQuery} />
        </div>
      )}
    </div>
  );
}
