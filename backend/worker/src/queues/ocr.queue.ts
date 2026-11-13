import { Worker, Queue } from 'bullmq';
import { redisConnectionOptions } from '../config/redis.config';
import { processOCRJob, OCRJobPayload } from '../processors/ocr.processor';

export const OCR_QUEUE_NAME = 'ocr-processing-queue';

export const ocrQueue = new Queue<OCRJobPayload>(OCR_QUEUE_NAME, {
  connection: redisConnectionOptions,
});

export function createOCRWorker(): Worker<OCRJobPayload> {
  const worker = new Worker<OCRJobPayload>(
    OCR_QUEUE_NAME,
    async (job) => processOCRJob(job),
    {
      connection: redisConnectionOptions,
      concurrency: 2, // 2 parallel OCR tasks to balance CPU
    }
  );

  worker.on('completed', (job) => {
    console.log(`🎉 [ocr-processing-queue] Job ${job.id} marked completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`💥 [ocr-processing-queue] Job ${job?.id} failed with error:`, err.message);
  });

  return worker;
}
