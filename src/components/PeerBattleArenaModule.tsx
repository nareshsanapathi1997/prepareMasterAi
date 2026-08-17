import React, { useState, useEffect, useRef } from 'react';
import {
  Swords,
  Trophy,
  Flame,
  Zap,
  Timer,
  User,
  Bot,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  Award,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { ExamCategory } from '../types';

interface DuelQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface RivalProfile {
  name: string;
  avatar: string;
  elo: number;
  badge: string;
  accuracyRate: number;
  speedSec: number;
}

const DEFAULT_RIVALS: RivalProfile[] = [
  {
    name: 'Aarav "The Speedster" Sharma',
    avatar: 'AS',
    elo: 1420,
    badge: 'AIR 45 Aspirant',
    accuracyRate: 0.85,
    speedSec: 4.5,
  },
  {
    name: 'Pooja "Quant Hawk" Verma',
    avatar: 'PV',
    elo: 1560,
    badge: '99.9%ile Veteran',
    accuracyRate: 0.92,
    speedSec: 6.0,
  },
  {
    name: 'Dev "Logic Matrix" Ray',
    avatar: 'DR',
    elo: 1380,
    badge: 'DILR Specialist',
    accuracyRate: 0.78,
    speedSec: 3.8,
  },
];

const DEFAULT_QUESTIONS: DuelQuestion[] = [
  {
    id: 'q1',
    question:
      'If log₁₀(x² - 4x + 5) = 0, what is the value of x?',
    options: ['x = 2', 'x = 1 or x = 3', 'x = 0', 'x = 4'],
    correctIndex: 0,
    explanation: 'x² - 4x + 5 = 10⁰ = 1 => x² - 4x + 4 = 0 => (x - 2)² = 0 => x = 2.',
    difficulty: 'Easy',
  },
  {
    id: 'q2',
    question:
      'In a 100m race, A beats B by 10m and B beats C by 10m. By how many meters does A beat C in the same race?',
    options: ['20m', '19m', '18.5m', '21m'],
    correctIndex: 1,
    explanation:
      'When A runs 100m, B runs 90m. When B runs 100m, C runs 90m => When B runs 90m, C runs (90*90)/100 = 81m. Thus A beats C by 100 - 81 = 19 meters.',
    difficulty: 'Medium',
  },
  {
    id: 'q3',
    question:
      'Which constitutional article provides for the establishment of the Finance Commission of India?',
    options: ['Article 280', 'Article 324', 'Article 110', 'Article 356'],
    correctIndex: 0,
    explanation: 'Article 280 of the Constitution of India provides for the establishment of the Finance Commission.',
    difficulty: 'Easy',
  },
  {
    id: 'q4',
    question:
      'A shopkeeper marks an item 40% above cost price and offers a discount of 25%. What is the net profit percentage?',
    options: ['5%', '10%', '15%', '12%'],
    correctIndex: 0,
    explanation: 'Net multiplier = 1.40 * 0.75 = 1.05 => 5% net profit.',
    difficulty: 'Medium',
  },
  {
    id: 'q5',
    question:
      'What is the worst-case time complexity to search an element in a Red-Black Tree with N nodes?',
    options: ['O(N)', 'O(log N)', 'O(N log N)', 'O(1)'],
    correctIndex: 1,
    explanation: 'A Red-Black tree is self-balancing with guaranteed height <= 2*log2(N + 1), so search is O(log N).',
    difficulty: 'Easy',
  },
];

interface PeerBattleArenaModuleProps {
  activeExam: ExamCategory;
  isLoggedIn?: boolean;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export const PeerBattleArenaModule: React.FC<PeerBattleArenaModuleProps> = ({
  activeExam,
  isLoggedIn = false,
  onOpenAuth,
}) => {
  const [userElo, setUserElo] = useState<number>(() => {
    return parseInt(localStorage.getItem('prep_user_elo') || '1250', 10);
  });
  const [gameState, setGameState] = useState<'lobby' | 'matching' | 'in_duel' | 'game_over'>('lobby');
  const [selectedRival, setSelectedRival] = useState<RivalProfile>(DEFAULT_RIVALS[0]);
  const [questions, setQuestions] = useState<DuelQuestion[]>(DEFAULT_QUESTIONS);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Scores
  const [userScore, setUserScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [userStreak, setUserStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [rivalActivity, setRivalActivity] = useState<string>('Analyzing problem...');

  const timerRef = useRef<any>(null);

  // Matchmaking animation
  const handleStartMatchmaking = () => {
    setGameState('matching');
    const randomRival = DEFAULT_RIVALS[Math.floor(Math.random() * DEFAULT_RIVALS.length)];
    setSelectedRival(randomRival);

    setTimeout(() => {
      setGameState('in_duel');
      setCurrentQIndex(0);
      setUserScore(0);
      setRivalScore(0);
      setUserStreak(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(15);
    }, 1800);
  };

  // Question countdown
  useEffect(() => {
    if (gameState !== 'in_duel') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate Rival response
    const rivalDelay = Math.random() * 4000 + 2500;
    const rivalTimer = setTimeout(() => {
      if (gameState === 'in_duel') {
        const isRivalCorrect = Math.random() < selectedRival.accuracyRate;
        if (isRivalCorrect) {
          setRivalScore((s) => s + 100);
          setRivalActivity(`${selectedRival.name.split(' ')[0]} scored +100!`);
        } else {
          setRivalActivity(`${selectedRival.name.split(' ')[0]} submitted incorrect option.`);
        }
      }
    }, rivalDelay);

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(rivalTimer);
    };
  }, [gameState, currentQIndex]);

  const handleTimeExpire = () => {
    clearInterval(timerRef.current);
    if (!isAnswered) {
      setIsAnswered(true);
      setUserStreak(0);
      setTimeout(handleNextQuestion, 2000);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    clearInterval(timerRef.current);

    const isCorrect = idx === questions[currentQIndex].correctIndex;
    if (isCorrect) {
      const speedBonus = timeLeft * 5;
      const streakBonus = userStreak * 20;
      const points = 100 + speedBonus + streakBonus;
      setUserScore((s) => s + points);
      setUserStreak((s) => s + 1);
    } else {
      setUserStreak(0);
    }

    setTimeout(handleNextQuestion, 2200);
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(15);
      setRivalActivity(`${selectedRival.name.split(' ')[0]} reading question...`);
    } else {
      // Game Over & ELO update
      setGameState('game_over');
      const isWon = userScore >= rivalScore;
      const eloDelta = isWon ? 28 : -16;
      const newElo = Math.max(800, userElo + eloDelta);
      setUserElo(newElo);
      localStorage.setItem('prep_user_elo', newElo.toString());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-black/30 text-amber-200 text-xs font-bold border border-white/20">
              <Swords className="w-3.5 h-3.5 text-amber-300" />
              <span>Real-Time Timed Duel Arena</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              1-on-1 Peer Duel & ELO Arena
            </h2>
            <p className="text-white/90 text-xs sm:text-sm max-w-xl leading-relaxed">
              Test your speed and precision in rapid 15-second head-to-head duels. Earn ELO rating points, maintain accuracy streaks, and climb the national leaderboard.
            </p>
          </div>

          {/* User ELO Card */}
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300 border border-amber-400/40">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-amber-200 font-bold block">
                Your ELO Rating
              </span>
              <span className="text-2xl font-black text-white">{userElo}</span>
              <span className="text-[10px] text-amber-300 block font-semibold">
                Tier: {userElo > 1500 ? 'Grandmaster' : userElo > 1300 ? 'Diamond Tier' : 'Challenger'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Demo vs Unlimited ELO Battles Banner */}
      {!isLoggedIn ? (
        <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-300/60 dark:border-amber-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
              ⚡
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Peer Battle Demo Duel Mode
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Play an unranked trial duel. Sign up free to save your <strong>Official ELO Rating, Global Leaderboard Badge</strong>, and compete in unlimited live ranked duels.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenAuth?.('signup')}
            className="shrink-0 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Claim Permanent ELO Rank
          </button>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 px-4 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-bold">
          <span>💎 Ranked ELO Matchmaking Active — Official Leaderboard Placement & Unlimited Duels Enabled</span>
          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-mono">RANKED ELO</span>
        </div>
      )}

      {/* Mode 1: Lobby */}
      {gameState === 'lobby' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Queue for 1v1 Timed Duel ({activeExam})
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                5 rapid-fire questions • 15 seconds per question • Speed and Streak bonuses applied.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center space-y-1">
                <Timer className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto" />
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">15s Clock</span>
                <span className="text-[11px] text-amber-700 dark:text-amber-300">Fast answers score +50 extra</span>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-center space-y-1">
                <Flame className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto" />
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 block">Streak Multiplier</span>
                <span className="text-[11px] text-indigo-700 dark:text-indigo-300">Consecutive correct = +20/streak</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center space-y-1">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">ELO Stakes</span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300">Win +28 ELO | Loss -16 ELO</span>
              </div>
            </div>

            <button
              onClick={handleStartMatchmaking}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-extrabold text-base shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Swords className="w-5 h-5" />
              <span>Find Match & Enter Duel Arena</span>
            </button>
          </div>

          {/* Right: Hall of Fame Leaderboard */}
          <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Top Aspirant ELO Standings</span>
            </h4>
            <div className="space-y-3">
              {[
                { name: 'Kavya S.', elo: 1840, badge: 'Grandmaster' },
                { name: 'Rohan N.', elo: 1765, badge: 'Diamond' },
                { name: 'Tanvi M.', elo: 1690, badge: 'Diamond' },
                { name: 'You', elo: userElo, badge: 'Challenger', isUser: true },
              ].map((p, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl flex items-center justify-between text-xs ${
                    p.isUser
                      ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-[11px] text-slate-400">#{i + 1}</span>
                    <span className="font-semibold">{p.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{p.elo}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {p.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Matching Animation */}
      {gameState === 'matching' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-lg space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto animate-bounce">
            <Swords className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Searching National Duel Matchmaking Queue...
            </h3>
            <p className="text-xs text-slate-500">
              Matching with an aspirant of similar ELO (~{userElo} ± 100) in {activeExam}...
            </p>
          </div>
          <div className="max-w-xs mx-auto h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}

      {/* Mode 3: In Active Duel */}
      {gameState === 'in_duel' && (
        <div className="space-y-6">
          {/* Live Score Ticker Bar */}
          <div className="grid grid-cols-12 gap-4 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm">
            {/* User Side */}
            <div className="col-span-5 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                YOU
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">You ({userElo} ELO)</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">{userScore} pts</span>
                  {userStreak > 1 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-0.5">
                      <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {userStreak}x
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Center Timer */}
            <div className="col-span-2 text-center">
              <div className={`inline-flex flex-col items-center justify-center w-12 h-12 rounded-2xl border ${
                timeLeft <= 5
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-600 animate-ping'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}>
                <span className="text-sm font-black font-mono">{timeLeft}s</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Q {currentQIndex + 1} / {questions.length}
              </span>
            </div>

            {/* Rival Side */}
            <div className="col-span-5 flex items-center justify-end space-x-3 text-right">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {selectedRival.name} ({selectedRival.elo} ELO)
                </span>
                <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">{rivalScore} pts</span>
                <span className="text-[10px] text-slate-400 block italic">{rivalActivity}</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                {selectedRival.avatar}
              </div>
            </div>
          </div>

          {/* Active Question Arena */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                Level: {questions[currentQIndex].difficulty}
              </span>
              <span className="text-xs text-slate-400">100 pts base value</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {questions[currentQIndex].question}
            </h3>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {questions[currentQIndex].options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === questions[currentQIndex].correctIndex;
                let btnStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 font-bold';
                  } else {
                    btnStyle = 'opacity-40 border-slate-200 dark:border-slate-800';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle} cursor-pointer`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation box on reveal */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 animate-in fade-in">
                <strong className="text-indigo-600 dark:text-indigo-400 block mb-1">Answer Rationale:</strong>
                {questions[currentQIndex].explanation}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 4: Match Summary / Game Over */}
      {gameState === 'game_over' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-xl max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-lg bg-gradient-to-tr from-amber-400 to-amber-600 text-white">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {userScore >= rivalScore ? '🎉 Victory! Duel Won' : 'Defeat - Good Fight!'}
            </h3>
            <p className="text-xs text-slate-500">
              {userScore >= rivalScore
                ? `You outperformed ${selectedRival.name} with rapid response precision.`
                : `${selectedRival.name} edged ahead on speed bonuses. Retake the arena to win back your rating!`}
            </p>
          </div>

          {/* Score comparison */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Your Score</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{userScore} pts</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">{selectedRival.name.split(' ')[0]} Score</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{rivalScore} pts</span>
            </div>
          </div>

          {/* New ELO Notification */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold">
            Updated ELO: {userElo} ({userScore >= rivalScore ? '+28 Rating Points' : '-16 Rating Points'})
          </div>

          <button
            onClick={() => setGameState('lobby')}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors"
          >
            Return to Arena Lobby
          </button>
        </div>
      )}
    </div>
  );
};
