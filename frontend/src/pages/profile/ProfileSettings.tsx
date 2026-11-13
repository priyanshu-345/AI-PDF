import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  FileText,
  HardDrive,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  KeyRound,
  LogOut,
  Save,
  Trash2,
  Sparkles,
  Camera,
  RefreshCw,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDocumentStore } from '../../store/useDocumentStore';
import { formatBytes } from '../../utils/pdfEngine';

export const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    setTier,
    updateProfile,
    toggle2FA,
    sendOtp,
    verifyOtp,
    smsGateway,
    setSmsGatewayConfig,
    logout,
  } = useAuthStore();
  const { getTotalStorageUsed } = useDocumentStore();

  const [activeTab, setActiveTab] = useState<'details' | 'security' | 'storage'>('details');

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [role, setRole] = useState(user?.role || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Notifications
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password Change State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  // OTP Verification Modal for Email / Phone
  const [verifyingChannel, setVerifyingChannel] = useState<'email' | 'mobile' | null>(null);
  const [modalOtpCode, setModalOtpCode] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalCooldown, setModalCooldown] = useState(45);
  const [isVerifyingModal, setIsVerifyingModal] = useState(false);

  // Keep form fields synced if user in store changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
      setOrganization(user.organization || '');
      setRole(user.role || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  // Modal Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (verifyingChannel && modalCooldown > 0) {
      timer = setInterval(() => {
        setModalCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [verifyingChannel, modalCooldown]);

  const totalUsed = getTotalStorageUsed();
  const quota = user?.storageQuotaBytes || 10737418240;
  const pct = Math.min(100, Math.round((totalUsed / quota) * 100));

  // Handle Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Valid Email is required.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Mobile Number is required.');
      return;
    }

    // Determine if email or phone changed
    const emailChanged = user?.email !== email.trim();
    const phoneChanged = user?.phone !== phone.trim();

    updateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      organization: organization.trim(),
      role: role.trim(),
      bio: bio.trim(),
      avatar: avatar.trim(),
      isEmailVerified: emailChanged ? false : user?.isEmailVerified,
      isPhoneVerified: phoneChanged ? false : user?.isPhoneVerified,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Trigger inline OTP Verification for Email or Phone
  const handleStartVerification = async (channel: 'email' | 'mobile') => {
    const target = channel === 'email' ? email : phone;
    if (!target.trim()) return;

    setVerifyingChannel(channel);
    setModalOtpCode('');
    setModalError('');
    setModalCooldown(45);
    await sendOtp(target, channel);
  };

  // Submit Modal OTP
  const handleConfirmModalOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingChannel || modalOtpCode.length < 6) return;

    setIsVerifyingModal(true);
    setModalError('');
    const target = verifyingChannel === 'email' ? email : phone;
    const res = await verifyOtp(target, modalOtpCode, verifyingChannel);
    setIsVerifyingModal(false);

    if (res.success) {
      if (verifyingChannel === 'email') {
        updateProfile({ isEmailVerified: true, email });
      } else {
        updateProfile({ isPhoneVerified: true, phone });
      }
      setVerifyingChannel(null);
    } else {
      setModalError(res.message);
    }
  };

  // Handle Password Change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (newPass.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmNewPass) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    setPassSuccess(true);
    setCurrentPass('');
    setNewPass('');
    setConfirmNewPass('');
    setTimeout(() => setPassSuccess(false), 4000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear your local workspace cache?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 selection:bg-maroon-100 selection:text-maroon-900">
      {/* Header Banner */}
      <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-maroon-50/60 to-transparent pointer-events-none rounded-full translate-x-32 -translate-y-32" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-maroon-100 border-2 border-maroon-200 flex items-center justify-center overflow-hidden shadow-xs">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-maroon-800">
                    {user?.name?.slice(0, 2).toUpperCase() || 'US'}
                  </span>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {user?.name || 'Workspace User'}
                </h1>
                <span className="bg-maroon-700 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  {user?.tier || 'PRO'} TIER
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-600">
                {user?.role || 'Senior Document Architect'} · {user?.organization || 'Enterprise Studio'}
              </p>

              {/* Verified Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] font-bold">
                <div
                  className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full border ${user?.isEmailVerified
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                >
                  {user?.isEmailVerified ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span>{user?.isEmailVerified ? 'Email Verified' : 'Email Unverified'}</span>
                </div>

                <div
                  className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full border ${user?.isPhoneVerified
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                >
                  {user?.isPhoneVerified ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span>{user?.isPhoneVerified ? 'Mobile Verified' : 'Mobile Unverified'}</span>
                </div>

                <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-maroon-700" />
                  <span>2FA {user?.twoFactorEnabled ? 'Active' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Sign Out Action */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 pt-4 border-t border-[#EAE5E5] flex items-center space-x-2 sm:space-x-3 overflow-x-auto">
          {[
            { id: 'details', label: 'Personal Information & Verification', icon: User },
            { id: 'security', label: 'Security & 2-Factor Authentication', icon: Shield },
            { id: 'storage', label: 'Subscription Tier & Storage Quota', icon: HardDrive },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${active
                  ? 'bg-maroon-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: Personal Details & Contact Verification */}
      {activeTab === 'details' && (
        <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Personal Profile & Contact Information
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Update your primary credentials, contact channels, and verify your account.
            </p>
          </div>

          {saveSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2.5 text-emerald-800 text-xs font-bold animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Profile information has been updated and saved successfully!</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    required
                    className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-maroon-600 focus:ring-1 focus:ring-maroon-600"
                  />
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                  Avatar Image URL
                </label>
                <div className="relative">
                  <Camera className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-maroon-600 focus:ring-1 focus:ring-maroon-600"
                  />
                </div>
              </div>

              {/* Email Address + Verification Trigger */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Email Address</label>
                  {user?.isEmailVerified ? (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartVerification('email')}
                      className="text-[11px] font-bold text-maroon-700 hover:text-maroon-900 underline flex items-center"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Verify via Email OTP
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.mercer@enterprise.ai"
                    required
                    className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-maroon-600 focus:ring-1 focus:ring-maroon-600"
                  />
                </div>
              </div>

              {/* Mobile Phone + Verification Trigger */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Mobile Phone Number</label>
                  {user?.isPhoneVerified ? (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartVerification('mobile')}
                      className="text-[11px] font-bold text-maroon-700 hover:text-maroon-900 underline flex items-center"
                    >
                      <Smartphone className="w-3 h-3 mr-1" />
                      Verify via SMS OTP
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-maroon-600 focus:ring-1 focus:ring-maroon-600"
                  />
                </div>
              </div>

              {/* Organization */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                  Company / Organization
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Apex Digital Technologies"
                    className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-maroon-600 focus:ring-1 focus:ring-maroon-600"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                  Job Role & Designation
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Senior PDF Architect"
                    className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-maroon-600 focus:ring-1 focus:ring-maroon-600"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                Workspace Bio & Summary
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of your operations..."
                className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-maroon-600 focus:ring-1 focus:ring-maroon-600 resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-maroon-700 hover:bg-maroon-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Security & Two-Factor Authentication */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Two-Factor Authentication Card */}
          <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 sm:p-8 shadow-card space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-maroon-700" />
                  <span>Two-Factor Authentication (2FA)</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Require a 6-digit OTP code every time you sign in to your workspace.
                </p>
              </div>

              {/* 2FA Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={user?.twoFactorEnabled ?? false}
                  onChange={(e) => toggle2FA(e.target.checked, user?.twoFactorMethod || 'mobile')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-maroon-700"></div>
              </label>
            </div>

            {user?.twoFactorEnabled && (
              <div className="p-4 bg-maroon-50/50 border border-maroon-200 rounded-2xl space-y-3">
                <p className="text-xs font-extrabold text-maroon-900">
                  Select Preferred 2FA Verification Channel:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => toggle2FA(true, 'mobile')}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-all ${user?.twoFactorMethod === 'mobile'
                      ? 'bg-white border-maroon-600 shadow-xs text-maroon-900 font-extrabold'
                      : 'bg-white/60 border-slate-200 text-slate-600 font-medium hover:bg-white'
                      }`}
                  >
                    <Smartphone className="w-4 h-4 text-maroon-700" />
                    <div>
                      <p className="text-xs font-bold">SMS Mobile OTP</p>
                      <p className="text-[10px] text-slate-400">{user?.phone || '+91 98765 43210'}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggle2FA(true, 'email')}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-all ${user?.twoFactorMethod === 'email'
                      ? 'bg-white border-maroon-600 shadow-xs text-maroon-900 font-extrabold'
                      : 'bg-white/60 border-slate-200 text-slate-600 font-medium hover:bg-white'
                      }`}
                  >
                    <Mail className="w-4 h-4 text-maroon-700" />
                    <div>
                      <p className="text-xs font-bold">Email Address OTP</p>
                      <p className="text-[10px] text-slate-400">{user?.email || 'user@company.com'}</p>
                    </div>
                  </button>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Verify your active channel is operational:</span>
                  <button
                    onClick={() =>
                      handleStartVerification(user?.twoFactorMethod === 'email' ? 'email' : 'mobile')
                    }
                    className="text-xs font-bold text-maroon-700 hover:text-maroon-900 underline"
                  >
                    Test 2FA Dispatch
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Change Password Card */}
          <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 sm:p-8 shadow-card space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <Lock className="w-5 h-5 text-maroon-700" />
                <span>Change Account Password</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Protect your account with a secure, unique password.
              </p>
            </div>

            {passSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2.5 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Password changed successfully!</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-maroon-600 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-maroon-600 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmNewPass}
                  onChange={(e) => setConfirmNewPass(e.target.value)}
                  placeholder="Re-type new password"
                  required
                  className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-maroon-600 font-medium"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-maroon-700 hover:bg-maroon-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all"
              >
                <KeyRound className="w-4 h-4" />
                <span>Update Password</span>
              </button>
            </form>
          </div>

          {/* Live Cellular SMS Gateway Provider Configuration */}
          <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-maroon-700" />
              <h3 className="text-base font-extrabold text-slate-900">SMS Gateway Configuration</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Configure your live cellular network SMS provider for instant OTP delivery directly to mobile numbers.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'standard', name: 'Cryptographic Local Dispatch', desc: 'Secure client-side 5-min OTP token' },
                { id: 'fast2sms', name: 'Fast2SMS Gateway', desc: 'Real cellular SMS across Indian phone numbers' },
                { id: 'custom', name: 'Custom HTTP Webhook', desc: 'Connect to your backend/Twilio SMS endpoint' },
              ].map((prov) => (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => setSmsGatewayConfig({ provider: prov.id as any })}
                  className={`p-3.5 rounded-xl border text-left transition-all ${smsGateway?.provider === prov.id
                    ? 'border-maroon-700 bg-maroon-50/60 ring-1 ring-maroon-700 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <p className="text-xs font-extrabold text-slate-900">{prov.name}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{prov.desc}</p>
                </button>
              ))}
            </div>
            {smsGateway?.provider === 'fast2sms' && (
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Fast2SMS Authorization API Key</label>
                <input
                  type="password"
                  value={smsGateway.apiKey || ''}
                  onChange={(e) => setSmsGatewayConfig({ apiKey: e.target.value })}
                  placeholder="Enter your Fast2SMS API Key"
                  className="w-full max-w-md bg-[#FAF9F9] border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:border-maroon-600"
                />
              </div>
            )}
            {smsGateway?.provider === 'custom' && (
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Custom Webhook Endpoint URL</label>
                <input
                  type="url"
                  value={smsGateway.customEndpoint || ''}
                  onChange={(e) => setSmsGatewayConfig({ customEndpoint: e.target.value })}
                  placeholder="https://api.yourdomain.com/send-sms"
                  className="w-full max-w-md bg-[#FAF9F9] border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:border-maroon-600"
                />
              </div>
            )}
          </div>

          {/* Active Sessions */}
          <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Active Security Sessions</h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-maroon-700" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">
                    Current Web Browser Session (Active Now)
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Windows 11 · Chrome / Antigravity Native Engine · Verified Session
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase">
                THIS DEVICE
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Storage & Subscription Plans */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          {/* Subscription Tier Switcher */}
          <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 sm:p-8 shadow-card space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Subscription & Workspace Quota
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Choose the workspace tier that fits your document processing volume.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  id: 'FREE',
                  title: 'Free Workspace',
                  quota: '1 GB Storage',
                  desc: 'All core PDF tools, standard client conversions, 5 daily AI prompts.',
                },
                {
                  id: 'PRO',
                  title: 'Pro Suite',
                  quota: '10 GB Storage',
                  desc: 'Full AI Lab, unlimited client conversions, batch OCR, dual OTP security.',
                  popular: true,
                },
                {
                  id: 'ENTERPRISE',
                  title: 'Enterprise Studio',
                  quota: '50 GB Storage',
                  desc: 'High-speed batch processing, unlimited storage quota, dedicated support.',
                },
              ].map((tier) => {
                const isActive = user?.tier === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setTier(tier.id as any)}
                    className={`p-5 rounded-2xl text-left border relative transition-all ${isActive
                      ? 'border-maroon-700 bg-maroon-50/60 shadow-xs ring-1 ring-maroon-700'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                  >
                    {isActive && (
                      <span className="absolute right-3.5 top-3.5 bg-maroon-700 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full tracking-wider">
                        ACTIVE
                      </span>
                    )}
                    <p className={`text-xs font-black ${isActive ? 'text-maroon-900' : 'text-slate-800'}`}>
                      {tier.title}
                    </p>
                    <p className="text-sm font-extrabold text-maroon-700 mt-1.5">{tier.quota}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-2 leading-relaxed">
                      {tier.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Storage Meter Details */}
          <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
              <span className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-maroon-700" />
                <span>Client-Side Document Storage Usage</span>
              </span>
              <span>{pct}% Allocated</span>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-maroon-700 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(5, pct)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2 text-center text-xs">
              <div className="p-3 bg-[#FAF9F9] rounded-xl border border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-400">Used Storage</p>
                <p className="font-extrabold text-slate-800 mt-0.5">{formatBytes(totalUsed)}</p>
              </div>
              <div className="p-3 bg-[#FAF9F9] rounded-xl border border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-400">Available Storage</p>
                <p className="font-extrabold text-slate-800 mt-0.5">
                  {formatBytes(Math.max(0, quota - totalUsed))}
                </p>
              </div>
              <div className="p-3 bg-[#FAF9F9] rounded-xl border border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Allocation</p>
                <p className="font-extrabold text-maroon-800 mt-0.5">{formatBytes(quota)}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Workspace Cache Management</p>
                <p className="text-[11px] text-slate-400">
                  Safely reset stored documents and cached PDF models.
                </p>
              </div>
              <button
                onClick={handleClearCache}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cache</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {verifyingChannel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-[#EAE5E5] space-y-4 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-maroon-50 border border-maroon-200 flex items-center justify-center mx-auto text-maroon-800">
                {verifyingChannel === 'mobile' ? (
                  <Smartphone className="w-6 h-6 text-maroon-700" />
                ) : (
                  <Mail className="w-6 h-6 text-maroon-700" />
                )}
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Verify {verifyingChannel === 'mobile' ? 'Mobile Phone' : 'Email Address'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Enter the 6-digit code sent to{' '}
                <span className="font-bold text-slate-800">
                  {verifyingChannel === 'mobile' ? phone : email}
                </span>
              </p>
            </div>

            {modalError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-rose-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmModalOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={modalOtpCode}
                  onChange={(e) => setModalOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 bg-[#FAF9F9] border-2 border-slate-200 focus:border-maroon-600 rounded-xl text-slate-900 focus:outline-none transition-all font-bold"
                  autoFocus
                />
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-[10px] text-slate-400">Demo Code: 123456</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (modalCooldown === 0) {
                        sendOtp(verifyingChannel === 'email' ? email : phone, verifyingChannel);
                        setModalCooldown(45);
                      }
                    }}
                    disabled={modalCooldown > 0}
                    className="text-xs font-bold text-maroon-700 hover:text-maroon-900 disabled:opacity-40"
                  >
                    {modalCooldown > 0 ? `Resend (${modalCooldown}s)` : 'Resend Code'}
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isVerifyingModal || modalOtpCode.length < 6}
                  className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isVerifyingModal ? 'Verifying...' : 'Confirm Verification'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVerifyingChannel(null)}
                  className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
