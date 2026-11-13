import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { StorageService } from '../services/storage.service';
import { DocumentService } from '../services/document.service';

export class DocumentController {
  /**
   * Generates a signed S3 PUT URL for uploading PDF
   */
  public static async getUploadUrl(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { fileName, fileSizeBytes, mimeType } = req.body;
      const result = await StorageService.generateUploadUrl(
        req.user!.id,
        fileName,
        fileSizeBytes,
        mimeType
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirms upload completion, records document, and kicks off background indexing
   */
  public static async confirmUpload(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { storageKey, originalName, fileSizeBytes, mimeType } = req.body;
      const result = await DocumentService.confirmUpload(req.user!.id, {
        storageKey,
        originalName,
        fileSizeBytes,
        mimeType,
      });

      res.status(201).json({
        success: true,
        message: 'Document uploaded and enqueued for indexing',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lists user's documents with search and pagination
   */
  public static async listDocuments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { q, page, limit } = req.query;
      const result = await DocumentService.listUserDocuments(
        req.user!.id,
        q as string,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets a specific document by ID
   */
  public static async getDocumentById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const result = await DocumentService.getDocumentById(req.user!.id, id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes a document
   */
  public static async deleteDocument(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await DocumentService.deleteDocument(req.user!.id, id);

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
