import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { PDFToolsService } from '../services/pdf-tools.service';

export class PDFToolsController {
  public static async merge(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentIds, outputFileName } = req.body;
      const result = await PDFToolsService.mergePDFs(req.user!.id, documentIds, outputFileName);
      res.status(202).json({
        success: true,
        message: 'Merge task enqueued successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async split(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId, pageRanges, outputFileName } = req.body;
      const result = await PDFToolsService.splitPDF(req.user!.id, documentId, pageRanges, outputFileName);
      res.status(202).json({
        success: true,
        message: 'Split task enqueued successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async compress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId, qualityTier } = req.body;
      const result = await PDFToolsService.compressPDF(req.user!.id, documentId, qualityTier);
      res.status(202).json({
        success: true,
        message: 'Compression task enqueued successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async rotate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId, pageNumbers, rotationAngle } = req.body;
      const result = await PDFToolsService.rotatePDF(req.user!.id, documentId, pageNumbers, rotationAngle);
      res.status(202).json({
        success: true,
        message: 'Rotation task enqueued successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async watermark(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId, text, opacity, fontSize, colorHex, rotationDegrees } = req.body;
      const result = await PDFToolsService.watermarkPDF(
        req.user!.id,
        documentId,
        text,
        opacity,
        fontSize,
        colorHex,
        rotationDegrees
      );
      res.status(202).json({
        success: true,
        message: 'Watermark task enqueued successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
