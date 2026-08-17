import React from 'react';
import {
  FileText,
  Clock,
  Plus,
  Play,
  CheckCircle2,
  Trophy,
  BookOpen,
  Sparkles,
  BarChart,
  RotateCcw,
  Lock,
  Unlock,
  ShieldCheck,
} from 'lucide-react';
import { MockTest, TestAttempt } from '../types';

interface MockTestListProps {
  activeExam: string;
  tests: MockTest[];
  attempts: TestAttempt[];
  onStartTest: (test: MockTest) => void;
  onOpenGenerator: () => void;
  onViewAttemptReview: (test: MockTest, attempt: TestAttempt) => void;
  isLoggedIn?: boolean;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export const MockTestList: React.FC<MockTestListProps> = ({
  activeExam,
  tests,
  attempts,
  onStartTest,
  onOpenGenerator,
  onViewAttemptReview,
  isLoggedIn = false,
  onOpenAuth,
}) => {
  const filteredTests = tests.filter(
    (t) => t.examName.toLowerCase() === activeExam.toLowerCase() || tests.length <= 2
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with Generator Trigger */}
      <div className="bg-gradient-to-r from-indigo-900 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Mock Test Arena</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Practice Real Exam Papers Calibrated for {activeExam}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed mb-6">
            Take timed full-length or topic-wise adaptive mock exams with realistic negative marking, live timer palette, instant trap analysis, and AI cognitive diagnostics.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              id="generate-new-test-hero-btn"
              onClick={onOpenGenerator}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs sm:text-sm shadow-lg hover:bg-indigo-50 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {isLoggedIn ? 'Create Unlimited AI Mock Test' : 'Create AI Custom Mock Test (Demo)'}
              </span>
            </button>
            {!isLoggedIn && (
              <button
                onClick={() => onOpenAuth?.('signup')}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-400/30 text-white font-bold text-xs sm:text-sm shadow-lg transition-all cursor-pointer"
              >
                <Unlock className="w-4 h-4 text-emerald-300" />
                <span>Register Free for Unlimited Mocks</span>
              </button>
            )}
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>

      {/* Guest Demo vs Unlimited Access Notice */}
      {!isLoggedIn ? (
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-300/60 dark:border-amber-700/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
              ⚡
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Free Demo Preview Mode Active
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-semibold">
                  1 Sample Test Unlocked
                </span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                You can try the free sample test below. Register or sign in for free to unlock <strong>all full-length mock exams, AI error diagnostics, and All-India ranks</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenAuth?.('signup')}
            className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            Create Free Account
          </button>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              💎 Lifetime Full Access Active — All Exams, Quizzes & AI Diagnostics Unlocked
            </span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hidden sm:inline">
            Unlimited Generations Available
          </span>
        </div>
      )}

      {/* Available Tests Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Available Practice & Mock Tests ({filteredTests.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTests.map((test, index) => {
            const pastAttempts = attempts.filter((a) => a.testId === test.id);
            const latestAttempt = pastAttempts[0];
            // If user is not logged in, test index 0 is open Demo, other tests require free registration/login
            const isDemoOpen = isLoggedIn || index === 0;

            return (
              <div
                key={test.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border ${
                  isDemoOpen
                    ? 'border-slate-200 dark:border-slate-800'
                    : 'border-slate-200/80 dark:border-slate-800/80 opacity-95'
                } p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between relative`}
              >
                {/* Demo or Lock Pill */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  {!isLoggedIn && (
                    isDemoOpen ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                        Free Demo
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-amber-500" />
                        Free Sign-In to Unlock
                      </span>
                    )
                  )}
                </div>

                <div>
                  <div className="flex items-start justify-between gap-2 mb-2 pr-20">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                      {test.subject}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {test.difficulty}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                    {test.testTitle}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                    Focus: {test.topic}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-slate-600 dark:text-slate-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>{test.questions.length} Questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{test.recommendedTimeMinutes} Mins</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>{test.questions.length * 2} Marks</span>
                    </div>
                  </div>
                </div>

                {/* Past Attempt Status or Start button */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {latestAttempt ? (
                    <div className="flex items-center space-x-2">
                      <div className="text-xs">
                        <span className="text-slate-500">Last Score: </span>
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          {latestAttempt.score}/{latestAttempt.maxScore}
                        </strong>
                        <span className="text-slate-400 ml-1">
                          ({latestAttempt.accuracyPercentage}%)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      {isDemoOpen ? 'Ready to attempt' : 'Requires Free Account'}
                    </span>
                  )}

                  <div className="flex items-center space-x-2">
                    {latestAttempt && (
                      <button
                        onClick={() => onViewAttemptReview(test, latestAttempt)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        View Analysis
                      </button>
                    )}

                    {isDemoOpen ? (
                      <button
                        onClick={() => onStartTest(test)}
                        className="flex items-center space-x-1 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>{latestAttempt ? 'Retake' : !isLoggedIn ? 'Start Free Demo' : 'Start Exam'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenAuth?.('signup')}
                        className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                      >
                        <Lock className="w-3 h-3 text-indigo-500" />
                        <span>Unlock Free</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
