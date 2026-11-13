import { Worker, Queue } from 'bullmq';
import { redisConnectionOptions } from '../config/redis.config';
import { processPDFToolJob, PDFToolJobPayload } from '../processors/pdf-tools.processor';

export const PDF_TOOLS_QUEUE_NAME = 'pdf-tools-queue';

export const pdfToolsQueue = new Queue<PDFToolJobPayload>(PDF_TOOLS_QUEUE_NAME, {
  connection: redisConnectionOptions,
});

export function createPDFToolsWorker(): Worker<PDFToolJobPayload> {
  const worker = new Worker<PDFToolJobPayload>(
    PDF_TOOLS_QUEUE_NAME,
    async (job) => processPDFToolJob(job),
    {
      connection: redisConnectionOptions,
      concurrency: 4, // 4 parallel PDF manipulation jobs
    }
  );

  worker.on('completed', (job) => {
    console.log(`🎉 [pdf-tools-queue] Job ${job.id} marked completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`💥 [pdf-tools-queue] Job ${job?.id} failed with error:`, err.message);
  });

  return worker;
}
