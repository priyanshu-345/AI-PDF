import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  FolderOpen,
  Upload,
  Files,
  Scissors,
  Minimize2,
  RotateCw,
  Stamp,
  Hash,
  Image,
  ScanText,
  FileOutput,
  MessageSquareText,
  Sparkles,
  Languages,
  CheckCheck,
  BrainCircuit,
  HardDrive,
  Settings,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { useDocumentStore } from '../store/useDocumentStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatBytes } from '../utils/pdfEngine';

export const Sidebar: React.FC = () => {
  const { getTotalStorageUsed } = useDocumentStore();
  const { user } = useAuthStore();

  const totalUsed = getTotalStorageUsed();
  const quota = user?.storageQuotaBytes || 10737418240;
  const usedPct = Math.min(100, Math.round((totalUsed / quota) * 100));

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive
      ? 'bg-maroon-50 text-maroon-800 font-bold border border-maroon-200/80 shadow-xs'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-[#EAE5E5] flex-col justify-between p-4 min-h-[calc(100vh-65px)] flex-shrink-0">
      <div className="space-y-6">
        {/* Core Navigation */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Overview
          </p>
          <div className="space-y-1">
            <NavLink to="/" end className={navItemClass}>
              <LayoutDashboard className="w-4 h-4 text-maroon-700" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/tools" className={navItemClass}>
              <Wrench className="w-4 h-4 text-maroon-700" />
              <span>All PDF Tools</span>
            </NavLink>
            <NavLink to="/documents" className={navItemClass}>
              <FolderOpen className="w-4 h-4 text-maroon-700" />
              <span>Document Files</span>
            </NavLink>
            <NavLink to="/upload" className={navItemClass}>
              <Upload className="w-4 h-4 text-maroon-700" />
              <span>Upload Hub</span>
            </NavLink>
          </div>
        </div>

        {/* Conversion Suites */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Conversions
            </p>
            <span className="bg-maroon-50 text-maroon-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-maroon-200">
              36 SUITES
            </span>
          </div>
          <div className="space-y-0.5">
            <NavLink to="/conversions" end className={navItemClass}>
              <Layers className="w-4 h-4 text-maroon-700" />
              <span>Universal Studio</span>
            </NavLink>
            <NavLink to="/conversions/documents" className={navItemClass}>
              <FileSpreadsheet className="w-4 h-4 text-maroon-700" />
              <span>Document & Sheets (16)</span>
            </NavLink>
            <NavLink to="/conversions/images" className={navItemClass}>
              <Image className="w-4 h-4 text-maroon-700" />
              <span>Image & Graphics (20)</span>
            </NavLink>
          </div>
        </div>

        {/* PDF Tools Section */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            PDF Tools
          </p>
          <div className="space-y-0.5">
            <NavLink to="/tools/merge" className={navItemClass}>
              <Files className="w-4 h-4 text-slate-500" />
              <span>Merge PDFs</span>
            </NavLink>
            <NavLink to="/tools/split" className={navItemClass}>
              <Scissors className="w-4 h-4 text-slate-500" />
              <span>Split & Extract</span>
            </NavLink>
            <NavLink to="/tools/compress" className={navItemClass}>
              <Minimize2 className="w-4 h-4 text-slate-500" />
              <span>Compress Size</span>
            </NavLink>
            <NavLink to="/tools/rotate" className={navItemClass}>
              <RotateCw className="w-4 h-4 text-slate-500" />
              <span>Rotate Pages</span>
            </NavLink>
            <NavLink to="/tools/watermark" className={navItemClass}>
              <Stamp className="w-4 h-4 text-slate-500" />
              <span>Add Watermark</span>
            </NavLink>
            <NavLink to="/tools/page-numbers" className={navItemClass}>
              <Hash className="w-4 h-4 text-slate-500" />
              <span>Page Numbers</span>
            </NavLink>
            <NavLink to="/tools/images-to-pdf" className={navItemClass}>
              <Image className="w-4 h-4 text-slate-500" />
              <span>Images to PDF</span>
            </NavLink>
            <NavLink to="/tools/ocr" className={navItemClass}>
              <ScanText className="w-4 h-4 text-slate-500" />
              <span>OCR Scanner</span>
            </NavLink>
            <NavLink to="/tools/convert" className={navItemClass}>
              <FileOutput className="w-4 h-4 text-slate-500" />
              <span>Convert Format</span>
            </NavLink>
          </div>
        </div>

        {/* AI Intelligence Lab */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-bold text-maroon-800 uppercase tracking-wider">
              AI Intelligence Lab
            </p>
            <span className="bg-maroon-100 text-maroon-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
              PRO
            </span>
          </div>
          <div className="space-y-0.5">
            <NavLink to="/ai/chat" className={navItemClass}>
              <MessageSquareText className="w-4 h-4 text-maroon-700" />
              <span>AI Document Chat</span>
            </NavLink>
            <NavLink to="/ai/summarize" className={navItemClass}>
              <Sparkles className="w-4 h-4 text-maroon-700" />
              <span>AI Summarizer</span>
            </NavLink>
            <NavLink to="/ai/translate" className={navItemClass}>
              <Languages className="w-4 h-4 text-maroon-700" />
              <span>AI Translator</span>
            </NavLink>
            <NavLink to="/ai/proofread" className={navItemClass}>
              <CheckCheck className="w-4 h-4 text-maroon-700" />
              <span>Grammar & Proofread</span>
            </NavLink>
            <NavLink to="/ai/quiz" className={navItemClass}>
              <BrainCircuit className="w-4 h-4 text-maroon-700" />
              <span>Quiz & Flashcards</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Storage Quota Card & Settings */}
      <div className="pt-4 border-t border-[#EAE5E5] space-y-3">
        <div className="bg-[#FAF9F9] border border-[#E8E2E2] rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-700 flex items-center">
              <HardDrive className="w-3.5 h-3.5 mr-1.5 text-maroon-700" />
              Storage Used
            </span>
            <span className="text-slate-500 font-mono text-[11px]">{usedPct}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
            <div
              className="bg-maroon-700 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, usedPct)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{formatBytes(totalUsed)}</span>
            <span>of {formatBytes(quota)}</span>
          </div>
        </div>

        <NavLink to="/profile" className={navItemClass}>
          <Settings className="w-4 h-4 text-slate-500" />
          <span>Profile & Plan Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};
