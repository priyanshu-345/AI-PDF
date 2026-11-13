import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  Zap,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { CONVERTERS } from './GenericConverter';

export const ConversionsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'documents' | 'images'>('all');
  const [search, setSearch] = useState('');

  const allConverters = Object.values(CONVERTERS);

  const filtered = allConverters.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.fromFormat.toLowerCase().includes(search.toLowerCase()) ||
      c.toFormat.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'documents') return c.category === 'document';
    if (activeTab === 'images') return c.category === 'image';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-maroon-900 via-maroon-800 to-maroon-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-white border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>36 Total Enterprise Conversion Workflows</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Universal Conversion Studio
          </h1>
          <p className="text-sm text-maroon-100/90 leading-relaxed font-medium">
            High-fidelity bi-directional conversion between PDF and all major Office documents, spreadsheets, slides, vector graphics, CAD designs, and web image formats.
          </p>
        </div>

        {/* Suite Switcher Banner Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/15">
          <Link
            to="/conversions/documents"
            className="group bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl p-4.5 transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <FileText className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-white">Document & Spreadsheet Suite</p>
                <p className="text-xs text-maroon-200">Word, Excel, PowerPoint, ODT, RTF, MD, TXT, HTML (16 tools)</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/conversions/images"
            className="group bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl p-4.5 transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <ImageIcon className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-white">Image & Graphics Suite</p>
                <p className="text-xs text-maroon-200">JPG, PNG, WEBP, GIF, SVG, TIFF, HEIC, EPS, AutoCAD (20 tools)</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center space-x-1.5 p-1 bg-white border border-[#EAE5E5] rounded-2xl w-full sm:w-auto shadow-2xs">
          {[
            { id: 'all', label: 'All 36 Conversions' },
            { id: 'documents', label: 'Document Suite (16)' },
            { id: 'images', label: 'Graphics Suite (20)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-maroon-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search any conversion..."
            className="w-full bg-white border border-[#EAE5E5] rounded-2xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-maroon-600 shadow-2xs"
          />
        </div>
      </div>

      {/* Master Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <Link
            key={item.id}
            to={`/conversions/${item.id}`}
            className="group bg-white hover:bg-maroon-50/20 border border-[#EAE5E5] hover:border-maroon-300 rounded-3xl p-5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              {/* Badge Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-black tracking-wide uppercase">
                    {item.fromFormat}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-maroon-700 transition-colors" />
                  <span className="px-2.5 py-1 rounded-lg bg-maroon-50 border border-maroon-100 text-maroon-800 text-[10px] font-black tracking-wide uppercase">
                    {item.toFormat}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-maroon-50 text-maroon-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.category === 'document' ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                </div>
              </div>

              {/* Title & Desc */}
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-maroon-900 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-maroon-700 group-hover:text-maroon-900">
              <span>Open Converter</span>
              <div className="w-6 h-6 rounded-lg bg-maroon-50 group-hover:bg-maroon-700 group-hover:text-white flex items-center justify-center transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

