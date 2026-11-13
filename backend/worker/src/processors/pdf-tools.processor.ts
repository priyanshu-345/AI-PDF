import { Job } from 'bullmq';
import crypto from 'crypto';
import { prisma } from '@ai-pdf/database';
import { downloadS3Buffer, uploadS3Buffer } from '../config/s3.config';
import { PDFManipulationEngine } from '../engines/pdf-manipulation.engine';

export interface PDFToolJobPayload {
  jobId: string;
  userId: string;
  operation: 'MERGE' | 'SPLIT' | 'COMPRESS' | 'ROTATE' | 'WATERMARK' | 'PAGE_NUMBERS';
  documentIds?: string[];
  documentId?: string;
  storageKeys?: string[];
  storageKey?: string;
  outputName: string;
  pageRanges?: string;
  quality?: 'LOW' | 'MEDIUM' | 'HIGH';
  pageNumbers?: number[];
  rotationAngle?: 90 | 180 | 270;
  watermarkText?: string;
  watermarkOpacity?: number;
  watermarkFontSize?: number;
  watermarkColorHex?: string;
  watermarkRotation?: number;
}

export async function processPDFToolJob(job: Job<PDFToolJobPayload>): Promise<any> {
  const { data } = job;
  console.log(`🚀 [PDF Tools Processor] Starting Job ${job.id} - Operation: ${data.operation}`);

  try {
    // 1. Mark job as PROCESSING
    await prisma.processingJobs.update({
      where: { id: data.jobId },
      data: { status: 'PROCESSING', progress: 10 },
    });
    await job.updateProgress(10);

    let outputBuffer: Buffer;

    // 2. Perform requested operation
    switch (data.operation) {
      case 'MERGE': {
        if (!data.storageKeys || data.storageKeys.length < 2) {
          throw new Error('At least 2 storage keys required for MERGE operation');
        }

        const inputBuffers: Buffer[] = [];
        for (let i = 0; i < data.storageKeys.length; i++) {
          const buf = await downloadS3Buffer(data.storageKeys[i]);
          inputBuffers.push(buf);
          await job.updateProgress(10 + Math.round((i / data.storageKeys.length) * 30));
        }

        await job.updateProgress(50);
        outputBuffer = await PDFManipulationEngine.mergePDFs(inputBuffers);
        break;
      }

      case 'SPLIT': {
        if (!data.storageKey || !data.pageRanges) {
          throw new Error('Missing storageKey or pageRanges for SPLIT operation');
        }
        const srcBuffer = await downloadS3Buffer(data.storageKey);
        await job.updateProgress(50);
        outputBuffer = await PDFManipulationEngine.splitPDF(srcBuffer, data.pageRanges);
        break;
      }

      case 'COMPRESS': {
        if (!data.storageKey) throw new Error('Missing storageKey for COMPRESS operation');
        const srcBuffer = await downloadS3Buffer(data.storageKey);
        await job.updateProgress(50);
        outputBuffer = await PDFManipulationEngine.compressPDF(srcBuffer, data.quality);
        break;
      }

      case 'ROTATE': {
        if (!data.storageKey) throw new Error('Missing storageKey for ROTATE operation');
        const srcBuffer = await downloadS3Buffer(data.storageKey);
        await job.updateProgress(50);
        outputBuffer = await PDFManipulationEngine.rotatePDF(
          srcBuffer,
          data.pageNumbers || [],
          data.rotationAngle || 90
        );
        break;
      }

      case 'WATERMARK': {
        if (!data.storageKey || !data.watermarkText) {
          throw new Error('Missing storageKey or watermarkText for WATERMARK operation');
        }
        const srcBuffer = await downloadS3Buffer(data.storageKey);
        await job.updateProgress(50);
        outputBuffer = await PDFManipulationEngine.addWatermark(srcBuffer, {
          text: data.watermarkText,
          opacity: data.watermarkOpacity,
          fontSize: data.watermarkFontSize,
          colorHex: data.watermarkColorHex,
          rotationDegrees: data.watermarkRotation,
        });
        break;
      }

      case 'PAGE_NUMBERS': {
        if (!data.storageKey) throw new Error('Missing storageKey for PAGE_NUMBERS operation');
        const srcBuffer = await downloadS3Buffer(data.storageKey);
        await job.updateProgress(50);
        outputBuffer = await PDFManipulationEngine.addPageNumbers(srcBuffer);
        break;
      }

      default:
        throw new Error(`Unsupported PDF operation: ${data.operation}`);
    }

    await job.updateProgress(80);

    // 3. Save generated PDF to S3
    const sanitizedOutputName = data.outputName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const outputKey = `users/${data.userId}/generated/${crypto.randomUUID()}-${sanitizedOutputName}`;

    await uploadS3Buffer(outputKey, outputBuffer, 'application/pdf');

    // 4. Record GeneratedFile in database
    const generatedFile = await prisma.generatedFile.create({
      data: {
        documentId: data.documentId || null,
        outputName: data.outputName,
        fileSizeBytes: outputBuffer.length,
        storageKey: outputKey,
        mimeType: 'application/pdf',
      },
    });

    // 5. Update ProcessingJobs to COMPLETED
    await prisma.processingJobs.update({
      where: { id: data.jobId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        resultPayload: {
          generatedFileId: generatedFile.id,
          storageKey: outputKey,
          fileSizeBytes: outputBuffer.length,
          outputName: data.outputName,
        },
      },
    });

    await job.updateProgress(100);
    console.log(`✅ [PDF Tools Processor] Successfully finished Job ${job.id}`);

    return {
      success: true,
      generatedFileId: generatedFile.id,
      storageKey: outputKey,
    };
  } catch (error: any) {
    console.error(`❌ [PDF Tools Processor] Job ${job.id} failed:`, error.message);

    // Record failure in database
    await prisma.processingJobs.update({
      where: { id: data.jobId },
      data: {
        status: 'FAILED',
        errorMessage: error.message || 'PDF manipulation failed',
      },
    });

    throw error;
  }
}
