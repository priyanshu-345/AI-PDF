import React, { useState } from 'react';
import {
  Image,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
} from 'lucide-react';
import { imagesToPdf, downloadBlob, formatBytes } from '../../utils/pdfEngine';
import { useDocumentStore } from '../../store/useDocumentStore';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export const ImagesToPdf: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addDocument } = useDocumentStore();

  const handleImagesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const newItems: ImageItem[] = Array.from(e.target.files).map((f) => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));
    setImages((prev) => [...prev, ...newItems]);
    setPdfBlob(null);
    setError(null);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    const clone = [...images];
    const [removed] = clone.splice(index, 1);
    clone.splice(target, 0, removed);
    setImages(clone);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setPdfBlob(null);
  };

  const handleCompile = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await imagesToPdf(images.map((i) => i.file));
      setPdfBlob(result);

      // Save into library
      addDocument({
        id: `imgpdf-${Date.now()}`,
        name: `Photos_${new Date().toISOString().slice(0, 10)}.pdf`,
        size: result.byteLength,
        pages: images.length,
        type: 'application/pdf',
        updatedAt: new Date().toISOString(),
        category: 'general',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to convert images to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    downloadBlob(pdfBlob, `Images_Compiled_${Date.now()}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3.5 pb-2">
        <div className="w-12 h-12 rounded-2xl bg-maroon-50 border border-maroon-100 flex items-center justify-center">
          <Image className="w-6 h-6 text-maroon-700" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Convert Images to PDF</h1>
          <p className="text-xs text-slate-500 font-medium">
            Turn multiple JPG, PNG, or WebP photos into a clean, standardized multipage PDF.
          </p>
        </div>
      </div>

      {/* Image selector */}
      <label className="block border-2 border-dashed border-maroon-200 hover:border-maroon-400 bg-white hover:bg-maroon-50/10 rounded-3xl p-8 text-center cursor-pointer transition-all shadow-xs">
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          multiple
          onChange={handleImagesSelected}
          className="hidden"
        />
        <div className="w-14 h-14 rounded-2xl bg-maroon-50 flex items-center justify-center mx-auto mb-3.5 text-maroon-700">
          <Upload className="w-6 h-6" />
        </div>
        <p className="text-base font-extrabold text-slate-900">
          Click or drop photos here to create PDF
        </p>
        <p className="text-xs text-slate-500 font-medium mt-1">Supports PNG, JPG, and WebP images</p>
      </label>

      {/* Photos Grid */}
      {images.length > 0 && (
        <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Selected Photos ({images.length})
            </span>
            <label className="text-xs font-bold text-maroon-700 hover:text-maroon-800 cursor-pointer flex items-center space-x-1">
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                multiple
                onChange={handleImagesSelected}
                className="hidden"
              />
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add More Photos</span>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((item, idx) => (
              <div
                key={item.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-2 flex flex-col justify-between group relative"
              >
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-200 relative mb-2">
                  <img src={item.previewUrl} alt="preview" className="w-full h-full object-cover" />
                  <span className="absolute left-2 top-2 bg-slate-900/80 text-white font-extrabold text-[10px] w-5 h-5 rounded-md flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>

                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] font-bold text-slate-700 truncate max-w-[90px]">
                    {item.file.name}
                  </p>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => moveImage(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-20"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveImage(idx, 'down')}
                      disabled={idx === images.length - 1}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-20"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeImage(item.id)}
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs font-medium text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            {!pdfBlob ? (
              <button
                onClick={handleCompile}
                disabled={isProcessing}
                className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:bg-slate-200 text-white font-extrabold text-sm py-4 rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <Image className="w-4 h-4" />
                <span>{isProcessing ? 'Generating PDF...' : `Compile ${images.length} Images to PDF`}</span>
              </button>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-extrabold">PDF Generated Successfully!</p>
                    <p className="text-[11px] text-emerald-700">All photos assembled and saved to library.</p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Photo PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
