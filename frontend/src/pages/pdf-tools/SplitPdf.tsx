import React, { useState } from 'react';
import {
  Scissors,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
} from 'lucide-react';
import { splitPdf, downloadBlob, formatBytes } from '../../utils/pdfEngine';
import { useDocumentStore } from '../../store/useDocumentStore';

export const SplitPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [splitMode, setSplitMode] = useState<'range' | 'all' | 'odd' | 'even'>('range');
  const [pageRange, setPageRange] = useState('1-3');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputBlob, setOutputBlob] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addDocument } = useDocumentStore();

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setFile(e.target.files[0]);
    setOutputBlob(null);
    setError(null);
  };

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      let rangeQuery = pageRange;
      if (splitMode === 'all') rangeQuery = 'all';
      if (splitMode === 'odd') rangeQuery = 'odd';
      if (splitMode === 'even') rangeQuery = 'even';

      const splitBytes = await splitPdf(file, rangeQuery);
      setOutputBlob(splitBytes);

      // Save extracted file into library
      addDocument({
        id: `split-${Date.now()}`,
        name: `${file.name.replace(/\.pdf$/i, '')}_extracted.pdf`,
        size: splitBytes.byteLength,
        pages: 3,
        type: 'application/pdf',
        updatedAt: new Date().toISOString(),
        category: 'general',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to split document. Please check page range formatting.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputBlob || !file) return;
    downloadBlob(outputBlob, `${file.name.replace(/\.pdf$/i, '')}_split.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3.5 pb-2">
        <div className="w-12 h-12 rounded-2xl bg-maroon-50 border border-maroon-100 flex items-center justify-center">
          <Scissors className="w-6 h-6 text-maroon-700" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Split & Extract PDF Pages</h1>
          <p className="text-xs text-slate-500 font-medium">
            Extract custom page ranges or separate odd/even pages into a new document.
          </p>
        </div>
      </div>

      {!file ? (
        <label className="block border-2 border-dashed border-maroon-200 hover:border-maroon-400 bg-white hover:bg-maroon-50/10 rounded-3xl p-10 text-center cursor-pointer transition-all shadow-xs">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileSelected}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-maroon-50 flex items-center justify-center mx-auto mb-3.5 text-maroon-700">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-base font-extrabold text-slate-900">Choose a PDF file to split</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Supports multi-page documents up to 500 MB</p>
        </label>
      ) : (
        <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 shadow-xs space-y-6">
          {/* File details card */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-maroon-50 border border-maroon-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-maroon-700" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900">{file.name}</p>
                <p className="text-[11px] text-slate-500 font-medium">{formatBytes(file.size)}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setOutputBlob(null);
              }}
              className="text-xs font-bold text-maroon-700 hover:text-maroon-900"
            >
              Change File
            </button>
          </div>

          {/* Split Mode Selector */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
              Extraction Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'range', label: 'Custom Range', desc: 'e.g. 1-3, 5, 8' },
                { id: 'all', label: 'All Pages', desc: 'Every single sheet' },
                { id: 'odd', label: 'Odd Pages', desc: 'Pages 1, 3, 5...' },
                { id: 'even', label: 'Even Pages', desc: 'Pages 2, 4, 6...' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSplitMode(mode.id as any)}
                  className={`p-3.5 rounded-2xl text-left border transition-all ${
                    splitMode === mode.id
                      ? 'border-maroon-600 bg-maroon-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className={`text-xs font-extrabold ${splitMode === mode.id ? 'text-maroon-900' : 'text-slate-800'}`}>
                    {mode.label}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{mode.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Range Input */}
          {splitMode === 'range' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Page Ranges</label>
              <input
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="e.g. 1-4, 7, 9-12"
                className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-maroon-600 focus:ring-1 focus:ring-maroon-600"
              />
              <p className="text-[11px] text-slate-400">
                Separate ranges with commas, for example: 1-5, 8, 11-15.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs font-medium text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Trigger */}
          <div>
            {!outputBlob ? (
              <button
                onClick={handleSplit}
                disabled={isProcessing}
                className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:bg-slate-200 text-white font-extrabold text-sm py-4 rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <Scissors className="w-4 h-4" />
                <span>{isProcessing ? 'Extracting Pages...' : 'Extract & Create PDF'}</span>
              </button>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-extrabold">Pages Extracted Successfully!</p>
                    <p className="text-[11px] text-emerald-700">New PDF generated and saved to library.</p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Extracted PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
