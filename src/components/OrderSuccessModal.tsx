import React from 'react';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from './BrandLogo';
import {
  CheckCircle2,
  X,
  FileText,
  Truck,
  ArrowRight,
  PhoneCall,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';

export const OrderSuccessModal: React.FC = () => {
  const {
    activeOrderForSuccess,
    setActiveOrderForSuccess,
    setActiveOrderForInvoice,
    setActiveOrderForTracking,
    setIsTrackingModalOpen
  } = useStore();

  const order = activeOrderForSuccess;
  if (!order) return null;

  const handleOpenInvoice = () => {
    setActiveOrderForInvoice(order);
  };

  const handleTrackOrder = () => {
    setActiveOrderForTracking(order);
    setIsTrackingModalOpen(true);
    setActiveOrderForSuccess(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#071E38]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#CED7DF] relative text-left font-body">
        {/* Close button */}
        <button
          onClick={() => setActiveOrderForSuccess(null)}
          className="absolute top-4 right-4 p-2 text-[#9DAEC0] hover:text-[#0B3561] rounded-full hover:bg-[#E7EBEF] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Logo & Success Icon */}
        <div className="text-center space-y-2 pb-6 border-b border-[#CED7DF]">
          <div className="flex justify-center mb-1">
            <BrandLogo height={36} showTagline={false} />
          </div>
          <div className="w-14 h-14 bg-[#DDF3F4] text-[#12A5B0] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0B3561] font-heading">
            Order Confirmed!
          </h2>
          <p className="text-xs sm:text-sm text-[#3C5D81]">
            Thank you for ordering with PyNotes! Your physical printed coding books are being prepped.
          </p>
          <div className="inline-block bg-[#DDF3F4] text-[#0B3561] text-xs font-mono font-bold px-3 py-1 rounded-full">
            Order ID: {order.orderNumber}
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="py-5 space-y-4 text-xs">
          {/* Status Message depending on payment method */}
          {order.paymentMethod === 'cod' ? (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-1">
              <div className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                <PhoneCall className="w-4 h-4 text-amber-700" />
                <span>Next Step: Quick COD Verification Call</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                To prevent failed door delivery, our customer support team will place a brief phone/WhatsApp call to <strong>+91 {order.customerPhone}</strong> to verify your address before dispatch.
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 space-y-1">
              <div className="font-bold text-emerald-900 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-emerald-700" />
                  <span>Prepaid Verified (Razorpay)</span>
                </div>
                {order.razorpayPaymentId && (
                  <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Ref: {order.razorpayPaymentId}
                  </span>
                )}
              </div>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                Payment received successfully via Razorpay Payment Gateway. Your order has been placed in priority dispatch and slotted for pickup with Delhivery Express.
              </p>
            </div>
          )}

          {/* Delivery & Items Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div>
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Shipping Destination:
              </div>
              <div className="font-bold text-stone-900 mt-1">{order.customerName}</div>
              <div className="text-stone-600 text-[11px] mt-0.5">
                {order.shippingAddress.streetAddress}, {order.shippingAddress.city},{' '}
                {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </div>
              <div className="text-stone-500 text-[11px] mt-0.5 font-mono">
                Phone: +91 {order.customerPhone}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Order Summary:
              </div>
              <div className="text-stone-700 mt-1 space-y-0.5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate pr-1">
                      {item.title} x {item.quantity}
                    </span>
                    <span className="font-bold">₹{item.total}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-stone-200 flex justify-between font-black text-stone-900">
                <span>Total Paid / Payable:</span>
                <span className="text-sm">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleOpenInvoice}
            className="flex-1 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>View GST Tax Invoice</span>
          </button>

          <button
            onClick={handleTrackOrder}
            className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Track Delivery</span>
          </button>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => setActiveOrderForSuccess(null)}
            className="text-xs text-stone-500 hover:text-stone-800 font-semibold cursor-pointer underline"
          >
            Back to Store Home
          </button>
        </div>
      </div>
    </div>
  );
};
