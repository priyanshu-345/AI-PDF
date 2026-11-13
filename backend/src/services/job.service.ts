import { prisma } from '@ai-pdf/database';
import { NotFoundError, ForbiddenError } from '@ai-pdf/shared';

export class JobService {
  /**
   * Retrieves real-time status, progress, and payload of any background job
   */
  public static async getJobStatus(userId: string, jobId: string) {
    const job = await prisma.processingJobs.findUnique({
      where: { id: jobId },
      include: {
        document: {
          select: {
            id: true,
            fileName: true,
            pageCount: true,
            isIndexed: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundError('Processing Job');
    }

    if (job.userId !== userId) {
      throw new ForbiddenError('You do not have permission to view this job');
    }

    return {
      id: job.id,
      jobType: job.jobType,
      status: job.status,
      progress: job.progress,
      errorMessage: job.errorMessage,
      resultPayload: job.resultPayload,
      document: job.document,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    };
  }
}
