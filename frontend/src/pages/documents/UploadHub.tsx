import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  CheckCircle2,
  FileText,
  AlertCircle,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { useAuthStore } from '../../store/useAuthStore';
import { formatBytes } from '../../utils/pdfEngine';

export const UploadHub: React.FC = () => {
  const navigate = useNavigate();
  const { addDocument, getTotalStorageUsed } = useDocumentStore();
  const { user } = useAuthStore();

  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<'technical' | 'financial' | 'legal' | 'general'>('general');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setFiles(Array.from(e.target.files));
  };

  const handleUploadSubmit = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setProgress(20);

    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(timer);
          return 90;
        }
        return p + 25;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(timer);
      setProgress(100);

      // Add each file to the store
      files.forEach((file) => {
        addDocument({
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          name: file.name,
          size: file.size,
          pages: Math.max(1, Math.round(file.size / 90000)),
          type: file.type || 'application/pdf',
          updatedAt: new Date().toISOString(),
          category,
        });
      });

      setTimeout(() => {
        setIsUploading(false);
        navigate('/documents');
      }, 500);
    }, 1200);
  };

  const totalUsed = getTotalStorageUsed();
  const quota = user?.storageQuotaBytes || 10737418240;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-3.5 pb-2">
        <div className="w-12 h-12 rounded-2xl bg-maroon-50 border border-maroon-100 flex items-center justify-center">
          <Upload className="w-6 h-6 text-maroon-700" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Upload Documents</h1>
          <p className="text-xs text-slate-500 font-medium">
            Ingest PDFs into your secure browser workspace for automated indexing and instant tool manipulation.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#EAE5E5] rounded-3xl p-8 shadow-xs space-y-6">
        {/* Dropzone */}
        <label className="block border-2 border-dashed border-maroon-200 hover:border-maroon-400 bg-white hover:bg-maroon-50/10 rounded-3xl p-10 text-center cursor-pointer transition-all">
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleFiles}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-maroon-50 flex items-center justify-center mx-auto mb-4 text-maroon-700">
            <Upload className="w-8 h-8" />
          </div>
          <p className="text-base font-extrabold text-slate-900">
            {files.length > 0 ? `${files.length} File(s) Selected` : 'Click or Drag PDFs to Upload'}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Standard PDF format up to 500 MB per document
          </p>
        </label>

        {/* Selected Files List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
              Pending Uploads
            </span>
            <div className="space-y-2">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2.5 truncate mr-3">
                    <FileText className="w-4 h-4 text-maroon-700 flex-shrink-0" />
                    <span className="font-bold text-slate-800 truncate">{f.name}</span>
                  </div>
                  <span className="text-slate-500 font-medium flex-shrink-0">{formatBytes(f.size)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Classification */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
            Classification Tag
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['general', 'technical', 'financial', 'legal'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-2.5 rounded-xl text-xs font-bold capitalize border transition-all ${
                  category === cat
                    ? 'border-maroon-600 bg-maroon-50/70 text-maroon-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-extrabold text-maroon-800">
              <span>Uploading & Parsing Text Index...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-maroon-700 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleUploadSubmit}
          disabled={files.length === 0 || isUploading}
          className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:bg-slate-200 text-white font-extrabold text-sm py-4 rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isUploading ? 'Finalizing Upload...' : `Ingest ${files.length || 0} PDF(s) into Workspace`}</span>
        </button>

        {/* Security & Quota Note */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-maroon-700" />
            100% Client-Side In-Memory Sandbox
          </span>
          <span>
            Storage Used: {formatBytes(totalUsed)} / {formatBytes(quota)}
          </span>
        </div>
      </div>
    </div>
  );
};
