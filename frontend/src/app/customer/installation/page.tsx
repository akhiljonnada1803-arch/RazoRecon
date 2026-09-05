'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  UserCheck,
  MapPin,
  ChevronRight,
  Phone,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function CustomerInstallationPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      apiClient.get<any[]>('/installation/bookings/customer/usr_customer_demo'),
      apiClient.get<any>('/installation/analytics/overview')
    ])
      .then(([bks, kp]) => {
        setBookings(bks || []);
        setKpis(kp || null);
      })
      .catch((err) => console.error('Failed to load installation bookings', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-[#0B72E7] rounded-2xl">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#072654]">
                Certified Installation & Field Deployment
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Track assigned Razorpay hardware technicians, view security OTPs, and manage on-site visits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="rounded-xl text-xs font-bold border-slate-200 gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </Button>
            <Link href="/catalog">
              <Button
                size="sm"
                className="rounded-xl text-xs font-bold bg-[#0B72E7] text-white hover:bg-[#095ec2] gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book New Hardware</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* KPIs bar */}
        {kpis && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'On-Time Arrival SLA', val: `${kpis.on_time_completion_rate}%`, sub: 'Guaranteed Field SLA' },
              { label: 'Customer Satisfaction', val: `${kpis.customer_satisfaction_score} ★`, sub: 'Across 1,200+ deployments' },
              { label: 'Average Setup Time', val: `${kpis.avg_turnaround_hours}h`, sub: 'Arrival to verification' },
              { label: 'Active Field Engineers', val: `${kpis.active_deployments}`, sub: 'Operating in Bengaluru Metro' }
            ].map((k, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{k.label}</span>
                <p className="text-xl font-black font-mono text-slate-900 mt-1">{k.val}</p>
                <span className="text-[10px] text-emerald-700 font-medium">{k.sub}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[#072654]">Your Installation Appointments</h2>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading installation appointments...</div>
          ) : bookings.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Wrench className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No active installation bookings found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bookings.map((b) => (
                <div key={b.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-extrabold uppercase ${
                            b.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-[#0B72E7] border-blue-200'
                          }`}
                        >
                          {b.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs font-mono font-bold text-slate-400">#{b.id}</span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base mt-1.5">{b.product_name}</h3>
                      <p className="text-xs text-[#0B72E7] font-semibold">{b.service_title}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-medium">Service Fee (Paid):</span>
                      <p className="text-lg font-black font-mono text-slate-900">₹{b.price}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-slate-400 font-medium">Assigned Engineer:</span>
                      <p className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>{b.technician_name}</span>
                      </p>
                      <span className="text-[11px] text-slate-500 block">{b.technician_badge}</span>
                      <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{b.technician_phone}</span>
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-slate-400 font-medium">Scheduled Appointment:</span>
                      <p className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                        <Calendar className="w-4 h-4 text-[#0B72E7]" />
                        <span>{b.scheduled_date}</span>
                      </p>
                      <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{b.time_slot}</span>
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{b.service_address}</span>
                      </span>
                    </div>

                    <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 flex flex-col justify-between">
                      <div>
                        <span className="text-emerald-800 font-bold block">Service Completion OTP:</span>
                        <p className="text-2xl font-black font-mono text-emerald-700 tracking-wider mt-1">
                          {b.otp_code}
                        </p>
                        <p className="text-[10px] text-emerald-700 mt-1">
                          Share this OTP with the engineer only after hardware is unboxed and tested.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Checklist */}
                  {b.checklist && b.checklist.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Engineer Installation Checklist:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {b.checklist.map((c: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-slate-50">
                            <CheckCircle2
                              className={`w-3.5 h-3.5 ${
                                c.done || b.status === 'completed' ? 'text-emerald-600' : 'text-slate-300'
                              }`}
                            />
                            <span className="text-slate-700 font-medium text-[11px]">{c.task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
