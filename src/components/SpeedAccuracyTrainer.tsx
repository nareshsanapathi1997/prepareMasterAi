import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Flame,
  AlertTriangle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { SpeedDrill, SpeedDrillAttempt } from '../types';
import { generateSpeedDrillAPI } from '../lib/api';
import { storage } from '../lib/storage';
import { SAMPLE_SPEED_DRILL, EXAM_PRESETS } from '../data/presets';

interface SpeedAccuracyTrainerProps {
  activeExam: string;
}

export const SpeedAccuracyTrainer: React.FC<SpeedAccuracyTrainerProps> = ({ activeExam }) => {
  const [drill, setDrill] = useState<SpeedDrill>(SAMPLE_SPEED_DRILL);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active drill states
  const [drillStarted, setDrillStarted] = useState<boolean>(false);
  const [drillFinished, setDrillFinished] = useState<boolean>(false);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(300);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [questionTimeLogs, setQuestionTimeLogs] = useState<number[]>([]);

  // Generation options
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  const timerRef = useRef<any>(null);

  // Preset match
  const currentPreset = EXAM_PRESETS.find((p) => p.name === activeExam) || EXAM_PRESETS[0];

  useEffect(() => {
    if (currentPreset.defaultSubjects.length > 0) {
      setSelectedSubject(currentPreset.defaultSubjects[0]);
    }
    if (currentPreset.sampleTopics.length > 0) {
      setSelectedTopic(currentPreset.sampleTopics[0]);
    }
  }, [activeExam]);

  // Timer logic
  useEffect(() => {
    if (drillStarted && !drillFinished) {
      timerRef.current = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishDrill();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [drillStarted, drillFinished]);

  const handleGenerateDrill = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateSpeedDrillAPI({
        examName: activeExam,
        subject: selectedSubject,
        topic: selectedTopic,
        drillType: '10-Question 5-Minute Speed Sprint',
      });
      setDrill(res);
      setDrillStarted(false);
      setDrillFinished(false);
      setSelectedAnswers({});
      setCurrentQIndex(0);
      setTimeRemainingSeconds(res.totalTimeLimitSeconds || 300);
    } catch (err: any) {
      setError(err.message || 'Failed to generate drill. Switched to offline high-yield drill.');
      setDrill(SAMPLE_SPEED_DRILL);
    } finally {
      setLoading(false);
    }
  };

  const startDrill = () => {
    setDrillStarted(true);
    setDrillFinished(false);
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setTimeRemainingSeconds(drill.totalTimeLimitSeconds || 300);
    setQuestionStartTime(Date.now());
    setQuestionTimeLogs([]);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (drillFinished) return;

    const timeSpentOnThisQ = Math.round((Date.now() - questionStartTime) / 1000);
    setQuestionTimeLogs((prev) => [...prev, timeSpentOnThisQ]);

    const updated = { ...selectedAnswers, [currentQIndex]: optionIndex };
    setSelectedAnswers(updated);

    if (currentQIndex < drill.questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setQuestionStartTime(Date.now());
    } else {
      finishDrill(updated);
    }
  };

  const finishDrill = (finalAnswers = selectedAnswers) => {
    setDrillFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    drill.questions.forEach((q, idx) => {
      if (finalAnswers[idx] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const timeTaken = (drill.totalTimeLimitSeconds || 300) - timeRemainingSeconds;
    const accuracy = Math.round((correctCount / drill.questions.length) * 100);
    const avgPace = Math.round(timeTaken / drill.questions.length);

    const attempt: SpeedDrillAttempt = {
      id: `drill-${Date.now()}`,
      title: drill.title,
      examName: activeExam,
      totalQuestions: drill.questions.length,
      correctCount,
      wrongCount: drill.questions.length - correctCount,
      timeTakenSeconds: timeTaken,
      accuracyPercent: accuracy,
      avgPaceSecondsPerQ: avgPace,
      completedAt: new Date().toISOString(),
      userAnswers: finalAnswers,
    };

    storage.saveSpeedDrillAttempt(attempt);
  };

  const currentQ = drill.questions[currentQIndex] || drill.questions[0];
  const totalQ = drill.questions.length;
  const progressPercent = Math.round(((currentQIndex + 1) / totalQ) * 100);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const previousAttempts = storage.getSpeedDrillAttempts();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span>Pacing & Speed Calibration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Speed & Accuracy Micro-Drill Sprint
          </h2>
          <p className="text-orange-100 text-sm leading-relaxed">
            10 high-frequency questions in 5 minutes (30s pace). Train cognitive reflexes, instinctual elimination, and rapid shortcut identification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerateDrill}
            disabled={loading || drillStarted}
            className="flex items-center space-x-2 px-5 py-3 bg-white text-orange-700 font-bold rounded-2xl shadow-lg hover:bg-orange-50 active:scale-95 transition-all text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Generating Sprint...' : 'Generate New Drill'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-center space-x-3 text-amber-800 dark:text-amber-300 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drill Arena */}
      {!drillStarted && !drillFinished && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Flame className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {drill.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Exam: <span className="font-semibold text-slate-700 dark:text-slate-200">{activeExam}</span> | Target Pace: <span className="font-semibold text-amber-600">30s / question</span>
            </p>
          </div>

          {/* Configuration */}
          <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Focus Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500"
              >
                {currentPreset.defaultSubjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Topic Drill
              </label>
              <input
                type="text"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                placeholder="e.g. Number Systems, Ratios..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={startDrill}
              className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-base rounded-2xl shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Zap className="w-5 h-5 fill-white" />
              <span>START 5-MINUTE SPRINT NOW</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Running Drill */}
      {drillStarted && !drillFinished && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header with Countdown & Progress */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-bold uppercase tracking-wider">
                Question {currentQIndex + 1} of {totalQ}
              </span>
              <span className="text-xs font-medium text-slate-500">{currentQ.topicTag}</span>
            </div>

            <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-mono font-black text-lg bg-rose-50 dark:bg-rose-950/50 px-4 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>{formatTime(timeRemainingSeconds)}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Question Box */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {currentQ.questionText}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQ.options.map((option, optIdx) => {
                const optLetter = String.fromCharCode(65 + optIdx);
                const isSelected = selectedAnswers[currentQIndex] === optIdx;

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-4 rounded-2xl border text-left font-medium transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 flex-shrink-0">
                      {optLetter}
                    </span>
                    <span className="text-sm pt-0.5">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom control */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handleSelectOption(-1)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold"
            >
              Skip Question &rarr;
            </button>

            <button
              onClick={() => finishDrill()}
              className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline"
            >
              End Sprint Early
            </button>
          </div>
        </div>
      )}

      {/* Finished Review Screen */}
      {drillFinished && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8">
          {/* Result Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Sprint Complete!
            </h3>
            <p className="text-sm text-slate-500">
              Exam: {activeExam} | Time Spent: {300 - timeRemainingSeconds}s
            </p>
          </div>

          {/* Quick Metrics */}
          {(() => {
            let correct = 0;
            drill.questions.forEach((q, idx) => {
              if (selectedAnswers[idx] === q.correctOptionIndex) correct++;
            });
            const accuracy = Math.round((correct / totalQ) * 100);
            const avgPace = Math.round((300 - timeRemainingSeconds) / totalQ);

            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-center">
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {correct} / {totalQ}
                  </div>
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mt-1">
                    Correct ({accuracy}%)
                  </div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl text-center">
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {avgPace}s
                  </div>
                  <div className="text-xs font-bold text-amber-800 dark:text-amber-300 mt-1">
                    Avg Speed per Question
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded-2xl text-center">
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {accuracy >= 80 && avgPace <= 30 ? 'Elite (Top 1%)' : accuracy >= 60 ? 'Competent' : 'Needs Speed Drill'}
                  </div>
                  <div className="text-xs font-bold text-indigo-800 dark:text-indigo-300 mt-1">
                    Pacing Readiness Rating
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Question by Question Shortcut Deconstructions */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Shortcut Deconstruction & Solutions
            </h4>

            <div className="space-y-4">
              {drill.questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correctOptionIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCorrect
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20'
                        : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-500">Q{idx + 1}.</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {q.topicTag}
                          </span>
                          {isCorrect ? (
                            <span className="text-xs font-bold text-emerald-600 flex items-center">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Correct
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-rose-600 flex items-center">
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Incorrect
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {q.questionText}
                        </p>
                      </div>
                    </div>

                    {/* Speed Shortcut Box */}
                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-xl space-y-1">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>15-Second Speed Hack:</span>
                      </div>
                      <p className="text-xs text-amber-900 dark:text-amber-100 font-medium">
                        {q.speedShortcut}
                      </p>
                    </div>

                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Detailed Working: </span>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center space-x-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={startDrill}
              className="flex items-center space-x-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-md transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Sprint</span>
            </button>

            <button
              onClick={handleGenerateDrill}
              className="flex items-center space-x-2 px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-sm shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>New AI Drill</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
