import React, { useState, useEffect } from 'react';
import {
  Users,
  Timer,
  Award,
  Clock,
  Play,
  Flame,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Radio,
  Eye,
  Send,
} from 'lucide-react';
import { ExamCategory } from '../types';

interface LiveCohortMockModuleProps {
  activeExam: string;
  isLoggedIn?: boolean;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

interface MockCandidate {
  id: string;
  name: string;
  avatar: string;
  city: string;
  currentScore: number;
  solvedCount: number;
  accuracy: number;
  status: 'In Test' | 'Reviewing' | 'Submitted';
}

export const LiveCohortMockModule: React.FC<LiveCohortMockModuleProps> = ({
  activeExam,
  isLoggedIn = false,
  onOpenAuth,
}) => {
  const [testStatus, setTestStatus] = useState<'countdown' | 'in-progress' | 'ended'>('countdown');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(180); // 3 mins demo timer
  const [liveCandidateCount, setLiveCandidateCount] = useState<number>(4820);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userScore, setUserScore] = useState<number>(0);

  const sampleQuestions = [
    {
      id: 1,
      section: 'Quantitative Aptitude',
      question:
        'In a race of 1000m, runner A beats runner B by 50m or 10 seconds. What is the time taken by runner A to finish the entire race?',
      options: ['190 seconds', '200 seconds', '180 seconds', '210 seconds'],
      correct: 0,
      explanation: 'Runner B runs 50m in 10s => Speed of B = 5 m/s. Time for B for 1000m = 200s. Since A beats B by 10s, A took 190s.',
    },
    {
      id: 2,
      section: 'DILR - Logical Arrangement',
      question:
        'Five persons P, Q, R, S, and T are seated in a row facing north. S is between T and Q. Q is to the immediate left of R. P is to the immediate left of T. Who is in the middle?',
      options: ['S', 'T', 'Q', 'P'],
      correct: 0,
      explanation: 'Order from Left to Right is: P -> T -> S -> Q -> R. The middle person is S.',
    },
    {
      id: 3,
      section: 'Verbal Ability & Grammar',
      question:
        'Select the logically most coherent sentence fragment: "Neither the faculty committee members nor the dean _____ able to anticipate the sudden policy revision."',
      options: ['was', 'were', 'have been', 'are being'],
      correct: 0,
      explanation: 'When subjects are joined by "neither... nor", the verb agrees with the closer subject ("the dean", singular => "was").',
    },
  ];

  const [liveLeaderboard, setLiveLeaderboard] = useState<MockCandidate[]>([
    { id: '1', name: 'Tanmay Bhattacharya', avatar: 'TB', city: 'Kolkata', currentScore: 9, solvedCount: 3, accuracy: 100, status: 'In Test' },
    { id: '2', name: 'Pooja Venkatesh', avatar: 'PV', city: 'Bengaluru', currentScore: 6, solvedCount: 2, accuracy: 100, status: 'In Test' },
    { id: '3', name: 'Aarav Malhotra', avatar: 'AM', city: 'Delhi', currentScore: 6, solvedCount: 3, accuracy: 66, status: 'In Test' },
    { id: '4', name: 'Divya Deshmukh', avatar: 'DD', city: 'Mumbai', currentScore: 3, solvedCount: 1, accuracy: 100, status: 'In Test' },
  ]);

