import { Worker, Queue } from 'bullmq';
import { redisConnectionOptions } from '../config/redis.config';
import { RAGIndexingProcessor, RAGIndexJobPayload } from '../processors/rag-indexing.processor';

export const RAG_INDEXING_QUEUE_NAME = 'rag-indexing-queue';

export const ragIndexingQueue = new Queue<RAGIndexJobPayload>(RAG_INDEXING_QUEUE_NAME, {
  connection: redisConnectionOptions,
});

export function createRAGIndexingWorker(): Worker<RAGIndexJobPayload> {
  const worker = new Worker<RAGIndexJobPayload>(
    RAG_INDEXING_QUEUE_NAME,
    async (job) => RAGIndexingProcessor.process(job),
    {
      connection: redisConnectionOptions,
      concurrency: 3, // 3 parallel document indexing workers
    }
  );

  worker.on('completed', (job) => {
    console.log(`🎉 [rag-indexing-queue] Document indexing job ${job.id} finished successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`💥 [rag-indexing-queue] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
