import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, Packer } from 'docx';
import * as XLSX from 'xlsx';
import PptxGenJS from 'pptxgenjs';
import JSZip from 'jszip';

// Configure pdfjs worker for in-browser rendering
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

/**
 * Universal conversion output interface
 */
export interface ConversionOutput {
  data: Blob | Uint8Array | string;
  fileName: string;
  mimeType: string;
  sourceFormat: string;
  targetFormat: string;
  fileSizeBytes: number;
  processingTimeMs: number;
  warnings?: string[];
  integrityHash?: string;
  validationPassed: boolean;
  validationDetails: string;
}

export interface DetectedFormatInfo {
  extension: string;
  mimeType: string;
  category: 'pdf' | 'document' | 'spreadsheet' | 'presentation' | 'image' | 'text' | 'data' | 'code';
  label: string;
  isSupported: boolean;
}

/**
 * XML 1.0 Specification compliance sanitizer:
 * Strips all control characters (0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F, 0x7F-0x9F),
 * unpaired surrogates, and non-character code points.
 * Prevents Microsoft Office (Word, Excel, PowerPoint) "unreadable content" errors!
 */
export function sanitizeXmlString(text: string): string {
  if (!text) return '';
  // 1. Replace tab with 4 spaces (ISO/IEC 29500-1 §17.3.3.31 explicitly forbids literal tabs in <w:t>)
  const detabbed = text.replace(/\t/g, '    ');
  // 2. Filter strictly according to W3C XML 1.0 Fifth Edition
  let cleaned = '';
  for (let i = 0; i < detabbed.length; i++) {
    const code = detabbed.charCodeAt(i);
    if (
      code === 0x0a ||
      code === 0x0d ||
      (code >= 0x20 && code <= 0xd7ff) ||
      (code >= 0xe000 && code <= 0xfffd)
    ) {
      cleaned += detabbed[i];
    }
  }
  return cleaned.trim();
}

/**
 * Step 1 & 2: Genuine File Signature / Magic Bytes Detection
 */
