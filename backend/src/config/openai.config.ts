import OpenAI from 'openai';
import { ENV } from './env.config';

export const openai = new OpenAI({
  apiKey: ENV.OPENAI_API_KEY || 'sk-dummy-key-for-development',
});

export const OPENAI_MODELS = {
  CHAT: ENV.OPENAI_MODEL_CHAT,
  EMBEDDING: ENV.OPENAI_MODEL_EMBEDDING,
} as const;
