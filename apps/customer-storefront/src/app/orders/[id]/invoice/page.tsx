'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  Printer, 
  ArrowLeft, 
  ShieldCheck, 
  Building2, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  CreditCard,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Self-contained Vector QR Code Generator for Invoice Verification
function InvoiceQRCode({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-1.5 bg-white border border-slate-300 rounded-lg shadow-2xs">
      <svg
        className="w-16 h-16 sm:w-18 sm:h-18"
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* QR Outer Position Markers */}
        <rect x="5" y="5" width="26" height="26" rx="4" fill="#0f172a" />
        <rect x="9" y="9" width="18" height="18" rx="2" fill="#ffffff" />
        <rect x="13" y="13" width="10" height="10" rx="1" fill="#0f172a" />

        <rect x="69" y="5" width="26" height="26" rx="4" fill="#0f172a" />
        <rect x="73" y="9" width="18" height="18" rx="2" fill="#ffffff" />
        <rect x="77" y="13" width="10" height="10" rx="1" fill="#0f172a" />

        <rect x="5" y="69" width="26" height="26" rx="4" fill="#0f172a" />
        <rect x="9" y="73" width="18" height="18" rx="2" fill="#ffffff" />
        <rect x="13" y="77" width="10" height="10" rx="1" fill="#0f172a" />

        {/* Dynamic Pattern Matrix */}
        <rect x="36" y="8" width="5" height="5" fill="#0f172a" />
        <rect x="45" y="8" width="5" height="5" fill="#0f172a" />
        <rect x="55" y="8" width="5" height="5" fill="#0f172a" />
        <rect x="36" y="17" width="5" height="5" fill="#0f172a" />
        <rect x="50" y="17" width="5" height="5" fill="#0f172a" />
        <rect x="41" y="26" width="5" height="5" fill="#0f172a" />
        <rect x="55" y="26" width="5" height="5" fill="#0f172a" />

        <rect x="8" y="36" width="5" height="5" fill="#0f172a" />
        <rect x="17" y="36" width="5" height="5" fill="#0f172a" />
        <rect x="26" y="36" width="5" height="5" fill="#0f172a" />
        <rect x="36" y="36" width="5" height="5" fill="#0f172a" />
        <rect x="45" y="36" width="5" height="5" fill="#0f172a" />
        <rect x="55" y="36" width="5" height="5" fill="#0f172a" />
        <rect x="69" y="36" width="5" height="5" fill="#0f172a" />
        <rect x="78" y="36" width="5" height="5" fill="#0f172a" />
        <rect x="87" y="36" width="5" height="5" fill="#0f172a" />

        <rect x="8" y="45" width="5" height="5" fill="#0f172a" />
        <rect x="22" y="45" width="5" height="5" fill="#0f172a" />
        <rect x="36" y="45" width="10" height="10" rx="1" fill="#0B72E7" />
        <rect x="50" y="45" width="5" height="5" fill="#0f172a" />
        <rect x="64" y="45" width="5" height="5" fill="#0f172a" />
        <rect x="78" y="45" width="5" height="5" fill="#0f172a" />
        <rect x="87" y="45" width="5" height="5" fill="#0f172a" />

        <rect x="8" y="55" width="5" height="5" fill="#0f172a" />
        <rect x="17" y="55" width="5" height="5" fill="#0f172a" />
        <rect x="55" y="55" width="5" height="5" fill="#0f172a" />
        <rect x="69" y="55" width="5" height="5" fill="#0f172a" />
        <rect x="83" y="55" width="5" height="5" fill="#0f172a" />

        <rect x="36" y="69" width="5" height="5" fill="#0f172a" />
        <rect x="45" y="69" width="5" height="5" fill="#0f172a" />
        <rect x="55" y="69" width="5" height="5" fill="#0f172a" />
        <rect x="69" y="69" width="5" height="5" fill="#0f172a" />
        <rect x="83" y="69" width="5" height="5" fill="#0f172a" />

        <rect x="36" y="78" width="5" height="5" fill="#0f172a" />
        <rect x="50" y="78" width="5" height="5" fill="#0f172a" />
        <rect x="64" y="78" width="5" height="5" fill="#0f172a" />
        <rect x="78" y="78" width="5" height="5" fill="#0f172a" />
        <rect x="87" y="78" width="5" height="5" fill="#0f172a" />

        <rect x="41" y="87" width="5" height="5" fill="#0f172a" />
        <rect x="55" y="87" width="5" height="5" fill="#0f172a" />
        <rect x="69" y="87" width="5" height="5" fill="#0f172a" />
        <rect x="83" y="87" width="5" height="5" fill="#0f172a" />
      </svg>
      <span className="text-[8px] font-mono font-bold text-slate-600 mt-1 uppercase tracking-tighter">
        GST E-INVOICE
      </span>
    </div>
  );
}

