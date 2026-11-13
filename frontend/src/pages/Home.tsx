import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  Files,
  Scissors,
  Minimize2,
  HardDrive,
  Clock,
  CheckCircle2,
  Lock,
  Plus,
  Zap,
  Image as ImageIcon,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import { useDocumentStore } from '../store/useDocumentStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatBytes } from '../utils/pdfEngine';
import { InstallWebAppSection } from '../components/InstallWebAppSection';

export const Home: React.FC = () => {
  const { documents, getTotalStorageUsed } = useDocumentStore();
  const { user } = useAuthStore();

  const totalUsed = getTotalStorageUsed();
  const totalPages = documents.reduce((acc, doc) => acc + doc.pages, 0);

  const quickTools = [
    {
      title: 'Merge PDFs',
      desc: 'Combine multiple PDF files into one clean document',
      path: '/tools/merge',
      icon: Files,
      badge: 'Popular',
    },
    {
      title: 'Split & Extract',
      desc: 'Extract specific pages or page ranges instantly',
      path: '/tools/split',
      icon: Scissors,
      badge: 'Fast',
    },
    {
      title: 'Compress PDF',
      desc: 'Reduce file size up to 70% while preserving resolution',
      path: '/tools/compress',
      icon: Minimize2,
      badge: 'Optimizer',
    },
    {
      title: 'Document Conversions',
      desc: 'Convert PDF to Word, Excel, PowerPoint, ODT, RTF & more',
      path: '/conversions/documents',
      icon: FileSpreadsheet,
      badge: '16 Formats',
    },
    {
      title: 'Image & Graphics',
      desc: 'Convert PDF to JPG, PNG, WEBP, SVG, CAD & more',
      path: '/conversions/images',
      icon: ImageIcon,
      badge: '20 Formats',
    },
    {
      title: 'AI Document Summarizer',
      desc: 'Upload any PDF to extract real text and generate summaries',
      path: '/ai/summarize',
      icon: Sparkles,
      badge: 'AI Lab',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-maroon-900 via-maroon-800 to-maroon-700 p-8 md:p-10 text-white shadow-xl shadow-maroon-950/10">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
            <Sparkles className="w-4 h-4 text-maroon-200" />
            <span className="text-xs font-bold text-maroon-100 uppercase tracking-wider">
              AI-Powered Enterprise Document Suite
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Work with PDFs smarter, faster, and completely secure.
          </h1>

          <p className="text-sm md:text-base text-maroon-100 font-medium leading-relaxed">
            Manipulate PDFs client-side in seconds, convert across 36+ formats, or unlock deep semantic comprehension and summarization with our integrated AI intelligence lab.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/upload"
              className="bg-white hover:bg-slate-100 text-maroon-900 font-extrabold text-sm px-6 py-3 rounded-xl shadow-sm transition-transform active:scale-95 inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4 text-maroon-800" />
              <span>Upload New PDF</span>
            </Link>

            <Link
              to="/conversions"
              className="bg-maroon-950/40 hover:bg-maroon-950/60 text-white border border-white/20 font-bold text-sm px-5 py-3 rounded-xl transition-colors inline-flex items-center space-x-2"
            >
              <span>Explore 36 Conversions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Ambient Decorative Graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EAE5E5] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Documents</span>
            <FileText className="w-4 h-4 text-maroon-700" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{documents.length}</p>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center mt-1">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active in workspace
          </span>
        </div>

        <div className="bg-white border border-[#EAE5E5] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Storage Space</span>
            <HardDrive className="w-4 h-4 text-maroon-700" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{formatBytes(totalUsed)}</p>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            Plan limit: {formatBytes(user?.storageQuotaBytes || 10737418240)}
          </span>
        </div>

        <div className="bg-white border border-[#EAE5E5] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Indexed Pages</span>
            <Clock className="w-4 h-4 text-maroon-700" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalPages}</p>
          <span className="text-[11px] font-semibold text-maroon-700 mt-1 block">
            Searchable & RAG Ready
          </span>
        </div>

        <div className="bg-white border border-[#EAE5E5] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Client Privacy</span>
            <Sparkles className="w-4 h-4 text-maroon-700" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">100% Local</p>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            Zero cloud transmission
          </span>
        </div>
      </div>

      {/* Conversion Studios Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Conversion Studios</h2>
            <p className="text-xs text-slate-500 font-medium">
              36 professional formats with dedicated sub-pages and instant export
            </p>
          </div>
          <Link
            to="/conversions"
            className="text-xs font-bold text-maroon-700 hover:text-maroon-900 flex items-center space-x-1"
          >
            <span>All 36 Conversions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/conversions/documents"
            className="group bg-white hover:bg-maroon-50/20 border border-[#EAE5E5] hover:border-maroon-300 rounded-3xl p-6 transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-maroon-50 border border-maroon-100 flex items-center justify-center text-maroon-700 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <span className="bg-maroon-100 text-maroon-800 text-xs font-black px-2.5 py-1 rounded-full">
                  16 TOOLS
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-maroon-900 transition-colors">
                Document & Spreadsheet Conversions
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Bi-directional conversion between PDF and Microsoft Word (.docx), Excel (.xlsx), PowerPoint (.pptx), OpenOffice (.odt), RTF, Markdown, HTML, and Plain Text.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-maroon-700 group-hover:text-maroon-900">
              <span>Open Document Suite</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/conversions/images"
            className="group bg-white hover:bg-maroon-50/20 border border-[#EAE5E5] hover:border-maroon-300 rounded-3xl p-6 transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-maroon-50 border border-maroon-100 flex items-center justify-center text-maroon-700 group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <span className="bg-maroon-100 text-maroon-800 text-xs font-black px-2.5 py-1 rounded-full">
                  20 TOOLS
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-maroon-900 transition-colors">
                Image & Graphics Conversions
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Convert PDF to and from JPG, PNG, WEBP, GIF, BMP, TIFF, scalable SVG vectors, Apple HEIC, Adobe Illustrator EPS, and AutoCAD DXF/DWG CAD blueprints.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-maroon-700 group-hover:text-maroon-900">
              <span>Open Graphics Suite</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Launch Tools Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Frequent Tools</h2>
            <p className="text-xs text-slate-500 font-medium">
              High-speed in-browser utilities without server wait times
            </p>
          </div>
          <Link
            to="/tools"
            className="text-xs font-bold text-maroon-700 hover:text-maroon-900 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                to={tool.path}
                className="bg-white hover:bg-maroon-50/20 border border-[#EAE5E5] hover:border-maroon-300 rounded-2xl p-5 shadow-xs hover:shadow-card transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-maroon-50 border border-maroon-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-maroon-700" />
                    </div>
                    <span className="bg-slate-100 group-hover:bg-maroon-100 text-slate-600 group-hover:text-maroon-800 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors">
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-1 group-hover:text-maroon-800 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
                <div className="pt-4 flex items-center text-xs font-bold text-maroon-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Files Table */}
      <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Recent Workspace Documents</h2>
            <p className="text-xs text-slate-500 font-medium">
              Files currently loaded in your active browser session
            </p>
          </div>
          <Link
            to="/documents"
            className="text-xs font-bold text-maroon-700 hover:text-maroon-900 flex items-center"
          >
            <span>Open Library</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {documents.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {documents.slice(0, 5).map((doc) => (
              <div
                key={doc.id}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50/60 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center space-x-3.5 flex-1 min-w-0 mr-4">
                  <div className="w-9 h-9 rounded-xl bg-maroon-50 border border-maroon-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-maroon-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{doc.name}</p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium mt-0.5">
                      <span>{doc.pages} Pages</span>
                      <span>·</span>
                      <span>{formatBytes(doc.size)}</span>
                      <span>·</span>
                      <span className="capitalize">{doc.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/viewer/${doc.id}`}
                    className="p-2 text-slate-500 hover:text-maroon-700 rounded-lg hover:bg-maroon-50 text-xs font-bold"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-600">No documents in your browser session yet</p>
            <Link
              to="/upload"
              className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-maroon-700 hover:underline"
            >
              <span>Upload your first document</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Web App (PWA) Version Download & Install Section */}
      <InstallWebAppSection />
    </div>
  );
};
