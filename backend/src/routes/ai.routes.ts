import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protect all AI Lab features with authentication
router.use(authenticate);

// 1. AI Summarizer
router.post('/summarize', AIController.summarize);

// 2. Document Translation
router.post('/translate', AIController.translate);

// 3. Quiz / Flashcard Generator
router.post('/quiz', AIController.quiz);

// 4. Grammar & Proofreading
router.post('/grammar', AIController.grammar);

// 5. Semantic Document Comparison
router.post('/compare', AIController.compare);

export default router;
