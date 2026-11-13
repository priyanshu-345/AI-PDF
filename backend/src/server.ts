import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env.config';
import { apiLimiter } from './middleware/rate-limiter';
import { errorHandler } from './middleware/error.middleware';
import apiRouter from './routes';

const app = express();

// Security Headers & Parsing
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiting
app.use('/api', apiLimiter);

// Liveness & Health Probe
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'AI PDF Toolkit API Gateway',
    timestamp: new Date().toISOString(),
  });
});

// Mount Central API Router
app.use('/api/v1', apiRouter);

// Centralized Error Handling Middleware
app.use(errorHandler);

app.listen(ENV.PORT, () => {
  console.log(`🚀 [API Gateway] Server running securely at http://localhost:${ENV.PORT}/api/v1`);
});

export default app;
