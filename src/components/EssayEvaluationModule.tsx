import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Copy,
  Check,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Sliders,
  Flame,
  HelpCircle,
} from 'lucide-react';
import { evaluateEssayAPI } from '../lib/api';
import { EssayEvaluationResult } from '../types';

interface Props {
  activeExam: string;
}

const SAMPLE_PROMPTS_BY_EXAM: Record<string, Array<{ title: string; prompt: string; wordLimit: string; standard: string }>> = {
  'UPSC Civil Services': [
    {
      title: 'GS-2: Cooperative Federalism & Interstate River Disputes',
      prompt: 'Examine the constitutional mechanisms available in India for resolving inter-State water disputes. To what extent has the Inter-State River Water Disputes Act, 1956 succeeded in achieving timely and definitive adjudication?',
      wordLimit: '250 words (15 Marks)',
      standard: 'UPSC Mains GS Standard (15 Marks)',
    },
    {
      title: 'GS-3: Renewable Energy Transition vs Baseload Stability',
      prompt: 'India aims to achieve 500 GW of non-fossil energy capacity by 2030. Critically analyze the structural challenges in grid stability, energy storage, and discom financials in transitioning away from thermal baseload power.',
      wordLimit: '250 words (15 Marks)',
      standard: 'UPSC Mains GS Standard (15 Marks)',
    },
    {
      title: 'Mains Essay: Ethics & Technological Acceleration',
      prompt: '“Technology is a useful servant but a dangerous master.” Discuss the ethical dilemmas posed by autonomous artificial intelligence and algorithmic governance in modern democracies.',
      wordLimit: '1000-1200 words (125 Marks)',
      standard: 'UPSC Essay Paper Standard',
    },
  ],
  'CAT & MBA Entrances': [
    {
      title: 'IIM WAT: AI Impact on White-Collar Employment',
      prompt: 'Generative AI is projected to automate cognitive tasks faster than physical labor. Will this lead to structural mass unemployment or unleash a wave of unprecedented entrepreneurial productivity? Take a nuanced stance.',
      wordLimit: '300-400 words (15-20 Minutes WAT)',
      standard: 'IIM Ahmedabad / Bangalore WAT Rubric',
    },
    {
      title: 'IIM WAT: ESG vs Shareholder Primacy in Emerging Markets',
      prompt: 'Should corporate boards in developing economies prioritize aggressive profit maximization and capital expansion over stringent ESG (Environmental, Social, and Governance) compliances?',
      wordLimit: '300 words',
      standard: 'IIM WAT Standard',
    },
  ],
  'GRE & GMAT (Global Grad)': [
    {
      title: 'GRE Issue Task: National Funding for Arts vs Basic Needs',
      prompt: '“Governments should offer a college education only to students who pursue fields of study in which there are clear economic returns and high labor market demand.” Discuss the extent to which you agree or disagree.',
      wordLimit: '400-500 words (30 Minutes)',
      standard: 'GRE Analytical Writing (Scale 0.0 - 6.0)',
    },
  ],
  'CLAT & Law Entrances': [
    {
      title: 'Constitutional Law: Right to Privacy & Digital Surveillance',
      prompt: 'In light of K.S. Puttaswamy v. Union of India (2017), analyze the proportionality test applied to state surveillance mechanisms and statutory exemptions in data protection laws.',
      wordLimit: '350 words',
      standard: 'National Law Universities (NLU) Rubric',
    },
  ],
};

const DEFAULT_PROMPTS = [
  {
    title: 'Critical Thinking & Analytical Argument',
    prompt: 'Critically analyze how digital transformation has reshaped traditional education and whether hybrid learning models can democratize quality higher education.',
    wordLimit: '300-500 words',
    standard: 'Standard Academic Descriptive Scale (100 Points)',
  },
];

