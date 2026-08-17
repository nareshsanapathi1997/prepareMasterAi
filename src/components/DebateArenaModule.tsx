import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  MessageSquare,
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Award,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  User,
  Bot,
} from 'lucide-react';
import { conductDebateTurnAPI } from '../lib/api';
import { DebateMessage, DebateParticipant } from '../types';

interface Props {
  activeExam: string;
}

const DEBATE_TOPICS = [
  'AI Automation & Robotics: Mass Unemployment or Productivity Boom?',
  'Universal Basic Income (UBI) vs Targeted Welfare Subsidies',
  'Nuclear Fusion vs Distributed Solar: Energy Strategy for 2050',
  'Monopolistic Tech Platforms: Antitrust Breakups vs Public Utility Regulation',
  'Freebie Politics vs Capital Expenditure: Sustainable Fiscal Federalism',
];

const PANEL_MEMBERS: DebateParticipant[] = [
  {
    id: 'moderator',
    name: 'Dr. Sarah Chen',
    role: 'Moderator',
    avatarColor: 'bg-indigo-600',
    tagline: 'Directs flow, timekeeper & synthesis',
  },
  {
    id: 'vikram',
    name: 'Vikram Malhotra',
    role: 'Skeptic',
    avatarColor: 'bg-rose-600',
    tagline: 'Critiques assumptions & edge cases',
  },
  {
    id: 'elena',
    name: 'Elena Rostova',
    role: 'Economist',
    avatarColor: 'bg-emerald-600',
    tagline: 'Cites fiscal data & market incentives',
  },
  {
    id: 'aarav',
    name: 'Aarav Patel',
    role: 'Technologist',
    avatarColor: 'bg-amber-600',
    tagline: 'Focuses on engineering & ethical tradeoffs',
  },
];

