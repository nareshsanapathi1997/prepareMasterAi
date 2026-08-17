import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  Loader2,
  BookOpen,
  Copy,
  Check,
  Zap,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Bookmark,
  Share2,
} from 'lucide-react';
import { explainTopicAPI } from '../lib/api';
import { TopicExplanation } from '../types';
import { EXAM_PRESETS } from '../data/presets';
import { storage } from '../lib/storage';

interface ConceptExplainerProps {
  activeExam: string;
  onGenerateTestForTopic: (topic: string) => void;
  onGenerateFlashcardsForTopic: (topic: string) => void;
}

export const ConceptExplainer: React.FC<ConceptExplainerProps> = ({
  activeExam,
  onGenerateTestForTopic,
  onGenerateFlashcardsForTopic,
}) => {
  const currentPreset = EXAM_PRESETS.find((p) => p.name === activeExam);

  const [topicInput, setTopicInput] = useState('');
  const [depthLevel, setDepthLevel] = useState('Standard Exam Depth');
  const [learningStyle, setLearningStyle] = useState('Intuitive & Practical');
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<TopicExplanation | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const savedExplanations = storage.getSavedExplanations();

  const handleExplain = async (topicToUse?: string) => {
    const targetTopic = topicToUse || topicInput;
    if (!targetTopic.trim()) return;

    setLoading(true);
    setSelectedQuizAnswers({});
    setShowQuizResults(false);

    try {
      const data = await explainTopicAPI({
        examName: activeExam,
        topic: targetTopic,
        depthLevel,
        learningStyle,
      });

      setExplanation(data);
      storage.saveExplanation({
        topic: targetTopic,
        examName: activeExam,
        data,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search & Topic Generator Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              AI Deep Topic Explainer & Master Class
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Break down any complex formula, theorem, or chapter into intuitive analogies, exam mnemonics, and solved traps.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExplain();
          }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              id="topic-explainer-input"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Fundamental Rights vs DPSP / Carnot Engine Thermodynamics / Bayes' Theorem"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <button
              type="submit"
              id="explain-topic-btn"
              disabled={loading || !topicInput.trim()}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 whitespace-nowrap flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Concept...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Explain Concept</span>
                </>
              )}
            </button>
          </div>

          {/* Quick presets suggestions */}
          {currentPreset && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Suggested Topics:
              </span>
              {currentPreset.sampleTopics.map((top) => (
                <button
                  type="button"
                  key={top}
                  onClick={() => {
                    setTopicInput(top);
                    handleExplain(top);
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                >
                  {top}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Explanation Results */}
      {explanation && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header & Quick Action Buttons */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-900">
                Topic Masterclass
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                {explanation.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {explanation.summary}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onGenerateTestForTopic(explanation.title)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Practice Mock Test</span>
              </button>
              <button
                onClick={() => onGenerateFlashcardsForTopic(explanation.title)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Generate Flashcards</span>
              </button>
            </div>
          </div>

          {/* Core Intuition & Real-World Analogy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-indigo-50/70 to-white dark:from-indigo-950/40 dark:to-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                The Big Picture & Core Intuition
              </h3>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {explanation.coreIntuition.theBigPicture}
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50/70 to-white dark:from-amber-950/40 dark:to-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/60 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Real-World Analogy
              </h3>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {explanation.coreIntuition.realWorldAnalogy}
              </p>
            </div>
          </div>

          {/* Key Formulas, Statements, Rules */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Core Formulas, Principles & Definitions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {explanation.keyConceptsAndRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 relative group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {rule.name}
                    </h4>
                    <button
                      onClick={() => handleCopy(rule.formulaOrStatement, `rule-${idx}`)}
                      className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700"
                      title="Copy formula/rule"
                    >
                      {copiedKey === `rule-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs mb-2.5 overflow-x-auto">
                    {rule.formulaOrStatement}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                    {rule.explanation}
                  </p>
                  <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded-md">
                    Takeaway: {rule.keyTakeaway}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mnemonics & Memory Hacks */}
          {explanation.mnemonicsAndMemoryHacks && explanation.mnemonicsAndMemoryHacks.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Exam Mnemonics & Memory Hacks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {explanation.mnemonicsAndMemoryHacks.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60"
                  >
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase block mb-1">
                      {m.ruleName}
                    </span>
                    <div className="text-sm font-black text-slate-900 dark:text-white mb-1.5">
                      "{m.mnemonic}"
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {m.howToRemember}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Solved Exam-Grade Examples with Shortcut Hacks */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              Step-by-Step Solved Exam Problems & Shortcuts
            </h3>
            <div className="space-y-4">
              {explanation.solvedExamExamples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Problem #{idx + 1}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {ex.difficulty}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    {ex.problemStatement}
                  </p>

                  <div className="space-y-1.5 pl-3 border-l-2 border-indigo-500 mb-3">
                    {ex.stepByStepSolution.map((step, sIdx) => (
                      <p key={sIdx} className="text-xs text-slate-700 dark:text-slate-300">
                        <strong>Step {sIdx + 1}:</strong> {step}
                      </p>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Final Answer: {ex.finalAnswer}
                    </div>
                    {ex.shortcutOrExamTrick && (
                      <div className="text-xs text-amber-700 dark:text-amber-300 font-medium bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-md">
                        💡 <strong>Trick:</strong> {ex.shortcutOrExamTrick}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Examiner Traps */}
          {explanation.commonExaminerTraps && explanation.commonExaminerTraps.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 p-6 shadow-sm">
              <h3 className="text-base font-bold text-rose-700 dark:text-rose-300 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Examiner Traps & Common Student Errors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {explanation.commonExaminerTraps.map((trap, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40"
                  >
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-1">
                      {trap.trapDescription}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      <strong className="text-rose-600">Why students fail:</strong> {trap.whyStudentsFail}
                    </p>
                    <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-lg">
                      🛡️ <strong>How to avoid:</strong> {trap.howToAvoid}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Self-Check Quiz */}
          {explanation.quickSelfCheckQuiz && explanation.quickSelfCheckQuiz.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                  Instant Concept Self-Check Quiz
                </h3>
                <button
                  onClick={() => setShowQuizResults(!showQuizResults)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {showQuizResults ? 'Hide Solutions' : 'Check Answers & Solutions'}
                </button>
              </div>

              <div className="space-y-4">
                {explanation.quickSelfCheckQuiz.map((quizQ, qIdx) => {
                  const selected = selectedQuizAnswers[qIdx];
                  const isCorrect = selected === quizQ.correctOptionIndex;

                  return (
                    <div
                      key={qIdx}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40"
                    >
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        Q{qIdx + 1}: {quizQ.question}
                      </p>

                      <div className="space-y-2 mb-3">
                        {quizQ.options.map((opt, oIdx) => {
                          const isOptionSelected = selected === oIdx;
                          const isOptionCorrect = oIdx === quizQ.correctOptionIndex;

                          let style =
                            'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200';
                          if (isOptionSelected && !showQuizResults) {
                            style = 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 font-semibold';
                          } else if (showQuizResults) {
                            if (isOptionCorrect) {
                              style = 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold';
                            } else if (isOptionSelected && !isOptionCorrect) {
                              style = 'bg-rose-50 dark:bg-rose-950 border-rose-400 text-rose-900 font-semibold';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() =>
                                setSelectedQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))
                              }
                              className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm flex items-center justify-between transition-colors ${style}`}
                            >
                              <span>{opt}</span>
                              {showQuizResults && isOptionCorrect && (
                                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {showQuizResults && (
                        <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-xs text-slate-700 dark:text-slate-300">
                          <strong>Solution:</strong> {quizQ.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
