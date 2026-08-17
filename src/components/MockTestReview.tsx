import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Target,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { MockTest, TestAttempt, AIAnalysisReport } from '../types';
import { analyzeTestResultsAPI } from '../lib/api';

interface MockTestReviewProps {
  test: MockTest;
  attempt: TestAttempt;
  onRetakeTest: () => void;
  onBackToList: () => void;
}

export const MockTestReview: React.FC<MockTestReviewProps> = ({
  test,
  attempt,
  onRetakeTest,
  onBackToList,
}) => {
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct' | 'unattempted'>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  const [aiReport, setAiReport] = useState<AIAnalysisReport | null>(attempt.aiAnalysis || null);
  const [loadingAiReport, setLoadingAiReport] = useState(false);

  const toggleExpand = (qId: number) => {
    setExpandedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleGenerateAiReport = async () => {
    setLoadingAiReport(true);
    try {
      const topicStats = test.questions.reduce((acc: any, q) => {
        const selected = attempt.userAnswers[q.id];
        const isCorrect = selected === q.correctOptionIndex;
        if (!acc[q.topicTag]) {
          acc[q.topicTag] = { total: 0, correct: 0 };
        }
        acc[q.topicTag].total++;
        if (isCorrect) acc[q.topicTag].correct++;
        return acc;
      }, {});

      const topicBreakdown = Object.entries(topicStats).map(([topic, stats]: any) => ({
        topic,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        totalQuestions: stats.total,
      }));

      const report = await analyzeTestResultsAPI({
        testTitle: test.testTitle,
        examName: test.examName,
        totalQuestions: test.questions.length,
        score: attempt.score,
        correctCount: attempt.correctCount,
        wrongCount: attempt.wrongCount,
        unattemptedCount: attempt.unattemptedCount,
        timeSpentSeconds: attempt.timeSpentSeconds,
        topicBreakdown,
      });

      setAiReport(report);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiReport(false);
    }
  };

  const filteredQuestions = test.questions.filter((q) => {
    const selected = attempt.userAnswers[q.id];
    if (filter === 'correct') return selected === q.correctOptionIndex;
    if (filter === 'wrong') return selected !== undefined && selected !== q.correctOptionIndex;
    if (filter === 'unattempted') return selected === undefined;
    return true;
  });

  const avgTimePerQuestion =
    test.questions.length > 0 ? Math.round(attempt.timeSpentSeconds / test.questions.length) : 0;

  return (
    <div className="space-y-6">
      {/* Top Performance Scorecard */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
              Exam Performance Report
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5">
              {test.testTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {test.examName} &bull; {test.subject}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onRetakeTest}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Test</span>
            </button>
            <button
              onClick={onBackToList}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              All Tests
            </button>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60">
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
              <span className="text-[11px] font-bold uppercase">Final Score</span>
              <Trophy className="w-4 h-4" />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {attempt.score}
            </span>
            <span className="text-xs text-slate-500 ml-1">/ {attempt.maxScore}</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
              <span className="text-[11px] font-bold uppercase">Accuracy</span>
              <Target className="w-4 h-4" />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {attempt.accuracyPercentage}%
            </span>
            <span className="text-xs text-emerald-600 block font-semibold">
              {attempt.correctCount} Correct
            </span>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
              <span className="text-[11px] font-bold uppercase">Incorrect</span>
              <XCircle className="w-4 h-4" />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {attempt.wrongCount}
            </span>
            <span className="text-xs text-rose-600 block font-semibold">
              -{(attempt.wrongCount * 0.66).toFixed(2)} pts
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase">Unattempted</span>
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {attempt.unattemptedCount}
            </span>
            <span className="text-xs text-slate-500 block">Skipped</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase">Total Time</span>
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {Math.floor(attempt.timeSpentSeconds / 60)}m {attempt.timeSpentSeconds % 60}s
            </span>
            <span className="text-xs text-slate-500 block">Duration</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase">Avg Speed</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {avgTimePerQuestion}s
            </span>
            <span className="text-xs text-slate-500 block">per question</span>
          </div>
        </div>

        {/* AI Diagnostic Report Generator Section */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          {!aiReport ? (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Get AI Diagnostic & 7-Day Recovery Roadmap
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Let Gemini evaluate your speed vs. accuracy tradeoffs, isolate weak topics, and prescribe an exact 7-day study fix.
                  </p>
                </div>
              </div>
              <button
                id="generate-ai-diagnostic-btn"
                onClick={handleGenerateAiReport}
                disabled={loadingAiReport}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 whitespace-nowrap flex items-center space-x-2 cursor-pointer"
              >
                {loadingAiReport ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Performance...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Diagnostic</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    AI Cognitive Diagnostic & Strategic Prescription
                  </h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Readiness: {aiReport.readinessPercentileEstimate}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong>Executive Verdict:</strong> {aiReport.overallVerdict}
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Mastered Strengths
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {aiReport.strengthAreas.map((st, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">&bull;</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    Critical Weak Spots (High-Yield Fixes)
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {aiReport.criticalWeaknesses.map((wk, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">&bull;</span>
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 7-Day Targeted Recovery Roadmap */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Prescribed 7-Day Targeted Recovery Drill
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {aiReport.sevenDayRecoveryRoadmap.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                    >
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                        {item.day}
                      </span>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        {item.actionableGoal}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.recommendedResourceOrDrill}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Question Review List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Question-by-Question Solution & Trap Analysis
          </h3>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: `All (${test.questions.length})` },
              { id: 'wrong', label: `Incorrect (${attempt.wrongCount})` },
              { id: 'correct', label: `Correct (${attempt.correctCount})` },
              { id: 'unattempted', label: `Unattempted (${attempt.unattemptedCount})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-4">
          {filteredQuestions.map((q, qIndex) => {
            const userSelectedIndex = attempt.userAnswers[q.id];
            const isCorrect = userSelectedIndex === q.correctOptionIndex;
            const isUnattempted = userSelectedIndex === undefined;
            const isExpanded = expandedQuestions[q.id] !== false; // default expanded

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isUnattempted
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900'
                    : isCorrect
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                }`}
              >
                {/* Header */}
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => toggleExpand(q.id)}
                >
                  <div className="flex items-start space-x-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isUnattempted
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          : isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {q.id}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {q.topicTag}
                        </span>
                        <span
                          className={`text-[11px] font-bold ${
                            isUnattempted
                              ? 'text-slate-500'
                              : isCorrect
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isUnattempted
                            ? 'Unattempted (0 pts)'
                            : isCorrect
                            ? 'Correct (+2.0 pts)'
                            : 'Incorrect (-0.66 pts)'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {q.questionText}
                      </p>
                    </div>
                  </div>

                  <button className="text-slate-400 hover:text-slate-600 p-1 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-4">
                    {/* Options list with correct indicator */}
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isRightAnswer = optIdx === q.correctOptionIndex;
                        const isStudentChoice = optIdx === userSelectedIndex;
                        const optLetter = String.fromCharCode(65 + optIdx);

                        let optStyle =
                          'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                        if (isRightAnswer) {
                          optStyle =
                            'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-500 font-semibold text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-500/30';
                        } else if (isStudentChoice && !isRightAnswer) {
                          optStyle =
                            'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-500 text-rose-900 dark:text-rose-200 font-semibold';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start space-x-2.5 ${optStyle}`}
                          >
                            <span className="font-bold shrink-0">({optLetter})</span>
                            <span className="flex-1">{opt}</span>
                            {isRightAnswer && (
                              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 shrink-0">
                                Correct Answer
                              </span>
                            )}
                            {isStudentChoice && !isRightAnswer && (
                              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 shrink-0">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Detailed Explanation Box */}
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs sm:text-sm">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block mb-1">
                          Comprehensive Concept & Solution:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {q.detailedExplanation}
                        </p>
                      </div>

                      {q.whyOptionsAreWrong && q.whyOptionsAreWrong.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                            Why other options were incorrect:
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                            {q.whyOptionsAreWrong.map((why, wIdx) => (
                              <li key={wIdx}>{why}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {q.examTrickOrShortcut && (
                        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
                          <Zap className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                          <div>
                            <strong>Exam Trick / Shortcut:</strong> {q.examTrickOrShortcut}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
