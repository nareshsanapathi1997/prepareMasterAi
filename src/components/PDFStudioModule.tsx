import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Layers,
  CheckCircle2,
  BookOpen,
  Sliders,
  Share2,
  FileCheck,
  Eye,
  FileDown,
} from 'lucide-react';
import { ExamCategory } from '../types';

interface PDFStudioModuleProps {
  activeExam: string;
  isLoggedIn?: boolean;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export const PDFStudioModule: React.FC<PDFStudioModuleProps> = ({
  activeExam,
  isLoggedIn = false,
  onOpenAuth,
}) => {
  const [paperTitle, setPaperTitle] = useState<string>('CAT 2026 National Full Mock Test Series - Paper 01');
  const [includeSolutions, setIncludeSolutions] = useState<boolean>(true);
  const [includeOMRSheet, setIncludeOMRSheet] = useState<boolean>(true);
  const [watermarkText, setWatermarkText] = useState<string>('PREPMASTER AI - OFFICIAL MOCK');
  const [fontTheme, setFontTheme] = useState<'serif' | 'sans'>('sans');
  const [activePreviewPage, setActivePreviewPage] = useState<number>(1);

  const sampleQuestions = [
    {
      num: 1,
      section: 'Section I: Quantitative Aptitude',
      text: 'A sum of money invested at compound interest doubles itself in 4 years. In how many years will it become 16 times of itself at the same annual interest rate?',
      options: ['(A) 12 years', '(B) 16 years', '(C) 20 years', '(D) 24 years'],
      answer: '(B) 16 years',
      solution:
        'Let initial principal be P. Amount after 4 years = 2P = P(1 + r/100)^4 => (1 + r/100)^4 = 2. To become 16P = 2^4 * P: ( (1 + r/100)^4 )^4 = 2^4 => Time = 4 * 4 = 16 years.',
    },
    {
      num: 2,
      section: 'Section I: Quantitative Aptitude',
      text: 'Find the remainder when 7^84 is divided by 342.',
      options: ['(A) 1', '(B) 7', '(C) 49', '(D) 341'],
      answer: '(A) 1',
      solution:
        'Note that 7^3 = 343 = 342 + 1. Therefore, 7^84 = (7^3)^28 = (342 + 1)^28. Using the binomial expansion, all terms except the last are divisible by 342. Thus remainder is 1^28 = 1.',
    },
    {
      num: 3,
      section: 'Section II: Data Interpretation & Logical Reasoning',
      text: 'In a group of 100 students, 60 like Mathematics, 50 like Physics, and 30 like both. How many students like neither Mathematics nor Physics?',
      options: ['(A) 10', '(B) 20', '(C) 30', '(D) 40'],
      answer: '(B) 20',
      solution:
        'n(M ∪ P) = n(M) + n(P) - n(M ∩ P) = 60 + 50 - 30 = 80 students. Total students = 100. Students liking neither = 100 - 80 = 20.',
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="pdf-studio-module" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              <FileDown className="w-3.5 h-3.5" />
              Print-Ready Examination Publisher
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Full-Length PDF Question Paper & Solution Booklet Studio
            </h1>
            <p className="text-sm text-blue-100 max-w-2xl">
              Compile authentic, beautifully formatted examination test booklets, faculty step-by-step solution manuals, and OMR answer sheets for offline classroom mock tests.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handlePrint}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* Guest Demo vs Unlimited Banner */}
      {!isLoggedIn ? (
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 border border-blue-300/60 dark:border-blue-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
              ⚡
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                PDF Booklet Studio Demo Mode
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Preview sample 2-column examination booklets. Sign in or create a free account to download <strong>High-Resolution Print-Ready PDF Booklets & Answer Keys</strong> without watermarks.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenAuth?.('signup')}
            className="shrink-0 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Unlock Full PDF Generator
          </button>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 px-4 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-bold">
          <span>💎 Unlimited Print-Ready PDF & OMR Compiler Active — High-Resolution Vector Export Enabled</span>
          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-mono">UNLIMITED</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-500" /> Booklet Layout Configuration
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Booklet Title Header</label>
            <input
              type="text"
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Watermark Text</label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSolutions}
                onChange={(e) => setIncludeSolutions(e.target.checked)}
                className="rounded accent-blue-600"
              />
              <span>Include Step-by-Step Faculty Solution Key</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeOMRSheet}
                onChange={(e) => setIncludeOMRSheet(e.target.checked)}
                className="rounded accent-blue-600"
              />
              <span>Attach Printable OMR Bubble Sheet at End</span>
            </label>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Typography Pairing</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => setFontTheme('sans')}
                className={`py-2 rounded-xl border transition-colors ${
                  fontTheme === 'sans'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Modern Clean (Sans)
              </button>
              <button
                onClick={() => setFontTheme('serif')}
                className={`py-2 rounded-xl border transition-colors ${
                  fontTheme === 'serif'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Official UPSC/JEE (Serif)
              </button>
            </div>
          </div>
        </div>

        {/* Live A4 Print Sheet Preview (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" /> A4 Paper Layout Preview
            </h3>
            <span className="text-xs text-slate-400">Page {activePreviewPage} of 2</span>
          </div>

          {/* Paper Canvas */}
          <div
            className={`p-8 sm:p-12 bg-white text-slate-900 rounded-3xl border-2 border-slate-300 shadow-2xl relative overflow-hidden ${
              fontTheme === 'serif' ? 'font-serif' : 'font-sans'
            }`}
          >
            {/* Watermark */}
            {watermarkText && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 rotate-[-30deg] select-none text-4xl sm:text-5xl font-black text-slate-900 uppercase">
                {watermarkText}
              </div>
            )}

            {/* Official Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center space-y-1">
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-600">
                ALL-INDIA NATIONAL MOCK TEST SERIES • {activeExam.toUpperCase()}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {paperTitle}
              </h2>
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 pt-2 border-t border-slate-200 mt-2">
                <span>Time Allowed: 120 Minutes</span>
                <span>Maximum Marks: 300</span>
                <span>Marking: +3 for Correct, -1 for Incorrect</span>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {sampleQuestions.map((q) => (
                <div key={q.num} className="space-y-2 text-xs">
                  <div className="font-bold text-slate-900 leading-relaxed flex gap-2">
                    <span className="shrink-0 font-black">Q.{q.num}</span>
                    <span>{q.text}</span>
                  </div>

                  {/* Options 2x2 Grid */}
                  <div className="grid grid-cols-2 gap-2 pl-6 font-medium text-slate-700">
                    {q.options.map((opt, i) => (
                      <div key={i}>{opt}</div>
                    ))}
                  </div>

                  {/* Faculty Solution Box */}
                  {includeSolutions && (
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] space-y-1 text-slate-800">
                      <div className="font-bold text-blue-700">
                        Faculty Key: {q.answer}
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {q.solution}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* OMR Bubble Preview Box */}
            {includeOMRSheet && (
              <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-300">
                <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-600 mb-3">
                  Detachable OMR Answer Sheet
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="flex items-center gap-2 text-[10px] font-bold">
                      <span>Q{num}:</span>
                      {['A', 'B', 'C', 'D'].map((b) => (
                        <div key={b} className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center text-[9px]">
                          {b}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
