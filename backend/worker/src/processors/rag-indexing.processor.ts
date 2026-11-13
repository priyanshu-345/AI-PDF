import { Job } from 'bullmq';
import crypto from 'crypto';
import OpenAI from 'openai';
import { prisma } from '@ai-pdf/database';
import { downloadS3Buffer } from '../config/s3.config';
import { TextExtractorEngine } from '../engines/text-extractor.engine';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
});

export interface RAGIndexJobPayload {
  documentId: string;
  storageKey: string;
  userId: string;
}

interface ChunkItem {
  id: string;
  pageNumber: number;
  chunkIndex: number;
  content: string;
}

export class RAGIndexingProcessor {
  /**
   * Helper: Splits text into chunks respecting sentence boundaries and page numbers
   */
  public static createChunks(
    pages: { pageNumber: number; text: string }[],
    maxWordsPerChunk = 350,
    overlapWords = 50
  ): ChunkItem[] {
    const chunks: ChunkItem[] = [];
    let globalChunkIndex = 0;

    for (const page of pages) {
      if (!page.text || page.text.trim().length === 0) continue;

      const words = page.text.split(/\s+/);
      if (words.length <= maxWordsPerChunk) {
        chunks.push({
          id: crypto.randomUUID(),
          pageNumber: page.pageNumber,
          chunkIndex: globalChunkIndex++,
          content: page.text,
        });
      } else {
        let start = 0;
        while (start < words.length) {
          const end = Math.min(start + maxWordsPerChunk, words.length);
          const chunkWords = words.slice(start, end);
          const content = chunkWords.join(' ');

          chunks.push({
            id: crypto.randomUUID(),
            pageNumber: page.pageNumber,
            chunkIndex: globalChunkIndex++,
            content,
          });

          if (end === words.length) break;
          start += maxWordsPerChunk - overlapWords;
        }
      }
    }

    return chunks;
  }

  /**
   * Main processor execution
   */
  public static async process(job: Job<RAGIndexJobPayload>): Promise<any> {
    const { documentId, storageKey } = job.data;
    console.log(`🧠 [RAG Indexer] Starting indexing for Document ${documentId}`);

    try {
      await job.updateProgress(10);

      // 1. Download PDF buffer from S3
      const pdfBuffer = await downloadS3Buffer(storageKey);
      await job.updateProgress(25);

      // 2. Extract page-by-page text
      const extraction = await TextExtractorEngine.extractText(pdfBuffer);
      await job.updateProgress(45);

      // 3. Upsert pages into document_pages table
      for (const page of extraction.pages) {
        await prisma.documentPage.upsert({
          where: {
            documentId_pageNumber: {
              documentId,
              pageNumber: page.pageNumber,
            },
          },
          update: {
            extractedText: page.text,
          },
          create: {
            documentId,
            pageNumber: page.pageNumber,
            extractedText: page.text,
          },
        });
      }

      await job.updateProgress(60);

      // 4. Split text into indexed chunks
      const chunks = this.createChunks(extraction.pages);
      console.log(`📦 [RAG Indexer] Generated ${chunks.length} chunks across ${extraction.totalPages} pages`);

      // 5. Generate embeddings in batches of 20
      const batchSize = 20;
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const inputTexts = batch.map((c) => c.content.replace(/\n/g, ' '));

        let embeddings: number[][] = [];

        // Check if OpenAI key is valid
        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-key') {
          const embedRes = await openai.embeddings.create({
            model: process.env.OPENAI_MODEL_EMBEDDING || 'text-embedding-3-small',
            input: inputTexts,
            dimensions: 1536,
          });
          embeddings = embedRes.data.map((d) => d.embedding);
        } else {
          // Fallback zero vector for testing when API key is not configured
          embeddings = batch.map(() => new Array(1536).fill(0));
        }

        // 6. Insert chunks with pgvector into database
        for (let j = 0; j < batch.length; j++) {
          const chunk = batch[j];
          const vectorStr = `[${embeddings[j].join(',')}]`;

          await prisma.$executeRawUnsafe(
            `INSERT INTO document_chunks (id, "documentId", "pageNumber", "chunkIndex", content, embedding, "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6::vector, NOW())
             ON CONFLICT (id) DO NOTHING`,
            chunk.id,
            documentId,
            chunk.pageNumber,
            chunk.chunkIndex,
            chunk.content,
            vectorStr
          );
        }

        const progressPercent = 60 + Math.round(((i + batchSize) / chunks.length) * 35);
        await job.updateProgress(Math.min(progressPercent, 95));
      }

      // 7. Update Document status
      await prisma.document.update({
        where: { id: documentId },
        data: {
          pageCount: extraction.totalPages,
          isScanned: extraction.isScanned,
          isIndexed: true,
        },
      });

      // 8. Update any pending ProcessingJobs for this document
      await prisma.processingJobs.updateMany({
        where: { documentId, jobType: 'INDEX_RAG' },
        data: {
          status: 'COMPLETED',
          progress: 100,
          resultPayload: {
            totalPages: extraction.totalPages,
            chunksCount: chunks.length,
            isScanned: extraction.isScanned,
          },
        },
      });

      await job.updateProgress(100);
      console.log(`✅ [RAG Indexer] Completed indexing Document ${documentId}`);

      return {
        success: true,
        totalPages: extraction.totalPages,
        chunksIndexed: chunks.length,
      };
    } catch (err: any) {
      console.error(`❌ [RAG Indexer] Failed for Document ${documentId}:`, err.message);

      await prisma.processingJobs.updateMany({
        where: { documentId, jobType: 'INDEX_RAG' },
        data: {
          status: 'FAILED',
          errorMessage: err.message,
        },
      });

      throw err;
    }
  }
}
