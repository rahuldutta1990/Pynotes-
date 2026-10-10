import React from 'react';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from './BrandLogo';
import { X, Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';

export const InvoiceModal: React.FC = () => {
  const { activeOrderForInvoice, setActiveOrderForInvoice, settings } = useStore();

  const order = activeOrderForInvoice;
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#071E38]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl border border-[#CED7DF]/50 ring-1 ring-black/5 relative flex flex-col font-body">
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between pb-6 border-b border-[#CED7DF] print:hidden">
          <div className="flex items-center gap-2">
            <span className="bg-[#DDF3F4] text-[#12A5B0] text-xs font-bold px-2.5 py-1 rounded-md uppercase font-heading">
              MarginMinds GST Compliant
            </span>
            <span className="text-xs text-[#6D86A0]">Tax Invoice / Bill of Supply</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#0B3561] hover:bg-[#071E38] text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer font-heading uppercase"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={() => setActiveOrderForInvoice(null)}
              className="p-1.5 text-[#6D86A0] hover:text-[#0B3561] rounded-lg hover:bg-[#E7EBEF] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE BODY */}
        <div className="pt-6 space-y-6 text-[#071E38] text-xs">
          {/* 1. Header with Logo */}
          <div className="flex justify-between items-start">
            <div>
              <div className="mb-2">
                <BrandLogo height={36} showTagline={false} />
              </div>
              <h1 className="text-lg font-black text-[#0B3561] font-heading mt-1">
                {settings.legalEntity || 'Pynotes Educational Media LLP'}
              </h1>
              <p className="text-stone-500 text-[11px] mt-0.5">
                Specialized Publisher of Printed Handwritten Engineering Notes
              </p>
              <p className="text-stone-500 text-[11px]">
                Ground Floor, Tech Hub Towers, Okhla Phase III, New Delhi - 110020
              </p>
              <p className="text-stone-700 font-bold text-[11px] mt-1">
                GSTIN: <span className="font-mono">{settings.gstin || '07AAECP4108K1Z5'}</span>
              </p>
              <p className="text-stone-500 text-[11px]">State: Delhi (Code: 07)</p>
            </div>

            <div className="text-right">
              <div className="text-base font-black text-stone-900 uppercase tracking-wider font-mono">
                TAX INVOICE
              </div>
              <div className="text-xs font-bold text-stone-800 mt-1">
                Invoice No: <span className="font-mono">{order.invoiceNumber}</span>
              </div>
              <div className="text-stone-500 text-[11px]">
                Order No: <span className="font-mono">{order.orderNumber}</span>
              </div>
              <div className="text-stone-500 text-[11px]">
                Date: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="mt-1 space-y-0.5">
                <span className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded uppercase ${
                  order.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  Payment: {order.paymentMethod === 'prepaid' ? 'Prepaid (Razorpay Online)' : 'Cash on Delivery (Pending Collect)'}
                </span>
                {order.razorpayPaymentId && (
                  <div className="text-[10px] text-teal-700 font-mono font-bold">
                    Razorpay ID: {order.razorpayPaymentId}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Customer & Shipping Addresses */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div>
              <div className="font-bold text-[11px] uppercase tracking-wider text-stone-400 mb-1">
                Billed To (Customer):
              </div>
              <div className="font-bold text-stone-900">{order.customerName}</div>
              <div className="text-stone-600 text-[11px]">{order.shippingAddress.streetAddress}</div>
              <div className="text-stone-600 text-[11px]">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </div>
              <div className="text-stone-600 text-[11px]">Mobile: +91 {order.customerPhone}</div>
              <div className="text-stone-600 text-[11px]">Email: {order.customerEmail}</div>
            </div>

            <div>
              <div className="font-bold text-[11px] uppercase tracking-wider text-stone-400 mb-1">
                Shipped To & Logistics:
              </div>
              <div className="font-bold text-stone-900">{order.customerName}</div>
              <div className="text-stone-600 text-[11px]">
                {order.shippingAddress.streetAddress}, {order.shippingAddress.city}
              </div>
              <div className="text-stone-600 text-[11px]">
                Courier: {order.courier}
              </div>
              <div className="text-stone-600 text-[11px] font-mono">
                AWB Tracking: {order.trackingNumber}
              </div>
              <div className="text-stone-600 text-[11px]">
                Place of Supply: {order.shippingAddress.state}
              </div>
            </div>
          </div>

          {/* 3. Line Items Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full text-left divide-y divide-stone-200">
              <thead className="bg-stone-50 text-[10px] uppercase font-bold text-stone-600">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center">HSN</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 text-right">Taxable Amt</th>
                  <th className="py-2.5 px-3 text-right">Total (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 text-stone-400">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold">
                      {item.title}
                      {item.isBundle && (
                        <div className="text-[10px] text-amber-700">
                          Smart Bundle - Physical Books Pack
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center font-mono">4901</td>
                    <td className="py-2 px-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-2 px-3 text-right">₹{item.unitPrice}</td>
                    <td className="py-2 px-3 text-right">₹{item.total}</td>
                    <td className="py-2 px-3 text-right font-black">₹{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. Financial Totals & Tax Details */}
          <div className="flex justify-between items-start pt-2">
            <div className="space-y-1 text-[11px] text-stone-500 max-w-sm">
              <p>
                <strong>GST Notice:</strong> Printed educational books and notes are classified under
                Harmonized System of Nomenclature (HSN) 4901 with 0% applicable GST as per GST Council notifications.
              </p>
              <p>
                Computer generated invoice. No physical signature required.
              </p>
            </div>

            <div className="w-64 space-y-1.5 text-xs text-stone-700">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-bold">₹{order.subtotal}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount ({order.couponCode}):</span>
                  <span>- ₹{order.discountAmount}</span>
                </div>
              )}
              {order.prepaidDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Prepaid Instant Discount:</span>
                  <span>- ₹{order.prepaidDiscount}</span>
                </div>
              )}
              {order.codFee > 0 && (
                <div className="flex justify-between text-amber-800">
                  <span>Cash on Delivery Handling:</span>
                  <span>+ ₹{order.codFee}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Charges:</span>
                <span className="font-bold text-emerald-700">₹0 (Free)</span>
              </div>
              <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t-2 border-stone-800">
                <span>Total Payable:</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* 5. Stamp / Signatory */}
          <div className="pt-6 border-t border-stone-200 flex justify-between items-end">
            <div className="text-[10px] text-stone-400">
              For support inquiries: {settings.supportEmail} | {settings.supportPhone}
            </div>
            <div className="text-right">
              <div className="w-36 border-b border-stone-400 pb-8 text-center text-[10px] font-bold text-stone-700 uppercase">
                Authorized Signatory
              </div>
              <div className="text-[10px] text-stone-500 mt-1">
                Pynotes Educational Media LLP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
