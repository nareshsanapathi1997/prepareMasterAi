import React, { useState } from 'react';
import {
  BookMarked,
  AlertOctagon,
  CheckCircle2,
  Trash2,
  Sparkles,
  Zap,
  Filter,
  BrainCircuit,
  TrendingDown,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { TaggedError, ErrorMistakeType } from '../types';
import { storage } from '../lib/storage';

interface ErrorTaxonomyNotebookProps {
  activeExam: string;
  onNavigateToAdaptive?: () => void;
}

export const ErrorTaxonomyNotebook: React.FC<ErrorTaxonomyNotebookProps> = ({
  activeExam,
  onNavigateToAdaptive,
}) => {
  const [errors, setErrors] = useState<TaggedError[]>(() => storage.getTaggedErrors());
  const [filterTag, setFilterTag] = useState<string>('All');
  const [filterResolved, setFilterResolved] = useState<'All' | 'Unresolved' | 'Resolved'>('Unresolved');

  const filteredErrors = errors.filter((err) => {
    if (err.examName && err.examName !== activeExam && filterTag === 'All') {
      // allow showing across exams or current exam
    }
    if (filterTag !== 'All' && err.errorTag !== filterTag) return false;
    if (filterResolved === 'Unresolved' && err.resolved) return false;
    if (filterResolved === 'Resolved' && !err.resolved) return false;
    return true;
  });

  const handleToggleResolve = (id: string, current: boolean) => {
    storage.resolveTaggedError(id, !current);
    setErrors(storage.getTaggedErrors());
  };

  const handleDelete = (id: string) => {
    storage.deleteTaggedError(id);
    setErrors(storage.getTaggedErrors());
  };

  // Compute breakdown stats
  const totalErrors = errors.length;
  const tagCounts: Record<string, number> = {
    'Concept Gap': 0,
    'Silly Mistake': 0,
    'Timing Pressure': 0,
    'Examiner Trap': 0,
    'Formula Slip': 0,
    'Misread Question': 0,
  };

  errors.forEach((e) => {
    if (tagCounts[e.errorTag] !== undefined) {
      tagCounts[e.errorTag]++;
    }
  });

  const unresolvedCount = errors.filter((e) => !e.resolved).length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-rose-500/20">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-rose-500/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-rose-300">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>Root-Cause Mistake Taxonomy</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Error Diagnostic Notebook
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Distinguish <strong className="text-rose-300">Concept Gaps</strong> from <strong className="text-amber-300">Examiner Traps</strong> and <strong className="text-blue-300">Timing Pressure</strong>. True rank improvement happens when you stop repeating the same mistake archetype.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
            <div className="text-xs text-slate-300 font-semibold uppercase">Pending Errors</div>
            <div className="text-2xl font-black text-rose-400">{unresolvedCount}</div>
          </div>
        </div>
      </div>

      {/* Mistake Taxonomy Distribution Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { tag: 'Concept Gap', desc: 'Core theory missing', color: 'border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300' },
          { tag: 'Silly Mistake', desc: 'Calculation or sign error', color: 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300' },
          { tag: 'Timing Pressure', desc: 'Rushed under 20s', color: 'border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300' },
          { tag: 'Examiner Trap', desc: 'Distractor option fell into', color: 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300' },
          { tag: 'Formula Slip', desc: 'Forgot key identity', color: 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' },
          { tag: 'Misread Question', desc: 'Missed "NOT" / "EXCEPT"', color: 'border-cyan-300 dark:border-cyan-800 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-300' },
        ].map((item) => {
          const count = tagCounts[item.tag] || 0;
          const isSelected = filterTag === item.tag;

          return (
            <button
              key={item.tag}
              onClick={() => setFilterTag(isSelected ? 'All' : item.tag)}
              className={`p-4 rounded-2xl border text-left transition-all ${item.color} ${
                isSelected ? 'ring-2 ring-rose-500 scale-105 shadow-md' : 'hover:scale-102'
              }`}
            >
              <div className="text-xl font-black">{count}</div>
              <div className="text-xs font-bold mt-1 truncate">{item.tag}</div>
              <div className="text-[11px] opacity-75 mt-0.5">{item.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter:</span>

          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="All">All Mistake Types</option>
            <option value="Concept Gap">Concept Gap</option>
            <option value="Silly Mistake">Silly Mistake</option>
            <option value="Timing Pressure">Timing Pressure</option>
            <option value="Examiner Trap">Examiner Trap</option>
            <option value="Formula Slip">Formula Slip</option>
            <option value="Misread Question">Misread Question</option>
          </select>

          <select
            value={filterResolved}
            onChange={(e) => setFilterResolved(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="Unresolved">Pending Recovery ({unresolvedCount})</option>
            <option value="Resolved">Resolved ({totalErrors - unresolvedCount})</option>
            <option value="All">All ({totalErrors})</option>
          </select>
        </div>

        {onNavigateToAdaptive && (
          <button
            onClick={onNavigateToAdaptive}
            className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Weak-Area Adaptive Drill</span>
          </button>
        )}
      </div>

      {/* Errors List */}
      {filteredErrors.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No Errors in this Filter!
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Whenever you get a question wrong during Mock Tests or Adaptive Practice, tag it with its root cause to review here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredErrors.map((err) => {
            const correctOpt = err.options[err.correctOptionIndex] || 'Correct Option';
            const userOpt = err.options[err.userAnswerIndex] || 'Unattempted';

            return (
              <div
                key={err.id}
                className={`p-6 rounded-3xl border transition-all ${
                  err.resolved
                    ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-lg uppercase">
                        {err.errorTag}
                      </span>
                      <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-lg">
                        {err.topicTag}
                      </span>
                      {err.examName && (
                        <span className="text-xs font-medium text-slate-400">
                          {err.examName}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {err.questionText}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleResolve(err.id, err.resolved)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        err.resolved
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{err.resolved ? 'Resolved' : 'Mark Resolved'}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(err.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Choices comparison */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 rounded-xl text-xs">
                    <span className="font-bold text-rose-700 dark:text-rose-300 block mb-1">
                      Your Selected Answer (Mistake):
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">{userOpt}</span>
                  </div>

                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-1">
                      Correct Key & Solution:
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">{correctOpt}</span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="font-bold text-slate-900 dark:text-white block mb-1">
                    Faculty Solution & De-trapping Insight:
                  </strong>
                  {err.explanation}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
