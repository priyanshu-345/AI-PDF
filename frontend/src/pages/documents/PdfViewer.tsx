import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText,
  Highlighter,
  X,
  Bookmark,
} from 'lucide-react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { formatBytes } from '../../utils/pdfEngine';

export const PdfViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { documents } = useDocumentStore();
  const doc = documents.find((d) => d.id === id) || documents[0];

  const [page, setPage] = useState(1);
  const totalPages = doc?.pages || 14;
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState<'view' | 'annotate'>('view');
  const [notes, setNotes] = useState<{ id: string; page: number; text: string }[]>([
    {
      id: '1',
      page: 1,
      text: 'Verified compliance with zero-trust storage constraints.',
    },
  ]);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes((prev) => [
      ...prev,
      { id: Date.now().toString(), page, text: newNote.trim() },
    ]);
    setNewNote('');
    setIsAddingNote(false);
  };

  const handleDownload = () => {
    alert(`Downloading "${doc?.name || 'document.pdf'}"`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col space-y-3">
      {/* Viewer Toolbar */}
      <div className="bg-white border border-[#EAE5E5] rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Link
            to="/documents"
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            title="Back to library"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xs md:text-sm font-extrabold text-slate-900 truncate max-w-xs md:max-w-md">
              {doc?.name || 'Document.pdf'}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">
              {formatBytes(doc?.size || 2400000)} · PDF Document
            </p>
          </div>
        </div>

        {/* Page Navigation & Zoom */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center border border-slate-200 rounded-xl px-2 py-1 bg-slate-50 space-x-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-20"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-1">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-20"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="hidden sm:flex items-center border border-slate-200 rounded-xl px-2 py-1 bg-slate-50 space-x-1">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="p-1 text-slate-500 hover:text-slate-900"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-1 font-mono">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="p-1 text-slate-500 hover:text-slate-900"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsAddingNote(true)}
            className="p-2 hover:bg-maroon-50 text-maroon-800 rounded-xl border border-maroon-200 text-xs font-bold flex items-center space-x-1"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Note</span>
          </button>

          <button
            onClick={handleDownload}
            className="bg-maroon-700 hover:bg-maroon-800 text-white p-2 rounded-xl text-xs font-bold flex items-center space-x-1"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Frame */}
      <div className="flex-1 bg-slate-100 rounded-3xl border border-[#EAE5E5] p-6 overflow-auto flex items-center justify-center relative">
        <div
          className="bg-white rounded-2xl shadow-xl border border-slate-200 transition-all duration-200 overflow-hidden relative"
          style={{
            width: `${Math.round(620 * (zoom / 100))}px`,
            minHeight: `${Math.round(850 * (zoom / 100))}px`,
            padding: `${Math.round(48 * (zoom / 100))}px`,
          }}
        >
          {/* Simulated High-Fidelity Vector Page */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[10px] font-extrabold text-maroon-800 uppercase tracking-wider">
                {doc?.name || 'Document'}
              </span>
              <span className="text-[10px] font-bold text-slate-400">PAGE {page}</span>
            </div>

            <h1 className="text-xl font-extrabold text-slate-900 leading-snug">
              System Architecture & Data Boundary Guidelines
            </h1>

            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              This technical document outlines the runtime constraints for client-side cryptographic integrity checks, document transformation pipelines, and high-throughput processing queues.
            </p>

            {/* Simulated Highlight Box */}
            <div className="bg-amber-100/70 border-l-4 border-amber-500 p-3 rounded-r-xl text-xs text-amber-950 font-medium">
              "All document mutations remain strictly local to the client browser sandbox, ensuring zero cloud exfiltration risk."
            </div>

            <div className="space-y-3">
              <div className="w-full h-2.5 bg-slate-100 rounded" />
              <div className="w-5/6 h-2.5 bg-slate-100 rounded" />
              <div className="w-4/5 h-2.5 bg-slate-100 rounded" />
              <div className="w-full h-2.5 bg-slate-100 rounded" />
            </div>

            {/* Active Annotations on this page */}
            {notes.filter((n) => n.page === page).length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-extrabold text-maroon-800 uppercase tracking-wider block">
                  Sticky Notes on Page {page}:
                </span>
                {notes
                  .filter((n) => n.page === page)
                  .map((note) => (
                    <div
                      key={note.id}
                      className="bg-maroon-50 border border-maroon-200 rounded-xl p-3 text-xs text-maroon-950 font-medium"
                    >
                      {note.text}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Sticky Note Modal */}
      {isAddingNote && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">Add Sticky Note (Page {page})</h3>
              <button onClick={() => setIsAddingNote(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={4}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Type your annotation note here..."
              className="w-full bg-[#FAF9F9] border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 focus:outline-none focus:border-maroon-600"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAddingNote(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-maroon-700 hover:bg-maroon-800 text-white shadow-xs"
              >
                Save Annotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