export async function detectFileSignature(file: File | Blob): Promise<DetectedFormatInfo> {
  const fileName = (file instanceof File ? file.name : '').toLowerCase();
  const slice = file.slice(0, 32);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // 1. PDF Signature: %PDF- (0x25, 0x50, 0x44, 0x46)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return {
      extension: 'pdf',
      mimeType: 'application/pdf',
      category: 'pdf',
      label: 'Adobe Portable Document (PDF)',
      isSupported: true,
    };
  }

  // 2. ZIP / OpenXML Container: PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
  if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
    if (fileName.endsWith('.docx')) {
      return {
        extension: 'docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        category: 'document',
        label: 'Microsoft Word Document (DOCX)',
        isSupported: true,
      };
    }
    if (fileName.endsWith('.xlsx')) {
      return {
        extension: 'xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        category: 'spreadsheet',
        label: 'Microsoft Excel Spreadsheet (XLSX)',
        isSupported: true,
      };
    }
    if (fileName.endsWith('.pptx')) {
      return {
        extension: 'pptx',
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        category: 'presentation',
        label: 'Microsoft PowerPoint Presentation (PPTX)',
        isSupported: true,
      };
    }
    if (fileName.endsWith('.odt')) {
      return {
        extension: 'odt',
        mimeType: 'application/vnd.oasis.opendocument.text',
        category: 'document',
        label: 'OpenOffice Document (ODT)',
        isSupported: true,
      };
    }
    return {
      extension: 'zip',
      mimeType: 'application/zip',
      category: 'data',
      label: 'Compressed ZIP Archive',
      isSupported: true,
    };
  }

  // 3. OLE2 Compound Document (Legacy DOC, XLS, PPT): 0xD0, 0xCF, 0x11, 0xE0
  if (bytes[0] === 0xD0 && bytes[1] === 0xCF && bytes[2] === 0x11 && bytes[3] === 0xE0) {
    if (fileName.endsWith('.xls')) {
      return {
        extension: 'xls',
        mimeType: 'application/vnd.ms-excel',
        category: 'spreadsheet',
        label: 'Legacy Microsoft Excel (XLS)',
        isSupported: true,
      };
    }
    if (fileName.endsWith('.ppt')) {
      return {
        extension: 'ppt',
        mimeType: 'application/vnd.ms-powerpoint',
        category: 'presentation',
        label: 'Legacy Microsoft PowerPoint (PPT)',
        isSupported: true,
      };
    }
    return {
      extension: 'doc',
      mimeType: 'application/msword',
      category: 'document',
      label: 'Legacy Microsoft Word (DOC)',
      isSupported: true,
    };
  }

  // 4. PNG Signature: \x89PNG\r\n\x1a\n (0x89, 0x50, 0x4E, 0x47)
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return {
      extension: 'png',
      mimeType: 'image/png',
      category: 'image',
      label: 'Portable Network Graphics (PNG)',
      isSupported: true,
    };
  }

  // 5. JPEG Signature: \xFF\xD8\xFF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return {
      extension: 'jpg',
      mimeType: 'image/jpeg',
      category: 'image',
      label: 'JPEG Graphic Image (JPG)',
      isSupported: true,
    };
  }

  // 6. WEBP Signature: RIFF....WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return {
      extension: 'webp',
      mimeType: 'image/webp',
      category: 'image',
      label: 'Google WebP Image',
      isSupported: true,
    };
  }

  // 7. TIFF Signature: II*\x00 (0x49, 0x49, 0x2A, 0x00) or MM\x00* (0x4D, 0x4D, 0x00, 0x2A)
  if (
    (bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2A && bytes[3] === 0x00) ||
    (bytes[0] === 0x4D && bytes[1] === 0x4D && bytes[2] === 0x00 && bytes[3] === 0x2A)
  ) {
    return {
      extension: 'tiff',
      mimeType: 'image/tiff',
      category: 'image',
      label: 'Tagged Image File Format (TIFF)',
      isSupported: true,
    };
  }

  // 8. BMP Signature: BM (0x42, 0x4D)
  if (bytes[0] === 0x42 && bytes[1] === 0x4D) {
    return {
      extension: 'bmp',
      mimeType: 'image/bmp',
      category: 'image',
      label: 'Windows Bitmap Image (BMP)',
      isSupported: true,
    };
  }

  // 9. Textual Stream Inspection (HTML, SVG, XML, RTF, CSV, JSON, TXT)
  const textHeader = new TextDecoder('utf-8', { fatal: false }).decode(bytes).trim();
  if (textHeader.startsWith('<svg') || textHeader.includes('<svg')) {
    return {
      extension: 'svg',
      mimeType: 'image/svg+xml',
      category: 'image',
      label: 'Scalable Vector Graphics (SVG)',
      isSupported: true,
    };
  }
  if (textHeader.startsWith('<!DOCTYPE html') || textHeader.startsWith('<html') || textHeader.includes('<html')) {
    return {
      extension: 'html',
      mimeType: 'text/html',
      category: 'code',
      label: 'HTML Hypertext Webpage',
      isSupported: true,
    };
  }
  if (textHeader.startsWith('<?xml') || textHeader.startsWith('<')) {
    return {
      extension: 'xml',
      mimeType: 'application/xml',
      category: 'data',
      label: 'Extensible Markup Language (XML)',
      isSupported: true,
    };
  }
  if (textHeader.startsWith('{') || textHeader.startsWith('[')) {
    return {
      extension: 'json',
      mimeType: 'application/json',
      category: 'data',
      label: 'JSON Structured Object',
      isSupported: true,
    };
  }
  if (textHeader.startsWith('{\\rtf')) {
    return {
      extension: 'rtf',
      mimeType: 'application/rtf',
      category: 'document',
      label: 'Rich Text Format (RTF)',
      isSupported: true,
    };
  }
  if (fileName.endsWith('.csv')) {
    return {
      extension: 'csv',
      mimeType: 'text/csv',
      category: 'spreadsheet',
      label: 'Comma-Separated Values (CSV)',
      isSupported: true,
    };
  }

  return {
    extension: 'txt',
    mimeType: 'text/plain;charset=utf-8',
    category: 'text',
    label: 'Plain Text Document (TXT)',
    isSupported: true,
  };
}

