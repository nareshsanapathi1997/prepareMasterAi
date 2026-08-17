import React, { useState } from 'react';
import {
  Printer,
  FileCheck2,
  Sparkles,
  Download,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Award,
  Hash,
  BookOpen,
} from 'lucide-react';
import { ExamCategory } from '../types';

interface OMRGeneratorModuleProps {
  activeExam: ExamCategory;
}

export const OMRGeneratorModule: React.FC<OMRGeneratorModuleProps> = ({ activeExam }) => {
  const [totalQuestions, setTotalQuestions] = useState<number>(30);
  const [markingPositive, setMarkingPositive] = useState<number>(3);
  const [markingNegative, setMarkingNegative] = useState<number>(1);
  const [bookletCode, setBookletCode] = useState<string>('SET-A');
  const [candidateRoll, setCandidateRoll] = useState<string>('902418');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [answerKey, setAnswerKey] = useState<Record<number, number>>(() => {
    // Generate a default pseudo key (0: A, 1: B, 2: C, 3: D)
    const key: Record<number, number> = {};
    for (let i = 1; i <= 100; i++) {
      key[i] = (i * 7) % 4;
    }
    return key;
  });
  const [scoreResult, setScoreResult] = useState<{
    correct: number;
    incorrect: number;
    unattempted: number;
    totalScore: number;
    accuracy: number;
  } | null>(null);

  const handleBubbleClick = (qNum: number, optIdx: number) => {
    setAnswers((prev) => {
      if (prev[qNum] === optIdx) {
        const next = { ...prev };
        delete next[qNum];
        return next;
      }
      return { ...prev, [qNum]: optIdx };
    });
    setScoreResult(null);
  };

  const handleEvaluateOMR = () => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    for (let i = 1; i <= totalQuestions; i++) {
      const userChoice = answers[i];
      if (userChoice === undefined) {
        unattempted++;
      } else if (userChoice === answerKey[i]) {
        correct++;
      } else {
        incorrect++;
      }
    }

    const totalScore = correct * markingPositive - incorrect * markingNegative;
    const attempted = correct + incorrect;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    setScoreResult({
      correct,
      incorrect,
      unattempted,
      totalScore,
      accuracy,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setAnswers({});
    setScoreResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Offline Pen-and-Paper Exam Companion</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Printable OMR Sheet & Scanner Grader
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Generate authentic examination bubble answer sheets for UPSC, CAT, NEET, JEE, and GATE. Practice tactile bubble filling, print physical copies, or digitally scan and auto-grade responses.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={handleEvaluateOMR}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Scan & Grade OMR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Evaluation Scorecard if scored */}
      {scoreResult && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-6 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                OMR Optical Evaluation & Marking Report
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              Scheme: +{markingPositive} / -{markingNegative}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Net Score</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{scoreResult.totalScore}</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Correct (+{markingPositive})</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{scoreResult.correct}</span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Incorrect (-{markingNegative})</span>
              <span className="text-xl font-black text-rose-600 dark:text-rose-400">{scoreResult.incorrect}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Unattempted (0)</span>
              <span className="text-xl font-black text-slate-600 dark:text-slate-300">{scoreResult.unattempted}</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Accuracy Rate</span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">{scoreResult.accuracy}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Main OMR Sheet Grid Container (styled for screen and print) */}
      <div className="bg-white text-slate-900 border border-slate-300 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Official Header */}
        <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-600">CONFIDENTIAL / OMR SHEET</span>
            <span className="font-mono text-xs font-bold text-slate-600">BOOKLET: {bookletCode}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
            {activeExam} — OFFICIAL ANSWER SHEET
          </h2>
          <p className="text-xs text-slate-500 font-serif">
            Use Blue/Black Ballpoint Pen only. Darken completely inside the circle. Do not use stray marks.
          </p>
        </div>

        {/* Candidate & Exam Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-slate-300 rounded-2xl p-4 bg-slate-50 text-xs">
          <div>
            <span className="font-bold block text-slate-500">Candidate Roll No:</span>
            <input
              type="text"
              value={candidateRoll}
              onChange={(e) => setCandidateRoll(e.target.value)}
              className="mt-1 font-mono font-bold text-sm bg-white border border-slate-300 rounded px-2 py-1 w-full"
            />
          </div>
          <div>
            <span className="font-bold block text-slate-500">Test Booklet Code:</span>
            <input
              type="text"
              value={bookletCode}
              onChange={(e) => setBookletCode(e.target.value)}
              className="mt-1 font-mono font-bold text-sm bg-white border border-slate-300 rounded px-2 py-1 w-full"
            />
          </div>
          <div>
            <span className="font-bold block text-slate-500">Question Count:</span>
            <select
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              className="mt-1 font-mono font-bold text-sm bg-white border border-slate-300 rounded px-2 py-1 w-full"
            >
              <option value={30}>30 Questions (Mini Mock)</option>
              <option value={50}>50 Questions (Standard Section)</option>
              <option value={100}>100 Questions (Full Paper)</option>
            </select>
          </div>
        </div>

        {/* Bubble Grids in Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {Array.from({ length: Math.ceil(totalQuestions / 10) }).map((_, colIdx) => {
            const startQ = colIdx * 10 + 1;
            const endQ = Math.min(startQ + 9, totalQuestions);

            return (
              <div key={colIdx} className="border border-slate-200 rounded-2xl p-3 bg-white space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 border-b border-slate-100 pb-1 font-mono">
                  <span>Q. NO.</span>
                  <div className="flex space-x-5 mr-1">
                    <span>A</span>
                    <span>B</span>
                    <span>C</span>
                    <span>D</span>
                  </div>
                </div>

                <div className="space-y-1.5 font-mono">
                  {Array.from({ length: endQ - startQ + 1 }).map((_, rIdx) => {
                    const qNum = startQ + rIdx;
                    const selected = answers[qNum];

                    return (
                      <div key={qNum} className="flex items-center justify-between py-0.5">
                        <span className="text-xs font-bold text-slate-700 w-6">
                          {qNum.toString().padStart(2, '0')}
                        </span>
                        <div className="flex space-x-3">
                          {[0, 1, 2, 3].map((optIdx) => {
                            const isFilled = selected === optIdx;
                            const optChar = ['A', 'B', 'C', 'D'][optIdx];

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleBubbleClick(qNum, optIdx)}
                                className={`w-6 h-6 rounded-full border-2 text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                                  isFilled
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-inner'
                                    : 'border-slate-400 text-slate-500 hover:border-slate-700 bg-white'
                                }`}
                                title={`Question ${qNum} Option ${optChar}`}
                              >
                                {isFilled ? '●' : optChar}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer controls */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-500">
            {Object.keys(answers).length} / {totalQuestions} bubbles marked.
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Bubbles</span>
            </button>
            <button
              onClick={handleEvaluateOMR}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
            >
              Evaluate My Answers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
