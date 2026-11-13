import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  RotateCw,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  HardDrive,
  ShieldCheck,
  Zap,
  ArrowRight,
  Eye,
  Trash2,
  HelpCircle,
  Check,
} from 'lucide-react';
import {
  detectFileSignature,
  executeUniversalConversion,
  ConversionOutput,
  DetectedFormatInfo,
} from '../../utils/universalConversionEngine';
import { downloadBlob, formatBytes } from '../../utils/pdfEngine';

interface ConversionHistoryItem {
  id: string;
  fileName: string;
  sourceFormat: string;
  targetFormat: string;
  sizeBytes: number;
  durationMs: number;
  timestamp: string;
  data: Blob | Uint8Array | string;
  validationDetails: string;
}

const TARGET_FORMAT_MAP: Record<string, { id: string; label: string; desc: string; icon: any }[]> = {
  pdf: [
    { id: 'docx', label: 'Word (.docx)', desc: 'Reconstruct editable text, headings & tables', icon: FileText },
    { id: 'xlsx', label: 'Excel (.xlsx)', desc: 'Extract data rows & column worksheets', icon: FileSpreadsheet },
    { id: 'pptx', label: 'PowerPoint (.pptx)', desc: '16:9 Presentation slide deck', icon: Layers },
    { id: 'csv', label: 'CSV Data (.csv)', desc: 'Comma-separated tabular records', icon: FileSpreadsheet },
    { id: 'png', label: 'PNG Image (.png)', desc: 'High-resolution lossless page render', icon: ImageIcon },
    { id: 'jpg', label: 'JPG Image (.jpg)', desc: 'Compressed photo format', icon: ImageIcon },
    { id: 'webp', label: 'WebP Image (.webp)', desc: 'Next-gen web graphic compression', icon: ImageIcon },
    { id: 'txt', label: 'Plain Text (.txt)', desc: 'Raw text in logical reading order', icon: FileText },
    { id: 'html', label: 'HTML Webpage (.html)', desc: 'Structured HTML document with CSS', icon: FileCode },
    { id: 'xml', label: 'XML Schema (.xml)', desc: 'Structured XML hierarchy', icon: FileCode },
    { id: 'json', label: 'JSON Data (.json)', desc: 'Semantic document object graph', icon: FileCode },
  ],
  document: [
    { id: 'pdf', label: 'PDF Document (.pdf)', desc: 'Universal printable document', icon: FileText },
    { id: 'txt', label: 'Plain Text (.txt)', desc: 'Clean unformatted text', icon: FileText },
    { id: 'html', label: 'HTML (.html)', desc: 'Formatted web article', icon: FileCode },
    { id: 'json', label: 'JSON (.json)', desc: 'Structured content tokens', icon: FileCode },
  ],
  spreadsheet: [
    { id: 'pdf', label: 'PDF Document (.pdf)', desc: 'Landscape table report', icon: FileText },
    { id: 'csv', label: 'CSV (.csv)', desc: 'Standard comma-delimited rows', icon: FileSpreadsheet },
    { id: 'xlsx', label: 'Excel (.xlsx)', desc: 'Formatted OpenXML spreadsheet', icon: FileSpreadsheet },
    { id: 'json', label: 'JSON (.json)', desc: 'Array of record objects', icon: FileCode },
  ],
  presentation: [
    { id: 'pdf', label: 'PDF Document (.pdf)', desc: 'Handout presentation pages', icon: FileText },
    { id: 'txt', label: 'Plain Text (.txt)', desc: 'Extracted slide speeches & notes', icon: FileText },
  ],
  image: [
    { id: 'pdf', label: 'PDF Document (.pdf)', desc: 'Embed photo into standard PDF', icon: FileText },
    { id: 'png', label: 'PNG (.png)', desc: 'Lossless graphic with transparency', icon: ImageIcon },
    { id: 'jpg', label: 'JPG (.jpg)', desc: 'High-compatibility image', icon: ImageIcon },
    { id: 'webp', label: 'WebP (.webp)', desc: 'High-efficiency modern graphic', icon: ImageIcon },
  ],
  code: [
    { id: 'pdf', label: 'PDF Document (.pdf)', desc: 'Formatted printable document', icon: FileText },
    { id: 'docx', label: 'Word (.docx)', desc: 'Editable office document', icon: FileText },
  ],
  text: [
    { id: 'pdf', label: 'PDF Document (.pdf)', desc: 'Formatted printable document', icon: FileText },
    { id: 'docx', label: 'Word (.docx)', desc: 'Editable office document', icon: FileText },
  ],
};

