import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Brain,
  Video,
  Mic,
  TrendingUp,
  Award,
  CheckCircle2,
  Users,
  Compass,
  Cpu,
  BookOpen,
  Headphones,
  Grid,
  FileCheck2,
  ChevronRight,
  Flame,
  Star,
  Swords,
  Code2,
  FlaskConical,
  Trophy,
  GraduationCap,
  Radio,
  FileDown,
} from 'lucide-react';
import { ExamCategory, TabType } from '../types';

interface LandingHomePageProps {
  onStartLearning: (tab?: TabType) => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onSelectExam: (exam: ExamCategory) => void;
  currentExam: ExamCategory;
  isLoggedIn: boolean;
  userName?: string;
}

export const LandingHomePage: React.FC<LandingHomePageProps> = ({
  onStartLearning,
  onOpenAuth,
  onSelectExam,
  currentExam,
  isLoggedIn,
  userName,
}) => {
  const POPULAR_EXAMS: { name: ExamCategory; badge: string; desc: string; icon: string }[] = [
    {
      name: 'Army & Defence (NDA, CDS, AFCAT, Agniveer)',
      badge: 'NDA, CDS, AFCAT, Agniveer',
      desc: 'NDA Calculus & GAT, CDS Elementary Math, AFCAT spatial aptitude, and military awareness.',
      icon: '🎖️',
    },
    {
      name: 'SSC Exams (CGL, CHSL, MTS, CPO, GD)',
      badge: 'CGL Tier 1/2, CHSL, CPO',
      desc: 'Quantitative aptitude shortcuts, advanced geometry proofs, Tier-2 statistics, and English comprehension.',
      icon: '🏛️',
    },
    {
      name: 'State PSC & Groups (Group 1, 2, 4, BPSC, UPPSC, TS/APPSC)',
      badge: 'Group 1, 2, 4 & State PCS',
      desc: 'State governance, 73rd/74th amendments, socio-economic surveys, and historical milestones.',
      icon: '📜',
    },
    {
      name: 'Railways (RRB NTPC, Group D, ALP)',
      badge: 'RRB NTPC, ALP, Group D',
      desc: 'Train crossing relative speeds, NCERT physics & chemistry, and CBT-1/CBT-2 time attacks.',
      icon: '🚆',
    },
    {
      name: 'Banking & Insurance (IBPS, SBI, RBI, LIC)',
      badge: 'SBI PO, IBPS, RBI Grade B',
      desc: 'Multi-variable seating puzzles, DI speed calculations, and macro-financial awareness.',
      icon: '🏦',
    },
    {
      name: 'Police Services (SI & Constable)',
      badge: 'Police SI & Constable',
      desc: 'Criminal justice basics, policing aptitude, reasoning deductions, and state GK.',
      icon: '👮',
    },
    {
      name: 'Teaching & CTET / NET',
      badge: 'CTET, State TET, UGC NET',
      desc: 'Child pedagogy (Piaget/Vygotsky), research methodology, and inclusive education.',
      icon: '🎓',
    },
    {
      name: 'CAT & MBA Entrances',
      badge: 'IIMs & Top B-Schools',
      desc: 'DILR matrix logic, VARC speed reader, and adaptive quantitative mastery.',
      icon: '📈',
    },
    {
      name: 'UPSC Civil Services',
      badge: 'IAS / IPS / IFS',
      desc: 'Mains analytical essay grader, GS paper breakdown, and simulated board viva.',
      icon: '⚖️',
    },
    {
      name: 'GATE (Computer Science / Engg)',
      badge: 'IIT M.Tech & PSUs',
      desc: 'Algorithms, discrete math, calculus visualizer, and strict negative marking mocks.',
      icon: '⚡',
    },
    {
      name: 'JEE (Main & Advanced)',
      badge: 'IITs & Top Engineering',
      desc: 'Multi-concept Physics, Organic reaction pathways, and 2D Calculus Graphing sandbox.',
      icon: '🔬',
    },
    {
      name: 'NEET (Medical)',
      badge: 'AIIMS & Top Medical',
      desc: 'High-yield NCERT diagrammatic retention matrix and timed biology sprints.',
      icon: '🩺',
    },
  ];

  const CORE_PILLARS = [
    {
      icon: Sparkles,
      color: 'from-indigo-600 to-violet-600',
      title: 'Automated AI Exam & Mock Paper Generator',
      description: 'Synthesize full-pattern or sectional exam papers for Army, SSC, State Groups, Railways, Banking, and Police with authentic negative marking and proofs.',
      tab: 'ai-exam-generator' as TabType,
    },
    {
      icon: Video,
      color: 'from-blue-600 to-indigo-600',
      title: 'AI Proctoring & Adaptive Mock Engine',
      description: 'Simulates true testing conditions with real-time video/tab-switch violation flags, Sectional cutoffs, and percentile rank predictors.',
      tab: 'mock-tests' as TabType,
    },
    {
      icon: Grid,
      color: 'from-amber-600 to-orange-600',
      title: 'Interactive DILR & Logic Matrix Workbench',
      description: 'Multi-dimensional deduction grids with automated constraint cross-referencing and tiered hints for Knights & Knaves, Venn, and seating.',
      tab: 'dilr-workbench' as TabType,
    },
    {
      icon: Mic,
      color: 'from-purple-600 to-pink-600',
      title: 'Voice Interview & Multi-Agent Debate Arena',
      description: 'Engage with strict panel specialists or enter multi-perspective debate rooms with real-time speech articulation scoring.',
      tab: 'interview-simulator' as TabType,
    },
    {
      icon: Headphones,
      color: 'from-emerald-600 to-teal-600',
      title: 'Dual-Speaker AI Podcast & Revision Studio',
      description: 'Convert heavy syllabus topics into podcast conversations between simulated hosts & SME mentors with synced transcripts.',
      tab: 'podcast-studio' as TabType,
    },
    {
      icon: Brain,
      color: 'from-rose-600 to-red-600',
      title: 'Ebbinghaus Memory Decay Retention Matrix',
      description: 'Spaced repetition algorithms that compute optimal revision intervals based on your historical mistake logs.',
      tab: 'retention-matrix' as TabType,
    },
    {
      icon: Swords,
      color: 'from-amber-600 to-rose-600',
      title: '1-on-1 Peer Duel & ELO Arena',
      description: 'Rapid 15-second timed head-to-head duels with live score tickers, streak multipliers, and national ELO leaderboards.',
      tab: 'peer-battle' as TabType,
    },
    {
      icon: Code2,
      color: 'from-slate-700 to-indigo-700',
      title: 'GATE CS & Software Engg Algorithmic Sandbox',
      description: 'Interactive Python, C++, Java, & JS code editor with instant test runner and automated asymptotic Big-O proofs.',
      tab: 'coding-sandbox' as TabType,
    },
    {
      icon: FileCheck2,
      color: 'from-cyan-600 to-blue-600',
      title: 'Printable OMR Sheet & Scanner Grader',
      description: 'Generate authentic examination bubble answer sheets with bubble-filling simulation and automated scoring.',
      tab: 'omr-generator' as TabType,
    },
    {
      icon: Star,
      color: 'from-amber-500 to-yellow-600',
      title: 'Dynamic Reviews & Community Ratings',
      description: 'Read real-time unedited reviews from national toppers, AIR rankers, and 99+ percentile aspirants with live rating analytics.',
      tab: 'community-reviews' as TabType,
    },
    {
      icon: FlaskConical,
      color: 'from-sky-600 to-blue-700',
      title: 'Virtual STEM Laboratory Simulator',
      description: 'Interactive ray optics, projectile trajectory vectors, AC RLC circuit resonance, and acid-base titration pH curves.',
      tab: 'virtual-lab' as TabType,
    },
    {
      icon: Trophy,
      color: 'from-purple-600 to-pink-600',
      title: 'Syllabus Mastery Tree & Daily XP Quests',
      description: 'RPG progression skill graph with prerequisite unlocks, daily challenge streaks, and XP reward multipliers.',
      tab: 'mastery-tree' as TabType,
    },
    {
      icon: GraduationCap,
      color: 'from-teal-600 to-emerald-700',
      title: 'Target College Composite Score Predictor',
      description: 'Official RTI selection algorithm calculator for IIM Ahmedabad, Bangalore, Calcutta, Lucknow, and FMS Delhi.',
      tab: 'college-calculator' as TabType,
    },
    {
      icon: Radio,
      color: 'from-rose-600 to-red-700',
      title: 'All-India Synchronized Live Cohort Mock',
      description: 'Synchronized national test clock, live competitor count, real-time national percentile rankings, and leaderboards.',
      tab: 'live-cohort-mock' as TabType,
    },
    {
      icon: FileDown,
      color: 'from-blue-700 to-indigo-800',
      title: 'Print-Ready PDF Booklet & Solution Studio',
      description: 'Compile high-resolution A4 test question papers with watermarks, faculty solution manuals, and OMR sheets.',
      tab: 'pdf-studio' as TabType,
    },
  ];

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
        {/* Glow Spheres */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Next-Gen Competitive Exam & Syllabus AI Workspace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Master the Toughest Exams with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Precision AI Mentorship
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            From adaptive full-length proctored mocks and interactive DILR logic matrices to AI oral viva panels, speed reading pacers, and memory decay engines.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onStartLearning('mock-tests')}
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-102 cursor-pointer"
            >
              <span>Launch Mock Test Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!isLoggedIn ? (
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base flex items-center space-x-2 transition-all cursor-pointer"
              >
                <span>Create Student Account</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </button>
            ) : (
              <button
                onClick={() => onStartLearning('analytics')}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base flex items-center space-x-2 transition-all cursor-pointer"
              >
                <span>Welcome back, {userName || 'Scholar'}</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </button>
            )}

            <button
              onClick={() => onStartLearning('dilr-workbench')}
              className="px-4 py-3.5 rounded-2xl text-slate-300 hover:text-white text-sm font-semibold flex items-center gap-1.5"
            >
              <span>Explore DILR Matrix</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Live Platform Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-indigo-900/50">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">120,000+</div>
              <div className="text-xs text-indigo-300 font-medium">Questions in Master Bank</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">99.8%</div>
              <div className="text-xs text-indigo-300 font-medium">Proctoring Accuracy</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">&lt; 150ms</div>
              <div className="text-xs text-indigo-300 font-medium">AI Step Deduction Speed</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">13+ Tracks</div>
              <div className="text-xs text-indigo-300 font-medium">CAT, UPSC, GATE, JEE & more</div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Exam Selection Grid */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Personalized Syllabus Tracks
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Select Your Target Examination
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Switches question banks, evaluation criteria, sectional weightages, and marking schemes across the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {POPULAR_EXAMS.map((item) => {
            const isSelected = currentExam === item.name;
            return (
              <div
                key={item.name}
                onClick={() => {
                  onSelectExam(item.name);
                  onStartLearning('mock-tests');
                }}
                className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{item.icon}</span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {item.desc}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                  <span className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}>
                    {isSelected ? 'Active Target Exam' : 'Switch & Launch Track'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flagship Feature Architecture Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Engineered For Top Percentile Results
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Everything You Need in One Unified Platform
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Replaces disconnected flashcard apps, static PDF test series, and isolated timers with an intelligent ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                onClick={() => onStartLearning(pillar.tab)}
                className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${pillar.color} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Open Tool</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Testimonials / Aspirant Proof */}
      <div className="p-8 sm:p-10 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-amber-500">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-base font-extrabold text-slate-900 dark:text-white ml-2">
                4.93 / 5.0
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                (12,480+ Verified Aspirant Ratings)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Real testimonials from national toppers, AIR rankers, and 99+ percentile aspirants.
            </p>
          </div>

          <button
            id="btn-view-all-reviews-landing"
            onClick={() => onStartLearning('community-reviews')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <span>View All Live Reviews & Ratings</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                CAT 99.87%ile
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "The DILR Matrix Workbench alone transformed my score from 84 percentile to 99.87%ile in CAT. The clue deduction checks and live constraint grids are unmatched."
            </p>
            <div className="flex items-center space-x-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                AS
              </div>
              <div>
                <span className="text-xs font-bold block text-slate-900 dark:text-white">Ananya Sengupta</span>
                <span className="text-[10px] text-slate-500">IIM Ahmedabad Convert</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                GATE AIR 24
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "The Algorithmic Big-O Sandbox & Virtual Calculator are exact replicas of the real TCS iON exam environment. The recurrence proofs solved all my graph theory doubts."
            </p>
            <div className="flex items-center space-x-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                RV
              </div>
              <div>
                <span className="text-xs font-bold block text-slate-900 dark:text-white">Rahul K. Varma</span>
                <span className="text-[10px] text-slate-500">GATE CS AIR 24 (Score: 922)</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md">
                UPSC AIR 83
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "The UPSC Mains Essay Grader strictly evaluated my essays on multi-dimensional constitutional criteria. Listening to the dual-speaker podcast during my commute was invaluable."
            </p>
            <div className="flex items-center space-x-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                VR
              </div>
              <div>
                <span className="text-xs font-bold block text-slate-900 dark:text-white">Vikramaditya Rathore</span>
                <span className="text-[10px] text-slate-500">IAS Cadre Selected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-indigo-600 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-2xl font-bold">Ready to Start Your Target Preparation?</h3>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
            Begin with a free diagnostic full-length mock or master tricky concepts with AI deduction helpers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isLoggedIn && (
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-6 py-3 rounded-xl bg-white text-indigo-900 font-bold text-xs sm:text-sm hover:bg-indigo-50 shadow-md cursor-pointer whitespace-nowrap"
            >
              Sign Up Free
            </button>
          )}
          <button
            onClick={() => onStartLearning('mock-tests')}
            className="px-6 py-3 rounded-xl bg-indigo-800 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm border border-indigo-400/30 cursor-pointer whitespace-nowrap"
          >
            Enter Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
