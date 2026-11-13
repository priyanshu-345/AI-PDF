import { 
  PDFDocument, 
  degrees, 
  rgb, 
  StandardFonts 
} from 'pdf-lib';
import { AppError } from '@ai-pdf/shared';

export interface WatermarkOptions {
  text: string;
  opacity?: number;
  fontSize?: number;
  colorHex?: string;
  rotationDegrees?: number;
}

export interface PageNumberOptions {
  position?: 'BOTTOM_CENTER' | 'BOTTOM_RIGHT' | 'TOP_RIGHT';
  format?: 'PAGE_X_OF_Y' | 'PAGE_X';
  fontSize?: number;
}

export class PDFManipulationEngine {
  /**
   * Helper: Parses page ranges like "1-3, 5, 8-10" into 0-indexed page numbers
   */
  public static parsePageRanges(rangesStr: string, totalPages: number): number[] {
    const pagesSet = new Set<number>();
    const segments = rangesStr.split(',').map((s) => s.trim());

    for (const segment of segments) {
      if (!segment) continue;

      if (segment.includes('-')) {
        const [startStr, endStr] = segment.split('-').map((s) => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
          throw new AppError(`Invalid page range: ${segment}`, 400);
        }

        const validEnd = Math.min(end, totalPages);
        for (let i = start; i <= validEnd; i++) {
          pagesSet.add(i - 1); // 0-indexed
        }
      } else {
        const page = parseInt(segment, 10);
        if (isNaN(page) || page < 1 || page > totalPages) {
          throw new AppError(`Invalid page number: ${segment}. Document has ${totalPages} pages.`, 400);
        }
        pagesSet.add(page - 1); // 0-indexed
      }
    }

    return Array.from(pagesSet).sort((a, b) => a - b);
  }

  /**
   * Helper: Converts hex color string (#RRGGBB) to pdf-lib rgb(r, g, b)
   */
  private static hexToRgb(hex = '#6366F1') {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    return rgb(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
  }

  /**
   * 1. MERGE: Combines multiple PDF buffers into a single document
   */
  public static async mergePDFs(buffers: Buffer[]): Promise<Buffer> {
    if (buffers.length < 2) {
      throw new AppError('At least 2 PDF documents are required to merge', 400);
    }

    const mergedDoc = await PDFDocument.create();

    for (let i = 0; i < buffers.length; i++) {
      const srcDoc = await PDFDocument.load(buffers[i], { ignoreEncryption: true });
      const copiedPages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
      copiedPages.forEach((page) => mergedDoc.addPage(page));
    }

    const pdfBytes = await mergedDoc.save({ useObjectStreams: true });
    return Buffer.from(pdfBytes);
  }

  /**
   * 2. SPLIT: Extracts specific page ranges into a new PDF document
   */
  public static async splitPDF(buffer: Buffer, pageRanges: string): Promise<Buffer> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();

    const selectedIndices = this.parsePageRanges(pageRanges, totalPages);
    if (selectedIndices.length === 0) {
      throw new AppError('No valid pages found in the requested range', 400);
    }

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, selectedIndices);
    copiedPages.forEach((page) => newDoc.addPage(page));

    const pdfBytes = await newDoc.save({ useObjectStreams: true });
    return Buffer.from(pdfBytes);
  }

  /**
   * 3. COMPRESS: Optimizes and strips unnecessary object streams
   */
  public static async compressPDF(
    buffer: Buffer,
    _quality: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

    // Strip unneeded metadata
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('AI PDF Toolkit Optimizer');
    pdfDoc.setCreator('AI PDF Toolkit');

    // Save with maximum object streams compression
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    return Buffer.from(pdfBytes);
  }

  /**
   * 4. ROTATE: Rotates specified pages or all pages by 90, 180, or 270 degrees
   */
  public static async rotatePDF(
    buffer: Buffer,
    pageNumbers: number[] = [],
    rotationAngle: 90 | 180 | 270 = 90
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    const targetIndices =
      pageNumbers.length > 0
        ? pageNumbers.map((p) => p - 1).filter((idx) => idx >= 0 && idx < totalPages)
        : pages.map((_, idx) => idx);

    for (const idx of targetIndices) {
      const page = pages[idx];
      const currentRotation = page.getRotation().angle;
      const newAngle = (currentRotation + rotationAngle) % 360;
      page.setRotation(degrees(newAngle));
    }

    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    return Buffer.from(pdfBytes);
  }

  /**
   * 5. WATERMARK: Overlays customizable text watermark across pages
   */
  public static async addWatermark(
    buffer: Buffer,
    options: WatermarkOptions
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSize = options.fontSize || 48;
    const opacity = options.opacity !== undefined ? options.opacity : 0.25;
    const color = this.hexToRgb(options.colorHex || '#6366F1');
    const angle = options.rotationDegrees !== undefined ? options.rotationDegrees : 45;

    for (const page of pages) {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(options.text, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      // Center of page coordinates
      const x = width / 2 - textWidth / 4;
      const y = height / 2;

      page.drawText(options.text, {
        x,
        y,
        size: fontSize,
        font,
        color,
        opacity,
        rotate: degrees(angle),
      });
    }

    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    return Buffer.from(pdfBytes);
  }

  /**
   * 6. PAGE NUMBERS: Stamps "Page X of Y" at the bottom margin
   */
  public static async addPageNumbers(
    buffer: Buffer,
    options: PageNumberOptions = {}
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = options.fontSize || 10;
    const color = rgb(0.3, 0.3, 0.3);

    for (let i = 0; i < totalPages; i++) {
      const page = pages[i];
      const { width } = page.getSize();
      const currentPageNum = i + 1;

      const pageText =
        options.format === 'PAGE_X'
          ? `${currentPageNum}`
          : `Page ${currentPageNum} of ${totalPages}`;

      const textWidth = font.widthOfTextAtSize(pageText, fontSize);
      const x = (width - textWidth) / 2; // Centered at bottom
      const y = 20; // 20pt margin from bottom

      page.drawText(pageText, {
        x,
        y,
        size: fontSize,
        font,
        color,
      });
    }

    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    return Buffer.from(pdfBytes);
  }
}
