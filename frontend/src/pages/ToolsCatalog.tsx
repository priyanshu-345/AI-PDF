import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
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
  Search,
  ArrowRight,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

interface ToolDef {
  id: string;
  name: string;
  description: string;
  icon: any;
  path: string;
  category: 'pages' | 'markup' | 'convert' | 'ai';
  badge?: string;
}

export const ToolsCatalog: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pages' | 'markup' | 'convert' | 'ai'>('all');
  const [search, setSearch] = useState('');

  const tools: ToolDef[] = [
    // Pages & Layout
    {
      id: 'merge',
      name: 'Merge PDFs',
      description: 'Combine multiple PDF files into a single unified document with custom ordering.',
      icon: Files,
      path: '/tools/merge',
      category: 'pages',
      badge: 'Core',
    },
    {
      id: 'split',
      name: 'Split & Extract',
      description: 'Extract specific page ranges, odd/even pages, or single sheets into standalone files.',
      icon: Scissors,
      path: '/tools/split',
      category: 'pages',
    },
    {
      id: 'rotate',
      name: 'Rotate Pages',
      description: 'Correct rotated orientations (90°, 180°, 270°) permanently across all or select pages.',
      icon: RotateCw,
      path: '/tools/rotate',
      category: 'pages',
    },
    {
      id: 'page-numbers',
      name: 'Page Numbers',
      description: 'Stamp customized page numbers into top or bottom margins with multiple format options.',
      icon: Hash,
      path: '/tools/page-numbers',
      category: 'pages',
    },

    // Markup & Security
    {
      id: 'watermark',
      name: 'Add Watermark',
      description: 'Stamp custom confidentiality, status stamps, or branding text across every page.',
      icon: Stamp,
      path: '/tools/watermark',
      category: 'markup',
    },
    {
      id: 'compress',
      name: 'Compress PDF',
      description: 'Reduce file size up to 70% for web, email, or archive with extreme or balanced modes.',
      icon: Minimize2,
      path: '/tools/compress',
      category: 'markup',
      badge: 'Popular',
    },

    // Capture & Convert
    {
      id: 'doc-conversions',
      name: 'Document & Spreadsheet Conversions',
      description: 'Convert PDF to and from Microsoft Word, Excel, PowerPoint, ODT, RTF, MD, HTML, and TXT (16 tools).',
      icon: FileSpreadsheet,
      path: '/conversions/documents',
      category: 'convert',
      badge: '16 Formats',
    },
    {
      id: 'img-conversions',
      name: 'Image & Graphics Conversions',
      description: 'Convert PDF to and from JPG, PNG, WEBP, GIF, BMP, TIFF, SVG vectors, Apple HEIC, EPS, and AutoCAD (20 tools).',
      icon: Image,
      path: '/conversions/images',
      category: 'convert',
      badge: '20 Formats',
    },
    {
      id: 'all-conversions',
      name: 'Universal Conversion Studio',
      description: 'Master studio supporting 36 enterprise document and graphics conversion pipelines.',
      icon: Layers,
      path: '/conversions',
      category: 'convert',
      badge: '36 Tools',
    },
    {
      id: 'images-to-pdf',
      name: 'Images to PDF',
      description: 'Turn collections of PNG, JPG, or WebP photos into an organized standard PDF.',
      icon: Image,
      path: '/tools/images-to-pdf',
      category: 'convert',
    },
    {
      id: 'ocr',
      name: 'OCR Scanner',
      description: 'Perform optical character recognition over scanned pages to extract editable text.',
      icon: ScanText,
      path: '/tools/ocr',
      category: 'convert',
      badge: 'In-Browser',
    },

    // AI Intelligence Lab
    {
      id: 'ai-chat',
      name: 'AI Document Chat',
      description: 'Ask deep analytical questions and receive conversational answers backed by page citations.',
      icon: MessageSquareText,
      path: '/ai/chat',
      category: 'ai',
      badge: 'AI Lab',
    },
    {
      id: 'ai-summarize',
      name: 'AI Summarizer',
      description: 'Upload any PDF to extract real text and generate instant executive briefs and deep dive breakdowns.',
      icon: Sparkles,
      path: '/ai/summarize',
      category: 'ai',
      badge: 'AI Lab',
    },
    {
      id: 'ai-translate',
      name: 'AI Translator',
      description: 'Translate documents across 10+ languages with side-by-side bilingual comparisons.',
      icon: Languages,
      path: '/ai/translate',
      category: 'ai',
      badge: 'AI Lab',
    },
    {
      id: 'ai-proofread',
      name: 'Grammar & Proofread',
      description: 'Inspect extracted text for repetitive phrases, run-on sentences, and clarity improvements.',
      icon: CheckCheck,
      path: '/ai/proofread',
      category: 'ai',
      badge: 'AI Lab',
    },
    {
      id: 'ai-quiz',
      name: 'Quiz & Flashcards Studio',
      description: 'Transform technical documents into active study quizzes and flip-card memory decks.',
      icon: BrainCircuit,
      path: '/ai/quiz',
      category: 'ai',
      badge: 'Interactive',
    },
  ];

  const filtered = tools.filter((t) => {
    const matchesCategory = activeFilter === 'all' || t.category === activeFilter;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Master PDF, Conversion & AI Tools Catalog
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Choose from 36+ high-performance tools engineered for client-side privacy, conversion fidelity, and advanced document AI
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#EAE5E5] p-3 rounded-2xl shadow-xs">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Tools' },
            { id: 'pages', label: 'Pages & Layout' },
            { id: 'markup', label: 'Markup & Security' },
            { id: 'convert', label: 'Conversions & Scan' },
            { id: 'ai', label: 'AI Intelligence' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-maroon-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter tools..."
            className="w-full bg-[#FAF9F9] border border-[#E8E2E2] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-maroon-600"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tool) => {
          const Icon = tool.icon;
          const isAi = tool.category === 'ai';
          return (
            <Link
              key={tool.id}
              to={tool.path}
              className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-card transition-all group flex flex-col justify-between ${isAi
                ? 'border-maroon-200/80 hover:border-maroon-400'
                : 'border-[#EAE5E5] hover:border-maroon-300'
                }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${isAi
                      ? 'bg-maroon-100 text-maroon-800 border border-maroon-200'
                      : 'bg-maroon-50 text-maroon-700 border border-maroon-100'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {tool.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${isAi
                        ? 'bg-maroon-700 text-white'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-maroon-100 group-hover:text-maroon-800'
                        }`}
                    >
                      {tool.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mb-1.5 group-hover:text-maroon-800 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4 text-xs font-bold text-maroon-700">
                <span>Open Tool</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
