import React, { useState } from 'react';
import {
  Stamp,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
} from 'lucide-react';
import { watermarkPdf, downloadBlob, formatBytes } from '../../utils/pdfEngine';
import { useDocumentStore } from '../../store/useDocumentStore';

export const WatermarkPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.3);
  const [fontSize, setFontSize] = useState(48);
  const [angle, setAngle] = useState(-45);
  const [colorHex, setColorHex] = useState('#800020'); // Maroon
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkedBlob, setWatermarkedBlob] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addDocument } = useDocumentStore();

  const presets = ['CONFIDENTIAL', 'DRAFT', 'APPROVED', 'INTERNAL ONLY', 'SAMPLE'];

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setFile(e.target.files[0]);
    setWatermarkedBlob(null);
    setError(null);
  };

  const handleWatermark = async () => {
    if (!file || !text.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await watermarkPdf(file, {
        text: text.trim(),
        opacity,
        fontSize,
        rotationDegrees: angle,
        colorHex,
      });
      setWatermarkedBlob(result);

      // Save to library
      addDocument({
        id: `watermarked-${Date.now()}`,
        name: `${file.name.replace(/\.pdf$/i, '')}_watermarked.pdf`,
        size: result.byteLength,
        pages: 5,
        type: 'application/pdf',
        updatedAt: new Date().toISOString(),
        category: 'legal',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to apply watermark.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!watermarkedBlob || !file) return;
    downloadBlob(watermarkedBlob, `${file.name.replace(/\.pdf$/i, '')}_watermarked.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3.5 pb-2">
        <div className="w-12 h-12 rounded-2xl bg-maroon-50 border border-maroon-100 flex items-center justify-center">
          <Stamp className="w-6 h-6 text-maroon-700" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Add Watermark to PDF</h1>
          <p className="text-xs text-slate-500 font-medium">
            Stamp security notices, status markers, or branding onto every page of your document.
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
          <p className="text-base font-extrabold text-slate-900">Select a PDF to watermark</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Configure text, transparency, angle and colors</p>
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
                setWatermarkedBlob(null);
              }}
              className="text-xs font-bold text-maroon-700 hover:text-maroon-900"
            >
              Change File
            </button>
          </div>

          {/* Watermark Configuration Form */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block mb-1.5">
                Watermark Text
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter stamp text..."
                className="w-full bg-[#FAF9F9] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-maroon-600 focus:ring-1 focus:ring-maroon-600"
              />
              {/* Presets */}
              <div className="flex flex-wrap gap-2 mt-2">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setText(preset)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-maroon-50 text-[11px] font-bold text-slate-600 hover:text-maroon-800 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Opacity</span>
                  <span className="font-mono">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.9"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full accent-maroon-700 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Font Size</span>
                  <span className="font-mono">{fontSize} pt</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="72"
                  step="2"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full accent-maroon-700 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Rotation Angle</span>
                  <span className="font-mono">{angle}°</span>
                </div>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  step="5"
                  value={angle}
                  onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                  className="w-full accent-maroon-700 cursor-pointer"
                />
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
            {!watermarkedBlob ? (
              <button
                onClick={handleWatermark}
                disabled={isProcessing || !text.trim()}
                className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:bg-slate-200 text-white font-extrabold text-sm py-4 rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <Stamp className="w-4 h-4" />
                <span>{isProcessing ? 'Stamping Watermark...' : 'Apply Watermark to PDF'}</span>
              </button>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-extrabold">Watermark Stamped Successfully!</p>
                    <p className="text-[11px] text-emerald-700">Ready to download and saved to library.</p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Watermarked PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
