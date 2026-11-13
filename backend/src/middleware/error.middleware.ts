import { Request, Response, NextFunction } from 'express';
import { AppError } from '@ai-pdf/shared';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('💥 [Server Error]:', err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
