import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from './BrandLogo';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  validateEmail,
  validatePhone,
  validateFullName,
  validatePassword
} from '../utils/validation';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    openAuthModal,
    loginUser,
    signupUser,
    showToast
  } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Field touched states for inline validation display
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  if (!isAuthModalOpen) return null;

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Live Validations
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);
  const nameValidation = validateFullName(name);
  const phoneValidation = validatePhone(phone);
  const confirmPasswordValid = password.length > 0 && confirmPassword === password;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setTouched({ email: true, password: true });

    if (!emailValidation.isValid) {
      setErrorMessage(emailValidation.message || 'Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginUser(email, password, rememberMe);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setTouched({ name: true, email: true, password: true, confirmPassword: true, phone: true });

    if (!nameValidation.isValid) {
      setErrorMessage(nameValidation.message || 'Please enter your full name.');
      return;
    }
    if (!emailValidation.isValid) {
      setErrorMessage(emailValidation.message || 'Please enter a valid email address.');
      return;
    }
    if (phone && !phoneValidation.isValid) {
      setErrorMessage(phoneValidation.message || 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!passwordValidation.isValid) {
      setErrorMessage(passwordValidation.message || 'Please choose a stronger password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter matching password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signupUser(name, email, password, phone, rememberMe);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-[#071E38]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 font-body">
      <div className="bg-[#F7FAFC] rounded-3xl max-w-md w-full border border-[#CED7DF] shadow-2xl overflow-hidden relative">
        {/* Subtle Ruled paper background effect */}
        <div className="absolute inset-0 bg-ruled-paper opacity-40 pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-10 p-2 text-[#6D86A0] hover:text-[#0B3561] hover:bg-[#E7EBEF] rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-8 pb-4 text-center relative z-10 border-b border-[#E7EBEF] bg-white">
          <div className="flex justify-center mb-3">
            <BrandLogo height={38} showTagline={true} />
          </div>
          <h2 className="text-xl font-extrabold text-[#0B3561] font-heading tracking-tight">
            {authModalTab === 'login' ? 'Student Sign In & Session' : 'Create Student Account'}
          </h2>
          <p className="text-xs text-[#6D86A0] mt-1">
            {authModalTab === 'login'
              ? 'Access your orders, track courier shipments, and view GST invoices.'
              : 'Save delivery addresses and receive automated WhatsApp tracking alerts.'}
          </p>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-[#F7FAFC] rounded-2xl border border-[#CED7DF] mt-5 text-xs font-bold font-heading">
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setTouched({});
                openAuthModal('login');
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                authModalTab === 'login'
                  ? 'bg-[#0B3561] text-white shadow-xs'
                  : 'text-[#6D86A0] hover:text-[#0B3561]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setTouched({});
                openAuthModal('signup');
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                authModalTab === 'signup'
                  ? 'bg-[#0B3561] text-white shadow-xs'
                  : 'text-[#6D86A0] hover:text-[#0B3561]'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mx-6 sm:mx-8 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 pt-5 relative z-10 space-y-4">
          {authModalTab === 'login' ? (
            /* ================= LOGIN FORM ================= */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B3561] font-heading uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9DAEC0] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => markTouched('email')}
                    className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-xs text-[#071E38] focus:outline-hidden font-medium transition-all ${
                      touched.email && !emailValidation.isValid
                        ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                        : touched.email && emailValidation.isValid
                        ? 'border-teal-500 focus:border-teal-600 ring-1 ring-teal-100'
                        : 'border-[#CED7DF] focus:border-[#12A5B0]'
                    }`}
                  />
                  {touched.email && emailValidation.isValid && (
                    <CheckCircle2 className="w-4 h-4 text-teal-600 absolute right-3 top-3" />
                  )}
                </div>
                {touched.email && !emailValidation.isValid && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <span>{emailValidation.message}</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#0B3561] font-heading uppercase tracking-wider">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => showToast('Password reset link sent to registered email!')}
                    className="text-[11px] text-[#12A5B0] hover:underline font-bold cursor-pointer"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9DAEC0] absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => markTouched('password')}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#CED7DF] rounded-xl text-xs text-[#071E38] focus:outline-hidden focus:border-[#12A5B0] focus:ring-2 focus:ring-[#12A5B0]/20 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#9DAEC0] hover:text-[#0B3561] p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Session Duration Preference */}
              <div className="flex items-center justify-between text-xs text-[#6D86A0]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-[#12A5B0] rounded cursor-pointer"
                  />
                  <span className="text-[11px]">Remember me (Keep session active 7 days)</span>
                </label>
                <span className="text-[10px] text-[#12A5B0] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>256-Bit SSL</span>
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#12A5B0] hover:bg-[#0e8a93] text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-heading uppercase tracking-wide"
              >
                <span>{isSubmitting ? 'Starting Session...' : 'Sign In to Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* ================= SIGN UP FORM ================= */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#0B3561] font-heading uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#9DAEC0] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Aditi Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => markTouched('name')}
                    className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-xs text-[#071E38] focus:outline-hidden font-medium ${
                      touched.name && !nameValidation.isValid
                        ? 'border-red-400 focus:border-red-500'
                        : touched.name && nameValidation.isValid
                        ? 'border-teal-500'
                        : 'border-[#CED7DF] focus:border-[#12A5B0]'
                    }`}
                  />
                  {touched.name && nameValidation.isValid && (
                    <CheckCircle2 className="w-4 h-4 text-teal-600 absolute right-3 top-3" />
                  )}
                </div>
                {touched.name && !nameValidation.isValid && (
                  <p className="text-[11px] text-red-600 mt-1">{nameValidation.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B3561] font-heading uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9DAEC0] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => markTouched('email')}
                    className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-xs text-[#071E38] focus:outline-hidden font-medium ${
                      touched.email && !emailValidation.isValid
                        ? 'border-red-400 focus:border-red-500'
                        : touched.email && emailValidation.isValid
                        ? 'border-teal-500'
                        : 'border-[#CED7DF] focus:border-[#12A5B0]'
                    }`}
                  />
                  {touched.email && emailValidation.isValid && (
                    <CheckCircle2 className="w-4 h-4 text-teal-600 absolute right-3 top-3" />
                  )}
                </div>
                {touched.email && !emailValidation.isValid && (
                  <p className="text-[11px] text-red-600 mt-1">{emailValidation.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#0B3561] font-heading uppercase tracking-wider">
                    Mobile Number (SMS & Tracking) *
                  </label>
                  <span className="text-[10px] text-[#6D86A0]">
                    {phone.replace(/\D/g, '').length} / 10
                  </span>
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#9DAEC0] absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    onBlur={() => markTouched('phone')}
                    className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-xs text-[#071E38] focus:outline-hidden font-mono ${
                      touched.phone && !phoneValidation.isValid
                        ? 'border-red-400 focus:border-red-500'
                        : touched.phone && phoneValidation.isValid
                        ? 'border-teal-500'
                        : 'border-[#CED7DF] focus:border-[#12A5B0]'
                    }`}
                  />
                  {touched.phone && phoneValidation.isValid && (
                    <CheckCircle2 className="w-4 h-4 text-teal-600 absolute right-3 top-3" />
                  )}
                </div>
                {touched.phone && !phoneValidation.isValid && (
                  <p className="text-[11px] text-red-600 mt-1">{phoneValidation.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B3561] font-heading uppercase tracking-wider mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9DAEC0] absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => markTouched('password')}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#CED7DF] rounded-xl text-xs text-[#071E38] focus:outline-hidden focus:border-[#12A5B0] font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#9DAEC0] hover:text-[#0B3561] p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex gap-1.5 h-1">
                      <div
                        className={`flex-1 rounded-full transition-colors ${
                          passwordValidation.score >= 1 ? 'bg-amber-400' : 'bg-stone-200'
                        }`}
                      ></div>
                      <div
                        className={`flex-1 rounded-full transition-colors ${
                          passwordValidation.score >= 2 ? 'bg-teal-500' : 'bg-stone-200'
                        }`}
                      ></div>
                      <div
                        className={`flex-1 rounded-full transition-colors ${
                          passwordValidation.score >= 3 ? 'bg-teal-600' : 'bg-stone-200'
                        }`}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#6D86A0]">Strength:</span>
                      <span
                        className={`font-bold uppercase ${
                          passwordValidation.strength === 'strong'
                            ? 'text-teal-600'
                            : passwordValidation.strength === 'medium'
                            ? 'text-amber-600'
                            : 'text-red-500'
                        }`}
                      >
                        {passwordValidation.strength}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B3561] font-heading uppercase tracking-wider mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9DAEC0] absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password to confirm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => markTouched('confirmPassword')}
                    className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-xs text-[#071E38] focus:outline-hidden font-medium ${
                      touched.confirmPassword && !confirmPasswordValid
                        ? 'border-red-400 focus:border-red-500'
                        : touched.confirmPassword && confirmPasswordValid
                        ? 'border-teal-500'
                        : 'border-[#CED7DF] focus:border-[#12A5B0]'
                    }`}
                  />
                  {touched.confirmPassword && confirmPasswordValid && (
                    <CheckCircle2 className="w-4 h-4 text-teal-600 absolute right-3 top-3" />
                  )}
                </div>
                {touched.confirmPassword && !confirmPasswordValid && (
                  <p className="text-[11px] text-red-600 mt-1">Passwords do not match.</p>
                )}
              </div>

              {/* Session Preference */}
              <div className="text-xs text-[#6D86A0]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-[#12A5B0] rounded cursor-pointer"
                  />
                  <span className="text-[11px]">Remember me on this browser (7-day student session)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#12A5B0] hover:bg-[#0e8a93] text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-heading uppercase tracking-wide mt-2"
              >
                <span>{isSubmitting ? 'Creating Account & Session...' : 'Register & Start Session'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-[#E7EBEF] text-center text-xs text-[#6D86A0]">
          {authModalTab === 'login' ? (
            <p>
              New to PyNotes?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  openAuthModal('signup');
                }}
                className="text-[#12A5B0] font-bold hover:underline cursor-pointer"
              >
                Create student account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  openAuthModal('login');
                }}
                className="text-[#12A5B0] font-bold hover:underline cursor-pointer"
              >
                Sign in to your account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
