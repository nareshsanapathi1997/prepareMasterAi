import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  CheckCircle2,
  Video,
  VideoOff,
  Send,
  User,
  Bot,
  Brain,
  MessageSquare,
  Flame,
  Lightbulb,
} from 'lucide-react';
import { conductInterviewTurnAPI } from '../lib/api';
import { InterviewMessage, InterviewPersonaType } from '../types';

interface Props {
  activeExam: string;
}

const PERSONA_OPTIONS: InterviewPersonaType[] = [
  'IIM / MBA Director (Stress & Strategic Depth)',
  'UPSC Board Chairperson (Ethics & Policy Governance)',
  'Big Tech VP & Staff Engineer (System Design & Logic)',
  'Medical Ethics & USMLE Residency Board',
  'General Academic Dean & Scholarship Committee',
];

const INITIAL_QUESTIONS: Record<string, string> = {
  'IIM / MBA Director (Stress & Strategic Depth)':
    'Welcome candidate. Looking at your profile, why should our elite business program admit you over someone with deeper technical or quantitative tenure? Convince me in 90 seconds.',
  'UPSC Board Chairperson (Ethics & Policy Governance)':
    'Good morning. As a District Magistrate, if local political leadership orders you to halt a critical anti-pollution enforcement against a major industrialist employing 5,000 workers, what exact protocol will you execute?',
  'Big Tech VP & Staff Engineer (System Design & Logic)':
    'Hello! Let us dive straight in. How would you architect a globally distributed, zero-data-loss real-time telemetry streaming system handling 10 million events per second with sub-50ms query latency?',
  'Medical Ethics & USMLE Residency Board':
    'Welcome doctor. Suppose an unconscious trauma patient requires an immediate emergency blood transfusion to survive, but their family member arrives waving an explicit non-witnessed directive refusing blood products. How do you navigate this legally and ethically?',
  'General Academic Dean & Scholarship Committee':
    'Welcome! Tell us about a major academic or research project where your initial hypothesis completely failed, and how you scientifically pivoted to generate actionable insights.',
};

