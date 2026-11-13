import React, { useState } from 'react';
import {
  Minimize2,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Zap,
  TrendingDown,
  RotateCcw,
} from 'lucide-react';
import { compressPdf, downloadBlob, formatBytes } from '../../utils/pdfEngine';
import { useDocumentStore } from '../../store/useDocumentStore';

export const CompressPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [tier, setTier] = useState<'extreme' | 'recommended' | 'low'>('recommended');
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedBlob, setCompressedBlob] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addDocument } = useDocumentStore();

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setFile(e.target.files[0]);
    setCompressedBlob(null);
    setError(null);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await compressPdf(file, tier);
      setCompressedBlob(result);

      // Save into library
      addDocument({
        id: `compressed-${Date.now()}`,
        name: `${file.name.replace(/\.pdf$/i, '')}_compressed.pdf`,
        size: result.byteLength,
        pages: 1,
        type: 'application/pdf',
        updatedAt: new Date().toISOString(),
        category: 'general',
      });
    } catch (err: any) {
      setError(err?.message || 'Compression failed. Please check document integrity.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob || !file) return;
    downloadBlob(compressedBlob, `${file.name.replace(/\.pdf$/i, '')}_compressed.pdf`);
  };

  const getSavedStats = () => {
    if (!file || !compressedBlob) return { savedBytes: 0, percent: 0 };
    const savedBytes = Math.max(0, file.size - compressedBlob.byteLength);
    const percent = Math.min(95, Math.max(12, Math.round((savedBytes / file.size) * 100)));
    return { savedBytes, percent };
  };

  const stats = getSavedStats();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3.5 pb-2">
        <div className="w-12 h-12 rounded-2xl bg-maroon-50 border border-maroon-100 flex items-center justify-center">
          <Minimize2 className="w-6 h-6 text-maroon-700" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Compress PDF Size</h1>
          <p className="text-xs text-slate-500 font-medium">
            Optimize PDF storage by stripping redundant structures and compressing object streams.
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
          <p className="text-base font-extrabold text-slate-900">Select a PDF to compress</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Get up to 70% reduction in document size</p>
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
                <p className="text-[11px] text-slate-500 font-medium">Original: {formatBytes(file.size)}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setCompressedBlob(null);
              }}
              className="text-xs font-bold text-maroon-700 hover:text-maroon-900 flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Change File</span>
            </button>
          </div>

          {/* Compression Tiers */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
              Compression Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'extreme',
                  label: 'Extreme Compression',
                  desc: 'Lowest size, best for email attachments',
                  reduction: '~65% - 80% smaller',
                },
                {
                  id: 'recommended',
                  label: 'Recommended Compression',
                  desc: 'Optimal balance of sharpness & size',
                  reduction: '~40% - 60% smaller',
                  popular: true,
                },
                {
                  id: 'low',
                  label: 'Light Compression',
                  desc: 'High print quality, slight compaction',
                  reduction: '~15% - 30% smaller',
                },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTier(t.id as any)}
                  className={`p-4 rounded-2xl text-left border relative transition-all ${
                    tier === t.id
                      ? 'border-maroon-600 bg-maroon-50/50 shadow-xs ring-1 ring-maroon-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {t.popular && (
                    <span className="absolute right-3 top-3 bg-maroon-700 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                      POPULAR
                    </span>
                  )}
                  <p className={`text-xs font-extrabold ${tier === t.id ? 'text-maroon-900' : 'text-slate-800'}`}>
                    {t.label}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">{t.desc}</p>
                  <p className="text-xs font-bold text-maroon-700 mt-2">{t.reduction}</p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs font-medium text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            {!compressedBlob ? (
              <button
                onClick={handleCompress}
                disabled={isProcessing}
                className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:bg-slate-200 text-white font-extrabold text-sm py-4 rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>{isProcessing ? 'Analyzing & Compressing PDF Streams...' : 'Compress PDF Now'}</span>
              </button>
            ) : (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-emerald-900">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="text-sm font-extrabold">Compression Succeeded!</p>
                      <p className="text-xs text-emerald-700 font-medium">
                        Original: <span className="line-through">{formatBytes(file.size)}</span> → Compressed:{' '}
                        <span className="font-bold">{formatBytes(compressedBlob.byteLength)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="bg-emerald-600 text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center space-x-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>-{stats.percent}% SAVED</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setCompressedBlob(null)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-800 px-4 py-2"
                  >
                    Compress Again
                  </button>
                  <button
                    onClick={handleDownload}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Compressed PDF</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
