import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Eye,
  BookOpen,
  CheckCircle2,
  Award,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReadingPassage {
  id: string;
  title: string;
  sourceExam: string;
  genre: 'Philosophy & Ethics' | 'Macroeconomics & Trade' | 'Evolutionary Biology' | 'Technology & Geopolitics';
  wordCount: number;
  content: string;
  annotatedSentences?: {
    text: string;
    role: 'thesis' | 'premise' | 'counter' | 'evidence';
  }[];
  questions: {
    id: number;
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }[];
}

const SAMPLE_PASSAGES: ReadingPassage[] = [
  {
    id: 'rc-1',
    title: 'The Algorithmic Epistemology & Scientific Discovery',
    sourceExam: 'CAT VARC / GRE Advanced',
    genre: 'Philosophy & Ethics',
    wordCount: 240,
    content: `Historically, scientific epistemology rested on falsifiable hypotheses formulated by human intuition and validated through empirical experimentation. However, the rise of transformer-based foundation models has introduced an epistemic rupture. Modern neural architectures identify high-dimensional manifold correlations that defy intuitive human formalization. While traditional empiricists argue that prediction without causal explainability constitutes pseudo-science, pragmatic computationalists contend that multi-variable complexity in climate dynamics and protein folding exceeds cognitive capacity. Consequently, our philosophical definition of comprehension must evolve from reductionist causality to predictive coherence.`,
    annotatedSentences: [
      { text: 'Historically, scientific epistemology rested on falsifiable hypotheses formulated by human intuition and validated through empirical experimentation.', role: 'premise' },
      { text: 'However, the rise of transformer-based foundation models has introduced an epistemic rupture.', role: 'counter' },
      { text: 'Modern neural architectures identify high-dimensional manifold correlations that defy intuitive human formalization.', role: 'evidence' },
      { text: 'While traditional empiricists argue that prediction without causal explainability constitutes pseudo-science, pragmatic computationalists contend that multi-variable complexity in climate dynamics and protein folding exceeds cognitive capacity.', role: 'evidence' },
      { text: 'Consequently, our philosophical definition of comprehension must evolve from reductionist causality to predictive coherence.', role: 'thesis' },
    ],
    questions: [
      {
        id: 1,
        question: 'What is the primary thesis advanced by the author regarding scientific comprehension?',
        options: [
          'It must shift from strict reductionist causality toward predictive coherence.',
          'Neural models should be abandoned due to unexplainable black-box representations.',
          'Traditional empiricism has solved complex climate dynamics without computational models.',
          'Scientific epistemology has remained static across centuries.',
        ],
        correct: 0,
        explanation: 'The final sentence explicitly states that the definition of comprehension must evolve from reductionist causality to predictive coherence.',
      },
      {
        id: 2,
        question: 'According to the passage, why do pragmatic computationalists embrace complex neural architectures?',
        options: [
          'Because they completely eliminate the need for experimental verification.',
          'Because domains like protein folding possess multi-variable complexity surpassing human cognitive bandwidth.',
          'Because they mimic human reductionist reasoning.',
          'Because traditional empiricists lack computational resources.',
        ],
        correct: 1,
        explanation: 'Pragmatic computationalists contend multi-variable complexity exceeds human cognitive capacity in fields like protein folding.',
      },
    ],
  },
  {
    id: 'rc-2',
    title: 'Geoeconomic Fragmentation & Global Supply Chains',
    sourceExam: 'UPSC CSAT / GMAT Critical Reasoning',
    genre: 'Macroeconomics & Trade',
    wordCount: 220,
    content: `The post-Cold War consensus on hyper-globalized, just-in-time logistics is undergoing rapid recalibration. Driven by geopolitical competition and systemic disruptions, advanced economies are transitioning toward friend-shoring and sovereign industrial redundancy. Although industrial subsidies and tariffs guarantee national security resilience for critical semiconductors, they undeniably generate structural deadweight welfare losses and inflationary friction. Developing economies must navigate this bifurcated landscape by fostering multi-aligned trade agreements while upgrading high-tech manufacturing ecosystems.`,
    questions: [
      {
        id: 1,
        question: 'What trade-off of friend-shoring and industrial subsidies does the author highlight?',
        options: [
          'Accelerated global multilateralism at the expense of local employment.',
          'Enhanced national security resilience accompanied by deadweight welfare losses and inflation.',
          'Complete immunity from geopolitical supply shocks without economic costs.',
          'Reduction in domestic capital investments.',
        ],
        correct: 1,
        explanation: 'The passage balances national security resilience against structural deadweight welfare losses and inflationary friction.',
      },
      {
        id: 2,
        question: 'What strategic advice does the passage offer to developing nations?',
        options: [
          'Adopt rigid isolationist trade doctrines.',
          'Pursue multi-aligned trade compacts while developing advanced manufacturing ecosystems.',
          'Rely exclusively on single-origin global suppliers.',
          'Subsidize all consumer imported goods.',
        ],
        correct: 1,
        explanation: 'Developing economies must foster multi-aligned trade agreements while upgrading high-tech manufacturing ecosystems.',
      },
    ],
  },
];

