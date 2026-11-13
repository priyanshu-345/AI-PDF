import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@ai-pdf/database';
import { UnauthorizedError, ForbiddenError } from '@ai-pdf/shared';
import { ENV } from '../config/env.config';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed Authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Access token is missing');
    }

    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(token, ENV.JWT_ACCESS_SECRET) as jwt.JwtPayload;
    } catch (jwtErr) {
      throw new UnauthorizedError('Invalid or expired access token');
    }

    if (!payload.sub) {
      throw new UnauthorizedError('Invalid token payload');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, tier: true },
    });

    if (!user) {
      throw new UnauthorizedError('User account not found or deactivated');
    }

    req.user = user as AuthenticatedUser;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (allowedRole: 'USER' | 'ADMIN') => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (req.user.role !== allowedRole && req.user.role !== 'ADMIN') {
      return next(new ForbiddenError('You lack permissions to perform this action'));
    }
    next();
  };
};
