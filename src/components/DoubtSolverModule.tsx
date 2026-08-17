import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Zap,
  BookOpen,
  ArrowRight,
  Eye,
  EyeOff,
  History,
  Camera,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { solveDoubtAPI, solveMultimodalDoubtAPI } from '../lib/api';
import { DoubtSolution } from '../types';
import { storage } from '../lib/storage';

interface DoubtSolverModuleProps {
  activeExam: string;
  isLoggedIn?: boolean;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export const DoubtSolverModule: React.FC<DoubtSolverModuleProps> = ({
  activeExam,
  isLoggedIn = false,
  onOpenAuth,
}) => {
  const [questionInput, setQuestionInput] = useState('');
  const [topicContext, setTopicContext] = useState('');
  const [studentAttempt, setStudentAttempt] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<DoubtSolution | null>(null);
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  const savedDoubts = storage.getSavedDoubts();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      const base64Data = result.split(',')[1];
      setImageBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageBase64(null);
    setImagePreview(null);
  };

  const handleSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() && !imageBase64) return;

    setLoading(true);
    setRevealedHints({});
    setRevealedAnswers({});

    try {
      let result: any;
      if (imageBase64) {
        result = await solveMultimodalDoubtAPI({
          examName: activeExam,
          questionText: questionInput,
          imageBase64,
          mimeType: 'image/jpeg',
        });
      } else {
        result = await solveDoubtAPI({
          examName: activeExam,
          questionOrDoubt: questionInput,
          topicContext,
          studentAttempt,
        });
      }

      setSolution(result);
      storage.saveDoubt({
        question: questionInput || 'Image-based question / OCR Doubt',
        examName: activeExam,
        solution: result,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Doubt Input Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        {/* Guest Demo Notice vs Unlimited Status */}
        {!isLoggedIn ? (
          <div className="mb-6 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-300/60 dark:border-amber-700/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                ⚡
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Demo Doubt Solver Active
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Preview 3 free doubt explanations. Register or log in to unlock <strong>Unlimited 24/7 Photo/OCR & Step-by-Step Solutions</strong>.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenAuth?.('signup')}
              className="shrink-0 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Unlock Unlimited Free
            </button>
          </div>
        ) : (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 px-4 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-bold">
            <span>💎 Unlimited 24/7 AI Doubt Resolution & Camera OCR Solver Active</span>
            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-mono">UNLIMITED</span>
          </div>
        )}

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              24/7 AI Doubt Clearing Tutor & Problem Solver
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Paste any challenging problem, numerical question, or conceptual confusion for {activeExam}.
            </p>
          </div>
        </div>

        <form onSubmit={handleSolve} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              The Question / Problem Statement / Confusing Concept
            </label>
            <textarea
              id="doubt-question-input"
              rows={3}
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="e.g. A block of mass 2kg slides down a frictionless incline of 30 degrees... OR type doubt context"
              className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          {/* Multimodal Photo/OCR Upload Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Snap / Upload Photo of Question, Handwritten Working, or Diagram (OCR Solver)
            </label>
            
            {imagePreview ? (
              <div className="relative inline-block border-2 border-indigo-500 rounded-2xl overflow-hidden shadow-md">
                <img src={imagePreview} alt="Doubt Preview" className="max-h-48 object-contain bg-slate-950" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 transition-all hover:bg-indigo-50/30">
                <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  <Camera className="w-5 h-5" />
                  <span>Upload Question Image or Diagram (PNG, JPG)</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1">AI reads equations, circuits, geometric figures, and handwritten notes directly</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Topic / Subject Context (Optional)
              </label>
              <input
                type="text"
                value={topicContext}
                onChange={(e) => setTopicContext(e.target.value)}
                placeholder="e.g. Newton Laws / Constitutional Law / Dynamic Programming"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Your Attempt / Where You Got Stuck (Optional)
              </label>
              <input
                type="text"
                value={studentAttempt}
                onChange={(e) => setStudentAttempt(e.target.value)}
                placeholder="e.g. I used formula v=u+at but got negative time / confused about option C"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              id="solve-doubt-submit-btn"
              disabled={loading || !questionInput.trim()}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing & Solving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Solve with AI Tutor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Solution Display */}
      {solution && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Direct Answer & Core Principle */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                Verified Master Solution
              </span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-100 font-bold text-base sm:text-lg mb-4">
              {solution.directAnswer}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <strong>Underlying Scientific/Legal Principle:</strong> {solution.corePrinciple}
            </div>
          </div>

          {/* Step-by-Step Working */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Step-by-Step Pedagogical Derivation
            </h3>
            <div className="space-y-3">
              {solution.stepByStepWorking.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {step.stepNumber}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {step.stepTitle}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 pl-8 leading-relaxed whitespace-pre-line">
                    {step.calculationOrLogic}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Misconception Diagnosis & Exam Shortcut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Misconception Diagnosis
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-2">
                <strong>Likely Trap:</strong> {solution.studentDiagnosis.likelyMisconception}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950 p-2.5 rounded-lg">
                💡 <strong>Correct Mental Model:</strong> {solution.studentDiagnosis.howToThinkCorrectly}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Pro Exam Shortcut / Elimination Trick
              </h3>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed mb-3">
                {solution.proExamShortcut}
              </p>
              {solution.formulaCheatSheet && solution.formulaCheatSheet.length > 0 && (
                <div className="pt-2 border-t border-indigo-200 dark:border-indigo-900">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">
                    Related Formulas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {solution.formulaCheatSheet.map((f, fIdx) => (
                      <span
                        key={fIdx}
                        className="text-xs font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Follow-up Drill Practice Questions */}
          {solution.similarPracticeQuestions && solution.similarPracticeQuestions.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Similar Follow-up Practice Problems (Reinforce Concept)
              </h3>
              <div className="space-y-4">
                {solution.similarPracticeQuestions.map((drill, dIdx) => (
                  <div
                    key={dIdx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      Drill #{dIdx + 1}: {drill.question}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() =>
                          setRevealedHints((prev) => ({ ...prev, [dIdx]: !prev[dIdx] }))
                        }
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        <span>{revealedHints[dIdx] ? 'Hide Hint' : 'Reveal Hint'}</span>
                      </button>

                      <button
                        onClick={() =>
                          setRevealedAnswers((prev) => ({ ...prev, [dIdx]: !prev[dIdx] }))
                        }
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 flex items-center gap-1"
                      >
                        {revealedAnswers[dIdx] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{revealedAnswers[dIdx] ? 'Hide Answer' : 'Reveal Master Answer'}</span>
                      </button>
                    </div>

                    {revealedHints[dIdx] && (
                      <div className="mt-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200 animate-in fade-in">
                        💡 <strong>Hint:</strong> {drill.hint}
                      </div>
                    )}

                    {revealedAnswers[dIdx] && (
                      <div className="mt-2.5 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-200 font-semibold animate-in fade-in">
                        ✅ <strong>Answer:</strong> {drill.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
