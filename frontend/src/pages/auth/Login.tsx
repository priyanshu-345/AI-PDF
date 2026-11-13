import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Mail,
  Lock,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  RotateCw,
  KeyRound,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithPassword, sendOtp, verifyOtp, quickDemoLogin } = useAuthStore();

  const [authMode, setAuthMode] = useState<'password' | 'mobile_otp' | 'email_otp'>('password');

  // Password fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // OTP fields
  const [phone, setPhone] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  // Gateway Settings Modal
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [fast2smsKey, setFast2smsKey] = useState('');
  const [gatewaySavedMsg, setGatewaySavedMsg] = useState<string | null>(null);
  const { configureGateway } = useAuthStore();

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Native Web OTP API for Mobile SMS receipt on real smartphones
  useEffect(() => {
    if (authMode === 'mobile_otp' && otpSent && typeof window !== 'undefined' && 'credentials' in navigator) {
      const ac = new AbortController();
      try {
        (navigator as any).credentials
          ?.get({
            otp: { transport: ['sms'] },
            signal: ac.signal,
          })
          .then((cred: any) => {
            if (cred && cred.code) {
              setOtpCode(cred.code);
            }
          })
          .catch(() => { });
      } catch { }
      return () => ac.abort();
    }
  }, [authMode, otpSent]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setIsLoading(true);
    setError(null);
    try {
      await loginWithPassword(identifier, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (type: 'mobile' | 'email') => {
    const target = type === 'mobile' ? phone : otpEmail;
    if (!target.trim()) {
      setError(`Please enter a valid ${type === 'mobile' ? 'mobile number' : 'email address'}.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await sendOtp(target, type);
      if (res.success) {
        setOtpSent(true);
        setTimer(60);
        setOtpCode('');
        setSuccessMsg(res.message);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to dispatch verification code. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (type: 'mobile' | 'email') => {
    const target = type === 'mobile' ? phone : otpEmail;
    if (otpCode.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await verifyOtp(target, otpCode, type);
      if (res.success) {
        setSuccessMsg('Authentication verified successfully! Redirecting...');
        setTimeout(() => navigate('/'), 600);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Verification service unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6 relative">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-maroon-800 to-maroon-600 flex items-center justify-center mx-auto shadow-maroon">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI PDF Studio</h1>
          <p className="text-xs text-slate-500 font-medium">
            Enterprise Document Intelligence & Pure Client-Side Conversions
          </p>
        </div>

        {/* Authentication Mode Switcher */}
        <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 shadow-card space-y-5">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => {
                setAuthMode('password');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${authMode === 'password'
                ? 'bg-white text-maroon-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              Password
            </button>
            <button
              onClick={() => {
                setAuthMode('mobile_otp');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${authMode === 'mobile_otp'
                ? 'bg-white text-maroon-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              Mobile OTP
            </button>
            <button
              onClick={() => {
                setAuthMode('email_otp');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${authMode === 'email_otp'
                ? 'bg-white text-maroon-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              Email OTP
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form 1: Password Login */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Email or Mobile Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="alex.mercer@enterprise.ai"
                    required
                    className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-maroon-600 focus:ring-1 focus:ring-maroon-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-bold text-maroon-700 hover:text-maroon-900"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-maroon-600 focus:ring-1 focus:ring-maroon-600 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-maroon-700 hover:bg-maroon-800 text-white font-extrabold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In with Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Form 2: Mobile OTP Login */}
          {authMode === 'mobile_otp' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Mobile Number (with Country Code)
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    disabled={otpSent}
                    className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl pl-10 pr-24 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-maroon-600 font-medium"
                  />
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={() => handleSendOtp('mobile')}
                      disabled={isLoading}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-maroon-700 hover:bg-maroon-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Send OTP
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-maroon-700 font-bold hover:underline"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {otpSent && (
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 bg-maroon-50 border border-maroon-200 rounded-2xl flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-maroon-100 flex items-center justify-center flex-shrink-0 text-maroon-700 shadow-2xs mt-0.5">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-extrabold text-slate-800">SMS Verification Dispatched</p>
                        <span className="text-[10px] bg-maroon-100 text-maroon-800 px-2 py-0.5 rounded-full font-bold">
                          Valid 5 min
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                        6-Digit OTP sent to <strong>{phone}</strong> via cellular network. Please check your SMS inbox and enter the code below.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Enter 6-Digit SMS Verification Code
                    </label>
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
                        onClick={() => handleSendOtp('mobile')}
                        disabled={timer > 0 || isLoading}
                        className="text-xs font-bold text-maroon-700 hover:text-maroon-900 disabled:opacity-40"
                      >
                        {timer > 0 ? `Resend in ${timer}s` : 'Resend SMS OTP'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerifyOtp('mobile')}
                    disabled={isLoading || otpCode.length < 6}
                    className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isLoading ? 'Verifying OTP...' : 'Verify OTP & Sign In'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Form 3: Email OTP Login */}
          {authMode === 'email_otp' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    placeholder="alex.mercer@enterprise.ai"
                    disabled={otpSent}
                    className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl pl-10 pr-24 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-maroon-600 font-medium"
                  />
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={() => handleSendOtp('email')}
                      disabled={isLoading}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-maroon-700 hover:bg-maroon-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Send OTP
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-maroon-700 font-bold hover:underline"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {otpSent && (
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 bg-maroon-50 border border-maroon-200 rounded-2xl flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-maroon-100 flex items-center justify-center flex-shrink-0 text-maroon-700 shadow-2xs mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-extrabold text-slate-800">Email Verification Dispatched</p>
                        <span className="text-[10px] bg-maroon-100 text-maroon-800 px-2 py-0.5 rounded-full font-bold">
                          Valid 5 min
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                        6-Digit OTP sent to <strong>{otpEmail}</strong>. Please check your inbox and enter the code below.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Enter 6-Digit Email Verification Code
                    </label>
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
                        onClick={() => handleSendOtp('email')}
                        disabled={timer > 0 || isLoading}
                        className="text-xs font-bold text-maroon-700 hover:text-maroon-900 disabled:opacity-40"
                      >
                        {timer > 0 ? `Resend in ${timer}s` : 'Resend Email OTP'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerifyOtp('email')}
                    disabled={isLoading || otpCode.length < 6}
                    className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isLoading ? 'Verifying OTP...' : 'Verify OTP & Sign In'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Demo Login Option */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={() => setShowGatewayModal(!showGatewayModal)}
              className="w-full py-2 px-3 text-[11px] font-bold text-maroon-700 hover:text-maroon-900 bg-maroon-50/60 hover:bg-maroon-50 rounded-xl flex items-center justify-center space-x-1.5 transition-colors border border-maroon-100"
            >
              <Smartphone className="w-3.5 h-3.5 text-maroon-700" />
              <span>{showGatewayModal ? 'Close Gateway Settings' : '⚙️ Cellular SMS Gateway Settings (Fast2SMS / Twilio)'}</span>
            </button>

            {showGatewayModal && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-left">
                <div>
                  <p className="text-xs font-black text-slate-800">Configure Live Cellular SMS Delivery</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">
                    To send live OTP SMS directly to your phone (e.g. +91 8948129005), enter your <strong>Fast2SMS API Key</strong> below (free instant key available at <a href="https://www.fast2sms.com" target="_blank" rel="noreferrer" className="text-maroon-700 underline font-bold">fast2sms.com</a>):
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Fast2SMS API Key</label>
                  <input
                    type="password"
                    value={fast2smsKey}
                    onChange={(e) => setFast2smsKey(e.target.value)}
                    placeholder="Paste Fast2SMS authorization key..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-maroon-600"
                  />
                </div>

                {gatewaySavedMsg && (
                  <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                    {gatewaySavedMsg}
                  </p>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    if (!fast2smsKey.trim()) return;
                    setIsLoading(true);
                    const res = await configureGateway({ fast2sms_api_key: fast2smsKey.trim() });
                    setIsLoading(false);
                    if (res.success) {
                      setGatewaySavedMsg('Gateway Key saved & activated! All mobile OTPs will now be sent as real SMS to your phone.');
                      setTimeout(() => setGatewaySavedMsg(null), 5000);
                    } else {
                      setError(res.message);
                    }
                  }}
                  disabled={isLoading || !fast2smsKey.trim()}
                  className="w-full py-2 bg-maroon-700 hover:bg-maroon-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  Save & Activate Live Cellular SMS
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                quickDemoLogin();
                navigate('/');
              }}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors border border-slate-200"
            >
              <Zap className="w-3.5 h-3.5 text-maroon-700" />
              <span>One-Click Instant Pro Workspace Access</span>
            </button>
          </div>

          <div className="text-center pt-1">
            <p className="text-xs text-slate-500 font-medium">
              New to AI PDF?{' '}
              <Link to="/register" className="text-maroon-700 font-extrabold hover:text-maroon-900">
                Create Free Workspace
              </Link>
            </p>
          </div>
        </div>

        {/* Security Stamp */}
        <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-maroon-700" />
          <span>Encrypted Session with 5-Minute OTP Expiry & Zero Leakage</span>
        </div>
      </div>
    </div>
  );
};
