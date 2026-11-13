import { z } from 'zod';

// Storage & Tier Limits
export const TIER_LIMITS = {
  FREE: {
    maxStorageBytes: 104857600, // 100 MB
    maxFileSizeBytes: 15728640,  // 15 MB
    monthlyAIQueries: 50,
    monthlyOCRJobs: 10,
    maxPagesPerDoc: 50,
  },
  PRO: {
    maxStorageBytes: 10737418240, // 10 GB
    maxFileSizeBytes: 104857600,  // 100 MB
    monthlyAIQueries: 2000,
    monthlyOCRJobs: 500,
    maxPagesPerDoc: 500,
  },
  ENTERPRISE: {
    maxStorageBytes: 107374182400, // 100 GB
    maxFileSizeBytes: 524288000,   // 500 MB
    monthlyAIQueries: 20000,
    monthlyOCRJobs: 5000,
    maxPagesPerDoc: 2000,
  },
} as const;

// Standard Error Hierarchy
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    if ('captureStackTrace' in Error) {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid request parameters') {
    super(message, 400);
  }
}

// Zod Validation Schemas
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const uploadUrlSchema = z.object({
  fileName: z.string().min(1),
  fileSizeBytes: z.number().positive(),
  mimeType: z.string().default('application/pdf'),
});

export const mergePDFSchema = z.object({
  documentIds: z.array(z.string().uuid()).min(2, 'At least 2 documents are required to merge'),
  outputFileName: z.string().min(1),
});

export const splitPDFSchema = z.object({
  documentId: z.string().uuid(),
  pageRanges: z.string().regex(/^[\d\s,-]+$/, 'Invalid page range format (e.g. 1-3, 5)'),
  outputFileName: z.string().min(1),
});

export const rotatePDFSchema = z.object({
  documentId: z.string().uuid(),
  pageNumbers: z.array(z.number().int().positive()).optional(),
  rotationAngle: z.union([z.literal(90), z.literal(180), z.literal(270)]),
});

export const aiChatSchema = z.object({
  documentId: z.string().uuid(),
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1).max(2000),
});
