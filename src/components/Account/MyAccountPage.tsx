import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { BrandLogo } from '../BrandLogo';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  LogOut,
  Truck,
  FileText,
  ShieldAlert,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  Edit2,
  Check,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Heart
} from 'lucide-react';
import { ShippingAddress } from '../../types';
import {
  validateFullName,
  validatePhone,
  validateEmail,
  validateStreetAddress,
  validatePincode,
  validateCity
} from '../../utils/validation';

export const MyAccountPage: React.FC = () => {
  const {
    currentUser,
    userSession,
    orders,
    products,
    logoutUser,
    updateUserProfile,
    extendUserSession,
    navigateTo,
    openAuthModal,
    setActiveOrderForTracking,
    setIsTrackingModalOpen,
    setActiveOrderForInvoice,
    setIsReportIssueModalOpen,
    showToast,
    handleFetchLiveTracking,
    wishlist
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'address' | 'profile' | 'wishlist'>('orders');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [expandedOrderTrackId, setExpandedOrderTrackId] = useState<string | null>(null);

  // Address Form State
  const [addressForm, setAddressForm] = useState<ShippingAddress>(() => {
    return (
      currentUser?.savedAddress || {
        fullName: currentUser?.name || '',
        phone: currentUser?.phone || '',
        email: currentUser?.email || '',
        streetAddress: '',
        landmark: '',
        city: '',
        state: 'Delhi NCR',
        pincode: ''
      }
    );
  });

  // Profile Form State
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync state when currentUser changes (e.g. on login/logout)
  React.useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfileEmail(currentUser.email || '');
      setProfilePhone(currentUser.phone || '');
      if (currentUser.savedAddress) {
        setAddressForm(currentUser.savedAddress);
      }
    } else {
      setProfileName('');
      setProfileEmail('');
      setProfilePhone('');
      setAddressForm({
        fullName: '',
        phone: '',
        email: '',
        streetAddress: '',
        landmark: '',
        city: '',
        state: 'Delhi NCR',
        pincode: ''
      });
    }
  }, [currentUser]);

  // Filter orders matching logged-in customer's email or phone
  const customerOrders = orders.filter((o) => {
    if (!currentUser) return false;
    return (
      o.customerEmail.toLowerCase() === currentUser.email.toLowerCase() ||
      (Boolean(currentUser.phone) && o.customerPhone === currentUser.phone) ||
      currentUser.role === 'admin'
    );
  });

  const handlePincodeChange = (pin: string) => {
    const clean = pin.replace(/\D/g, '');
    const pinRes = validatePincode(clean);
    setAddressForm((prev) => ({
      ...prev,
      pincode: clean,
      ...(pinRes.detectedState ? { state: pinRes.detectedState } : {})
    }));
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(null);

    const nameRes = validateFullName(addressForm.fullName);
    if (!nameRes.isValid) {
      setAddressError(nameRes.message || 'Invalid full name.');
      return;
    }
    const phoneRes = validatePhone(addressForm.phone);
    if (!phoneRes.isValid) {
      setAddressError(phoneRes.message || 'Invalid 10-digit mobile number.');
      return;
    }
    const streetRes = validateStreetAddress(addressForm.streetAddress);
    if (!streetRes.isValid) {
      setAddressError(streetRes.message || 'Invalid street address.');
      return;
    }
    const pinRes = validatePincode(addressForm.pincode);
    if (!pinRes.isValid) {
      setAddressError(pinRes.message || 'Invalid 6-digit PIN code.');
      return;
    }
    const cityRes = validateCity(addressForm.city);
    if (!cityRes.isValid) {
      setAddressError(cityRes.message || 'Invalid city.');
      return;
    }

    await updateUserProfile({ savedAddress: addressForm });
    setIsEditingAddress(false);
    showToast('Delivery shipping address updated and validated!');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    const nameRes = validateFullName(profileName);
    if (!nameRes.isValid) {
      setProfileError(nameRes.message || 'Please enter a valid full name.');
      return;
    }
    const emailRes = validateEmail(profileEmail);
    if (!emailRes.isValid) {
      setProfileError(emailRes.message || 'Please enter a valid email address.');
      return;
    }
    if (profilePhone) {
      const phoneRes = validatePhone(profilePhone);
      if (!phoneRes.isValid) {
        setProfileError(phoneRes.message || 'Please enter a valid 10-digit mobile number.');
        return;
      }
    }

    setIsSavingProfile(true);
    try {
      await updateUserProfile({
        name: profileName.trim(),
        email: profileEmail.trim(),
        phone: profilePhone ? profilePhone.replace(/\D/g, '') : undefined
      });
      showToast('Student profile details saved!');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleTrackClick = (order: any) => {
    setExpandedOrderTrackId((prev) => (prev === order.id ? null : order.id));
    setActiveOrderForTracking(order);
  };

  const handleInvoiceClick = (order: any) => {
    setActiveOrderForInvoice(order);
  };

  const handleReportClaimClick = (order: any) => {
    setActiveOrderForTracking(order);
    setIsReportIssueModalOpen(true);
  };

  const handleDownloadPDF = (order: any) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`PyNotes Order Receipt`, 10, 20);
    doc.setFontSize(12);
    doc.text(`Order Number: ${order.orderNumber}`, 10, 30);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 10, 40);
    doc.text(`Total Amount: ₹${order.totalAmount.toLocaleString('en-IN')}`, 10, 50);
    
    doc.save(`receipt_${order.orderNumber}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#071E38] font-body flex flex-col">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#CED7DF] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('store')}
              className="flex items-center gap-2 text-xs font-bold text-[#0B3561] hover:text-[#12A5B0] bg-[#F7FAFC] hover:bg-[#E7EBEF] px-3.5 py-2 rounded-xl transition-all cursor-pointer font-heading"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>
            <div className="h-6 w-px bg-[#CED7DF] hidden sm:block"></div>
            <button onClick={() => navigateTo('store')} className="cursor-pointer">
              <BrandLogo height={38} showTagline={true} />
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs text-[#6D86A0]">
                  Logged in as <strong className="text-[#0B3561]">{currentUser.name}</strong>
                </span>
                <button
                  onClick={logoutUser}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer font-heading"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="bg-[#12A5B0] hover:bg-[#0e8a93] text-white font-extrabold px-4 py-2 rounded-xl transition-colors cursor-pointer font-heading uppercase text-xs tracking-wider"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full space-y-8">
        {/* Customer Profile Banner */}
        <div className="bg-white rounded-3xl border border-[#CED7DF] p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute inset-0 bg-ruled-paper opacity-30 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {currentUser ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#0B3561] text-[#DDF3F4] flex items-center justify-center font-black text-2xl font-heading shadow-md ring-4 ring-[#DDF3F4] relative">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
                  {userSession && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-[#0B3561] font-heading tracking-tight">
                      {currentUser.name}
                    </h1>
                    <span className="bg-[#DDF3F4] text-[#12A5B0] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase font-heading">
                      Verified Learner
                    </span>
                  </div>
                  <p className="text-xs text-[#6D86A0] mt-0.5">
                    {currentUser.email}
                  </p>
                  {currentUser.phone && (
                    <p className="text-xs text-[#6D86A0] font-mono mt-0.5">
                      +91 {currentUser.phone}
                    </p>
                  )}
                  {userSession && (
                    <div className="mt-2.5 inline-flex items-center gap-2 text-[11px] text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full font-mono">
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                      <span>Session: Active (Token: {userSession.token.substring(0, 14)}...)</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#E7EBEF] text-[#6D86A0] flex items-center justify-center font-black text-2xl font-heading shadow-inner">
                  <User className="w-8 h-8 text-[#6D86A0]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-[#0B3561] font-heading tracking-tight">
                      Guest Session
                    </h1>
                    <span className="bg-[#E7EBEF] text-[#6D86A0] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase font-heading">
                      Not Logged In
                    </span>
                  </div>
                  <p className="text-xs text-[#6D86A0] mt-0.5">
                    Sign in or create a student profile to save your addresses and track orders.
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={() => openAuthModal('login')}
                      className="bg-[#0B3561] hover:bg-[#071E38] text-white font-bold px-3.5 py-1.5 rounded-xl text-xs cursor-pointer font-heading uppercase"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => openAuthModal('signup')}
                      className="bg-[#12A5B0] hover:bg-[#0e8a93] text-white font-bold px-3.5 py-1.5 rounded-xl text-xs cursor-pointer font-heading uppercase"
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => navigateTo('store')}
                className="bg-[#12A5B0] hover:bg-[#0e8a93] text-white font-black px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer font-heading uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Book Catalogue</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Requirement: My Account with Session & Validation) */}
        <div className="flex items-center gap-2 border-b border-[#CED7DF] pb-2 text-xs font-bold font-heading uppercase tracking-wider flex-wrap">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-[#12A5B0] text-[#0B3561] font-black'
                : 'border-transparent text-[#6D86A0] hover:text-[#0B3561]'
            }`}
          >
            <Package className="w-4 h-4 text-[#12A5B0]" />
            <span>My Orders ({customerOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('address')}
            className={`pb-2 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'address'
                ? 'border-[#12A5B0] text-[#0B3561] font-black'
                : 'border-transparent text-[#6D86A0] hover:text-[#0B3561]'
            }`}
          >
            <MapPin className="w-4 h-4 text-[#12A5B0]" />
            <span>Saved Shipping Address</span>
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`pb-2 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'wishlist'
                ? 'border-[#12A5B0] text-[#0B3561] font-black'
                : 'border-transparent text-[#6D86A0] hover:text-[#0B3561]'
            }`}
          >
            <Heart className="w-4 h-4 text-[#12A5B0]" />
            <span>Wishlist ({wishlist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-[#12A5B0] text-[#0B3561] font-black'
                : 'border-transparent text-[#6D86A0] hover:text-[#0B3561]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#12A5B0]" />
            <span>Profile & Session Security</span>
          </button>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {customerOrders.length > 0 ? (
              customerOrders.map((order) => {
                const isPaid = order.paymentStatus === 'paid';
                const steps = [
                  { label: 'Order Placed', desc: 'Received & verified in PyNotes system' },
                  { label: 'Confirmed & Invoiced', desc: 'Verified & GST tax invoice generated' },
                  { label: 'Picked Up by Courier', desc: 'Handed to Delhivery / Blue Dart logistics' },
                  { label: 'In Transit Hubs', desc: 'Fast movement across transit hubs' },
                  { label: 'Out for Delivery', desc: 'Courier delivery executive on route' },
                  { label: 'Delivered at Doorstep', desc: '48-hour free replacement guarantee begins' }
                ];
                let currentStepIdx = 1;
                if (order.status === 'Completed or Shipped') {
                  currentStepIdx = 5; // Delivered
                } else if (order.status === 'Processing') {
                  currentStepIdx = order.codConfirmed || order.paymentMethod === 'prepaid' ? 2 : 1;
                } else if (order.status === 'Cancelled' || order.status === 'Refunded') {
                  currentStepIdx = 0;
                }
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-[#CED7DF] p-6 shadow-xs hover:border-[#12A5B0] transition-colors space-y-4"
                  >
                    {/* Top order summary */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E7EBEF] text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-sm text-[#0B3561]">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[#9DAEC0]">•</span>
                        <span className="text-[#6D86A0]">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="text-[#9DAEC0]">•</span>
                        <span
                          className={`font-black font-heading text-[10px] px-2 py-0.5 rounded-full uppercase ${
                            order.status === 'Completed or Shipped'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-[#DDF3F4] text-[#12A5B0]'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-base text-[#0B3561]">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-heading ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isPaid ? 'Prepaid (Paid)' : 'Cash on Delivery'}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {order.items.map((item, idx) => {
                        const itemImg = item.coverImage || products.find((p) => p.id === item.productId)?.coverImage;
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-[#F7FAFC] rounded-2xl border border-[#CED7DF]"
                          >
                            {itemImg ? (
                              <img
                                src={itemImg}
                                alt={item.title}
                                className="w-12 h-16 object-cover rounded-lg shadow-2xs shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-16 bg-[#0B3561] text-white flex items-center justify-center rounded-lg font-bold text-xs shrink-0">
                                Book
                              </div>
                            )}
                            <div className="truncate text-xs">
                              <div className="font-bold text-[#0B3561] truncate font-heading">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-[#6D86A0]">
                                Qty: {item.quantity} &times; ₹{item.unitPrice}
                              </div>
                              <div className="text-[10px] font-mono text-[#12A5B0] font-bold">
                                Subtotal: ₹{item.total}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Shipping Address & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#E7EBEF] text-xs">
                      <div className="text-[#6D86A0] max-w-md">
                        <strong className="text-[#0B3561]">Shipping to: </strong>
                        {order.shippingAddress.streetAddress}, {order.shippingAddress.city},{' '}
                        {order.shippingAddress.state} - {order.shippingAddress.pincode}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Track button */}
                        <button
                          onClick={() => handleTrackClick(order)}
                          className="bg-[#DDF3F4] hover:bg-[#c2ebed] text-[#0B3561] font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer font-heading"
                        >
                          <Truck className="w-3.5 h-3.5 text-[#12A5B0]" />
                          <span>Track Parcel</span>
                        </button>

                        {/* Invoice button */}
                        <button
                          onClick={() => handleInvoiceClick(order)}
                          className="bg-[#E7EBEF] hover:bg-[#CED7DF] text-[#0B3561] font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer font-heading"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#0B3561]" />
                          <span>GST Tax Invoice</span>
                        </button>
                        
                        {/* Download PDF button */}
                        <button
                          onClick={() => handleDownloadPDF(order)}
                          className="bg-[#DDF3F4] hover:bg-[#c2ebed] text-[#12A5B0] font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer font-heading"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#12A5B0]" />
                          <span>PDF Receipt</span>
                        </button>

                        {/* 48h issue claim */}
                        <button
                          onClick={() => handleReportClaimClick(order)}
                          className="text-[#6D86A0] hover:text-[#0B3561] font-bold px-2 py-2 rounded-xl transition-colors flex items-center gap-1 cursor-pointer font-heading"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                          <span>Report Issue (48h)</span>
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Real-Time Live Tracking Dashboard Panel */}
                    {expandedOrderTrackId === order.id && (
                      <div className="mt-4 pt-4 border-t border-[#E7EBEF] space-y-4 animate-in slide-in-from-top-3 duration-250">
                        <div className="bg-[#F7FAFC] rounded-2xl p-4 border border-[#CED7DF] space-y-4 text-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#CED7DF]/60">
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-[#12A5B0]" />
                              <span className="font-extrabold text-[#0B3561] font-heading uppercase text-[10px] tracking-wider">
                                Live Courier Status Dashboard (Shiprocket Partner)
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-[#6D86A0] flex items-center gap-2">
                              <span>AWB Waybill: <strong className="text-[#12A5B0]">{order.trackingNumber || 'PENDING'}</strong></span>
                              {order.trackingNumber && order.trackingNumber !== 'PENDING-CONFIRMATION' && (
                                <button
                                  type="button"
                                  onClick={() => handleFetchLiveTracking(order.id)}
                                  className="p-1 px-2 rounded-lg bg-white border border-[#CED7DF] hover:border-[#12A5B0] text-[#0B3561] hover:text-[#12A5B0] font-extrabold text-[9px] transition-all flex items-center gap-1 cursor-pointer font-heading uppercase"
                                  title="Sync live status with Delhivery or Shiprocket servers"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Sync Live</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                            {/* Visual Progress Steps */}
                            <div className="space-y-3">
                              <div className="text-[10px] font-bold text-[#0B3561] uppercase tracking-wider font-heading">
                                Fulfillment Tracker Progress
                              </div>
                              <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#CED7DF]">
                                {steps.map((step, idx) => {
                                  const isDone = idx <= currentStepIdx;
                                  const isCurrent = idx === currentStepIdx;
                                  return (
                                    <div key={idx} className="relative flex items-start gap-2.5 text-xs">
                                      <div
                                        className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-[#F7FAFC] transition-all ${
                                          isDone
                                            ? 'bg-[#12A5B0] text-white'
                                            : 'bg-[#E7EBEF] text-[#6D86A0]'
                                        }`}
                                      >
                                        {isDone ? (
                                          <Check className="w-3 h-3 stroke-[3]" />
                                        ) : (
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#9DAEC0]"></span>
                                        )}
                                      </div>
                                      <div>
                                        <div
                                          className={`font-bold font-heading text-[11px] ${
                                            isCurrent
                                              ? 'text-[#12A5B0] font-black'
                                              : isDone
                                              ? 'text-[#0B3561]'
                                              : 'text-[#9DAEC0]'
                                          }`}
                                        >
                                          {step.label}
                                        </div>
                                        <div className="text-[10px] text-[#6D86A0]">{step.desc}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Checkpoint Logs */}
                            <div className="space-y-3">
                              <div className="text-[10px] font-bold text-[#0B3561] uppercase tracking-wider font-heading">
                                Courier Checkpoint Activity Logs
                              </div>
                              {order.trackingEvents && order.trackingEvents.length > 0 ? (
                                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                                  {order.trackingEvents.map((ev, i) => (
                                    <div key={i} className="bg-white p-2.5 rounded-xl border border-[#CED7DF]/60 space-y-1">
                                      <div className="flex justify-between items-center text-[10px] font-mono">
                                        <span className="font-bold text-[#12A5B0] bg-[#DDF3F4] px-1.5 py-0.5 rounded uppercase">
                                          {ev.status}
                                        </span>
                                        <span className="text-[#9DAEC0]">{ev.timestamp}</span>
                                      </div>
                                      <p className="text-[11px] text-[#3C5D81] font-medium leading-relaxed">
                                        {ev.note}
                                      </p>
                                      {ev.location && (
                                        <div className="text-[10px] text-[#6D86A0] font-mono">
                                          📍 {ev.location}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-4 bg-white rounded-xl border border-dashed border-[#CED7DF] text-center text-[11px] text-[#6D86A0]">
                                  No logistics checkpoints logged yet. Once dispatched via Shiprocket, progress updates from Delhivery or Blue Dart will appear here in real-time.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-3xl border border-[#CED7DF] p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#DDF3F4] text-[#12A5B0] flex items-center justify-center mx-auto">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#0B3561] font-heading">
                  No Orders Placed Yet
                </h3>
                <p className="text-xs text-[#6D86A0] max-w-sm mx-auto">
                  Start learning with our printed handwritten coding notes. Order single titles or multi-book Smart Bundles.
                </p>
                <button
                  onClick={() => navigateTo('store')}
                  className="bg-[#12A5B0] hover:bg-[#0e8a93] text-white font-bold px-6 py-3 rounded-xl text-xs transition-colors cursor-pointer font-heading uppercase tracking-wide inline-flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Books Now</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED SHIPPING ADDRESS WITH LIVE VALIDATION */}
        {activeTab === 'address' && (
          <div className="bg-white rounded-3xl border border-[#CED7DF] p-6 sm:p-8 shadow-xs max-w-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#E7EBEF] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#0B3561] font-heading">
                  Primary Delivery Address
                </h3>
                <p className="text-xs text-[#6D86A0] mt-0.5">
                  Pre-filled automatically during express checkout
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditingAddress(!isEditingAddress);
                  setAddressError(null);
                }}
                className="text-xs font-bold text-[#12A5B0] hover:underline flex items-center gap-1 cursor-pointer font-heading"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isEditingAddress ? 'Cancel' : 'Edit Address'}</span>
              </button>
            </div>

            {addressError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{addressError}</span>
              </div>
            )}

            {isEditingAddress ? (
              <form onSubmit={handleSaveAddress} className="space-y-4 text-xs font-body">
                <div>
                  <label className="block font-bold text-[#0B3561] mb-1 font-heading uppercase tracking-wider text-[11px]">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5 text-xs text-[#071E38] font-medium focus:bg-white focus:outline-hidden focus:border-[#12A5B0]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#0B3561] mb-1 font-heading uppercase tracking-wider text-[11px]">
                      Mobile Number (10 Digits) *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '') })}
                      className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5 text-xs text-[#071E38] font-mono focus:bg-white focus:outline-hidden focus:border-[#12A5B0]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#0B3561] mb-1 font-heading uppercase tracking-wider text-[11px]">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={addressForm.email}
                      onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                      className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5 text-xs text-[#071E38] focus:bg-white focus:outline-hidden focus:border-[#12A5B0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#0B3561] mb-1 font-heading uppercase tracking-wider text-[11px]">
                    Street Address / House No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.streetAddress}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, streetAddress: e.target.value })
                    }
                    className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5 text-xs text-[#071E38] focus:bg-white focus:outline-hidden focus:border-[#12A5B0]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-[#0B3561] mb-1 font-heading uppercase tracking-wider text-[11px]">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={addressForm.pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5 text-xs text-[#071E38] font-mono focus:bg-white focus:outline-hidden focus:border-[#12A5B0]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#0B3561] mb-1 font-heading uppercase tracking-wider text-[11px]">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5 text-xs text-[#071E38] focus:bg-white focus:outline-hidden focus:border-[#12A5B0]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#0B3561] mb-1 font-heading uppercase tracking-wider text-[11px]">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5 text-xs text-[#071E38] focus:bg-white focus:outline-hidden focus:border-[#12A5B0]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#12A5B0] hover:bg-[#0e8a93] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer font-heading uppercase tracking-wide flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Validated Shipping Address</span>
                </button>
              </form>
            ) : (
              <div className="p-5 bg-[#F7FAFC] rounded-2xl border border-[#CED7DF] space-y-2 text-xs">
                <div className="font-bold text-[#0B3561] font-heading text-sm">
                  {addressForm.fullName}
                </div>
                <div className="text-[#6D86A0]">{addressForm.streetAddress}</div>
                {addressForm.landmark && (
                  <div className="text-[#6D86A0]">Landmark: {addressForm.landmark}</div>
                )}
                <div className="text-[#0B3561] font-bold">
                  {addressForm.city}, {addressForm.state} -{' '}
                  <span className="font-mono">{addressForm.pincode}</span>
                </div>
                <div className="pt-2 text-[#6D86A0] flex items-center gap-4 text-[11px]">
                  <span>Phone: +91 {addressForm.phone}</span>
                  <span>Email: {addressForm.email}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div className="bg-white rounded-3xl border border-[#CED7DF] p-6 sm:p-8 shadow-xs">
            <h3 className="text-base font-extrabold text-[#0B3561] font-heading mb-4">Saved for Later</h3>
            {wishlist.length === 0 ? (
              <div className="text-center py-12 text-[#6D86A0] text-xs">
                Your wishlist is empty. Explore our catalog to add books!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.filter(p => wishlist.includes(p.id)).map(p => (
                   <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* TAB 3: STUDENT PROFILE & SESSION SECURITY (Comprehensive Session Management) */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Profile Information with Real-time Validation */}
            <div className="bg-white rounded-3xl border border-[#CED7DF] p-6 sm:p-8 shadow-xs space-y-5">
              <div className="border-b border-[#E7EBEF] pb-3">
                <h3 className="text-base font-extrabold text-[#0B3561] font-heading">
                  Student Account Details
                </h3>
                <p className="text-xs text-[#6D86A0] mt-0.5">
                  Update your contact info for SMS delivery updates and order invoices
                </p>
              </div>

              {profileError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#0B3561] mb-1 font-heading uppercase tracking-wider text-[11px]">
                    Student Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#9DAEC0] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#F7FAFC] border border-[#CED7DF] rounded-xl text-xs text-[#071E38] focus:bg-white focus:outline-hidden focus:border-[#12A5B0] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#0B3561] mb-1 font-heading uppercase tracking-wider text-[11px]">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#9DAEC0] absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#F7FAFC] border border-[#CED7DF] rounded-xl text-xs text-[#071E38] focus:bg-white focus:outline-hidden focus:border-[#12A5B0]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#0B3561] font-heading uppercase tracking-wider text-[11px]">
                      Contact Mobile (Optional)
                    </label>
                    <span className="text-[10px] text-[#6D86A0]">
                      {profilePhone.replace(/\D/g, '').length} / 10 Digits
                    </span>
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#9DAEC0] absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-9 pr-3 py-2 bg-[#F7FAFC] border border-[#CED7DF] rounded-xl text-xs text-[#071E38] font-mono focus:bg-white focus:outline-hidden focus:border-[#12A5B0]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full py-2.5 bg-[#0B3561] hover:bg-[#071E38] text-white font-black rounded-xl transition-all cursor-pointer font-heading uppercase tracking-wider shadow-xs"
                >
                  {isSavingProfile ? 'Saving...' : 'Update Profile Info'}
                </button>
              </form>
            </div>

            {/* Right: Active Session & Security Center */}
            <div className="bg-white rounded-3xl border border-[#CED7DF] p-6 sm:p-8 shadow-xs space-y-5">
              <div className="border-b border-[#E7EBEF] pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-[#0B3561] font-heading">
                    Active Session & Security
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-heading">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>256-Bit SSL</span>
                  </span>
                </div>
                <p className="text-xs text-[#6D86A0] mt-0.5">
                  State persistence, encrypted authentication tokens & session keepalive
                </p>
              </div>

              {userSession ? (
                <div className="space-y-4 text-xs font-body">
                  <div className="bg-[#F7FAFC] border border-[#CED7DF] rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[10px] text-[#6D86A0] uppercase font-bold font-heading">
                          Session Token
                        </div>
                        <div className="font-mono text-xs font-bold text-[#0B3561] break-all mt-0.5">
                          {userSession.token}
                        </div>
                      </div>
                      <KeyRound className="w-4 h-4 text-[#12A5B0] shrink-0" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E7EBEF] text-[11px]">
                      <div>
                        <span className="text-[#6D86A0] block text-[10px] uppercase font-heading font-bold">
                          Login Timestamp
                        </span>
                        <span className="font-mono text-[#0B3561] font-bold">
                          {new Date(userSession.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(userSession.loginTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6D86A0] block text-[10px] uppercase font-heading font-bold">
                          Session Expiry
                        </span>
                        <span className="font-mono text-[#0B3561] font-bold">
                          {new Date(userSession.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E7EBEF] flex items-center justify-between text-[11px]">
                      <span className="text-[#6D86A0]">Persistence mode:</span>
                      <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        {userSession.rememberMe ? '7-Day Extended Session' : '24-Hour Single Session'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={extendUserSession}
                      className="flex-1 py-2.5 bg-[#DDF3F4] hover:bg-[#c2ebed] text-[#0B3561] font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-heading uppercase text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#12A5B0]" />
                      <span>Renew Session (7 Days)</span>
                    </button>

                    <button
                      type="button"
                      onClick={logoutUser}
                      className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-heading uppercase text-xs"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-[#F7FAFC] rounded-2xl border border-[#CED7DF] text-center space-y-3 text-xs">
                  <p className="text-[#6D86A0]">
                    You are currently using a temporary guest session. Sign in or create an account to activate a persistent 7-day SSL student token.
                  </p>
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="bg-[#12A5B0] hover:bg-[#0e8a93] text-white font-extrabold px-5 py-2.5 rounded-xl cursor-pointer font-heading uppercase tracking-wide text-xs inline-flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In to Student Account</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
