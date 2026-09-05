'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  Zap,
  MapPin,
  Sparkles,
  Phone,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';

interface InstallationServiceItem {
  id: string;
  sku: string;
  title: string;
  category: string;
  tier: string;
  price: number;
  duration_mins: number;
  description: string;
  features: string[];
  technician_role: string;
  sla_hours: number;
}

interface InstallationBookingCardProps {
  productId: string;
  productName?: string;
  onBookingComplete?: (booking: any) => void;
  isAddonMode?: boolean;
}

export function InstallationBookingCard({
  productId,
  productName = 'Razorpay Commercial Hardware',
  onBookingComplete,
  isAddonMode = true
}: InstallationBookingCardProps) {
  const [services, setServices] = useState<InstallationServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-08');
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM - 01:00 PM');
  const [isAttached, setIsAttached] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    apiClient.get<InstallationServiceItem[]>('/installation/services')
      .then((data) => {
        if (data && data.length > 0) {
          setServices(data);
          setSelectedServiceId(data[0].id);
        }
      })
      .catch((err) => console.error('Failed to fetch installation services', err));
  }, []);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];

  const handleBookNow = async () => {
    if (!selectedService) return;
    setIsSubmitting(true);
    try {
      const payload = {
        product_id: productId,
        service_id: selectedService.id,
        customer_name: 'Rajesh Verma (Store Owner)',
        customer_phone: '+91 98450 11223',
        service_address: 'Shop #4, Phoenix Marketcity, Whitefield',
        pincode: '560048',
        scheduled_date: selectedDate,
        time_slot: selectedSlot,
        payment_method: 'razorpay_autopay'
      };
      const res: any = await apiClient.post('/installation/bookings', payload);
      setBookingSuccess(res);
      setIsAttached(true);
      if (onBookingComplete) {
        onBookingComplete(res);
      }
    } catch (e) {
      console.error('Failed to book installation service', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-2xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-emerald-950 text-sm">
              Certified Technician Scheduled!
            </h4>
            <p className="text-xs text-emerald-700 font-medium">
              Service Fee: ₹{bookingSuccess.price} (Paid via Razorpay AutoPay)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-emerald-200 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Assigned Engineer:</span>
            <p className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>{bookingSuccess.technician_name}</span>
            </p>
            <span className="text-[11px] text-slate-500">{bookingSuccess.technician_badge}</span>
          </div>

          <div>
            <span className="text-slate-500 font-medium">Slot & Security OTP:</span>
            <p className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{bookingSuccess.scheduled_date} ({bookingSuccess.time_slot})</span>
            </p>
            <span className="text-[11px] font-mono font-bold text-emerald-700">
              Completion OTP: <strong>{bookingSuccess.otp_code}</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-[#0B72E7] rounded-2xl">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Professional On-Site Installation & Staff Onboarding
              </h4>
              <Badge variant="outline" className="bg-blue-50 text-[#0B72E7] border-blue-200 text-[10px] font-bold">
                Razorpay Certified
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Hardware unboxing, cloud pairing, live test transaction, and staff certification.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-center">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Reduces Return Risk by 72%</span>
        </span>
      </div>

      {/* Tier Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {services.slice(0, 3).map((s) => {
          const isSelected = selectedServiceId === s.id;
          return (
            <div
              key={s.id}
              onClick={() => setSelectedServiceId(s.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'border-[#0B72E7] bg-blue-50/40 shadow-xs'
                  : 'border-slate-100 hover:border-slate-300 bg-slate-50/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-extrabold bg-white uppercase">
                    {s.tier}
                  </Badge>
                  <span className="font-extrabold font-mono text-slate-900 text-sm">
                    ₹{s.price}
                  </span>
                </div>
                <h5 className="font-bold text-slate-800 text-xs mt-2 line-clamp-1">
                  {s.title}
                </h5>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="text-[10px] text-slate-600 font-medium flex items-center justify-between pt-2 border-t border-slate-200/50">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{s.duration_mins} mins</span>
                </span>
                <span className="text-[#0B72E7] font-bold">
                  SLA: {s.sla_hours}h
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Date & Slot selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Preferred Installation Date:</span>
          </label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0B72E7]"
          >
            <option value="2026-09-06">Tomorrow, Sep 6 (Express)</option>
            <option value="2026-09-07">Monday, Sep 7</option>
            <option value="2026-09-08">Tuesday, Sep 8</option>
            <option value="2026-09-09">Wednesday, Sep 9</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Convenient Time Window:</span>
          </label>
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0B72E7]"
          >
            <option value="10:00 AM - 01:00 PM">Morning (10:00 AM - 01:00 PM)</option>
            <option value="02:00 PM - 05:00 PM">Afternoon (02:00 PM - 05:00 PM)</option>
            <option value="05:00 PM - 08:00 PM">Evening (05:00 PM - 08:00 PM)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-bold text-slate-700">
            Total Installation Add-On: <strong className="text-[#0B72E7] font-mono">₹{selectedService?.price || 499}</strong>
          </span>
        </div>

        <Button
          onClick={handleBookNow}
          disabled={isSubmitting}
          className="h-10 px-5 rounded-2xl bg-[#0B72E7] hover:bg-[#095ec2] text-white font-bold text-xs shadow-sm gap-1.5 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>{isSubmitting ? 'Confirming...' : 'Attach & AutoPay (1-Click)'}</span>
        </Button>
      </div>
    </div>
  );
}
