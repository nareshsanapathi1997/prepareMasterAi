import React from 'react';
import {
  BarChart,
  Trophy,
  Target,
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { TestAttempt, MockTest } from '../types';

interface AnalyticsDashboardProps {
  attempts: TestAttempt[];
  tests: MockTest[];
  onReviewAttempt: (test: MockTest, attempt: TestAttempt) => void;
  onClearHistory: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  attempts,
  tests,
  onReviewAttempt,
  onClearHistory,
}) => {
  const totalTests = attempts.length;
  const totalQuestions = attempts.reduce(
    (acc, a) => acc + a.correctCount + a.wrongCount + a.unattemptedCount,
    0
  );
  const totalCorrect = attempts.reduce((acc, a) => acc + a.correctCount, 0);
  const totalWrong = attempts.reduce((acc, a) => acc + a.wrongCount, 0);
  const totalTimeSeconds = attempts.reduce((acc, a) => acc + a.timeSpentSeconds, 0);

  const overallAccuracy =
    totalQuestions > 0 ? Math.round((totalCorrect / (totalCorrect + totalWrong || 1)) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
            <span className="text-xs font-bold uppercase">Tests Completed</span>
            <Trophy className="w-4 h-4" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalTests}
          </span>
          <span className="text-xs text-slate-500 block">Mock papers graded</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="text-xs font-bold uppercase">Overall Accuracy</span>
            <Target className="w-4 h-4" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {overallAccuracy}%
          </span>
          <span className="text-xs text-slate-500 block">{totalCorrect} correct answers</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1">
            <span className="text-xs font-bold uppercase">Questions Solved</span>
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalQuestions}
          </span>
          <span className="text-xs text-slate-500 block">Across mock exams</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-1">
            <span className="text-xs font-bold uppercase">Active Test Time</span>
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {Math.floor(totalTimeSeconds / 60)}m
          </span>
          <span className="text-xs text-slate-500 block">{totalTimeSeconds % 60}s tracked</span>
        </div>
      </div>

      {/* Test History Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Mock Exam History & Performance Timeline ({attempts.length})
          </h3>

          {attempts.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
            >
              Clear History
            </button>
          )}
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm">
              No mock tests completed yet. Start an exam from the Mock Tests tab to view detailed analytics!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {attempts.map((att) => {
              const test = tests.find((t) => t.id === att.testId);

              return (
                <div
                  key={att.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {test?.examName || 'Mock Test'}
                      </span>
                      <span className="text-xs text-slate-400">&bull;</span>
                      <span className="text-xs text-slate-500">
                        {new Date(att.completedAt || att.timestamp || Date.now()).toLocaleDateString()} at{' '}
                        {new Date(att.completedAt || att.timestamp || Date.now()).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {test?.testTitle || 'Custom Exam Drill'}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        {att.score} / {att.maxScore}
                      </div>
                      <div className="text-xs font-semibold text-emerald-600">
                        {att.accuracyPercentage}% Accuracy
                      </div>
                    </div>

                    {test && (
                      <button
                        onClick={() => onReviewAttempt(test, att)}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-bold text-xs transition-colors"
                      >
                        Inspect Review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