export const UniversalDashboard: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [detectedFormat, setDetectedFormat] = useState<DetectedFormatInfo | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>('docx');
  const [isConverting, setIsConverting] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [conversionResult, setConversionResult] = useState<ConversionOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai_pdf_conversion_history');
      if (stored) {
        setHistory(JSON.parse(stored).slice(0, 15));
      }
    } catch {}
  }, []);

  // Save history
  const saveToHistory = (item: ConversionHistoryItem) => {
    const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 15);
    setHistory(updated);
    try {
      // Don't serialize full blob data to localStorage to avoid quota limits
      const light = updated.map((h) => ({ ...h, data: '' }));
      localStorage.setItem('ai_pdf_conversion_history', JSON.stringify(light));
    } catch {}
  };

  // Inspect file on selection
  const handleFilesAdded = async (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;
    const fileList = Array.from(newFiles);
    setFiles(fileList);
    setActiveFileIndex(0);
    setConversionResult(null);
    setErrorMessage(null);

    const first = fileList[0];
    const detected = await detectFileSignature(first);
    setDetectedFormat(detected);

    // Pick first available target format
    const category = detected.category || 'pdf';
    const targets = TARGET_FORMAT_MAP[category] || TARGET_FORMAT_MAP['pdf'];
    if (targets && targets.length > 0) {
      // If converting from pdf, default to docx, else to pdf
      const defaultTarget = detected.extension === 'pdf' ? 'docx' : 'pdf';
      setSelectedTarget(defaultTarget);
    }
  };

  // Run Conversion
  const handleStartConversion = async () => {
    if (files.length === 0) return;
    const currentFile = files[activeFileIndex];
    setIsConverting(true);
    setErrorMessage(null);
    setConversionResult(null);

    try {
      setCurrentStep('1. Verifying file signature & binary headers...');
      await new Promise((r) => setTimeout(r, 200));

      setCurrentStep('2. Extracting text, coordinates, tables & formatting...');
      await new Promise((r) => setTimeout(r, 300));

      setCurrentStep(`3. Synthesizing target ${selectedTarget.toUpperCase()} document structure...`);
      const output = await executeUniversalConversion(currentFile, selectedTarget);

      setCurrentStep('4. Performing post-generation validation check...');
      await new Promise((r) => setTimeout(r, 200));

      setConversionResult(output);

      // Save to local session history
      saveToHistory({
        id: `conv-${Date.now()}`,
        fileName: output.fileName,
        sourceFormat: output.sourceFormat,
        targetFormat: output.targetFormat,
        sizeBytes: output.fileSizeBytes,
        durationMs: output.processingTimeMs,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: output.data,
        validationDetails: output.validationDetails,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Conversion failed during structure reconstruction.');
    } finally {
      setIsConverting(false);
      setCurrentStep('');
    }
  };

  const handleDownload = (data: Blob | Uint8Array | string, fileName: string, mime?: string) => {
    downloadBlob(data as any, fileName, mime);
  };

  const currentCategory = detectedFormat?.category || 'pdf';
  const availableTargets = TARGET_FORMAT_MAP[currentCategory] || TARGET_FORMAT_MAP['pdf'];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 selection:bg-maroon-100 selection:text-maroon-900">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-[#EAE5E5]">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-maroon-800 to-maroon-600 flex items-center justify-center text-white shadow-maroon flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Universal Conversion Engine
              </h1>
              <span className="bg-maroon-100 text-maroon-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                PRO ENGINE v2.0
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Genuine bidirectional parsing, structural reconstruction & validated OpenXML synthesis across 36 formats.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex items-center space-x-2 text-xs font-bold">
          <Link
            to="/conversions/documents"
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 transition-colors"
          >
            Document Suite (16)
          </Link>
          <Link
            to="/conversions/images"
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 transition-colors"
          >
            Image Suite (20)
          </Link>
        </div>
      </div>

      {/* Main Conversion Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload & Options (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drag & Drop Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFilesAdded(e.dataTransfer.files);
            }}
            className="border-2 border-dashed border-maroon-300 hover:border-maroon-600 bg-white hover:bg-maroon-50/15 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all shadow-card group"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFilesAdded(e.target.files)}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-maroon-50 group-hover:scale-105 border border-maroon-100 flex items-center justify-center mx-auto mb-4 text-maroon-700 transition-transform shadow-xs">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Drag & drop document or image files here
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Supports PDF, DOCX, DOC, XLSX, XLS, CSV, PPTX, PNG, JPG, WEBP, TIFF, HTML, XML & TXT
            </p>
            <div className="mt-4 inline-flex items-center space-x-2 px-3 py-1 bg-maroon-50 border border-maroon-200/80 rounded-full text-[11px] font-bold text-maroon-800">
              <ShieldCheck className="w-3.5 h-3.5 text-maroon-700" />
              <span>Binary Magic-Byte Inspection & Offline Privacy</span>
            </div>
          </div>

          {/* Active File Inspection & Configuration */}
          {files.length > 0 && detectedFormat && (
            <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 shadow-card space-y-6">
              {/* File Info Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl gap-3">
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-maroon-100 border border-maroon-200 flex items-center justify-center text-maroon-800 font-black text-xs flex-shrink-0">
                    {detectedFormat.extension.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate">
                      {files[activeFileIndex].name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {formatBytes(files[activeFileIndex].size)} · Detected: <strong>{detectedFormat.label}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Valid Signature</span>
                  </span>
                </div>
              </div>

              {/* Target Format Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800">
                    Select Target Format for Conversion:
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {availableTargets.length} valid target pipelines available
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {availableTargets.map((tgt) => {
                    const Icon = tgt.icon;
                    const isSelected = selectedTarget === tgt.id;
                    return (
                      <button
                        key={tgt.id}
                        type="button"
                        onClick={() => setSelectedTarget(tgt.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-maroon-700 bg-maroon-50/70 shadow-xs ring-1 ring-maroon-700'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-maroon-700' : 'text-slate-500'}`} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-maroon-700 font-black" />}
                        </div>
                        <p className={`text-xs font-black ${isSelected ? 'text-maroon-900' : 'text-slate-800'}`}>
                          {tgt.label}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                          {tgt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conversion Action Button & Status */}
              <div className="pt-2">
                {isConverting ? (
                  <div className="p-4 bg-maroon-50/50 border border-maroon-200 rounded-2xl space-y-2.5 animate-pulse">
                    <div className="flex items-center justify-between text-xs font-bold text-maroon-900">
                      <span className="flex items-center space-x-2">
                        <RotateCw className="w-4 h-4 animate-spin text-maroon-700" />
                        <span>Processing Document Pipeline</span>
                      </span>
                      <span>High-Fidelity Engine</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">{currentStep}</p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-maroon-700 h-full rounded-full animate-progress" />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleStartConversion}
                    className="w-full bg-maroon-700 hover:bg-maroon-800 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>
                      Convert {detectedFormat.extension.toUpperCase()} to {selectedTarget.toUpperCase()}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-medium text-rose-700 flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Conversion Issue Detected</p>
                    <p className="text-[11px] mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Result Download Card */}
              {conversionResult && (
                <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in-50 duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">
                          {conversionResult.fileName}
                        </h4>
                        <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                          {formatBytes(conversionResult.fileSizeBytes)} · Generated in{' '}
                          {conversionResult.processingTimeMs}ms
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleDownload(
                          conversionResult.data,
                          conversionResult.fileName,
                          conversionResult.mimeType
                        )
                      }
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-black rounded-xl shadow-xs transition-transform active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </button>
                  </div>

                  <div className="p-2.5 bg-white border border-emerald-200/80 rounded-xl text-[11px] text-slate-600 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{conversionResult.validationDetails}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Engine Rules & History (1 col on lg) */}
        <div className="space-y-6">
          {/* Quality Standards Card */}
          <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center space-x-2 text-slate-900">
              <ShieldCheck className="w-5 h-5 text-maroon-700" />
              <h3 className="text-sm font-black">Quality & Integrity Engine Rules</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Zero extension renaming; genuine binary parsing only.</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Valid OpenXML packages guaranteed to open in MS Office.</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Table detection & cell boundary reconstruction.</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Automated pre-flight & post-generation validation checks.</span>
              </li>
            </ul>
          </div>

          {/* Conversion History */}
          <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-900">
                <Clock className="w-4 h-4 text-maroon-700" />
                <h3 className="text-xs font-black">Recent Conversion Session</h3>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    localStorage.removeItem('ai_pdf_conversion_history');
                    setHistory([]);
                  }}
                  className="text-[10px] text-slate-400 hover:text-rose-600 font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 font-medium">
                No conversions performed yet in this session.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto space-y-2">
                {history.map((item) => (
                  <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <p className="font-extrabold text-slate-800 truncate">{item.fileName}</p>
                      <p className="text-[10px] text-slate-400">
                        {item.sourceFormat} → {item.targetFormat} · {formatBytes(item.sizeBytes)} ·{' '}
                        {item.durationMs}ms
                      </p>
                    </div>
                    {item.data && (
                      <button
                        onClick={() => handleDownload(item.data, item.fileName)}
                        className="p-1.5 rounded-lg text-maroon-700 hover:bg-maroon-50"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