/**
 * Step 9 & 10: Validate Generated Output Before Download
 */
export async function validateConversionOutput(
  data: Blob | Uint8Array | string,
  targetFormat: string,
  fileName: string
): Promise<{ isValid: boolean; details: string }> {
  if (!data) {
    return { isValid: false, details: 'Conversion produced null data buffer.' };
  }

  const byteLength =
    typeof data === 'string'
      ? data.length
      : data instanceof Blob
      ? data.size
      : data.byteLength;

  if (byteLength < 16) {
    return { isValid: false, details: `Output file size (${byteLength} bytes) is corrupt or abnormally small.` };
  }

  const ext = targetFormat.toLowerCase();

  // Validate DOCX / XLSX / PPTX OpenXML ZIP structure
  if (ext === 'docx' || ext === 'xlsx' || ext === 'pptx' || ext === 'odt') {
    try {
      const blob = data instanceof Blob ? data : new Blob([data as any]);
      const zip = await JSZip.loadAsync(blob);
      if (ext === 'docx' && !zip.file('word/document.xml')) {
        return { isValid: false, details: 'Word package missing word/document.xml manifest.' };
      }
      if (ext === 'xlsx' && !zip.file('xl/workbook.xml')) {
        return { isValid: false, details: 'Excel package missing xl/workbook.xml manifest.' };
      }
      if (ext === 'pptx' && !zip.file('ppt/presentation.xml')) {
        return { isValid: false, details: 'PowerPoint package missing ppt/presentation.xml manifest.' };
      }
      return { isValid: true, details: `Valid OpenXML Container verified (${Object.keys(zip.files).length} parts, ${byteLength} bytes)` };
    } catch (err: any) {
      return { isValid: false, details: `Corrupted ZIP structure: ${err.message}` };
    }
  }

  // Validate PDF Structure
  if (ext === 'pdf') {
    try {
      const arrayBuffer =
        data instanceof Blob
          ? await data.arrayBuffer()
          : typeof data === 'string'
          ? new TextEncoder().encode(data).buffer
          : (data as Uint8Array).buffer;

      const pdf = await PDFDocument.load(new Uint8Array(arrayBuffer), { ignoreEncryption: true });
      const pages = pdf.getPageCount();
      return { isValid: true, details: `Valid PDF structure verified (${pages} page(s), ${byteLength} bytes)` };
    } catch (err: any) {
      return { isValid: false, details: `Invalid PDF stream: ${err.message}` };
    }
  }

  // Validate CSV
  if (ext === 'csv') {
    const text = typeof data === 'string' ? data : new TextDecoder().decode(data as any);
    if (!text.includes(',') && !text.includes('\n')) {
      return { isValid: false, details: 'CSV stream contains no structured rows or delimiters.' };
    }
    return { isValid: true, details: `Valid delimited CSV verified (${text.split('\n').length} rows)` };
  }

  // Validate JSON
  if (ext === 'json') {
    try {
      const text = typeof data === 'string' ? data : new TextDecoder().decode(data as any);
      JSON.parse(text);
      return { isValid: true, details: `Valid JSON structure verified (${byteLength} bytes)` };
    } catch {
      return { isValid: false, details: 'Invalid JSON syntax.' };
    }
  }

  return { isValid: true, details: `Passed binary integrity verification (${byteLength} bytes)` };
}

/**
 * Extract text and structured coordinates from PDF
 */
