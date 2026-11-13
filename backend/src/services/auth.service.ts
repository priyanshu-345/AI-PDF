import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@ai-pdf/database';
import { AppError, UnauthorizedError, ValidationError } from '@ai-pdf/shared';
import { ENV } from '../config/env.config';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export class AuthService {
  private static generateTokens(userId: string, email: string, role: string) {
    const payload: TokenPayload = { sub: userId, email, role };

    const accessToken = jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  public static async register(email: string, password: string, fullName?: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ValidationError('An account with this email address already exists');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: fullName || null,
        tier: 'FREE',
        storageQuotaBytes: BigInt(104857600), // 100MB
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        tier: true,
        storageUsedBytes: true,
        storageQuotaBytes: true,
        createdAt: true,
      },
    });

    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        ...user,
        storageUsedBytes: user.storageUsedBytes.toString(),
        storageQuotaBytes: user.storageQuotaBytes.toString(),
        createdAt: user.createdAt.toISOString(),
      },
      ...tokens,
    };
  }

  public static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        tier: user.tier,
        storageUsedBytes: user.storageUsedBytes.toString(),
        storageQuotaBytes: user.storageQuotaBytes.toString(),
        createdAt: user.createdAt.toISOString(),
      },
      ...tokens,
    };
  }

  public static async refreshAccessToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET) as TokenPayload;
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        throw new UnauthorizedError('User account not found');
      }

      const tokens = this.generateTokens(user.id, user.email, user.role);
      return tokens;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  public static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        tier: true,
        storageUsedBytes: true,
        storageQuotaBytes: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      ...user,
      storageUsedBytes: user.storageUsedBytes.toString(),
      storageQuotaBytes: user.storageQuotaBytes.toString(),
      createdAt: user.createdAt.toISOString(),
    };
  }
}
