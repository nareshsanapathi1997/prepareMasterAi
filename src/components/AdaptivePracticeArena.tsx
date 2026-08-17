import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Flame,
  Lightbulb,
  MessageSquare,
  HelpCircle,
  Zap,
  Target,
  RefreshCw,
  Send,
  BookOpen,
  Volume2,
} from 'lucide-react';
import { AdaptiveQuestion, ErrorMistakeType, TaggedError } from '../types';
import { generateAdaptiveQuestionAPI, explainDifferentlyAPI, questionFollowupAPI } from '../lib/api';
import { storage } from '../lib/storage';
import { EXAM_PRESETS } from '../data/presets';

interface AdaptivePracticeArenaProps {
  activeExam: string;
  isLoggedIn?: boolean;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export const AdaptivePracticeArena: React.FC<AdaptivePracticeArenaProps> = ({
  activeExam,
  isLoggedIn = false,
  onOpenAuth,
}) => {
  const [currentLevel, setCurrentLevel] = useState<'Easy' | 'Medium' | 'Hard' | 'Exam-Standard'>('Medium');
  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [loadingQuestion, setLoadingQuestion] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Session Stats
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [highestStreak, setHighestStreak] = useState<number>(0);

  // Hint Ladder State
  const [unlockedHintLevel, setUnlockedHintLevel] = useState<number>(0);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'explanation' | 'distractors' | 'alt'>('explanation');

  // Alternative Explanation State
  const [altExplanation, setAltExplanation] = useState<any>(null);
  const [loadingAltExp, setLoadingAltExp] = useState<boolean>(false);
  const [selectedAltStyle, setSelectedAltStyle] = useState<'analogy' | 'first-principles' | 'speed-trick' | 'eli5'>('analogy');

  // Interactive Question Followup Chat
  const [followupChat, setFollowupChat] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [followupInput, setFollowupInput] = useState<string>('');
  const [followupLoading, setFollowupLoading] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);

  // Error tagging modal/action
  const [taggedError, setTaggedError] = useState<ErrorMistakeType | null>(null);

  const preset = EXAM_PRESETS.find((p) => p.name === activeExam) || EXAM_PRESETS[0];

  const handleSpeakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const fetchNextAdaptiveQuestion = async (
    levelToFetch = currentLevel,
    isCorrectPrevious = false
  ) => {
    setLoadingQuestion(true);
    setError(null);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUnlockedHintLevel(0);
    setActiveAnalysisTab('explanation');
    setAltExplanation(null);
    setFollowupChat([]);
    setShowChat(false);
    setTaggedError(null);

    try {
      const q = await generateAdaptiveQuestionAPI({
        examName: activeExam,
        currentLevel: levelToFetch,
        recentPerformance: {
          accuracy: questionsAnswered > 0 ? Math.round((correctCount / questionsAnswered) * 100) : 70,
          currentStreak,
        },
      });
      setCurrentQuestion(q);
    } catch (err: any) {
      setError(err.message || 'Failed to generate next question.');
      // Fallback
      setCurrentQuestion({
        id: Date.now(),
        questionText: `In ${activeExam}, if the rate of inflation rises rapidly while economic growth slows down, what is this macroeconomic condition called?`,
        options: ['Reflation', 'Stagflation', 'Hyper-deflation', 'Structural Depression'],
        correctOptionIndex: 1,
        difficulty: levelToFetch,
        topicTag: 'Macroeconomics / Inflation',
        detailedExplanation: 'Stagflation is a toxic combination of stagnant economic growth, high unemployment, and high inflation. Standard monetary tools struggle because raising rates hurts growth while lowering rates fuels inflation.',
        shortcutTip: 'Stagflation = Stagnation + Inflation.',
      });
    } finally {
      setLoadingQuestion(false);
    }
  };

  useEffect(() => {
    fetchNextAdaptiveQuestion('Medium');
  }, [activeExam]);

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQuestion.correctOptionIndex;
    const newTotal = questionsAnswered + 1;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    setQuestionsAnswered(newTotal);
    setCorrectCount(newCorrect);

    if (isCorrect) {
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > highestStreak) setHighestStreak(newStreak);

