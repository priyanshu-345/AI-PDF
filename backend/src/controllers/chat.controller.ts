import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { RAGService } from '../services/rag.service';

export class ChatController {
  public static async chat(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId, conversationId, message } = req.body;
      const result = await RAGService.chatWithDocument(
        req.user!.id,
        documentId,
        message,
        conversationId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
