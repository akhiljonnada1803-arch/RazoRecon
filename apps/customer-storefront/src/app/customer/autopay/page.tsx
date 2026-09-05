'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CustomerHeader } from '@/components/layout/CustomerHeader';

interface Settings {
  user_id: string;
  monthly_budget: number;
  spent_this_month: number;
  max_single_purchase_limit: number;
  allowed_categories: string[];
  merchant_trust_level: string;
  purchase_mode: string;
  approval_threshold: number;
  autopay_enabled: boolean;
  connected_mandate_id?: string;
  remaining_budget: number;
  spent_percentage: number;
  last_autonomous_purchase?: {
    product_name: string;
    amount: number;
    order_id: string;
    timestamp: string;
    reason: string;
  } | null;
}

interface Mandate {
  id: string;
  type: string;
  bank_name: string;
  account_or_vpa_masked: string;
  max_amount: number;
  status: string;
  billing_frequency: string;
  expires_at?: string;
}

interface Recommendation {
  id: string;
  product_id: string;
  product_name: string;
  category: string;
  sku: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  merchant_name: string;
  merchant_verified: number;
  reasoning: string;
  confidence_score: number;
  need_urgency: string;
  predicted_date: string;
  status: string;
  order_id?: string;
}

interface ExecutionLog {
  id: string;
  order_id: string;
  product_name: string;
  category: string;
  sku: string;
  merchant_name: string;
  merchant_verified: number;
  amount: number;
  mandate_id?: string;
  payment_method: string;
  purchase_reason: string;
  approval_type: string;
  guardrails_validated?: Record<string, string>;
  budget_before: number;
  budget_after: number;
  status: string;
  refund_status: string;
  refund_reason?: string;
  refund_order_id?: string;
  timestamp: string;
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  metadata?: any;
  is_read: boolean;
  timestamp: string;
}

interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  is_default: number;
}

