import React, { useState } from 'react';
import {
  Hash,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { addPageNumbers, downloadBlob, formatBytes } from '../../utils/pdfEngine';
import { useDocumentStore } from '../../store/useDocumentStore';

export const PageNumbers: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<
    'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left'
  >('bottom-center');
  const [format, setFormat] = useState<'number' | 'page-of-total'>('page-of-total');
  const [fontSize, setFontSize] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [numberedBlob, setNumberedBlob] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addDocument } = useDocumentStore();

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setFile(e.target.files[0]);
    setNumberedBlob(null);
    setError(null);
  };

  const handleAddNumbers = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await addPageNumbers(file, {
        position,
        format,
        fontSize,
      });
      setNumberedBlob(result);

      // Save into library
      addDocument({
        id: `numbered-${Date.now()}`,
        name: `${file.name.replace(/\.pdf$/i, '')}_numbered.pdf`,
        size: result.byteLength,
        pages: 12,
        type: 'application/pdf',
        updatedAt: new Date().toISOString(),
        category: 'general',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to add page numbers.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!numberedBlob || !file) return;
    downloadBlob(numberedBlob, `${file.name.replace(/\.pdf$/i, '')}_numbered.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3.5 pb-2">
        <div className="w-12 h-12 rounded-2xl bg-maroon-50 border border-maroon-100 flex items-center justify-center">
          <Hash className="w-6 h-6 text-maroon-700" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Add Page Numbers</h1>
          <p className="text-xs text-slate-500 font-medium">
            Stamp automated sequential page numbering into headers or footers with customizable format.
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
          <p className="text-base font-extrabold text-slate-900">Select a PDF to number</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Insert header or footer folio pagination</p>
        </label>
      ) : (
        <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 shadow-xs space-y-6">
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
                setNumberedBlob(null);
              }}
              className="text-xs font-bold text-maroon-700 hover:text-maroon-900"
            >
              Change File
            </button>
          </div>

          {/* Position Selector */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
              Placement Position
            </label>
            <div className="grid grid-cols-3 gap-2.5 max-w-lg mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {[
                { id: 'top-left', label: 'Top Left' },
                { id: 'top-center', label: 'Top Center' },
                { id: 'top-right', label: 'Top Right' },
                { id: 'bottom-left', label: 'Bottom Left' },
                { id: 'bottom-center', label: 'Bottom Center' },
                { id: 'bottom-right', label: 'Bottom Right' },
              ].map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => setPosition(pos.id as any)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold text-center border transition-all ${
                    position === pos.id
                      ? 'border-maroon-600 bg-maroon-700 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Numbering Format Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                Folio Format
              </label>
              <div className="space-y-2">
                {[
                  { id: 'page-of-total', label: 'Page 1 of Total', example: 'Page 1 of 12' },
                  { id: 'number', label: 'Simple Digits', example: '1, 2, 3...' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id as any)}
                    className={`w-full p-3 rounded-xl text-left border flex items-center justify-between transition-all ${
                      format === fmt.id
                        ? 'border-maroon-600 bg-maroon-50/50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-extrabold text-slate-800">{fmt.label}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{fmt.example}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                Font Size ({fontSize} pt)
              </label>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center h-24">
                <input
                  type="range"
                  min="8"
                  max="16"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full accent-maroon-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-2">
                  <span>8 pt (Subtle)</span>
                  <span>12 pt (Standard)</span>
                  <span>16 pt (Large)</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs font-medium text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            {!numberedBlob ? (
              <button
                onClick={handleAddNumbers}
                disabled={isProcessing}
                className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:bg-slate-200 text-white font-extrabold text-sm py-4 rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <Hash className="w-4 h-4" />
                <span>{isProcessing ? 'Stamping Numbers...' : 'Add Page Numbers to PDF'}</span>
              </button>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-extrabold">Page Numbers Inserted!</p>
                    <p className="text-[11px] text-emerald-700">Document ready for download.</p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Numbered PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
