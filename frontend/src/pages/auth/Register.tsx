import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { registerUser, sendOtp, verifyOtp } = useAuthStore();

  // Multi-step registration flow: 1 = Details, 2 = Dual OTP Verification
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP Verification state
  const [verifyMethod, setVerifyMethod] = useState<'mobile' | 'email'>('mobile');
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [resendCooldown, setResendCooldown] = useState(45);
  const [isResending, setIsResending] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // Handle Step 1 -> Step 2
  const handleProceedToVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
      setErrorMsg('Please enter a valid mobile number with at least 8 digits.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setStep(2);
    setResendCooldown(45);
    const target = verifyMethod === 'mobile' ? phone : email;
    const res = await sendOtp(target, verifyMethod);
    if (res.success) {
      setSuccessNotice(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Change method in Step 2 and send new OTP
  const handleSwitchVerifyMethod = async (method: 'mobile' | 'email') => {
    setVerifyMethod(method);
    setOtpCode('');
    setErrorMsg('');
    setResendCooldown(45);
    const target = method === 'mobile' ? phone : email;
    const res = await sendOtp(target, method);
    if (res.success) {
      setSuccessNotice(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Resend OTP in Step 2
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg('');
    const target = verifyMethod === 'mobile' ? phone : email;
    const res = await sendOtp(target, verifyMethod);
    setResendCooldown(45);
    setIsResending(false);
    if (res.success) {
      setSuccessNotice(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Final verification & complete registration
  const handleFinalVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const target = verifyMethod === 'mobile' ? phone : email;
      const res = await verifyOtp(target, otpCode, verifyMethod);

      if (res.success) {
        // Register user and promote to authenticated active state
        await registerUser({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          pass: password,
        });

        // Set verification status according to method used
        const { updateProfile } = useAuthStore.getState();
        updateProfile({
          isPhoneVerified: verifyMethod === 'mobile',
          isEmailVerified: verifyMethod === 'email',
        });

        navigate('/profile');
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('Failed to verify OTP code. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F9] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-maroon-100 selection:text-maroon-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center space-x-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-maroon-800 to-maroon-600 flex items-center justify-center shadow-maroon group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Studio Account
          </h2>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            Join the offline-first enterprise PDF & AI document workspace
          </p>
        </div>

        {/* Step Progress Pill */}
        <div className="mt-6 flex items-center justify-center space-x-3 text-xs font-bold">
          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border transition-all ${step === 1
              ? 'bg-maroon-50 border-maroon-300 text-maroon-800'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
              }`}
          >
            {step === 2 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <span className="w-4 h-4 rounded-full bg-maroon-700 text-white text-[10px] flex items-center justify-center font-extrabold">
                1
              </span>
            )}
            <span>1. Account Info</span>
          </div>

          <div className="w-4 h-px bg-slate-200" />

          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border transition-all ${step === 2
              ? 'bg-maroon-50 border-maroon-300 text-maroon-800 shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
          >
            <span
              className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-extrabold ${step === 2 ? 'bg-maroon-700 text-white' : 'bg-slate-300 text-slate-600'
                }`}
            >
              2
            </span>
            <span>2. Mobile/Mail OTP</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="mt-5 bg-white border border-[#EAE5E5] rounded-3xl p-6 sm:p-8 shadow-card">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 font-medium">{errorMsg}</p>
            </div>
          )}

          {successNotice && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800 font-medium">{successNotice}</p>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Registration Form */
            <form onSubmit={handleProceedToVerify} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    required
                    className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-maroon-600 focus:ring-1 focus:ring-maroon-600 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Work / Personal Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex.mercer@enterprise.ai"
                    required
                    className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-maroon-600 focus:ring-1 focus:ring-maroon-600 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    required
                    className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-maroon-600 focus:ring-1 focus:ring-maroon-600 transition-all font-medium"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Used for genuine SMS OTP verification and high-security account login.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 chars"
                      required
                      className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-maroon-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      required
                      className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-maroon-600 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-maroon-700 hover:bg-maroon-800 text-white font-extrabold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
                >
                  <span>Continue to Real OTP Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: Dual Verification Step */
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-maroon-50 border border-maroon-200 flex items-center justify-center mx-auto text-maroon-800">
                  <ShieldCheck className="w-5 h-5 text-maroon-700" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Verify Your Identity
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Select your preferred channel to receive your 6-digit confirmation code.
                </p>
              </div>

              {/* Channel Selector */}
              <div className="grid grid-cols-2 gap-2 bg-[#FAF9F9] p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleSwitchVerifyMethod('mobile')}
                  className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-extrabold transition-all ${verifyMethod === 'mobile'
                    ? 'bg-white text-maroon-800 shadow-xs border border-[#EAE5E5]'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>SMS OTP</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchVerifyMethod('email')}
                  className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-extrabold transition-all ${verifyMethod === 'email'
                    ? 'bg-white text-maroon-800 shadow-xs border border-[#EAE5E5]'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email OTP</span>
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    Sending 6-digit PIN to:
                  </p>
                  <p className="text-xs font-extrabold text-slate-800">
                    {verifyMethod === 'mobile' ? phone : email}
                  </p>
                </div>
                <button
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isResending}
                  className="flex items-center space-x-1 text-xs font-bold text-maroon-700 hover:text-maroon-900 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>{resendCooldown > 0 ? `${resendCooldown}s` : 'Resend'}</span>
                </button>
              </div>

              <div className="p-3.5 bg-maroon-50 border border-maroon-200 rounded-2xl flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-maroon-100 flex items-center justify-center flex-shrink-0 text-maroon-700 shadow-2xs mt-0.5">
                  {verifyMethod === 'mobile' ? (
                    <Smartphone className="w-4 h-4" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold text-slate-800">
                      {verifyMethod === 'mobile' ? 'Mobile SMS Dispatched' : 'Email Verification Dispatched'}
                    </p>
                    <span className="text-[10px] bg-maroon-100 text-maroon-800 px-2 py-0.5 rounded-full font-bold">
                      Valid 5 min
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    A secure 6-digit verification code has been dispatched to{' '}
                    <strong>{verifyMethod === 'mobile' ? phone : email}</strong>. Please enter the digits below to complete your registration.
                  </p>
                </div>
              </div>

              <form onSubmit={handleFinalVerify} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 text-center">
                    Enter 6-Digit Code
                  </label>
                  <div className="relative max-w-xs mx-auto">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 bg-[#FAF9F9] border-2 border-slate-200 focus:border-maroon-600 rounded-xl text-slate-900 focus:outline-none transition-all font-bold"
                      autoFocus
                    />
                  </div>
                  <p className="text-[10px] text-center text-slate-400 mt-1.5">
                    Enter the code dispatched to your {verifyMethod === 'mobile' ? 'mobile' : 'email'}
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || otpCode.length < 6}
                    className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isSubmitting ? 'Verifying Account...' : 'Confirm & Activate Profile'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center space-x-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Account Information</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Footer Back to Login */}
          <div className="pt-4 mt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Already have an active account?{' '}
              <Link to="/login" className="text-maroon-700 font-extrabold hover:text-maroon-900">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="mt-4 flex items-center justify-center space-x-2 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-maroon-700" />
          <span>Local Client-Side Encryption & Secure Session Storage</span>
        </div>
      </div>
    </div>
  );
};
