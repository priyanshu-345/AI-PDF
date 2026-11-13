import { Router } from 'express';
import authRoutes from './auth.routes';
import documentRoutes from './document.routes';
import jobRoutes from './job.routes';
import pdfToolsRoutes from './pdf-tools.routes';
import chatRoutes from './chat.routes';
import aiRoutes from './ai.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/documents', documentRoutes);
apiRouter.use('/jobs', jobRoutes);
apiRouter.use('/pdf-tools', pdfToolsRoutes);
apiRouter.use('/chat', chatRoutes);
apiRouter.use('/ai', aiRoutes);

export default apiRouter;
