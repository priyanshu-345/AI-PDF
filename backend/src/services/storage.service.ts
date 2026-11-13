import crypto from 'crypto';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prisma } from '@ai-pdf/database';
import { ValidationError, ForbiddenError } from '@ai-pdf/shared';
import { s3Client, S3_BUCKET } from '../config/s3.config';

export class StorageService {
  /**
   * Generates a signed PUT URL for the mobile app to upload directly to S3/MinIO
   */
  public static async generateUploadUrl(
    userId: string,
    fileName: string,
    fileSizeBytes: number,
    mimeType = 'application/pdf'
  ) {
    if (mimeType !== 'application/pdf') {
      throw new ValidationError('Only application/pdf files are supported for document upload');
    }

    // Verify user storage limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { storageUsedBytes: true, storageQuotaBytes: true },
    });

    if (!user) {
      throw new ValidationError('User not found');
    }

    const projectedUsage = user.storageUsedBytes + BigInt(fileSizeBytes);
    if (projectedUsage > user.storageQuotaBytes) {
      throw new ForbiddenError(
        'Upload exceeds your cloud storage quota. Please upgrade your subscription tier.'
      );
    }

    // Clean filename and generate unique S3 key
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageKey = `users/${userId}/documents/${crypto.randomUUID()}-${sanitizedName}`;

    // S3 PutObject Command
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: storageKey,
      ContentType: mimeType,
      Metadata: {
        userId,
        originalName: fileName,
      },
    });

    // 15-minute expiration for secure upload session
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    return {
      uploadUrl,
      storageKey,
      expiresInSeconds: 900,
    };
  }

  /**
   * Generates a temporary signed GET URL to stream or download private PDF from S3
   */
  public static async generateDownloadUrl(storageKey: string, expiresInSeconds = 3600) {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: storageKey,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  }

  /**
   * Removes an object from S3
   */
  public static async deleteObject(storageKey: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: storageKey,
      });
      await s3Client.send(command);
    } catch (err) {
      console.error(`⚠️ [S3 Storage] Error deleting key ${storageKey}:`, err);
    }
  }
}
