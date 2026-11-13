import { Job } from 'bullmq';
import { prisma } from '@ai-pdf/database';
import { downloadS3Buffer } from '../config/s3.config';
import { OCREngine } from '../engines/ocr.engine';

export interface OCRJobPayload {
  jobId: string;
  documentId: string;
  pageNumber: number;
  imageStorageKey: string;
  language?: string;
}

export async function processOCRJob(job: Job<OCRJobPayload>): Promise<any> {
  const { data } = job;
  console.log(`🔍 [OCR Processor] Processing OCR for Document: ${data.documentId}, Page: ${data.pageNumber}`);

  try {
    // 1. Mark job as PROCESSING
    await prisma.processingJobs.update({
      where: { id: data.jobId },
      data: { status: 'PROCESSING', progress: 10 },
    });
    await job.updateProgress(10);

    // 2. Download page image buffer from S3
    const imageBuffer = await downloadS3Buffer(data.imageStorageKey);
    await job.updateProgress(30);

    // 3. Perform Tesseract recognition
    const ocrResult = await OCREngine.recognizeImage(imageBuffer, {
      language: data.language || 'eng',
      onProgress: (percent) => {
        job.updateProgress(30 + Math.round(percent * 0.5));
      },
    });

    await job.updateProgress(85);

    // 4. Update or Upsert DocumentPage in PostgreSQL
    await prisma.documentPage.upsert({
      where: {
        documentId_pageNumber: {
          documentId: data.documentId,
          pageNumber: data.pageNumber,
        },
      },
      update: {
        extractedText: ocrResult.text,
        ocrProcessed: true,
      },
      create: {
        documentId: data.documentId,
        pageNumber: data.pageNumber,
        extractedText: ocrResult.text,
        ocrProcessed: true,
      },
    });

    // 5. Update ProcessingJobs status
    await prisma.processingJobs.update({
      where: { id: data.jobId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        resultPayload: {
          documentId: data.documentId,
          pageNumber: data.pageNumber,
          confidence: ocrResult.confidence,
          textLength: ocrResult.text.length,
        },
      },
    });

    await job.updateProgress(100);
    console.log(`✅ [OCR Processor] Completed page ${data.pageNumber} with confidence ${ocrResult.confidence}%`);

    return {
      success: true,
      confidence: ocrResult.confidence,
      textLength: ocrResult.text.length,
    };
  } catch (error: any) {
    console.error(`❌ [OCR Processor] Job ${job.id} failed:`, error.message);

    await prisma.processingJobs.update({
      where: { id: data.jobId },
      data: {
        status: 'FAILED',
        errorMessage: error.message || 'OCR processing failed',
      },
    });

    throw error;
  }
}