export const InterviewSimulatorModule: React.FC<Props> = ({ activeExam }) => {
  const [selectedPersona, setSelectedPersona] = useState<InterviewPersonaType>(PERSONA_OPTIONS[0]);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [candidateInput, setCandidateInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [turnCount, setTurnCount] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Audio / Speech States
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Video / WebCam Mirror state
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    resetInterview(selectedPersona);
  }, [selectedPersona, activeExam]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const speakText = (text: string) => {
    if (!voiceSpeechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const resetInterview = (personaToUse = selectedPersona) => {
    window.speechSynthesis?.cancel();
    const initQ = INITIAL_QUESTIONS[personaToUse] || 'Welcome. Please introduce yourself and highlight your core expertise.';
    const initialMsg: InterviewMessage = {
      id: `msg-${Date.now()}`,
      sender: 'interviewer',
      text: initQ,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initialMsg]);
    setTurnCount(1);
    setIsCompleted(false);
    setCandidateInput('');
    speakText(initQ);
  };

  const toggleCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (err) {
        console.warn('Camera access denied or unavailable', err);
      }
    }
  };

  const toggleVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. You can type your responses.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setCandidateInput((prev) => (prev ? prev + ' ' : '') + currentTranscript);
        };

        recognition.onerror = (err: any) => {
          console.error('Speech error', err);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
      } catch (err) {
        console.error(err);
        setIsRecording(false);
      }
    }
  };

  const handleSendResponse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!candidateInput.trim() || loading || isCompleted) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    const userText = candidateInput.trim();
    setCandidateInput('');

    const userMsg: InterviewMessage = {
      id: `user-${Date.now()}`,
      sender: 'candidate',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      const apiHistory = newHistory.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await conductInterviewTurnAPI({
        examName: activeExam,
        persona: selectedPersona,
        conversationHistory: apiHistory,
        candidateResponse: userText,
        turnCount: turnCount,
      });

      // Update last user message with feedback
      userMsg.feedback = res.feedback;

      // Add interviewer next question
      const botMsg: InterviewMessage = {
        id: `bot-${Date.now()}`,
        sender: 'interviewer',
        text: res.nextInterviewerQuestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([...newHistory, botMsg]);
      setTurnCount((c) => c + 1);
      if (res.isInterviewComplete || turnCount >= 5) {
        setIsCompleted(true);
      }

      speakText(res.nextInterviewerQuestion);
    } catch (err: any) {
      console.error(err);
      const fallbackMsg: InterviewMessage = {
        id: `err-${Date.now()}`,
        sender: 'interviewer',
        text: 'Let us delve deeper into this. How would you address the opposing stakeholder concerns in your solution?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...newHistory, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Compute average score
  const gradedTurns = messages.filter((m) => m.feedback?.scoreOutOf10);
  const avgScore = gradedTurns.length
    ? (gradedTurns.reduce((acc, m) => acc + (m.feedback?.scoreOutOf10 || 0), 0) / gradedTurns.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 rounded-3xl shadow-xl border border-indigo-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-indigo-200 mb-2">
              <Brain className="w-3.5 h-3.5 text-indigo-300" />
              <span>AI Personality & Viva Simulator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Live Mock Interview & GD Simulator
            </h1>
            <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
              Simulate high-stakes viva voce, IIM/UPSC/Tech interviews with real-time audio voice delivery, posture checks, and 99th-percentile model answers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {avgScore && (
              <div className="px-4 py-2 bg-indigo-900/80 border border-indigo-600 rounded-2xl flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-[10px] text-indigo-300 uppercase font-bold">Session Rating</div>
                  <div className="text-base font-extrabold text-white">{avgScore} / 10</div>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => resetInterview()}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-bold flex items-center space-x-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Interview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls Bar: Persona Selector, Audio/Video Toggles */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Interviewer Panel:</span>
          <select
            value={selectedPersona}
            onChange={(e) => setSelectedPersona(e.target.value as InterviewPersonaType)}
            className="flex-1 sm:flex-initial text-xs font-semibold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {PERSONA_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          {/* Audio TTS toggle */}
          <button
            type="button"
            onClick={() => {
              setVoiceSpeechEnabled(!voiceSpeechEnabled);
              if (voiceSpeechEnabled) window.speechSynthesis?.cancel();
            }}
            className={`p-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition ${
              voiceSpeechEnabled
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-400'
            }`}
            title="Toggle Voice Speech Synthesis"
          >
            {voiceSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-xs">{voiceSpeechEnabled ? 'Voice On' : 'Muted'}</span>
          </button>

          {/* WebCam toggle */}
          <button
            type="button"
            onClick={toggleCamera}
            className={`p-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition ${
              cameraActive
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-400'
            }`}
            title="Toggle WebCam Feed"
          >
            {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            <span className="text-xs">{cameraActive ? 'Camera Active' : 'Enable Camera'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left WebCam & Tips | Right Interactive Interview Room */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Posture & Candidate Video Box (Col 1-4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* WebCam Video Mirror */}
          <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 shadow-md relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-48 object-cover rounded-2xl transform scale-x-[-1]"
              />
            ) : (
              <div className="text-center p-6 text-slate-400 space-y-2">
                <User className="w-12 h-12 mx-auto text-slate-600" />
                <p className="text-xs font-medium">Camera is off. Click &apos;Enable Camera&apos; above to practice eye contact and facial confidence.</p>
              </div>
            )}
            <div className="absolute top-6 left-6 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
              <span>{cameraActive ? 'Live Candidate Feed' : 'Offline'}</span>
            </div>
          </div>

          {/* Real-time Interview Strategy Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              <Lightbulb className="w-4 h-4" />
              <span>Panel Expectations for {activeExam}</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span><strong>Structure with STAR</strong>: Situation, Task, Action, and Quantitative Result.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span><strong>No extreme biases</strong>: Balance administrative ethics with legal pragmatism.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span><strong>Acknowledge trade-offs</strong>: Mention 1 limitation before asserting your core solution.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Live Chat & Feedback Dialog (Col 5-12) */}
        <div className="lg:col-span-8 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[560px] overflow-hidden">
          {/* Top Panel Banner */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{selectedPersona}</div>
                <div className="text-[10px] text-slate-400">Turn {turnCount} of 5 • Active Dialogue</div>
              </div>
            </div>
            {isCompleted && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold rounded-full">
                Interview Completed
              </span>
            )}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 max-h-[480px]">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-3">
                <div className={`flex items-start gap-3 ${msg.sender === 'candidate' ? 'flex-row-reverse' : ''}`}>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                      msg.sender === 'candidate'
                        ? 'bg-blue-600 text-white'
                        : 'bg-indigo-900 text-indigo-200'
                    }`}
                  >
                    {msg.sender === 'candidate' ? 'You' : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div
                    className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      msg.sender === 'candidate'
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="block text-[9px] opacity-70 mt-1.5 text-right">{msg.timestamp}</span>
                  </div>
                </div>

                {/* AI Turn Feedback Box (Rendered for Candidate Answers) */}
                {msg.feedback && (
                  <div className="mx-6 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Panel Assessment</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[11px]">
                        Score: {msg.feedback.scoreOutOf10} / 10
                      </span>
                    </div>

                    {msg.feedback.strengths.length > 0 && (
                      <div className="text-emerald-700 dark:text-emerald-300">
                        <strong>Strengths:</strong> {msg.feedback.strengths.join(' • ')}
                      </div>
                    )}

                    {msg.feedback.weaknesses.length > 0 && (
                      <div className="text-amber-700 dark:text-amber-300">
                        <strong>Areas to Sharpen:</strong> {msg.feedback.weaknesses.join(' • ')}
                      </div>
                    )}

                    {msg.feedback.fallacyAlert && msg.feedback.fallacyAlert !== 'None' && (
                      <div className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span><strong>Fallacy/Trap:</strong> {msg.feedback.fallacyAlert}</span>
                      </div>
                    )}

                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900/50 mt-1">
                      <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 block mb-1">
                        🌟 99th-Percentile Benchmark Answer:
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic leading-relaxed">
                        &quot;{msg.feedback.recommendedBetterAnswer}&quot;
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-3 text-xs text-indigo-500 animate-pulse p-3">
                <Bot className="w-4 h-4 animate-spin" />
                <span>Interviewer is evaluating your response and formulating the next challenge...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Candidate Response Input Area */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            {isCompleted ? (
              <div className="text-center p-3 text-xs text-emerald-600 font-bold">
                Interview completed! Review your turn-by-turn scores above or click &apos;Restart Interview&apos; to practice a new panel.
              </div>
            ) : (
              <form onSubmit={handleSendResponse} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`p-3 rounded-2xl transition border ${
                    isRecording
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                  title={isRecording ? 'Listening (Click to stop)' : 'Click to speak response'}
                >
                  {isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={candidateInput}
                  onChange={(e) => setCandidateInput(e.target.value)}
                  placeholder={
                    isRecording
                      ? 'Listening to your speech...'
                      : 'Type or speak your answer with structured reasoning...'
                  }
                  disabled={loading}
                  className="flex-1 px-4 py-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={!candidateInput.trim() || loading}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 shadow-md disabled:opacity-50 transition"
                >
                  <span>Submit</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
