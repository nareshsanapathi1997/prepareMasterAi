import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Send,
  UserCheck,
  Building2,
  HelpCircle,
  RefreshCw,
  Award,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { mentorCounsellorAPI } from '../lib/api';

interface CollegeCounsellorBotProps {
  activeExam: string;
}

export const CollegeCounsellorBot: React.FC<CollegeCounsellorBotProps> = ({ activeExam }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Hello! I am your AI Higher Education & Admissions Counsellor for **${activeExam}**. 

I can assist you with:
1. **Target College Cutoffs & Program Selection** (IIMs, IITs, AIIMS, NLUs, US Universities)
2. **Profile Evaluation** (10th/12th/Graduation scores, work experience, category weightages)
3. **Written Ability Test (WAT) & Personal Interview (PI)** prep strategies
4. **Post-Score ROI & Placement Analysis**

How can I help plan your admissions roadmap today?`,
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const quickPrompts = [
    `Which top colleges can I target with 95+ percentile in ${activeExam}?`,
    `Evaluate my profile: 85% in 10th, 80% in 12th, B.Tech 7.8 CGPA with 2 years work-ex.`,
    `What are the most common Personal Interview (PI) trap questions for top tier institutes?`,
    `Explain the category-wise cutoff normalization & reservation policy.`,
  ];

  const handleSendMessage = async (textToSend = inputQuery) => {
    if (!textToSend.trim() || loading) return;
    const userText = textToSend.trim();
    const newHistory = [...messages, { role: 'user' as const, text: userText }];
    setMessages(newHistory);
    setInputQuery('');
    setLoading(true);

    try {
      const reply = await mentorCounsellorAPI({
        examName: activeExam,
        userQuery: userText,
        conversationHistory: newHistory,
      });
      setMessages([...newHistory, { role: 'assistant', text: reply }]);
    } catch (err: any) {
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          text: 'I ran into an issue connecting to the admissions knowledge base. Please try asking again!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-violet-500/20">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-violet-500/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-violet-300">
            <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
            <span>Admissions & Higher Education Advisory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            AI College & Career Mentor
          </h2>
          <p className="text-violet-200 text-sm leading-relaxed">
            Get personalized college shortlisting, profile evaluation, WAT/PI interview strategies, and ROI career guidance for {activeExam}.
          </p>
        </div>

        <div className="px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
          <div className="text-xs text-violet-300 font-semibold uppercase">Exam Track</div>
          <div className="text-base font-black text-white">{activeExam}</div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 flex flex-col h-[600px]">
        {/* Messages scroll box */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${
                msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-400'
                }`}
              >
                {msg.role === 'user' ? 'You' : <GraduationCap className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white font-medium'
                    : 'bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-violet-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs text-slate-500">
                Mentor is analyzing admission statistics and profile cutoffs...
              </div>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Suggested Advisory Topics:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(p)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-slate-700 dark:text-slate-300 hover:text-violet-600 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-left truncate max-w-xs"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center space-x-3 pt-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Ask about ${activeExam} college cutoffs, profile rating, or interview prep...`}
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !inputQuery.trim()}
            className="px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl transition-all shadow-md disabled:opacity-40 flex items-center space-x-2 text-sm"
          >
            <span>Ask Mentor</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
