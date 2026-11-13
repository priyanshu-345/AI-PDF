import React, { useState } from 'react';
import {
  MessageSquareText,
  Sparkles,
  Send,
  FileText,
  Bookmark,
  RotateCcw,
  Bot,
  User as UserIcon,
} from 'lucide-react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { ChatMessage } from '../../types';

export const AiChat: React.FC = () => {
  const { documents, selectedDocId, setSelectedDocId, getSelectedDocument } = useDocumentStore();
  const selectedDoc = getSelectedDocument();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: `Hello! I have indexed **${selectedDoc?.name || 'your document'}** (total ${selectedDoc?.pages || 24} pages). Ask me anything about key findings, architectural decisions, metrics, or financial data.`,
      timestamp: 'Just now',
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [activeCitation, setActiveCitation] = useState<{ page: number; snippet: string } | null>(null);

  const suggestedPrompts = [
    'What are the core operating principles outlined?',
    'Summarize the compliance and security requirements.',
    'List all key numerical figures and deadlines mentioned.',
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: `Based on **Section 3.2** of *${selectedDoc?.name || 'this document'}*, here is the verified breakdown:\n\n1. **Core Mandate:** The primary directive emphasizes zero-trust verification and local sandboxed storage boundaries.\n2. **Asynchronous Throughput:** High-throughput processing relies on decoupled queue workers so client latency remains under 50ms.\n3. **Integrity Assurances:** Verification tokens are hashed at rest with regular automated rotation.`,
        timestamp: 'Just now',
        citations: [
          {
            page: 2,
            snippet: 'Section 3.2: Architecture guarantees zero-trust boundaries across all local cache partitions.',
          },
          {
            page: 5,
            snippet: 'Section 5.1: Performance benchmarks verify throughput of 4,000 requests/sec with worker pipelines.',
          },
        ],
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);
    }, 1100);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg-init-reset',
        role: 'assistant',
        content: `Conversation refreshed for **${selectedDoc?.name || 'your document'}**. What would you like to explore?`,
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-130px)] flex flex-col space-y-4">
      {/* Top Document Bar */}
      <div className="bg-white border border-[#EAE5E5] rounded-2xl p-4 shadow-xs flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3 min-w-0 mr-4">
          <div className="w-10 h-10 rounded-xl bg-maroon-50 border border-maroon-100 flex items-center justify-center flex-shrink-0">
            <MessageSquareText className="w-5 h-5 text-maroon-700" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Context:</span>
              <select
                value={selectedDoc?.id || ''}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="text-xs font-extrabold text-slate-900 bg-transparent border-none outline-none cursor-pointer truncate max-w-[280px]"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.pages}p)
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Hybrid Vector Search & Citation Deep-Linking Active
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 flex items-center space-x-1"
          title="Reset Chat History"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-white border border-[#EAE5E5] rounded-3xl p-6 shadow-xs overflow-y-auto space-y-5">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isUser
                    ? 'bg-maroon-700 text-white'
                    : 'bg-maroon-50 text-maroon-800 border border-maroon-200'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] space-y-2 ${isUser ? 'items-end text-right' : ''}`}>
                <div
                  className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-maroon-700 text-white font-medium rounded-tr-none'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 font-normal rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1 mr-1">
                      Citations:
                    </span>
                    {msg.citations.map((c) => (
                      <button
                        key={c.page}
                        onClick={() => setActiveCitation(c)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-maroon-50 hover:bg-maroon-100 text-maroon-800 text-[11px] font-extrabold border border-maroon-200 transition-colors"
                      >
                        <Bookmark className="w-3 h-3 text-maroon-700" />
                        <span>Page {c.page}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-maroon-50 border border-maroon-200 flex items-center justify-center text-maroon-700">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl rounded-tl-none flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-maroon-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-maroon-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-maroon-600 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-500 font-medium ml-2">Searching page vectors & ranking citations...</span>
            </div>
          </div>
        )}
      </div>

      {/* Citation Modal / Drawer preview */}
      {activeCitation && (
        <div className="bg-maroon-50/70 border border-maroon-200 rounded-2xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-start space-x-3 mr-3">
            <Bookmark className="w-4 h-4 text-maroon-800 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-maroon-900">Source Quote (Page {activeCitation.page}):</p>
              <p className="text-slate-700 mt-0.5 font-medium italic">"{activeCitation.snippet}"</p>
            </div>
          </div>
          <button
            onClick={() => setActiveCitation(null)}
            className="text-xs font-bold text-maroon-800 hover:text-maroon-950 px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Suggested Chips */}
      <div className="flex flex-wrap gap-2 flex-shrink-0">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="text-[11px] font-bold text-slate-600 hover:text-maroon-800 bg-white hover:bg-maroon-50 border border-[#EAE5E5] hover:border-maroon-200 px-3 py-1.5 rounded-xl transition-all truncate max-w-xs shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="bg-white border border-[#EAE5E5] rounded-2xl p-2 shadow-xs flex items-center space-x-2 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask anything about ${selectedDoc?.name || 'this document'}...`}
          className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-xs md:text-sm text-slate-800 placeholder-slate-400 font-medium"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isThinking}
          className="bg-maroon-700 hover:bg-maroon-800 disabled:bg-slate-200 text-white font-bold text-xs p-3 rounded-xl shadow-xs transition-all flex items-center justify-center flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
