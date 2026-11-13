import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { JobService } from '../services/job.service';

export class JobController {
  /**
   * Returns the progress and execution state of a background job
   */
  public static async getStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const status = await JobService.getJobStatus(req.user!.id, id);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }
}
