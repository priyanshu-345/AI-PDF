import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadLimiter } from '../middleware/rate-limiter';
import { validateBody } from '../middleware/validation.middleware';
import { uploadUrlSchema } from '@ai-pdf/shared';

const router = Router();

// Protect all document endpoints with JWT authentication
router.use(authenticate);

// Request a signed S3 upload URL
router.post('/upload-url', uploadLimiter, validateBody(uploadUrlSchema), DocumentController.getUploadUrl);

// Confirm S3 upload completion
router.post('/confirm', DocumentController.confirmUpload);

// List user's documents
router.get('/', DocumentController.listDocuments);

// Get single document by ID
router.get('/:id', DocumentController.getDocumentById);

// Delete document
router.delete('/:id', DocumentController.deleteDocument);

export default router;