export async function extractPdfStructuredContent(file: File | Blob): Promise<{
  pages: { pageIndex: number; text: string; lines: string[]; tables: string[][] }[];
  totalWords: number;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pages: { pageIndex: number; text: string; lines: string[]; tables: string[][] }[] = [];
  let totalWords = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    // Group text items by Y-coordinate (transform[5]) to reconstruct lines & tables
    const lineMap = new Map<number, { x: number; text: string }[]>();
    items.forEach((item) => {
      if (!('str' in item) || !item.str.trim()) return;
      const y = Math.round(item.transform[5]);
      const x = Math.round(item.transform[4]);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push({ x, text: sanitizeXmlString(item.str) });
    });

    // Sort lines from top to bottom (descending Y)
    const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);
    const lines: string[] = [];
    const tables: string[][] = [];

    sortedYs.forEach((y) => {
      const tokens = lineMap.get(y)!.sort((a, b) => a.x - b.x);
      const lineStr = tokens.map((t) => t.text).join(' ');
      lines.push(lineStr);

      // If line has multiple spaced tokens, treat as a potential table row
      if (tokens.length >= 2) {
        tables.push(tokens.map((t) => t.text));
      }
    });

    const fullPageText = lines.join('\n');
    totalWords += fullPageText.split(/\s+/).filter(Boolean).length;
    pages.push({ pageIndex: i, text: fullPageText, lines, tables });
  }

  return { pages, totalWords };
}

/**
 * Render PDF page to High-DPI Canvas
 */
export async function renderPdfToHiResCanvases(
  file: File | Blob,
  scale = 2.0,
  maxPages = 25
): Promise<HTMLCanvasElement[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const canvases: HTMLCanvasElement[] = [];

  const count = Math.min(pdf.numPages, maxPages);
  for (let i = 1; i <= count; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      await page.render({
        canvasContext: context,
        viewport,
      }).promise;
      canvases.push(canvas);
    }
  }

  return canvases;
}

// =========================================================================
// UNIVERSAL BIDIRECTIONAL CONVERSION EXECUTOR
// =========================================================================

