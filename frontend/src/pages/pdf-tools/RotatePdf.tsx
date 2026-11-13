import React, { useState } from 'react';
import {
  RotateCw,
  RotateCcw,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { rotatePdf, downloadBlob, formatBytes } from '../../utils/pdfEngine';
import { useDocumentStore } from '../../store/useDocumentStore';

export const RotatePdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotatedBlob, setRotatedBlob] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addDocument } = useDocumentStore();

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setFile(e.target.files[0]);
    setRotatedBlob(null);
    setError(null);
  };

  const handleRotate = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await rotatePdf(file, rotationAngle);
      setRotatedBlob(result);

      // Save into library
      addDocument({
        id: `rotated-${Date.now()}`,
        name: `${file.name.replace(/\.pdf$/i, '')}_rotated.pdf`,
        size: result.byteLength,
        pages: 6,
        type: 'application/pdf',
        updatedAt: new Date().toISOString(),
        category: 'general',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to rotate PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!rotatedBlob || !file) return;
    downloadBlob(rotatedBlob, `${file.name.replace(/\.pdf$/i, '')}_rotated.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3.5 pb-2">
        <div className="w-12 h-12 rounded-2xl bg-maroon-50 border border-maroon-100 flex items-center justify-center">
          <RotateCw className="w-6 h-6 text-maroon-700" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Rotate PDF Pages</h1>
          <p className="text-xs text-slate-500 font-medium">
            Permanently adjust the display orientation of your document pages.
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
          <p className="text-base font-extrabold text-slate-900">Select a PDF to rotate</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Adjust landscape, portrait, or flipped orientation</p>
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
                setRotatedBlob(null);
              }}
              className="text-xs font-bold text-maroon-700 hover:text-maroon-900"
            >
              Change File
            </button>
          </div>

          {/* Visual Rotation Preview Box */}
          <div className="bg-[#FAF9F9] border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center">
            <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-6">
              Orientation Preview
            </p>
            <div
              className="w-32 h-44 bg-white border-2 border-maroon-600 rounded-xl shadow-md flex flex-col justify-between p-3 transition-transform duration-300"
              style={{ transform: `rotate(${rotationAngle}deg)` }}
            >
              <div className="w-full h-2 bg-maroon-100 rounded" />
              <div className="space-y-1">
                <div className="w-3/4 h-1.5 bg-slate-200 rounded" />
                <div className="w-full h-1.5 bg-slate-200 rounded" />
                <div className="w-5/6 h-1.5 bg-slate-200 rounded" />
              </div>
              <p className="text-[9px] font-bold text-center text-maroon-800">TOP</p>
            </div>
            <span className="text-xs font-bold text-maroon-800 mt-6 bg-maroon-50 border border-maroon-200 px-3 py-1 rounded-full">
              Current Shift: +{rotationAngle}°
            </span>
          </div>

          {/* Rotation Angle Controls */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { angle: 90, label: '90° Clockwise', icon: RotateCw },
              { angle: 180, label: '180° Flip', icon: RefreshCw },
              { angle: 270, label: '90° Counter-Clockwise', icon: RotateCcw },
            ].map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.angle}
                  onClick={() => setRotationAngle(btn.angle)}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    rotationAngle === btn.angle
                      ? 'border-maroon-600 bg-maroon-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 mx-auto mb-1.5 ${rotationAngle === btn.angle ? 'text-maroon-700' : 'text-slate-500'}`} />
                  <p className={`text-xs font-extrabold ${rotationAngle === btn.angle ? 'text-maroon-900' : 'text-slate-800'}`}>
                    {btn.label}
                  </p>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs font-medium text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            {!rotatedBlob ? (
              <button
                onClick={handleRotate}
                disabled={isProcessing}
                className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:bg-slate-200 text-white font-extrabold text-sm py-4 rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <RotateCw className="w-4 h-4" />
                <span>{isProcessing ? 'Applying Rotation...' : `Rotate Document (${rotationAngle}°)`}</span>
              </button>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-extrabold">Rotation Completed Successfully!</p>
                    <p className="text-[11px] text-emerald-700">Saved to library and ready to download.</p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Rotated PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
