import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { BrandLogo } from '../BrandLogo';
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  KeyRound,
  ShieldAlert,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { validateEmail } from '../../utils/validation';

export const AdminLoginPage: React.FC = () => {
  const { adminLogin, navigateTo, showToast } = useStore();

  const [email, setEmail] = useState('shimadutta62@gmail.com');
  const [password, setPassword] = useState('admin2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const emailVal = validateEmail(email);
  const passwordValid = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTouched({ email: true, password: true });

    if (!emailVal.isValid) {
      setError(emailVal.message || 'Please enter a valid admin email.');
      return;
    }
    if (!passwordValid) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminLogin(email, password);
      if (!res.success) {
        setError(res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoAdmin = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await adminLogin('shimadutta62@gmail.com', 'admin2026');
      if (!res.success) {
        setError(res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071E38] text-[#F7FAFC] flex flex-col justify-center items-center p-4 relative font-body selection:bg-[#12A5B0] selection:text-white">
      {/* Background ruled paper pattern at 4% */}
      <div className="absolute inset-0 bg-ruled-paper opacity-5 pointer-events-none"></div>

      {/* Top return link */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => navigateTo('store')}
          className="flex items-center gap-2 text-xs font-bold text-[#DDF3F4] hover:text-[#12A5B0] bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl backdrop-blur-xs transition-all cursor-pointer font-heading"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white text-[#071E38] rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#CED7DF] relative z-10 space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <BrandLogo height={42} showTagline={true} />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[#DDF3F4] text-[#0B3561] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider font-heading">
            <ShieldCheck className="w-3.5 h-3.5 text-[#12A5B0]" />
            <span>Shop Manager Console • Admin Access</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#0B3561] font-heading tracking-tight pt-1">
            Sign In to Management
          </h2>
          <p className="text-xs text-[#6D86A0]">
            Manage physical stock matrix, COD verification calls, live orders & Shiprocket AWB.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-body">
          <div>
            <label className="block text-xs font-bold text-[#0B3561] font-heading uppercase tracking-wider mb-1.5">
              Admin Username / Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9DAEC0] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                placeholder="shimadutta62@gmail.com"
                className={`w-full pl-10 pr-10 py-2.5 bg-[#F7FAFC] border rounded-xl text-xs text-[#071E38] focus:bg-white focus:outline-hidden font-medium ${
                  touched.email && !emailVal.isValid
                    ? 'border-red-400 focus:border-red-500'
                    : touched.email && emailVal.isValid
                    ? 'border-teal-500'
                    : 'border-[#CED7DF] focus:border-[#12A5B0]'
                }`}
              />
              {touched.email && emailVal.isValid && (
                <CheckCircle2 className="w-4 h-4 text-teal-600 absolute right-3 top-3" />
              )}
            </div>
            <p className="text-[10px] text-[#9DAEC0] mt-1">
              Super Admin: <span className="font-mono text-[#0B3561]">shimadutta62@gmail.com</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B3561] font-heading uppercase tracking-wider mb-1.5">
              Admin Password / Key *
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#9DAEC0] absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-[#F7FAFC] border rounded-xl text-xs text-[#071E38] focus:bg-white focus:outline-hidden font-medium ${
                  touched.password && !passwordValid
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#CED7DF] focus:border-[#12A5B0]'
                }`}
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
            <div className="flex items-center justify-between text-[10px] text-[#6D86A0] mt-1.5">
              <span>8-Hour Secure Token Session</span>
              <span className="text-teal-700 font-bold">256-Bit SSL Protected</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#0B3561] hover:bg-[#071E38] text-white font-black text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-heading uppercase tracking-wider"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Shop Manager'}</span>
              <ArrowRight className="w-4 h-4 text-[#12A5B0]" />
            </button>
          </div>

          {/* Quick Demo Admin Login */}
          <div className="pt-3 border-t border-[#E7EBEF]">
            <button
              type="button"
              onClick={handleQuickDemoAdmin}
              className="w-full py-2.5 bg-[#DDF3F4] hover:bg-[#c2ebed] text-[#0B3561] font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer font-heading"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#12A5B0]" />
              <span>One-Click Demo Admin Login</span>
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => navigateTo('store')}
            className="text-xs text-[#6D86A0] hover:text-[#0B3561] font-bold hover:underline cursor-pointer"
          >
            ← Back to Customer Storefront
          </button>
        </div>
      </div>
    </div>
  );
};
