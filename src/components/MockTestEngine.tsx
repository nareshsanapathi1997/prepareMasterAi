import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  AlertTriangle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Calculator as CalcIcon,
  CheckCircle2,
  HelpCircle,
  Maximize2,
  Minimize2,
  FileText,
  RotateCcw,
  Camera,
  CameraOff,
  ShieldCheck,
  ShieldAlert,
  PenTool,
  Eraser,
  Trash2,
  Target,
  Sparkles,
  Volume2,
  ZoomIn,
  ZoomOut,
  Download,
} from 'lucide-react';
import { MockTest, TestAttempt } from '../types';
import confetti from 'canvas-confetti';

interface MockTestEngineProps {
  test: MockTest;
  onFinishTest: (attempt: TestAttempt) => void;
  onExit: () => void;
}

export const MockTestEngine: React.FC<MockTestEngineProps> = ({
  test,
  onFinishTest,
  onExit,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [confidenceRatings, setConfidenceRatings] = useState<Record<number, 'sure' | 'medium' | 'guess'>>({});
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [visitedQuestions, setVisitedQuestions] = useState<number[]>([0]);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(
    (test.recommendedTimeMinutes || 20) * 60
  );
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcInput, setCalcInput] = useState('0');

  // Scratchpad Whiteboard State
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [scratchColor, setScratchColor] = useState('#4f46e5');
  const [scratchTool, setScratchTool] = useState<'pen' | 'eraser'>('pen');
  const [scratchLineWidth, setScratchLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const scratchCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Font Size Scaler
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0);

  // Proctoring States
  const [proctoringActive, setProctoringActive] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Tab switch listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && proctoringActive) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          setShowTabWarning(true);
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [proctoringActive]);

  // Webcam init
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraEnabled(true);
    } catch (err) {
      console.warn('Camera access declined or unavailable for proctoring:', err);
      setIsCameraEnabled(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraEnabled(false);
  };

  useEffect(() => {
    // Attempt auto-start camera for proctoring test
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
      setTotalTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentQ = test.questions[currentQuestionIndex];

  // Mark visited
  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    if (!visitedQuestions.includes(index)) {
      setVisitedQuestions([...visitedQuestions, index]);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));
  };

  const handleClearResponse = () => {
    setUserAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const handleToggleMarkForReview = () => {
    if (markedForReview.includes(currentQ.id)) {
      setMarkedForReview(markedForReview.filter((id) => id !== currentQ.id));
    } else {
      setMarkedForReview([...markedForReview, currentQ.id]);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      handleGoToQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      handleGoToQuestion(currentQuestionIndex - 1);
    }
  };

  const handleSubmitTest = () => {
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;

    test.questions.forEach((q) => {
      const selected = userAnswers[q.id];
      if (selected === undefined) {
        unattemptedCount++;
      } else if (selected === q.correctOptionIndex) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const marksPerCorrect = 2.0;
    const negativePenalty = 0.66;
    const rawScore = Number(
      (correctCount * marksPerCorrect - wrongCount * negativePenalty).toFixed(2)
    );
    const score = Math.max(0, rawScore);
    const maxScore = test.questions.length * marksPerCorrect;
    const accuracyPercentage =
      correctCount + wrongCount > 0
        ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
        : 0;

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    const attempt: TestAttempt = {
      id: `attempt-${Date.now()}`,
      testId: test.id,
      testTitle: test.testTitle,
      examName: test.examName,
      subject: test.subject,
      topic: test.topic,
      totalQuestions: test.questions.length,
      score,
      maxScore,
      correctCount,
      wrongCount,
      unattemptedCount,
      accuracyPercentage,
      timeSpentSeconds: totalTimeSpent,
      userAnswers,
      markedForReview,
      timestamp: new Date().toISOString(),
    };

    onFinishTest(attempt);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Simple calculator evaluator
  const handleCalcBtn = (val: string) => {
    if (val === 'C') {
      setCalcInput('0');
    } else if (val === '=') {
      try {
        // Safe basic arithmetic evaluate
        const sanitized = calcInput.replace(/[^0-9+\-*/.]/g, '');
        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized})`)();
        setCalcInput(String(res));
      } catch {
        setCalcInput('Error');
      }
    } else {
      if (calcInput === '0' || calcInput === 'Error') {
        setCalcInput(val);
      } else {
        setCalcInput(calcInput + val);
      }
    }
  };

  // Canvas Whiteboard Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = scratchTool === 'eraser' ? '#ffffff' : scratchColor;
    ctx.lineWidth = scratchTool === 'eraser' ? scratchLineWidth * 4 : scratchLineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.closePath();
    setIsDrawing(false);
  };

  const clearScratchCanvas = () => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleDownloadScratchpad = () => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `exam-rough-notes-q${currentQuestionIndex + 1}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleSetConfidence = (level: 'sure' | 'medium' | 'guess') => {
    setConfidenceRatings((prev) => ({
      ...prev,
      [currentQ.id]: level,
    }));
  };

  const answeredCount = Object.keys(userAnswers).length;
  const markedCount = markedForReview.length;
  const unattemptedCount = test.questions.length - answeredCount;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-140px)] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Top Test Header Bar */}
      <div className="bg-white dark:bg-slate-900 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
            {test.examName}
          </span>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md mt-0.5">
            {test.testTitle}
          </h2>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Proctoring Status Pill */}
          <div
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${
              tabSwitchCount > 0
                ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border-emerald-300'
            }`}
          >
            {tabSwitchCount > 0 ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                <span>{tabSwitchCount} Tab Switched</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>AI Proctor Active</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200 dark:border-slate-700"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>

          <button
            type="button"
            onClick={() => setShowScratchpad(!showScratchpad)}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
              showScratchpad
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
            title="Open Scratchpad / Whiteboard Canvas"
          >
            <PenTool className="w-4 h-4" />
            <span className="hidden sm:inline">Scratchpad</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCalculator(!showCalculator)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200 dark:border-slate-700"
            title="Toggle Scientific/Standard Calculator"
          >
            <CalcIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Calc</span>
          </button>

          {/* Font Zoom */}
          <div className="hidden md:flex items-center space-x-1 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => setFontSizeOffset(Math.max(-2, fontSizeOffset - 1))}
              className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-xs"
              title="Decrease Font Size"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1 text-slate-500">{fontSizeOffset >= 0 ? `+${fontSizeOffset}` : fontSizeOffset}</span>
            <button
              onClick={() => setFontSizeOffset(Math.min(3, fontSizeOffset + 1))}
              className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-xs"
              title="Increase Font Size"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Countdown Clock */}
          <div
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold border ${
              timeLeftSeconds < 180
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          <button
            id="finish-test-top-btn"
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-1.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
          >
            Submit Test
          </button>
        </div>
      </div>

      {/* Tab Switch Infraction Warning Banner */}
      {showTabWarning && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce" />
            <span>
              Proctor Warning: Tab switch / focus loss detected ({tabSwitchCount} occurrence{tabSwitchCount > 1 ? 's' : ''}). Switching screens during an exam attempt is logged!
            </span>
          </div>
          <button
            onClick={() => setShowTabWarning(false)}
            className="px-2 py-0.5 bg-black/20 hover:bg-black/40 rounded text-[11px]"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Main Examination Layout: Question Area + Question Palette */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        {/* Question Pane (Cols 1-3) */}
        <div className="lg:col-span-3 p-4 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Question Meta Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold">
                  Q {currentQuestionIndex + 1} of {test.questions.length}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {currentQ.topicTag}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                  +2.0 Marks / -0.66
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggleMarkForReview}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                  markedForReview.includes(currentQ.id)
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>
                  {markedForReview.includes(currentQ.id) ? 'Marked' : 'Mark for Review'}
                </span>
              </button>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <p
                style={{ fontSize: `${15 + fontSizeOffset * 2}px` }}
                className="font-semibold text-slate-900 dark:text-slate-100 leading-relaxed"
              >
                {currentQ.questionText}
              </p>

              {currentQ.codeSnippetOrContext && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                  <pre>{currentQ.codeSnippetOrContext}</pre>
                </div>
              )}
            </div>

            {/* Options List */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((option, idx) => {
                const isSelected = userAnswers[currentQ.id] === idx;
                const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start space-x-3 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20 text-slate-900 dark:text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {optionLetter}
                    </div>
                    <span
                      style={{ fontSize: `${14 + fontSizeOffset * 1.5}px` }}
                      className="font-medium pt-0.5 leading-relaxed"
                    >
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Metacognitive Confidence Calibration Tagging */}
            {userAnswers[currentQ.id] !== undefined && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-500" />
                  <span>How confident are you with this answer? (For Calibration Index)</span>
                </span>
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetConfidence('sure')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      confidenceRatings[currentQ.id] === 'sure'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    🎯 100% Sure
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetConfidence('medium')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      confidenceRatings[currentQ.id] === 'medium'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    ⚖️ 50-50 Logic
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetConfidence('guess')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      confidenceRatings[currentQ.id] === 'guess'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    🎲 Wild Guess
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Question Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleClearResponse}
                disabled={userAnswers[currentQ.id] === undefined}
                className="px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  handleToggleMarkForReview();
                  handleNext();
                }}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100"
              >
                Mark & Next
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentQuestionIndex === test.questions.length - 1}
                className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 flex items-center gap-1 shadow-sm"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Question Palette Sidebar (Col 4) */}
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-900/60 flex flex-col justify-between">
          <div>
            {/* Live Proctoring Webcam Feed */}
            <div className="mb-4 p-2.5 bg-slate-950 rounded-2xl border border-slate-800 text-white space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold px-1">
                <span className="flex items-center space-x-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Proctoring Cam</span>
                </span>
                <button
                  type="button"
                  onClick={isCameraEnabled ? stopCamera : startCamera}
                  className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 bg-white/10 rounded"
                >
                  {isCameraEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>

              <div className="relative h-28 w-full bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
                {isCameraEnabled ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                  />
                ) : (
                  <div className="text-center text-slate-500 text-xs flex flex-col items-center space-y-1">
                    <CameraOff className="w-5 h-5" />
                    <span>Camera Standby</span>
                  </div>
                )}

                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[9px] font-mono text-slate-300">
                  Live Feed
                </div>
              </div>
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Question Palette
            </h3>

            {/* Legend Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-[11px]">
              <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80">
                <span className="w-3 h-3 rounded-full bg-indigo-600" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Answered: <strong>{answeredCount}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80">
                <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Unanswered: <strong>{unattemptedCount}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Marked: <strong>{markedCount}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Total: <strong>{test.questions.length}</strong>
                </span>
              </div>
            </div>

            {/* Question Grid Buttons */}
            <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-1">
              {test.questions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isMarked = markedForReview.includes(q.id);
                const isCurrent = currentQuestionIndex === idx;

                let btnStyle =
                  'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

                if (isCurrent) {
                  btnStyle = 'ring-2 ring-indigo-500 font-bold';
                }

                if (isMarked) {
                  btnStyle += ' bg-amber-500 text-white border-amber-500';
                } else if (isAnswered) {
                  btnStyle += ' bg-indigo-600 text-white border-indigo-600';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleGoToQuestion(idx)}
                    className={`h-9 rounded-lg text-xs font-bold border transition-all flex items-center justify-center ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
            <button
              id="finish-test-sidebar-btn"
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              Finish & Evaluate Test
            </button>
          </div>
        </div>
      </div>

      {/* Floating Calculator Modal */}
      {showCalculator && (
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-700 p-4 w-64 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <CalcIcon className="w-3.5 h-3.5 text-indigo-500" />
              Standard Exam Calculator
            </span>
            <button
              onClick={() => setShowCalculator(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg text-right font-mono text-lg font-bold text-slate-900 dark:text-white mb-3 truncate">
            {calcInput}
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
            {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', 'C', '+'].map(
              (btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcBtn(btn)}
                  className="py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                >
                  {btn}
                </button>
              )
            )}
          </div>
          <button
            onClick={() => handleCalcBtn('=')}
            className="w-full mt-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
          >
            =
          </button>
        </div>
      )}

      {/* Floating Interactive Scratchpad Whiteboard Canvas */}
      {showScratchpad && (
        <div className="fixed bottom-6 left-6 z-50 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-300 dark:border-slate-700 p-4 w-[360px] sm:w-[480px] animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                <PenTool className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Live Rough Scratchpad Canvas
              </span>
            </div>
            <button
              onClick={() => setShowScratchpad(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>
          </div>

          {/* Canvas Toolbar Controls */}
          <div className="flex items-center justify-between gap-2 mb-3 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setScratchTool('pen')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                  scratchTool === 'pen'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Pen"
              >
                <PenTool className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setScratchTool('eraser')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                  scratchTool === 'eraser'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Eraser"
              >
                <Eraser className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Colors */}
            <div className="flex items-center space-x-1.5">
              {['#4f46e5', '#059669', '#dc2626', '#0f172a'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setScratchColor(c);
                    setScratchTool('pen');
                  }}
                  style={{ backgroundColor: c }}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                    scratchColor === c && scratchTool === 'pen'
                      ? 'scale-125 border-white shadow-sm ring-2 ring-indigo-500'
                      : 'border-transparent'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={clearScratchCanvas}
                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg text-xs"
                title="Clear Canvas"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDownloadScratchpad}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs"
                title="Download Rough Notes"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* HTML5 Canvas */}
          <div className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-white overflow-hidden shadow-inner">
            <canvas
              ref={scratchCanvasRef}
              width={440}
              height={220}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-48 touch-none cursor-crosshair bg-white"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            Draw calculations, rough diagrams, or algebraic equations directly during the test.
          </p>
        </div>
      )}

      {/* Test Submission Summary Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Ready to Submit Your Exam?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Here is your attempt summary before final grading:
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-center border border-indigo-200 dark:border-indigo-900">
                <span className="block text-xl font-bold text-indigo-700 dark:text-indigo-300">
                  {answeredCount}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Answered
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center border border-slate-200 dark:border-slate-700">
                <span className="block text-xl font-bold text-slate-700 dark:text-slate-300">
                  {unattemptedCount}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Unanswered
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-center border border-amber-200 dark:border-amber-900">
                <span className="block text-xl font-bold text-amber-700 dark:text-amber-300">
                  {markedCount}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Marked Review
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Continue Test
              </button>
              <button
                type="button"
                onClick={handleSubmitTest}
                className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
