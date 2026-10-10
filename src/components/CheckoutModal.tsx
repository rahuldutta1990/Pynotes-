import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ShippingAddress, PaymentMethod } from '../types';
import {
  X,
  CreditCard,
  Banknote,
  Lock,
  ArrowRight,
  Info,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import {
  validateFullName,
  validatePhone,
  validateEmail,
  validateStreetAddress,
  validatePincode,
  validateCity,
  validateUpiId
} from '../utils/validation';
import { loadRazorpayScript, generateRazorpayPaymentId } from '../utils/razorpay';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi NCR', 'Chandigarh', 'Puducherry', 'Jammu & Kashmir', 'Ladakh'
];

import { useModalClose } from '../hooks/useModalClose';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    isCheckoutModalOpen,
    closeCheckout,
    handlePlaceOrder,
    cartSubtotal,
    cartCouponDiscount,
    cartPrepaidDiscount,
    cartShippingFee,
    cartCodFee,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    settings,
    currentUser,
    userSession,
    saveCheckoutDraft,
    getCheckoutDraft,
    clearCheckoutDraft,
    showToast,
    openAuthModal
  } = useStore();

  useModalClose(isCheckoutModalOpen, closeCheckout);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('prepaid');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Razorpay Gateway Flow State
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [pendingAddress, setPendingAddress] = useState<ShippingAddress | null>(null);
  const [selectedRzpTab, setSelectedRzpTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isRzpProcessing, setIsRzpProcessing] = useState(false);

  // Form Fields initialized with draft or active student session address
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Delhi NCR');
  const [pincode, setPincode] = useState('');
  const [upiId, setUpiId] = useState('student@okaxis');

  // Track touched fields for real-time validation styling
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Initialize from session on open
  useEffect(() => {
    if (!isCheckoutModalOpen) return;

    const draft = getCheckoutDraft();
    if (draft && draft.fullName) {
      setFullName(draft.fullName || '');
      setPhone(draft.phone || '');
      setEmail(draft.email || '');
      setStreetAddress(draft.streetAddress || '');
      setLandmark(draft.landmark || '');
      setCity(draft.city || '');
      setState(draft.state || 'Delhi NCR');
      setPincode(draft.pincode || '');
      return;
    }

    // Fallback to active user session saved address
    const saved = currentUser?.savedAddress;
    if (saved) {
      setFullName(saved.fullName || currentUser.name || '');
      setPhone(saved.phone || currentUser.phone || '');
      setEmail(saved.email || currentUser.email || '');
      setStreetAddress(saved.streetAddress || '');
      setLandmark(saved.landmark || '');
      setCity(saved.city || '');
      setState(saved.state || 'Delhi NCR');
      setPincode(saved.pincode || '');
    } else if (currentUser) {
      setFullName(currentUser.name || '');
      setEmail(currentUser.email || '');
      if (currentUser.phone) setPhone(currentUser.phone);
    }
  }, [isCheckoutModalOpen, currentUser]);

  // Persist draft in session storage on change
  useEffect(() => {
    if (fullName || phone || email || streetAddress || pincode) {
      saveCheckoutDraft({
        fullName,
        phone,
        email,
        streetAddress,
        landmark,
        city,
        state,
        pincode
      });
    }
  }, [fullName, phone, email, streetAddress, landmark, city, state, pincode]);

  if (!isCheckoutModalOpen) return null;

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Real-time validations
  const nameVal = validateFullName(fullName);
  const phoneVal = validatePhone(phone);
  const emailVal = validateEmail(email);
  const addressVal = validateStreetAddress(streetAddress);
  const pinVal = validatePincode(pincode);
  const cityVal = validateCity(city);
  const upiVal = validateUpiId(upiId);

  // Auto-detect Indian state from PIN code
  const handlePincodeChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setPincode(clean);
    if (clean.length >= 2) {
      const pinResult = validatePincode(clean);
      if (pinResult.detectedState && INDIAN_STATES.includes(pinResult.detectedState)) {
        setState(pinResult.detectedState);
      }
    }
  };

  const allCoupons = settings?.coupons || [];
  const applicableCoupons = allCoupons.filter((c) => {
    // 1. Must be active
    if (!c.active) return false;
    // 2. Must meet minimum order value
    if (c.minOrder > cartSubtotal) return false;
    // 3. Must not be expired
    if (c.expiryDate) {
      const expiry = new Date(c.expiryDate).getTime();
      const today = new Date().setHours(0, 0, 0, 0);
      if (expiry < today) return false;
    }
    return true;
  });

  const effectivePrepaidDiscount = paymentMethod === 'prepaid' ? cartPrepaidDiscount : 0;
  const effectiveCodFee = paymentMethod === 'cod' ? cartCodFee : 0;
  const finalPayable = Math.max(
    1,
    cartSubtotal - cartCouponDiscount - effectivePrepaidDiscount + cartShippingFee + effectiveCodFee
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Please log in to place an order.');
      openAuthModal('login');
      return;
    }
    setValidationError('');
    setTouched({
      fullName: true,
      phone: true,
      email: true,
      streetAddress: true,
      pincode: true,
      city: true,
      upiId: true
    });

    if (!nameVal.isValid) {
      setValidationError(nameVal.message || 'Please enter full name.');
      return;
    }
    if (!phoneVal.isValid) {
      setValidationError(phoneVal.message || 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!emailVal.isValid) {
      setValidationError(emailVal.message || 'Please enter a valid email address.');
      return;
    }
    if (!addressVal.isValid) {
      setValidationError(addressVal.message || 'Please enter a complete delivery address.');
      return;
    }
    if (!pinVal.isValid) {
      setValidationError(pinVal.message || 'Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    if (!cityVal.isValid) {
      setValidationError(cityVal.message || 'Please enter city name.');
      return;
    }
    if (paymentMethod === 'prepaid' && !upiVal.isValid) {
      setValidationError(upiVal.message || 'Please enter a valid UPI ID (e.g. name@okaxis).');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const cleanPin = pincode.replace(/\D/g, '');
      const address: ShippingAddress = {
        fullName: fullName.trim(),
        phone: cleanPhone,
        email: email.trim(),
        streetAddress: streetAddress.trim(),
        landmark: landmark.trim(),
        city: city.trim(),
        state,
        pincode: cleanPin
      };

      if (paymentMethod === 'prepaid') {
        await loadRazorpayScript();
        if (typeof window !== 'undefined' && window.Razorpay) {
          const options = {
            key: 'rzp_test_pynotes_prod',
            amount: Math.round(finalPayable * 100),
            currency: 'INR',
            name: 'PyNotes Educational Media',
            description: `Physical coding notes: ${cart.map((c) => c.product.title).slice(0, 2).join(', ')}`,
            image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=200',
            prefill: {
              name: fullName.trim(),
              email: email.trim(),
              contact: cleanPhone
            },
            notes: {
              address: `${streetAddress}, ${city}, ${state} - ${cleanPin}`,
              upiVpa: upiId || ''
            },
            theme: {
              color: '#0B3561'
            },
            modal: {
              ondismiss: () => {
                setIsSubmitting(false);
                showToast('Razorpay payment cancelled.');
              }
            },
            handler: async (response: any) => {
              const razorpayPaymentId = response.razorpay_payment_id || generateRazorpayPaymentId();
              await handlePlaceOrder(address, 'prepaid', razorpayPaymentId);
              clearCheckoutDraft();
              setIsSubmitting(false);
            }
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
          return;
        } else {
          // Open interactive Razorpay Gateway Modal
          setPendingAddress(address);
          setShowRazorpayModal(true);
          setIsSubmitting(false);
          return;
        }
      }

      await handlePlaceOrder(address, paymentMethod);
      clearCheckoutDraft();
    } catch (err) {
      console.error('Error placing order:', err);
      showToast('There was an issue processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthorizeRazorpay = async () => {
    if (!pendingAddress) return;
    setIsRzpProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const razorpayPaymentId = generateRazorpayPaymentId();
      await handlePlaceOrder(pendingAddress, 'prepaid', razorpayPaymentId);
      clearCheckoutDraft();
      setShowRazorpayModal(false);
      showToast(`Payment of ₹${finalPayable} verified via Razorpay!`);
    } catch (err) {
      console.error('Error processing Razorpay payment:', err);
      showToast('Payment processing error. Please try again.');
    } finally {
      setIsRzpProcessing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-[#071E38]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) closeCheckout(); }}
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-[#CED7DF]/50 ring-1 ring-black/5 relative flex flex-col font-body">
        {/* Modal Header */}
        <div className="bg-[#0B3561] text-white p-5 sm:p-6 rounded-t-3xl flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#12A5B0] text-white flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-heading tracking-tight">
                Secure Express Checkout
              </h2>
              <p className="text-xs text-[#DDF3F4] flex items-center gap-2">
                <span>100% Spiral-Bound Printed Editions</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#FFD54A]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>256-Bit SSL Encrypted Session</span>
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={closeCheckout}
            className="p-2 text-[#CED7DF] hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6 flex-1 text-left">
          {/* Active Session Notice if address pre-filled */}
          {currentUser && (
            <div className="bg-[#DDF3F4] border border-[#A0DBDF] p-3 rounded-2xl flex items-center justify-between text-xs text-[#0B3561]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#12A5B0] shrink-0" />
                <span>
                  Active student session for <strong>{currentUser.name}</strong> ({currentUser.email}).
                </span>
              </div>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold text-[#12A5B0]">
                Pre-filled from Profile
              </span>
            </div>
          )}

          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Contact, Shipping & Payment Method */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Contact Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-[#0B3561] uppercase tracking-wider flex items-center gap-2 font-heading">
                  <span className="w-5 h-5 rounded-full bg-[#0B3561] text-white text-[11px] flex items-center justify-center font-mono">
                    1
                  </span>
                  <span>Contact & Recipient Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#0B3561] mb-1 font-heading">
                      Full Name (For courier delivery) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        onBlur={() => markTouched('fullName')}
                        className={`w-full bg-[#F7FAFC] border rounded-xl px-3.5 py-2.5 text-xs text-[#071E38] focus:bg-white focus:outline-hidden font-medium ${
                          touched.fullName && !nameVal.isValid
                            ? 'border-red-400 focus:border-red-500'
                            : touched.fullName && nameVal.isValid
                            ? 'border-teal-500'
                            : 'border-[#CED7DF] focus:border-[#12A5B0]'
                        }`}
                        required
                      />
                      {touched.fullName && nameVal.isValid && (
                        <CheckCircle2 className="w-4 h-4 text-teal-600 absolute right-3 top-3" />
                      )}
                    </div>
                    {touched.fullName && !nameVal.isValid && (
                      <p className="text-[11px] text-red-600 mt-1">{nameVal.message}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-[#0B3561] font-heading">
                        Mobile Number *
                      </label>
                      <span className="text-[10px] text-[#6D86A0]">
                        {phone.replace(/\D/g, '').length} / 10
                      </span>
                    </div>
                    <div className="flex relative">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#CED7DF] bg-[#E7EBEF] text-[#0B3561] text-xs font-bold font-mono">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        onBlur={() => markTouched('phone')}
                        className={`w-full bg-[#F7FAFC] border rounded-r-xl px-3.5 py-2.5 text-xs text-[#071E38] focus:bg-white focus:outline-hidden font-mono ${
                          touched.phone && !phoneVal.isValid
                            ? 'border-red-400 focus:border-red-500'
                            : touched.phone && phoneVal.isValid
                            ? 'border-teal-500'
                            : 'border-[#CED7DF] focus:border-[#12A5B0]'
                        }`}
                        required
                      />
                      {touched.phone && phoneVal.isValid && (
                        <CheckCircle2 className="w-4 h-4 text-teal-600 absolute right-3 top-3" />
                      )}
                    </div>
                    {touched.phone && !phoneVal.isValid && (
                      <p className="text-[11px] text-red-600 mt-1">{phoneVal.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B3561] mb-1 font-heading">
                      Email Address (Invoice & Tracking) *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="rahul@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => markTouched('email')}
                        className={`w-full bg-[#F7FAFC] border rounded-xl px-3.5 py-2.5 text-xs text-[#071E38] focus:bg-white focus:outline-hidden font-medium ${
                          touched.email && !emailVal.isValid
                            ? 'border-red-400 focus:border-red-500'
                            : touched.email && emailVal.isValid
                            ? 'border-teal-500'
                            : 'border-[#CED7DF] focus:border-[#12A5B0]'
                        }`}
                        required
                      />
                      {touched.email && emailVal.isValid && (
                        <CheckCircle2 className="w-4 h-4 text-teal-600 absolute right-3 top-3" />
                      )}
                    </div>
                    {touched.email && !emailVal.isValid && (
                      <p className="text-[11px] text-red-600 mt-1">{emailVal.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Shipping Address */}
              <div className="space-y-3 pt-3 border-t border-[#E7EBEF]">
                <h3 className="text-xs font-black text-[#0B3561] uppercase tracking-wider flex items-center gap-2 font-heading">
                  <span className="w-5 h-5 rounded-full bg-[#0B3561] text-white text-[11px] flex items-center justify-center font-mono">
                    2
                  </span>
                  <span>Physical Delivery Address</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0B3561] mb-1 font-heading">
                      Flat / House No., Building Name & Street *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 302, Green View Apts, 4th Main Road"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      onBlur={() => markTouched('streetAddress')}
                      className={`w-full bg-[#F7FAFC] border rounded-xl px-3.5 py-2.5 text-xs text-[#071E38] focus:bg-white focus:outline-hidden font-medium ${
                        touched.streetAddress && !addressVal.isValid
                          ? 'border-red-400 focus:border-red-500'
                          : touched.streetAddress && addressVal.isValid
                          ? 'border-teal-500'
                          : 'border-[#CED7DF] focus:border-[#12A5B0]'
                      }`}
                      required
                    />
                    {touched.streetAddress && !addressVal.isValid && (
                      <p className="text-[11px] text-red-600 mt-1">{addressVal.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B3561] mb-1 font-heading">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Metro Station / Opposite State Bank"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl px-3.5 py-2.5 text-xs text-[#071E38] focus:bg-white focus:outline-hidden focus:border-[#12A5B0]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-[#0B3561] font-heading">
                          PIN Code *
                        </label>
                        {pinVal.detectedState && (
                          <span className="text-[10px] text-teal-700 font-bold">
                            {pinVal.detectedState}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="560103"
                          value={pincode}
                          onChange={(e) => handlePincodeChange(e.target.value)}
                          onBlur={() => markTouched('pincode')}
                          className={`w-full bg-[#F7FAFC] border rounded-xl px-3.5 py-2.5 text-xs text-[#071E38] focus:bg-white focus:outline-hidden font-mono ${
                            touched.pincode && !pinVal.isValid
                              ? 'border-red-400 focus:border-red-500'
                              : touched.pincode && pinVal.isValid
                              ? 'border-teal-500'
                              : 'border-[#CED7DF] focus:border-[#12A5B0]'
                          }`}
                          required
                        />
                        {touched.pincode && pinVal.isValid && (
                          <CheckCircle2 className="w-4 h-4 text-teal-600 absolute right-3 top-3" />
                        )}
                      </div>
                      {touched.pincode && !pinVal.isValid && (
                        <p className="text-[11px] text-red-600 mt-1">{pinVal.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0B3561] mb-1 font-heading">
                        City *
                      </label>
                      <input
                        type="text"
                        placeholder="Bengaluru"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onBlur={() => markTouched('city')}
                        className={`w-full bg-[#F7FAFC] border rounded-xl px-3.5 py-2.5 text-xs text-[#071E38] focus:bg-white focus:outline-hidden font-medium ${
                          touched.city && !cityVal.isValid
                            ? 'border-red-400 focus:border-red-500'
                            : touched.city && cityVal.isValid
                            ? 'border-teal-500'
                            : 'border-[#CED7DF] focus:border-[#12A5B0]'
                        }`}
                        required
                      />
                      {touched.city && !cityVal.isValid && (
                        <p className="text-[11px] text-red-600 mt-1">{cityVal.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0B3561] mb-1 font-heading">
                        State *
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl px-3.5 py-2.5 text-xs text-[#071E38] focus:bg-white focus:outline-hidden focus:border-[#12A5B0] cursor-pointer"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Payment Method Choice */}
              <div className="space-y-3 pt-3 border-t border-[#E7EBEF]">
                <h3 className="text-xs font-black text-[#0B3561] uppercase tracking-wider flex items-center gap-2 font-heading">
                  <span className="w-5 h-5 rounded-full bg-[#0B3561] text-white text-[11px] flex items-center justify-center font-mono">
                    3
                  </span>
                  <span>Select Payment Method</span>
                </h3>

                <div className="space-y-3">
                  {/* Option 1: Prepaid Razorpay */}
                  <div
                    onClick={() => setPaymentMethod('prepaid')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      paymentMethod === 'prepaid'
                        ? 'border-[#12A5B0] bg-[#DDF3F4]/50 shadow-xs'
                        : 'border-[#CED7DF] bg-white hover:border-[#A0DBDF]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'prepaid'
                              ? 'border-[#12A5B0] bg-[#12A5B0]'
                              : 'border-[#CED7DF]'
                          }`}
                        >
                          {paymentMethod === 'prepaid' && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-black text-[#0B3561] flex items-center gap-2 font-heading">
                            <span>Prepaid (UPI / Cards / NetBanking / GPay)</span>
                            <span className="bg-[#12A5B0] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                              EXTRA 10% OFF
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6D86A0] mt-0.5">
                            Instant online payment via Razorpay. Priority dispatch & zero COD fee.
                          </p>
                        </div>
                      </div>
                      <CreditCard className="w-5 h-5 text-[#12A5B0]" />
                    </div>

                    {paymentMethod === 'prepaid' && (
                      <div className="mt-3 pt-3 border-t border-[#A0DBDF] pl-8 space-y-2">
                        <div className="bg-white p-3 rounded-xl border border-[#A0DBDF] text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#0B3561] font-heading">
                              Instant UPI VPA Address:
                            </span>
                            {upiVal.isValid && (
                              <span className="text-[10px] text-teal-600 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-teal-600" />
                                <span>Valid VPA</span>
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            onBlur={() => markTouched('upiId')}
                            className={`w-full bg-[#F7FAFC] border rounded-lg px-2.5 py-1.5 text-xs font-mono ${
                              touched.upiId && !upiVal.isValid
                                ? 'border-red-400 focus:border-red-500'
                                : 'border-[#CED7DF] focus:border-[#12A5B0]'
                            }`}
                            placeholder="yourname@okaxis"
                          />
                          {touched.upiId && !upiVal.isValid && (
                            <p className="text-[10px] text-red-600">{upiVal.message}</p>
                          )}
                          <p className="text-[10px] text-[#6D86A0]">
                            Prepaid orders receive highest dispatch priority and save ₹{cartPrepaidDiscount}!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 2: Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      paymentMethod === 'cod'
                        ? 'border-[#0B3561] bg-[#E7EBEF]/60 shadow-xs'
                        : 'border-[#CED7DF] bg-white hover:border-[#A0DBDF]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'cod'
                              ? 'border-[#0B3561] bg-[#0B3561]'
                              : 'border-[#CED7DF]'
                          }`}
                        >
                          {paymentMethod === 'cod' && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-black text-[#0B3561] flex items-center gap-2 font-heading">
                            <span>Cash on Delivery (COD)</span>
                            <span className="text-[11px] text-[#071E38] font-bold bg-[#FFD54A] px-2 py-0.2 rounded">
                              +₹{cartCodFee} handling
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6D86A0] mt-0.5">
                            Pay in cash or UPI QR when the courier partner brings the physical book parcel.
                          </p>
                        </div>
                      </div>
                      <Banknote className="w-5 h-5 text-[#0B3561]" />
                    </div>

                    {paymentMethod === 'cod' && (
                      <div className="mt-3 pt-3 border-t border-[#CED7DF] pl-8">
                        <div className="bg-[#DDF3F4] p-3 rounded-xl border border-[#A0DBDF] text-[11px] text-[#0B3561] flex items-start gap-2">
                          <Info className="w-4 h-4 text-[#12A5B0] shrink-0 mt-0.5" />
                          <span>
                            <strong>Address verification:</strong> Our team will confirm your pin code over phone/WhatsApp before dispatching this COD order.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Items & Pricing Breakdown */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#F7FAFC] rounded-2xl p-5 border border-[#CED7DF] space-y-4">
                <h4 className="text-xs font-black text-[#0B3561] uppercase tracking-wider font-heading">
                  Order Summary ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cart.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-[#CED7DF]/50"
                    >
                      <div className="pr-2 truncate">
                        <span className="font-bold text-[#071E38]">{product.title}</span>
                        <span className="text-[#6D86A0] ml-1">x {quantity}</span>
                      </div>
                      <div className="font-black text-[#0B3561] shrink-0 font-mono">
                        ₹{(product.salePrice * quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* APPLICABLE COUPONS SELECTION AREA */}
                <div className="pt-2.5 border-t border-[#CED7DF] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#6D86A0] uppercase tracking-wider font-heading flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-[#12A5B0] rounded-full"></span>
                      <span>Available Coupons</span>
                    </span>
                    {appliedCoupon && (
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-[10px] text-red-600 hover:text-red-700 font-extrabold uppercase font-heading hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {applicableCoupons.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {applicableCoupons.map((c) => {
                        const isSelected = appliedCoupon?.code.toUpperCase() === c.code.toUpperCase();
                        return (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => applyCoupon(c.code)}
                            className={`p-2 rounded-xl border text-left flex flex-col font-body transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#DDF3F4]/50 border-[#12A5B0] text-[#0B3561] ring-2 ring-[#12A5B0]/15'
                                : 'bg-white border-[#CED7DF] hover:border-[#12A5B0] text-[#071E38]'
                            }`}
                          >
                            <span className="font-mono font-black text-[10px] tracking-wide block">
                              {c.code}
                            </span>
                            <span className="text-[9px] text-[#6D86A0] mt-0.5">
                              {c.discountPercent}% Off (Min: ₹{c.minOrder})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[10px] text-[#6D86A0] bg-white border border-dashed border-[#CED7DF] p-2.5 rounded-xl text-center">
                      No coupon codes match this cart value. Try adding more items!
                    </div>
                  )}
                </div>

                {/* Pricing Table */}
                <div className="space-y-2 text-xs text-[#3C5D81] pt-2.5 border-t border-[#CED7DF]">
                  <div className="flex justify-between">
                    <span>Items Total</span>
                    <span className="font-bold text-[#0B3561] font-mono">
                      ₹{cartSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-[#12A5B0] font-bold">
                      <span>Promo Coupon ({appliedCoupon.code})</span>
                      <span className="font-mono">- ₹{cartCouponDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {paymentMethod === 'prepaid' ? (
                    <div className="flex justify-between text-[#12A5B0] font-bold bg-[#DDF3F4] p-2 rounded-lg">
                      <span>Prepaid Discount (10% OFF)</span>
                      <span className="font-mono">- ₹{cartPrepaidDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-[#071E38] font-bold bg-[#FFD54A]/30 p-2 rounded-lg">
                      <span>COD Courier Handling Fee</span>
                      <span className="font-mono">+ ₹{cartCodFee}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Express India Delivery</span>
                    <span className="text-[#12A5B0] font-bold">FREE</span>
                  </div>

                  <div className="flex justify-between text-base font-black text-[#0B3561] pt-2 border-t border-[#CED7DF] font-heading">
                    <span>Total Amount Payable</span>
                    <span className="text-xl text-[#0B3561] font-mono">
                      ₹{finalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Place Order CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#12A5B0] hover:bg-[#0e8a93] text-white font-black py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-sm disabled:opacity-50 font-heading uppercase tracking-wider"
                >
                  {isSubmitting ? (
                    <span>Connecting to Razorpay...</span>
                  ) : paymentMethod === 'prepaid' ? (
                    <>
                      <Lock className="w-4 h-4 text-white" />
                      <span>Pay ₹{finalPayable} via Razorpay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Confirm COD Order (₹{finalPayable})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-[10px] text-[#6D86A0] text-center space-y-1">
                  <div>Official Razorpay payment gateway integration with 256-bit encryption</div>
                  <div>GST compliant invoice (HSN 4901 for educational books) included</div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Interactive Razorpay Payment Gateway Modal */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-60 bg-[#071E38]/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 font-body">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#CED7DF] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 text-left">
            {/* Razorpay Brand Header */}
            <div className="bg-[#0B3561] text-white p-5 sm:p-6 rounded-t-3xl relative">
              <button
                type="button"
                onClick={() => setShowRazorpayModal(false)}
                className="absolute top-4 right-4 text-[#9DAEC0] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs text-[#12A5B0] font-bold uppercase tracking-wider mb-2 font-heading">
                <ShieldCheck className="w-4 h-4 text-[#12A5B0]" />
                <span>Razorpay Trusted Checkout</span>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-base font-bold text-white font-heading">
                    PyNotes Educational Media
                  </h3>
                  <p className="text-[11px] text-[#DDF3F4]">
                    Handwritten Printed Notes & Smart Bundles
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-[#9DAEC0] font-bold block">
                    Payable:
                  </span>
                  <span className="text-2xl font-black text-[#FFD54A] font-mono">
                    ₹{finalPayable}
                  </span>
                </div>
              </div>

              {pendingAddress && (
                <div className="mt-3 pt-3 border-t border-[#071E38]/50 flex items-center justify-between text-[11px] text-[#DDF3F4]/80">
                  <span className="truncate max-w-[180px]">{pendingAddress.fullName}</span>
                  <span className="font-mono">+91 {pendingAddress.phone}</span>
                </div>
              )}
            </div>

            {/* Payment Modes Selector */}
            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex rounded-xl bg-[#F7FAFC] p-1 border border-[#CED7DF] text-xs font-bold font-heading">
                <button
                  type="button"
                  onClick={() => setSelectedRzpTab('upi')}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                    selectedRzpTab === 'upi'
                      ? 'bg-[#0B3561] text-white shadow-xs'
                      : 'text-[#3C5D81] hover:text-[#0B3561]'
                  }`}
                >
                  UPI & QR
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRzpTab('card')}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                    selectedRzpTab === 'card'
                      ? 'bg-[#0B3561] text-white shadow-xs'
                      : 'text-[#3C5D81] hover:text-[#0B3561]'
                  }`}
                >
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRzpTab('netbanking')}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                    selectedRzpTab === 'netbanking'
                      ? 'bg-[#0B3561] text-white shadow-xs'
                      : 'text-[#3C5D81] hover:text-[#0B3561]'
                  }`}
                >
                  NetBanking
                </button>
              </div>

              {/* Tab 1: UPI */}
              {selectedRzpTab === 'upi' && (
                <div className="space-y-3">
                  <div className="bg-[#DDF3F4] border border-[#A0DBDF] rounded-2xl p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#0B3561]">
                      <span>UPI Virtual Payment Address:</span>
                      <span className="text-[10px] text-teal-700 bg-white px-2 py-0.5 rounded-md font-mono">
                        Instant Approval
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-[#A0DBDF] font-mono text-xs text-[#0B3561] font-bold flex items-center justify-between">
                      <span>{upiId || 'student@okaxis'}</span>
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    </div>
                    <p className="text-[11px] text-[#3C5D81]">
                      Supported apps: Google Pay, PhonePe, Paytm, BHIM, CRED UPI.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Cards */}
              {selectedRzpTab === 'card' && (
                <div className="space-y-3">
                  <div className="bg-[#F7FAFC] border border-[#CED7DF] rounded-2xl p-3.5 space-y-2 text-xs">
                    <div className="text-[11px] font-bold text-[#0B3561] uppercase tracking-wider font-heading">
                      Supported Cards: Visa, MasterCard, RuPay
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-[#CED7DF] font-mono text-xs text-[#071E38] space-y-1">
                      <div className="text-[10px] text-[#6D86A0]">Sample Card for Authorization:</div>
                      <div className="font-bold text-sm tracking-widest text-[#0B3561]">
                        4000 •••• •••• 9010
                      </div>
                      <div className="flex justify-between text-[11px] text-[#6D86A0] pt-1">
                        <span>Exp: 12/28</span>
                        <span>CVV: •••</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: NetBanking */}
              {selectedRzpTab === 'netbanking' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold text-[#0B3561]">
                    <div className="p-2.5 bg-[#F7FAFC] border border-[#CED7DF] rounded-xl text-center">
                      HDFC Bank
                    </div>
                    <div className="p-2.5 bg-[#F7FAFC] border border-[#CED7DF] rounded-xl text-center">
                      State Bank of India
                    </div>
                    <div className="p-2.5 bg-[#F7FAFC] border border-[#CED7DF] rounded-xl text-center">
                      ICICI Bank
                    </div>
                    <div className="p-2.5 bg-[#F7FAFC] border border-[#CED7DF] rounded-xl text-center">
                      Axis Bank
                    </div>
                  </div>
                </div>
              )}

              {/* Razorpay Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleAuthorizeRazorpay}
                  disabled={isRzpProcessing}
                  className="w-full bg-[#0B3561] hover:bg-[#071E38] text-white font-black py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-sm font-heading uppercase tracking-wider disabled:opacity-50"
                >
                  {isRzpProcessing ? (
                    <span>Verifying with Razorpay...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#12A5B0]" />
                      <span>Authorize Payment • ₹{finalPayable}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowRazorpayModal(false)}
                  className="w-full py-2 text-xs text-[#6D86A0] hover:text-[#0B3561] font-bold text-center cursor-pointer"
                >
                  Cancel and Return
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#6D86A0] pt-1 border-t border-[#E7EBEF]">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Secured by Razorpay Payments India • RBI Compliant</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
