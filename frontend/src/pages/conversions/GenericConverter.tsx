import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  Download,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowLeft,
  FileCode,
  Image as ImageIcon,
} from 'lucide-react';
import * as converters from '../../utils/conversionEngine';
import { downloadBlob, formatBytes } from '../../utils/pdfEngine';
import { useDocumentStore } from '../../store/useDocumentStore';

export interface ConverterConfig {
  id: string;
  title: string;
  description: string;
  fromFormat: string;
  toFormat: string;
  accept: string;
  category: 'document' | 'image';
  fn: (file: any) => Promise<converters.ConversionResult>;
}

export const CONVERTERS: Record<string, ConverterConfig> = {
  // Document Conversions
  'pdf-to-word': {
    id: 'pdf-to-word',
    title: 'PDF to Microsoft Word',
    description: 'Convert PDF documents into editable Microsoft Word (.docx) files with formatted headings.',
    fromFormat: 'PDF',
    toFormat: 'DOCX',
    accept: '.pdf,application/pdf',
    category: 'document',
    fn: converters.convertPdfToWord,
  },
  'word-to-pdf': {
    id: 'word-to-pdf',
    title: 'Microsoft Word to PDF',
    description: 'Transform DOC and DOCX Word documents into universally compatible, secure PDF files.',
    fromFormat: 'DOCX',
    toFormat: 'PDF',
    accept: '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: 'document',
    fn: converters.convertWordToPdf,
  },
  'pdf-to-excel': {
    id: 'pdf-to-excel',
    title: 'PDF to Microsoft Excel',
    description: 'Extract tables, numeric datasets, and columnar reports from PDF into formatted Excel spreadsheets.',
    fromFormat: 'PDF',
    toFormat: 'XLSX',
    accept: '.pdf,application/pdf',
    category: 'document',
    fn: converters.convertPdfToExcel,
  },
  'excel-to-pdf': {
    id: 'excel-to-pdf',
    title: 'Microsoft Excel to PDF',
    description: 'Convert XLS, XLSX, and CSV data tables into neat, printable landscape PDF reports.',
    fromFormat: 'XLSX',
    toFormat: 'PDF',
    accept: '.xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    category: 'document',
    fn: converters.convertExcelToPdf,
  },
  'pdf-to-powerpoint': {
    id: 'pdf-to-powerpoint',
    title: 'PDF to Microsoft PowerPoint',
    description: 'Convert PDF document pages into presentation slide decks ready for Microsoft PowerPoint.',
    fromFormat: 'PDF',
    toFormat: 'PPTX',
    accept: '.pdf,application/pdf',
    category: 'document',
    fn: converters.convertPdfToPowerPoint,
  },
  'powerpoint-to-pdf': {
    id: 'powerpoint-to-pdf',
    title: 'Microsoft PowerPoint to PDF',
    description: 'Convert PPT and PPTX presentation slide decks into shareable, high-res PDF handouts.',
    fromFormat: 'PPTX',
    toFormat: 'PDF',
    accept: '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation',
    category: 'document',
    fn: converters.convertPowerPointToPdf,
  },
  'pdf-to-openoffice': {
    id: 'pdf-to-openoffice',
    title: 'PDF to OpenOffice Document',
    description: 'Export PDF documents to OASIS OpenDocument Text (.odt) format for LibreOffice & OpenOffice.',
    fromFormat: 'PDF',
    toFormat: 'ODT',
    accept: '.pdf,application/pdf',
    category: 'document',
    fn: converters.convertPdfToOpenOffice,
  },
  'openoffice-to-pdf': {
    id: 'openoffice-to-pdf',
    title: 'OpenOffice Document to PDF',
    description: 'Convert OpenOffice / LibreOffice ODT, ODS, and ODP files into pristine PDF documents.',
    fromFormat: 'ODT',
    toFormat: 'PDF',
    accept: '.odt,.ods,.odp,application/vnd.oasis.opendocument.text',
    category: 'document',
    fn: converters.convertOpenOfficeToPdf,
  },
  'pdf-to-rtf': {
    id: 'pdf-to-rtf',
    title: 'PDF to Rich Text Format (RTF)',
    description: 'Convert PDF content into standardized Rich Text (.rtf) documents compatible across all word processors.',
    fromFormat: 'PDF',
    toFormat: 'RTF',
    accept: '.pdf,application/pdf',
    category: 'document',
    fn: converters.convertPdfToRtf,
  },
  'rtf-to-pdf': {
    id: 'rtf-to-pdf',
    title: 'Rich Text Format (RTF) to PDF',
    description: 'Compile Rich Text .rtf documents into formatted, high-contrast PDF sheets.',
    fromFormat: 'RTF',
    toFormat: 'PDF',
    accept: '.rtf,application/rtf,text/rtf',
    category: 'document',
    fn: converters.convertRtfToPdf,
  },
  'pdf-to-txt': {
    id: 'pdf-to-txt',
    title: 'PDF to Plain Text',
    description: 'Extract raw text streams, clean paragraphs, and characters from PDF documents into .txt files.',
    fromFormat: 'PDF',
    toFormat: 'TXT',
    accept: '.pdf,application/pdf',
    category: 'document',
    fn: converters.convertPdfToTxt,
  },
  'txt-to-pdf': {
    id: 'txt-to-pdf',
    title: 'Plain Text to PDF',
    description: 'Convert unformatted text files into neatly margined, typographic A4 PDF documents.',
    fromFormat: 'TXT',
    toFormat: 'PDF',
    accept: '.txt,text/plain',
    category: 'document',
    fn: converters.convertTxtToPdf,
  },
  'pdf-to-markdown': {
    id: 'pdf-to-markdown',
    title: 'PDF to Markdown',
    description: 'Convert PDF documentation into formatted Markdown (.md) headings, lists, and code blocks.',
    fromFormat: 'PDF',
    toFormat: 'MD',
    accept: '.pdf,application/pdf',
    category: 'document',
    fn: converters.convertPdfToMarkdown,
  },
  'markdown-to-pdf': {
    id: 'markdown-to-pdf',
    title: 'Markdown to PDF',
    description: 'Render Markdown documentation into styled, professional PDF books and reports.',
    fromFormat: 'MD',
    toFormat: 'PDF',
    accept: '.md,text/markdown',
    category: 'document',
    fn: converters.convertMarkdownToPdf,
  },
  'pdf-to-html': {
    id: 'pdf-to-html',
    title: 'PDF to HTML / Webpage',
    description: 'Convert PDF documents into modern, responsive standalone HTML5 webpages with embedded CSS styling.',
    fromFormat: 'PDF',
    toFormat: 'HTML',
    accept: '.pdf,application/pdf',
    category: 'document',
    fn: converters.convertPdfToHtml,
  },
  'html-to-pdf': {
    id: 'html-to-pdf',
    title: 'HTML / Webpage to PDF',
    description: 'Convert HTML files and webpage markups into print-ready PDF documents.',
    fromFormat: 'HTML',
    toFormat: 'PDF',
    accept: '.html,.htm,text/html',
    category: 'document',
    fn: converters.convertHtmlToPdf,
  },

  // Image & Graphics Conversions
  'pdf-to-jpg': {
    id: 'pdf-to-jpg',
    title: 'PDF to JPG / JPEG',
    description: 'Render PDF document pages into high-resolution, vibrant JPG photographs and image files.',
    fromFormat: 'PDF',
    toFormat: 'JPG',
    accept: '.pdf,application/pdf',
    category: 'image',
    fn: converters.convertPdfToJpg,
  },
  'jpg-to-pdf': {
    id: 'jpg-to-pdf',
    title: 'JPG / JPEG to PDF',
    description: 'Combine and convert JPG photos into high-quality, standardized PDF pages.',
    fromFormat: 'JPG',
    toFormat: 'PDF',
    accept: '.jpg,.jpeg,image/jpeg',
    category: 'image',
    fn: converters.convertJpgToPdf,
  },
  'pdf-to-png': {
    id: 'pdf-to-png',
    title: 'PDF to PNG',
    description: 'Render PDF pages into lossless, transparent-capable PNG images with crisp text rendering.',
    fromFormat: 'PDF',
    toFormat: 'PNG',
    accept: '.pdf,application/pdf',
    category: 'image',
    fn: converters.convertPdfToPng,
  },
  'png-to-pdf': {
    id: 'png-to-pdf',
    title: 'PNG to PDF',
    description: 'Pack PNG graphics, screenshots, and visual designs into crisp, scalable PDF documents.',
    fromFormat: 'PNG',
    toFormat: 'PDF',
    accept: '.png,image/png',
    category: 'image',
    fn: converters.convertPngToPdf,
  },
  'pdf-to-webp': {
    id: 'pdf-to-webp',
    title: 'PDF to WEBP',
    description: 'Convert PDF document pages to next-gen WEBP graphics for ultra-fast web loading speeds.',
    fromFormat: 'PDF',
    toFormat: 'WEBP',
    accept: '.pdf,application/pdf',
    category: 'image',
    fn: converters.convertPdfToWebp,
  },
  'webp-to-pdf': {
    id: 'webp-to-pdf',
    title: 'WEBP to PDF',
    description: 'Convert next-generation WEBP images into universally viewable PDF pages.',
    fromFormat: 'WEBP',
    toFormat: 'PDF',
    accept: '.webp,image/webp',
    category: 'image',
    fn: converters.convertWebpToPdf,
  },
  'pdf-to-gif': {
    id: 'pdf-to-gif',
    title: 'PDF to GIF',
    description: 'Convert PDF slides and presentations into animated or static GIF graphics.',
    fromFormat: 'PDF',
    toFormat: 'GIF',
    accept: '.pdf,application/pdf',
    category: 'image',
    fn: converters.convertPdfToGif,
  },
  'gif-to-pdf': {
    id: 'gif-to-pdf',
    title: 'GIF to PDF',
    description: 'Convert GIF frames and animation sequences into multi-page PDF documents.',
    fromFormat: 'GIF',
    toFormat: 'PDF',
    accept: '.gif,image/gif',
    category: 'image',
    fn: converters.convertGifToPdf,
  },
  'pdf-to-bmp': {
    id: 'pdf-to-bmp',
    title: 'PDF to BMP (Bitmap)',
    description: 'Render PDF pages into uncompressed, pixel-accurate Windows Bitmap (.bmp) image files.',
    fromFormat: 'PDF',
    toFormat: 'BMP',
    accept: '.pdf,application/pdf',
    category: 'image',
    fn: converters.convertPdfToBmp,
  },
  'bmp-to-pdf': {
    id: 'bmp-to-pdf',
    title: 'BMP to PDF',
    description: 'Convert Windows Bitmap (.bmp) files into clean, cross-platform PDF pages.',
    fromFormat: 'BMP',
    toFormat: 'PDF',
    accept: '.bmp,image/bmp',
    category: 'image',
    fn: converters.convertBmpToPdf,
  },
  'pdf-to-tiff': {
    id: 'pdf-to-tiff',
    title: 'PDF to TIFF / TIF',
    description: 'Convert PDF documents into professional multi-page TIFF archives for high-end printing & scanning.',
    fromFormat: 'PDF',
    toFormat: 'TIFF',
    accept: '.pdf,application/pdf',
    category: 'image',
    fn: converters.convertPdfToTiff,
  },
  'tiff-to-pdf': {
    id: 'tiff-to-pdf',
    title: 'TIFF / TIF to PDF',
    description: 'Convert medical, architectural, and scan TIFF / TIF images into standardized PDF files.',
    fromFormat: 'TIFF',
    toFormat: 'PDF',
    accept: '.tif,.tiff,image/tiff',
    category: 'image',
    fn: converters.convertTiffToPdf,
  },
  'pdf-to-svg': {
    id: 'pdf-to-svg',
    title: 'PDF to SVG (Vector)',
    description: 'Extract vector paths, typography, and lines from PDF into infinitely scalable SVG vectors.',
    fromFormat: 'PDF',
    toFormat: 'SVG',
    accept: '.pdf,application/pdf',
    category: 'image',
    fn: converters.convertPdfToSvg,
  },
  'svg-to-pdf': {
    id: 'svg-to-pdf',
    title: 'SVG (Vector) to PDF',
    description: 'Convert scalable vector graphics (.svg) into resolution-independent PDF sheets.',
    fromFormat: 'SVG',
    toFormat: 'PDF',
    accept: '.svg,image/svg+xml',
    category: 'image',
    fn: converters.convertSvgToPdf,
  },
  'pdf-to-heic': {
    id: 'pdf-to-heic',
    title: 'PDF to HEIC / HEIF',
    description: 'Convert PDF documents into high-efficiency Apple HEIC / HEIF format for iOS & macOS ecosystem.',
    fromFormat: 'PDF',
    toFormat: 'HEIC',
    accept: '.pdf,application/pdf',
    category: 'image',
    fn: converters.convertPdfToHeic,
  },
  'heic-to-pdf': {
    id: 'heic-to-pdf',
    title: 'HEIC / HEIF to PDF',
    description: 'Convert iPhone and iPad HEIC photos into universal, shareable PDF documents.',
    fromFormat: 'HEIC',
    toFormat: 'PDF',
    accept: '.heic,.heif,image/heic,image/heif',
    category: 'image',
    fn: converters.convertHeicToPdf,
  },
  'pdf-to-eps': {
    id: 'pdf-to-eps',
    title: 'PDF to EPS / AI (Design Files)',
    description: 'Export PDF documents into Encapsulated PostScript (.eps) and Adobe Illustrator vector files.',
    fromFormat: 'PDF',
    toFormat: 'EPS',
    accept: '.pdf,application/pdf',
    category: 'image',
    fn: converters.convertPdfToEps,
  },
  'eps-to-pdf': {
    id: 'eps-to-pdf',
    title: 'EPS / AI to PDF',
    description: 'Compile Encapsulated PostScript (.eps) design graphics into viewable, printable PDF files.',
    fromFormat: 'EPS',
    toFormat: 'PDF',
    accept: '.eps,.ai,application/postscript',
    category: 'image',
    fn: converters.convertEpsToPdf,
  },
  'pdf-to-autocad': {
    id: 'pdf-to-autocad',
    title: 'PDF to AutoCAD (.dwg, .dxf)',
    description: 'Convert PDF blueprints and technical schematics into standard AutoCAD DXF vector CAD drawings.',
    fromFormat: 'PDF',
    toFormat: 'DXF',
    accept: '.pdf,application/pdf',
    category: 'image',
    fn: converters.convertPdfToAutocad,
  },
  'autocad-to-pdf': {
    id: 'autocad-to-pdf',
    title: 'AutoCAD (.dwg, .dxf) to PDF',
    description: 'Plot AutoCAD drawing exchange (.dxf) and CAD files into crisp architectural vector PDF sheets.',
    fromFormat: 'DXF',
    toFormat: 'PDF',
    accept: '.dxf,.dwg,application/dxf',
    category: 'image',
    fn: converters.convertAutocadToPdf,
  },
};

