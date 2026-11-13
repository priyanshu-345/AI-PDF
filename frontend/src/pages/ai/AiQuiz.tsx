import React, { useState } from 'react';
import {
  BrainCircuit,
  FileText,
  Check,
  X,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ListChecks,
  Library,
} from 'lucide-react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { QuizQuestion } from '../../types';

export const AiQuiz: React.FC = () => {
  const { documents, selectedDocId, setSelectedDocId, getSelectedDocument } = useDocumentStore();
  const selectedDoc = getSelectedDocument();

  const [mode, setMode] = useState<'quiz' | 'flashcards'>('quiz');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isFlipped, setIsFlipped] = useState(false);

  const sampleQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      question: 'What is the primary architectural purpose of worker task queues in this system?',
      options: [
        'To persist static CSS stylesheets',
        'To decouple long-running PDF transforms from the web UI',
        'To bypass all user authentication requirements',
        'To generate synthetic mock data continuously',
      ],
      correctAnswerIndex: 1,
      explanation: 'Decoupling heavy transformations ensures the web user interface maintains high responsiveness.',
      pageRef: 3,
    },
    {
      id: 'q2',
      question: 'How are client-side PDF mutations handled to prevent data leakage?',
      options: [
        'Documents are uploaded to public cloud buckets',
        'Transformations occur in-browser using volatile memory buffer streams',
        'PDFs are converted to unencrypted raw text files',
        'Files are routed through remote third-party OCR APIs',
      ],
      correctAnswerIndex: 1,
      explanation: 'pdf-lib manipulates binary byte arrays directly within the client sandbox.',
      pageRef: 7,
    },
    {
      id: 'q3',
      question: 'Which method enables accurate page number citations during AI conversations?',
      options: [
        'Random guessing',
        'Vector similarity matching combined with keyword reranking',
        'Counting words per line',
        'Scanning document filenames',
      ],
      correctAnswerIndex: 1,
      explanation: 'Hybrid retrieval maps vector distance to discrete page index segments for citation deep-linking.',
      pageRef: 12,
    },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setQuestions([]);
    setSelectedAnswers({});
    setCurrentIdx(0);
    setIsFlipped(false);

    setTimeout(() => {
      setQuestions(sampleQuestions);
      setIsGenerating(false);
    }, 1000);
  };

  const handleSelectAnswer = (optionIdx: number) => {
    if (selectedAnswers[currentIdx] !== undefined) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optionIdx }));
  };

  const totalScore = Object.entries(selectedAnswers).reduce((acc, [qIdx, ansIdx]) => {
    return questions[Number(qIdx)]?.correctAnswerIndex === ansIdx ? acc + 1 : acc;
  }, 0);

  const isCurrentAnswered = selectedAnswers[currentIdx] !== undefined;
  const isFinished = questions.length > 0 && Object.keys(selectedAnswers).length === questions.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3.5 pb-2">
        <div className="w-12 h-12 rounded-2xl bg-maroon-50 border border-maroon-100 flex items-center justify-center">
          <BrainCircuit className="w-6 h-6 text-maroon-700" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Quiz & Flashcards Studio</h1>
          <p className="text-xs text-slate-500 font-medium">
            Turn your technical documentation into active recall multiple-choice quizzes or flip-card study decks.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 shadow-xs space-y-6">
        {/* Document Selector & Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
              Study Material
            </label>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3">
              <FileText className="w-5 h-5 text-maroon-700" />
              <select
                value={selectedDoc?.id || ''}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="text-xs font-extrabold text-slate-900 bg-transparent outline-none cursor-pointer w-full truncate"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.pages}p)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                    difficulty === diff
                      ? 'border-maroon-600 bg-maroon-50/70 text-maroon-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        {questions.length > 0 && (
          <div className="flex rounded-2xl bg-slate-100 p-1">
            <button
              onClick={() => setMode('quiz')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                mode === 'quiz' ? 'bg-white text-maroon-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              <span>Interactive Quiz</span>
            </button>
            <button
              onClick={() => setMode('flashcards')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                mode === 'flashcards' ? 'bg-white text-maroon-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Library className="w-4 h-4" />
              <span>Flashcard Study Mode</span>
            </button>
          </div>
        )}

        {/* Generate Trigger */}
        {questions.length === 0 ? (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:bg-slate-200 text-white font-extrabold text-sm py-4 rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Synthesizing Questions...' : 'Generate Questions from Document'}</span>
          </button>
        ) : null}

        {/* Interactive Quiz Mode */}
        {questions.length > 0 && mode === 'quiz' && (
          <div className="space-y-6 pt-2">
            {/* Progress Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
              <span className="font-extrabold text-maroon-800 uppercase tracking-wider">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="font-extrabold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                Score: {totalScore} / {questions.length} Correct
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-base font-extrabold text-slate-900 leading-snug">
              {questions[currentIdx].question}
            </h2>

            {/* Multiple Choice Options */}
            <div className="space-y-2.5">
              {questions[currentIdx].options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentIdx] === optIdx;
                const isCorrect = optIdx === questions[currentIdx].correctAnswerIndex;
                const showFeedback = isCurrentAnswered;

                let btnStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';
                if (showFeedback) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'border-rose-500 bg-rose-50/70 text-rose-900 font-bold';
                  }
                } else if (isSelected) {
                  btnStyle = 'border-maroon-600 bg-maroon-50 text-maroon-900 font-bold';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectAnswer(optIdx)}
                    disabled={isCurrentAnswered}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between text-xs transition-all ${btnStyle}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-extrabold flex items-center justify-center text-[11px] flex-shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </div>
                    {showFeedback && isCorrect && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                    {showFeedback && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {isCurrentAnswered && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                <p className="font-extrabold text-slate-900">Explanation:</p>
                <p className="text-slate-600 font-medium">{questions[currentIdx].explanation}</p>
                <p className="text-maroon-800 font-bold text-[11px] pt-1">
                  Source Reference: Page {questions[currentIdx].pageRef}
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 border border-slate-200"
              >
                Previous
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((i) => i + 1)}
                  disabled={!isCurrentAnswered}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-maroon-700 hover:bg-maroon-800 disabled:bg-slate-200 text-white shadow-xs transition-all flex items-center space-x-1"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedAnswers({});
                    setCurrentIdx(0);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-maroon-700 hover:bg-maroon-800 text-white shadow-xs transition-all flex items-center space-x-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Session</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Flashcard Mode */}
        {questions.length > 0 && mode === 'flashcards' && (
          <div className="space-y-4 pt-2">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-h-[220px] bg-gradient-to-br from-white to-slate-50 border-2 border-maroon-200 hover:border-maroon-400 rounded-3xl p-8 flex flex-col justify-between cursor-pointer shadow-sm transition-all text-center select-none"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-maroon-700">
                Card {currentIdx + 1} of {questions.length} · Tap to {isFlipped ? 'Show Question' : 'Reveal Answer'}
              </span>

              <div className="my-auto">
                <p className="text-base md:text-lg font-extrabold text-slate-900 leading-snug">
                  {isFlipped
                    ? questions[currentIdx].options[questions[currentIdx].correctAnswerIndex]
                    : questions[currentIdx].question}
                </p>
                {isFlipped && (
                  <p className="text-xs text-slate-500 font-medium mt-3 max-w-md mx-auto">
                    {questions[currentIdx].explanation}
                  </p>
                )}
              </div>

              <span className="text-[11px] text-slate-400 font-bold">
                {isFlipped ? 'Answer Verified' : 'Tap to Flip'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setCurrentIdx((i) => Math.max(0, i - 1));
                  setIsFlipped(false);
                }}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 border border-slate-200 flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Card</span>
              </button>

              <button
                onClick={() => {
                  setCurrentIdx((i) => Math.min(questions.length - 1, i + 1));
                  setIsFlipped(false);
                }}
                disabled={currentIdx === questions.length - 1}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 border border-slate-200 flex items-center space-x-1"
              >
                <span>Next Card</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
