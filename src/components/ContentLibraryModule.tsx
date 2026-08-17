import React, { useState } from 'react';
import {
  Library,
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Filter,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { VerifiedPYQItem } from '../types';
import { VERIFIED_PYQS } from '../data/presets';

interface ContentLibraryModuleProps {
  activeExam: string;
}

export const ContentLibraryModule: React.FC<ContentLibraryModuleProps> = ({ activeExam }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter items
  const pyqs = VERIFIED_PYQS.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText =
        item.questionText.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q);
      if (!matchText) return false;
    }
    if (selectedYear !== 'All' && String(item.year) !== selectedYear) return false;
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-sky-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-cyan-500/20">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-cyan-500/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-cyan-300">
            <Library className="w-3.5 h-3.5 text-cyan-400" />
            <span>Verified PYQ & High-Yield Vault</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Faculty-Verified PYQ Question Bank
          </h2>
          <p className="text-cyan-200 text-sm leading-relaxed">
            Authentic previous year exam questions with verified faculty step-by-step proofs, speed shortcuts, and examiner trap warnings.
          </p>
        </div>

        <div className="px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
          <div className="text-xs text-cyan-300 font-semibold uppercase">Questions Loaded</div>
          <div className="text-2xl font-black text-cyan-300">{VERIFIED_PYQS.length}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by topic, formula, or concept..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="All">All Exam Years</option>
            <option value="2024">2024 Papers</option>
            <option value="2023">2023 Papers</option>
            <option value="2022">2022 Papers</option>
          </select>
        </div>
      </div>

      {/* PYQ List */}
      <div className="space-y-4">
        {pyqs.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 transition-all"
            >
              {/* Header tags */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 rounded-lg text-xs font-bold uppercase">
                      {item.examName} ({item.year})
                    </span>
                    <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium">
                      {item.sessionOrPaper}
                    </span>
                    <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium">
                      {item.topic}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {item.questionText}
                  </h3>
                </div>

                <button
                  onClick={() => toggleExpand(item.id)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center space-x-1.5 flex-shrink-0"
                >
                  <span>{isExpanded ? 'Hide Solution' : 'View Verified Solution'}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {item.options.map((opt, optIdx) => {
                  const isCorrect = isExpanded && optIdx === item.correctOptionIndex;

                  return (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-xl border text-xs font-medium flex items-center space-x-2 ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-bold'
                          : 'border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Expanded Solution & Shortcuts */}
              {isExpanded && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  {/* Faculty Solution */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verified Faculty Key & Step-by-Step Proof:</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {item.facultyVerifiedExplanation}
                    </p>
                  </div>

                  {/* 15-Sec Shortcut */}
                  {item.shortcutMethod && (
                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl space-y-1">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>Faculty Shortcut / Exam-Day Trick:</span>
                      </div>
                      <p className="text-xs text-amber-950 dark:text-amber-100 font-medium">
                        {item.shortcutMethod}
                      </p>
                    </div>
                  )}

                  {/* Trap Warning */}
                  {item.trapWarning && (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-1">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Examiner Trap Warning (Where Aspirants Lose Marks):</span>
                      </div>
                      <p className="text-xs text-rose-950 dark:text-rose-100 font-medium">
                        {item.trapWarning}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
