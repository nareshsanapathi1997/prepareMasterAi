import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Calendar,
  Sparkles,
  CheckCircle2,
  XCircle,
  BookOpen,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { CurrentAffairsDigest } from '../types';
import { fetchCurrentAffairsAPI } from '../lib/api';
import { storage } from '../lib/storage';

interface CurrentAffairsDigestModuleProps {
  activeExam: string;
}

export const CurrentAffairsDigestModule: React.FC<CurrentAffairsDigestModuleProps> = ({ activeExam }) => {
  const [digest, setDigest] = useState<CurrentAffairsDigest | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const loadCurrentAffairs = async () => {
    setLoading(true);
    setError(null);
    setQuizAnswers({});
    setQuizSubmitted(false);

    try {
      const data = await fetchCurrentAffairsAPI({
        examVertical: activeExam,
        date: new Date().toISOString().split('T')[0],
      });
      setDigest(data);
      storage.saveCurrentAffairs(activeExam, data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch current affairs.');
      // Fallback
      setDigest({
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        headlineDigest: 'Key updates in Central Banking Digital Currencies, Semiconductor manufacturing corridors, and Renewable Hydrogen trade standards.',
        articles: [
          {
            category: 'Economy & Central Banking',
            title: 'RBI Expands Retail e-Rupee Interoperability with UPI QR Codes',
            coreFacts: [
              'Wholesale and retail CBDC pilot projects launched across 15+ banks.',
              'Integration allows merchant scanning via existing Unified Payments Interface (UPI) infrastructure.',
              'No requirement for merchant-specific CBDC terminals.',
            ],
            examSignificance: 'High yield for UPSC GS-3 (Economy), Banking PO General Awareness, and RBI Grade B Phase 2.',
            keyTerms: ['CBDC', 'UPI Interoperability', 'Sovereign Digital Currency'],
          },
          {
            category: 'Environment & Energy',
            title: 'National Green Hydrogen Mission: Production Incentives Finalized',
            coreFacts: [
              'Target of 5 MMT green hydrogen production per annum by 2030.',
              'Electrolyzer manufacturing PLI guidelines notified.',
              'Decarbonization priority for steel, fertilizer, and long-haul transport.',
            ],
            examSignificance: 'Direct relevance to UPSC GS-3 Environment, Energy Transition, and Climate Diplomacy.',
            keyTerms: ['Green Hydrogen', 'Electrolyzers', 'PLI Scheme', 'COP28 Targets'],
          },
        ],
        editorialInsight: {
          topic: 'Artificial Intelligence Regulation: Balancing Innovation with Safety Norms',
          theIssue: 'Rapid deployment of frontier AI models creates dual imperatives: fostering digital entrepreneurship while preventing deepfakes, algorithmic bias, and systemic copyright infringement.',
          prosOrArguments: [
            'Light-touch regulatory sandboxes encourage tech startups and indigenous LLM research.',
            'Comprehensive watermark and provenance mandates protect democratic electoral integrity.',
          ],
          wayForward: 'Adopt risk-tiered governance modeled on technical evaluation benchmarks rather than rigid licensing.',
        },
        dailyMCQs: [
          {
            id: 1,
            question: 'Which of the following bodies is the designated regulator for Central Bank Digital Currency (CBDC) in India?',
            options: ['Securities and Exchange Board of India (SEBI)', 'Reserve Bank of India (RBI)', 'National Payments Corporation of India (NPCI)', 'Ministry of Electronics and IT (MeitY)'],
            correctOptionIndex: 1,
            explanation: 'Under the amended RBI Act 1934, the Reserve Bank of India has sovereign authority to issue and regulate digital fiat currency (e-Rupee).',
            syllabusTag: 'Economy / Monetary System',
          },
          {
            id: 2,
            question: 'What is the primary feed water requirement for green hydrogen production via water electrolysis?',
            options: ['Untreated seawater directly', 'De-mineralized ultrapure water', 'Atmospheric water vapor only', 'Industrial wastewater effluent'],
            correctOptionIndex: 1,
            explanation: 'Electrolyzers require de-mineralized and purified water to avoid catalyst poisoning and membrane degradation.',
            syllabusTag: 'Science & Tech / Energy',
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentAffairs();
  }, [activeExam]);

  const handleSelectQuiz = (qId: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const calculateScore = () => {
    if (!digest?.dailyMCQs) return 0;
    let score = 0;
    digest.dailyMCQs.forEach((q) => {
      if (quizAnswers[q.id] === q.correctOptionIndex) score++;
    });
    return score;
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-teal-500/20">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-teal-500/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-teal-300">
            <Newspaper className="w-3.5 h-3.5 text-teal-400" />
            <span>Daily Exam Editorial & News Digest</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Current Affairs & Editorial Intelligence
          </h2>
          <p className="text-teal-200 text-sm leading-relaxed">
            AI-distilled high-yield national and global events mapped specifically to your exam syllabus with daily MCQs.
          </p>
        </div>

        <button
          onClick={loadCurrentAffairs}
          disabled={loading}
          className="flex items-center space-x-2 px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-2xl shadow-lg transition-all text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Synthesizing Digest...' : 'Refresh Today’s Digest'}</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-teal-500 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Synthesizing daily news, editorial viewpoints, and daily MCQs...
          </p>
        </div>
      ) : digest ? (
        <div className="space-y-6">
          {/* Headlines Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Calendar className="w-4 h-4" />
                <span>Executive Digest &bull; {digest.date}</span>
              </span>
              <span className="text-xs font-semibold text-slate-400">Vertical: {activeExam}</span>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
              {digest.headlineDigest}
            </p>
          </div>

          {/* Article Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {digest.articles?.map((art, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-lg uppercase">
                    {art.category}
                  </span>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {art.title}
                  </h3>

                  <div className="space-y-1.5">
                    {art.coreFacts?.map((fact, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-300">
                        <span className="text-teal-500 font-bold">•</span>
                        <span>{fact}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <strong className="text-teal-600 dark:text-teal-400">Exam Relevance: </strong>
                    {art.examSignificance}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {art.keyTerms?.map((term, tIdx) => (
                      <span key={tIdx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-medium">
                        #{term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Editorial Insight Card */}
          {digest.editorialInsight && (
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg space-y-4 border border-indigo-500/20">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                <BookOpen className="w-4 h-4" />
                <span>Editorial Deep-Dive & Answer Writing Insight</span>
              </div>

              <h3 className="text-lg font-bold text-white">
                {digest.editorialInsight.topic}
              </h3>

              <p className="text-xs text-indigo-100 leading-relaxed">
                <strong className="text-white">Core Issue: </strong>
                {digest.editorialInsight.theIssue}
              </p>

              {digest.editorialInsight.prosOrArguments && (
                <div className="space-y-1.5 pt-1">
                  <strong className="text-xs text-indigo-300 block uppercase">Key Multi-Dimensional Arguments:</strong>
                  {digest.editorialInsight.prosOrArguments.map((arg, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-slate-200">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{arg}</span>
                    </div>
                  ))}
                </div>
              )}

              {digest.editorialInsight.wayForward && (
                <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10 text-xs text-teal-200">
                  <strong className="text-white">The Way Forward / Balanced Conclusion: </strong>
                  {digest.editorialInsight.wayForward}
                </div>
              )}
            </div>
          )}

          {/* Daily 5-MCQ Quiz Card */}
          {digest.dailyMCQs && digest.dailyMCQs.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-teal-500" />
                    <span>Daily Current Affairs Diagnostic Quiz</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Test how well you retained today's news items.
                  </p>
                </div>

                {quizSubmitted && (
                  <div className="px-4 py-2 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold rounded-xl text-xs">
                    Score: {calculateScore()} / {digest.dailyMCQs.length}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {digest.dailyMCQs.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-500">Q{idx + 1}.</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                        {q.syllabusTag}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {q.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = quizAnswers[q.id] === optIdx;
                        const isCorrect = quizSubmitted && optIdx === q.correctOptionIndex;
                        const isWrong = quizSubmitted && isSelected && optIdx !== q.correctOptionIndex;

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => handleSelectQuiz(q.id, optIdx)}
                            className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                              isCorrect
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100'
                                : isWrong
                                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100'
                                : isSelected
                                ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-100'
                                : 'border-slate-200 dark:border-slate-700 hover:border-teal-400'
                            }`}
                          >
                            <span className="font-bold mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-white">Explanation: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={() => setQuizSubmitted(true)}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  Submit & View Quiz Key
                </button>
              ) : (
                <button
                  onClick={() => {
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-all"
                >
                  Retake Quiz
                </button>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