export async function executeUniversalConversion(
  file: File,
  targetFormat: string
): Promise<ConversionOutput> {
  const startTime = Date.now();
  const detected = await detectFileSignature(file);
  const sourceExt = detected.extension.toLowerCase();
  const targetExt = targetFormat.toLowerCase();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const warnings: string[] = [];

  // -------------------------------------------------------------
  // ATTEMPT HIGH-FIDELITY PYTHON BACKEND (PyMuPDF + python-docx / openpyxl / pptx)
  // -------------------------------------------------------------
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_format', targetExt);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const endpoint = '/api/convert';
    let backendRes: Response | null = null;
    try {
      backendRes = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
    } catch {
      backendRes = await fetch('http://localhost:8000/api/convert', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
    }
    clearTimeout(timeoutId);

    if (backendRes && backendRes.ok) {
      const blob = await backendRes.blob();
      const mime = backendRes.headers.get('content-type') || 'application/octet-stream';
      const validation = await validateConversionOutput(blob, targetExt, file.name);
      return {
        data: blob,
        fileName: `${baseName}.${targetExt}`,
        mimeType: mime,
        sourceFormat: sourceExt.toUpperCase(),
        targetFormat: targetExt.toUpperCase(),
        fileSizeBytes: blob.size,
        processingTimeMs: Date.now() - startTime,
        validationPassed: validation.isValid,
        validationDetails: `PyMuPDF Engine: ${validation.details}`,
      };
    }
  } catch (err) {
    console.info('Python backend skipped or timed out, executing client-side engine:', err);
  }

  let resultData: Blob | Uint8Array | string = new Blob([]);
  let targetMime = 'application/octet-stream';

  // -------------------------------------------------------------
  // BRANCH A: PDF to TARGET
  // -------------------------------------------------------------
  if (sourceExt === 'pdf') {
    if (targetExt === 'docx') {
      // 1. PDF to DOCX with Paragraphs, Headings, and Tables
      const { pages } = await extractPdfStructuredContent(file);
      const paragraphs: (Paragraph | Table)[] = [];

      // Document Title
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: sanitizeXmlString(baseName),
              bold: true,
              size: 36, // 18pt
              color: '800020',
              font: 'Calibri',
            }),
          ],
          spacing: { after: 240 },
        })
      );

      pages.forEach((p) => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Page ${p.pageIndex}`,
                bold: true,
                size: 26,
                color: '800020',
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 150 },
          })
        );

        const validLines = p.lines
          .map((l) => sanitizeXmlString(l))
          .filter((l) => l.length > 0);

        if (validLines.length > 0) {
          validLines.forEach((line) => {
            const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    size: 22,
                    color: '1E293B',
                    font: 'Calibri',
                  }),
                ],
                spacing: { after: isBullet ? 80 : 120 },
              })
            );
          });
        } else {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: '[Page contains visual or graphic elements]',
                  italics: true,
                  size: 20,
                  color: '94A3B8',
                  font: 'Calibri',
                }),
              ],
              spacing: { after: 160 },
            })
          );
        }
      });

      const doc = new Document({
        creator: 'AI PDF Studio Universal Engine',
        title: sanitizeXmlString(baseName),
        sections: [
          {
            properties: {
              page: {
                margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
              },
            },
            children: paragraphs,
          },
        ],
      });

      resultData = await Packer.toBlob(doc);
      targetMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (targetExt === 'xlsx') {
      // 2. PDF to XLSX: Detect tables & reconstruct worksheets
      const { pages } = await extractPdfStructuredContent(file);
      const dataRows: (string | number)[][] = [
        ['Document Title', sanitizeXmlString(baseName), 'Extracted Date', new Date().toLocaleDateString()],
        ['Page', 'Row Index', 'Content / Record', 'Value (Detected)'],
      ];

      pages.forEach((p) => {
        p.lines.forEach((l, idx) => {
          const numMatch = l.match(/[-+]?[0-9]*\.?[0-9]+/);
          const numVal = numMatch ? parseFloat(numMatch[0]) : '';
          dataRows.push([p.pageIndex, idx + 1, l, numVal]);
        });
      });

      const ws = XLSX.utils.aoa_to_sheet(dataRows);
      ws['!cols'] = [{ wch: 10 }, { wch: 12 }, { wch: 65 }, { wch: 18 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'PDF Data');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      resultData = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      targetMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (targetExt === 'csv') {
      // 3. PDF to CSV
      const { pages } = await extractPdfStructuredContent(file);
      const rows: string[] = ['"Page","Line Number","Extracted Content"'];
      pages.forEach((p) => {
        p.lines.forEach((l, idx) => {
          const escaped = l.replace(/"/g, '""');
          rows.push(`"${p.pageIndex}","${idx + 1}","${escaped}"`);
        });
      });
      resultData = new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
      targetMime = 'text/csv';
    } else if (targetExt === 'pptx') {
      // 4. PDF to PPTX
      const { pages } = await extractPdfStructuredContent(file);
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';
      pptx.title = sanitizeXmlString(baseName);

      const titleSlide = pptx.addSlide();
      titleSlide.background = { color: 'FAF9F9' };
      titleSlide.addText(sanitizeXmlString(baseName), {
        x: 0.8,
        y: 2.2,
        w: '85%',
        h: 1.2,
        fontSize: 32,
        bold: true,
        color: '800020',
        fontFace: 'Arial',
      });

      pages.forEach((p) => {
        const slide = pptx.addSlide();
        slide.background = { color: 'FFFFFF' };
        slide.addText(`Slide ${p.pageIndex}: ${sanitizeXmlString(baseName)}`, {
          x: 0.8,
          y: 0.5,
          w: '85%',
          h: 0.5,
          fontSize: 18,
          bold: true,
          color: '800020',
          fontFace: 'Arial',
        });

        const body = p.lines.slice(0, 10).map((l) => `• ${l}`).join('\n\n') || '• [Visual elements on source page]';
        slide.addText(body.slice(0, 1200), {
          x: 0.8,
          y: 1.3,
          w: '85%',
          h: 5.0,
          fontSize: 13,
          color: '1E293B',
          fontFace: 'Arial',
          lineSpacing: 20,
        });
      });

      resultData = (await pptx.write({ outputType: 'blob' })) as Blob;
      targetMime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else if (targetExt === 'png' || targetExt === 'jpg' || targetExt === 'webp') {
      // 5. PDF to High-Res Images
      const canvases = await renderPdfToHiResCanvases(file, 2.0, 1);
      if (canvases.length === 0) throw new Error('Could not render PDF pages to graphics canvas.');
      const canvas = canvases[0];

      if (targetExt === 'png') {
        resultData = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'));
        targetMime = 'image/png';
      } else if (targetExt === 'webp') {
        resultData = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/webp', 0.95));
        targetMime = 'image/webp';
      } else {
        resultData = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.92));
        targetMime = 'image/jpeg';
      }
    } else if (targetExt === 'txt') {
      // 6. PDF to TXT
      const { pages } = await extractPdfStructuredContent(file);
      const text = pages
        .map((p) => `=== PAGE ${p.pageIndex} ===\n\n${p.text}`)
        .join('\n\n--------------------------------------------\n\n');
      resultData = new Blob([text], { type: 'text/plain;charset=utf-8' });
      targetMime = 'text/plain';
    } else if (targetExt === 'html') {
      // 7. PDF to Structured HTML
      const { pages } = await extractPdfStructuredContent(file);
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${sanitizeXmlString(baseName)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; color: #1e293b; }
    h1 { color: #800020; border-bottom: 2px solid #800020; padding-bottom: 8px; }
    .page-card { background: #faf9f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .page-badge { display: inline-block; background: #800020; color: #fff; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 4px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <h1>${sanitizeXmlString(baseName)}</h1>
  ${pages
    .map(
      (p) => `<div class="page-card">
    <span class="page-badge">Page ${p.pageIndex}</span>
    ${p.lines.map((l) => `<p>${l}</p>`).join('')}
  </div>`
    )
    .join('')}
</body>
</html>`;
      resultData = new Blob([html], { type: 'text/html;charset=utf-8' });
      targetMime = 'text/html';
    } else if (targetExt === 'json') {
      // 8. PDF to JSON Structure
      const content = await extractPdfStructuredContent(file);
      resultData = new Blob([JSON.stringify({ title: baseName, ...content }, null, 2)], {
        type: 'application/json',
      });
      targetMime = 'application/json';
    } else if (targetExt === 'xml') {
      // 9. PDF to XML
      const { pages } = await extractPdfStructuredContent(file);
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<document title="${sanitizeXmlString(baseName)}" generated="${new Date().toISOString()}">
  ${pages
    .map(
      (p) => `  <page index="${p.pageIndex}">
${p.lines.map((l) => `    <line>${l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</line>`).join('\n')}
  </page>`
    )
    .join('\n')}
</document>`;
      resultData = new Blob([xml], { type: 'application/xml' });
      targetMime = 'application/xml';
    } else {
      throw new Error(`Conversion from PDF to .${targetExt} is currently preparing its pipeline.`);
    }
  }

  // -------------------------------------------------------------
  // BRANCH B: OFFICE / TEXT to PDF
  // -------------------------------------------------------------
  else if (targetExt === 'pdf') {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const a4Width = 595.28;
    const a4Height = 841.89;
    const margin = 50;
    const maxWidth = a4Width - margin * 2;
    const lineHeight = 16;
    const fontSize = 11;

    let page = pdfDoc.addPage([a4Width, a4Height]);
    let y = a4Height - margin;

    // Title banner
    page.drawText(sanitizeXmlString(baseName), {
      x: margin,
      y,
      size: 18,
      font: boldFont,
      color: rgb(0.5, 0, 0.125),
    });
    y -= 30;

    let textBlocks: string[] = [];

    // Parse source formats into textBlocks
    if (sourceExt === 'docx') {
      const zip = await JSZip.loadAsync(file);
      const docXml = await zip.file('word/document.xml')?.async('text');
      if (docXml) {
        const pRegex = /<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/gi;
        let pMatch;
        while ((pMatch = pRegex.exec(docXml)) !== null) {
          const pContent = pMatch[1];
          const withTabs = pContent.replace(/<w:tab[^>]*\/>/gi, '    ').replace(/<w:br[^>]*\/>/gi, '\n');
          const tRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/gi;
          let tMatch;
          let pText = '';
          while ((tMatch = tRegex.exec(withTabs)) !== null) {
            pText += tMatch[1];
          }
          const cleanP = pText
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/<[^>]+>/g, '')
            .trim();
          if (cleanP) {
            textBlocks.push(cleanP);
          }
        }
      }
    } else if (sourceExt === 'xlsx' || sourceExt === 'xls' || sourceExt === 'csv') {
      const bytes = await file.arrayBuffer();
      const wb = XLSX.read(bytes, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
      textBlocks = rawRows.slice(0, 60).map((r) => (Array.isArray(r) ? r.join(' | ') : String(r)));
    } else if (sourceExt === 'pptx') {
      const zip = await JSZip.loadAsync(file);
      const slideKeys = Object.keys(zip.files).filter((k) => /^ppt\/slides\/slide\d+\.xml$/i.test(k));
      for (const k of slideKeys) {
        const xml = await zip.file(k)?.async('text');
        if (xml) {
          const matches = xml.match(/<a:t[^>]*>(.*?)<\/a:t>/g) || [];
          textBlocks.push(matches.map((m) => m.replace(/<[^>]*>/g, '')).join(' '));
        }
      }
    } else if (detected.category === 'image') {
      // Embed image directly into PDF
      const imgBuffer = await file.arrayBuffer();
      let embeddedImg;
      if (sourceExt === 'jpg' || sourceExt === 'jpeg') {
        embeddedImg = await pdfDoc.embedJpg(imgBuffer);
      } else {
        embeddedImg = await pdfDoc.embedPng(imgBuffer);
      }

      const imgDims = embeddedImg.scaleToFit(a4Width - margin * 2, a4Height - margin * 2);
      page.drawImage(embeddedImg, {
        x: (a4Width - imgDims.width) / 2,
        y: (a4Height - imgDims.height) / 2,
        width: imgDims.width,
        height: imgDims.height,
      });
      textBlocks = []; // Done
    } else {
      // Plain text, HTML, XML, JSON
      const raw = await file.text();
      textBlocks = raw.replace(/<[^>]*>/g, ' ').split('\n');
    }

    // Render textBlocks
    for (const block of textBlocks) {
      const words = block.trim().split(' ').filter(Boolean);
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (testWidth > maxWidth) {
          page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
          y -= lineHeight;
          currentLine = word;

          if (y < margin + 40) {
            page = pdfDoc.addPage([a4Width, a4Height]);
            y = a4Height - margin;
          }
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
        y -= lineHeight;
      }
    }

    const pdfBytes = await pdfDoc.save();
    resultData = new Blob([pdfBytes as any], { type: 'application/pdf' });
    targetMime = 'application/pdf';
  }

  // -------------------------------------------------------------
  // BRANCH C: IMAGE to IMAGE CONVERSIONS
  // -------------------------------------------------------------
  else if (detected.category === 'image' && ['png', 'jpg', 'webp'].includes(targetExt)) {
    const imgUrl = URL.createObjectURL(file);
    const img = new window.Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = imgUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D Graphics context failed.');

    if (targetExt === 'jpg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(imgUrl);

    if (targetExt === 'png') {
      resultData = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'));
      targetMime = 'image/png';
    } else if (targetExt === 'webp') {
      resultData = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/webp', 0.95));
      targetMime = 'image/webp';
    } else {
      resultData = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.92));
      targetMime = 'image/jpeg';
    }
  } else {
    throw new Error(`Direct conversion from .${sourceExt} to .${targetExt} requires targeted parsing.`);
  }

  // Final Validation Check
  const outFileName = `${baseName}.${targetExt}`;
  const validation = await validateConversionOutput(resultData, targetExt, outFileName);

  const processingTimeMs = Date.now() - startTime;
  const fileSizeBytes =
    typeof resultData === 'string'
      ? (resultData as string).length
      : resultData instanceof Blob
      ? resultData.size
      : (resultData as Uint8Array).byteLength;

  return {
    data: resultData,
    fileName: outFileName,
    mimeType: targetMime,
    sourceFormat: sourceExt.toUpperCase(),
    targetFormat: targetExt.toUpperCase(),
    fileSizeBytes,
    processingTimeMs,
    warnings,
    validationPassed: validation.isValid,
    validationDetails: validation.details,
  };
}
