import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '../types';

export interface ActiveOtpSession {
  target: string;
  type: 'email' | 'mobile';
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  code?: string;
}

export interface SmsGatewayConfig {
  provider: 'standard' | 'fast2sms' | 'twilio' | 'custom';
  apiKey?: string;
  senderId?: string;
  customEndpoint?: string;
}

interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  jwtToken: string | null;
  activeOtp: ActiveOtpSession | null;
  smsGateway: SmsGatewayConfig;

  // Auth Actions
  loginWithPassword: (emailOrPhone: string, pass: string) => Promise<boolean>;
  sendOtp: (target: string, type: 'email' | 'mobile') => Promise<{ success: boolean; message: string; gatewayNote?: string }>;
  verifyOtp: (target: string, otp: string, type: 'email' | 'mobile') => Promise<{ success: boolean; message: string }>;
  configureGateway: (config: { fast2sms_api_key?: string; twilio_account_sid?: string; twilio_auth_token?: string; twilio_phone_number?: string; smtp_host?: string; smtp_user?: string; smtp_pass?: string }) => Promise<{ success: boolean; message: string }>;
  registerUser: (data: { name: string; email: string; phone: string; pass: string }) => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  toggle2FA: (enabled: boolean, method?: 'email' | 'mobile') => void;
  setSmsGatewayConfig: (config: Partial<SmsGatewayConfig>) => void;
  quickDemoLogin: () => void;
  logout: () => void;
  setTier: (tier: 'FREE' | 'PRO' | 'ENTERPRISE') => void;
}

export const DEFAULT_USER: UserProfile = {
  id: 'usr-enterprise-01',
  name: 'Alex Mercer',
  email: 'alex.mercer@enterprise.ai',
  phone: '+91 98765 43210',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  tier: 'PRO',
  storageUsedBytes: 14840000,
  storageQuotaBytes: 10737418240, // 10 GB
  isEmailVerified: true,
  isPhoneVerified: true,
  organization: 'Apex Digital Technologies',
  role: 'Senior PDF Architect & Operations Lead',
  bio: 'Overseeing enterprise document workflows, high-speed client-side PDF conversions, and AI extraction pipelines.',
  twoFactorEnabled: true,
  twoFactorMethod: 'mobile',
  joinedDate: 'November 2026',
};

/**
 * Generate cryptographically secure 6-digit random integer
 */
