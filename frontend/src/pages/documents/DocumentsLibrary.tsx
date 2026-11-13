import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderOpen,
  Search,
  Filter,
  Eye,
  Trash2,
  Download,
  MessageSquareText,
  FileText,
  Plus,
  LayoutGrid,
  List as ListIcon,
} from 'lucide-react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { formatBytes } from '../../utils/pdfEngine';

export const DocumentsLibrary: React.FC = () => {
  const { documents, removeDocument } = useDocumentStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | 'technical' | 'financial' | 'legal' | 'general'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = documents.filter((doc) => {
    const matchesCategory = category === 'all' || doc.category === category;
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Document Library</h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage your workspace documents, launch AI analysis, or view files in the native PDF reader.
          </p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center space-x-2 bg-maroon-700 hover:bg-maroon-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </Link>
      </div>

      {/* Control Bar: Search, Filter, View Mode */}
      <div className="bg-white border border-[#EAE5E5] p-3.5 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Files' },
            { id: 'technical', label: 'Technical' },
            { id: 'financial', label: 'Financial' },
            { id: 'legal', label: 'Legal' },
            { id: 'general', label: 'General' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                category === cat.id
                  ? 'bg-maroon-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Right side: Search & View Toggle */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search library..."
              className="w-full bg-[#FAF9F9] border border-[#E8E2E2] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-maroon-600"
            />
          </div>

          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-xs text-maroon-800' : 'text-slate-400'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-xs text-maroon-800' : 'text-slate-400'}`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {filtered.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-[#EAE5E5] hover:border-maroon-300 rounded-2xl p-5 shadow-xs hover:shadow-card transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-maroon-50 border border-maroon-100 flex items-center justify-center text-maroon-700">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                      {doc.category || 'General'}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 truncate mb-1" title={doc.name}>
                    {doc.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
                    <span>{doc.pages} Pages</span>
                    <span>·</span>
                    <span>{formatBytes(doc.size)}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Link
                      to={`/viewer/${doc.id}`}
                      className="p-1.5 hover:bg-maroon-50 text-slate-600 hover:text-maroon-800 rounded-lg transition-colors"
                      title="Open in PDF Viewer"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/ai/chat"
                      className="p-1.5 hover:bg-maroon-50 text-slate-600 hover:text-maroon-800 rounded-lg transition-colors"
                      title="Chat with Document"
                    >
                      <MessageSquareText className="w-4 h-4" />
                    </Link>
                  </div>

                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#EAE5E5] rounded-3xl p-4 shadow-xs divide-y divide-slate-100">
            {filtered.map((doc) => (
              <div
                key={doc.id}
                className="py-3.5 px-3 flex items-center justify-between hover:bg-slate-50/70 rounded-xl transition-colors"
              >
                <div className="flex items-center space-x-3.5 min-w-0 mr-4">
                  <div className="w-9 h-9 rounded-xl bg-maroon-50 border border-maroon-100 flex items-center justify-center text-maroon-700 flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{doc.name}</p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
                      <span>{doc.pages} Pages</span>
                      <span>·</span>
                      <span>{formatBytes(doc.size)}</span>
                      <span>·</span>
                      <span className="capitalize">{doc.category || 'General'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/viewer/${doc.id}`}
                    className="p-2 hover:bg-maroon-50 text-slate-600 hover:text-maroon-800 rounded-lg transition-colors"
                    title="View PDF"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/ai/chat"
                    className="p-2 hover:bg-maroon-50 text-slate-600 hover:text-maroon-800 rounded-lg transition-colors"
                    title="Chat"
                  >
                    <MessageSquareText className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-white border border-[#EAE5E5] rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <FolderOpen className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800">No documents found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or upload a new PDF to your library.
          </p>
        </div>
      )}
    </div>
  );
};
