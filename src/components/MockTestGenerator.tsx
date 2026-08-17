import React, { useState } from 'react';
import { Sparkles, Loader2, BookOpen, Layers, Sliders, AlertCircle } from 'lucide-react';
import { generateMockTestAPI } from '../lib/api';
import { MockTest } from '../types';
import { EXAM_PRESETS } from '../data/presets';

interface MockTestGeneratorProps {
  activeExam: string;
  onTestGenerated: (test: MockTest) => void;
  onCancel: () => void;
}

export const MockTestGenerator: React.FC<MockTestGeneratorProps> = ({
  activeExam,
  onTestGenerated,
  onCancel,
}) => {
  const currentPreset = EXAM_PRESETS.find((p) => p.name === activeExam);

  const [subject, setSubject] = useState(
    currentPreset?.defaultSubjects[0] || 'Core Subject / General Studies'
  );
  const [topic, setTopic] = useState(
    currentPreset?.sampleTopics[0] || 'Comprehensive Syllabus'
  );
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Exam-Standard'>('Exam-Standard');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [questionType, setQuestionType] = useState('MCQ Single Correct');
  const [customInstructions, setCustomInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const generated = await generateMockTestAPI({
        examName: activeExam,
        subject,
        topic,
        numQuestions: questionCount,
        difficulty,
        questionType,
        customInstructions,
      });

      onTestGenerated(generated);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate mock test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              AI Mock Test Architect
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate customized, exam-standard practice tests calibrated for <span className="font-semibold text-slate-800 dark:text-slate-200">{activeExam}</span>.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Generation Notice</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Subject / Module */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Subject / Area
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Indian Polity / Mechanics / Data Structures"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {currentPreset && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentPreset.defaultSubjects.slice(0, 4).map((sub) => (
                  <button
                    type="button"
                    key={sub}
                    onClick={() => setSubject(sub)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Topic / Specific Chapter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Topic / Chapter / Concept Focus
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Fundamental Rights / Rotational Dynamics"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {currentPreset && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentPreset.sampleTopics.slice(0, 3).map((top) => (
                  <button
                    type="button"
                    key={top}
                    onClick={() => setTopic(top)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {top}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Configuration Row: Questions, Difficulty, Format */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Question Count */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Number of Questions
            </label>
            <div className="flex items-center space-x-2">
              {[5, 10, 15, 20].map((count) => (
                <button
                  type="button"
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    questionCount === count
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {count} Qs
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Difficulty Tier
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Easy">Easy (Foundational)</option>
              <option value="Medium">Medium (Moderate Practice)</option>
              <option value="Hard">Hard (Challenging / Tricky)</option>
              <option value="Exam-Standard">Exam-Standard (Actual Pattern)</option>
            </select>
          </div>

          {/* Question Format */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Question Style
            </label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="MCQ Single Correct">Standard 4-Option MCQ</option>
              <option value="Assertion and Reason">Statement & Assertion-Reason</option>
              <option value="Case Study / Scenario">Case Scenario / Application Based</option>
              <option value="Previous Year Trend Style">High-Probability PYQ Format</option>
            </select>
          </div>
        </div>

        {/* Custom Instructions */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Special Focus / Custom Instructions (Optional)
          </label>
          <input
            type="text"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="e.g. Include numerical calculations, emphasize 2024-2025 exam trends, tricky elimination options"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="generate-test-submit-btn"
            disabled={loading || !topic.trim()}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Exam Paper...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate AI Mock Test</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
