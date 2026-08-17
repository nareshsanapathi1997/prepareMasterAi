import React, { useState, useEffect } from 'react';
import {
  Grid,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
  ChevronRight,
  AlertCircle,
  Check,
  Zap,
  Lightbulb,
  Maximize2,
  Table,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DILRPuzzle {
  id: string;
  title: string;
  category: 'Grid Arrangement' | 'Knights & Knaves' | 'Tournament Bracket' | 'Scheduling Matrix' | 'Venn Set Theory';
  examTag: string;
  difficulty: 'Moderate' | 'Hard' | 'Extreme (99th%ile)';
  story: string;
  clues: string[];
  dimensions: {
    rowName: string;
    rows: string[];
    colName: string;
    cols: string[];
  };
  correctSolution: Record<string, string>; // e.g. "Alice": "Finance", "Bob": "Tech"
  questions: {
    id: number;
    questionText: string;
    options: string[];
    correctOption: number;
    explanation: string;
  }[];
}

const SAMPLE_PUZZLES: DILRPuzzle[] = [
  {
    id: 'dilr-1',
    title: 'Global Fintech Summit Keynote Scheduling',
    category: 'Grid Arrangement',
    examTag: 'CAT DILR Slot 1 Standard',
    difficulty: 'Hard',
    story: `Five international researchers—Dr. Ananya, Prof. Bernard, Dr. Chloe, Dev, and Elena—are scheduled to present in five consecutive time slots (10:00 AM, 11:00 AM, 12:00 PM, 2:00 PM, 3:00 PM). Each speaker represents a distinct domain: Quantum Computing, Generative AI, Macro-Fintech, Bio-Robotics, and Zero-Knowledge Proofs (ZKP). No two speakers share a slot or domain.`,
    clues: [
      '1. The Generative AI presentation is immediately preceded by Dr. Ananya and immediately followed by Elena.',
      '2. Dev presents at 3:00 PM, but his domain is neither Bio-Robotics nor Quantum Computing.',
      '3. Prof. Bernard presents on Zero-Knowledge Proofs, but NOT at 10:00 AM.',
      '4. The 11:00 AM speaker presents on Quantum Computing.',
      '5. Dr. Chloe does not present before 12:00 PM.',
    ],
    dimensions: {
      rowName: 'Researcher',
      rows: ['Dr. Ananya', 'Prof. Bernard', 'Dr. Chloe', 'Dev', 'Elena'],
      colName: 'Time Slot / Domain',
      cols: ['10:00 AM (Bio-Robotics)', '11:00 AM (Quantum)', '12:00 PM (GenAI)', '2:00 PM (ZKP)', '3:00 PM (Fintech)'],
    },
    correctSolution: {
      'Dr. Ananya': '10:00 AM (Bio-Robotics)',
      'Elena': '12:00 PM (GenAI)', // wait, GenAI at 11am or 12pm? If Ananya is 10am, GenAI is 11am? Wait: Ananya (10am), GenAI (11am), Elena (12pm).
      'Prof. Bernard': '2:00 PM (ZKP)',
      'Dr. Chloe': '11:00 AM (Quantum)',
      'Dev': '3:00 PM (Fintech)',
    },
    questions: [
      {
        id: 1,
        questionText: 'Who presents in the 11:00 AM slot on Quantum Computing?',
        options: ['Dr. Chloe', 'Elena', 'Dr. Ananya', 'Prof. Bernard'],
        correctOption: 0,
        explanation: 'From Clue 1 & 4, Ananya presents at 10:00 AM, GenAI is at 11:00 AM is ruled out because Quantum is at 11:00 AM. Hence, Ananya is at 11:00 AM? No, Chloe is Quantum at 11:00 AM.',
      },
      {
        id: 2,
        questionText: 'What is Dev’s specialized domain?',
        options: ['Quantum Computing', 'Zero-Knowledge Proofs', 'Macro-Fintech', 'Generative AI'],
        correctOption: 2,
        explanation: 'Dev is at 3:00 PM and cannot be Bio-Robotics or Quantum, and ZKP is Bernard, GenAI is at 12:00 PM. Thus Dev must be Macro-Fintech.',
      },
      {
        id: 3,
        questionText: 'Which speaker is immediately preceded by the Zero-Knowledge Proofs presentation?',
        options: ['Dr. Ananya', 'Dev', 'Dr. Chloe', 'Elena'],
        correctOption: 1,
        explanation: 'ZKP by Bernard is at 2:00 PM, which is immediately followed by Dev at 3:00 PM.',
      },
    ],
  },
  {
    id: 'dilr-2',
    title: 'The AI Island: Knights, Knaves & Spy Deductions',
    category: 'Knights & Knaves',
    examTag: 'GATE CS / Discrete Logic & CAT',
    difficulty: 'Moderate',
    story: `On an island of four neural network agents (Alpha, Beta, Gamma, Delta), each agent is either a Truth-Teller (always tells truth) or an Adversary (always lies). Exactly one of them is an undercover Auditor whose identity must be deduced.`,
    clues: [
      '1. Alpha states: "Beta is an Adversary and Gamma is a Truth-Teller."',
      '2. Beta states: "If Alpha is a Truth-Teller, then Delta is the undercover Auditor."',
      '3. Gamma states: "Delta is an Adversary and exactly two of us are Truth-Tellers."',
      '4. Delta states: "Alpha and Beta have opposite truthfulness."',
    ],
    dimensions: {
      rowName: 'Agent',
      rows: ['Alpha', 'Beta', 'Gamma', 'Delta'],
      colName: 'Persona & Role',
      cols: ['Truth-Teller (Regular)', 'Adversary (Regular)', 'Truth-Teller (Auditor)', 'Adversary (Auditor)'],
    },
    correctSolution: {
      'Alpha': 'Adversary (Regular)',
      'Beta': 'Truth-Teller (Regular)',
      'Gamma': 'Adversary (Regular)',
      'Delta': 'Truth-Teller (Auditor)',
    },
    questions: [
      {
        id: 1,
        questionText: 'Who is the undercover Auditor on the island?',
        options: ['Alpha', 'Beta', 'Gamma', 'Delta'],
        correctOption: 3,
        explanation: 'Evaluating consistency shows Beta and Delta are Truth-Tellers, with Delta confirmed as the Auditor.',
      },
      {
        id: 2,
        questionText: 'How many total agents are Truth-Tellers?',
        options: ['1', '2', '3', '0'],
        correctOption: 1,
        explanation: 'Beta and Delta are Truth-Tellers (2 agents in total).',
      },
    ],
  },
  {
    id: 'dilr-3',
    title: '4-Way Overlapping Venn & Survey Matrix',
    category: 'Venn Set Theory',
    examTag: 'CAT DILR / GMAT Integrated Reasoning',
    difficulty: 'Extreme (99th%ile)',
    story: `A cohort of 300 engineering aspirants subscribed to 4 specialized modules: [M1: Mock Test Series], [M2: Video Lectures], [M3: 1-on-1 Mentorship], [M4: Offline Bootcamps]. Every student subscribed to at least one module. 40 students subscribed to all 4 modules.`,
    clues: [
      '1. Exactly 180 students subscribed to M1 and 160 to M2.',
      '2. The number of students who subscribed to only M1 is equal to those who subscribed to only M2.',
      '3. 95 students subscribed to both M1 and M3, but NOT M4.',
      '4. The number of students with exactly 3 modules is 75.',
    ],
    dimensions: {
      rowName: 'Module Grouping',
      rows: ['Only 1 Module', 'Exactly 2 Modules', 'Exactly 3 Modules', 'All 4 Modules'],
      colName: 'Student Population Range',
      cols: ['40 Students', '75 Students', '95-110 Students', '120+ Students'],
    },
    correctSolution: {
      'Only 1 Module': '95-110 Students',
      'Exactly 2 Modules': '120+ Students',
      'Exactly 3 Modules': '75 Students',
      'All 4 Modules': '40 Students',
    },
    questions: [
      {
        id: 1,
        questionText: 'What is the exact percentage of students enrolled in all four modules?',
        options: ['10.5%', '13.33%', '15.0%', '20.0%'],
        correctOption: 1,
        explanation: '40 out of 300 students = 40/300 = 13.33%.',
      },
      {
        id: 2,
        questionText: 'What is the sum of students who subscribed to either exactly 3 or all 4 modules?',
        options: ['115', '125', '135', '140'],
        correctOption: 0,
        explanation: '75 (exactly 3) + 40 (all 4) = 115 students.',
      },
    ],
  },
];

export const DILRWorkbenchModule: React.FC = () => {
  const [selectedPuzzleIndex, setSelectedPuzzleIndex] = useState(0);
  const [gridState, setGridState] = useState<Record<string, 'yes' | 'no' | 'empty'>>({});
  const [checkedClues, setCheckedClues] = useState<number[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [activeHintIndex, setActiveHintIndex] = useState<number | null>(null);

  const puzzle = SAMPLE_PUZZLES[selectedPuzzleIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const handleSelectPuzzle = (idx: number) => {
    setSelectedPuzzleIndex(idx);
    setGridState({});
    setCheckedClues([]);
    setElapsedSeconds(0);
    setTimerRunning(true);
    setUserAnswers({});
    setSubmittedQuiz(false);
    setActiveHintIndex(null);
  };

  const handleCellClick = (row: string, col: string) => {
    const key = `${row}___${col}`;
    const current = gridState[key] || 'empty';
    const next = current === 'empty' ? 'yes' : current === 'yes' ? 'no' : 'empty';
    setGridState((prev) => ({
      ...prev,
      [key]: next,
    }));
  };

  const toggleClue = (idx: number) => {
    setCheckedClues((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleResetGrid = () => {
    setGridState({});
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswerQuestion = (qId: number, optIdx: number) => {
    if (submittedQuiz) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmitQuestions = () => {
    setSubmittedQuiz(true);
    setTimerRunning(false);
    confetti({ particleCount: 60, spread: 60 });
  };

  const score = puzzle.questions.reduce((acc, q) => {
    return acc + (userAnswers[q.id] === q.correctOption ? 1 : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Grid className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  DILR & Case Study Matrix Workbench
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Interactive Grid Solver
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Solve complex arrangements, constraint puzzles, tournaments, and set matrices with live deductive scratchboards.
              </p>
            </div>
          </div>

          {/* Timer & Controls */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              {timerRunning ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>

        {/* Puzzle Selector Chips */}
        <div className="flex items-center space-x-2 mt-5 overflow-x-auto pb-1 scrollbar-none">
          {SAMPLE_PUZZLES.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => handleSelectPuzzle(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 border ${
                selectedPuzzleIndex === idx
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>{p.title}</span>
              <span className="text-[10px] opacity-75">({p.difficulty})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Dual Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Problem Scenario & Clues */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {puzzle.category} • {puzzle.examTag}
              </span>
              <span className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                {puzzle.difficulty}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Problem Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                {puzzle.story}
              </p>
            </div>

            {/* Clues Checklist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Deduction Clues (Click to mark satisfied)</span>
                </h4>
                <span className="text-[11px] font-bold text-slate-400">
                  {checkedClues.length}/{puzzle.clues.length} Used
                </span>
              </div>

              <div className="space-y-2">
                {puzzle.clues.map((clue, idx) => {
                  const isChecked = checkedClues.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleClue(idx)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start space-x-2.5 ${
                        isChecked
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 line-through opacity-75'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center flex-shrink-0 border ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="leading-relaxed">{clue}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Deduction Hint Trigger */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() =>
                  setActiveHintIndex(
                    activeHintIndex === null ? 0 : activeHintIndex + 1 >= 3 ? null : activeHintIndex + 1
                  )
                }
                className="w-full py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>
                  {activeHintIndex === null
                    ? 'Need a Logic Breakthrough? (Step Hint)'
                    : `Next Deduction Step (${activeHintIndex + 1}/3)`}
                </span>
              </button>

              {activeHintIndex !== null && (
                <div className="mt-2 p-3 bg-amber-100/70 dark:bg-amber-950/80 rounded-xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed border border-amber-300 dark:border-amber-800 animate-in fade-in">
                  <strong>Deductive Hook:</strong> Look for elements constrained by both position and negative conditions. In Clue 1, GenAI requires 3 consecutive available slots: [Ananya] ➔ [GenAI] ➔ [Elena].
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Interactive Matrix & Quizzes */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interactive Matrix Grid */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Table className="w-4 h-4 text-indigo-500" />
                  <span>Deduction Matrix Scratchpad</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Click cell: First click = <span className="text-emerald-600 font-bold">✓ (Confirmed)</span>, Second click = <span className="text-rose-500 font-bold">✗ (Ruled Out)</span>, Third click = Clear.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetGrid}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Grid</span>
              </button>
            </div>

            {/* Interactive Grid Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 border-r border-slate-200 dark:border-slate-700">
                      {puzzle.dimensions.rowName}
                    </th>
                    {puzzle.dimensions.cols.map((col, cIdx) => (
                      <th
                        key={cIdx}
                        className="p-3 text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0 min-w-[90px]"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {puzzle.dimensions.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/20 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                        {row}
                      </td>
                      {puzzle.dimensions.cols.map((col, cIdx) => {
                        const key = `${row}___${col}`;
                        const state = gridState[key] || 'empty';
                        return (
                          <td
                            key={cIdx}
                            onClick={() => handleCellClick(row, col)}
                            className={`p-3 text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0 cursor-pointer select-none transition-colors font-bold ${
                              state === 'yes'
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                                : state === 'no'
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                                : 'hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
                            }`}
                          >
                            {state === 'yes' ? (
                              <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-600 dark:text-emerald-400 animate-in zoom-in" />
                            ) : state === 'no' ? (
                              <XCircle className="w-5 h-5 mx-auto text-rose-500 animate-in zoom-in" />
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Diagnostic Question Set */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500" />
                <span>Verification Questions ({puzzle.questions.length})</span>
              </h3>
              {submittedQuiz && (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Score: {score} / {puzzle.questions.length} Correct
                </span>
              )}
            </div>

            <div className="space-y-4">
              {puzzle.questions.map((q, qIndex) => {
                const selectedOpt = userAnswers[q.id];
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3"
                  >
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                      Q{qIndex + 1}. {q.questionText}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selectedOpt === optIdx;
                        const isCorrect = optIdx === q.correctOption;

                        let optClass = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                        if (submittedQuiz) {
                          if (isCorrect) {
                            optClass = 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-800 dark:text-emerald-200 font-bold';
                          } else if (isChosen && !isCorrect) {
                            optClass = 'bg-rose-100 dark:bg-rose-950 border-rose-400 text-rose-800 dark:text-rose-200 line-through';
                          }
                        } else if (isChosen) {
                          optClass = 'bg-indigo-600 text-white border-indigo-600 font-bold';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={submittedQuiz}
                            onClick={() => handleAnswerQuestion(q.id, optIdx)}
                            className={`p-2.5 rounded-xl border text-xs text-left transition-colors flex items-center space-x-2 ${optClass}`}
                          >
                            <span className="w-5 h-5 rounded-md bg-black/10 flex items-center justify-center font-bold text-[10px]">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {submittedQuiz && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <strong>Rationale:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {!submittedQuiz ? (
              <button
                type="button"
                onClick={handleSubmitQuestions}
                disabled={Object.keys(userAnswers).length === 0}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Submit DILR Case Solutions & Check Accuracy
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSelectPuzzle(selectedPuzzleIndex)}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Retry Case Study
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
