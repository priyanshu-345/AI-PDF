import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { aiChatSchema } from '@ai-pdf/shared';

const router = Router();

// Protect chat endpoint with JWT authentication
router.use(authenticate);

// Conversational RAG Chat endpoint
router.post('/', validateBody(aiChatSchema), ChatController.chat);

export default router;
