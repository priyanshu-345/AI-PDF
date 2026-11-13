import { prisma } from '@ai-pdf/database';
import { NotFoundError, ForbiddenError } from '@ai-pdf/shared';
import { pdfToolsQueue } from './queue.service';

export class PDFToolsService {
  /**
   * Dispatches Merge PDF task
   */
  public static async mergePDFs(userId: string, documentIds: string[], outputFileName: string) {
    const documents = await prisma.document.findMany({
      where: { id: { in: documentIds }, userId },
      select: { id: true, storageKey: true, fileSizeBytes: true },
    });

    if (documents.length !== documentIds.length) {
      throw new ForbiddenError('One or more selected documents do not exist or do not belong to you');
    }

    const job = await prisma.processingJobs.create({
      data: {
        userId,
        jobType: 'MERGE',
        status: 'PENDING',
        progress: 0,
      },
    });

    await pdfToolsQueue.add('merge-pdfs', {
      jobId: job.id,
      userId,
      operation: 'MERGE',
      documentIds,
      storageKeys: documents.map((d) => d.storageKey),
      outputName: outputFileName.endsWith('.pdf') ? outputFileName : `${outputFileName}.pdf`,
    });

    return { jobId: job.id };
  }

  /**
   * Dispatches Split PDF task
   */
  public static async splitPDF(
    userId: string,
    documentId: string,
    pageRanges: string,
    outputFileName: string
  ) {
    const document = await prisma.document.findUnique({
      where: { id: documentId, userId },
      select: { id: true, storageKey: true },
    });

    if (!document) {
      throw new NotFoundError('Document');
    }

    const job = await prisma.processingJobs.create({
      data: {
        userId,
        documentId,
        jobType: 'SPLIT',
        status: 'PENDING',
        progress: 0,
      },
    });

    await pdfToolsQueue.add('split-pdf', {
      jobId: job.id,
      userId,
      documentId,
      operation: 'SPLIT',
      storageKey: document.storageKey,
      pageRanges,
      outputName: outputFileName.endsWith('.pdf') ? outputFileName : `${outputFileName}.pdf`,
    });

    return { jobId: job.id };
  }

  /**
   * Dispatches Compress PDF task
   */
  public static async compressPDF(
    userId: string,
    documentId: string,
    quality: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
  ) {
    const document = await prisma.document.findUnique({
      where: { id: documentId, userId },
      select: { id: true, fileName: true, storageKey: true },
    });

    if (!document) {
      throw new NotFoundError('Document');
    }

    const job = await prisma.processingJobs.create({
      data: {
        userId,
        documentId,
        jobType: 'COMPRESS',
        status: 'PENDING',
        progress: 0,
      },
    });

    const outputName = `compressed-${document.fileName}`;

    await pdfToolsQueue.add('compress-pdf', {
      jobId: job.id,
      userId,
      documentId,
      operation: 'COMPRESS',
      storageKey: document.storageKey,
      quality,
      outputName,
    });

    return { jobId: job.id };
  }

  /**
   * Dispatches Rotate PDF task
   */
  public static async rotatePDF(
    userId: string,
    documentId: string,
    pageNumbers: number[] = [],
    rotationAngle: 90 | 180 | 270 = 90
  ) {
    const document = await prisma.document.findUnique({
      where: { id: documentId, userId },
      select: { id: true, fileName: true, storageKey: true },
    });

    if (!document) {
      throw new NotFoundError('Document');
    }

    const job = await prisma.processingJobs.create({
      data: {
        userId,
        documentId,
        jobType: 'ROTATE',
        status: 'PENDING',
        progress: 0,
      },
    });

    const outputName = `rotated-${document.fileName}`;

    await pdfToolsQueue.add('rotate-pdf', {
      jobId: job.id,
      userId,
      documentId,
      operation: 'ROTATE',
      storageKey: document.storageKey,
      pageNumbers,
      rotationAngle,
      outputName,
    });

    return { jobId: job.id };
  }

  /**
   * Dispatches Watermark PDF task
   */
  public static async watermarkPDF(
    userId: string,
    documentId: string,
    text: string,
    opacity = 0.25,
    fontSize = 48,
    colorHex = '#6366F1',
    rotation = 45
  ) {
    const document = await prisma.document.findUnique({
      where: { id: documentId, userId },
      select: { id: true, fileName: true, storageKey: true },
    });

    if (!document) {
      throw new NotFoundError('Document');
    }

    const job = await prisma.processingJobs.create({
      data: {
        userId,
        documentId,
        jobType: 'WATERMARK',
        status: 'PENDING',
        progress: 0,
      },
    });

    const outputName = `watermarked-${document.fileName}`;

    await pdfToolsQueue.add('watermark-pdf', {
      jobId: job.id,
      userId,
      documentId,
      operation: 'WATERMARK',
      storageKey: document.storageKey,
      watermarkText: text,
      watermarkOpacity: opacity,
      watermarkFontSize: fontSize,
      watermarkColorHex: colorHex,
      watermarkRotation: rotation,
      outputName,
    });

    return { jobId: job.id };
  }
}
