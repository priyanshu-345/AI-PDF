import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';
import { Readable } from 'stream';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

export const S3_BUCKET = process.env.S3_BUCKET_NAME || 'ai-pdf-toolkit-documents';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT || undefined,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
  },
});

/**
 * Downloads an S3 object as a memory Buffer
 */
export async function downloadS3Buffer(storageKey: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: storageKey,
  });

  const response = await s3Client.send(command);
  const stream = response.Body as Readable;

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Uploads a memory Buffer to S3
 */
export async function uploadS3Buffer(
  storageKey: string,
  buffer: Buffer,
  contentType = 'application/pdf'
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: storageKey,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
}
