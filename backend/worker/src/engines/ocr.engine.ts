import { createWorker } from 'tesseract.js';

export interface OCROptions {
  language?: string; // Default: 'eng'
  onProgress?: (progress: number) => void;
}

export interface OCRResult {
  text: string;
  confidence: number;
}

export class OCREngine {
  /**
   * Performs optical character recognition on an image buffer
   */
  public static async recognizeImage(
    imageBuffer: Buffer,
    options: OCROptions = {}
  ): Promise<OCRResult> {
    const lang = options.language || 'eng';
    const worker = await createWorker(lang, 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && options.onProgress) {
          options.onProgress(Math.round(m.progress * 100));
        }
      },
    });

    try {
      const result = await worker.recognize(imageBuffer);
      await worker.terminate();

      return {
        text: result.data.text.trim(),
        confidence: result.data.confidence,
      };
    } catch (err) {
      await worker.terminate();
      throw err;
    }
  }
}
