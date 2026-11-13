import { Router } from 'express';
import { PDFToolsController } from '../controllers/pdf-tools.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { 
  mergePDFSchema, 
  splitPDFSchema, 
  rotatePDFSchema 
} from '@ai-pdf/shared';

const router = Router();

// Protect all PDF operations with authentication
router.use(authenticate);

router.post('/merge', validateBody(mergePDFSchema), PDFToolsController.merge);
router.post('/split', validateBody(splitPDFSchema), PDFToolsController.split);
router.post('/compress', PDFToolsController.compress);
router.post('/rotate', validateBody(rotatePDFSchema), PDFToolsController.rotate);
router.post('/watermark', PDFToolsController.watermark);

export default router;
