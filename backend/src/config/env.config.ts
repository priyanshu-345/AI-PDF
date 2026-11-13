import dotenv from 'dotenv';
import path from 'path';

// Load root .env or local .env
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.API_PORT) || 4000,
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ai_pdf_toolkit?schema=public',

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,

  // JWT Security
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'ai-pdf-toolkit-secure-access-token-secret-key-32chars',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'ai-pdf-toolkit-secure-refresh-token-secret-key-32chars',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRATION || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRATION || '7d',

  // AWS S3 / MinIO Storage
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'ai-pdf-toolkit-documents',
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || 'minioadmin',
  S3_SECRET_KEY: process.env.S3_SECRET_KEY || 'minioadmin',
  S3_ENDPOINT: process.env.S3_ENDPOINT || 'http://localhost:9000',
  S3_FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE !== 'false',

  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL_CHAT: process.env.OPENAI_MODEL_CHAT || 'gpt-4o-mini',
  OPENAI_MODEL_EMBEDDING: process.env.OPENAI_MODEL_EMBEDDING || 'text-embedding-3-small',
} as const;
