'use client';

import React from 'react';
import { 
  Settings, 
  Server, 
  ShieldCheck, 
  Key, 
  Radio, 
  Sliders, 
  Bell, 
  Database,
  Lock,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-[#071328] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs font-mono">
              SYSTEM CONFIGURATION
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-mono">
              PROTOCOL V1.4
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Platform System Settings
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Configure global Razorpay payment gateway parameters, AI agent search endpoints, webhook retry limits, and security protocols.
          </p>
        </div>

        <Button className="bg-[#0B72E7] hover:bg-blue-600 text-white text-xs font-bold rounded-xl h-10 px-4 shadow-sm">
          Save Configuration
        </Button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Razorpay Gateway Core */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0B72E7]">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Payment Gateway Infrastructure</h3>
              <p className="text-xs text-slate-500">Global Razorpay API keys & signature secrets</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Razorpay Key ID</label>
              <Input defaultValue="rzp_live_main_991823" className="font-mono text-xs rounded-xl" />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Webhook Secret Key (HMAC-SHA256)</label>
              <Input defaultValue="whsec_88412948194a8e2" type="password" className="font-mono text-xs rounded-xl" />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Auto-Capture Mode</label>
              <select className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl">
                <option>Automatic Capture (Instant Settlement)</option>
                <option>Manual Authorization & Delayed Capture</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: AI Agent & Catalog Protocol */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">AI Buyer Agent Protocol</h3>
              <p className="text-xs text-slate-500">Autonomous purchasing rate limits & schemas</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Catalog JSON Feed Rate Limit</label>
              <Input defaultValue="10,000 req / minute" className="text-xs rounded-xl" />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Max Auto-Order Amount per Agent (INR)</label>
              <Input defaultValue="500,000" className="font-mono text-xs rounded-xl" />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Vector Search Model</label>
              <select className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl">
                <option>text-embedding-3-small (Active)</option>
                <option>text-embedding-3-large</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