export const DebateArenaModule: React.FC<Props> = ({ activeExam }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>(DEBATE_TOPICS[0]);
  const [customTopic, setCustomTopic] = useState<string>('');
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    resetDebate(selectedTopic);
  }, [selectedTopic, activeExam]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const speakText = (text: string) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const resetDebate = (topic = selectedTopic) => {
    window.speechSynthesis?.cancel();
    const openingStatement: DebateMessage = {
      id: `msg-${Date.now()}`,
      speakerId: 'moderator',
      speakerName: 'Dr. Sarah Chen',
      speakerRole: 'Moderator',
      text: `Welcome participants to today's group discussion on: "${topic}". We will evaluate your structured argumentation, listening agility, and ability to build upon opposing viewpoints. Candidate, please present your opening thesis.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: false,
    };
    setMessages([openingStatement]);
    setUserInput('');
    speakText(openingStatement.text);
  };

  const handleSendSpeech = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || loading) return;

    const userText = userInput.trim();
    setUserInput('');

    const userMsg: DebateMessage = {
      id: `user-${Date.now()}`,
      speakerId: 'candidate',
      speakerName: 'You (Candidate)',
      speakerRole: 'Candidate',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      const historyPayload = newHistory.map((m) => ({
        speakerName: m.speakerName,
        text: m.text,
      }));

      const res = await conductDebateTurnAPI({
        topic: selectedTopic,
        examName: activeExam,
        conversationHistory: historyPayload,
        userSpeech: userText,
      });

      // Update user message with coaching feedback
      userMsg.userScoreFeedback = res.userFeedback;

      // Add AI participants responses
      const aiMessages: DebateMessage[] = res.nextTurns.map((turn, idx) => ({
        id: `ai-${Date.now()}-${idx}`,
        speakerId: turn.speakerId,
        speakerName: turn.speakerName,
        speakerRole: turn.speakerRole,
        text: turn.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: false,
      }));

      setMessages([...newHistory, ...aiMessages]);

      if (aiMessages.length > 0) {
        speakText(aiMessages[0].text);
      }
    } catch (err: any) {
      console.error(err);
      const fallback: DebateMessage = {
        id: `fallback-${Date.now()}`,
        speakerId: 'vikram',
        speakerName: 'Vikram Malhotra',
        speakerRole: 'The Skeptic',
        text: 'That is an optimistic perspective, but what empirical evidence indicates that capital markets will self-correct in time without distortionary interventions?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: false,
      };
      setMessages([...newHistory, fallback]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl border border-purple-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-purple-200 mb-2">
              <Users className="w-3.5 h-3.5 text-purple-300" />
              <span>Multi-Agent AI Group Discussion Arena</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Group Discussion & Debate Simulator
            </h1>
            <p className="text-purple-200 text-sm mt-1 max-w-2xl">
              Master MBA GDs, UPSC Personality Tests, and placement panel rounds with real-time AI peer debaters responding dynamically to your points.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                if (audioEnabled) window.speechSynthesis?.cancel();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition ${
                audioEnabled
                  ? 'bg-purple-900/60 border-purple-500 text-purple-200'
                  : 'bg-white/10 border-white/20 text-white'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{audioEnabled ? 'Voice Active' : 'Muted'}</span>
            </button>

            <button
              type="button"
              onClick={() => resetDebate()}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset GD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Topic Selector */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">GD Motion / Topic:</span>
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="flex-1 text-xs font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
        >
          {DEBATE_TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Main Split Layout: Left Panel Cards | Right Live Debate Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Panel Members Status Cards (Col 1-4) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Active Panel Participants
          </h3>

          <div className="space-y-2.5">
            {PANEL_MEMBERS.map((member) => (
              <div
                key={member.id}
                className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-3"
              >
                <div
                  className={`w-9 h-9 rounded-full ${member.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}
                >
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {member.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {member.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{member.tagline}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-200/50 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-300 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold">
              <Lightbulb className="w-4 h-4 text-purple-500" />
              <span>GD Scoring Criteria</span>
            </div>
            <p className="text-[11px] leading-relaxed text-purple-800 dark:text-purple-200">
              Evaluated on <strong>Analytical Depth</strong>, <strong>Conciseness</strong>, acknowledging previous speakers, and structured data points.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Chat Debate Stream (Col 5-12) */}
        <div className="lg:col-span-8 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[580px] overflow-hidden">
          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 max-h-[500px]">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2.5">
                <div className={`flex items-start gap-3 ${msg.isUser ? 'flex-row-reverse' : ''}`}>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                      msg.isUser
                        ? 'bg-blue-600 text-white'
                        : msg.speakerRole === 'Moderator'
                        ? 'bg-indigo-600 text-white'
                        : msg.speakerRole === 'Skeptic'
                        ? 'bg-rose-600 text-white'
                        : msg.speakerRole === 'Economist'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {msg.isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      msg.isUser
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-75 mb-1">
                      <span className="font-bold">{msg.speakerName} ({msg.speakerRole})</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>

                {/* Turn Feedback for User */}
                {msg.userScoreFeedback && (
                  <div className="mx-6 p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        <span>Moderator Live Assessment</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white font-bold text-[10px]">
                          Clarity: {msg.userScoreFeedback.clarityScore}/10
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px]">
                          Impact: {msg.userScoreFeedback.impactScore}/10
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-purple-950 dark:text-purple-200">
                      <strong>Observation:</strong> {msg.userScoreFeedback.counterArgumentStrength}
                    </p>

                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-purple-100 dark:border-purple-900/40 text-[11px]">
                      <strong className="text-purple-700 dark:text-purple-300">💡 99th-Percentile Pro-Tip: </strong>
                      <span className="text-slate-600 dark:text-slate-400">{msg.userScoreFeedback.proTip}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-xs text-purple-500 animate-pulse p-3">
                <Bot className="w-4 h-4 animate-spin" />
                <span>Panel debaters are analyzing your point and formulating rebuttals...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* User Speech Input Area */}
          <form onSubmit={handleSendSpeech} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Present your argument or rebut previous speakers with data..."
              disabled={loading}
              className="flex-1 px-4 py-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!userInput.trim() || loading}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 shadow disabled:opacity-50 transition"
            >
              <span>Speak in GD</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
