import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Loader2,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Award,
  Compass,
  FileCheck,
} from 'lucide-react';
import { researchSyllabusAPI } from '../lib/api';
import { SyllabusResearch } from '../types';
import { storage } from '../lib/storage';

interface SyllabusResearchModuleProps {
  activeExam: string;
}

export const SyllabusResearchModule: React.FC<SyllabusResearchModuleProps> = ({
  activeExam,
}) => {
  const savedMap = storage.getSavedSyllabus();
  const existing = savedMap[activeExam];

  const [research, setResearch] = useState<SyllabusResearch | null>(existing || null);
  const [streamInput, setStreamInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-fetch if not cached
    if (!existing) {
      handleResearch();
    } else {
      setResearch(existing);
    }
  }, [activeExam]);

  const handleResearch = async () => {
    setLoading(true);
    try {
      const data = await researchSyllabusAPI({
        examName: activeExam,
        targetStreamOrTier: streamInput || 'Standard Comprehensive Syllabus',
      });
      setResearch(data);
      storage.saveSyllabus(activeExam, data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Syllabus Architecture & High-Yield PYQ Trends
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Exam pattern, marking schemes, section weightages, and recommended books for {activeExam}.
              </p>
            </div>
          </div>

          <button
            onClick={handleResearch}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Researching Patterns...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Refresh AI Research</span>
              </>
            )}
          </button>
        </div>
      </div>

      {research && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Exam Structure Banner */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-900">
                Official Exam Blueprint
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                {research.examTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Conducting Authority: <strong>{research.conductingBody}</strong>
              </p>
            </div>

            {/* Pattern Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Exam Mode
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {research.examPattern.mode}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Duration & Marks
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {research.examPattern.durationMinutes} mins &bull; {research.examPattern.totalMarks} Marks
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Marking Scheme
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {research.examPattern.markingScheme}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Negative Marking
                </span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  {research.examPattern.negativeMarking}
                </span>
              </div>
            </div>
          </div>

          {/* Sectional Breakdown & High Yield Topics */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Syllabus Sections & High-Yield Topic Weightages
            </h3>
            <div className="space-y-6">
              {research.sections.map((sec, sIdx) => (
                <div
                  key={sIdx}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700 mb-3">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {sec.sectionName}
                    </h4>
                    <span className="text-xs font-semibold text-slate-500">
                      Approx {sec.approxQuestions} Qs &bull; {sec.approxMarks} Marks &bull;{' '}
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {sec.difficultyTrend}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sec.highYieldTopics.map((topic, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {topic.topicName}
                          </span>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                            ~{topic.weightagePercent}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {topic.strategicAdvice}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Books & Common Pitfalls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Books */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Recommended Reference Books & Standard Materials
              </h3>
              <div className="space-y-3">
                {research.recommendedBooksAndResources.map((b, bIdx) => (
                  <div
                    key={bIdx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase block mb-1">
                      {b.subject}
                    </span>
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-1">
                      {b.bookOrPlatform}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {b.whyRecommended}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fatal Traps */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 p-6 shadow-sm">
              <h3 className="text-base font-bold text-rose-700 dark:text-rose-300 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Fatal Strategic Mistakes to Avoid
              </h3>
              <div className="space-y-2.5">
                {research.fatalMistakesToAvoid.map((mistake, mIdx) => (
                  <div
                    key={mIdx}
                    className="p-3.5 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-start gap-2.5"
                  >
                    <span className="text-rose-500 font-bold shrink-0">&times;</span>
                    <span>{mistake}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
