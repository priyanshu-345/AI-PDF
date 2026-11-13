import { prisma } from '@ai-pdf/database';
import { NotFoundError, ForbiddenError } from '@ai-pdf/shared';
import { StorageService } from './storage.service';
import { QueueService } from './queue.service';

export interface ConfirmUploadInput {
  storageKey: string;
  originalName: string;
  fileSizeBytes: number;
  mimeType?: string;
}

export class DocumentService {
  /**
   * Finalizes document upload after client uploads directly to S3
   */
  public static async confirmUpload(userId: string, input: ConfirmUploadInput) {
    const document = await prisma.document.create({
      data: {
        userId,
        fileName: input.originalName,
        originalName: input.originalName,
        mimeType: input.mimeType || 'application/pdf',
        fileSizeBytes: input.fileSizeBytes,
        storageKey: input.storageKey,
      },
    });

    // Increment user's storage consumption
    await prisma.user.update({
      where: { id: userId },
      data: {
        storageUsedBytes: {
          increment: BigInt(input.fileSizeBytes),
        },
      },
    });

    // Create background indexing job
    const job = await prisma.processingJobs.create({
      data: {
        userId,
        documentId: document.id,
        jobType: 'INDEX_RAG',
        status: 'PENDING',
        progress: 0,
      },
    });

    // Dispatch background worker task
    await QueueService.dispatchRAGIndexingJob(document.id, input.storageKey, userId);

    return {
      document,
      jobId: job.id,
    };
  }

  /**
   * List user's documents with pagination and search
   */
  public static async listUserDocuments(
    userId: string,
    query?: string,
    page = 1,
    limit = 20
  ) {
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query && query.trim()) {
      where.OR = [
        { fileName: { contains: query, mode: 'insensitive' } },
        { summary: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.document.count({ where }),
    ]);

    // Attach signed preview URLs to the documents
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const downloadUrl = await StorageService.generateDownloadUrl(doc.storageKey);
        return {
          ...doc,
          downloadUrl,
        };
      })
    );

    return {
      documents: documentsWithUrls,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single document details with safe signed stream URL
   */
  public static async getDocumentById(userId: string, documentId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        pages: {
          select: {
            id: true,
            pageNumber: true,
            ocrProcessed: true,
            previewImageUrl: true,
          },
          orderBy: { pageNumber: 'asc' },
        },
      },
    });

    if (!document) {
      throw new NotFoundError('Document');
    }

    if (document.userId !== userId) {
      throw new ForbiddenError('You do not have access to this document');
    }

    const downloadUrl = await StorageService.generateDownloadUrl(document.storageKey);

    return {
      ...document,
      downloadUrl,
    };
  }

  /**
   * Deletes document from PostgreSQL and AWS S3
   */
  public static async deleteDocument(userId: string, documentId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError('Document');
    }

    if (document.userId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this document');
    }

    // Delete from S3 storage
    await StorageService.deleteObject(document.storageKey);

    // Delete from PostgreSQL
    await prisma.document.delete({
      where: { id: documentId },
    });

    // Decrement user storage usage
    await prisma.user.update({
      where: { id: userId },
      data: {
        storageUsedBytes: {
          decrement: BigInt(document.fileSizeBytes),
        },
      },
    });

    return { success: true };
  }
}
