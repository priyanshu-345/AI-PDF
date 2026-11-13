import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Image as ImageIcon,
  ArrowRight,
  Search,
  Sparkles,
  Zap,
  Layers,
  Compass,
  Palette,
  Camera,
} from 'lucide-react';
import { CONVERTERS } from './GenericConverter';

export const ImageConversions: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'web' | 'vector' | 'cad'>('all');

  const imgConverters = Object.values(CONVERTERS).filter((c) => c.category === 'image');

  const filtered = imgConverters.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.fromFormat.toLowerCase().includes(search.toLowerCase()) ||
      c.toFormat.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'web') {
      return ['JPG', 'PNG', 'WEBP', 'GIF', 'BMP'].some((fmt) => c.fromFormat === fmt || c.toFormat === fmt);
    }
    if (activeTab === 'vector') {
      return ['SVG', 'TIFF', 'HEIC'].some((fmt) => c.fromFormat === fmt || c.toFormat === fmt);
    }
    if (activeTab === 'cad') {
      return ['DXF', 'EPS'].some((fmt) => c.fromFormat === fmt || c.toFormat === fmt);
    }
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
            <span>20 Image & Graphics Conversions</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Image & Graphics Conversions
          </h1>
          <p className="text-sm text-maroon-100/90 leading-relaxed font-medium">
            Transform PDFs to and from JPG, PNG, WEBP, GIF, BMP, TIFF, SVG vectors, Apple HEIC, Adobe Illustrator/EPS, and AutoCAD CAD drawings (.dxf / .dwg).
          </p>
        </div>

        {/* Quick Stats Pill Bar */}
        <div className="mt-6 pt-6 border-t border-white/15 flex flex-wrap gap-4 text-xs font-bold">
          <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-1.5 rounded-xl">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>JPG, PNG, WEBP, GIF</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-1.5 rounded-xl">
            <Palette className="w-4 h-4 text-amber-400" />
            <span>SVG Vectors & TIFF</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-1.5 rounded-xl">
            <Compass className="w-4 h-4 text-cyan-300" />
            <span>AutoCAD & EPS Design</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-1.5 rounded-xl">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>Zero Quality Loss</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center space-x-1.5 p-1 bg-white border border-[#EAE5E5] rounded-2xl w-full sm:w-auto shadow-2xs">
          {[
            { id: 'all', label: 'All Graphics Tools (20)' },
            { id: 'web', label: 'Web Photos (JPG/PNG/WEBP)' },
            { id: 'vector', label: 'Vectors & HEIC' },
            { id: 'cad', label: 'AutoCAD & EPS' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
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
            placeholder="Search graphics tools (e.g. PNG, CAD, SVG)..."
            className="w-full bg-white border border-[#EAE5E5] rounded-2xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-maroon-600 shadow-2xs"
          />
        </div>
      </div>

      {/* Grid of Conversion Cards */}
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
                  <ImageIcon className="w-4 h-4" />
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
              <span>Convert Image Now</span>
              <div className="w-6 h-6 rounded-lg bg-maroon-50 group-hover:bg-maroon-700 group-hover:text-white flex items-center justify-center transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-[#EAE5E5] p-8 space-y-3">
          <p className="text-sm font-bold text-slate-700">No image conversions found for "{search}"</p>
          <button
            onClick={() => {
              setSearch('');
              setActiveTab('all');
            }}
            className="text-xs font-bold text-maroon-700 underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

