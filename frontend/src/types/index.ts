export interface DocumentItem {
  id: string;
  name: string;
  size: number;
  pages: number;
  type: string;
  updatedAt: string;
  blob?: Blob;
  downloadUrl?: string;
  isScanned?: boolean;
  category?: 'financial' | 'legal' | 'technical' | 'general';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  storageUsedBytes: number;
  storageQuotaBytes: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  organization?: string;
  role?: string;
  bio?: string;
  twoFactorEnabled?: boolean;
  twoFactorMethod?: 'email' | 'mobile';
  joinedDate?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: {
    page: number;
    snippet: string;
  }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  pageRef?: number;
}
