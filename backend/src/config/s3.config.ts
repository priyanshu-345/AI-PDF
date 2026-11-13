import { S3Client } from '@aws-sdk/client-s3';
import { ENV } from './env.config';

export const s3Client = new S3Client({
  region: ENV.AWS_REGION,
  endpoint: ENV.S3_ENDPOINT || undefined,
  forcePathStyle: ENV.S3_FORCE_PATH_STYLE,
  credentials: {
    accessKeyId: ENV.S3_ACCESS_KEY,
    secretAccessKey: ENV.S3_SECRET_KEY,
  },
});

export const S3_BUCKET = ENV.S3_BUCKET_NAME;
