import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import {
  X,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  AlertCircle,
  FileText,
  LifeBuoy,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { validateTrackingQuery } from '../utils/validation';

export const OrderTrackingModal: React.FC = () => {
  const {
    isTrackingModalOpen,
    setIsTrackingModalOpen,
    activeOrderForTracking,
    setActiveOrderForTracking,
    orders,
    currentUser,
    setActiveOrderForInvoice,
    setIsReportIssueModalOpen
  } = useStore();

  const [searchKey, setSearchKey] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isTouched, setIsTouched] = useState(false);

  if (!isTrackingModalOpen) return null;

  // Filter orders matching logged-in customer session
  const userSessionOrders = currentUser
    ? orders.filter(
        (o) =>
          o.customerEmail.toLowerCase() === currentUser.email.toLowerCase() ||
          o.customerPhone === currentUser.phone
      )
    : [];

  const orderToTrack: Order | undefined =
    activeOrderForTracking ||
    (searchKey.trim()
      ? orders.find(
          (o) =>
            o.orderNumber.toLowerCase() === searchKey.toLowerCase().trim() ||
            o.customerPhone.includes(searchKey.trim()) ||
            o.trackingNumber.toLowerCase() === searchKey.toLowerCase().trim()
        )
      : userSessionOrders[0] || orders[0]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTouched(true);
    setSearchError('');

    const queryValidation = validateTrackingQuery(searchKey);
    if (!queryValidation.isValid) {
      setSearchError(queryValidation.message || 'Please enter a valid Order ID or 10-digit mobile number.');
      return;
    }

    const clean = queryValidation.cleanValue.toLowerCase();
    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === clean ||
        o.orderNumber.toLowerCase().includes(clean) ||
        o.customerPhone.includes(clean) ||
        o.trackingNumber.toLowerCase().includes(clean)
    );

    if (!found) {
      setSearchError(`No order found matching "${searchKey.trim()}". Please verify the Order ID or phone number.`);
    } else {
      setActiveOrderForTracking(found);
      setSearchError('');
    }
  };

  // Tracking steps definition
  const steps = [
    { label: 'Order Placed', desc: 'Received & verified in PyNotes system' },
    { label: 'Confirmed & Invoiced', desc: 'Verified & GST tax invoice generated' },
    { label: 'Picked Up by Courier', desc: 'Handed to Delhivery / Blue Dart logistics' },
    { label: 'In Transit Hubs', desc: 'Fast movement across fulfillment transit hubs' },
    { label: 'Out for Delivery', desc: 'Courier delivery executive on route' },
    { label: 'Delivered at Doorstep', desc: '48-hour free replacement guarantee begins' }
  ];

  // Determine current active step based on order status
  let currentStepIdx = 1;
  if (orderToTrack) {
    if (orderToTrack.status === 'Completed or Shipped') {
      currentStepIdx = 5; // Delivered
    } else if (orderToTrack.status === 'Processing') {
      currentStepIdx = orderToTrack.codConfirmed || orderToTrack.paymentMethod === 'prepaid' ? 2 : 1;
    } else if (orderToTrack.status === 'Cancelled' || orderToTrack.status === 'Refunded') {
      currentStepIdx = 0;
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#071E38]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-in fade-in duration-200 font-body">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-[#CED7DF] relative text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E7EBEF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DDF3F4] text-[#12A5B0] flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5 text-[#12A5B0]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0B3561] font-heading tracking-tight">
                Shiprocket Courier Live Tracking
              </h2>
              <p className="text-xs text-[#6D86A0]">
                Real-time tracking for printed spiral-bound handwritten notes
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsTrackingModalOpen(false);
              setActiveOrderForTracking(null);
            }}
            className="p-2 text-[#6D86A0] hover:text-[#0B3561] hover:bg-[#E7EBEF] rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Session Quick Pickers if Logged In */}
        {userSessionOrders.length > 0 && (
          <div className="mt-4 pt-1">
            <div className="text-[11px] font-bold text-[#0B3561] uppercase tracking-wider mb-2 font-heading flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#12A5B0]" />
              <span>Your Session Orders (Click to Track):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {userSessionOrders.map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => {
                    setActiveOrderForTracking(ord);
                    setSearchKey(ord.orderNumber);
                    setSearchError('');
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-mono font-bold flex items-center gap-1.5 ${
                    orderToTrack?.id === ord.id
                      ? 'bg-[#0B3561] text-white border-[#0B3561] shadow-xs'
                      : 'bg-[#F7FAFC] hover:bg-[#E7EBEF] text-[#0B3561] border-[#CED7DF]'
                  }`}
                >
                  <Package className="w-3 h-3 text-[#12A5B0]" />
                  <span>#{ord.orderNumber}</span>
                  <span className="text-[10px] opacity-75 font-sans">({ord.status})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar with live validation */}
        <form onSubmit={handleSearch} className="my-4">
          <label className="block text-[11px] font-bold text-[#0B3561] uppercase tracking-wider mb-1 font-heading">
            Track by Order ID or Registered Mobile
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9DAEC0] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. ORD-1001) or 10-digit mobile"
                value={searchKey}
                onChange={(e) => {
                  setSearchKey(e.target.value);
                  if (searchError) setSearchError('');
                }}
                onBlur={() => setIsTouched(true)}
                className={`w-full pl-10 pr-3.5 py-2.5 bg-[#F7FAFC] border rounded-xl text-xs focus:bg-white focus:outline-hidden font-mono transition-all ${
                  searchError
                    ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                    : 'border-[#CED7DF] focus:border-[#12A5B0]'
                }`}
              />
            </div>
            <button
              type="submit"
              className="bg-[#0B3561] hover:bg-[#071E38] text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer font-heading uppercase tracking-wider"
            >
              Track Now
            </button>
          </div>
          {searchError && (
            <div className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1.5 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </form>

        {/* Tracking Details */}
        {orderToTrack ? (
          <div className="space-y-6 pt-2">
            {/* Courier & AWB info bar */}
            <div className="bg-[#F7FAFC] rounded-2xl p-4 border border-[#CED7DF] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#6D86A0] text-[10px] uppercase font-bold font-heading">Order ID</span>
                <div className="font-extrabold text-[#0B3561] mt-0.5 font-mono">#{orderToTrack.orderNumber}</div>
              </div>
              <div>
                <span className="text-[#6D86A0] text-[10px] uppercase font-bold font-heading">Courier Partner</span>
                <div className="font-extrabold text-[#0B3561] mt-0.5">{orderToTrack.courier}</div>
              </div>
              <div>
                <span className="text-[#6D86A0] text-[10px] uppercase font-bold font-heading">AWB Waybill</span>
                <div className="font-extrabold text-[#12A5B0] font-mono mt-0.5">
                  {orderToTrack.trackingNumber}
                </div>
              </div>
              <div>
                <span className="text-[#6D86A0] text-[10px] uppercase font-bold font-heading">Status</span>
                <div className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1 font-heading">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{orderToTrack.status}</span>
                </div>
              </div>
            </div>

            {orderToTrack.razorpayPaymentId && (
              <div className="text-[11px] bg-[#DDF3F4] text-[#0B3561] px-3.5 py-2 rounded-xl border border-[#A0DBDF] flex items-center justify-between font-heading">
                <span className="font-bold">Payment Verified: Razorpay Gateway</span>
                <span className="font-mono text-[#12A5B0] font-black">{orderToTrack.razorpayPaymentId}</span>
              </div>
            )}

            {/* Visual Shiprocket Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#0B3561] uppercase tracking-wider font-heading">
                Logistics Fulfillment Progress
              </h4>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#CED7DF]">
                {steps.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  return (
                    <div key={idx} className="relative flex items-start gap-3 text-xs">
                      <div
                        className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white transition-all ${
                          isDone
                            ? 'bg-[#12A5B0] text-white'
                            : 'bg-[#E7EBEF] text-[#6D86A0]'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#9DAEC0]"></span>
                        )}
                      </div>
                      <div>
                        <div
                          className={`font-bold font-heading ${
                            isCurrent
                              ? 'text-[#12A5B0] text-sm font-black'
                              : isDone
                              ? 'text-[#0B3561]'
                              : 'text-[#9DAEC0]'
                          }`}
                        >
                          {step.label}
                        </div>
                        <div className="text-[11px] text-[#6D86A0]">{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracking History Logs */}
            {orderToTrack.trackingEvents && orderToTrack.trackingEvents.length > 0 && (
              <div className="bg-[#F7FAFC] rounded-2xl p-4 border border-[#CED7DF] space-y-2 text-xs">
                <div className="font-bold text-[#0B3561] uppercase text-[11px] tracking-wider font-heading">
                  Checkpoint Location Logs
                </div>
                <div className="space-y-2">
                  {orderToTrack.trackingEvents.map((ev, i) => (
                    <div key={i} className="flex justify-between items-start border-b border-[#CED7DF]/50 pb-1.5">
                      <div>
                        <span className="font-bold text-[#0B3561]">{ev.status}</span>
                        <div className="text-[11px] text-[#6D86A0]">{ev.location} • {ev.note}</div>
                      </div>
                      <div className="text-[10px] text-[#9DAEC0] font-mono whitespace-nowrap ml-2">
                        {ev.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Actions: Invoice & 48h Issue Claim */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setActiveOrderForInvoice(orderToTrack)}
                className="flex-1 bg-white hover:bg-[#F7FAFC] border border-[#CED7DF] text-[#0B3561] font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer font-heading"
              >
                <FileText className="w-4 h-4 text-[#12A5B0]" />
                <span>View GST Tax Invoice</span>
              </button>

              <button
                onClick={() => setIsReportIssueModalOpen(true)}
                className="flex-1 bg-[#DDF3F4] hover:bg-[#c2ebed] border border-[#A0DBDF] text-[#0B3561] font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer font-heading"
              >
                <LifeBuoy className="w-4 h-4 text-[#12A5B0]" />
                <span>Report 48h Delivery Issue</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-[#6D86A0]">
            Enter an Order ID from your confirmation email or SMS to track package location in real time.
          </div>
        )}
      </div>
    </div>
  );
};
