import React, { useState } from 'react';
import {
  FileCode2,
  Sparkles,
  Upload,
  BookOpen,
  HelpCircle,
  Layers,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Lightbulb,
} from 'lucide-react';
import { scanDocumentAPI } from '../lib/api';
import { DocumentScanResult } from '../types';

interface Props {
  activeExam: string;
}

const SAMPLE_DOCS: Record<string, { title: string; text: string }> = {
  'CAT & MBA Entrances': {
    title: 'Time Speed Distance & Relative Motion Primer',
    text: `When two moving bodies travel in opposite directions, their relative speed is S1 + S2. When travelling in the same direction, relative speed is |S1 - S2|. 
For circular tracks: First meeting time in same direction = Length / (S1 - S2). First meeting time in opposite direction = Length / (S1 + S2).
Number of distinct meeting points on a circular track when starting from same point = (S1 - S2)/HCF(S1, S2) for same direction, and (S1 + S2)/HCF(S1, S2) for opposite direction.
Clocks & Angles: Relative speed between hour hand and minute hand is 5.5 degrees per minute (360/60 - 360/720). Angle between hands at H hours and M minutes = |30H - 5.5M| degrees.
Examiner Trap: In boat and stream problems, upstream speed is B - S and downstream speed is B + S. Average speed for round trip is (B^2 - S^2) / B, which is strictly less than still water speed B.`,
  },
  'GATE (Computer Science / Engg)': {
    title: 'Virtual Memory & Multi-Level Paging Architecture',
    text: `Virtual Address space allows execution of processes larger than physical RAM. 
Logical Address = Page Number (p) + Offset (d). Page Size determines offset bits: Offset bits = log2(Page Size).
Physical Address = Frame Number (f) + Offset (d). Number of Frames = Physical Memory Size / Frame Size.
Page Table Size = Number of Entries * Entry Size = (Virtual Memory Size / Page Size) * Entry Size.
Multi-Level Paging: If page table exceeds single frame size, outer page tables are introduced. In 2-level paging, Logical Address is broken into (p1, p2, d).
Translation Lookaside Buffer (TLB): Effective Memory Access Time (EMAT) = Hit_Ratio * (TLB_time + Mem_time) + (1 - Hit_Ratio) * (TLB_time + 2 * Mem_time) for 1-level paging without TLB penalty.
Inversion Page Table: Contains one entry per physical frame instead of one per virtual page, drastically reducing memory overhead at the cost of longer search times.`,
  },
  'UPSC Civil Services': {
    title: 'Monetary Policy Committee (MPC) & Inflation Targeting Framework',
    text: `The Flexible Inflation Targeting (FIT) framework was institutionalized in India following the Urjit Patel Committee recommendations via the Finance Act 2016 amending the RBI Act 1934.
Target: Headline Consumer Price Index (CPI-Combined) inflation target is set at 4% with a tolerance band of +/- 2% (2% to 6%).
MPC Composition: 6 members (3 internal RBI officials including the Governor as Chairperson ex-officio, and 3 external experts appointed by the Central Government).
Quorum & Voting: Quorum is 4 members. Each member has one vote. In case of a tie, the RBI Governor possesses a casting (second) vote.
Failure Clause: If inflation remains outside the 2-6% band for three consecutive quarters, RBI must submit a statutory report to the Central Government detailing reasons for failure, remedial measures, and expected time to achieve target.
Core vs Headline Inflation: Headline includes volatile food and fuel prices, whereas Core CPI excludes food and energy items.`,
  },
};

