import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AILabService } from '../services/ai-lab.service';

export class AIController {
  public static async summarize(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId, summaryType, language } = req.body;
      const result = await AILabService.summarizeDocument(
        req.user!.id,
        documentId,
        summaryType,
        language
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  public static async translate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId, targetLanguage } = req.body;
      const result = await AILabService.translateDocument(
        req.user!.id,
        documentId,
        targetLanguage
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  public static async quiz(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId, questionCount, difficulty } = req.body;
      const result = await AILabService.generateQuiz(
        req.user!.id,
        documentId,
        questionCount,
        difficulty
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  public static async grammar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text } = req.body;
      const result = await AILabService.proofreadText(text);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  public static async compare(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId1, documentId2 } = req.body;
      const result = await AILabService.compareDocuments(req.user!.id, documentId1, documentId2);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
