import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  Download,
  Headphones,
  FileText,
  User,
  Zap,
  Radio,
  Share2,
  Clock,
  Loader2,
} from 'lucide-react';

interface PodcastEpisode {
  id: string;
  title: string;
  topic: string;
  exam: string;
  durationMinutes: number;
  description: string;
  dialogue: {
    speaker: 'Alex (Host)' | 'Dr. Priya (Specialist)';
    text: string;
  }[];
}

const SAMPLE_EPISODES: PodcastEpisode[] = [
  {
    id: 'ep-1',
    title: 'The Kesavananda Bharati Doctrine & Basic Structure Breakdown',
    topic: 'Indian Polity & Constitutional Law',
    exam: 'UPSC Civil Services / CLAT PG',
    durationMinutes: 4,
    description: 'Deconstructing Article 368 limitations, the 1973 13-judge bench ruling, and the non-negotiable core pillars of the Constitution.',
    dialogue: [
      {
        speaker: 'Alex (Host)',
        text: 'Welcome back to the High-Yield Audio Sprint! Today we tackle the single most tested judicial ruling in Indian Polity: the landmark 1973 Kesavananda Bharati case. Dr. Priya, what was the core constitutional conflict that precipitated this ruling?',
      },
      {
        speaker: 'Dr. Priya (Specialist)',
        text: 'Thanks Alex. The core dispute was whether Parliament’s constituent amending power under Article 368 was absolute and unbridled, or whether there exists an untouchable constitutional bedrock that cannot be abrogated.',
      },
      {
        speaker: 'Alex (Host)',
        text: 'And the supreme court delivered a historic 7 to 6 majority ruling formulating the famous "Basic Structure Doctrine". How should an aspirant memorize what constitutes this basic structure?',
      },
      {
        speaker: 'Dr. Priya (Specialist)',
        text: 'Crucially, the Court intentionally refrained from providing an exhaustive statutory list! Instead, it established illustrative pillars: Supremacy of the Constitution, Judicial Review, Separation of Powers, Federalism, and Free & Fair Democratic Elections.',
      },
      {
        speaker: 'Alex (Host)',
        text: 'What is the most common trap examiner question on this topic?',
      },
      {
        speaker: 'Dr. Priya (Specialist)',
        text: 'The classic trap is asking if "Basic Structure" is defined in the Constitution. The answer is an emphatic NO. It is purely an organic judicial innovation designed to prevent parliamentary autocracy.',
      },
    ],
  },
  {
    id: 'ep-2',
    title: 'Demystifying Multi-Head Self-Attention in Transformers',
    topic: 'Deep Learning & NLP Architecture',
    exam: 'GATE CS / AI Engg Interviews',
    durationMinutes: 5,
    description: 'Understanding Query-Key-Value projections, scaled dot-product attention math, and why multi-head mechanisms allow diverse contextual subspaces.',
    dialogue: [
      {
        speaker: 'Alex (Host)',
        text: 'Welcome to AI Systems Deep Dive! Today we are dissecting the engine behind modern LLMs: Multi-Head Self-Attention from Vaswani et al. Priya, why did transformers replace recurrence like LSTMs?',
      },
      {
        speaker: 'Dr. Priya (Specialist)',
        text: 'The fundamental bottleneck of RNNs was sequential token-by-token processing, preventing GPU matrix parallelization. Transformers allow the entire sequence to attend across itself in parallel via Query, Key, and Value dot-products.',
      },
      {
        speaker: 'Alex (Host)',
        text: 'Walk us through the scaled dot-product attention formula: Softmax of Q times K-transpose divided by square root of d_k, multiplied by V. Why do we scale by square root of d_k?',
      },
      {
        speaker: 'Dr. Priya (Specialist)',
        text: 'That is a favorite GATE and PhD interview question! For large dimension d_k, the dot products grow extremely large in magnitude, pushing the Softmax function into regions with near-zero gradients (vanishing gradient trap). Dividing by sqrt(d_k) normalizes the variance to 1.',
      },
    ],
  },
  {
    id: 'ep-3',
    title: 'Game Theory: Nash Equilibrium & Prisoner’s Dilemma',
    topic: 'Quantitative Economics & Decision Science',
    exam: 'CAT Quantitative Aptitude / GMAT',
    durationMinutes: 3,
    description: 'Strictly dominant strategies vs Pareto optimal outcomes in strategic payoffs.',
    dialogue: [
      {
        speaker: 'Alex (Host)',
        text: 'In this micro-lecture, we analyze non-cooperative game theory. Priya, what is the precise mathematical definition of a Nash Equilibrium?',
      },
      {
        speaker: 'Dr. Priya (Specialist)',
        text: 'A Nash Equilibrium is a state where no player has any incentive to unilaterally deviate from their chosen strategy, given the choices of all other players.',
      },
      {
        speaker: 'Alex (Host)',
        text: 'And in the Prisoner’s Dilemma, defecting is a dominant strategy, yet it yields a Pareto sub-optimal outcome compared to mutual cooperation. How does this apply to price wars in business?',
      },
      {
        speaker: 'Dr. Priya (Specialist)',
        text: 'Exactly! Airlines or duopolies undercut prices to capture marginal share, eventually driving profits to zero—a classic trap that game theory models with mathematical precision.',
      },
    ],
  },
];

