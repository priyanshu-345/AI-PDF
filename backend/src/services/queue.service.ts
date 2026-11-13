import { Queue } from 'bullmq';
import { redisConnectionOptions } from '../config/redis.config';

export const ragIndexingQueue = new Queue('rag-indexing-queue', {
  connection: redisConnectionOptions,
});

export const pdfToolsQueue = new Queue('pdf-tools-queue', {
  connection: redisConnectionOptions,
});

export const ocrProcessingQueue = new Queue('ocr-processing-queue', {
  connection: redisConnectionOptions,
});

export class QueueService {
  public static async dispatchRAGIndexingJob(documentId: string, storageKey: string, userId: string) {
    try {
      return await ragIndexingQueue.add(
        'index-document',
        { documentId, storageKey, userId },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 100,
          removeOnFail: 500,
        }
      );
    } catch (err) {
      console.warn('⚠️ [BullMQ] Redis dispatch notice (job recorded in database):', (err as Error).message);
      return null;
    }
  }
}
