import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export async function mergePdfs(files: (File | Blob)[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  return await mergedPdf.save();
}

export function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(',').map((p) => p.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
          pages.add(i - 1);
        }
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= 1 && num <= totalPages) {
        pages.add(num - 1);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export async function splitPdf(file: File | Blob, rangeStr: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();

  let targetIndices: number[] = [];
  if (rangeStr.toLowerCase() === 'all' || !rangeStr.trim()) {
    targetIndices = srcPdf.getPageIndices();
  } else if (rangeStr.toLowerCase() === 'odd') {
    targetIndices = srcPdf.getPageIndices().filter((i) => i % 2 === 0);
  } else if (rangeStr.toLowerCase() === 'even') {
    targetIndices = srcPdf.getPageIndices().filter((i) => i % 2 !== 0);
  } else {
    targetIndices = parsePageRanges(rangeStr, totalPages);
  }

  if (targetIndices.length === 0) {
    targetIndices = srcPdf.getPageIndices();
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(srcPdf, targetIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

export async function rotatePdf(
  file: File | Blob,
  angle: number,
  pageIndices?: number[]
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdf.getPages();

  const targets = pageIndices && pageIndices.length > 0
    ? pageIndices
    : pages.map((_, i) => i);

  for (const index of targets) {
    if (pages[index]) {
      const currentRotation = pages[index].getRotation().angle;
      pages[index].setRotation(degrees((currentRotation + angle) % 360));
    }
  }

  return await pdf.save();
}

export interface WatermarkOptions {
  text: string;
  opacity?: number;
  fontSize?: number;
  rotationDegrees?: number;
  colorHex?: string;
}

export async function watermarkPdf(
  file: File | Blob,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = pdf.getPages();

  const opacity = options.opacity ?? 0.3;
  const fontSize = options.fontSize ?? 48;
  const rotation = options.rotationDegrees ?? -45;

  let r = 0.5, g = 0, b = 0.125; // Maroon default rgb(128, 0, 32)
  if (options.colorHex) {
    const hex = options.colorHex.replace('#', '');
    if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16) / 255;
      g = parseInt(hex.slice(2, 4), 16) / 255;
      b = parseInt(hex.slice(4, 6), 16) / 255;
    }
  }

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(options.text, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      font,
      size: fontSize,
      color: rgb(r, g, b),
      opacity,
      rotate: degrees(rotation),
    });
  }

  return await pdf.save();
}

export interface PageNumberOptions {
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
  format: 'number' | 'page-of-total' | 'roman';
  fontSize?: number;
  margin?: number;
}

export async function addPageNumbers(
  file: File | Blob,
  options: PageNumberOptions
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  const total = pages.length;

  const fontSize = options.fontSize ?? 10;
  const margin = options.margin ?? 30;

  for (let i = 0; i < total; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const currentNumber = i + 1;

    let text = `${currentNumber}`;
    if (options.format === 'page-of-total') {
      text = `Page ${currentNumber} of ${total}`;
    }

    const textWidth = font.widthOfTextAtSize(text, fontSize);
    let x = width / 2 - textWidth / 2;
    let y = margin;

    if (options.position.includes('left')) x = margin;
    if (options.position.includes('right')) x = width - margin - textWidth;
    if (options.position.startsWith('top')) y = height - margin;

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  return await pdf.save();
}

export async function imagesToPdf(imageFiles: File[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();

  for (const imgFile of imageFiles) {
    const bytes = await imgFile.arrayBuffer();
    let embeddedImg;

    if (imgFile.type === 'image/jpeg' || imgFile.name.toLowerCase().endsWith('.jpg') || imgFile.name.toLowerCase().endsWith('.jpeg')) {
      embeddedImg = await pdf.embedJpg(bytes);
    } else {
      embeddedImg = await pdf.embedPng(bytes);
    }

    const { width, height } = embeddedImg;
    // Standard A4: 595 x 842 points
    const a4Width = 595.28;
    const a4Height = 841.89;

    const scale = Math.min((a4Width - 40) / width, (a4Height - 40) / height, 1);
    const renderWidth = width * scale;
    const renderHeight = height * scale;

    const page = pdf.addPage([a4Width, a4Height]);
    page.drawImage(embeddedImg, {
      x: (a4Width - renderWidth) / 2,
      y: (a4Height - renderHeight) / 2,
      width: renderWidth,
      height: renderHeight,
    });
  }

  return await pdf.save();
}

export async function compressPdf(
  file: File | Blob,
  tier: 'extreme' | 'recommended' | 'low' = 'recommended'
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();

  if (tier === 'low') {
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    return await pdf.save({ useObjectStreams: true });
  }

  // Recommended & Extreme: Re-rasterize pages at optimized DPI & JPEG compression
  try {
    const { renderPdfToCanvases } = await import('./conversionEngine');
    const scale = tier === 'extreme' ? 1.0 : 1.35;
    const quality = tier === 'extreme' ? 0.5 : 0.72;
    const canvases = await renderPdfToCanvases(file, scale);

    if (canvases.length > 0) {
      const compressedPdf = await PDFDocument.create();

      for (const canvas of canvases) {
        const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64Data = jpegDataUrl.split(',')[1];
        const binaryStr = atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        const embedded = await compressedPdf.embedJpg(bytes);
        // Standard A4 or canvas aspect ratio
        const a4Width = 595.28;
        const a4Height = (canvas.height / canvas.width) * a4Width;
        const page = compressedPdf.addPage([a4Width, a4Height]);
        page.drawImage(embedded, {
          x: 0,
          y: 0,
          width: a4Width,
          height: a4Height,
        });
      }

      return await compressedPdf.save({ useObjectStreams: true });
    }
  } catch (err) {
    console.warn('Canvas re-rasterization compression fallback:', err);
  }

  // Fallback if canvas rendering fails
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return await pdf.save({ useObjectStreams: true });
}

export function downloadBlob(
  data: Uint8Array | Blob | string | ArrayBuffer,
  fileName: string,
  mimeType?: string
) {
  let detectedMime = mimeType;
  if (!detectedMime) {
    if (fileName.endsWith('.docx')) detectedMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (fileName.endsWith('.xlsx')) detectedMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    else if (fileName.endsWith('.pptx')) detectedMime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    else if (fileName.endsWith('.odt')) detectedMime = 'application/vnd.oasis.opendocument.text';
    else if (fileName.endsWith('.rtf')) detectedMime = 'application/rtf';
    else if (fileName.endsWith('.txt')) detectedMime = 'text/plain;charset=utf-8';
    else if (fileName.endsWith('.md')) detectedMime = 'text/markdown;charset=utf-8';
    else if (fileName.endsWith('.html')) detectedMime = 'text/html;charset=utf-8';
    else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) detectedMime = 'image/jpeg';
    else if (fileName.endsWith('.png')) detectedMime = 'image/png';
    else if (fileName.endsWith('.webp')) detectedMime = 'image/webp';
    else if (fileName.endsWith('.svg')) detectedMime = 'image/svg+xml;charset=utf-8';
    else if (fileName.endsWith('.pdf')) detectedMime = 'application/pdf';
    else detectedMime = 'application/octet-stream';
  }

  let blob: Blob;
  if (data instanceof Blob) {
    blob = data.type ? data : new Blob([data], { type: detectedMime });
  } else if (typeof data === 'string') {
    blob = new Blob([data], { type: detectedMime });
  } else {
    blob = new Blob([data as any], { type: detectedMime });
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
    URL.revokeObjectURL(url);
  }, 1000);
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
