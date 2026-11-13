import { Router } from 'express';
import { JobController } from '../controllers/job.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protect job status endpoint with JWT authentication
router.use(authenticate);

// Get real-time status of a background processing job
router.get('/:id', JobController.getStatus);

export default router;
