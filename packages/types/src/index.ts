// User & Auth Types
export interface UserDTO {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN';
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  storageUsedBytes: string;
  storageQuotaBytes: string;
  createdAt: string;
}

export interface AuthResponse {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}

// Document Types
export interface DocumentDTO {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSizeBytes: number;
  storageKey: string;
  pageCount: number;
  isScanned: boolean;
  isIndexed: boolean;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
  downloadUrl?: string;
}

// Chat & RAG Types
export interface Citation {
  pageNumber: number;
  snippet: string;
  score: number;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant';
  text: string;
  citations: Citation[] | null;
  tokensUsed: number;
  createdAt: string;
}

export interface ConversationDTO {
  id: string;
  userId: string;
  documentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: MessageDTO[];
}

// PDF Tools Operations
export type PDFOperationType =
  | 'MERGE'
  | 'SPLIT'
  | 'COMPRESS'
  | 'ROTATE'
  | 'WATERMARK'
  | 'PAGE_NUMBERS'
  | 'CONVERT_WORD'
  | 'CONVERT_EXCEL'
  | 'CONVERT_IMAGES';

export interface MergePDFRequest {
  documentIds: string[];
  outputFileName: string;
}

export interface SplitPDFRequest {
  documentId: string;
  pageRanges: string; // e.g., "1-3, 5, 8-10"
  outputFileName: string;
}

export interface CompressPDFRequest {
  documentId: string;
  qualityTier: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RotatePDFRequest {
  documentId: string;
  pageNumbers: number[]; // empty means all pages
  rotationAngle: 90 | 180 | 270;
}

export interface WatermarkPDFRequest {
  documentId: string;
  text: string;
  opacity: number;
  fontSize: number;
  colorHex: string;
  rotationDegrees: number;
}

// AI Lab Types
export type AISummaryType = 'EXECUTIVE' | 'BULLET_POINTS' | 'DEEP_DIVE';

export interface AISummarizeRequest {
  documentId: string;
  summaryType: AISummaryType;
  language?: string;
}

export interface AITranslateRequest {
  documentId: string;
  targetLanguage: string;
}

export interface AIQuizRequest {
  documentId: string;
  questionCount: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  pageReference: number;
}

// Background Job Status
export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface JobStatusDTO {
  id: string;
  jobType: string;
  status: JobStatus;
  progress: number;
  errorMessage: string | null;
  resultPayload: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
