import { createPDFToolsWorker } from './queues/pdf.queue';
import { createOCRWorker } from './queues/ocr.queue';
import { createRAGIndexingWorker } from './queues/indexing.queue';

console.log('⚡ [Worker Engine] Starting PDF manipulation, OCR, and RAG Indexing background workers...');

const pdfWorker = createPDFToolsWorker();
const ocrWorker = createOCRWorker();
const ragWorker = createRAGIndexingWorker();

console.log('✅ [Worker Engine] Workers actively listening for jobs on Redis queues:');
console.log('   - pdf-tools-queue (Concurrency: 4)');
console.log('   - ocr-processing-queue (Concurrency: 2)');
console.log('   - rag-indexing-queue (Concurrency: 3)');

// Graceful Shutdown
const shutdown = async (signal: string) => {
  console.log(`\n🛑 [Worker Engine] Received ${signal}. Closing workers gracefully...`);
  await Promise.all([pdfWorker.close(), ocrWorker.close(), ragWorker.close()]);
  console.log('👋 [Worker Engine] All workers stopped cleanly.');
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
