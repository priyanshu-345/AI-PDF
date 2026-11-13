import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [method, setMethod] = useState<'email' | 'mobile'>('email');
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(45);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // Step 1: Send OTP to identifier
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!identifier.trim()) {
      setErrorMsg(`Please enter your registered ${method === 'email' ? 'email address' : 'mobile number'}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendOtp(identifier.trim(), method);
      if (res.success) {
        setStep(2);
        setResendCooldown(45);
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('Failed to send verification code. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setErrorMsg('Please enter the 6-digit code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    const res = await verifyOtp(identifier.trim(), otpCode.trim(), method);
    setIsSubmitting(false);

    if (res.success) {
      setStep(3);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Step 3: Set New Password
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    navigate('/login', {
      state: { successNotice: 'Password has been reset successfully! Please sign in with your new credentials.' },
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F9] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-maroon-100 selection:text-maroon-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center space-x-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-maroon-800 to-maroon-600 flex items-center justify-center shadow-maroon group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Account Recovery
          </h2>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            Recover access using your registered Mobile Number or Email Address
          </p>
        </div>

        <div className="mt-6 bg-white border border-[#EAE5E5] rounded-3xl p-6 sm:p-8 shadow-card">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 font-medium">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800 font-medium">{successMsg}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendResetCode} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 bg-[#FAF9F9] p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setMethod('email');
                    setIdentifier('');
                  }}
                  className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-extrabold transition-all ${method === 'email'
                    ? 'bg-white text-maroon-800 shadow-xs border border-[#EAE5E5]'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Recovery</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMethod('mobile');
                    setIdentifier('');
                  }}
                  className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-extrabold transition-all ${method === 'mobile'
                    ? 'bg-white text-maroon-800 shadow-xs border border-[#EAE5E5]'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Mobile SMS</span>
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {method === 'email' ? 'Registered Email Address' : 'Registered Mobile Number'}
                </label>
                <div className="relative">
                  {method === 'email' ? (
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  ) : (
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  )}
                  <input
                    type={method === 'email' ? 'email' : 'tel'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={method === 'email' ? 'alex.mercer@enterprise.ai' : '+91 98765 43210'}
                    required
                    className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-maroon-600 focus:ring-1 focus:ring-maroon-600 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-maroon-700 hover:bg-maroon-800 text-white font-extrabold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
              >
                <span>{isSubmitting ? 'Sending Code...' : 'Send Recovery OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-500 font-medium">
                  Enter the 6-digit verification code sent to
                </p>
                <p className="text-xs font-extrabold text-slate-900">{identifier}</p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 bg-[#FAF9F9] border-2 border-slate-200 focus:border-maroon-600 rounded-xl text-slate-900 focus:outline-none transition-all font-bold"
                  autoFocus
                />
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-[11px] text-slate-400">Valid for 5 minutes</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (resendCooldown === 0) {
                        sendOtp(identifier.trim(), method);
                        setResendCooldown(45);
                      }
                    }}
                    disabled={resendCooldown > 0}
                    className="text-xs font-bold text-maroon-700 hover:text-maroon-900 disabled:opacity-40"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || otpCode.length < 6}
                  className="w-full bg-maroon-700 hover:bg-maroon-800 text-white font-extrabold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Recovery Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Identifier</span>
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="text-center space-y-1 pb-1">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Identity Verified</h3>
                <p className="text-xs text-slate-500 font-medium">Create a strong new password for your account.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-maroon-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    required
                    className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-maroon-600 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-maroon-700 hover:bg-maroon-800 text-white font-extrabold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
              >
                <span>Save New Password & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-4 mt-6 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-maroon-700 hover:text-maroon-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
