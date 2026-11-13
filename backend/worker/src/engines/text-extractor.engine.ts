import pdfParse from 'pdf-parse';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractionResult {
  totalPages: number;
  fullText: string;
  pages: ExtractedPage[];
  isScanned: boolean;
}

export class TextExtractorEngine {
  /**
   * Extracts text page-by-page from a PDF buffer
   */
  public static async extractText(pdfBuffer: Buffer): Promise<ExtractionResult> {
    const pages: ExtractedPage[] = [];

    // Custom pagerender to capture text per page index
    const renderPage = (pageData: any) => {
      const renderOptions = {
        normalizeWhitespace: true,
        disableCombineTextItems: false,
      };

      return pageData.getTextContent(renderOptions).then((textContent: any) => {
        let lastY: number | null = null;
        let text = '';

        for (const item of textContent.items) {
          if (lastY === item.transform[5] || lastY === null) {
            text += item.str;
          } else {
            text += '\n' + item.str;
          }
          lastY = item.transform[5];
        }

        pages.push({
          pageNumber: pageData.pageIndex + 1,
          text: text.trim(),
        });

        return text;
      });
    };

    const parsed = await pdfParse(pdfBuffer, { pagerender: renderPage });

    const totalPages = parsed.numpages || pages.length;
    const fullText = parsed.text || '';

    // If average characters per page is below 20, document is likely scanned / image-based
    const avgCharsPerPage = totalPages > 0 ? fullText.length / totalPages : 0;
    const isScanned = avgCharsPerPage < 20;

    return {
      totalPages,
      fullText,
      pages,
      isScanned,
    };
  }
}