export default function CustomerAutoPayPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [activeTab, setActiveTab] = useState<'rules' | 'mandates' | 'recommendations' | 'history'>('rules');

  // Address picker modal state
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [pendingRecId, setPendingRecId] = useState<string | null>(null);
  const [pendingRecName, setPendingRecName] = useState<string>('');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Spending Rules Form State
  const [budgetInput, setBudgetInput] = useState<number>(25000);
  const [singleLimitInput, setSingleLimitInput] = useState<number>(5000);
  const [selectedCats, setSelectedCats] = useState<string[]>(['HARDWARE', 'SOFTWARE', 'ACCESSORIES', 'SUBSCRIPTIONS']);
  const [merchantTrust, setMerchantTrust] = useState<string>('VERIFIED_ONLY');
  const [purchaseMode, setPurchaseMode] = useState<string>('AUTO_BUY');
  const [savingRules, setSavingRules] = useState(false);
  const [rulesSuccessMsg, setRulesSuccessMsg] = useState('');

  // Modals & Drawers
  const [showMandateModal, setShowMandateModal] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'error' | 'info' } | null>(null);

  // New Mandate Form State
  const [mandateType, setMandateType] = useState<string>('UPI_AUTOPAY');
  const [bankName, setBankName] = useState<string>('HDFC Bank');
  const [accountInput, setAccountInput] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [mandateMaxAmount, setMandateMaxAmount] = useState<number>(25000);
  const [submittingMandate, setSubmittingMandate] = useState(false);

  // Autonomous Cycle State
  const [runningAutoCycle, setRunningAutoCycle] = useState(false);
  const [autoCycleResult, setAutoCycleResult] = useState<any | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMsg({ title, desc, type });
    setTimeout(() => setToastMsg(null), 5000);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, addrRes] = await Promise.all([
        fetch('/api/v1/customer/autopay/dashboard'),
        fetch('/api/v1/customer/addresses')
      ]);
      if (!dashRes.ok) throw new Error('Failed to load AutoPay data');
      const data = await dashRes.json();

      setSettings(data.settings);
      setMandates(data.mandates || []);
      setRecommendations(data.upcoming_recommendations || []);
      setLogs(data.execution_history || []);
      setNotifications(data.notifications || []);

      // Load saved addresses for autopay delivery picker
      if (addrRes.ok) {
        const addrData = await addrRes.json();
        const addrList: Address[] = Array.isArray(addrData) ? addrData : (addrData.addresses || []);
        setAddresses(addrList);
        // Pre-select the default address
        const defaultAddr = addrList.find((a) => a.is_default === 1);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        else if (addrList.length > 0) setSelectedAddressId(addrList[0].id);
      }

      // Pre-fill form inputs
      if (data.settings) {
        setBudgetInput(data.settings.monthly_budget);
        setSingleLimitInput(data.settings.max_single_purchase_limit);
        setSelectedCats(data.settings.allowed_categories || ['HARDWARE', 'SOFTWARE', 'ACCESSORIES', 'SUBSCRIPTIONS']);
        setMerchantTrust(data.settings.merchant_trust_level || 'VERIFIED_ONLY');
        setPurchaseMode(data.settings.purchase_mode || 'AUTO_BUY');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error Loading Data', err.message || 'Could not connect to AutoPay service', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 1. Toggle AutoPay Master Switch
  const handleToggleAutoPay = async () => {
    if (!settings) return;
    const newStatus = !settings.autopay_enabled;
    try {
      const res = await fetch('/api/v1/customer/autopay/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autopay_enabled: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update AutoPay status');
      const updated = await res.json();
      setSettings(updated);
      showToast(
        newStatus ? 'AutoPay Activated' : 'AutoPay Paused',
        newStatus ? 'Autonomous purchasing is now enabled within your spending limits.' : 'Autonomous purchasing is paused. No auto-buys will execute.',
        newStatus ? 'success' : 'info'
      );
      fetchDashboardData();
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
    }
  };

  // 2. Save Spending Rules
  const handleSaveSpendingRules = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingRules(true);
    setRulesSuccessMsg('');
    try {
      const res = await fetch('/api/v1/customer/autopay/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthly_budget: budgetInput,
          max_single_purchase_limit: singleLimitInput,
          allowed_categories: selectedCats,
          merchant_trust_level: merchantTrust,
          purchase_mode: purchaseMode,
        }),
      });
      if (!res.ok) throw new Error('Failed to save spending rules');
      const updated = await res.json();
      setSettings(updated);
      setRulesSuccessMsg('Spending rules updated successfully!');
      showToast('Rules Saved', 'Your new spending limits and guardrails are now active.', 'success');
      setTimeout(() => setRulesSuccessMsg(''), 4000);
      fetchDashboardData();
    } catch (err: any) {
      showToast('Save Failed', err.message, 'error');
    } finally {
      setSavingRules(false);
    }
  };

  // 3. Connect New Payment Method Mandate
  const handleConnectMandate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountInput.trim()) {
      showToast('Missing Details', 'Please enter UPI ID, Card Number, or Bank Account number.', 'error');
      return;
    }
    setSubmittingMandate(true);
    try {
      const res = await fetch('/api/v1/customer/autopay/mandates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: mandateType,
          bank_name: bankName,
          account_or_vpa: accountInput,
          max_amount: mandateMaxAmount,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to connect mandate');
      }
      showToast('Mandate Connected', 'Payment authorization successfully registered with Razorpay AutoPay.', 'success');
      setShowMandateModal(false);
      setAccountInput('');
      fetchDashboardData();
    } catch (err: any) {
      showToast('Connection Failed', err.message, 'error');
    } finally {
      setSubmittingMandate(false);
    }
  };

  // 4. Open Address Picker before approving a recommendation
  const handleOpenAddressPicker = (recId: string, recName: string) => {
    if (addresses.length === 0) {
      // No addresses — approve immediately, backend will surface the structured error
      handleConfirmAndApprove(recId, recName, null);
      return;
    }
    setPendingRecId(recId);
    setPendingRecName(recName);
    setShowAddressPicker(true);
  };

  // 4b. Confirm address selection and execute purchase
  const handleConfirmAndApprove = async (recId: string, recName: string, addrId: string | null) => {
    setShowAddressPicker(false);
    setActionLoadingId(recId);
    try {
      const body: Record<string, any> = {};
      if (addrId) body.address_id = addrId;
      const res = await fetch(`/api/v1/customer/autopay/recommendations/${recId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Purchase execution failed');
      }
      const data = await res.json();
      const chosenAddr = addresses.find((a) => a.id === (addrId || selectedAddressId));
      const addrLabel = chosenAddr ? `${chosenAddr.city}, ${chosenAddr.state}` : 'saved address';
      showToast(
        'Order Placed Successfully',
        `AutoPay order ${data.order_id} created for ${recName} (₹${data.amount?.toLocaleString('en-IN')}) → shipping to ${addrLabel}.`,
        'success'
      );
      fetchDashboardData();
    } catch (err: any) {
      showToast('Purchase Blocked', err.message, 'error');
    } finally {
      setActionLoadingId(null);
      setPendingRecId(null);
    }
  };

  // 5. Dismiss Recommendation
  const handleDismissRecommendation = async (recId: string) => {
    try {
      await fetch(`/api/v1/customer/autopay/recommendations/${recId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Dismissed by customer' }),
      });
      showToast('Recommendation Dismissed', 'Item removed from upcoming replenishment feed.', 'info');
      fetchDashboardData();
    } catch (err: any) {
      showToast('Action Failed', err.message, 'error');
    }
  };

  // 6. Run Autonomous AI Cycle
  const handleRunAutonomousCycle = async () => {
    setRunningAutoCycle(true);
    setAutoCycleResult(null);
    try {
      const res = await fetch('/api/v1/customer/autopay/execute-autonomous-cycle', {
        method: 'POST',
      });
      const data = await res.json();
      setAutoCycleResult(data);
      if (data.executed_count > 0) {
        showToast('Autonomous Cycle Completed', `AI Agent automatically placed ${data.executed_count} orders within your guardrails!`, 'success');
      } else {
        showToast('Autonomous Cycle Completed', 'Evaluated replenishment candidates against your spending rules.', 'info');
      }
      fetchDashboardData();
    } catch (err: any) {
      showToast('Cycle Execution Failed', err.message, 'error');
    } finally {
      setRunningAutoCycle(false);
    }
  };

  // 7. 1-Click Reversible Refund / Reversal
  const handleRefundPurchase = async (logId: string, orderId: string, amount: number) => {
    if (!confirm(`Are you sure you want to reverse Order ${orderId}? ₹${amount.toLocaleString('en-IN')} will be credited back to your monthly budget allowance.`)) {
      return;
    }
    setActionLoadingId(logId);
    try {
      const res = await fetch(`/api/v1/customer/autopay/logs/${logId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Customer requested 1-Click Reversal' }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Refund failed');
      }
      const data = await res.json();
      showToast('Purchase Reversed & Refunded', data.message, 'success');
      fetchDashboardData();
    } catch (err: any) {
      showToast('Reversal Failed', err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 8. Notifications helpers
  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/v1/customer/autopay/notifications/mark-all-read', { method: 'POST' });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const toggleCategory = (cat: string) => {
    if (selectedCats.includes(cat)) {
      if (selectedCats.length === 1) {
        showToast('Rule Requirement', 'You must have at least one allowed product category selected.', 'info');
        return;
      }
      setSelectedCats(selectedCats.filter(c => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <CustomerHeader />

      {/* ================================================================
          ADDRESS PICKER MODAL
          Shown before approving any AI recommendation so the customer
          can confirm or change the delivery address.
      ================================================================ */}
      {showAddressPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white">📍 Confirm Delivery Address</h2>
                <p className="text-xs text-slate-400 mt-0.5">Where should <span className="text-indigo-300 font-semibold">{pendingRecName}</span> be shipped?</p>
              </div>
              <button
                onClick={() => { setShowAddressPicker(false); setPendingRecId(null); }}
                className="text-slate-400 hover:text-white transition text-xl leading-none"
              >✕</button>
            </div>

            {/* Address list */}
            <div className="px-6 py-4 space-y-3 max-h-72 overflow-y-auto">
              {addresses.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <p className="text-2xl mb-2">🏠</p>
                  <p>No saved addresses found.</p>
                  <p className="text-xs mt-1">Please add a delivery address in your Account settings.</p>
                </div>
              ) : (
                addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition ${
                        isSelected
                          ? 'bg-indigo-950/70 border-indigo-500 shadow-md'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-extrabold text-white truncate">{addr.full_name}</span>
                            {addr.is_default === 1 && (
                              <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">DEFAULT</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}
                          </p>
                          <p className="text-xs text-slate-400">
                            {addr.city}, {addr.state} — {addr.pincode}
                          </p>
                          {addr.landmark && (
                            <p className="text-[11px] text-slate-500 mt-0.5">Near: {addr.landmark}</p>
                          )}
                        </div>
                        <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ml-3 ${
                          isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center space-x-3">
              <button
                onClick={() => { setShowAddressPicker(false); setPendingRecId(null); }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition"
              >
                Cancel
              </button>
              <button
                disabled={!selectedAddressId || !pendingRecId}
                onClick={() => pendingRecId && handleConfirmAndApprove(pendingRecId, pendingRecName, selectedAddressId)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition"
              >
                ✓ Ship Here & Pay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 max-w-md animate-bounce-in">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-start space-x-3 backdrop-blur-md ${
            toastMsg.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' :
            toastMsg.type === 'error' ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' :
            'bg-indigo-950/90 border-indigo-500/50 text-indigo-200'
          }`}>
            <div className="mt-0.5 font-bold text-lg">
              {toastMsg.type === 'success' ? '✓' : toastMsg.type === 'error' ? '✕' : 'ℹ'}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm tracking-wide">{toastMsg.title}</h4>
              <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{toastMsg.desc}</p>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white text-sm">✕</button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-200 transition">Storefront</Link>
          <span>/</span>
          <Link href="/account" className="hover:text-slate-200 transition">Customer Account</Link>
          <span>/</span>
          <span className="text-indigo-400 font-semibold">Razorpay AutoPay & Spending Budget</span>
        </div>

        {/* Hero Header & Live Status Bar */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold tracking-wider uppercase flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span>Razorpay Smart Commerce</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">Zero-Overspend Safety Guarantee</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                AI AutoPay & Spending Budget Manager
              </h1>
              <p className="text-sm text-slate-300 mt-1.5 max-w-2xl">
                Authorize AI-powered autonomous purchases only after explicitly connecting a payment method and defining strict spending guardrails.
              </p>
            </div>

            {/* Master AutoPay Switch & Controls */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell Button */}
              <button
                onClick={() => setShowNotifDrawer(true)}
                className="relative p-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-2xl text-slate-200 hover:text-white transition shadow-lg"
                title="View AutoPay Notifications"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-md">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Master AutoPay Switch */}
              <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl shadow-inner">
                <div className="text-right">
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5 justify-end">
                    <span className={`w-2.5 h-2.5 rounded-full ${settings?.autopay_enabled ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50 animate-ping' : 'bg-slate-500'}`} />
                    <span>AutoPay Status</span>
                  </div>
                  <div className={`text-[11px] font-bold ${settings?.autopay_enabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {settings?.autopay_enabled ? 'ACTIVE & AUTHORIZED' : 'PAUSED'}
                  </div>
                </div>

                <button
                  onClick={handleToggleAutoPay}
                  className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings?.autopay_enabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={settings?.autopay_enabled}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      settings?.autopay_enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: 4-KPI Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {/* KPI 1: Monthly Budget */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                <span>Monthly Budget</span>
                <span className="text-indigo-400">{settings?.spent_percentage || 0}% Used</span>
              </div>
              <div className="text-2xl font-black text-white">
                ₹{(settings?.monthly_budget || 25000).toLocaleString('en-IN')}
              </div>
              {/* Progress meter */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (settings?.spent_percentage || 0) > 85 ? 'bg-rose-500' :
                    (settings?.spent_percentage || 0) > 60 ? 'bg-amber-400' :
                    'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(100, settings?.spent_percentage || 0)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                <span>Spent: <strong className="text-slate-200">₹{(settings?.spent_this_month || 0).toLocaleString('en-IN')}</strong></span>
                <span>Left: <strong className="text-emerald-400">₹{(settings?.remaining_budget || 0).toLocaleString('en-IN')}</strong></span>
              </div>
            </div>

            {/* KPI 2: Max Single Purchase Cap */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="text-xs text-slate-400 font-semibold mb-1">Max Single Purchase Cap</div>
              <div className="text-2xl font-black text-amber-400">
                ₹{(settings?.max_single_purchase_limit || 5000).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-tight">
                Any autonomous order exceeding this cap is automatically blocked and requires approval.
              </p>
            </div>

            {/* KPI 3: AI Purchase Mode */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="text-xs text-slate-400 font-semibold mb-1">Purchase Authorization Mode</div>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wide uppercase ${
                  settings?.purchase_mode === 'AUTO_BUY'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                }`}>
                  {settings?.purchase_mode === 'AUTO_BUY' ? 'Mode B: Auto Buy' : 'Mode A: Recommendations'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-tight">
                {settings?.purchase_mode === 'AUTO_BUY'
                  ? 'AI buys automatically when all 6 safety guardrails pass.'
                  : 'AI forecasts and suggests; customer approves manually.'}
              </p>
            </div>

            {/* KPI 4: Connected Primary Mandate */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="text-xs text-slate-400 font-semibold mb-1">Connected Payment Method</div>
              {mandates.length > 0 ? (
                <div className="mt-1">
                  <div className="text-sm font-bold text-white truncate flex items-center space-x-1.5">
                    <span className="text-indigo-400">⚡</span>
                    <span>{mandates[0].bank_name}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-300 truncate mt-0.5">
                    {mandates[0].account_or_vpa_masked}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                    ✓ Mandate Active (Max ₹{mandates[0].max_amount.toLocaleString('en-IN')})
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <div className="text-xs text-rose-400 font-bold">No Mandate Connected</div>
                  <button
                    onClick={() => setShowMandateModal(true)}
                    className="mt-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1 rounded-lg transition"
                  >
                    + Connect Mandate
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 1 Sub: Last Autonomous Purchase Banner */}
          {settings?.last_autonomous_purchase && (
            <div className="mt-6 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl font-bold text-lg">🤖</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Last Autonomous Purchase</span>
                    <span className="text-xs text-slate-400">• {settings.last_autonomous_purchase.timestamp}</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {settings.last_autonomous_purchase.product_name} — <span className="text-emerald-400">₹{settings.last_autonomous_purchase.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-xs text-slate-300 italic mt-0.5">
                    &ldquo;{settings.last_autonomous_purchase.reason}&rdquo;
                  </div>
                </div>
              </div>
              <Link
                href={`/orders/${settings.last_autonomous_purchase.order_id}`}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition border border-slate-700 whitespace-nowrap shadow-sm"
              >
                View Order #{settings.last_autonomous_purchase.order_id} →
              </Link>
            </div>
          )}
        </div>

        {/* Tabbed Management Navigation */}
        <div className="flex border-b border-slate-800 mb-8 space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'rules'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>⚙️ Spending Rules & Modes</span>
          </button>

          <button
            onClick={() => setActiveTab('mandates')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'mandates'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>💳 Connected Mandates</span>
            <span className="bg-slate-900 text-xs px-2 py-0.5 rounded-full text-indigo-300 border border-slate-700 font-mono">
              {mandates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'recommendations'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🤖 AI Restock & Predictions</span>
            <span className="bg-slate-900 text-xs px-2 py-0.5 rounded-full text-indigo-300 border border-slate-700 font-mono">
              {recommendations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>📜 Purchase Audit Log (Reversible)</span>
            <span className="bg-slate-900 text-xs px-2 py-0.5 rounded-full text-indigo-300 border border-slate-700 font-mono">
              {logs.length}
            </span>
          </button>
        </div>

        {/* TAB 1: SPENDING RULES CONFIGURATION */}
        {activeTab === 'rules' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Form Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-lg font-bold text-white">Configure Spending Guardrails</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Customize your monthly limits, transaction caps, and allowed categories.</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
                    Guardrails Active
                  </span>
                </div>

                <form onSubmit={handleSaveSpendingRules} className="space-y-6">
                  {/* 1. Monthly Budget */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Monthly Budget Limit (₹)
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {[5000, 10000, 25000, 50000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setBudgetInput(preset)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                            budgetInput === preset
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          ₹{preset.toLocaleString('en-IN')}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(Number(e.target.value))}
                        className="w-full pl-9 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white font-bold text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="Custom amount (e.g. 35000)"
                        min={1000}
                        required
                      />
                    </div>
                  </div>

                  {/* 2. Maximum Single Purchase */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Maximum Single Purchase Cap (₹)
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {[500, 1000, 5000, 15000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setSingleLimitInput(preset)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                            singleLimitInput === preset
                              ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30'
                              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          ₹{preset.toLocaleString('en-IN')}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={singleLimitInput}
                        onChange={(e) => setSingleLimitInput(Number(e.target.value))}
                        className="w-full pl-9 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white font-bold text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="Custom amount (e.g. 7500)"
                        min={100}
                        required
                      />
                    </div>
                  </div>

                  {/* 3. Product Categories Allowed */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Product Categories Allowed (Whitelisted)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { key: 'HARDWARE', label: 'Hardware', desc: 'POS, Readers, Soundboxes' },
                        { key: 'SOFTWARE', label: 'Software', desc: 'Cloud Sync, Licenses' },
                        { key: 'ACCESSORIES', label: 'Accessories', desc: 'Thermal Rolls, Stands' },
                        { key: 'SUBSCRIPTIONS', label: 'Subscriptions', desc: 'Care Plans, SaaS' },
                      ].map((item) => {
                        const checked = selectedCats.includes(item.key);
                        return (
                          <div
                            key={item.key}
                            onClick={() => toggleCategory(item.key)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                              checked
                                ? 'bg-indigo-950/60 border-indigo-500/50 shadow-md'
                                : 'bg-slate-800/50 border-slate-700/60 opacity-60 hover:opacity-80'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-white">{item.label}</span>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {}}
                                className="h-4 w-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1">{item.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Merchant Trust Level */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Merchant Trust Level
                    </label>
                    <div
                      onClick={() => setMerchantTrust(merchantTrust === 'VERIFIED_ONLY' ? 'ALL_MERCHANTS' : 'VERIFIED_ONLY')}
                      className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl cursor-pointer hover:border-slate-600 transition flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl font-bold">🛡️</div>
                        <div>
                          <div className="text-sm font-bold text-white">Verified Merchants Only</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            AI will only purchase from verified Razorpay vendors and official brand stores.
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={merchantTrust === 'VERIFIED_ONLY'}
                        onChange={() => {}}
                        className="h-5 w-5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* 5. AI Purchase Authorization Mode Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      AI Purchase Authorization Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Mode A */}
                      <div
                        onClick={() => setPurchaseMode('RECOMMENDATION_ONLY')}
                        className={`p-5 rounded-2xl border cursor-pointer transition ${
                          purchaseMode === 'RECOMMENDATION_ONLY'
                            ? 'bg-indigo-950/70 border-indigo-500 shadow-xl'
                            : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-white">Mode A: Recommendation Only</span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Manual</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          AI analyzes consumption rates and forecasts restocking. You review and approve every order manually.
                        </p>
                      </div>

                      {/* Mode B */}
                      <div
                        onClick={() => setPurchaseMode('AUTO_BUY')}
                        className={`p-5 rounded-2xl border cursor-pointer transition ${
                          purchaseMode === 'AUTO_BUY'
                            ? 'bg-emerald-950/70 border-emerald-500 shadow-xl'
                            : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-white">Mode B: Auto Buy</span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Autonomous</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          AI autonomously purchases products within your monthly budget, single item limits, and whitelisted categories.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={savingRules}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2"
                    >
                      {savingRules ? <span>Saving Guardrails...</span> : <span>Save Spending Rules</span>}
                    </button>
                    {rulesSuccessMsg && (
                      <span className="text-xs font-bold text-emerald-400 animate-fade-in">
                        ✓ {rulesSuccessMsg}
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Right Sidebar: Safety Rules Visual Checklist */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <span>🛡️</span>
                  <span>Safety Guardrail Architecture</span>
                </h3>
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <div>
                      <strong className="text-slate-200">Budget Headroom Check</strong>
                      <p className="text-slate-400 mt-0.5">Calculates `spent + cost &le; monthly_budget` before checkout dispatch.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <div>
                      <strong className="text-slate-200">Single Purchase Cap</strong>
                      <p className="text-slate-400 mt-0.5">Enforces maximum limit of ₹{singleLimitInput.toLocaleString('en-IN')} per transaction.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <div>
                      <strong className="text-slate-200">Category Whitelist</strong>
                      <p className="text-slate-400 mt-0.5">Blocks products outside of {selectedCats.join(', ')}.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <div>
                      <strong className="text-slate-200">100% Explainable AI</strong>
                      <p className="text-slate-400 mt-0.5">Every AI purchase logs an explicit rationale and price trigger.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <div>
                      <strong className="text-slate-200">1-Click Reversible</strong>
                      <p className="text-slate-400 mt-0.5">Any autonomous purchase can be reversed with immediate budget restitution.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONNECTED PAYMENT METHOD MANDATES */}
        {activeTab === 'mandates' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div>
                <h3 className="text-lg font-bold text-white">Razorpay AutoPay Mandates</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI purchases require explicit authorization via connected UPI AutoPay, Saved Cards, or NetBanking e-Mandates.
                </p>
              </div>
              <button
                onClick={() => setShowMandateModal(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2 self-start sm:self-auto"
              >
                <span>+ Connect Payment Method</span>
              </button>
            </div>

            {/* Mandates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mandates.map((m) => (
                <div
                  key={m.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition" />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-extrabold uppercase tracking-wider">
                        {m.type.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                      }`}>
                        ● {m.status}
                      </span>
                    </div>

                    <div className="text-base font-extrabold text-white">{m.bank_name}</div>
                    <div className="text-sm font-mono text-slate-300 mt-1">{m.account_or_vpa_masked}</div>

                    <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
                      <div className="flex justify-between">
                        <span>Max Debit Limit:</span>
                        <strong className="text-slate-200">₹{m.max_amount.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Frequency:</span>
                        <strong className="text-slate-200">{m.billing_frequency}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono text-[10px]">ID: {m.id}</span>
                    <span className="text-emerald-400 font-bold text-[11px]">✓ Verified Mandate</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Security Guarantee Note */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 text-xs text-slate-400">
              <span className="text-lg">🔒</span>
              <div>
                <strong className="text-slate-200">Zero Raw Card Data Stored:</strong> All cards and bank accounts are tokenized using RBI & PCI-DSS compliant Razorpay Mandate Infrastructure.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AI REPLENISHMENT ENGINE & LIVE PREDICTIONS */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div>
                <h3 className="text-lg font-bold text-white">AI Replenishment Engine</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Analyzes consumption curves, hardware fatigue, and POS receipt volume to forecast restocking before shortages occur.
                </p>
              </div>
              <button
                onClick={handleRunAutonomousCycle}
                disabled={runningAutoCycle}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center space-x-2 self-start sm:self-auto"
              >
                <span>{runningAutoCycle ? 'Running Autonomous AI Cycle...' : '⚡ Run Autonomous Restock Cycle'}</span>
              </button>
            </div>

            {/* Cycle Result Banner if just triggered */}
            {autoCycleResult && (
              <div className="bg-indigo-950/60 border border-indigo-500/40 rounded-2xl p-4 text-xs">
                <div className="font-bold text-indigo-300">
                  Autonomous Cycle Complete ({autoCycleResult.cycle_timestamp})
                </div>
                <div className="mt-1 text-slate-300">
                  Executed: <strong className="text-emerald-400">{autoCycleResult.executed_count}</strong> | Skipped/Approval Required: <strong className="text-amber-400">{autoCycleResult.skipped_count}</strong>
                </div>
              </div>
            )}

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl flex flex-col justify-between relative group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 bg-slate-800 text-indigo-300 border border-slate-700 rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
                        {rec.category}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          rec.need_urgency === 'HIGH' ? 'bg-rose-500/20 text-rose-300' :
                          rec.need_urgency === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          {rec.need_urgency} URGENCY
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          {Math.round(rec.confidence_score * 100)}% Confidence
                        </span>
                      </div>
                    </div>

                    <h4 className="text-base font-extrabold text-white group-hover:text-indigo-300 transition">
                      {rec.product_name}
                    </h4>

                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                      <span>Merchant: <strong className="text-slate-300">{rec.merchant_name}</strong></span>
                      {rec.merchant_verified ? <span className="text-emerald-400 font-bold text-[10px]">✓ Verified</span> : null}
                    </div>

                    <div className="mt-3 p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-xs text-slate-300 italic leading-relaxed">
                      &ldquo;{rec.reasoning}&rdquo;
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400">Qty: {rec.quantity} &times; ₹{rec.unit_price.toLocaleString('en-IN')}</span>
                        <div className="text-base font-extrabold text-emerald-400">
                          Total: ₹{rec.total_price.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <span className="text-slate-500 text-[11px] font-mono">Restock by: {rec.predicted_date}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                    {/* Selected address chip */}
                    {(() => {
                      const chosenAddr = addresses.find((a) => a.id === selectedAddressId);
                      return chosenAddr ? (
                        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2">
                          <span className="text-slate-500">📍</span>
                          <span className="truncate">
                            Ship to: <strong className="text-slate-200">{chosenAddr.full_name}</strong>
                            {' · '}{chosenAddr.city}, {chosenAddr.state} — {chosenAddr.pincode}
                          </span>
                          {chosenAddr.is_default === 1 && (
                            <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">DEFAULT</span>
                          )}
                        </div>
                      ) : null;
                    })()}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleOpenAddressPicker(rec.id, rec.product_name)}
                        disabled={actionLoadingId === rec.id}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition"
                      >
                        {actionLoadingId === rec.id ? 'Placing Order...' : 'Approve & AutoPay Now'}
                      </button>
                      <button
                        onClick={() => handleDismissRecommendation(rec.id)}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PURCHASE AUDIT LOG (WITH 1-CLICK REVERSIBLE REFUNDS) */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div>
                <h3 className="text-lg font-bold text-white">Autonomous Purchase Audit Log</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete immutable ledger of every AI-executed order, payment mandate reference, rationale, and 1-click refund capability.
                </p>
              </div>
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-bold self-start sm:self-auto">
                100% Reversible Guarantee
              </span>
            </div>

            {/* Audit Logs List */}
            <div className="space-y-4">
              {logs.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl">
                  No autonomous purchases recorded yet.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`bg-slate-900 border rounded-3xl p-6 shadow-xl transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
                      log.refund_status === 'REFUNDED' ? 'border-amber-500/30 opacity-75' : 'border-slate-800'
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 font-mono text-[10px] rounded-md border border-slate-700">
                          {log.timestamp}
                        </span>
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md text-[10px] font-bold uppercase">
                          {log.approval_type}
                        </span>
                        {log.refund_status === 'REFUNDED' ? (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md text-[10px] font-bold">
                            REFUNDED & REVERSED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md text-[10px] font-bold">
                            SUCCESS
                          </span>
                        )}
                        <Link
                          href={`/orders/${log.order_id}`}
                          className="text-xs font-mono text-indigo-400 hover:underline font-bold"
                        >
                          Order #{log.order_id}
                        </Link>
                      </div>

                      <h4 className="text-base font-extrabold text-white">
                        {log.product_name || 'Autonomous Restock Item'}
                      </h4>

                      <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Merchant: <strong className="text-slate-300">{log.merchant_name}</strong></span>
                        <span>Payment: <strong className="text-slate-300">{log.payment_method}</strong></span>
                      </div>

                      {/* Explainability Reason Quote */}
                      <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs text-indigo-200/90 italic">
                        &ldquo;{log.purchase_reason}&rdquo;
                      </div>

                      {/* Guardrails checklist */}
                      {log.guardrails_validated && (
                        <div className="flex flex-wrap gap-2 text-[10px] pt-1">
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800/50 rounded">
                            ✓ Budget Verified
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800/50 rounded">
                            ✓ Single Limit Cap OK
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800/50 rounded">
                            ✓ Category Approved
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800/50 rounded">
                            ✓ Merchant Verified
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Amount & Reversal Action */}
                    <div className="flex flex-col items-end justify-between self-stretch lg:self-auto border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Total Charged</div>
                        <div className="text-2xl font-black text-white">
                          ₹{log.amount.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="mt-4">
                        {log.refund_status === 'REFUNDED' ? (
                          <div className="text-xs text-amber-400 font-bold text-right">
                            ✓ Amount Restored to Budget
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRefundPurchase(log.id, log.order_id, log.amount)}
                            disabled={actionLoadingId === log.id}
                            className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 font-bold text-xs rounded-xl transition shadow-sm"
                          >
                            {actionLoadingId === log.id ? 'Reversing...' : '↩ 1-Click Refund / Reverse'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* CONNECT PAYMENT METHOD MODAL */}
      {showMandateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowMandateModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <h3 className="text-lg font-extrabold text-white">Connect Payment Method</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select a payment method to authorize Razorpay AutoPay for autonomous replenishments.
            </p>

            <form onSubmit={handleConnectMandate} className="mt-6 space-y-4">
              {/* Type Select */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Mandate Type
                </label>
                <select
                  value={mandateType}
                  onChange={(e) => setMandateType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="UPI_AUTOPAY">UPI AutoPay (Google Pay / PhonePe / Paytm / BHIM)</option>
                  <option value="DEBIT_CARD_MANDATE">Debit Card Mandate (Visa / Mastercard / RuPay)</option>
                  <option value="CREDIT_CARD_MANDATE">Credit Card Mandate (Corporate / Commercial)</option>
                  <option value="NETBANKING_EMANDATE">NetBanking e-Mandate (HDFC, ICICI, SBI, Axis)</option>
                </select>
              </div>

              {/* Bank Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Issuing Bank
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. HDFC Bank / ICICI Bank"
                  required
                />
              </div>

              {/* Account / UPI / Card Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  {mandateType === 'UPI_AUTOPAY' ? 'UPI ID / VPA' :
                   mandateType === 'NETBANKING_EMANDATE' ? 'Bank Account Number' : 'Card Number (Simulated Tokenization)'}
                </label>
                <input
                  type="text"
                  value={accountInput}
                  onChange={(e) => setAccountInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder={
                    mandateType === 'UPI_AUTOPAY' ? 'user@okhdfcbank' :
                    mandateType === 'NETBANKING_EMANDATE' ? '987654321011' : '4315 8888 9999 4242'
                  }
                  required
                />
              </div>

              {/* Expiry if Card */}
              {(mandateType === 'DEBIT_CARD_MANDATE' || mandateType === 'CREDIT_CARD_MANDATE') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Expiry MM/YY</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-mono"
                      placeholder="12/28"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">CVV (Simulated)</label>
                    <input
                      type="password"
                      maxLength={3}
                      defaultValue="888"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Max Transaction Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Maximum Auto-Debit Limit (₹)
                </label>
                <input
                  type="number"
                  value={mandateMaxAmount}
                  onChange={(e) => setMandateMaxAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-sm"
                  min={1000}
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowMandateModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMandate}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 transition"
                >
                  {submittingMandate ? 'Authorizing with Razorpay...' : 'Connect & Authorize Mandate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOTIFICATION CENTER DRAWER */}
      {showNotifDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">AutoPay Notifications</h3>
                <p className="text-xs text-slate-400">Alerts for budget limits, auto-buys, and guardrail blocks.</p>
              </div>
              <button
                onClick={() => setShowNotifDrawer(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-2 flex justify-end">
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
              >
                Mark all as read
              </button>
            </div>

            {/* Notification items */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">No notifications yet.</div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-2xl border transition ${
                      notif.severity === 'SUCCESS' ? 'bg-emerald-950/40 border-emerald-500/30' :
                      notif.severity === 'WARNING' ? 'bg-amber-950/40 border-amber-500/30' :
                      'bg-slate-800/50 border-slate-700/60'
                    } ${!notif.is_read ? 'ring-1 ring-indigo-500/40' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp.split('T')[0]}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