export const GenericConverter: React.FC<{ forcedId?: string }> = ({ forcedId }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const activeId = forcedId || paramId || 'pdf-to-word';
  const config = CONVERTERS[activeId] || CONVERTERS['pdf-to-word'];

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<converters.ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addDocument } = useDocumentStore();

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await config.fn(file);
      setResult(res);

      // Save into document library if it's a PDF output
      if (res.fileName.endsWith('.pdf')) {
        addDocument({
          id: `conv-${Date.now()}`,
          name: res.fileName,
          size: typeof res.data === 'string' ? res.data.length : (res.data as any).byteLength || (res.data as any).size || 1024,
          pages: 1,
          type: res.mimeType,
          updatedAt: new Date().toISOString(),
          category: 'general',
        });
      }
    } catch (err: any) {
      setError(err?.message || `Conversion to ${config.toFormat} failed. Please verify the source file format.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    downloadBlob(result.data as any, result.fileName, result.mimeType);
  };

  const parentHub = config.category === 'document' ? '/conversions/documents' : '/conversions/images';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between pb-1">
        <Link
          to={parentHub}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-maroon-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {config.category === 'document' ? 'Document Conversions' : 'Image & Graphics'}</span>
        </Link>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {config.fromFormat}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-maroon-50 text-maroon-800 border border-maroon-100">
            {config.toFormat}
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex items-center space-x-4 pb-2">
        <div className="w-14 h-14 rounded-2xl bg-maroon-50 border border-maroon-100 flex items-center justify-center text-maroon-700 shadow-xs">
          {config.category === 'document' ? <FileText className="w-7 h-7" /> : <ImageIcon className="w-7 h-7" />}
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{config.title}</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{config.description}</p>
        </div>
      </div>

      {/* Upload & Conversion Surface */}
      {!file ? (
        <label className="block border-2 border-dashed border-maroon-200 hover:border-maroon-400 bg-white hover:bg-maroon-50/10 rounded-3xl p-12 text-center cursor-pointer transition-all shadow-xs">
          <input
            type="file"
            accept={config.accept}
            onChange={handleFileSelected}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-maroon-50 flex items-center justify-center mx-auto mb-4 text-maroon-700 shadow-xs">
            <Upload className="w-8 h-8" />
          </div>
          <p className="text-base font-extrabold text-slate-900">
            Select a {config.fromFormat} file to convert to {config.toFormat}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Accepts {config.accept.replace(/,[a-z/.\-]+/g, '')} • High-fidelity client-side conversion
          </p>
          <div className="mt-4 inline-flex items-center space-x-1.5 px-3 py-1 bg-maroon-50 border border-maroon-100 rounded-full text-[11px] font-bold text-maroon-700">
            <Zap className="w-3.5 h-3.5" />
            <span>Pure Client-Side Privacy Guaranteed</span>
          </div>
        </label>
      ) : (
        <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 shadow-xs space-y-6">
          {/* Selected File Bar */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-maroon-50 border border-maroon-100 flex items-center justify-center">
                <FileCode className="w-5 h-5 text-maroon-700" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900">{file.name}</p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {formatBytes(file.size)} • Format: {config.fromFormat}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="text-xs font-bold text-maroon-700 hover:text-maroon-900 flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Change File</span>
            </button>
          </div>

          {/* Format Transition Banner */}
          <div className="p-4 bg-[#FAF9F9] border border-[#EAE5E5] rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-800">Target Output Configuration</p>
              <p className="text-[11px] text-slate-500">
                Converting from <strong>{config.fromFormat}</strong> to <strong>{config.toFormat}</strong> with structural preservation.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-black text-slate-700">
                .{config.fromFormat.toLowerCase()}
              </span>
              <ArrowRight className="w-4 h-4 text-maroon-600" />
              <span className="px-3 py-1 rounded-lg bg-maroon-700 text-white text-xs font-black">
                .{config.toFormat.toLowerCase()}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs font-medium text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            {!result ? (
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:bg-slate-200 text-white font-extrabold text-sm py-4 rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? `Converting ${config.fromFormat} to ${config.toFormat}...`
                    : `Convert to ${config.toFormat}`}
                </span>
              </button>
            ) : (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-emerald-900">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="text-sm font-extrabold">Conversion Succeeded!</p>
                      <p className="text-xs text-emerald-700 font-medium">
                        Ready to download: <strong>{result.fileName}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1.5 rounded-xl">
                    100% READY
                  </span>
                </div>

                {result.previewUrl && (
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 max-h-48 overflow-hidden flex items-center justify-center">
                    <img src={result.previewUrl} alt="Preview" className="max-h-44 object-contain rounded-lg" />
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setResult(null)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-800 px-4 py-2"
                  >
                    Convert Another File
                  </button>
                  <button
                    onClick={handleDownload}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {result.fileName}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feature Guarantee Callouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-4 bg-white border border-[#EAE5E5] rounded-2xl flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-maroon-50 text-maroon-700 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-900">Zero Server Wait</p>
            <p className="text-[11px] text-slate-500">Converts in browser memory</p>
          </div>
        </div>
        <div className="p-4 bg-white border border-[#EAE5E5] rounded-2xl flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-maroon-50 text-maroon-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-900">Original Quality</p>
            <p className="text-[11px] text-slate-500">Preserves fonts & coordinates</p>
          </div>
        </div>
        <div className="p-4 bg-white border border-[#EAE5E5] rounded-2xl flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-maroon-50 text-maroon-700 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-900">Native Standards</p>
            <p className="text-[11px] text-slate-500">Compatible with Microsoft & Adobe</p>
          </div>
        </div>
      </div>
    </div>
  );
};