export const PodcastStudioModule: React.FC = () => {
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [customTopic, setCustomTopic] = useState('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

  const episode = SAMPLE_EPISODES[selectedEpisodeIndex];
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const playCurrentLine = (lineIdx: number) => {
    if (!synthRef.current || lineIdx >= episode.dialogue.length) {
      setIsPlaying(false);
      return;
    }

    synthRef.current.cancel();
    const item = episode.dialogue[lineIdx];
    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.rate = playbackRate;

    // Distinguish voices if available
    const voices = synthRef.current.getVoices();
    if (item.speaker.startsWith('Alex')) {
      utterance.pitch = 1.0;
      const maleVoice = voices.find((v) => v.name.includes('Male') || v.name.includes('David') || v.name.includes('Google US English'));
      if (maleVoice) utterance.voice = maleVoice;
    } else {
      utterance.pitch = 1.15;
      const femaleVoice = voices.find((v) => v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Victoria'));
      if (femaleVoice) utterance.voice = femaleVoice;
    }

    utterance.onend = () => {
      if (lineIdx + 1 < episode.dialogue.length) {
        setCurrentLineIndex(lineIdx + 1);
        playCurrentLine(lineIdx + 1);
      } else {
        setIsPlaying(false);
        setCurrentLineIndex(0);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    synthRef.current.speak(utterance);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (synthRef.current) synthRef.current.cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playCurrentLine(currentLineIndex);
    }
  };

  const handleReset = () => {
    if (synthRef.current) synthRef.current.cancel();
    setIsPlaying(false);
    setCurrentLineIndex(0);
  };

  const handleGenerateCustomEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;
    setIsGeneratingCustom(true);

    setTimeout(() => {
      const generated: PodcastEpisode = {
        id: `ep-custom-${Date.now()}`,
        title: `${customTopic} (High-Yield AI Audio Sprint)`,
        topic: customTopic,
        exam: 'Target Competitive Exam',
        durationMinutes: 3,
        description: `Deep-dive analytical conversation dissecting ${customTopic} with real-world case examples and examination pitfalls.`,
        dialogue: [
          {
            speaker: 'Alex (Host)',
            text: `Welcome to our special high-yield audio sprint on ${customTopic}. Dr. Priya, what is the foundational mental model every candidate must master first?`,
          },
          {
            speaker: 'Dr. Priya (Specialist)',
            text: `Great question, Alex. When mastering ${customTopic}, the key is to isolate the governing constraints and examine edge cases where standard rules undergo phase transitions.`,
          },
          {
            speaker: 'Alex (Host)',
            text: `What is the most frequent misconception students commit in numericals and essay questions here?`,
          },
          {
            speaker: 'Dr. Priya (Specialist)',
            text: `Students often confuse symptom with root causation. Always formulate the governing theorem from first principles and double check dimensional boundaries.`,
          },
        ],
      };

      SAMPLE_EPISODES.unshift(generated);
      setSelectedEpisodeIndex(0);
      setIsGeneratingCustom(false);
      setCustomTopic('');
      handleReset();
    }, 1200);
  };

  const handleDownloadTranscript = () => {
    const text = `High-Yield AI Podcast: ${episode.title}\nTopic: ${episode.topic} (${episode.exam})\n\n` +
      episode.dialogue.map((d) => `[${d.speaker}]:\n${d.text}\n`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${episode.title.replace(/\s+/g, '_')}_transcript.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Audio Micro-Lecture & Revision Studio
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  Dual-Speaker AI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hands-free conversational revision with simulated host & specialist mentors for on-the-go retention.
              </p>
            </div>
          </div>

          {/* Custom Topic Generator */}
          <form onSubmit={handleGenerateCustomEpisode} className="flex items-center gap-2">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. CAPM Model / Photoelectric Effect"
              className="px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 w-52"
            />
            <button
              type="submit"
              disabled={isGeneratingCustom || !customTopic.trim()}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white flex items-center space-x-1.5 shadow-md shadow-purple-600/20"
            >
              {isGeneratingCustom ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Make Podcast</span>
            </button>
          </form>
        </div>

        {/* Episode Selector Bar */}
        <div className="flex items-center space-x-2 mt-5 overflow-x-auto pb-1 scrollbar-none">
          {SAMPLE_EPISODES.map((ep, idx) => (
            <button
              key={ep.id}
              onClick={() => {
                setSelectedEpisodeIndex(idx);
                handleReset();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 border ${
                selectedEpisodeIndex === idx
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{ep.title}</span>
              <span className="text-[10px] opacity-75">({ep.exam})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Virtual Studio Visualizer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-3xl text-white shadow-xl border border-purple-900/50 space-y-6 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-[11px] font-bold flex items-center gap-1.5 border border-purple-500/30">
                <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                <span>STUDIO LIVE • {episode.exam}</span>
              </span>
              <span className="text-xs font-mono text-purple-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                ~{episode.durationMinutes} mins
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold leading-snug">{episode.title}</h3>
              <p className="text-xs text-purple-200/80 mt-1 leading-relaxed">
                {episode.description}
              </p>
            </div>

            {/* Simulated Animated Equalizer Bars */}
            <div className="flex items-end justify-center space-x-1.5 h-16 bg-black/40 rounded-2xl p-3 border border-purple-500/20">
              {[40, 75, 90, 50, 100, 65, 80, 45, 95, 60, 85, 30, 70, 90, 50].map((h, i) => (
                <div
                  key={i}
                  style={{
                    height: isPlaying ? `${Math.max(15, Math.round(h * Math.random()))}%` : '15%',
                  }}
                  className="w-1.5 bg-gradient-to-t from-purple-500 to-indigo-400 rounded-full transition-all duration-150"
                />
              ))}
            </div>

            {/* Host & Specialist Active Avatars */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div
                className={`p-3 rounded-2xl border transition-all ${
                  isPlaying && episode.dialogue[currentLineIndex]?.speaker.startsWith('Alex')
                    ? 'bg-purple-600/30 border-purple-400 shadow-md shadow-purple-500/30 scale-102'
                    : 'bg-white/5 border-white/10 opacity-70'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                    AL
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Alex</span>
                    <span className="text-[10px] text-purple-300">Host / Questioner</span>
                  </div>
                </div>
              </div>

              <div
                className={`p-3 rounded-2xl border transition-all ${
                  isPlaying && episode.dialogue[currentLineIndex]?.speaker.startsWith('Dr. Priya')
                    ? 'bg-purple-600/30 border-purple-400 shadow-md shadow-purple-500/30 scale-102'
                    : 'bg-white/5 border-white/10 opacity-70'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-xs">
                    PR
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Dr. Priya</span>
                    <span className="text-[10px] text-purple-300">SME Specialist</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-purple-800/40">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="px-5 py-2.5 rounded-2xl bg-white text-purple-950 hover:bg-purple-50 font-bold text-xs flex items-center space-x-2 shadow-lg cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? 'Pause Episode' : 'Listen Now'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs"
                  title="Restart episode"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Switcher */}
              <div className="flex items-center space-x-1 text-xs">
                {[1.0, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-2 py-1 rounded-lg font-mono text-[11px] font-bold ${
                      playbackRate === rate ? 'bg-purple-500 text-white' : 'bg-white/10 text-purple-200'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Live Synchronized Script Transcript */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Synchronized Episode Transcript
                </h3>
              </div>
              <button
                type="button"
                onClick={handleDownloadTranscript}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Notes</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {episode.dialogue.map((item, idx) => {
                const isCurrent = currentLineIndex === idx && isPlaying;
                const isAlex = item.speaker.startsWith('Alex');

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentLineIndex(idx);
                      if (isPlaying) playCurrentLine(idx);
                    }}
                    className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 dark:border-purple-600 shadow-sm ring-2 ring-purple-400/30'
                        : isAlex
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200'
                        : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`font-bold text-xs ${
                          isAlex ? 'text-indigo-600 dark:text-indigo-400' : 'text-purple-600 dark:text-purple-400'
                        }`}
                      >
                        {item.speaker}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                          <span>Speaking</span>
                        </span>
                      )}
                    </div>
                    <p>{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
