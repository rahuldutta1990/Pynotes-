import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  UploadCloud,
  AlertCircle,
  Phone,
  Mail,
  User,
  Package,
  Sparkles
} from 'lucide-react';
import {
  validateIssueClaim,
  validatePhone,
  validateEmail,
  validateFullName
} from '../utils/validation';

export const ReportIssueModal: React.FC = () => {
  const {
    isReportIssueModalOpen,
    setIsReportIssueModalOpen,
    handleSubmitIssue,
    currentUser,
    activeOrderForTracking,
    showToast
  } = useStore();

  const [orderId, setOrderId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [issueType, setIssueType] = useState('Damaged during courier transit');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Field touched tracking for live inline validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Auto-fill from active user session or active tracked order
  useEffect(() => {
    if (!isReportIssueModalOpen) return;
    if (activeOrderForTracking) {
      setOrderId(activeOrderForTracking.orderNumber);
      setName(activeOrderForTracking.customerName);
      setPhone(activeOrderForTracking.customerPhone);
      setEmail(activeOrderForTracking.customerEmail);
    } else if (currentUser) {
      setName(currentUser.name);
      if (currentUser.phone) setPhone(currentUser.phone);
      setEmail(currentUser.email);
    }
  }, [isReportIssueModalOpen, activeOrderForTracking, currentUser]);

  if (!isReportIssueModalOpen) return null;

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validations
  const nameVal = validateFullName(name);
  const phoneVal = validatePhone(phone);
  const emailVal = email ? validateEmail(email) : { isValid: true };
  const orderIdValid = orderId.trim().length >= 3;
  const descValid = description.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setTouched({
      orderId: true,
      name: true,
      phone: true,
      email: true,
      description: true
    });

    const claimValidation = validateIssueClaim(orderId, description, phone);
    if (!claimValidation.isValid) {
      const firstErr = Object.values(claimValidation.errors)[0];
      setFormError(firstErr);
      return;
    }

    if (!nameVal.isValid) {
      setFormError(nameVal.message || 'Please enter valid full name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await handleSubmitIssue({
        id: `iss-${Date.now()}`,
        orderId: orderId.trim().toUpperCase(),
        customerName: name.trim(),
        customerPhone: phone.trim().replace(/\D/g, ''),
        customerEmail: email.trim(),
        description: `[Category: ${issueType}] ${description.trim()}`,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      showToast('Claim registered! Support will message your WhatsApp within 2 hours.');
      setIsReportIssueModalOpen(false);
      // Reset
      setOrderId('');
      setName('');
      setPhone('');
      setEmail('');
      setDescription('');
      setTouched({});
    } catch (err) {
      console.error(err);
      setFormError('Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#071E38]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 font-body">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl border border-[#CED7DF]/50 ring-1 ring-black/5 relative flex flex-col p-6 sm:p-8">
        <button
          onClick={() => setIsReportIssueModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-[#6D86A0] hover:text-[#0B3561] hover:bg-[#E7EBEF] rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-[#E7EBEF]">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#0B3561] font-heading tracking-tight">
              48-Hour Delivery Issue Claim
            </h2>
            <p className="text-xs text-[#6D86A0]">
              Doorstep replacement guarantee for damaged covers or binding defects
            </p>
          </div>
        </div>

        {formError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs font-body">
          <div className="bg-[#DDF3F4] border border-[#A0DBDF] p-3 rounded-2xl text-[#0B3561] text-[11px] leading-relaxed">
            <strong>Policy Guarantee:</strong> Damaged books reported within 48 hours of parcel delivery receive an immediate 100% free doorstep replacement with zero return shipping fees.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0B3561] mb-1 font-heading uppercase tracking-wider text-[11px]">
                Order ID *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. ORD-1001"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onBlur={() => markTouched('orderId')}
                  className={`w-full bg-[#F7FAFC] border rounded-xl px-3 py-2 font-mono text-xs focus:bg-white focus:outline-hidden uppercase ${
                    touched.orderId && !orderIdValid
                      ? 'border-red-400 focus:border-red-500'
                      : touched.orderId && orderIdValid
                      ? 'border-teal-500'
                      : 'border-[#CED7DF] focus:border-[#12A5B0]'
                  }`}
                  required
                />
                {touched.orderId && orderIdValid && (
                  <CheckCircle2 className="w-4 h-4 text-teal-600 absolute right-2.5 top-2.5" />
                )}
              </div>
              {touched.orderId && !orderIdValid && (
                <p className="text-[10px] text-red-600 mt-0.5">Order ID is required.</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-[#0B3561] font-heading uppercase tracking-wider text-[11px]">
                  Contact Phone *
                </label>
                <span className="text-[10px] text-[#6D86A0]">
                  {phone.replace(/\D/g, '').length}/10
                </span>
              </div>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  onBlur={() => markTouched('phone')}
                  className={`w-full bg-[#F7FAFC] border rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden font-mono ${
                    touched.phone && !phoneVal.isValid
                      ? 'border-red-400 focus:border-red-500'
                      : touched.phone && phoneVal.isValid
                      ? 'border-teal-500'
                      : 'border-[#CED7DF] focus:border-[#12A5B0]'
                  }`}
                  required
                />
                {touched.phone && phoneVal.isValid && (
                  <CheckCircle2 className="w-4 h-4 text-teal-600 absolute right-2.5 top-2.5" />
                )}
              </div>
              {touched.phone && !phoneVal.isValid && (
                <p className="text-[10px] text-red-600 mt-0.5">{phoneVal.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0B3561] mb-1 font-heading uppercase tracking-wider text-[11px]">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => markTouched('name')}
                  className={`w-full bg-[#F7FAFC] border rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden ${
                    touched.name && !nameVal.isValid
                      ? 'border-red-400 focus:border-red-500'
                      : touched.name && nameVal.isValid
                      ? 'border-teal-500'
                      : 'border-[#CED7DF] focus:border-[#12A5B0]'
                  }`}
                  required
                />
                {touched.name && nameVal.isValid && (
                  <CheckCircle2 className="w-4 h-4 text-teal-600 absolute right-2.5 top-2.5" />
                )}
              </div>
              {touched.name && !nameVal.isValid && (
                <p className="text-[10px] text-red-600 mt-0.5">{nameVal.message}</p>
              )}
            </div>

            <div>
              <label className="block font-bold text-[#0B3561] mb-1 font-heading uppercase tracking-wider text-[11px]">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => markTouched('email')}
                  className={`w-full bg-[#F7FAFC] border rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden ${
                    touched.email && !emailVal.isValid
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-[#CED7DF] focus:border-[#12A5B0]'
                  }`}
                />
              </div>
              {touched.email && !emailVal.isValid && (
                <p className="text-[10px] text-red-600 mt-0.5">{emailVal.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#0B3561] mb-1 font-heading uppercase tracking-wider text-[11px]">
              Issue Category *
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-[#12A5B0] cursor-pointer"
            >
              <option value="Damaged during courier transit">Damaged during courier transit (bent cover / torn packaging)</option>
              <option value="Printing or binding defect">Printing or binding defect (missing pages / misprint)</option>
              <option value="Wrong subject received">Wrong subject received (received different book than ordered)</option>
              <option value="Parcel opened / contents missing">Parcel opened / contents missing</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-[#0B3561] font-heading uppercase tracking-wider text-[11px]">
                Describe the problem *
              </label>
              <span className={`text-[10px] ${description.length >= 10 ? 'text-teal-600 font-bold' : 'text-[#6D86A0]'}`}>
                {description.length}/10 min chars
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Please provide details about the damage or print defect upon delivery..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => markTouched('description')}
              className={`w-full bg-[#F7FAFC] border rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden ${
                touched.description && !descValid
                  ? 'border-red-400 focus:border-red-500'
                  : touched.description && descValid
                  ? 'border-teal-500'
                  : 'border-[#CED7DF] focus:border-[#12A5B0]'
              }`}
              required
            />
            {touched.description && !descValid && (
              <p className="text-[10px] text-red-600 mt-0.5">
                Please enter at least 10 characters describing the defect.
              </p>
            )}
          </div>

          {/* Photo attachment simulation */}
          <div className="border border-dashed border-[#CED7DF] rounded-2xl p-3 text-center bg-[#F7FAFC]">
            <UploadCloud className="w-5 h-5 text-[#12A5B0] mx-auto mb-1" />
            <div className="text-[11px] font-bold text-[#0B3561] font-heading">
              Photos verified via WhatsApp after claim registration
            </div>
            <div className="text-[10px] text-[#6D86A0]">
              Our replacement coordinator will WhatsApp you directly to inspect photos and dispatch your replacement parcel.
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0B3561] hover:bg-[#071E38] text-white font-black py-3 rounded-xl transition-all cursor-pointer text-xs font-heading uppercase tracking-wider shadow-md"
          >
            {isSubmitting ? 'Registering Claim...' : 'Submit Claim for Free Replacement'}
          </button>
        </form>
      </div>
    </div>
  );
};
