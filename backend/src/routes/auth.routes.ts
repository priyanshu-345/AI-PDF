import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rate-limiter';
import { validateBody } from '../middleware/validation.middleware';
import { registerSchema, loginSchema } from '@ai-pdf/shared';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), AuthController.register);
router.post('/login', authLimiter, validateBody(loginSchema), AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.get('/me', authenticate, AuthController.getMe);

export default router;