      // Adaptive difficulty escalation
      if (currentLevel === 'Easy') setCurrentLevel('Medium');
      else if (currentLevel === 'Medium' && newStreak >= 2) setCurrentLevel('Hard');
      else if (currentLevel === 'Hard' && newStreak >= 3) setCurrentLevel('Exam-Standard');
    } else {
      setCurrentStreak(0);
      // Adaptive difficulty drop
      if (currentLevel === 'Exam-Standard') setCurrentLevel('Hard');
      else if (currentLevel === 'Hard') setCurrentLevel('Medium');
      else if (currentLevel === 'Medium') setCurrentLevel('Easy');
    }

    storage.recordStudyActivity();
  };

  const handleExplainDifferently = async (style: 'analogy' | 'first-principles' | 'speed-trick' | 'eli5') => {
    if (!currentQuestion) return;
    setSelectedAltStyle(style);
    setLoadingAltExp(true);
    try {
      const res = await explainDifferentlyAPI({
        questionText: currentQuestion.questionText,
        options: currentQuestion.options,
        correctAnswer: currentQuestion.options[currentQuestion.correctOptionIndex],
        originalExplanation: currentQuestion.detailedExplanation,
        style,
      });
      setAltExplanation(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingAltExp(false);
    }
  };

  const handleSendFollowup = async () => {
    if (!followupInput.trim() || !currentQuestion) return;
    const userMsg = followupInput.trim();
    const updatedHistory = [...followupChat, { role: 'user' as const, text: userMsg }];
    setFollowupChat(updatedHistory);
    setFollowupInput('');
    setFollowupLoading(true);

    try {
      const reply = await questionFollowupAPI({
        questionText: currentQuestion.questionText,
        options: currentQuestion.options,
        correctAnswer: currentQuestion.options[currentQuestion.correctOptionIndex],
        explanation: currentQuestion.detailedExplanation,
        userMessage: userMsg,
        chatHistory: updatedHistory,
      });
      setFollowupChat([...updatedHistory, { role: 'assistant', text: reply }]);
    } catch (err: any) {
      setFollowupChat([
        ...updatedHistory,
        { role: 'assistant', text: 'I encountered an error clarifying that. Let me know which step you would like broken down!' },
      ]);
    } finally {
      setFollowupLoading(false);
    }
  };

  const handleTagMistake = (tag: ErrorMistakeType) => {
    if (!currentQuestion || selectedOption === null) return;
    setTaggedError(tag);

    const errorItem: TaggedError = {
      id: `err-${Date.now()}`,
      examName: activeExam,
      questionId: currentQuestion.id,
      questionText: currentQuestion.questionText,
      options: currentQuestion.options,
      userAnswerIndex: selectedOption,
      correctOptionIndex: currentQuestion.correctOptionIndex,
      explanation: currentQuestion.detailedExplanation,
      errorTag: tag,
      topicTag: currentQuestion.topicTag,
      taggedAt: new Date().toISOString(),
      resolved: false,
    };

    storage.saveTaggedError(errorItem);
  };

  const accuracy = questionsAnswered > 0 ? Math.round((correctCount / questionsAnswered) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner with Adaptive Engine Stats */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-indigo-500/20">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/30 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-300">
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Real-Time Adaptive Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Dynamic Difficulty Arena
          </h2>
          <p className="text-indigo-200 text-sm">
            Difficulty calibrates after every question based on your accuracy and speed. Master your peak exam-standard zone.
          </p>
        </div>

        {/* Live Metrics Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[90px]">
            <div className="text-xs text-indigo-300 font-semibold uppercase">Difficulty</div>
            <div className="text-base font-black text-white flex items-center justify-center space-x-1">
              <span>{currentLevel}</span>
            </div>
          </div>

          <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[90px]">
            <div className="text-xs text-indigo-300 font-semibold uppercase">Streak</div>
            <div className="text-base font-black text-amber-400 flex items-center justify-center space-x-1">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>{currentStreak}</span>
            </div>
          </div>

          <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[90px]">
            <div className="text-xs text-indigo-300 font-semibold uppercase">Accuracy</div>
            <div className="text-base font-black text-emerald-400">
              {accuracy}%
            </div>
          </div>
        </div>
      </div>

      {/* Guest Demo vs Unlimited Banner */}
      {!isLoggedIn ? (
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 border border-indigo-300/60 dark:border-indigo-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
              ⚡
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Demo Adaptive Practice (Sample Question Flow)
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Register or log in to unlock <strong>Unlimited Adaptive Questions</strong>, custom cognitive mistake logs, and spaced repetition revisions.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenAuth?.('signup')}
            className="shrink-0 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Create Free Account
          </button>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 px-4 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-bold">
          <span>💎 Unlimited Adaptive Engine Active — Full Question Pool & Spaced Repetition Enabled</span>
          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-mono">UNLIMITED</span>
        </div>
      )}

      {/* Main Question Arena Card */}
      {loadingQuestion ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Calibrating next adaptive question for <span className="text-indigo-600 font-bold">{currentLevel}</span> level...
          </p>
        </div>
      ) : currentQuestion ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg uppercase">
                {currentQuestion.topicTag}
              </span>
              <span
                className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                  currentLevel === 'Easy'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : currentLevel === 'Medium'
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : currentLevel === 'Hard'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                }`}
              >
                {currentQuestion.difficulty || currentLevel}
              </span>

              {currentStreak >= 5 && (
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 text-white flex items-center gap-1 animate-pulse">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Boss Rush (2x Mastery)</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleSpeakQuestion(currentQuestion.questionText)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1 text-xs"
                title="Read question aloud"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Listen</span>
              </button>
              <span className="text-xs font-medium text-slate-400">
                Session Question #{questionsAnswered + 1}
              </span>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion.questionText}
            </h3>

            {/* 3-Tier Progressive Hint Ladder (Available before answering) */}
            {!isAnswerSubmitted && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Cognitive Hint Ladder ({unlockedHintLevel}/3 Unlocked)</span>
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      disabled={unlockedHintLevel >= 3}
                      onClick={() => setUnlockedHintLevel(Math.min(3, unlockedHintLevel + 1))}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-800 dark:text-amber-300 font-bold text-[11px] disabled:opacity-40 transition-colors"
                    >
                      {unlockedHintLevel === 0 ? '💡 Reveal Tier 1 Hint' : unlockedHintLevel === 1 ? '🔍 Reveal Tier 2 Step' : '📐 Reveal Tier 3 Skeleton'}
                    </button>
                  </div>
                </div>

                {unlockedHintLevel >= 1 && (
                  <div className="text-xs p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200">
                    <strong>Tier 1 Concept:</strong> Focus on fundamental principles of {currentQuestion.topicTag}. Recall standard governing equations and constraints.
                  </div>
                )}
                {unlockedHintLevel >= 2 && (
                  <div className="text-xs p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200">
                    <strong>Tier 2 Intermediate Step:</strong> {currentQuestion.shortcutTip || 'Isolate the primary variable and check boundary conditions or dimensional consistency.'}
                  </div>
                )}
                {unlockedHintLevel >= 3 && (
                  <div className="text-xs p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-purple-900 dark:text-purple-200">
                    <strong>Tier 3 Blueprint:</strong> Eliminate distractors with incorrect units or contradictory edge cases to converge on the target choice.
                  </div>
                )}
              </div>
            )}

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQuestion.options.map((opt, idx) => {
                const optLetter = String.fromCharCode(65 + idx);
                const isSelected = selectedOption === idx;
                const isCorrect = isAnswerSubmitted && idx === currentQuestion.correctOptionIndex;
                const isWrong = isAnswerSubmitted && isSelected && idx !== currentQuestion.correctOptionIndex;

                let borderStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-400';
                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    borderStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100';
                  } else if (isWrong) {
                    borderStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100';
                  }
                } else if (isSelected) {
                  borderStyle = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100';
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => setSelectedOption(idx)}
                    className={`p-4 rounded-2xl border text-left font-medium transition-all flex items-start space-x-3 ${borderStyle}`}
                  >
                    <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 flex-shrink-0">
                      {optLetter}
                    </span>
                    <span className="text-sm pt-0.5">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit / Next Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {!isAnswerSubmitted ? (
              <button
                disabled={selectedOption === null}
                onClick={handleSubmitAnswer}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md disabled:opacity-40 transition-all flex items-center space-x-2"
              >
                <span>Submit Answer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => fetchNextAdaptiveQuestion(currentLevel, selectedOption === currentQuestion.correctOptionIndex)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center space-x-2"
                >
                  <span>Next Adaptive Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowChat(!showChat)}
                  className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm transition-all flex items-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  <span>{showChat ? 'Hide Doubt Chat' : 'Ask AI Doubt On This'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Detailed Solution & Diagnostics Box when Answered */}
          {isAnswerSubmitted && (
            <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {/* Tab Selector */}
              <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveAnalysisTab('explanation')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeAnalysisTab === 'explanation'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  📖 Step-by-Step Solution
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAnalysisTab('distractors')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeAnalysisTab === 'distractors'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  🎯 Examiner Trap & Distractor Audit
                </button>
              </div>

              {activeAnalysisTab === 'explanation' && (
                <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Step-by-Step Explanation
                    </h4>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {currentQuestion.detailedExplanation}
                  </p>

                  {currentQuestion.shortcutTip && (
                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl flex items-start space-x-2 text-xs text-amber-900 dark:text-amber-200 font-medium">
                      <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span><strong className="font-bold">Shortcut / Exam Hack:</strong> {currentQuestion.shortcutTip}</span>
                    </div>
                  )}
                </div>
              )}

              {activeAnalysisTab === 'distractors' && (
                <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-rose-500" />
                      <span>Cognitive Distractor Diagnostic (Why Options Were Placed)</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Standard {activeExam} Trap Patterns
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {currentQuestion.options.map((opt, idx) => {
                      const isCorrect = idx === currentQuestion.correctOptionIndex;
                      const optLetter = String.fromCharCode(65 + idx);
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start space-x-2.5 ${
                            isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {optLetter}
                          </span>
                          <div>
                            <span className="font-bold">{opt}</span>
                            <p className="text-[11px] mt-0.5 text-slate-500 dark:text-slate-400">
                              {isCorrect
                                ? '✅ Verified correct answer derived from rigorous formulation.'
                                : idx % 2 === 0
                                ? '⚠️ Classic sign inversion trap — candidates who rush intermediate algebra frequently select this.'
                                : '⚠️ Boundary condition trap — ignores non-zero baseline constraints.'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Error Tagging if Incorrect */}
              {selectedOption !== currentQuestion.correctOptionIndex && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                      Why did you get this wrong? Tag in Error Notebook:
                    </span>
                    {taggedError && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        Saved: {taggedError}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(['Concept Gap', 'Silly Mistake', 'Timing Pressure', 'Examiner Trap', 'Formula Slip'] as ErrorMistakeType[]).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagMistake(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          taggedError === tag
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Explain Differently Switcher */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>Explain Again in a Different Pedagogical Style:</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleExplainDifferently('analogy')}
                    disabled={loadingAltExp}
                    className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold transition-all"
                  >
                    🎭 Real-World Analogy
                  </button>

                  <button
                    onClick={() => handleExplainDifferently('first-principles')}
                    disabled={loadingAltExp}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition-all"
                  >
                    🔬 First Principles Physics/Math
                  </button>

                  <button
                    onClick={() => handleExplainDifferently('speed-trick')}
                    disabled={loadingAltExp}
                    className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold transition-all"
                  >
                    ⚡ 10-Sec Elimination Trick
                  </button>

                  <button
                    onClick={() => handleExplainDifferently('eli5')}
                    disabled={loadingAltExp}
                    className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition-all"
                  >
                    👶 Explain Like I'm 12
                  </button>
                </div>

                {loadingAltExp && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-2xl flex items-center space-x-2 text-xs text-purple-700 dark:text-purple-300 font-semibold animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Re-synthesizing concept in {selectedAltStyle} perspective...</span>
                  </div>
                )}

                {altExplanation && (
                  <div className="p-5 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-bold text-purple-800 dark:text-purple-300 uppercase">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span>{altExplanation.styleName}</span>
                    </div>

                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                      {altExplanation.alternativeExplanation}
                    </p>

                    {altExplanation.keyVisualOrAnalogy && (
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-purple-100 dark:border-purple-900 text-xs text-purple-950 dark:text-purple-200">
                        <strong>Mental Picture: </strong> {altExplanation.keyVisualOrAnalogy}
                      </div>
                    )}

                    {altExplanation.goldenRule && (
                      <div className="text-xs font-bold text-purple-700 dark:text-purple-300">
                        💡 Golden Rule: {altExplanation.goldenRule}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Question Follow-up Chat */}
              {showChat && (
                <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    <span>Interactive AI Tutor Chat for this Question</span>
                  </div>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {followupChat.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">
                        Type any doubt regarding this specific question (e.g. "Why is option C wrong?", "Can you derive equation 2?").
                      </p>
                    ) : (
                      followupChat.map((msg, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-xl text-xs leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-indigo-600 text-white ml-8 font-medium'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 mr-8'
                          }`}
                        >
                          {msg.text}
                        </div>
                      ))
                    )}
                    {followupLoading && (
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-xs text-slate-500 flex items-center space-x-2">
                        <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
                        <span>AI Tutor is replying...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={followupInput}
                      onChange={(e) => setFollowupInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendFollowup()}
                      placeholder="Ask specific clarification..."
                      className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleSendFollowup}
                      disabled={followupLoading || !followupInput.trim()}
                      className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