  // Live timer tick
  useEffect(() => {
    let timer: any;
    if (testStatus === 'in-progress' && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((s) => {
          if (s <= 1) {
            setTestStatus('ended');
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStatus, secondsRemaining]);

  // Live candidate fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCandidateCount((c) => c + Math.floor(Math.random() * 5) - 2);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStartExam = () => {
    setTestStatus('in-progress');
    setSecondsRemaining(180);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserScore(0);
  };

  const handleNextQuestion = () => {
    if (selectedOption === sampleQuestions[currentQuestionIndex].correct) {
      setUserScore((s) => s + 3);
    } else if (selectedOption !== null) {
      setUserScore((s) => s - 1);
    }

    if (currentQuestionIndex + 1 < sampleQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setTestStatus('ended');
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="live-cohort-mock-module" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Synchronized Cohort Header */}
      <div className="bg-gradient-to-r from-rose-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-ping" />
              All-India Synchronized Live Testing Room
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              All-India National Cohort Mock Exam
            </h1>
            <p className="text-sm text-rose-100 max-w-2xl">
              Experience the pressure of real examination test-centers. Synchronized start, real-time national percentile calculation, and live leaderboard rankings.
            </p>
          </div>

          {/* Live Candidates HUD */}
          <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/10 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-rose-200 uppercase font-bold block">Live Aspirants Online</span>
              <span className="text-xl font-black text-white">{liveCandidateCount.toLocaleString()}</span>
            </div>
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Guest Demo vs Full Access Banner */}
      {!isLoggedIn ? (
        <div className="bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-amber-500/10 border border-rose-300/60 dark:border-rose-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
              ⚡
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Live Cohort Demo Preview
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Register your free account to receive an <strong>Official All-India Roll Number</strong>, full rank card certification, and access weekly national scholarship test slots.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenAuth?.('signup')}
            className="shrink-0 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Register Free Roll Number
          </button>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 px-4 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-bold">
          <span>💎 Registered Aspirant — Official All-India National Ranking & Live Analytics Enabled</span>
          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-mono">VERIFIED ROLL #</span>
        </div>
      )}

      {testStatus === 'countdown' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <Timer className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Next Live Slot Starting Now
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You will compete in a synchronized test with 4,800+ aspirants simultaneously. Negative marking (+3 / -1) is active.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div>⏱️ Duration: <span className="font-bold text-slate-900 dark:text-white">3 Minutes Speed Drill</span></div>
            <div>📊 Evaluation: <span className="font-bold text-slate-900 dark:text-white">Instant All-India Percentile & Scorecard</span></div>
          </div>

          <button
            onClick={handleStartExam}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" /> Enter Live Examination Room
          </button>
        </div>
      )}

      {testStatus === 'in-progress' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Question Panel (8 Cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                  Question {currentQuestionIndex + 1} of {sampleQuestions.length}
                </span>
                <span className="text-xs text-slate-400">
                  {sampleQuestions[currentQuestionIndex].section}
                </span>
              </div>

              {/* Synchronized Timer Clock */}
              <div className="flex items-center gap-2 font-mono font-black text-base text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60">
                <Clock className="w-4 h-4" />
                {formatTimer(secondsRemaining)}
              </div>
            </div>

            {/* Question Text */}
            <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
              {sampleQuestions[currentQuestionIndex].question}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {sampleQuestions[currentQuestionIndex].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    selectedOption === idx
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span>{option}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedOption === idx
                        ? 'border-rose-500 bg-rose-500 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {selectedOption === idx && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedOption(null)}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Clear Selection
              </button>

              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <span>{currentQuestionIndex + 1 === sampleQuestions.length ? 'Submit Final Test' : 'Save & Next'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Live Competitor Leaderboard (4 Cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-500" /> Live Cohort Leaderboard
            </h3>

            <div className="space-y-2.5">
              {liveLeaderboard.map((candidate, idx) => (
                <div
                  key={candidate.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black text-slate-400">#{idx + 1}</span>
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {candidate.avatar}
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-slate-900 dark:text-white">
                        {candidate.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{candidate.city}</span>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                    {candidate.currentScore} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {testStatus === 'ended' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              All-India Live Mock Completed!
            </h2>
            <p className="text-xs text-slate-500">
              National percentile calculated across {liveCandidateCount.toLocaleString()} concurrent test takers.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">Your Score</span>
              <span className="text-xl font-black text-rose-600">{userScore} / 9</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">All-India Rank</span>
              <span className="text-xl font-black text-indigo-600">AIR 142</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">Percentile</span>
              <span className="text-xl font-black text-emerald-600">97.8%ile</span>
            </div>
          </div>

          <button
            onClick={() => setTestStatus('countdown')}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold"
          >
            Re-enter Waiting Lobby
          </button>
        </div>
      )}
    </div>
  );
};
