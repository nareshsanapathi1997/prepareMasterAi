import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Headphones,
  CheckCircle2,
  Plus,
  Trash2,
  Flame,
  Coffee,
  CloudRain,
  Radio,
  Zap,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { StudyTask } from '../types';

interface Props {
  activeExam: string;
}

type AmbientSoundType = 'none' | 'binaural-alpha' | 'rain' | 'whitenoise' | 'campfire';

export const StudyRoomModule: React.FC<Props> = ({ activeExam }) => {
  // Timer States
  const [timerMode, setTimerMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [workDurationMinutes, setWorkDurationMinutes] = useState<number>(25);
  const [breakDurationMinutes, setBreakDurationMinutes] = useState<number>(5);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);

  // Audio Synthesizer States
  const [activeSound, setActiveSound] = useState<AmbientSoundType>('none');
  const [volume, setVolume] = useState<number>(0.5);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundNodesRef = useRef<{ [key: string]: any }>({});

  // Study Task Checklist
  const [tasks, setTasks] = useState<StudyTask[]>([
    {
      id: 'task-1',
      text: `Solve 15 High-Yield ${activeExam} Practice Questions`,
      completed: false,
      pomodorosEstimated: 2,
      pomodorosCompleted: 0,
    },
    {
      id: 'task-2',
      text: 'Review Formula Cheat Sheet & Speed Shortcuts',
      completed: false,
      pomodorosEstimated: 1,
      pomodorosCompleted: 0,
    },
    {
      id: 'task-3',
      text: 'Analyze Mistake Taxonomy in Error Notebook',
      completed: true,
      pomodorosEstimated: 1,
      pomodorosCompleted: 1,
    },
  ]);
  const [newTaskInput, setNewTaskInput] = useState<string>('');
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Timer Tick Effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timeLeftSeconds === 0 && isRunning) {
      setIsRunning(false);
      if (timerMode === 'work') {
        setCompletedSessionsCount((c) => c + 1);
        setTimerMode('shortBreak');
        setTimeLeftSeconds(breakDurationMinutes * 60);
      } else {
        setTimerMode('work');
        setTimeLeftSeconds(workDurationMinutes * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeftSeconds, timerMode, workDurationMinutes, breakDurationMinutes]);

  const switchMode = (mode: 'work' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setTimerMode(mode);
    if (mode === 'work') setTimeLeftSeconds(workDurationMinutes * 60);
    else if (mode === 'shortBreak') setTimeLeftSeconds(breakDurationMinutes * 60);
    else setTimeLeftSeconds(15 * 60);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerMode === 'work') setTimeLeftSeconds(workDurationMinutes * 60);
    else if (timerMode === 'shortBreak') setTimeLeftSeconds(breakDurationMinutes * 60);
    else setTimeLeftSeconds(15 * 60);
  };

  // Web Audio Ambient Synthesizer Engine
  const stopAmbientAudio = () => {
    try {
      if (soundNodesRef.current.sources) {
        soundNodesRef.current.sources.forEach((s: any) => {
          try {
            s.stop();
            s.disconnect();
          } catch (e) {}
        });
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    } catch (e) {}
    audioContextRef.current = null;
    soundNodesRef.current = {};
    setActiveSound('none');
  };

  const playAmbientSound = (sound: AmbientSoundType) => {
    stopAmbientAudio();
    if (sound === 'none') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;
      gainNode.connect(ctx.destination);
      soundNodesRef.current.gain = gainNode;
      soundNodesRef.current.sources = [];

      if (sound === 'binaural-alpha') {
        // 40Hz Gamma / 14Hz Alpha focus binaural beat: Left 220Hz, Right 234Hz
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        oscL.type = 'sine';
        oscR.type = 'sine';
        oscL.frequency.setValueAtTime(200, ctx.currentTime);
        oscR.frequency.setValueAtTime(214, ctx.currentTime);

        const merger = ctx.createChannelMerger(2);
        oscL.connect(merger, 0, 0);
        oscR.connect(merger, 0, 1);
        merger.connect(gainNode);

        oscL.start();
        oscR.start();
        soundNodesRef.current.sources.push(oscL, oscR);
      } else if (sound === 'rain' || sound === 'whitenoise' || sound === 'campfire') {
        // Synthesize Pink/Brown Noise via AudioBuffer
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0,
          b1 = 0,
          b2 = 0,
          b3 = 0,
          b4 = 0,
          b5 = 0,
          b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (sound === 'whitenoise') {
            output[i] = white * 0.1;
          } else {
            // Pink noise filtering for rain/campfire
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.969 * b2 + white * 0.153852;
            b3 = 0.8665 * b3 + white * 0.3104856;
            b4 = 0.55 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.016898;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
            b6 = white * 0.115926;
          }
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        if (sound === 'rain') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(900, ctx.currentTime);
        } else if (sound === 'campfire') {
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(450, ctx.currentTime);
        } else {
          filter.type = 'allpass';
        }

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        whiteNoise.start();
        soundNodesRef.current.sources.push(whiteNoise);
      }

      setActiveSound(sound);
    } catch (err) {
      console.error('Audio synthesizer error:', err);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (soundNodesRef.current.gain) {
      soundNodesRef.current.gain.gain.setValueAtTime(newVol, audioContextRef.current?.currentTime || 0);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              pomodorosCompleted: !t.completed ? t.pomodorosEstimated : t.pomodorosCompleted,
            }
          : t
      )
    );
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      text: newTaskInput.trim(),
      completed: false,
      pomodorosEstimated: 1,
      pomodorosCompleted: 0,
    };
    setTasks([...tasks, newTask]);
    setNewTaskInput('');
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className={`space-y-6 ${isZenMode ? 'fixed inset-0 z-50 bg-slate-950 p-8 overflow-y-auto text-white' : ''}`}>
      {/* Header */}
      {!isZenMode && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl border border-blue-700/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-blue-200 mb-2">
                <Timer className="w-3.5 h-3.5" />
                <span>Deep Focus Study Room & Synthesizer</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Pomodoro Focus & Ambient Audio
              </h1>
              <p className="text-blue-200 text-sm mt-1 max-w-2xl">
                Lock into deep cognitive state with binaural focus waves, interval sprints, and task tracking for {activeExam}.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1.5 bg-blue-800/80 border border-blue-600 rounded-xl text-xs font-bold flex items-center space-x-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>{completedSessionsCount} Pomodoros Today</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pomodoro Clock & Sound Synthesizer (Col 1-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Pomodoro Canvas */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
            {/* Zen Mode Switch */}
            <button
              type="button"
              onClick={() => setIsZenMode(!isZenMode)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1"
            >
              {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span>{isZenMode ? 'Exit Zen' : 'Zen Mode'}</span>
            </button>

            {/* Mode Selector Tabs */}
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => switchMode('work')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  timerMode === 'work'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Deep Work (25m)
              </button>
              <button
                type="button"
                onClick={() => switchMode('shortBreak')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  timerMode === 'shortBreak'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Short Break (5m)
              </button>
              <button
                type="button"
                onClick={() => switchMode('longBreak')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  timerMode === 'longBreak'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Long Break (15m)
              </button>
            </div>

            {/* Huge Digital Clock Display */}
            <div className="text-7xl sm:text-8xl font-black font-mono tracking-tight text-slate-900 dark:text-white my-4 select-none">
              {formatTime(timeLeftSeconds)}
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-8 flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span>
                {timerMode === 'work'
                  ? 'Focus Sprint Active'
                  : timerMode === 'shortBreak'
                  ? 'Hydration & Rest'
                  : 'Extended Relaxation'}
              </span>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setIsRunning(!isRunning)}
                className={`px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg flex items-center space-x-2 transition-all transform active:scale-95 ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-blue-600 hover:bg-blue-700 ring-4 ring-blue-500/20'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pause Sprint</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white" />
                    <span>Start Focus Sprint</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetTimer}
                className="p-3.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Ambient Noise Generator Studio */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Headphones className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Synthesized Ambient Audio Generator
                </h3>
              </div>
              {activeSound !== 'none' && (
                <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Playing {activeSound}</span>
                </span>
              )}
            </div>

            {/* Sound Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  id: 'binaural-alpha' as AmbientSoundType,
                  title: '40Hz Alpha Wave',
                  sub: 'Binaural Focus',
                  icon: Radio,
                },
                {
                  id: 'rain' as AmbientSoundType,
                  title: 'Heavy Rain',
                  sub: 'Rain on Window',
                  icon: CloudRain,
                },
                {
                  id: 'whitenoise' as AmbientSoundType,
                  title: 'White Noise',
                  sub: 'Block Chatter',
                  icon: Zap,
                },
                {
                  id: 'campfire' as AmbientSoundType,
                  title: 'Warm Campfire',
                  sub: 'Cozy Crackle',
                  icon: Flame,
                },
              ].map((snd) => {
                const Icon = snd.icon;
                const isSelected = activeSound === snd.id;
                return (
                  <button
                    key={snd.id}
                    type="button"
                    onClick={() => playAmbientSound(isSelected ? 'none' : snd.id)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between space-y-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-bold">{snd.title}</div>
                      <div className="text-[10px] text-slate-400">{snd.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Volume Control */}
            {activeSound !== 'none' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-3">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-600"
                />
                <button
                  type="button"
                  onClick={stopAmbientAudio}
                  className="text-xs font-semibold text-rose-500 hover:underline px-2"
                >
                  Mute
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Focus Task Checklist (Col 8-12) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Focus Sprint Objectives
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {tasks.filter((t) => t.completed).length} / {tasks.length} Done
              </span>
            </div>

            {/* New Task Form */}
            <form onSubmit={addTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="Add high-yield study task..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Task List */}
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    task.completed
                      ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800 opacity-60'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className="flex items-start space-x-2.5 text-left flex-1"
                  >
                    <div
                      className={`w-4 h-4 rounded-md mt-0.5 border flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        task.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {task.text}
                    </span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                      {task.pomodorosCompleted}/{task.pomodorosEstimated} 🍅
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