export const SpeedReaderModule: React.FC = () => {
  const [selectedPassageIndex, setSelectedPassageIndex] = useState(0);
  const [readingMode, setReadingMode] = useState<'rsvp' | 'bionic' | 'anatomy'>('rsvp');
  const [wpm, setWpm] = useState(350);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [chunkSize, setChunkSize] = useState(1);
  const [customText, setCustomText] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Comprehension Assessment State
  const [quizStarted, setQuizStarted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const activePassage = SAMPLE_PASSAGES[selectedPassageIndex];
  const textToRead = isCustomMode && customText.trim() ? customText : activePassage.content;
  const words = textToRead.split(/\s+/).filter(Boolean);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // RSVP Interval Handler
  useEffect(() => {
    if (isPlaying) {
      const msPerChunk = (60000 / wpm) * chunkSize;
      timerRef.current = setInterval(() => {
        setCurrentWordIndex((prev) => {
          if (prev + chunkSize >= words.length) {
            setIsPlaying(false);
            return words.length - 1;
          }
          return prev + chunkSize;
        });
      }, msPerChunk);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, wpm, chunkSize, words.length]);

  const handleTogglePlay = () => {
    if (currentWordIndex >= words.length - 1) {
      setCurrentWordIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleResetReader = () => {
    setIsPlaying(false);
    setCurrentWordIndex(0);
  };

  // Helper to render Bionic bolding for faster fixation
  const renderBionicText = (text: string) => {
    return text.split(/\s+/).map((word, i) => {
      const mid = Math.ceil(word.length / 2);
      const boldPart = word.slice(0, mid);
      const rest = word.slice(mid);
      return (
        <span key={i} className="inline-block mr-1.5 mb-1.5">
          <strong className="font-bold text-slate-950 dark:text-white">{boldPart}</strong>
          <span className="text-slate-700 dark:text-slate-300">{rest}</span>
        </span>
      );
    });
  };

  // Helper for RSVP word highlighting with Optimal Recognition Point (ORP)
  const currentChunk = words.slice(currentWordIndex, currentWordIndex + chunkSize).join(' ');
  const getOrpHtml = (word: string) => {
    if (!word) return '';
    const center = Math.floor((word.length - 1) / 3);
    const before = word.slice(0, center);
    const focal = word[center];
    const after = word.slice(center + 1);
    return (
      <span>
        {before}
        <span className="text-rose-600 dark:text-rose-400 font-extrabold">{focal}</span>
        {after}
      </span>
    );
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    confetti({ particleCount: 50, spread: 60 });
  };

  const correctAnswersCount = activePassage.questions.reduce((acc, q) => {
    return acc + (userAnswers[q.id] === q.correct ? 1 : 0);
  }, 0);
  const accuracyPercent = Math.round((correctAnswersCount / activePassage.questions.length) * 100);
  const trueWpm = Math.round(wpm * (accuracyPercent / 100));

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  VARC Speed Reading & Bionic Pacer Engine
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Cognitive Pacer
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Train your reading cadence from 250 to 700+ WPM with RSVP optical fixation, Bionic reading, and argument role diagnostics.
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center space-x-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setReadingMode('rsvp');
                setIsPlaying(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                readingMode === 'rsvp'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              ⚡ RSVP Flash Pacer
            </button>
            <button
              onClick={() => {
                setReadingMode('bionic');
                setIsPlaying(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                readingMode === 'bionic'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              👁️ Bionic Reader
            </button>
            <button
              onClick={() => {
                setReadingMode('anatomy');
                setIsPlaying(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                readingMode === 'anatomy'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              🗺️ Argument Anatomy
            </button>
          </div>
        </div>

        {/* Passage Selection Tabs */}
        <div className="flex items-center space-x-2 mt-5 overflow-x-auto pb-1 scrollbar-none">
          {SAMPLE_PASSAGES.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPassageIndex(idx);
                setIsCustomMode(false);
                handleResetReader();
                setQuizStarted(false);
                setQuizSubmitted(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 border ${
                selectedPassageIndex === idx && !isCustomMode
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{p.title}</span>
              <span className="text-[10px] opacity-75">({p.sourceExam})</span>
            </button>
          ))}

          <button
            onClick={() => {
              setIsCustomMode(true);
              handleResetReader();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              isCustomMode
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            ✏️ Paste Custom Text
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      {readingMode === 'rsvp' && (
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          {/* RSVP Stage Viewport */}
          <div className="h-44 sm:h-56 bg-slate-950 rounded-3xl flex flex-col items-center justify-center p-6 text-white relative overflow-hidden border border-slate-800 shadow-inner">
            {/* Guide Crosshairs */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-6 pointer-events-none opacity-20">
              <div className="w-12 h-0.5 bg-rose-500" />
              <div className="w-12 h-0.5 bg-rose-500" />
            </div>
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex flex-col justify-between py-6 pointer-events-none opacity-20">
              <div className="w-0.5 h-6 bg-rose-500" />
              <div className="w-0.5 h-6 bg-rose-500" />
            </div>

            {/* Word Display with ORP Highlight */}
            <div className="text-3xl sm:text-5xl font-mono font-bold tracking-tight text-center select-none animate-in fade-in duration-75">
              {currentWordIndex >= words.length ? (
                <span className="text-emerald-400 text-2xl font-sans">🎉 Passage Completed</span>
              ) : (
                getOrpHtml(currentChunk)
              )}
            </div>

            <div className="absolute bottom-3 text-[11px] font-mono text-slate-400">
              Word {currentWordIndex + 1} of {words.length} ({Math.round(((currentWordIndex + 1) / words.length) * 100)}%)
            </div>
          </div>

          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            {/* Play/Pause & Reset */}
            <div className="md:col-span-4 flex items-center space-x-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause Pacer' : 'Start Reading'}</span>
              </button>
              <button
                type="button"
                onClick={handleResetReader}
                className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs"
                title="Reset to start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* WPM Speed Slider */}
            <div className="md:col-span-5 flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                Speed: <span className="font-mono text-indigo-600 dark:text-indigo-400">{wpm} WPM</span>
              </span>
              <input
                type="range"
                min={200}
                max={850}
                step={25}
                value={wpm}
                onChange={(e) => setWpm(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Chunk Size */}
            <div className="md:col-span-3 flex items-center justify-end space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>Chunk:</span>
              {[1, 2, 3].map((c) => (
                <button
                  key={c}
                  onClick={() => setChunkSize(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    chunkSize === c
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {c}w
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bionic Mode Stage */}
      {readingMode === 'bionic' && (
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-500" />
              <span>Bionic Typography (Optical Fixation Anchoring)</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">{words.length} Total Words</span>
          </div>
          <div className="text-sm sm:text-base leading-loose p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/80 font-sans tracking-wide">
            {renderBionicText(textToRead)}
          </div>
        </div>
      )}

      {/* Argument Anatomy Mode Stage */}
      {readingMode === 'anatomy' && (
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Argument Anatomy & Logical Architecture</span>
            </h3>
            <div className="flex items-center space-x-2 text-[11px] font-bold">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Premise</span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Counter-Claim</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Evidence</span>
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Core Thesis</span>
            </div>
          </div>

          <div className="space-y-3">
            {(activePassage.annotatedSentences || [
              { text: activePassage.content, role: 'thesis' as const },
            ]).map((sentence, sIdx) => {
              const roleStyles = {
                thesis: 'border-l-4 border-purple-500 bg-purple-50/60 dark:bg-purple-950/20 text-purple-950 dark:text-purple-200',
                counter: 'border-l-4 border-amber-500 bg-amber-50/60 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200',
                evidence: 'border-l-4 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200',
                premise: 'border-l-4 border-blue-500 bg-blue-50/60 dark:bg-blue-950/20 text-blue-950 dark:text-blue-200',
              }[sentence.role];

              return (
                <div key={sIdx} className={`p-3.5 rounded-r-xl text-xs sm:text-sm leading-relaxed ${roleStyles}`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 block mb-1">
                    {sentence.role.toUpperCase()}
                  </span>
                  {sentence.text}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comprehension Verification Section */}
      {!isCustomMode && activePassage.questions.length > 0 && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Reading Retention & True WPM Calculator</span>
              </h3>
              <p className="text-xs text-slate-500">
                True WPM = Raw Pacer Speed ({wpm} WPM) × Comprehension Score
              </p>
            </div>
            {quizSubmitted && (
              <div className="px-4 py-1.5 bg-indigo-600 text-white rounded-2xl font-mono text-xs font-bold shadow-md shadow-indigo-600/20">
                True Score: {trueWpm} WPM ({accuracyPercent}% Accuracy)
              </div>
            )}
          </div>

          <div className="space-y-4 pt-2">
            {activePassage.questions.map((q, idx) => (
              <div key={q.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                  Q{idx + 1}. {q.question}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isChosen = userAnswers[q.id] === optIdx;
                    const isCorrect = optIdx === q.correct;
                    let optClass = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                    if (quizSubmitted) {
                      if (isCorrect) optClass = 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-800 dark:text-emerald-200 font-bold';
                      else if (isChosen) optClass = 'bg-rose-100 dark:bg-rose-950 border-rose-400 text-rose-800 dark:text-rose-200 line-through';
                    } else if (isChosen) {
                      optClass = 'bg-indigo-600 text-white border-indigo-600 font-bold';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={quizSubmitted}
                        onClick={() => setUserAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
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
              </div>
            ))}
          </div>

          {!quizSubmitted ? (
            <button
              type="button"
              onClick={handleSubmitQuiz}
              disabled={Object.keys(userAnswers).length === 0}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              Verify Reading Comprehension & Calculate True WPM
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setQuizSubmitted(false);
                setUserAnswers({});
              }}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Retry Reading Drill
            </button>
          )}
        </div>
      )}
    </div>
  );
};
