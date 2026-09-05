'use client';

import React, { useState } from 'react';
import { 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X, 
  UploadCloud, 
  ShieldCheck, 
  Truck,
  CreditCard,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSuccess: () => void;
}

export function ReturnRequestModal({ isOpen, onClose, order, onSuccess }: ReturnRequestModalProps) {
  const [reason, setReason] = useState('Damaged Product in Transit');
  const [details, setDetails] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !order) return null;

  const returnReq = order.return_request;
  const refundInfo = order.refund;

  const RETURN_STEPS = [
    { key: 'REQUESTED', label: 'Return Requested' },
    { key: 'APPROVED', label: 'Return Approved' },
    { key: 'PICKUP_SCHEDULED', label: 'Courier Pickup' },
    { key: 'PICKUP_COMPLETED', label: 'Item Received' },
    { key: 'REFUND_PROCESSING', label: 'Refund Processing' },
    { key: 'REFUND_COMPLETED', label: 'Refund Completed' }
  ];

  const getCurrentStepIndex = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 0;
      case 'APPROVED': return 1;
      case 'PICKUP_SCHEDULED': return 2;
      case 'PICKUP_COMPLETED': return 3;
      case 'REFUND_PROCESSING': return 4;
      case 'REFUND_COMPLETED': return 5;
      default: return 0;
    }
  };

  const currentIdx = returnReq ? getCurrentStepIndex(returnReq.return_status) : -1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await apiClient.post(`/customer/orders/${order.id}/return`, {
        reason,
        details,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1556742049-0a67c55cb211?w=300&q=80',
        refund_amount: order.total_amount || order.amount || 0
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to submit return request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#072654]">
                {returnReq ? 'Return & Refund Tracking' : 'Request Product Return'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Order #{order.order_number || order.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Return Request Status Stepper */}
        {returnReq ? (
          <div className="space-y-6">
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-purple-950 uppercase font-mono">Return Status</span>
                <Badge className="bg-purple-100 text-purple-800 font-mono text-[10px]">
                  {returnReq.return_status}
                </Badge>
              </div>
              <p className="text-xs text-slate-700">
                Reason: <strong className="text-slate-900">{returnReq.reason}</strong>
              </p>
              <p className="text-[11px] text-slate-500">
                Pickup Window: <span className="font-semibold text-slate-700">{returnReq.pickup_date || 'Within 2 business days'}</span>
              </p>
            </div>

            {/* Stepper */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase font-mono tracking-wider block">
                Return & Refund Progression
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {RETURN_STEPS.map((step, idx) => {
                  const isDone = idx <= currentIdx;
                  return (
                    <div
                      key={step.key}
                      className={`p-2.5 rounded-xl border text-xs text-center ${
                        isDone
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${
                          isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                      </div>
                      <span className="text-[10px] block leading-tight">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Refund Details Tracker */}
            {refundInfo && (
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 uppercase font-mono text-[10px] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    Refund Amount: ₹{Number(refundInfo.amount).toLocaleString('en-IN')}
                  </span>
                  <Badge className="bg-emerald-600 text-white font-mono text-[10px]">
                    {refundInfo.status}
                  </Badge>
                </div>
                <div className="text-[11px] text-emerald-800">
                  Payment Method: <span className="font-mono font-semibold">{refundInfo.payment_method}</span>
                </div>
                <div className="text-[10px] font-mono text-emerald-700">
                  Transaction Ref: {refundInfo.transaction_id || 'N/A'}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={onClose} className="rounded-xl text-xs bg-slate-900 text-white">
                Close Tracker
              </Button>
            </div>
          </div>
        ) : (
          /* New Return Submission Form */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-2 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-[#0B72E7] shrink-0" />
              <span>
                15-Day Return Policy: Free doorstep pickup with 100% full refund to original payment source.
              </span>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Select Reason for Return *</label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Wrong Product Delivered">Wrong Product Delivered</option>
                <option value="Damaged Product in Transit">Damaged Product in Transit</option>
                <option value="Defective / Hardware Issue">Defective / Hardware Issue</option>
                <option value="Item No Longer Needed">Item No Longer Needed</option>
                <option value="Other">Other / Quality Mismatch</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Additional Details / Notes *</label>
              <textarea
                required
                rows={3}
                placeholder="Please describe the condition of the hardware package..."
                value={details}
                onChange={e => setDetails(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Optional Proof Image Attachment URL</label>
              <Input
                placeholder="https://example.com/item-photo.jpg"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="h-9 text-xs rounded-xl bg-slate-50"
              />
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Refund Amount</span>
                <span className="font-mono font-extrabold text-[#072654] text-sm">
                  ₹{Number(order.total_amount || order.amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Instant UPI / Bank Credit</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold px-5 h-9"
              >
                {isSubmitting ? 'Submitting Request...' : 'Generate Return Request'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
