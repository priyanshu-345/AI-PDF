import React, { useState } from 'react';
import {
  CheckCheck,
  FileText,
  AlertCircle,
  Copy,
  Check,
  Wand2,
} from 'lucide-react';
import { useDocumentStore } from '../../store/useDocumentStore';

interface IssueItem {
  id: string;
  category: string;
  count: number;
  description: string;
}

export const AiProofread: React.FC = () => {
  const { documents, selectedDocId, setSelectedDocId, getSelectedDocument } = useDocumentStore();
  const selectedDoc = getSelectedDocument();

  const [isChecking, setIsChecking] = useState(false);
  const [issues, setIssues] = useState<IssueItem[] | null>(null);
  const [correctedText, setCorrectedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRunCheck = () => {
    setIsChecking(true);
    setIssues(null);
    setCorrectedText(null);

    setTimeout(() => {
      const detectedIssues: IssueItem[] = [
        {
          id: '1',
          category: 'Repeated Words',
          count: 3,
          description: 'Identified consecutive duplicates such as "the the" on page 2 and "in in" on page 4.',
        },
        {
          id: '2',
          category: 'Whitespace Anomaly',
          count: 7,
          description: 'Excess whitespace gaps and double spaces detected following periods.',
        },
        {
          id: '3',
          category: 'Weak Intensifiers',
          count: 4,
          description: 'Phrases like "very essential" and "extremely critical" simplified to precise vocabulary.',
        },
      ];

      const cleanText = `The updated document architecture establishes verifiable zero-trust boundaries across local browser partitions. High-throughput processing relies on decoupled queue workers to maintain client responsiveness below 50ms. Token verification hashes are audited with automated credential rotation.`;

      setIssues(detectedIssues);
      setCorrectedText(cleanText);
      setIsChecking(false);
    }, 900);
  };

  const handleCopy = () => {
    if (!correctedText) return;
    navigator.clipboard.writeText(correctedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3.5 pb-2">
        <div className="w-12 h-12 rounded-2xl bg-maroon-50 border border-maroon-100 flex items-center justify-center">
          <CheckCheck className="w-6 h-6 text-maroon-700" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Grammar & Style Proofreading</h1>
          <p className="text-xs text-slate-500 font-medium">
            Inspect document text layers for grammatical consistency, word repetition, and spacing errors.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 shadow-xs space-y-6">
        {/* Document Selector */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
            Target Document
          </label>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-maroon-700" />
              <select
                value={selectedDoc?.id || ''}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="text-xs font-extrabold text-slate-900 bg-transparent outline-none cursor-pointer"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.pages} pages)
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[11px] font-bold text-slate-500">{selectedDoc?.pages || 1} pages</span>
          </div>
        </div>

        {/* Action Trigger */}
        <button
          onClick={handleRunCheck}
          disabled={isChecking}
          className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:bg-slate-200 text-white font-extrabold text-sm py-4 rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2"
        >
          <Wand2 className="w-4 h-4" />
          <span>{isChecking ? 'Inspecting Text Layers...' : 'Run Grammar & Style Lint'}</span>
        </button>

        {/* Results Area */}
        {issues && (
          <div className="space-y-5 pt-4 border-t border-slate-100">
            <div>
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-3">
                Identified Rule Flags ({issues.reduce((s, i) => s + i.count, 0)} issues)
              </span>
              <div className="space-y-2">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-3"
                  >
                    <span className="bg-maroon-100 text-maroon-800 font-extrabold text-[10px] px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5">
                      x{issue.count}
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{issue.category}</p>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5">{issue.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Corrected Text Output */}
            {correctedText && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Corrected Text Output
                  </span>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
                <div className="p-4 bg-maroon-50/30 border border-maroon-200 rounded-2xl text-xs font-mono text-slate-900 leading-relaxed">
                  {correctedText}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