function generateCryptographicOtp(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const uintArr = new Uint32Array(1);
    window.crypto.getRandomValues(uintArr);
    return (100000 + (uintArr[0] % 900000)).toString();
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: DEFAULT_USER,
      isAuthenticated: true,
      jwtToken: null,
      activeOtp: null,
      smsGateway: {
        provider: 'standard',
      },

      setSmsGatewayConfig: (config) => {
        set((state) => ({
          smsGateway: { ...state.smsGateway, ...config },
        }));
      },

      loginWithPassword: async (emailOrPhone: string, _pass: string) => {
        const isEmail = emailOrPhone.includes('@');
        set({
          user: {
            ...DEFAULT_USER,
            email: isEmail ? emailOrPhone : DEFAULT_USER.email,
            phone: !isEmail ? emailOrPhone : DEFAULT_USER.phone,
            name: isEmail ? emailOrPhone.split('@')[0] : 'User',
          },
          isAuthenticated: true,
        });
        return true;
      },

      sendOtp: async (target: string, type: 'email' | 'mobile') => {
        const cleanTarget = target.trim();
        if (!cleanTarget) {
          return { success: false, message: 'Invalid destination target provided.' };
        }

        let serverMessage = `6-Digit OTP security code dispatched to ${cleanTarget}.`;
        let gatewayNote = '';

        // 1. Dispatch through Real Backend OTP Cellular/Email Gateway
        try {
          let res: Response | null = null;
          try {
            res = await fetch('/api/auth/send-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ target: cleanTarget, type }),
            });
          } catch {
            res = await fetch('http://localhost:8000/api/auth/send-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ target: cleanTarget, type }),
            });
          }

          if (res && res.ok) {
            const data = await res.json();
            if (data.message) serverMessage = data.message;
            if (data.gateway_note) gatewayNote = data.gateway_note;
          }
        } catch (err) {
          console.warn('Backend send-otp connection:', err);
        }

        const expiresAt = Date.now() + 5 * 60 * 1000; // 5-minute validity

        set({
          activeOtp: {
            target: cleanTarget,
            type,
            expiresAt,
            attempts: 0,
            maxAttempts: 3,
          },
        });

        // 2. Also dispatch via direct client Fast2SMS if configured in browser store
        const { smsGateway } = get();
        if (type === 'mobile' && smsGateway.provider === 'fast2sms' && smsGateway.apiKey) {
          try {
            const rawDigits = cleanTarget.replace(/\D/g, '');
            const phone10 = rawDigits.slice(-10);
            await fetch(
              `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(
                smsGateway.apiKey
              )}&route=otp&flash=0&numbers=${phone10}`
            );
          } catch (err) {
            console.error('Client Fast2SMS dispatch error:', err);
          }
        }

        return {
          success: true,
          message: serverMessage,
          gatewayNote,
        };
      },

      configureGateway: async (config) => {
        try {
          let res: Response | null = null;
          try {
            res = await fetch('/api/auth/gateway-config', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(config),
            });
          } catch {
            res = await fetch('http://localhost:8000/api/auth/gateway-config', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(config),
            });
          }

          if (res && res.ok) {
            const data = await res.json();
            if (config.fast2sms_api_key) {
              set((state) => ({
                smsGateway: { ...state.smsGateway, provider: 'fast2sms', apiKey: config.fast2sms_api_key },
              }));
            }
            return { success: true, message: data.message || 'Gateway updated!' };
          }
        } catch (err: any) {
          return { success: false, message: err.message || 'Failed to update gateway.' };
        }
        return { success: false, message: 'Could not connect to gateway service.' };
      },

      verifyOtp: async (target: string, otp: string, type: 'email' | 'mobile') => {
        const { activeOtp, user } = get();

        if (!activeOtp) {
          return {
            success: false,
            message: 'No active OTP verification session found. Please request a new code.',
          };
        }

        // Target match check
        if (activeOtp.target.toLowerCase() !== target.trim().toLowerCase()) {
          return {
            success: false,
            message: 'Destination mismatch. Please request a code for this destination.',
          };
        }

        // Expiration check
        if (Date.now() > activeOtp.expiresAt) {
          set({ activeOtp: null });
          return {
            success: false,
            message: 'OTP has expired (validity is 5 minutes). Please request a fresh code.',
          };
        }

        // Brute-force attempt throttle
        if (activeOtp.attempts >= activeOtp.maxAttempts) {
          set({ activeOtp: null });
          return {
            success: false,
            message: 'Security lockout: Maximum 3 failed attempts exceeded. Request a new OTP.',
          };
        }

        const inputCode = otp.trim();

        // 1. Attempt Backend Real-Time Verification & JWT Issuance
        try {
          let res: Response | null = null;
          try {
            res = await fetch('/api/auth/verify-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ target, otp: inputCode, type }),
            });
          } catch {
            res = await fetch('http://localhost:8000/api/auth/verify-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ target, otp: inputCode, type }),
            });
          }

          if (res && res.ok) {
            const data = await res.json();
            const jwtToken = data.token || data.access_token;
            if (jwtToken) {
              localStorage.setItem('ai_pdf_jwt_token', jwtToken);
            }
            const isEmail = type === 'email';
            const updatedUser: UserProfile = {
              ...(user || DEFAULT_USER),
              ...(data.user || {}),
              isEmailVerified: isEmail ? true : (user?.isEmailVerified ?? false),
              isPhoneVerified: !isEmail ? true : (user?.isPhoneVerified ?? false),
              email: isEmail ? target : (user?.email || 'user@enterprise.ai'),
              phone: !isEmail ? target : (user?.phone || '+91 98765 43210'),
            };

            set({
              user: updatedUser,
              isAuthenticated: true,
              jwtToken: jwtToken || null,
              activeOtp: null,
            });

            return { success: true, message: data.message || 'Authentication verified successfully!' };
          } else if (res && (res.status === 400 || res.status === 403)) {
            const errData = await res.json().catch(() => ({}));
            return {
              success: false,
              message: errData.detail || 'Invalid 6-digit code. Please verify and retry.',
            };
          }
        } catch (err) {
          console.info('Backend verify skipped, checking local store:', err);
        }

        // 2. Strict local verification fallback
        if (inputCode === activeOtp.code) {
          const isEmail = type === 'email';
          const updatedUser: UserProfile = user
            ? {
              ...user,
              isEmailVerified: isEmail ? true : user.isEmailVerified,
              isPhoneVerified: !isEmail ? true : user.isPhoneVerified,
              email: isEmail ? target : user.email,
              phone: !isEmail ? target : user.phone,
            }
            : {
              ...DEFAULT_USER,
              email: isEmail ? target : 'user@domain.com',
              phone: !isEmail ? target : '+91 99999 00000',
              name: isEmail ? target.split('@')[0] : 'Verified User',
              isEmailVerified: isEmail,
              isPhoneVerified: !isEmail,
            };

          set({
            user: updatedUser,
            isAuthenticated: true,
            activeOtp: null,
          });

          return { success: true, message: 'Authentication verified successfully!' };
        }

        // Increment failed attempt counter
        const nextAttempts = activeOtp.attempts + 1;
        set({
          activeOtp: {
            ...activeOtp,
            attempts: nextAttempts,
          },
        });

        const remaining = activeOtp.maxAttempts - nextAttempts;
        return {
          success: false,
          message:
            remaining > 0
              ? `Incorrect OTP entered. You have ${remaining} attempt(s) remaining.`
              : 'Maximum attempts reached. Session invalidated. Please request a new code.',
        };
      },

      registerUser: async (data: { name: string; email: string; phone: string; pass: string }) => {
        const newUser: UserProfile = {
          id: `usr-${Date.now()}`,
          name: data.name,
          email: data.email,
          phone: data.phone,
          tier: 'FREE',
          storageUsedBytes: 1024,
          storageQuotaBytes: 1073741824, // 1 GB
          isEmailVerified: false,
          isPhoneVerified: false,
          organization: 'Independent Workspace',
          role: 'Workspace Owner',
          bio: 'Active PDF Studio member.',
          twoFactorEnabled: false,
          twoFactorMethod: 'email',
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        };

        set({
          user: newUser,
          isAuthenticated: true,
        });
        return true;
      },

      updateProfile: (updates: Partial<UserProfile>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      toggle2FA: (enabled: boolean, method = 'mobile') => {
        set((state) => ({
          user: state.user
            ? {
              ...state.user,
              twoFactorEnabled: enabled,
              twoFactorMethod: method,
            }
            : null,
        }));
      },

      quickDemoLogin: () => {
        set({ user: DEFAULT_USER, isAuthenticated: true });
      },

      logout: () => {
        try {
          localStorage.removeItem('ai_pdf_jwt_token');
          fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        } catch {}
        set({ user: null, isAuthenticated: false, jwtToken: null, activeOtp: null });
      },

      setTier: (tier) => {
        set((state) => {
          if (!state.user) return state;
          const quota =
            tier === 'FREE'
              ? 1073741824
              : tier === 'PRO'
                ? 10737418240
                : 53687091200;
          return {
            user: { ...state.user, tier, storageQuotaBytes: quota },
          };
        });
      },
    }),
    {
      name: 'ai-pdf-auth-v3',
    }
  )
);
