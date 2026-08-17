import React from 'react';
import {
  FileText,
  Lightbulb,
  CalendarCheck,
  Layers,
  HelpCircle,
  BarChart3,
  Search,
  Zap,
  BrainCircuit,
  BookMarked,
  Award,
  Newspaper,
  Library,
  GraduationCap,
  PenTool,
  Binary,
  Timer,
  Network,
  Mic,
  FileCode2,
  Users,
  Calculator,
  TrendingUp,
  Grid,
  Eye,
  Headphones,
  Shield,
  Home,
  Code2,
  Swords,
  FileCheck2,
  Star,
  FlaskConical,
  Trophy,
  Radio,
  FileDown,
  Sparkles,
} from 'lucide-react';
import { TabType, UserRole } from '../types';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  mockTestsBadgeCount?: number;
  unresolvedErrorsCount?: number;
  userRole?: UserRole;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  mockTestsBadgeCount,
  unresolvedErrorsCount,
  userRole,
}) => {
  const tabs: Array<{
    id: TabType;
    label: string;
    icon: React.ElementType;
    badge?: string;
    highlight?: boolean;
    roleRequired?: UserRole;
  }> = [
    {
      id: 'landing',
      label: 'Home & Tracks',
      icon: Home,
    },
    {
      id: 'ai-exam-generator',
      label: 'AI Exam Generator (All Courses)',
      icon: Sparkles,
      highlight: true,
      badge: 'Army/SSC/All',
    },
    {
      id: 'mock-tests',
      label: 'Mock Tests & Proctor',
      icon: FileText,
      badge: mockTestsBadgeCount ? `${mockTestsBadgeCount}` : undefined,
    },
    {
      id: 'adaptive-practice',
      label: 'Adaptive Arena',
      icon: BrainCircuit,
      highlight: true,
    },
    {
      id: 'dilr-workbench',
      label: 'DILR & Matrix Workbench',
      icon: Grid,
      highlight: true,
    },
    {
      id: 'speed-trainer',
      label: '5-Min Speed Drill',
      icon: Zap,
    },
    {
      id: 'speed-reader',
      label: 'VARC Speed Reader',
      icon: Eye,
    },
    {
      id: 'podcast-studio',
      label: 'Audio Podcast Studio',
      icon: Headphones,
    },
    {
      id: 'interview-simulator',
      label: 'Live Mock Interview',
      icon: Mic,
    },
    {
      id: 'debate-arena',
      label: 'Multi-Agent GD Arena',
      icon: Users,
    },
    {
      id: 'doc-scanner',
      label: 'Notes & Doc Synthesizer',
      icon: FileCode2,
    },
    {
      id: 'graphing-calc',
      label: 'Graphing & STEM Sandbox',
      icon: Calculator,
    },
    {
      id: 'retention-matrix',
      label: 'Memory Decay Matrix',
      icon: TrendingUp,
    },
    {
      id: 'essay-evaluator',
      label: 'Essay & Mains Grader',
      icon: PenTool,
    },
    {
      id: 'formula-vault',
      label: 'Formula Vault',
      icon: Binary,
    },
    {
      id: 'study-room',
      label: 'Focus Room & Lo-Fi',
      icon: Timer,
    },
    {
      id: 'mind-map',
      label: 'AI Mind Map',
      icon: Network,
    },
    {
      id: 'error-notebook',
      label: 'Error Notebook',
      icon: BookMarked,
      badge: unresolvedErrorsCount ? `${unresolvedErrorsCount}` : undefined,
    },
    {
      id: 'rank-predictor',
      label: 'AIR Predictor',
      icon: Award,
    },
    {
      id: 'current-affairs',
      label: 'Daily Affairs & Quiz',
      icon: Newspaper,
    },
    {
      id: 'content-library',
      label: 'Verified PYQs',
      icon: Library,
    },
    {
      id: 'mentor-bot',
      label: 'Admissions Mentor',
      icon: GraduationCap,
    },
    {
      id: 'explainer',
      label: 'Topic Explainer',
      icon: Lightbulb,
    },
    {
      id: 'study-plan',
      label: 'Study Roadmap',
      icon: CalendarCheck,
    },
    {
      id: 'flashcards',
      label: 'Active Flashcards',
      icon: Layers,
    },
    {
      id: 'doubts',
      label: 'Multimodal Doubts',
      icon: HelpCircle,
    },
    {
      id: 'syllabus',
      label: 'Syllabus & Trends',
      icon: Search,
    },
    {
      id: 'analytics',
      label: 'Analytics & Heatmap',
      icon: BarChart3,
    },
    {
      id: 'coding-sandbox',
      label: 'GATE CS & Code Sandbox',
      icon: Code2,
      highlight: true,
    },
    {
      id: 'peer-battle',
      label: '1v1 Peer Duel & ELO',
      icon: Swords,
      highlight: true,
    },
    {
      id: 'omr-generator',
      label: 'Printable OMR & Scanner',
      icon: FileCheck2,
    },
    {
      id: 'community-reviews',
      label: 'Live Reviews & Ratings',
      icon: Star,
      highlight: true,
    },
    {
      id: 'virtual-lab',
      label: 'Virtual STEM Lab',
      icon: FlaskConical,
      highlight: true,
    },
    {
      id: 'mastery-tree',
      label: 'Mastery Tree & Quests',
      icon: Trophy,
      highlight: true,
    },
    {
      id: 'college-calculator',
      label: 'College Composite Score',
      icon: GraduationCap,
    },
    {
      id: 'live-cohort-mock',
      label: 'All-India Live Mock',
      icon: Radio,
      highlight: true,
    },
    {
      id: 'pdf-studio',
      label: 'PDF & Booklet Studio',
      icon: FileDown,
    },
    ...(userRole === 'admin'
      ? [
          {
            id: 'admin-panel' as TabType,
            label: 'Admin & Faculty Control',
            icon: Shield,
            highlight: true,
          },
        ]
      : []),
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-1.5 overflow-x-auto py-2.5 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isAdminTab = tab.id === 'admin-panel';

            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? isAdminTab
                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/30'
                      : 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : isAdminTab
                    ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.highlight ? (isAdminTab ? 'text-rose-500' : 'text-indigo-500') : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