export const DocumentScannerModule: React.FC<Props> = ({ activeExam }) => {
  const sample = SAMPLE_DOCS[activeExam] || SAMPLE_DOCS['CAT & MBA Entrances'];

  const [docTitle, setDocTitle] = useState<string>(sample.title);
  const [docText, setDocText] = useState<string>(sample.text);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<DocumentScanResult | null>(null);

  // Active view tab in results
  const [activeResultTab, setActiveResultTab] = useState<'summary' | 'quiz' | 'flashcards'>('summary');

  // Quiz state
  const [userSelectedOptions, setUserSelectedOptions] = useState<Record<string, number>>({});
  const [showQuizExplanations, setShowQuizExplanations] = useState<Record<string, boolean>>({});

  // Flashcards state
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<boolean>(false);

  const handleScan = async (title = docTitle, text = docText) => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setUserSelectedOptions({});
    setShowQuizExplanations({});
    setFlippedCards({});

    try {
      const res = await scanDocumentAPI({
        examName: activeExam,
        documentTitle: title.trim(),
        documentText: text.trim(),
      });
      setScanResult(res);
      setActiveResultTab('summary');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze document.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qId: string, optionIdx: number) => {
    setUserSelectedOptions((prev) => ({ ...prev, [qId]: optionIdx }));
    setShowQuizExplanations((prev) => ({ ...prev, [qId]: true }));
  };

  const toggleCardFlip = (idx: number) => {
    setFlippedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopySummary = () => {
    if (!scanResult) return;
    const textToCopy = `${scanResult.title}\n\nSummary:\n${scanResult.executiveSummary}\n\nHigh-Yield Formulas:\n${scanResult.highYieldTheoremsAndFormulas.join('\n')}\n\nKey Takeaways:\n${scanResult.keyConceptTakeaways.join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-teal-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-teal-200 mb-2">
              <FileCode2 className="w-3.5 h-3.5 text-teal-300" />
              <span>Cognitive Material Synthesizer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Notes & Textbook Scanner
            </h1>
            <p className="text-teal-200 text-sm mt-1 max-w-2xl">
              Paste raw notes, research papers, or syllabus chapters to automatically generate executive distillations, formula cheat sheets, pro-level MCQs, and active recall flashcards.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 bg-teal-800/80 border border-teal-600 rounded-xl text-xs font-bold text-teal-200">
              Exam: {activeExam}
            </span>
          </div>
        </div>
      </div>

      {/* Input Ingestion Canvas */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Upload className="w-4 h-4 text-teal-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Paste Study Text / Lecture Notes
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Sample:</span>
            <button
              type="button"
              onClick={() => {
                setDocTitle(sample.title);
                setDocText(sample.text);
              }}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Load {activeExam} Sample
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            placeholder="Document or Chapter Title..."
            className="w-full px-4 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />

          <textarea
            rows={6}
            value={docText}
            onChange={(e) => setDocText(e.target.value)}
            placeholder="Paste textbook excerpt, research abstract, professor lecture notes, or syllabus text..."
            className="w-full p-4 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-400 font-mono">
            {docText.length} characters • ~{Math.round(docText.split(/\s+/).filter(Boolean).length)} words
          </span>

          <button
            type="button"
            onClick={() => handleScan()}
            disabled={loading || !docText.trim()}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-2 shadow-md shadow-teal-500/20 disabled:opacity-50 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Intelligence...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Synthesize Material</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Synthesis Output Display */}
      {scanResult && (
        <div className="space-y-6">
          {/* Navigation Sub-Tabs */}
          <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setActiveResultTab('summary')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeResultTab === 'summary'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Summary & Formulas</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveResultTab('quiz')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeResultTab === 'quiz'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Auto Practice Quiz ({scanResult.generatedQuestions.length} MCQs)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveResultTab('flashcards')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeResultTab === 'flashcards'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Active Flashcards ({scanResult.generatedFlashcards.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy All'}</span>
            </button>
          </div>

          {/* Tab 1: Summary & Formulas */}
          {activeResultTab === 'summary' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Executive Summary & Takeaways */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400 font-bold text-xs">
                    <BookOpen className="w-4 h-4" />
                    <span>Executive Concept Distillation</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {scanResult.title}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {scanResult.executiveSummary}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                    <Lightbulb className="w-4 h-4" />
                    <span>Key Cognitive Takeaways</span>
                  </div>
                  <ul className="space-y-2.5">
                    {scanResult.keyConceptTakeaways.map((takeaway, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: Formulas & High-Yield Equations */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                    <Zap className="w-4 h-4" />
                    <span>Extracted Theorems & Formulas</span>
                  </div>

                  <div className="space-y-3">
                    {scanResult.highYieldTheoremsAndFormulas.map((formula, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl"
                      >
                        <p className="text-xs font-mono font-bold text-amber-950 dark:text-amber-200 leading-relaxed">
                          {formula}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Auto-Generated Practice Quiz */}
          {activeResultTab === 'quiz' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400 font-bold text-xs">
                    <HelpCircle className="w-4 h-4" />
                    <span>Derived Pro-Level Practice Quiz</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {Object.keys(userSelectedOptions).length} / {scanResult.generatedQuestions.length} Answered
                  </span>
                </div>

                <div className="space-y-6">
                  {scanResult.generatedQuestions.map((q, qIdx) => {
                    const selectedIdx = userSelectedOptions[q.id];
                    const isAnswered = selectedIdx !== undefined;
                    const isCorrect = selectedIdx === q.correctOptionIndex;

                    return (
                      <div
                        key={q.id}
                        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-start gap-2">
                            <span className="text-teal-600 font-mono">Q{qIdx + 1}.</span>
                            <span>{q.questionText}</span>
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              q.difficulty === 'Hard'
                                ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-200'
                                : q.difficulty === 'Medium'
                                ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 border-amber-200'
                                : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border-emerald-200'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {q.options.map((opt, optIdx) => {
                            let btnStyle =
                              'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300';
                            if (isAnswered) {
                              if (optIdx === q.correctOptionIndex) {
                                btnStyle =
                                  'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                              } else if (selectedIdx === optIdx) {
                                btnStyle =
                                  'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-900 dark:text-rose-200';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleOptionSelect(q.id, optIdx)}
                                className={`p-3 text-left rounded-xl border text-xs transition flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {isAnswered && optIdx === q.correctOptionIndex && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                )}
                                {isAnswered && selectedIdx === optIdx && !isCorrect && (
                                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation Box */}
                        {showQuizExplanations[q.id] && (
                          <div className="p-3.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                            <span className="font-bold block text-teal-600 dark:text-teal-400">
                              Rationale:
                            </span>
                            <p>{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Active Recall Flashcards */}
          {activeResultTab === 'flashcards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scanResult.generatedFlashcards.map((fc, idx) => {
                const isFlipped = !!flippedCards[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleCardFlip(idx)}
                    className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-teal-500 dark:hover:border-teal-500 transition flex flex-col justify-between min-h-[180px]"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-3">
                        <span>Card #{idx + 1}</span>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">
                          {isFlipped ? 'Answer (Click to flip)' : 'Prompt (Click to reveal)'}
                        </span>
                      </div>

                      <p
                        className={`text-xs leading-relaxed ${
                          isFlipped
                            ? 'text-teal-900 dark:text-teal-200 font-semibold'
                            : 'text-slate-800 dark:text-slate-100 font-medium'
                        }`}
                      >
                        {isFlipped ? fc.back : fc.front}
                      </p>
                    </div>

                    <div className="text-[10px] font-bold text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span>Active Recall Deck</span>
                      <span>{isFlipped ? '↺ Reverse' : '↷ Flip'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
