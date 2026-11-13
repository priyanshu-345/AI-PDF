import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Upload,
  Sparkles,
  Shield,
  Layers,
  ChevronDown,
  User,
  ShieldCheck,
  HardDrive,
  LogOut,
  LogIn,
  UserPlus,
  CheckCircle2,
  Menu,
  X,
  Wrench,
  FolderOpen,
  FileSpreadsheet,
  Image,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useDocumentStore } from '../store/useDocumentStore';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { searchQuery, setSearchQuery } = useDocumentStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileDrawerOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EAE5E5] px-4 sm:px-6 py-3 transition-all">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Brand + Mobile Hamburger */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileDrawerOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-maroon-700 hover:bg-maroon-50 transition-colors"
              aria-label="Toggle Navigation Drawer"
            >
              {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-maroon-800 to-maroon-600 flex items-center justify-center shadow-maroon group-hover:scale-105 transition-transform flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-maroon-700 transition-colors">
                    AI PDF
                  </span>
                  <span className="bg-maroon-50 text-maroon-800 text-[10px] font-bold px-2 py-0.2 rounded-full border border-maroon-100">
                    Studio
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-500 tracking-wide hidden sm:block">
                  Enterprise Document Suite
                </p>
              </div>
            </Link>
          </div>

          {/* Search Input (Desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents, OCR text, or tools..."
                className="w-full bg-[#FAF9F9] border border-[#E8E2E2] rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-maroon-600 focus:ring-1 focus:ring-maroon-600 transition-all font-medium"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
                /
              </kbd>
            </div>
          </div>

          {/* Action Controls & User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              to="/upload"
              className="flex items-center space-x-1.5 bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-bold px-3 sm:px-4 py-2 rounded-xl shadow-xs transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Upload PDF</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" />

            {/* User Auth & Profile Dropdown */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-maroon-100 border border-maroon-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-maroon-800 font-bold text-xs">
                        {user.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-xs font-extrabold text-slate-900 leading-tight">{user.name}</p>
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] font-black text-maroon-700 uppercase tracking-wider">
                        {user.tier}
                      </span>
                      <span className="text-[9px] text-slate-400">· Plan</span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 hidden lg:block transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#EAE5E5] py-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-maroon-100 border border-maroon-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-maroon-800 font-bold text-sm">
                              {user.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                          <p className="text-[10px] text-slate-400 truncate">{user.phone}</p>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center space-x-1.5">
                        <span className="text-[9px] font-extrabold bg-maroon-50 text-maroon-800 border border-maroon-100 px-2 py-0.5 rounded-full uppercase">
                          {user.tier} SUBSCRIBER
                        </span>
                        {user.isPhoneVerified && (
                          <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-full flex items-center space-x-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                            <span>Mobile Verified</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-maroon-50 hover:text-maroon-900 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Full Profile & Contacts</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-maroon-50 hover:text-maroon-900 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span>Security & 2FA</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-maroon-50 hover:text-maroon-900 transition-colors"
                      >
                        <HardDrive className="w-4 h-4 text-slate-400" />
                        <span>Subscription & Storage</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <Link
                  to="/login"
                  className="px-2.5 py-1.5 text-xs font-extrabold text-slate-700 hover:text-maroon-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex">
          <div className="w-72 max-w-[80vw] bg-white h-full shadow-2xl p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-maroon-700 flex items-center justify-center text-white">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="font-black text-base text-slate-900">AI PDF Studio</span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                  Workspace
                </p>
                {[
                  { name: 'Dashboard', path: '/', icon: FileText },
                  { name: 'All PDF Tools', path: '/tools', icon: Wrench },
                  { name: 'Document Library', path: '/documents', icon: FolderOpen },
                  { name: 'Upload Hub', path: '/upload', icon: Upload },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileDrawerOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-maroon-50 hover:text-maroon-900 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-maroon-700" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                  36 Conversion Suites
                </p>
                <Link
                  to="/conversions"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-maroon-50 hover:text-maroon-900 transition-colors"
                >
                  <Layers className="w-4 h-4 text-maroon-700" />
                  <span>Universal Conversions (36)</span>
                </Link>
                <Link
                  to="/conversions/documents"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-maroon-50 hover:text-maroon-900 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-maroon-700" />
                  <span>Document & Sheets (16)</span>
                </Link>
                <Link
                  to="/conversions/images"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-maroon-50 hover:text-maroon-900 transition-colors"
                >
                  <Image className="w-4 h-4 text-maroon-700" />
                  <span>Image & Graphics (20)</span>
                </Link>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                  AI Intelligence
                </p>
                <Link
                  to="/ai/chat"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-maroon-50 hover:text-maroon-900 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-maroon-700" />
                  <span>AI Document Chat</span>
                </Link>
                <Link
                  to="/ai/summarize"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-maroon-50 hover:text-maroon-900 transition-colors"
                >
                  <FileText className="w-4 h-4 text-maroon-700" />
                  <span>AI Document Summarizer</span>
                </Link>
              </div>
            </div>

            {/* Bottom Drawer Actions */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link
                to="/profile"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full py-2.5 px-3 bg-maroon-50 hover:bg-maroon-100 text-maroon-800 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors"
              >
                <User className="w-4 h-4 text-maroon-700" />
                <span>Account & Profile Settings</span>
              </Link>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
        </div>
      )}
    </>
  );
};
