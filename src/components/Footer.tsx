import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Shield,
  BookOpen,
  Cpu,
  Heart,
  ChevronRight,
  Terminal,
  Activity,
  Layers,
  HelpCircle,
  X,
  Keyboard,
  Award,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { ExamCategory, TabType } from '../types';
import { EXAM_PRESETS } from '../data/presets';

interface FooterProps {
  activeExam: ExamCategory;
  onSelectExam: (exam: ExamCategory) => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export const Footer: React.FC<FooterProps> = ({
  activeExam,
  onSelectExam,
  onNavigateTab,
  onOpenAuth,
}) => {
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  const COURSE_COLUMNS: {
    category: string;
    exams: { name: ExamCategory; shortName: string; badge?: string }[];
  }[] = [
    {
      category: 'Defence, SSC & Police',
      exams: [
        {
          name: 'Army & Defence (NDA, CDS, AFCAT, Agniveer)',
          shortName: 'NDA, CDS & Agniveer',
          badge: 'Defence',
        },
        {
          name: 'SSC Exams (CGL, CHSL, MTS, CPO, GD)',
          shortName: 'SSC CGL, CHSL & CPO',
          badge: 'SSC',
        },
        {
          name: 'Police Services (SI & Constable)',
          shortName: 'Police SI & Constable',
        },
      ],
    },
    {
      category: 'Civil Services & State Groups',
      exams: [
        {
          name: 'UPSC Civil Services',
          shortName: 'UPSC IAS / IPS / IFS',
          badge: 'Mains+Viva',
        },
        {
          name: 'State PSC & Groups (Group 1, 2, 4, BPSC, UPPSC, TS/APPSC)',
          shortName: 'State Group 1, 2, 4 & PCS',
          badge: 'State PSC',
        },
      ],
    },
    {
      category: 'Railways, Banking & Teaching',
      exams: [
        {
          name: 'Railways (RRB NTPC, Group D, ALP)',
          shortName: 'RRB NTPC, Group D & ALP',
          badge: 'Railways',
        },
        {
          name: 'Banking & Insurance (IBPS, SBI, RBI, LIC)',
          shortName: 'SBI PO, IBPS & RBI Grade B',
          badge: 'Banking',
        },
        {
          name: 'Teaching & CTET / NET',
          shortName: 'CTET, State TET & UGC NET',
        },
      ],
    },
    {
      category: 'STEM & Management Entrances',
      exams: [
        {
          name: 'CAT & MBA Entrances',
          shortName: 'CAT, XAT & IIM Admissions',
          badge: 'Top B-School',
        },
        {
          name: 'GATE (Computer Science / Engg)',
          shortName: 'GATE CS & Algorithms',
          badge: 'PSU / M.Tech',
        },
        {
          name: 'JEE (Main & Advanced)',
          shortName: 'JEE Main & Advanced PCM',
          badge: 'IIT / NIT',
        },
        {
          name: 'NEET (Medical)',
          shortName: 'NEET PCB & Medical',
          badge: 'AIIMS / MBBS',
        },
      ],
    },
  ];

  const CORE_STUDIO_TOOLS: { label: string; tab: TabType; isNew?: boolean }[] = [
    { label: 'AI Exam Generator (All Courses)', tab: 'ai-exam-generator', isNew: true },
    { label: 'Physics & Chemistry Virtual Lab', tab: 'virtual-lab', isNew: true },
    { label: 'RPG Syllabus Mastery Tree', tab: 'mastery-tree', isNew: true },
    { label: 'IIM & Top College Calculator', tab: 'college-calculator', isNew: true },
    { label: 'All-India Live Cohort Mocks', tab: 'live-cohort-mock', isNew: true },
    { label: 'PDF Booklet & OMR Grader Studio', tab: 'pdf-studio', isNew: true },
    { label: 'TCS iON Algorithmic Sandbox', tab: 'coding-sandbox' },
    { label: '1v1 Peer Battle Arena', tab: 'peer-battle' },
    { label: 'DILR Matrix Workbench', tab: 'dilr-workbench' },
    { label: 'Audio Podcast Studio', tab: 'podcast-studio' },
    { label: 'AI Essay & Mains Grader', tab: 'essay-evaluator' },
    { label: 'Error Taxonomy Notebook', tab: 'error-notebook' },
  ];

  return (
    <footer className="mt-16 bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      {/* Top Banner & Quick Feature Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  PrepMaster AI <span className="text-indigo-400 text-xs px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/50">Universal Exam Platform</span>
                </span>
                <p className="text-xs text-slate-400">
                  Full-pattern adaptive simulator & AI mentors for all competitive examinations
                </p>
              </div>
            </div>

            {/* System Engine Health & Live Indicator */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-emerald-400">Gemini 3.7 Engine</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Low Latency</span>
              </div>

              <button
                onClick={() => setShortcutsModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                title="View Keyboard Shortcuts & Navigation Guide"
              >
                <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
                <span>Shortcuts</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Link Directory Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* 4 Columns of Courses */}
          {COURSE_COLUMNS.map((col, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                {col.category}
              </h4>
              <ul className="space-y-1.5">
                {col.exams.map((exam, eIdx) => {
                  const isSelected = activeExam === exam.name;
                  return (
                    <li key={eIdx}>
                      <button
                        onClick={() => {
                          onSelectExam(exam.name);
                          onNavigateTab('mock-tests');
                        }}
                        className={`text-left w-full text-xs py-1 px-2 rounded-md transition-all flex items-center justify-between group ${
                          isSelected
                            ? 'bg-indigo-950/80 text-indigo-300 font-semibold border-l-2 border-indigo-500'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="truncate">{exam.shortName}</span>
                        {exam.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                            }`}
                          >
                            {exam.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* 5th Column: Core Studio Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Interactive AI Studios
            </h4>
            <ul className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {CORE_STUDIO_TOOLS.map((tool, tIdx) => (
                <li key={tIdx}>
                  <button
                    onClick={() => onNavigateTab(tool.tab)}
                    className="text-left w-full text-xs py-1 px-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate">{tool.label}</span>
                    {tool.isNew && (
                      <span className="text-[8px] font-bold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                        NEW
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Details & Legal Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span>© 2026 PrepMaster AI. All rights reserved.</span>
            <span>•</span>
            <span className="text-slate-400">Enterprise AI for Higher Education & Testing</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigateTab('community-reviews')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Community Reviews
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigateTab('admin-panel')}
              className="hover:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Shield className="w-3 h-3 text-rose-400" />
              Faculty Portal
            </button>
            <span>•</span>
            <span className="text-slate-400 flex items-center gap-1">
              Current Target: <strong className="text-indigo-400">{activeExam}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Guide Modal */}
      {shortcutsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-indigo-400" />
                Power User Navigation & Cheatsheet
              </h3>
              <button
                onClick={() => setShortcutsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">AI Exam Generator (All Courses)</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-indigo-300">Tab 2 / Menu</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Quick Scratchpad & Formula Sheet</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-indigo-300">Header Icon</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">TCS iON Virtual Calculator</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-indigo-300">Live Mock / Sandbox</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Switch Course / Target Exam</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-indigo-300">Header Selector</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Print Offline OMR / PDF Booklet</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-indigo-300">PDF Studio</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShortcutsModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