export const EssayEvaluationModule: React.FC<Props> = ({ activeExam }) => {
  const availablePrompts = SAMPLE_PROMPTS_BY_EXAM[activeExam] || DEFAULT_PROMPTS;

  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number>(0);
  const [isCustomPrompt, setIsCustomPrompt] = useState<boolean>(false);
  const [customPromptText, setCustomPromptText] = useState<string>('');
  const [studentAnswer, setStudentAnswer] = useState<string>('');
  const [markingStandard, setMarkingStandard] = useState<string>(
    availablePrompts[0]?.standard || 'Standard Rubric'
  );
  const [wordLimit, setWordLimit] = useState<string>(
    availablePrompts[0]?.wordLimit || '250 words'
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EssayEvaluationResult | null>(null);
  const [copiedRewrite, setCopiedRewrite] = useState<boolean>(false);

  const currentPromptText = isCustomPrompt
    ? customPromptText
    : availablePrompts[selectedPromptIndex]?.prompt || '';

  const wordCount = studentAnswer.trim() ? studentAnswer.trim().split(/\s+/).length : 0;
  const charCount = studentAnswer.length;

  const handleSelectPreset = (index: number) => {
    setSelectedPromptIndex(index);
    setIsCustomPrompt(false);
    setMarkingStandard(availablePrompts[index].standard);
    setWordLimit(availablePrompts[index].wordLimit);
  };

  const handleEvaluate = async () => {
    if (!currentPromptText.trim()) {
      setError('Please select or specify an essay/question prompt.');
      return;
    }
    if (!studentAnswer.trim() || wordCount < 30) {
      setError('Please write or paste an answer of at least 30 words for evaluation.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await evaluateEssayAPI({
        examName: activeExam,
        essayPrompt: currentPromptText,
        studentAnswer: studentAnswer.trim(),
        wordLimit,
        markingStandard,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyRewriteToClipboard = () => {
    if (!result?.modelAnswerRewrite) return;
    navigator.clipboard.writeText(result.modelAnswerRewrite);
    setCopiedRewrite(true);
    setTimeout(() => setCopiedRewrite(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-900 to-indigo-900 text-white p-6 rounded-3xl shadow-xl border border-violet-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-violet-200 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>AI Descriptive & Essay Evaluator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Mains, Essay & WAT Grading Studio
            </h1>
            <p className="text-violet-200 text-sm mt-1 max-w-2xl">
              Get examiner-grade rubric evaluations, missing keywords, argument depth diagnostics, and an AI top-1% model rewrite for {activeExam}.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 bg-violet-800/80 border border-violet-600 rounded-xl text-xs font-mono font-bold text-violet-200">
              Exam: {activeExam}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Pane: Prompt Selection + Editor (Col 1-7) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Prompt Selector */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-500" />
                <span>1. Select or Enter Question / Essay Prompt</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsCustomPrompt(!isCustomPrompt)}
                className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-semibold"
              >
                {isCustomPrompt ? 'Use Preset Prompts' : 'Custom Prompt'}
              </button>
            </div>

            {!isCustomPrompt ? (
              <div className="space-y-2">
                {availablePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      selectedPromptIndex === idx
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 ring-2 ring-violet-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                      <span>{p.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">{p.wordLimit}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-slate-600 dark:text-slate-400 text-[11px]">
                      {p.prompt}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Paste Custom Question or Essay Topic
                </label>
                <textarea
                  value={customPromptText}
                  onChange={(e) => setCustomPromptText(e.target.value)}
                  placeholder="e.g. Critically examine the impact of foreign direct investment in the retail sector on domestic supply chains..."
                  rows={3}
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>
            )}

            {/* Target Settings */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Marking Standard
                </label>
                <input
                  type="text"
                  value={markingStandard}
                  onChange={(e) => setMarkingStandard(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Target Word Limit
                </label>
                <input
                  type="text"
                  value={wordLimit}
                  onChange={(e) => setWordLimit(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Student Answer Writing Canvas */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>2. Your Written Answer / Essay</span>
              </h2>
              <div className="flex items-center space-x-3 text-xs font-mono">
                <span className="text-slate-500">
                  Words: <strong className="text-indigo-600 dark:text-indigo-400">{wordCount}</strong>
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-500">Chars: {charCount}</span>
              </div>
            </div>

            <textarea
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Write or paste your introduction, main arguments, case evidence, and conclusion here..."
              rows={12}
              className="w-full p-4 text-sm font-serif leading-relaxed bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none"
            />

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setStudentAnswer('')}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Clear Canvas
              </button>
              <button
                type="button"
                onClick={handleEvaluate}
                disabled={loading || wordCount < 30}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 flex items-center space-x-2 transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Grading with Examiner Rubric...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Evaluate & Grade Answer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Pane: Score Card + Rubric Breakdown + Model Rewrite (Col 8-12) */}
        <div className="lg:col-span-5 space-y-5">
          {result ? (
            <div className="space-y-5">
              {/* Overall Score Card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Examiner Scorecard
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 rounded-lg text-xs font-bold">
                    {result.readinessBand}
                  </span>
                </div>

                <div className="flex items-baseline space-x-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-3xl font-extrabold text-violet-600 dark:text-violet-400">
                    {result.overallScore}
                  </div>
                  <div className="text-xs text-slate-500 font-semibold">
                    / {result.maxPossibleScore} ({result.gradePercentage}%)
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/50 dark:border-amber-900/50">
                  "{result.summaryVerdict}"
                </p>
              </div>

              {/* Rubric Criteria Breakdown */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Rubric Dimension Breakdown
                </h3>
                <div className="space-y-3">
                  {result.criteriaBreakdown.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-800 dark:text-slate-200">{item.criterion}</span>
                        <span className="font-mono text-violet-600 dark:text-violet-400">
                          {item.scoreAwarded}/{item.maxScore}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-violet-600 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(item.scoreAwarded / item.maxScore) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.critique}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing High-Yield Terms / Evidence */}
              {result.keyTermsAndEvidenceMissing?.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <h3 className="font-bold text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Missing High-Yield Facts / Keywords</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keyTermsAndEvidenceMissing.map((term, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-semibold"
                      >
                        + {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Grammar & Flow Diagnostics */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Style & Flow Review
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Vocabulary</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {result.grammarAndToneReview.vocabularyRating}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Transitions</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {result.grammarAndToneReview.flowAndTransitions}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  {result.grammarAndToneReview.actionableSuggestions.map((sug, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <span className="text-violet-500 font-bold">•</span>
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Exemplar 99th-Percentile Benchmark Rewrite */}
              <div className="bg-gradient-to-br from-indigo-950 to-slate-950 p-5 rounded-2xl border border-indigo-800/60 text-white shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-bold text-sm text-indigo-100">
                      AI Exemplar Benchmark Rewrite
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={copyRewriteToClipboard}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
                  >
                    {copiedRewrite ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-[10px] text-slate-300">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-indigo-300 leading-relaxed font-serif whitespace-pre-line bg-black/40 p-4 rounded-xl border border-white/5 max-h-72 overflow-y-auto">
                  {result.modelAnswerRewrite}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[380px] bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Evaluation Output Standby
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Select a topic prompt and submit your essay draft on the left. The AI examiner will grade your answer across standard parameters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
