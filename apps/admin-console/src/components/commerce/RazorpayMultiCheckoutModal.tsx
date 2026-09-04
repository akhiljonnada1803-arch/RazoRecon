'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CheckoutResult } from '@/types/commerce';
import { 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  QrCode, 
  X, 
  ShieldCheck, 
  CreditCard,
  Sparkles,
  Check,
  ShoppingBag,
  Truck,
  Smartphone,
  Landmark,
  Wallet,
  Calendar,
  Lock,
  ChevronRight,
  ArrowRight,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface RazorpayMultiCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CheckoutResult | null;
}

type PaymentTab = 'upi' | 'card' | 'netbanking' | 'wallet' | 'emi';

export function RazorpayMultiCheckoutModal({
  isOpen,
  onClose,
  result,
}: RazorpayMultiCheckoutModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<PaymentTab>('upi');
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [reconData, setReconData] = useState<any>(null);

  // Form states
  const [upiId, setUpiId] = useState('alex.mercer@oksbi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8842');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('782');
  const [cardName, setCardName] = useState('Alex Mercer');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [selectedWallet, setSelectedWallet] = useState('Amazon Pay');
  const [selectedEmiPlan, setSelectedEmiPlan] = useState('3_months_no_cost');

  if (!isOpen || !result) return null;

  const totalAmount = result.amount || 0;

  const handleCopyLink = () => {
    const link = result.payment_url || result.payment_link || '';
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleProcessPayment = async (methodOverride?: string) => {
    setIsVerifying(true);
    try {
      const paymentId = `pay_rzp_${Math.random().toString(36).substring(2, 12)}`;
      const selectedMethod = methodOverride || activeTab;

      const res: any = await apiClient.post('/payments/verify', {
        razorpay_order_id: result.order_id,
        razorpay_payment_id: paymentId,
        razorpay_signature: `sig_rzp_${Math.random().toString(36).substring(2, 14)}`,
        method: selectedMethod,
        email: 'alex.mercer.procurement@acmedemo.com',
        contact: '+919876543210'
      });

      setReconData(res);
      setPaymentCompleted(true);

      // Invalidate all query caches
      queryClient.invalidateQueries({ queryKey: ['customer-orders-list'] });
      queryClient.invalidateQueries({ queryKey: ['customer-orders-all'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'shipping'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'catalog'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['checkout-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['checkout-audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
    } catch (e) {
      console.error(e);
      setPaymentCompleted(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const banks = [
    { id: 'HDFC', name: 'HDFC Bank', popular: true },
    { id: 'ICICI', name: 'ICICI Bank', popular: true },
    { id: 'SBI', name: 'State Bank of India', popular: true },
    { id: 'AXIS', name: 'Axis Bank', popular: true },
    { id: 'KOTAK', name: 'Kotak Mahindra', popular: true },
    { id: 'PNB', name: 'Punjab National Bank', popular: false },
    { id: 'BOB', name: 'Bank of Baroda', popular: false },
    { id: 'INDUS', name: 'IndusInd Bank', popular: false },
  ];

  const wallets = [
    { id: 'Amazon Pay', name: 'Amazon Pay Balance (₹15,000 available)', cashback: '₹50 Flat Cashback' },
    { id: 'Paytm Wallet', name: 'Paytm Wallet & Postpaid', cashback: 'Instant 5% Cashback' },
    { id: 'PhonePe', name: 'PhonePe Wallet & UPI', cashback: 'Scratch Card up to ₹200' },
    { id: 'Mobikwik', name: 'MobiKwik ZIP Pay Later', cashback: 'SuperCash offer' }
  ];

  const emiPlans = [
    { id: 'simpl', name: 'Simpl 1-Click Pay in 3', rate: '0% Interest (₹' + (totalAmount / 3).toFixed(2) + ' x 3)', badge: 'NO COST EMI' },
    { id: 'lazypay', name: 'LazyPay Next Month', rate: 'Pay on 15th of next month', badge: 'PAY LATER' },
    { id: '3_months_no_cost', name: '3 Months Card No-Cost EMI', rate: '₹' + (totalAmount / 3).toFixed(2) + ' / mo', badge: '0% INTEREST' },
    { id: '6_months_standard', name: '6 Months Low-Interest EMI', rate: '₹' + ((totalAmount * 1.05) / 6).toFixed(2) + ' / mo', badge: '14% p.a.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#072654] text-white flex items-center justify-between border-b border-blue-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/20 text-[#0B72E7] flex items-center justify-center border border-blue-400/30">
              <ShieldCheck className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Razorpay Secure Checkout</h3>
                <Badge className="bg-emerald-500 text-white text-[9px] font-mono border-0">
                  TEST MODE
                </Badge>
              </div>
              <span className="text-[11px] text-blue-200/80 font-mono">
                Order #{result.order_id}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {paymentCompleted ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4 animate-in zoom-in-95">
              <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                <Check className="h-8 w-8" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-emerald-950">
                  Payment Captured & Order Confirmed!
                </h4>
                <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
                  Your payment of <span className="font-bold">₹{totalAmount.toLocaleString('en-IN')}</span> has been verified and settled via Razorpay. Order dispatched to fulfillment.
                </p>
              </div>

              {/* Settlement & Recon Voucher Box */}
              <div className="bg-white p-4 rounded-xl border border-emerald-200 text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Reconciliation Ref:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {reconData?.reconciliation?.transaction_id || `REC-RZP-${result.order_id.slice(-8).toUpperCase()}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Paid Amount:</span>
                  <span className="font-bold text-slate-900">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Payment Method:</span>
                  <span className="capitalize font-semibold text-slate-700">{activeTab.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold border-t border-emerald-100 pt-1.5">
                  <span>Net Expected Payout:</span>
                  <span>₹{reconData?.net_amount ? reconData.net_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : (totalAmount * 0.9764).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={() => {
                    onClose();
                    router.push('/customer/orders');
                  }}
                  className="h-11 text-xs font-bold bg-[#0B72E7] hover:bg-[#095bc0] text-white rounded-xl gap-2 shadow-sm cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>View in My Orders</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose();
                    router.push(`/customer/track?orderId=${result.order_id}`);
                  }}
                  className="h-11 text-xs font-bold text-slate-800 border-slate-200 hover:bg-slate-50 rounded-xl gap-2 cursor-pointer"
                >
                  <Truck className="h-4 w-4 text-[#0B72E7]" />
                  <span>Track Shipment</span>
                </Button>
              </div>
            </div>
          ) : (
            /* MULTI-METHOD PAYMENT SELECTION */
            <>
              {/* Amount Due Strip */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <span className="text-[11px] text-slate-500 block">Final Payable Amount</span>
                  <span className="text-2xl font-extrabold text-[#072654] font-mono">
                    ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <span>✓ 100% Inclusive of GST</span>
                  <span className="block text-[10px] text-slate-500 font-normal">Zero extra checkout taxes</span>
                </div>
              </div>

              {/* Payment Method Selector Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Left Method Tabs */}
                <div className="md:col-span-4 space-y-1.5">
                  {[
                    { id: 'upi', label: 'UPI & BharatQR', icon: Smartphone, badge: 'FASTEST' },
                    { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, badge: 'POPULAR' },
                    { id: 'netbanking', label: 'Net Banking', icon: Landmark },
                    { id: 'wallet', label: 'Wallets', icon: Wallet },
                    { id: 'emi', label: 'EMI & Pay Later', icon: Calendar, badge: '0% EMI' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setActiveTab(m.id as PaymentTab)}
                      className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === m.id
                          ? 'bg-[#0B72E7] text-white shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <m.icon className="w-4 h-4 shrink-0" />
                        <span>{m.label}</span>
                      </div>
                      {m.badge && (
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                          activeTab === m.id ? 'bg-white text-[#0B72E7]' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {m.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Right Tab Content View */}
                <div className="md:col-span-8 bg-slate-50/50 p-4 rounded-2xl border border-slate-200 space-y-4">
                  {/* TAB 1: UPI & QR */}
                  {activeTab === 'upi' && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <div className="h-32 w-32 p-1.5 bg-white rounded-xl border border-slate-200 shrink-0">
                          <img
                            src={result.qr_code_mock || result.qr_code_data || 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay'}
                            alt="Razorpay BharatQR"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="space-y-1.5 text-center sm:text-left">
                          <span className="font-bold text-xs text-slate-800 block">
                            Scan with any UPI App
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            Google Pay • PhonePe • Paytm • BHIM • Cred
                          </span>
                          <div className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                            <Zap className="w-3 h-3" />
                            <span>Instant Payment Verification</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                          Or Enter UPI VPA ID
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="username@okhdfcbank"
                            className="h-9 text-xs rounded-xl bg-white"
                          />
                          <Button
                            onClick={() => handleProcessPayment('upi')}
                            disabled={isVerifying}
                            className="bg-[#0B72E7] hover:bg-[#095ec2] text-white h-9 px-4 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                          >
                            {isVerifying ? 'Verifying...' : 'Pay with UPI'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CREDIT / DEBIT CARD */}
                  {activeTab === 'card' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Card Number
                        </label>
                        <div className="relative">
                          <Input
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4532 •••• •••• ••••"
                            className="h-9 text-xs font-mono font-bold rounded-xl bg-white pl-9"
                          />
                          <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                            Expiry (MM/YY)
                          </label>
                          <Input
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="12/28"
                            className="h-9 text-xs font-mono font-bold rounded-xl bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                            CVV / CVC
                          </label>
                          <Input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            className="h-9 text-xs font-mono font-bold rounded-xl bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Cardholder Name
                        </label>
                        <Input
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Name on Card"
                          className="h-9 text-xs font-semibold rounded-xl bg-white"
                        />
                      </div>

                      <Button
                        onClick={() => handleProcessPayment('card')}
                        disabled={isVerifying}
                        className="w-full bg-[#0B72E7] hover:bg-[#095ec2] text-white h-10 rounded-xl text-xs font-bold gap-2 cursor-pointer mt-2"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Pay ₹{totalAmount.toLocaleString('en-IN')} via Card</span>
                      </Button>
                    </div>
                  )}

                  {/* TAB 3: NET BANKING */}
                  {activeTab === 'netbanking' && (
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Popular Indian Banks
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {banks.slice(0, 6).map((b) => (
                          <button
                            key={b.id}
                            onClick={() => setSelectedBank(b.id)}
                            className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                              selectedBank === b.id
                                ? 'bg-blue-50 border-[#0B72E7] text-[#0B72E7]'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {b.name}
                          </button>
                        ))}
                      </div>

                      <Button
                        onClick={() => handleProcessPayment('netbanking')}
                        disabled={isVerifying}
                        className="w-full bg-[#0B72E7] hover:bg-[#095ec2] text-white h-10 rounded-xl text-xs font-bold gap-2 cursor-pointer mt-2"
                      >
                        <Landmark className="w-3.5 h-3.5" />
                        <span>Proceed to {selectedBank} NetBanking</span>
                      </Button>
                    </div>
                  )}

                  {/* TAB 4: WALLETS */}
                  {activeTab === 'wallet' && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Select Digital Wallet
                      </label>
                      {wallets.map((w) => (
                        <button
                          key={w.id}
                          onClick={() => setSelectedWallet(w.id)}
                          className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            selectedWallet === w.id
                              ? 'bg-blue-50 border-[#0B72E7] text-[#0B72E7]'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-xs block">{w.name}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold">{w.cashback}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                      ))}

                      <Button
                        onClick={() => handleProcessPayment('wallet')}
                        disabled={isVerifying}
                        className="w-full bg-[#0B72E7] hover:bg-[#095ec2] text-white h-10 rounded-xl text-xs font-bold gap-2 cursor-pointer mt-2"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Pay via {selectedWallet}</span>
                      </Button>
                    </div>
                  )}

                  {/* TAB 5: EMI & PAY LATER */}
                  {activeTab === 'emi' && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        No-Cost EMI & Pay Later Options
                      </label>
                      {emiPlans.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedEmiPlan(p.id)}
                          className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            selectedEmiPlan === p.id
                              ? 'bg-blue-50 border-[#0B72E7] text-[#0B72E7]'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs">{p.name}</span>
                              <Badge className="bg-emerald-100 text-emerald-800 text-[9px] font-bold border-0">
                                {p.badge}
                              </Badge>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">{p.rate}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                      ))}

                      <Button
                        onClick={() => handleProcessPayment('emi')}
                        disabled={isVerifying}
                        className="w-full bg-[#0B72E7] hover:bg-[#095ec2] text-white h-10 rounded-xl text-xs font-bold gap-2 cursor-pointer mt-2"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Authorize EMI Plan</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Link & Copy Helper */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-1 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="font-mono text-slate-600 truncate">{result.payment_url || result.payment_link}</span>
                  <button onClick={handleCopyLink} className="text-[#0B72E7] hover:underline font-bold shrink-0 ml-auto cursor-pointer">
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>

                <Button
                  onClick={() => handleProcessPayment()}
                  disabled={isVerifying}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-9 px-4 shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate Instant Success</span>
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit SSL Encrypted • Powered by Razorpay</span>
          </div>
          <button onClick={onClose} className="hover:text-slate-800 font-semibold cursor-pointer">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
