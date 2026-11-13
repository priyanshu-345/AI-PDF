import React, { useState } from 'react';
import {
  Files,
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
} from 'lucide-react';
import { mergePdfs, downloadBlob, formatBytes } from '../../utils/pdfEngine';
import { useDocumentStore } from '../../store/useDocumentStore';

interface MergeItem {
  id: string;
  file: File;
  name: string;
  size: number;
}

export const MergePdf: React.FC = () => {
  const [items, setItems] = useState<MergeItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedBlob, setMergedBlob] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addDocument } = useDocumentStore();

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const newItems: MergeItem[] = Array.from(e.target.files).map((f) => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      name: f.name,
      size: f.size,
    }));
    setItems((prev) => [...prev, ...newItems]);
    setMergedBlob(null);
    setError(null);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    const clone = [...items];
    const [removed] = clone.splice(index, 1);
    clone.splice(target, 0, removed);
    setItems(clone);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setMergedBlob(null);
  };

  const handleMerge = async () => {
    if (items.length < 2) {
      setError('Please add at least 2 PDF files to merge.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const merged = await mergePdfs(items.map((i) => i.file));
      setMergedBlob(merged);

      // Save to library
      addDocument({
        id: `merged-${Date.now()}`,
        name: `Merged_Document_${new Date().toISOString().slice(0, 10)}.pdf`,
        size: merged.byteLength,
        pages: 10,
        type: 'application/pdf',
        updatedAt: new Date().toISOString(),
        category: 'general',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to merge documents. Please verify PDFs are not encrypted.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!mergedBlob) return;
    downloadBlob(mergedBlob, `Merged_Document_${Date.now()}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center space-x-3.5 pb-2">
        <div className="w-12 h-12 rounded-2xl bg-maroon-50 border border-maroon-100 flex items-center justify-center">
          <Files className="w-6 h-6 text-maroon-700" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Merge PDF Documents</h1>
          <p className="text-xs text-slate-500 font-medium">
            Combine multiple PDF files into one ordered document in seconds. 100% processed in your browser.
          </p>
        </div>
      </div>

      {/* Dropzone */}
      <label className="block border-2 border-dashed border-maroon-200 hover:border-maroon-400 bg-white hover:bg-maroon-50/10 rounded-3xl p-8 text-center cursor-pointer transition-all shadow-xs">
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
        />
        <div className="w-14 h-14 rounded-2xl bg-maroon-50 flex items-center justify-center mx-auto mb-3.5 text-maroon-700">
          <Upload className="w-6 h-6" />
        </div>
        <p className="text-base font-extrabold text-slate-900">
          Click or drop PDF files here to merge
        </p>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Select 2 or more files. You can rearrange their sequence below.
        </p>
      </label>

      {/* Selected Items List */}
      {items.length > 0 && (
        <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Files to Combine ({items.length})
            </span>
            <label className="text-xs font-bold text-maroon-700 hover:text-maroon-800 cursor-pointer flex items-center space-x-1">
              <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
              />
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add More Files</span>
            </label>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1 mr-3">
                  <span className="w-6 h-6 rounded-full bg-maroon-100 text-maroon-800 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{formatBytes(item.size)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-white"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === items.length - 1}
                    className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-white"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 ml-1"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs font-medium text-red-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Trigger */}
          <div className="pt-2">
            {!mergedBlob ? (
              <button
                onClick={handleMerge}
                disabled={isProcessing || items.length < 2}
                className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:bg-slate-200 text-white font-extrabold text-sm py-4 rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <Files className="w-4 h-4" />
                <span>{isProcessing ? 'Merging PDF Pages...' : `Merge ${items.length} PDF Files`}</span>
              </button>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-extrabold">PDF Merged Successfully!</p>
                    <p className="text-[11px] text-emerald-700">Saved to library and ready to download.</p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Merged PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