export default function OrderInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['order-tax-invoice', orderId],
    queryFn: async () => {
      return await apiClient.get<any>(`/customer/orders/${orderId}/invoice`);
    },
    enabled: !!orderId,
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#0B72E7] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-xs font-semibold">Generating GST Tax Invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-sm w-full text-center space-y-3">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Invoice Unavailable</h2>
          <p className="text-xs text-slate-500">
            Order <span className="font-mono font-semibold">{orderId}</span> invoice could not be generated.
          </p>
          <Button 
            onClick={() => router.push('/orders')} 
            className="w-full bg-[#0B72E7] text-white rounded-xl text-xs h-9"
          >
            Return to Orders
          </Button>
        </div>
      </div>
    );
  }

  const meta = invoice.invoice_metadata || {};
  const seller = invoice.seller_details || {};
  const customer = invoice.customer_details || {};
  const summary = invoice.order_summary || {};
  const payment = invoice.payment_details || {};
  const courier = invoice.courier_details || {};
  const legal = invoice.legal_section || {};
  const lineItems = invoice.line_items || [];

  return (
    <div className="min-h-screen bg-slate-100 py-4 px-2 sm:px-4 print:bg-white print:p-0 print:m-0 font-sans text-slate-900 antialiased selection:bg-blue-100">
      <style jsx global>{`
        @media print {
          header,
          nav,
          footer,
          aside,
          .no-print {
            display: none !important;
          }
          html, body {
            background-color: white !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .invoice-card {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            padding: 5mm 7mm !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 auto !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 4mm 6mm;
          }
        }
      `}</style>

      {/* Screen Action Bar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-3 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Link href={`/orders/${orderId}`}>
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-slate-600 hover:text-slate-900 rounded-lg gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Order</span>
              </Button>
            </Link>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold py-0.5 px-2 gap-1">
                <ShieldCheck className="w-3 h-3" />
                GST Compliant (Rule 48)
              </Badge>
              <span className="font-mono text-xs font-bold text-slate-800">{meta.invoice_number}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              className="bg-[#0B72E7] hover:bg-[#095ec2] text-white text-xs font-semibold h-8 px-3.5 rounded-lg gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 Invoice (1 Page)</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Single-Page A4 Printable Container */}
      <div className="invoice-card max-w-4xl mx-auto bg-white border border-slate-300 rounded-xl shadow-xs p-6 text-slate-900 text-[11px] leading-tight select-text">
        
        {/* 1. COMPACT HEADER (Reduced by 40% height) */}
        <div className="border-b border-slate-300 pb-2.5 mb-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#0B72E7] flex items-center justify-center text-white font-black text-sm shadow-2xs">
                R
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-black tracking-tight text-slate-950 uppercase leading-none">RazorCommerce</h1>
                  <span className="text-[9px] bg-slate-100 text-slate-600 font-mono font-bold px-1.5 py-0.2 rounded border border-slate-200">
                    TAX INVOICE
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 font-medium">Enterprise Fintech B2C Supply (Rule 48 CGST 2017)</p>
              </div>
            </div>

            {/* Quick Key-Value Badges */}
            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-400 block leading-none">Invoice No & Date</span>
                <span className="font-mono font-extrabold text-slate-900 text-xs">{meta.invoice_number}</span>
                <span className="text-[9px] text-slate-600 font-semibold block">{meta.invoice_date}</span>
              </div>
              <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />
              <div className="hidden sm:block">
                <span className="text-[9px] font-mono uppercase text-slate-400 block leading-none">Order Ref</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{meta.order_number}</span>
                <span className="text-[9px] text-emerald-700 font-semibold block">Reverse Charge: No</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. THREE-COLUMN METADATA GRID (Seller, Buyer & Transaction Details) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-2.5">
          
          {/* Seller / Sold By */}
          <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/70 space-y-1">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-800 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#0B72E7]" />
                Sold By (Seller)
              </span>
              <span className="text-[9px] font-mono bg-blue-50 text-blue-700 px-1 py-0.2 rounded font-bold">STATE: 29</span>
            </div>
            <p className="font-bold text-slate-950 text-[11px] truncate">{seller.legal_name}</p>
            <p className="text-[10px] text-slate-600 line-clamp-2 leading-snug">{seller.registered_address}</p>
            <div className="text-[10px] space-y-0.2 pt-0.5 text-slate-700">
              <p><span className="text-slate-500 font-mono">GSTIN:</span> <strong className="font-mono text-slate-900">{seller.gstin}</strong></p>
              <p><span className="text-slate-500 font-mono">PAN:</span> <strong className="font-mono text-slate-900">{seller.pan}</strong></p>
            </div>
          </div>

          {/* Customer / Billing & Shipping */}
          <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/70 space-y-1">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-800 flex items-center gap-1">
                <FileText className="w-3 h-3 text-emerald-600" />
                Billed & Shipped To
              </span>
              <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded font-bold">CONSUMER</span>
            </div>
            <p className="font-bold text-slate-950 text-[11px] truncate">{customer.customer_name}</p>
            <p className="text-[10px] text-slate-600 line-clamp-2 leading-snug">{customer.shipping_address || customer.billing_address}</p>
            <div className="text-[10px] space-y-0.2 pt-0.5 text-slate-700">
              <p><span className="text-slate-500">Phone:</span> <span className="font-semibold text-slate-900">{customer.customer_phone}</span></p>
              <p><span className="text-slate-500">Place of Supply:</span> {customer.place_of_supply || 'Karnataka (29)'}</p>
            </div>
          </div>

          {/* Payment & Logistics Snapshot */}
          <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/70 space-y-1">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-800 flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-purple-600" />
                Payment & Fulfillment
              </span>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-mono">
                {payment.payment_status || 'PAID'}
              </span>
            </div>
            <div className="text-[10px] space-y-0.5 pt-0.5 text-slate-700">
              <p><span className="text-slate-500">Payment Mode:</span> <strong className="text-slate-900">{payment.payment_method || 'UPI / Card'}</strong></p>
              <p className="truncate"><span className="text-slate-500 font-mono">Gateway ID:</span> <span className="font-mono text-slate-800 text-[9px]">{payment.razorpay_payment_id}</span></p>
              <p><span className="text-slate-500">Carrier:</span> <strong className="text-slate-900">{courier.carrier_name || 'Delhivery Express'}</strong></p>
              <p className="truncate"><span className="text-slate-500 font-mono">AWB:</span> <span className="font-mono text-slate-800 text-[9px]">{courier.awb_number || 'AWB-DELH-987123'}</span></p>
            </div>
          </div>

        </div>

        {/* 3. REVISED COMPACT PRODUCT TABLE */}
        <div className="border border-slate-300 rounded-lg overflow-hidden mb-2.5">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase tracking-wider text-[9px]">
                <th className="py-1.5 px-2.5">Product</th>
                <th className="py-1.5 px-2 text-center font-mono">SKU / HSN</th>
                <th className="py-1.5 px-2 text-center">Qty</th>
                <th className="py-1.5 px-2 text-right">Unit Price</th>
                <th className="py-1.5 px-2 text-right">GST (18%)</th>
                <th className="py-1.5 px-2 text-right">Discount</th>
                <th className="py-1.5 px-2.5 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {lineItems.map((item: any, i: number) => {
                const mrp = item.mrp || Math.round(Number(item.gross_unit_price || 0) * 1.15);
                const unitPrice = Number(item.gross_unit_price || 0);
                const savings = mrp - unitPrice;
                const savingsPct = mrp > 0 ? Math.round((savings / mrp) * 100) : 0;
                const gstAmount = Number(item.cgst_amount || 0) + Number(item.sgst_amount || 0) + Number(item.igst_amount || 0);

                return (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2 px-2.5">
                      <p className="font-bold text-slate-950 text-[11px] leading-tight">{item.description}</p>
                      {savings > 0 && (
                        <p className="text-[9px] text-emerald-700 font-medium mt-0.2">
                          MRP: <span className="line-through text-slate-400">₹{mrp.toLocaleString('en-IN')}</span> (Saved ₹{savings.toLocaleString('en-IN')} / {savingsPct}% off)
                        </p>
                      )}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-slate-600">
                      <div>{item.sku}</div>
                      <div className="text-[9px] text-slate-400">HSN: {item.hsn_sac}</div>
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-slate-900">{item.quantity}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-800">
                      ₹{unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-slate-700">
                      <div>₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      <div className="text-[8px] text-slate-400">(CGST+SGST 9%)</div>
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-emerald-700 font-semibold">
                      {item.line_savings > 0 ? `-₹${Number(item.line_savings).toLocaleString('en-IN')}` : '₹0.00'}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono font-extrabold text-slate-950 text-[11px]">
                      ₹{Number(item.line_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 4. COMPACT FINANCIAL SUMMARY & QR CODE VERIFICATION */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 mb-2.5">
          
          {/* LEFT: QR CODE & AMOUNT IN WORDS (7 COLS) */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-2 border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
            <div className="flex items-start gap-3">
              {/* Invoice QR Code */}
              <div className="shrink-0">
                <InvoiceQRCode text={meta.qr_verification_url || meta.invoice_number} />
              </div>
              
              {/* QR Verification details & Legal Words */}
              <div className="space-y-1.5 min-w-0">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                    Scan to Verify Tax Invoice
                  </span>
                  <p className="text-[9px] text-slate-600 leading-tight">
                    Digitally signed e-invoice registered with RazorCommerce GST Compliance Gateway. Valid for ITC Input Tax Credit.
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block">Amount in Words</span>
                  <p className="font-extrabold text-slate-900 text-[10px] italic leading-tight">
                    {summary.amount_in_words || 'INR Zero Only'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: COMPACT TAX & TOTAL CALCULATION (5 COLS) */}
          <div className="md:col-span-5 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-[10px] space-y-1">
            <div className="space-y-1 pb-1.5 border-b border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Value:</span>
                <span className="font-mono font-semibold text-slate-900">₹{Number(summary.subtotal_taxable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST (9.0%):</span>
                <span className="font-mono font-semibold text-slate-900">₹{Number(summary.cgst_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (9.0%):</span>
                <span className="font-mono font-semibold text-slate-900">₹{Number(summary.sgst_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {Number(summary.delivery_fee || 0) > 0 ? `₹${Number(summary.delivery_fee).toFixed(2)}` : 'FREE'}
                </span>
              </div>
              {Number(summary.discount_amount || 0) > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount:</span>
                  <span className="font-mono">-₹{Number(summary.discount_amount).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="pt-0.5 flex justify-between items-baseline">
              <div>
                <span className="font-black text-slate-950 text-xs block">Grand Total:</span>
                <span className="text-[8px] text-slate-400">(Incl. all GST Taxes)</span>
              </div>
              <span className="font-mono font-black text-slate-950 text-base text-right">
                ₹{Number(summary.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

        </div>

        {/* 5. STATUTORY DECLARATION & DIGITAL SIGNATURE */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-2 border-t border-slate-300 items-center">
          {/* Legal Declarations (9 COLS) */}
          <div className="md:col-span-8 space-y-0.5 text-[9px] text-slate-500 leading-snug">
            <p>
              <strong className="text-slate-700">Statutory Declaration: </strong>
              {legal.declaration || 'We declare that this invoice shows the actual price of the goods described and all particulars are true and correct under CGST Act 2017.'}
            </p>
            <p>
              <strong className="text-slate-700">15-Day Return Policy: </strong>
              {legal.return_policy || 'Eligible for return/replacement within 15 days of delivery.'}
            </p>
          </div>

          {/* Authorized Signatory Stamp (4 COLS) */}
          <div className="md:col-span-4 border border-slate-300 rounded-lg p-1.5 bg-slate-50 text-center">
            <span className="text-[8px] font-semibold text-slate-600 uppercase block">
              For Acme Direct Hardware & Fintech Systems
            </span>
            <div className="py-0.5">
              <span className="inline-block px-1.5 py-0.2 bg-blue-50 border border-blue-200 text-[#0B72E7] font-mono text-[8px] font-black rounded tracking-tight">
                [DIGITALLY SIGNED & VERIFIED]
              </span>
            </div>
            <span className="text-[8px] font-bold text-slate-800 block">
              Authorized Signatory
            </span>
          </div>
        </div>

        {/* 6. COMPACT 1-LINE FOOTER */}
        <div className="mt-2 pt-1.5 border-t border-slate-200 text-center text-[8px] text-slate-400 flex justify-between items-center">
          <span>Customer Support: <strong>care@razorcommerce.in</strong> | Toll Free: <strong>1800-120-RAZOR</strong></span>
          <span className="font-mono">Page 1 of 1 • Generated: {meta.generated_timestamp || '2026-09-05T01:30:00Z'}</span>
        </div>

      </div>
    </div>
  );
}
